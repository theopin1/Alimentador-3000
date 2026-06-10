#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/event_groups.h"
#include "esp_system.h"
#include "esp_wifi.h"
#include "esp_event.h"
#include "esp_log.h"
#include "nvs_flash.h"
#include "esp_netif.h"
#include "lwip/err.h"
#include "lwip/sys.h"
#include "driver/gpio.h"
#include "esp_timer.h"
#include "rom/ets_sys.h" 

//Wi-fi
#define WIFI_SSID "MOB-SOLAR-PA"
#define WIFI_PASS "96238872"

//Sensor HC-SR04
#define TRIG_PIN GPIO_NUM_26
#define ECHO_PIN GPIO_NUM_27
#define TIMEOUT_US 30000  // ~5 metros

//DHT 11
#define DHT_PIN GPIO_NUM_32

static EventGroupHandle_t wifi_event_group;
const int CONNECTED_BIT = BIT0;

static void wifi_event_handler(void *arg, esp_event_base_t event_base,
                               int32_t event_id, void *event_data) {
    if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_START) {
        esp_wifi_connect();
    } else if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_DISCONNECTED) {
        xEventGroupClearBits(wifi_event_group, CONNECTED_BIT);
        esp_wifi_connect();
    } else if (event_base == IP_EVENT && event_id == IP_EVENT_STA_GOT_IP) {
        xEventGroupSetBits(wifi_event_group, CONNECTED_BIT);
    }
}

void main_task_wifi(void *pvParameter) {
    esp_netif_ip_info_t ip_info;

    printf("Waiting for connection to the Wi-Fi network...\n");
    xEventGroupWaitBits(wifi_event_group, CONNECTED_BIT, false, true, portMAX_DELAY);
    printf("Connected!\n");

    esp_netif_get_ip_info(esp_netif_get_handle_from_ifkey("WIFI_STA_DEF"), &ip_info);
    printf("IP Address:  " IPSTR "\n", IP2STR(&ip_info.ip));
    printf("Subnet mask: " IPSTR "\n", IP2STR(&ip_info.netmask));
    printf("Gateway:     " IPSTR "\n", IP2STR(&ip_info.gw));
    printf("You can connect now to any web server online! :-)\n");

    while (1) {
        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }
}

void wifi_init_sta(void){

  // Initialize the TCP/IP stack
    esp_netif_init();

    // Create the default event loop
    ESP_ERROR_CHECK(esp_event_loop_create_default());

    // Create the default Wi-Fi station
    esp_netif_create_default_wifi_sta();

    // Create the event group to handle Wi-Fi events
    wifi_event_group = xEventGroupCreate();

    // Initialize the Wi-Fi driver
    wifi_init_config_t wifi_init_config = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&wifi_init_config));

    // Register event handlers
    ESP_ERROR_CHECK(esp_event_handler_instance_register(WIFI_EVENT,
                                                        ESP_EVENT_ANY_ID,
                                                        &wifi_event_handler,
                                                        NULL, NULL));
    ESP_ERROR_CHECK(esp_event_handler_instance_register(IP_EVENT,
                                                        IP_EVENT_STA_GOT_IP,
                                                        &wifi_event_handler,
                                                        NULL, NULL));

    // Configure Wi-Fi connection settings
    wifi_config_t wifi_config = {
        .sta = {
            .ssid = WIFI_SSID,
            .password = WIFI_PASS,
        },
    };

    // Set Wi-Fi mode to STA (Station)
    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
    ESP_ERROR_CHECK(esp_wifi_set_config(ESP_IF_WIFI_STA, &wifi_config));

    // Start Wi-Fi
    ESP_ERROR_CHECK(esp_wifi_start());

    // Start the main task
    xTaskCreate(&main_task_wifi, "main_task_wifi", 2048, NULL, 5, NULL);
    printf("Connecting to %s\n", WIFI_SSID);
}

void hcsr04_init(void){

  gpio_config_t trig_config = {
    .pin_bit_mask = (1ULL << TRIG_PIN),
    .mode = GPIO_MODE_OUTPUT,
  };
  gpio_config(&trig_config);

  gpio_config_t echo_config = {
        .pin_bit_mask = (1ULL << ECHO_PIN),
        .mode = GPIO_MODE_INPUT,
    };
    gpio_config(&echo_config);
}

float hcsr04_read_cm(void){

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

    int64_t duration_us = echo_end - echo_start;
    return (duration_us * 0.0343f) / 2.0f;

}

void sensor_task(void *pvParameter) {
    hcsr04_init();

    while (1) {
        float dist = hcsr04_read_cm();

        if (dist < 0) {
            printf("Timeout / fora de alcance\n");
        } else {
            printf("Distância: %.1f cm\n", dist);
        }

        vTaskDelay(pdMS_TO_TICKS(500));
    }
}

esp_err_t dht11_read(float *temperature, float *humidity){

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

  *humidity = data[0];
  *temperature = data[2];

  return ESP_OK;
}

void dht_task(void *pvParameter) {
    float temp, hum;

    while (1) {
        if (dht11_read(&temp, &hum) == ESP_OK) {
            printf("Temperatura: %.1f°C | Umidade: %.1f%%\n", temp, hum);
        } else {
            printf("Erro ao ler DHT11\n");
        }
        vTaskDelay(pdMS_TO_TICKS(2000)); 
    }
}

void app_main() {
    printf("\nESP-IDF version used: %s\n", IDF_VER);

    // Initialize NVS
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);

    wifi_init_sta();

    //xTaskCreate(&sensor_task, "sensor_task", 2048, NULL, 5, NULL);

    xTaskCreate(&dht_task, "dht_task", 2048, NULL, 5, NULL);
}
