# grocygo

A smart grocery list app that helps users find the best prices at nearby markets. Create your list, enter your location, and the app compares prices to recommend the most economical shopping options.

## Features
- Create and manage grocery lists.
- Search for nearby markets based on your location.
- Compare prices across multiple stores.
- Get recommendations for the most cost-effective markets.

## Tech Stack
- **Frontend**: Next.js, TypeScript
- **Microservices**:
  - Authentication/Authorization: Node.js, Express
  - User Service: Node.js, Express
  - Search Service: Rust
  - Scraper Service: Python
- **Database**: PostgreSQL
- **Message Queues**: RabbitMQ, Kafka
- **Containerization**: Docker, Docker Compose
- **API Gateway**: Traefik
- **CI/CD**: Jenkins (or alternative)
- **Deployment**: Kubernetes

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js (for development)
- PostgreSQL (for local database setup)

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/gabref/grocygo.git
   cd grocygo
   ```

2. Build and start services:
   ```bash
   docker-compose up --build
   ```

3. Access the frontend at `http://localhost:3000` and API Gateway at `http://localhost:8000`.

### Environment Variables
Create a `.env` file for each service, for example in `services/auth-service/.env`:
```
DATABASE_URL=postgres://user:password@db:5432/authdb
```

### Running Tests
Each microservice has its own tests. To run them:
1. Navigate to the service directory.
2. Run the tests, e.g., for Node.js services:
   ```bash
   npm test
   ```
