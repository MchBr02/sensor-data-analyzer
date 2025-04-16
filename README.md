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

- 🐳 Docker + Docker Compose (recommended for deployment)
- 🧪 Deno (for local development)

---

## ⚡ Quick deployment ( 🐳 Docker + Docker compose )
> ⚠️ Make sure your `8000` and `27017` ports are free!
#### 🪟 Windows (Powershell)
```powershell
git clone https://github.com/MchBr02/sensor-data-analyzer.git; cd sensor-data-analyzer; Copy-Item .env-example .env; docker compose up -d
```
#### 🐧 Linux (Bash)
```bash
git clone https://github.com/MchBr02/sensor-data-analyzer.git; cd sensor-data-analyzer/; cp .env-example .env; docker compose up -d
```
⚠️ This line does the following in one go:
1. Clones the repo,
2. Navigates into the project directory,
3. Copies the `.env-example` file to `.env`,
4. Starts everything in detached mode using `docker Compose`.
   - Starts a "`mongo-db`" container with the `.env` variables.
   - Starts "`deno-app`" container with the `.env` variables.

Default `.env` variables:
```bash
# .env-example

# MONGO_DB
MONGODB_HOST_ADRESS=mongo-db
MONGODB_HOST_PORT=27017
MONGODB_DB_NAME=sensordb
MONGODB_ADMIN_USER=admin
# Make sure password is in URL format!
MONGODB_ADMIN_PASS=password
```

---

## 🔧 Getting Started (🧪 Deno)

### 1. Clone the Repository

🐧 Bash:
```bash
git clone https://github.com/MchBr02/sensor-data-analyzer.git
cd sensor-data-analyzer
```

### 2. Set Up Environment Variables

Create a `.env` file based on the example:

🐧 Bash:
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

### 3. Run app
#### Option 1. 🧪 Run with Deno

```bash
deno task start
```

Then open in your browser:

```
http://localhost:8000/data/chart
```

#### Option 2. 🐳 Run with `docker compose`


```bash
docker compose up -d
```

---

## 📺 View the Live Data Stream

Open your browser and visit:

```
http://localhost:8000/data/chart
```

You'll see:
- 📦 Raw device data
- 📈 Real-time sensor graphs

![Screenshot presenting Sensor Charts and Data](static/image.png)

---

## 📤 Sending Sensor Data (Example)

Send a POST request using `curl`:
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

## 🗄️ Checking stored data
### Using MongoDB Compass
- Open your app and `add new connection`
- Default URI: `mongodb://admin:password@localhost:27017/`

# ✅ To-Do

- Add an option to **view** data from the database  
- Add an option to **select a time frame** for displaying data  
- Add **event tracking** so users can monitor how their data is represented  
- (Optional) Add a **login system** so multiple users can manage and track their own data  

## 📄 License

This project is licensed under the [MIT License](LICENSE.md).
