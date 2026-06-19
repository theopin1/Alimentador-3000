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

#define WIFI_SSID "MOB-SOLAR-PA"
#define WIFI_PASS "96238872"

#define TRIG_PIN GPIO_NUM_26
#define ECHO_PIN GPIO_NUM_27
#define TIMEOUT_US 30000

#define DHT_PIN GPIO_NUM_32

#define API_URL "http://192.168.18.9:8000/api/v1/ingest/telemetry"
#define TOKEN   "kUiUY5C0lKZYNyFLJQSVu1tjLVpJ3pMzv7EttjPIwf8wRUPvefPmRVYp15LRBRsf"

#define RESERVOIR_HEIGHT_CM 30.0f

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
    };

    esp_http_client_handle_t client = esp_http_client_init(&config);
    esp_http_client_set_header(client, "Content-Type", "application/json");
    esp_http_client_set_header(client, "X-Device-Token", TOKEN);
    esp_http_client_set_post_field(client, payload, strlen(payload));

    esp_err_t err = esp_http_client_perform(client);
    if (err == ESP_OK)
        ESP_LOGI(TAG, "HTTP %d", esp_http_client_get_status_code(client));
    else
        ESP_LOGE(TAG, "Erro HTTP: %s", esp_err_to_name(err));

    esp_http_client_cleanup(client);
}

/* ---------- Task principal ---------- */

void telemetry_task(void *pvParameter) {
    hcsr04_init();

    xEventGroupWaitBits(wifi_event_group, CONNECTED_BIT, false, true, portMAX_DELAY);
    ESP_LOGI(TAG, "Wi-Fi ok, sincronizando tempo...");
    sync_time();

    while (1) {
        // HC-SR04
        float dist_raw = hcsr04_read_cm();
        if (dist_raw < 0 || dist_raw > RESERVOIR_HEIGHT_CM) {
            ESP_LOGW(TAG, "HC-SR04: leitura fora do range (%.1f cm) — pulando", dist_raw);
            vTaskDelay(pdMS_TO_TICKS(30000));
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

        vTaskDelay(pdMS_TO_TICKS(30000));
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
}