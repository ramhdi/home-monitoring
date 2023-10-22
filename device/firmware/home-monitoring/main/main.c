#include <stdio.h>
#include <stdint.h>
#include <stddef.h>
#include <string.h>
#include "esp_wifi.h"
#include "esp_system.h"
#include "nvs_flash.h"
#include "esp_event.h"
#include "esp_netif.h"
#include "rom/ets_sys.h"
#include "driver/gpio.h"
#include "sdkconfig.h"

#include <dht.h>

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"
#include "freertos/queue.h"

#include "lwip/sockets.h"
#include "lwip/dns.h"
#include "lwip/netdb.h"

#include "esp_log.h"
#include "mqtt_client.h"

#include "cJson.h"

#include "env.h"

static const char *TAG = "HOME_MONITORING";

#define LED_PIN 2
#define DHT_PIN 4

#define MAX_RETRY 10
static int retry_cnt = 0;

#define SENSOR_TYPE DHT_TYPE_AM2301

uint32_t MQTT_CONNECTED = 0;

static void mqtt_app_start(void);

static esp_err_t wifi_event_handler(void *arg, esp_event_base_t event_base, int32_t event_id, void *event_data)
{
    switch (event_id)
    {
    case WIFI_EVENT_STA_START:
        esp_wifi_connect();
        ESP_LOGI(TAG, "Trying to connect with Wi-Fi\n");
        break;

    case WIFI_EVENT_STA_CONNECTED:
        ESP_LOGI(TAG, "Wi-Fi connected\n");
        break;

    case IP_EVENT_STA_GOT_IP:
        ESP_LOGI(TAG, "Got ip: Starting MQTT Client\n");
        mqtt_app_start();
        break;

    case WIFI_EVENT_STA_DISCONNECTED:
        ESP_LOGI(TAG, "Disconnected: Retrying Wi-Fi\n");
        if (retry_cnt++ < MAX_RETRY)
        {
            esp_wifi_connect();
        }
        else
            ESP_LOGI(TAG, "Max Retry Failed: Wi-Fi Connection\n");
        break;

    default:
        break;
    }
    return ESP_OK;
}

void wifi_init(void)
{
    esp_event_loop_create_default();
    esp_event_handler_register(WIFI_EVENT, ESP_EVENT_ANY_ID, &wifi_event_handler, NULL);
    esp_event_handler_register(IP_EVENT, IP_EVENT_STA_GOT_IP, &wifi_event_handler, NULL);

    wifi_config_t wifi_config = {
        .sta = {
            .ssid = ENV_WIFI_SSID,
            .password = ENV_WIFI_PASS,
            .threshold.authmode = WIFI_AUTH_WPA2_PSK,
        },
    };
    esp_netif_init();
    esp_netif_create_default_wifi_sta();
    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    esp_wifi_init(&cfg);
    esp_wifi_set_mode(WIFI_MODE_STA);
    esp_wifi_set_config(ESP_IF_WIFI_STA, &wifi_config);
    esp_wifi_start();
}

static void mqtt_event_handler(void *handler_args, esp_event_base_t base, int32_t event_id, void *event_data)
{
    ESP_LOGD(TAG, "Event dispatched from event loop base=%s, event_id=%li", base, event_id);
    esp_mqtt_event_handle_t event = event_data;

    switch ((esp_mqtt_event_id_t)event_id)
    {
    case MQTT_EVENT_CONNECTED:
        ESP_LOGI(TAG, "MQTT_EVENT_CONNECTED");
        MQTT_CONNECTED = 1;
        break;

    case MQTT_EVENT_DISCONNECTED:
        ESP_LOGI(TAG, "MQTT_EVENT_DISCONNECTED");
        MQTT_CONNECTED = 0;
        break;

    case MQTT_EVENT_ERROR:
        ESP_LOGI(TAG, "MQTT_EVENT_ERROR");
        break;
    default:
        ESP_LOGI(TAG, "Other event id:%d", event->event_id);
        break;
    }
}

esp_mqtt_client_handle_t client = NULL;
static void mqtt_app_start(void)
{
    ESP_LOGI(TAG, "STARTING MQTT");
    esp_mqtt_client_config_t mqttConfig = {
        .broker = {
            .address = {
                .uri = ENV_MQTT_BROKER_URI,
            },
        },
    };

    client = esp_mqtt_client_init(&mqttConfig);
    esp_mqtt_client_register_event(client, ESP_EVENT_ANY_ID, mqtt_event_handler, client);
    esp_mqtt_client_start(client);
}

void Hello_Publisher_Task(void *pvParameter)
{
    uint32_t i = 0;
    while (1)
    {
        printf("Hello!%lu\n", i);
        char buffer[10];
        snprintf(buffer, sizeof(buffer), "%lu", i);
        if (MQTT_CONNECTED)
        {
            esp_mqtt_client_publish(client, ENV_MQTT_PUB_TOPIC, buffer, 0, 0, 0);
        }
        i++;
        vTaskDelay(5000 / portTICK_PERIOD_MS);
    }
}

void DHT_Publisher_Task(void *pvParameter)
{
    float temperature, humidity;
    gpio_set_pull_mode(DHT_PIN, GPIO_PULLUP_ONLY);
    while (1)
    {
        if (dht_read_float_data(SENSOR_TYPE, DHT_PIN, &humidity, &temperature) == ESP_OK)
        {
            // printf("Humidity: %.1f%% Temp: %.1fC\n", humidity, temperature);
            cJSON *msg = cJSON_CreateObject();
            char *msg_string = NULL;
            if (cJSON_AddNumberToObject(msg, "temperature", temperature) == NULL)
            {
                printf("Error JSON: failed to add temperature");
                goto end;
            }
            if (cJSON_AddNumberToObject(msg, "humidity", humidity) == NULL)
            {
                printf("Error JSON: failed to add humidity");
                goto end;
            }
            msg_string = cJSON_Print(msg);
            if (msg_string == NULL)
            {
                printf("Error JSON: failed to convert JSON to string.\n");
            }
            else
            {
                printf("%s\n", msg_string);
                if (MQTT_CONNECTED)
                {
                    esp_mqtt_client_publish(client, ENV_MQTT_PUB_TOPIC, msg_string, 0, 0, 0);
                }
            }
        end:
            cJSON_Delete(msg);
        }
        else
        {
            printf("Error DHT!");
        }
        vTaskDelay(60000 / portTICK_PERIOD_MS);
    }
}

void Blink_Task(void *pvParameter)
{
    esp_rom_gpio_pad_select_gpio(LED_PIN);
    gpio_set_direction(LED_PIN, GPIO_MODE_OUTPUT);

    while (true)
    {
        gpio_set_level(LED_PIN, 1);
        vTaskDelay(100 / portTICK_PERIOD_MS);
        gpio_set_level(LED_PIN, 0);
        vTaskDelay(4900 / portTICK_PERIOD_MS);
    }
}

void app_main()
{
    nvs_flash_init();
    wifi_init();
    // xTaskCreate(&Hello_Publisher_Task, "Hello_Publisher_Task", 2048, NULL, 5, NULL);
    xTaskCreate(&Blink_Task, "Blink_Task", 2048, NULL, 4, NULL);
    xTaskCreate(&DHT_Publisher_Task, "DHT_Publisher_Task", 2048, NULL, 5, NULL);
}
