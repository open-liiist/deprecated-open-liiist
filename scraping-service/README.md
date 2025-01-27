# Scraping Service

This microservice is responsible for scraping e-commerce products and sending the data to the `product-receiver` service. The data includes product details like the full name, description, price, discount, and localization information. This service runs on Docker and communicates with other services via HTTP requests.

Here's a **README.md** tailored for your `docker-compose.yml` configuration and the **scraping-service** project.

---

## **Services**

### 1. **Scraping-Conad**
   - Extracts data from Conad.
   - Runs the `scraping_conad.py` script.
   - Dockerfile: `Dockerfile.scraping_conad`.

### 2. **Scraping-Gros-Groups**
   - Handles multiple scrapers for Gros Groups.
   - Includes a scheduler to execute scripts like `scraping_cts.py`.
   - Dockerfile: `Dockerfile.scraping_gros_groups`.

### 3. **Scraping-Oasi-Tigre**
   - Scrapes data from Oasi Tigre.
   - Runs the `scraping_tigre.py` script.
   - Dockerfile: `Dockerfile.scraping_oasi_tigre`.

### 4. **Scraping-Shop**
   - Manages scheduled scraping tasks across multiple services.
   - Executes the `scheduler.py` script.
   - Dockerfile: `Dockerfile.scraping_shop`.

---

## **Setup Instructions**

### 1. **Clone the Repository**
```bash
git clone <repository-url>
cd project
```
---

#### 2. **Configure Environment Variables**
The only environment variable required is for the `scraping_shop` service, specifically `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.

1. Create a `.env` file if it does not exist:
   ```bash
   touch .env
   ```

2. Add the following variable to your `.env` file:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```

   Replace `your-google-maps-api-key` with your actual Google Maps API key.

---

Update the `.env` file with your settings.

### 3. **Build and Start Services**
To build and start all scraping services, run:
```bash
docker-compose up --build
```

### 4. **Check Logs**
Monitor logs for specific services:
```bash
docker logs scraping-conad
docker logs scraping-gros-groups
docker logs scraping-oasi-tigre
docker logs scraping-shop
```

Or monitor logs for all services:
```bash
docker-compose logs -f
```

### 5. **Stop Services**
To stop all containers:
```bash
docker-compose down
```

---

## **Dependencies**

### Python Requirements
- Ensure all Python dependencies are listed in `requirements.txt`.

### Docker
- Docker version: 20.10+
- Docker Compose version: 1.29+

---

## **Customization**

### Add New Scraping Services
1. Create a new folder under `scraping-service/scraping/` (e.g., `new_scraper/`).
2. Add the corresponding Python script (e.g., `scraping_new.py`).
3. Create a new Dockerfile (e.g., `Dockerfile.scraping_new`).
4. Update the `docker-compose.yml` to include the new service.

### Schedule Scraping Jobs
Modify the `scheduler.py` file in `scraping_shop` to define new schedules for existing or new scripts.

---

Let me know if you'd like to add or modify any sections! 🚀