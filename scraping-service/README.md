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


