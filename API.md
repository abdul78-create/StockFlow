# StockFlow API Documentation

The StockFlow backend exposes a RESTful API. The API is comprehensively documented using Swagger (OpenAPI 3.0). 

## Swagger / OpenAPI

When the application is running, the Swagger UI is available at:
`http://localhost:3000/api-docs`

This interactive documentation allows you to:
- View all available endpoints
- Inspect request and response schemas
- Test endpoints directly from your browser

## Core Modules

### 1. Products (`/api/products`)
Manage the product catalog, including creating new items, updating details, and retrieving paginated lists of products with optional search filters.

### 2. Inventory (`/api/inventory`)
Record movements of stock.
- `POST /api/inventory/receive`: Add stock to a warehouse.
- `POST /api/inventory/transfer`: Move stock between warehouses.
- `POST /api/inventory/adjust`: Manually increment or decrement stock.
- `GET /api/inventory/balances`: View current stock levels.

### 3. Orders
- **Purchase Orders (`/api/purchase-orders`)**: Inbound orders from suppliers. Transitions through Draft -> Approved -> Completed as stock is received.
- **Sales Orders (`/api/sales-orders`)**: Outbound orders to customers. Transitions through Draft -> Approved -> Dispatched -> Delivered.

### 4. Reports (`/api/reports`)
Analytical endpoints to power the dashboard.
- `GET /api/reports/dashboard`: High-level KPIs and recent activity feed.
- `GET /api/reports/inventory-valuation`: Total value of stock grouped by category.
- `GET /api/reports/low-stock`: Items that have fallen below their minimum threshold.

### 5. Authentication (`/api/auth`)
Handles user authentication and JWT token generation.
- `POST /api/auth/login`: Authenticate and receive a JWT.
- `POST /api/auth/register`: Register a new user (for testing purposes).

## Postman Collection

A `postman_collection.json` file is included in the repository root. 
To use it:
1. Open Postman.
2. Click **Import** and select `postman_collection.json`.
3. Set your environment variables (e.g., `{{baseUrl}} = http://localhost:3000/api`).
4. Execute the `/auth/login` request to grab a token, then set it in your Authorization header for subsequent requests.
