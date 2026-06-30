# StockFlow Architecture Documentation

This document describes the architectural patterns, layered flow, and design principles applied across the StockFlow codebase.

## Architectural Objectives
*   **Scalability**: Separated modules enable modular development and deployment.
*   **Decoupling**: Business logic is isolated from database ORMs and HTTP frameworks.
*   **Testability**: Clear boundaries facilitate easy mocking.

## Clean Architecture Layers (Feature-First)

Every backend feature inside `backend/src/modules/<feature>` follows this exact execution flow:

```
Route Definitions
       │ (Request Entry)
       ▼
Controllers
       │ (Parses HTTP, Validates Input via Zod)
       ▼
Services
       │ (Applies Core Business Logic)
       ▼
Repositories
       │ (Abstracts data persistence)
       ▼
Prisma ORM (Database client)
```

1.  **Routes Layer**: Defines URI endpoints and assigns controllers and custom middleware (e.g., auth, rate-limiting).
2.  **Controller Layer**: Handles raw request context (cookies, parameters, body), calls Zod schemas for input safety, and maps return states to HTTP response codes.
3.  **Service Layer**: Represents domain workflows (e.g., checking stock thresholds before dispatching notifications).
4.  **Repository Layer**: Encapsulates raw database queries. Swapping PostgreSQL or Prisma will only require changing the files inside this layer.
