# 🌦️ Weather API

This is a simple **Weather API** service that fetches real-time weather data from a 3rd-party provider (WeatherAPI.com) and serves it through a custom-built API. It also implements **caching with Redis** to improve performance and reduce external API calls, and includes **rate-limiting** to prevent abuse.

✅ **Fully covered with unit and integration tests using Jest** for robust quality assurance.

🔗 **Project URL:** [Weather API Project on Roadmap.sh](https://roadmap.sh/projects/weather-api-wrapper-service)

---

## 📂 Project Structure

```
.
├── config         // Configuration for redis and environment
├── routes         // API route definitions
├── controllers    // Logic to handle requests and responses
├── services       // Interfacing with WeatherAPI and Redis
├── middlewares    // Rate limiter, error handler, etc.
├── utils          // Common helpers and utilities
├── app.js         // Server entry point & Express app setup
├── __tests__           // All test cases (Jest)
│   ├── config          // Unit tests for config
│   ├── routes          // Unit tests for routes
│   ├── controllers     // Unit tests for controllers
│   ├── services        // Unit tests for services
│   ├── middlewares     // Unit tests for middlewares
│   ├── utils           // Unit tests for utils
├── .env.example        // Example .env file
├── README.md
└── package.json
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/zeeshan2423/weather-api.git
cd weather-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Create a `.env` file in the project root based on `.env.example` and fill in the required values.

**Example `.env` file:**

```
# Server configuration
PORT=3000
NODE_ENV=development

# WeatherAPI.com credentials (get your free API key at https://www.weatherapi.com)
WEATHERAPI_API_KEY=your_weatherapi_key_here
WEATHERAPI_BASE_URL=https://api.weatherapi.com/v1

# Redis connection
REDIS_URL=your_redis_url_here

# Rate limiting (requests per window)
RATE_LIMIT_WINDOW_MS=900000   # 15 minutes
RATE_LIMIT_MAX=100            # 100 requests per window
```

---

## ⚙️ Running the project

```bash
npm start
```

The server will be available at:

```
http://localhost:<PORT>
```

---

## 📡 API Endpoints

### 1. Get Weather by City

```
GET /weather/:city
```

Example:

```
GET /weather/london
```

- Checks Redis cache first.
- If cache miss, fetches fresh data from **WeatherAPI.com**.
- Caches the result for **12 hours** in Redis.
- Returns JSON weather data.

### 2. Get Health of Application & Dependencies

```
GET /health
```

Expected Result:

```
{
    "status": "success",
    "message": "Service status",
    "data": {
        "app": true,
        "redis": true,
        "weatherApi": true
    }
}
```

- Checks Redis connectivity.
- Checks WeatherAPI connectivity.

---

## 🏗️ Features

✅ Fetch weather data from WeatherAPI.com  
✅ Redis caching (12-hour expiry)  
✅ Proper error handling (invalid city, API failure, etc.)  
✅ Environment variables for configuration  
✅ Rate limiting (100 requests per 15 minutes)  
✅ Fully tested with **Jest** (unit & integration tests)

---

## 🧪 Testing

The project includes comprehensive test coverage using **Jest**.

### To run all tests:

```bash
npm test
```

### Types of Tests:

| Test Type            | Purpose                                                                             |
| -------------------- | ----------------------------------------------------------------------------------- |
| **Unit Tests**       | Tests individual functions and services. (e.g., `weather.service`, `cache.service`) |
| **Controller Tests** | Ensures request handlers return expected results.                                   |

Expected Output:

```sh
Test Suites: 13 passed, 13 total
Tests:       70 passed, 70 total
Snapshots:   0 total
Time:        1.961 s, estimated 2 s
```

---

## 💡 Key Technologies

- Node.js
- Express.js
- Redis
- axios (for external API calls)
- dotenv (for environment configuration)
- express-rate-limit (for rate limiting)
- Jest (for unit & integration testing)

---

## 🛠️ Error Handling

The API handles the following:

- Invalid city name (`404 Not Found`)
- WeatherAPI.com failures (`502 Bad Gateway`)
- Missing/invalid API key (`500 Internal Server Error`)
- Rate limit exceeded (`429 Too Many Requests`)

---

## ⚠️ Important Notes

- `.env` is not committed (for security), so you **must create it manually** based on `.env.example`.
- Make sure Redis is running locally, or provide a cloud Redis connection string in `REDIS_URL`.

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🔗 Useful Links

- WeatherAPI.com: [https://www.weatherapi.com](https://www.weatherapi.com)
- Redis Docs: [https://redis.io/documentation](https://redis.io/documentation)
- Jest Docs: [https://jestjs.io/docs](https://jestjs.io/docs)

---

## 👨‍💻 Contributing

Contributions are welcome! Feel free to open issues and submit pull requests.

---

## **Author** ✨

👨‍💻 Developed by **Mohammad Zeeshan Khan**  
📧 Contact: zeeshan2423@gmail.com

---
