# StockFlow API Reference

The primary API server is exposed on `/api/v1` (with the exception of `/health`). Interactive documentation is hosted at `/api-docs` using Swagger.

## System Health Check

Verify status, system environment, and uptime.

*   **URL**: `/health`
*   **Method**: `GET`
*   **Success Response**:
    *   **Code**: `200`
    *   **Content**:
        ```json
        {
          "status": "ok",
          "timestamp": "2026-06-29T16:00:00.000Z",
          "env": "development"
        }
        ```

## Swagger Interface
When running locally:
*   Navigate to: `http://localhost:5000/api-docs`
*   Use it to test authentication headers and product CRUD flows interactively.
