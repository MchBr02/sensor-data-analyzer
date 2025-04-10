# Sensor Data Analyzer

A Deno Fresh.js application that collects sensor data, stores it in a MongoDB database, and provides real-time charts via WebSockets and Chart.js.

## Features
- Real-time sensor data display
- Data storage using MongoDB
- WebSocket support for live updates
- Dockerized for easy deployment

---

## Prerequisites
- Docker and Docker Compose

or
- Deno (for local development)

---

## Getting Started

### Clone the Repository
```bash
git clone https://github.com/mr02/sensor-data-analyzer.git
cd sensor-data-analyzer
```

### Setup Environment Variables
Create a `.env` file in the project root directory:
```bash
cp .env.example .env
```
Edit the `.env` file to fit your configuration:
```
# MongoDB Configuration
MONGODB_HOST_ADRESS=mongo
MONGODB_HOST_PORT=27017
MONGODB_DB_NAME=sensordb
MONGODB_DB_COLLECTION=sensordb
MONGODB_ADMIN_USER=admin
MONGODB_ADMIN_PASS=password
```

---

## Running the Project Locally

### Install Dependencies
```bash
deno task start
```

---

## Docker Deployment

### Pull from Docker Hub
Docker Pull Command:
```
docker pull mr02/sensor-data-analyzer
```
---

## Viev live data stream
Open your browser and navigate to:
```
http://localhost:8000/data/chart
```

---

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

### Pulling from Docker Hub
```bash
docker pull mr02/sensor-data-analyzer:latest
```

### Running the Docker Container
```bash
docker run -d -p 8000:8000 --name sensor-analyzer mr02/sensor-data-analyzer:latest
```

---

## License
This project is licensed under the [MIT license](LICENSE.md).
