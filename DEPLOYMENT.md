# Deployment Guide

StockFlow is containerized using Docker and Docker Compose, making it extremely easy to deploy to any environment that supports Docker.

## Prerequisites
- Docker Engine
- Docker Compose

## Development Deployment

To spin up the entire stack locally for development or testing:

1. Clone the repository and navigate to the root directory.
2. Run the following command:
   ```bash
   docker compose up --build
   ```
3. The following services will start:
   - **PostgreSQL**: Port 5432
   - **Redis**: Port 6379
   - **Backend API**: Port 3000 (accessible at `http://localhost:3000`)
   - **Frontend UI**: Port 80 (accessible at `http://localhost`)

Prisma migrations are run automatically on backend container startup.

## Production Deployment considerations

For a true production environment, consider the following enhancements:

### 1. External Managed Databases
Instead of running PostgreSQL and Redis inside Docker Compose, use managed services like AWS RDS for PostgreSQL and AWS ElastiCache for Redis. Update the `.env` variables in your backend service to point to these production instances.

### 2. Reverse Proxy and SSL
Place the frontend and backend behind a robust reverse proxy like NGINX or Traefik that handles SSL termination via Let's Encrypt. 

### 3. CI/CD Pipeline
Use GitHub Actions (or similar) to automate the build and deployment process. On every push to `main`:
1. Run linting and unit tests.
2. Build the Docker images.
3. Push images to a container registry (e.g., Docker Hub, AWS ECR).
4. Trigger a rolling update on your orchestration platform (e.g., Kubernetes, AWS ECS, or a simple Docker Swarm).

### 4. Monitoring & Logging
The backend uses Pino for structured JSON logging. In production, configure a log aggregator like Datadog, ELK Stack, or AWS CloudWatch to ingest and monitor these logs. Use `/health` endpoints for uptime monitoring.
