# Scraping Service

This microservice is responsible for scraping e-commerce products and sending the data to the `product-receiver` service. The data includes product details like the full name, description, price, discount, and localization information. This service runs on Docker and communicates with other services via HTTP requests.

### Prerequisites

- Docker and Docker Compose installed on your system.

### Installation and Setup

Clone the repository and navigate to the `scraping-service` directory.

```bash
git clone git@github.com:gabref/grocygo.git
cd scraping-service
```

### 🛠️ **How to Run and Test the Application**

### 🔥 **1. Build the Docker Image**
To build the Docker image for the **scraping_cts_shop** service, run the following command:

```bash
docker build -f Dockerfile.shop -t scraping_cts_shop .
```

---

### 🔧 **2. Modify the Dockerfile**

Next, make the following changes to the **Dockerfile**:
- **Remove all comments** to keep the file clean.
- **Comment out all parts related to `scraping_cts_shop`**.
- Add any required configurations if needed.

---

### 🔥 **3. Build the New Docker Image**
After modifying the Dockerfile, build the new image for the **scraping_cts** service by running the following command:

```bash
docker build -f Dockerfile.shop -t scraping_cts .
```

---

### 🚀 **4. Launch the Scraping Container Using Docker Compose**
Once the Docker images are built, you can use **Docker Compose** to bring up the **scraping container**. Run the following command:

```bash
docker-compose up -d scraping
```