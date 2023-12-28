import mqtt from 'precompiled-mqtt';
import { useState, useEffect } from 'react';

const DEBUG = false;
const USE_PUBLIC_BROKER = true;
const url = (USE_PUBLIC_BROKER ? 'ws://broker.emqx.io:8083/mqtt' : 'ws://localhost:8083/mqtt');
const topic = (USE_PUBLIC_BROKER ? '87435ae0-7931-11ee-b962-0242ac120002/dashboard' : 'dashboard/');

export default function Dashboard() {
  const [message, setMessage] = useState("");
  const [mqttClient, setMqttClient] = useState<mqtt.MqttClient | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!mqttClient) {
      const client = mqtt.connect(url);
      client.on('connect', () => {
        DEBUG && console.log(`[${new Date().toISOString()}] Connected to MQTT broker`);
        client.subscribe(topic, (error) => {
          if (error) {
            DEBUG && console.log(`[${new Date().toISOString()}] ${error}`);
          } else {
            DEBUG && console.log(`[${new Date().toISOString()}] Subscribed to topic: ${topic}`);
            setConnected(true);
          }
        });
      });

      client.on('close', () => {
        setConnected(false);
      });

      client.on('message', (t, payload) => {
        DEBUG && console.log(`[${new Date().toISOString()}] New message from topic ${t}: ${payload.toString()}`);
        if (t === topic) {
          setMessage(JSON.stringify(JSON.parse(payload.toString()), null, 2));
        }
      });

      setMqttClient(client);
    }
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {
        !connected ?
          (
            <div>
              Not connected to MQTT broker!
            </div>
          ) :
          (
            <div>
              <span>Connected to MQTT broker!</span>
              <span>{message}</span>
            </div>
          )
      }
    </div>
  );
}