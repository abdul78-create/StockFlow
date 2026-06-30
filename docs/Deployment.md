# StockFlow Deployment Guide

StockFlow is containerized to enable seamless deployments on modern container orchestrators (Docker Compose, Kubernetes, AWS ECS, or GCP Cloud Run).

## Local Development Orchestration

We orchestrate the complete development stack with Docker Compose:

```bash
# Spin up backend api, frontend app, PostgreSQL db and Redis instances:
docker-compose up --build
```

## Production Docker Checklist

1.  **Multi-Stage Builds**:
    *   Build layers compile TS to JS, then discard devDependencies.
    *   Run app utilizing lightweight Alpine node runtime images.
2.  **Environment Ingestion**:
    *   Inject database connections and secrets dynamically using container registry parameters or secret managers (Vault, AWS Secrets Manager).
