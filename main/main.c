#include <stdio.h>
#include <string.h>
#include <time.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/event_groups.h"
#include "esp_system.h"
#include "esp_wifi.h"
#include "esp_event.h"
#include "esp_log.h"
#include "nvs_flash.h"
#include "esp_netif.h"
#include "esp_http_client.h"
#include "esp_sntp.h"
#include "lwip/err.h"
#include "lwip/sys.h"
#include "driver/gpio.h"
#include "esp_timer.h"
#include "rom/ets_sys.h"
#include "driver/ledc.h"
#include "cJSON.h"

#define WIFI_SSID "MOB-SOLAR-PA"
#define WIFI_PASS "96238872"

static volatile bool g_time_synced = false;

#define TRIG_PIN GPIO_NUM_26
#define ECHO_PIN GPIO_NUM_27
#define TIMEOUT_US 3000

#define DHT_PIN GPIO_NUM_32

#define SCHEDULE_API_URL "http://192.168.18.9:8000/api/v1/ingest/schedules"
#define API_URL "http://192.168.18.9:8000/api/v1/ingest/telemetry"
#define TOKEN   " PchoXrvdWCQSbdAw3Hnn6lkQ8H6rtxQWigqWMmR2s77sJsyicfQlMxQlBkCZPGkT"

#define RESERVOIR_HEIGHT_CM 30.0f

#define SERVO_GPIO       GPIO_NUM_25
#define SERVO_FREQ_HZ    50
#define SERVO_MIN_US     500
#define SERVO_MAX_US     2400
#define SERVO_OPEN_MS    3000
#define TRIGGER_TOLERANCE_S 30
#define CHECK_INTERVAL_MS 30000

typedef struct {
    int  hour;
    int  minute;
    int  days_of_week[7];
    int  days_count;
    bool is_active;
} Schedule;

#define MAX_SCHEDULES 10
static Schedule g_schedules[MAX_SCHEDULES];
static int      g_schedule_count = 0;

static const char *TAG = "ALIMENTATRON";
static EventGroupHandle_t wifi_event_group;
const int CONNECTED_BIT = BIT0;

/* ---------- Wi-Fi ---------- */

static void wifi_event_handler(void *arg, esp_event_base_t event_base,
                               int32_t event_id, void *event_data) {
    if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_START)
        esp_wifi_connect();
    else if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_DISCONNECTED) {
        xEventGroupClearBits(wifi_event_group, CONNECTED_BIT);
        esp_wifi_connect();
    } else if (event_base == IP_EVENT && event_id == IP_EVENT_STA_GOT_IP)
        xEventGroupSetBits(wifi_event_group, CONNECTED_BIT);
}

void wifi_init_sta(void) {
    esp_netif_init();
    ESP_ERROR_CHECK(esp_event_loop_create_default());
    esp_netif_create_default_wifi_sta();
    wifi_event_group = xEventGroupCreate();

    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));

    ESP_ERROR_CHECK(esp_event_handler_instance_register(WIFI_EVENT, ESP_EVENT_ANY_ID,
                                                        &wifi_event_handler, NULL, NULL));
    ESP_ERROR_CHECK(esp_event_handler_instance_register(IP_EVENT, IP_EVENT_STA_GOT_IP,
                                                        &wifi_event_handler, NULL, NULL));

    wifi_config_t wifi_config = {
        .sta = { .ssid = WIFI_SSID, .password = WIFI_PASS },
    };
    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
    ESP_ERROR_CHECK(esp_wifi_set_config(ESP_IF_WIFI_STA, &wifi_config));
    ESP_ERROR_CHECK(esp_wifi_start());
    ESP_LOGI(TAG, "Conectando a %s...", WIFI_SSID);
}

/* ---------- NTP ---------- */

static void sync_time(void) {
    esp_sntp_setoperatingmode(SNTP_OPMODE_POLL);
    esp_sntp_setservername(0, "pool.ntp.org");
    esp_sntp_init();

    int retry = 0;
    while (sntp_get_sync_status() == SNTP_SYNC_STATUS_RESET && retry++ < 20) {
        ESP_LOGI(TAG, "Aguardando NTP... (%d/20)", retry);
        vTaskDelay(pdMS_TO_TICKS(500));
    }
    setenv("TZ", "BRT3", 1);
    tzset();
    ESP_LOGI(TAG, "Tempo sincronizado.");
}

/* ---------- HC-SR04 ---------- */

void hcsr04_init(void) {
    gpio_config_t trig = {
        .pin_bit_mask = (1ULL << TRIG_PIN),
        .mode = GPIO_MODE_OUTPUT,
    };
    gpio_config(&trig);

    gpio_config_t echo = {
        .pin_bit_mask = (1ULL << ECHO_PIN),
        .mode = GPIO_MODE_INPUT,
    };
    gpio_config(&echo);
}

float hcsr04_read_cm(void) {
    gpio_set_level(TRIG_PIN, 0);
    ets_delay_us(2);
    gpio_set_level(TRIG_PIN, 1);
    ets_delay_us(10);
    gpio_set_level(TRIG_PIN, 0);

    int64_t start = esp_timer_get_time();
    while (gpio_get_level(ECHO_PIN) == 0) {
        if ((esp_timer_get_time() - start) > TIMEOUT_US) return -1;
    }

    int64_t echo_start = esp_timer_get_time();
    while (gpio_get_level(ECHO_PIN) == 1) {
        if ((esp_timer_get_time() - echo_start) > TIMEOUT_US) return -1;
    }
    int64_t echo_end = esp_timer_get_time();

    return ((echo_end - echo_start) * 0.0343f) / 2.0f;
}

/* ---------- DHT11 ---------- */

esp_err_t dht11_read(float *temperature, float *humidity) {
    uint8_t data[5] = {0};

    gpio_set_direction(DHT_PIN, GPIO_MODE_OUTPUT);
    gpio_set_level(DHT_PIN, 0);
    vTaskDelay(pdMS_TO_TICKS(20));
    gpio_set_level(DHT_PIN, 1);
    ets_delay_us(30);
    gpio_set_direction(DHT_PIN, GPIO_MODE_INPUT);

    int timeout = 0;
    while (gpio_get_level(DHT_PIN) == 1) { ets_delay_us(1); if (++timeout > 100) return ESP_FAIL; }
    while (gpio_get_level(DHT_PIN) == 0) { ets_delay_us(1); if (++timeout > 100) return ESP_FAIL; }
    while (gpio_get_level(DHT_PIN) == 1) { ets_delay_us(1); if (++timeout > 100) return ESP_FAIL; }

    for (int i = 0; i < 40; i++) {
        timeout = 0;
        while (gpio_get_level(DHT_PIN) == 0) { ets_delay_us(1); if (++timeout > 100) return ESP_FAIL; }

        ets_delay_us(35);
        data[i / 8] <<= 1;
        if (gpio_get_level(DHT_PIN) == 1) {
            data[i / 8] |= 1;
            while (gpio_get_level(DHT_PIN) == 1) { ets_delay_us(1); if (++timeout > 100) return ESP_FAIL; }
        }
    }

    if (data[4] != ((data[0] + data[1] + data[2] + data[3]) & 0xFF))
        return ESP_FAIL;

    *humidity    = data[0];
    *temperature = data[2];

    return ESP_OK;
}

/* ---------- Servo ---------- */

static uint32_t servo_angle_to_duty(uint8_t angle) {
    uint32_t max_duty = (1 << 14) - 1;
    uint32_t pulse_us = SERVO_MIN_US + ((SERVO_MAX_US - SERVO_MIN_US) * angle / 180);
    return (pulse_us * max_duty) / (1000000 / SERVO_FREQ_HZ);
}

void servo_init(void) {
    ledc_timer_config_t timer = {
        .speed_mode      = LEDC_LOW_SPEED_MODE,
        .timer_num       = LEDC_TIMER_0,
        .duty_resolution = LEDC_TIMER_14_BIT,
        .freq_hz         = SERVO_FREQ_HZ,
        .clk_cfg         = LEDC_AUTO_CLK,
    };
    ledc_timer_config(&timer);

    ledc_channel_config_t channel = {
        .gpio_num   = SERVO_GPIO,
        .speed_mode = LEDC_LOW_SPEED_MODE,
        .channel    = LEDC_CHANNEL_0,
        .timer_sel  = LEDC_TIMER_0,
        .duty       = servo_angle_to_duty(0),
        .hpoint     = 0,
    };
    ledc_channel_config(&channel);
}

void servo_set_angle(uint8_t angle) {
    ledc_set_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0, servo_angle_to_duty(angle));
    ledc_update_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0);
}

static void fetch_schedules(void) {
    esp_http_client_config_t config = {
        .url        = SCHEDULE_API_URL,
        .method     = HTTP_METHOD_GET,
        .timeout_ms = 10000,
        .keep_alive_enable = false,
    };

    esp_http_client_handle_t client = esp_http_client_init(&config);
    esp_http_client_set_header(client, "X-Device-Token", TOKEN);
    esp_http_client_set_header(client, "Connection", "close");

    char response[1024] = {0};
    int  response_len   = 0;

    esp_err_t err = esp_http_client_open(client, 0);
    if (err == ESP_OK) {
        esp_http_client_fetch_headers(client);
        response_len = esp_http_client_read_response(client, response, sizeof(response) - 1);
    }
    esp_http_client_close(client);
    esp_http_client_cleanup(client);

    if (response_len <= 0) {
        ESP_LOGW(TAG, "Falha ao buscar schedules");
        return;
    }

    // Parse JSON
    cJSON *root = cJSON_Parse(response);
    if (!root) { ESP_LOGE(TAG, "JSON inválido"); return; }

    cJSON *schedules_arr = cJSON_GetObjectItem(root, "schedules");
    if (!cJSON_IsArray(schedules_arr)) { cJSON_Delete(root); return; }

    g_schedule_count = 0;
    cJSON *item;
    cJSON_ArrayForEach(item, schedules_arr) {
        if (g_schedule_count >= MAX_SCHEDULES) break;

        cJSON *active = cJSON_GetObjectItem(item, "is_active");
        if (!cJSON_IsTrue(active)) continue; // ignora inativos

        cJSON *time_str = cJSON_GetObjectItem(item, "scheduled_time");
        if (!cJSON_IsString(time_str)) continue;

        Schedule *s = &g_schedules[g_schedule_count];

        // Parse "08:00:00"
        sscanf(time_str->valuestring, "%d:%d", &s->hour, &s->minute);
        s->is_active  = true;
        s->days_count = 0;

        cJSON *days = cJSON_GetObjectItem(item, "days_of_week");
        cJSON *day;
        cJSON_ArrayForEach(day, days) {
            if (s->days_count < 7)
                s->days_of_week[s->days_count++] = day->valueint;
        }

        ESP_LOGI(TAG, "Schedule carregado: %02d:%02d (%d dias)",
                 s->hour, s->minute, s->days_count);
        g_schedule_count++;
    }

    cJSON_Delete(root);
    ESP_LOGI(TAG, "Total schedules ativos: %d", g_schedule_count);
}

static bool should_feed_now(void) {
    time_t now;
    struct tm t;
    time(&now);
    localtime_r(&now, &t);

    // tm_wday: 0=dom, 1=seg ... 6=sab
    // API usa:  1=seg ... 7=dom
    int api_day = (t.tm_wday == 0) ? 7 : t.tm_wday;

    int current_minutes = t.tm_hour * 60 + t.tm_min;
    int current_seconds = current_minutes * 60 + t.tm_sec;

    for (int i = 0; i < g_schedule_count; i++) {
        Schedule *s = &g_schedules[i];

        // Checa dia da semana
        bool day_match = false;
        for (int d = 0; d < s->days_count; d++) {
            if (s->days_of_week[d] == api_day) { day_match = true; break; }
        }
        if (!day_match) continue;

        // Checa horário com tolerância
        int sched_seconds = s->hour * 3600 + s->minute * 60;
        int diff = abs(current_seconds - sched_seconds);
        if (diff <= TRIGGER_TOLERANCE_S) return true;
    }

    return false;
}

/* ---------- HTTP ---------- */

static void send_telemetry(float reservoir_cm, float bowl_cm,
                           float temperature, float humidity) {
    char read_at[20];
    time_t now;
    struct tm timeinfo;
    time(&now);
    localtime_r(&now, &timeinfo);
    strftime(read_at, sizeof(read_at), "%Y-%m-%d %H:%M:%S", &timeinfo);

    char payload[256];
    snprintf(payload, sizeof(payload),
        "{"
        "\"reservoir_level_cm\":%.1f,"
        "\"bowl_level_cm\":%.1f,"
        "\"temperature\":%.1f,"
        "\"humidity\":%.1f,"
        "\"battery_voltage\":0.0,"
        "\"read_at\":\"%s\""
        "}",
        reservoir_cm, bowl_cm, temperature, humidity, read_at);

    ESP_LOGI(TAG, "Payload: %s", payload);

    esp_http_client_config_t config = {
        .url                   = API_URL,
        .method                = HTTP_METHOD_POST,
        .timeout_ms            = 10000,
        .buffer_size           = 1024,
        .buffer_size_tx        = 1024,
        .disable_auto_redirect = true,
        .keep_alive_enable     = false,
    };

    esp_http_client_handle_t client = esp_http_client_init(&config);
    esp_http_client_set_header(client, "Content-Type", "application/json");
    esp_http_client_set_header(client, "X-Device-Token", TOKEN);
    esp_http_client_set_header(client, "Connection", "close");
    esp_http_client_set_post_field(client, payload, strlen(payload));

    esp_err_t err = esp_http_client_perform(client);
    if (err == ESP_OK)
        ESP_LOGI(TAG, "HTTP %d", esp_http_client_get_status_code(client));
    else
        ESP_LOGE(TAG, "Erro HTTP: %s", esp_err_to_name(err));

    esp_http_client_cleanup(client);
}

/* ---------- Feeder Task ---------- */

void feeder_task(void *pvParameter) {
    servo_init();
    servo_set_angle(0);

    // Espera Wi-Fi antes de buscar schedules
    xEventGroupWaitBits(wifi_event_group, CONNECTED_BIT, false, true, portMAX_DELAY);

    while (!g_time_synced) {
        ESP_LOGI(TAG, "Feeder aguardando NTP...");
        vTaskDelay(pdMS_TO_TICKS(1000));
    }

    ESP_LOGI(TAG, "Feeder pronto.");
    bool feeding_done = false;

    while (1) {
        // Atualiza schedules da API periodicamente
        fetch_schedules();

        if (g_schedule_count == 0) {
            ESP_LOGI(TAG, "Nenhum agendamento ativo.");
        }

        // Loop de checagem a cada 30s
        for (int i = 0; i < (CHECK_INTERVAL_MS / 5000); i++) {
            vTaskDelay(pdMS_TO_TICKS(5000)); // checa a cada 5s

            if (should_feed_now()) {
                if (!feeding_done) {
                    ESP_LOGI(TAG, "Horário bateu! Alimentando...");
                    servo_set_angle(90);
                    vTaskDelay(pdMS_TO_TICKS(SERVO_OPEN_MS));
                    servo_set_angle(0);
                    feeding_done = true;
                }
            } else {
                feeding_done = false; // reseta fora da janela
            }
        }
    }
}


/* ---------- Task principal ---------- */

void telemetry_task(void *pvParameter) {
    hcsr04_init();

    xEventGroupWaitBits(wifi_event_group, CONNECTED_BIT, false, true, portMAX_DELAY);
    ESP_LOGI(TAG, "Wi-Fi ok, sincronizando tempo...");
    sync_time();
    g_time_synced = true;

    while (1) {
        // HC-SR04
        float dist_raw = hcsr04_read_cm();
        if (dist_raw < 0 || dist_raw > RESERVOIR_HEIGHT_CM) {
            ESP_LOGW(TAG, "HC-SR04: leitura fora do range (%.1f cm) — pulando", dist_raw);
            vTaskDelay(pdMS_TO_TICKS(3000));
            continue;
        }
        ESP_LOGI(TAG, "HC-SR04: distância bruta = %.1f cm", dist_raw);
        float reservoir_cm = RESERVOIR_HEIGHT_CM - dist_raw;

        // DHT11
        float temperature = 0, humidity = 0;
        esp_err_t dht_status = dht11_read(&temperature, &humidity);
        if (dht_status != ESP_OK) {
            ESP_LOGW(TAG, "DHT11: falha na leitura");
        } else {
            ESP_LOGI(TAG, "DHT11: temp=%.1f°C | hum=%.1f%%", temperature, humidity);
        }

        ESP_LOGI(TAG, "reservoir=%.1f cm | temp=%.1f | hum=%.1f",
                 reservoir_cm,
                 dht_status == ESP_OK ? temperature : 0,
                 dht_status == ESP_OK ? humidity    : 0);

        send_telemetry(
            reservoir_cm,
            0.0f,
            dht_status == ESP_OK ? temperature : 0,
            dht_status == ESP_OK ? humidity    : 0
        );

        vTaskDelay(pdMS_TO_TICKS(3000));
    }
}

void app_main(void) {
    printf("\nESP-IDF version: %s\n", IDF_VER);

    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);

    wifi_init_sta();
    xTaskCreate(&telemetry_task, "telemetry_task", 8192, NULL, 5, NULL);
    xTaskCreate(&feeder_task,    "feeder_task",    8192, NULL, 5, NULL);
}