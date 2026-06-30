# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-29

### Added
- **Authentication**: JWT-based login, rate limiting, and security headers.
- **Multi-tenant Core**: Organization-scoped data access model.
- **Inventory Ledger**: Double-entry ledger system for tracking exact stock movements without race conditions.
- **Product Management**: Complete CRUD for products with soft-delete and restore capabilities.
- **Purchase Orders**: PO lifecycle management with partial/full receiving that directly updates the inventory ledger.
- **Sales Orders**: SO lifecycle management with stock reservation logic to prevent double-selling.
- **Dashboard API**: Real-time aggregation of metrics, low-stock alerts, and recent activity.
- **Reports API**: Valuation and historical reporting endpoints.
- **Frontend Dashboard**: React 18, Vite, and TailwindCSS application featuring Recharts data visualization.
- **Docker Orchestration**: Complete `docker-compose.yml` to launch Postgres, Redis, Backend, and Nginx Frontend simultaneously.
- **CI/CD Pipeline**: GitHub Actions workflow for linting, type-checking, automated testing, coverage enforcement (80%+), and Docker image building.
- **UI Polish**: Toast notifications, empty states, loading skeletons, and confirmation dialogs.
