# Sensor Data Analyzer

A Deno Fresh.js application that collects sensor data, stores it in a MongoDB database, and provides real-time charts via WebSockets and Chart.js.

---

## 🚀 Features

- 📡 Real-time sensor data display
- 📊 Charts for data analysis using Chart.js
- 🗄️ MongoDB-based data storage
- 🔌 WebSocket support for live updates
- 🐳 Dockerized for easy deployment

---

## 📦 Prerequisites

You need **one of the following setups**:

- ✅ Docker + Docker Compose (recommended for deployment)
- 🧪 Deno (for local development)

---

## 🔧 Getting Started (Deno)

### 1. Clone the Repository

```bash
git clone https://github.com/MchBr02/sensor-data-analyzer.git
cd sensor-data-analyzer
```

### 2. Set Up Environment Variables

Create a `.env` file based on the example:

```bash
cp .env-example .env
```

Then edit `.env`:

```env
# MongoDB Configuration
MONGODB_HOST_ADRESS=mongo
MONGODB_HOST_PORT=27017
MONGODB_DB_NAME=sensordb
MONGODB_ADMIN_USER=admin
MONGODB_ADMIN_PASS=password
```

---

## Option 1. 🧪 Run Locally with Deno

```bash
deno task start
```

Then open in your browser:

```
http://localhost:8000/data/chart
```

---

## OR

## Option 2. 🐳 Run with `docker compose`


```bash
docker compose up -d
```

> ⚠️ Ensure a MongoDB instance is running and accessible (either as another container or hosted).
```cmd
docker run -d --name mongo-db -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password -p 27017:27017 mongo:latest
```

## 📺 View the Live Data Stream

Open your browser and visit:

```
http://localhost:8000/data/chart
```

You'll see:
- 📦 Raw device data
- 📈 Real-time sensor graphs

---

## 📤 Sending Sensor Data (Example)

Send a POST request using `curl`:

## Sending Sensor Data (Example)
Use `curl` to send a POST request:
```bash
curl -X POST -H "Content-Type: application/json" -d '{
  "messageId": 57,
  "sessionId": "944g3a81-2217-783b-9ha3-226376hdzabc",
  "deviceId": "ada7f0d5-1hht-4f53-baaf-d1f0yctz2435",
  "payload": [
    {
      "name": "network",
      "time": 1743636758626000000,
      "values": {
        "type": "wifi",
        "isConnected": true,
        "isInternetReachable": true,
        "isWifiEnabled": true,
        "isConnectionExpensive": false,
        "ssid": "Super_Fast_WiFi",
        "bssid": "27:df:v9:7b:b5:24",
        "strength": 99,
        "ipAddress": "192.168.62.18",
        "frequency": 5200
      }
    }
  ]
}' http://localhost:8000/api/data
```


---

## 📄 License

This project is licensed under the [MIT License](LICENSE.md).