
# Notification AlertTechnical Documentation

## 1. Overview
The Notification Alert Service is a lightweight Go microservice designed to receive and process status codes for different shops. The service maintains internal counters for each shop and triggers an alert (via log output) when a predefined threshold is reached. 
> This service is a work in progress and will be expanded with additional features in future releases.

## 2. Architecture and Components

### 2.1. Core Components
- **HTTP Server:**  
  The service runs an HTTP server (on port 5000) to handle POST requests with notification data.
  
- **Status Counters:**  
  It maintains counters for each shop using a fixed-size array. The counters are updated based on the received status codes.
  
- **Business Logic:**  
  - **updateCounter:** Increments the counter for a given shop and resets it when a threshold (currently set to 5) is reached.
  - **handleUpdate:** Parses and validates the incoming request, then updates the appropriate shop counter.
  - **Request Handler:** Routes incoming HTTP POST requests to the appropriate processing functions.

### 2.2. API Endpoint
- **Endpoint:** `/`  
- **Method:** POST  
- **Parameters:**  
  - `shop`: A string identifier for the shop (e.g., "conad").
  - `code`: A numeric status code (e.g., 1, 2, 3, or 6).
  
Requests are processed to update internal counters and log status messages when thresholds are met.

## 3. Docker Integration

### 3.1. Dockerfile
The service is containerized using the following Dockerfile:
```dockerfile
FROM golang:1.21

WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY . .
RUN go build -o main .

EXPOSE 5000

CMD ["./main"]
```
- **Base Image:** golang:1.21
- **Build Process:** Downloads dependencies and compiles the Go application.
- **Port Exposure:** The container exposes port 5000.
- **Execution:** Runs the compiled binary (`main`).

### 3.2. Docker Compose
Within the overall project, the Notification Alert Service is defined in the `docker-compose.yml` as follows:
```yaml
notification-alert:
  build: ./notification-alert
  ports:
    - "5000:5000"
```
This ensures the service is built from the `./notification-alert` directory and is accessible on port 5000.

## 4. Testing
A simple Python script is provided in the `dev_test` directory to test the notification functionality:
```python
import requests

url = 'http://localhost:5000/send_notification'

try:
    response = requests.post(url, data={'code': 1, 'shop': "conad"})
    response = requests.post(url, data={'code': 2, 'shop': "conad"})
    response = requests.post(url, data={'code': 3, 'shop': "conad"})
    response = requests.post(url, data={'code': 6, 'shop': "conad"})
except Exception as e:
    print("Server is down or not running:", e)
    exit()

if response.status_code == 200:
    print("Notification sent successfully!")
else:
    print("Error:", response.text)
```
- **Purpose:** Simulate sending notifications for a shop and verify that the service processes them correctly.
- **Note:** The actual endpoint path may need adjustment based on the implementation in `main.go`.

## 5. Future Work
- **Enhanced Logging:** Implement structured logging and better error handling.
- **API Expansion:** Extend the API to provide query endpoints for retrieving current status and historical data.
- **Security:** Introduce authentication and authorization as needed.
- **Scalability:** Optimize counter management and possibly persist state in a database for distributed deployments.

>The Notification Alert Service is a core microservice for the liiist project, designed to track and alert on shop status codes.
