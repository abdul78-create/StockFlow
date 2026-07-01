# Internship Presentation: Demo Script

This script provides a step-by-step walkthrough of the StockFlow application for your internship final presentation. It is designed to showcase the complete end-to-end functionality, proving the system is robust and production-ready.

## Pre-requisites Before Presenting
1. Ensure Docker is running.
2. Run `docker compose up -d` to start the backend, frontend, database, and cache.
3. Open a browser window to `http://localhost` (Frontend).
4. Open a second tab to `http://localhost:3000/api-docs` (Swagger).
5. Open your IDE or terminal to show the codebase and CI checks.

---

## 1. Quality & Architecture Overview (2 mins)
*Start with your IDE or terminal.*
- **Action**: Show your terminal with `npm run test` or GitHub Actions passing.
- **Talking Track**: "Before diving into the UI, I want to emphasize that StockFlow was built with production quality in mind. It uses strict TypeScript, comprehensive ESLint rules, and Vitest for unit testing. Everything currently passes with zero errors or warnings."
- **Action**: Show `docker-compose.yml`.
- **Talking Track**: "The entire stack is containerized, utilizing multi-stage Dockerfiles for optimized production builds. It orchestrates PostgreSQL, Redis, a NestJS API, and a React frontend."

## 2. API & Swagger (1 min)
*Switch to the Swagger UI tab (`http://localhost:3000/api-docs`).*
- **Action**: Scroll through the API documentation.
- **Talking Track**: "The backend exposes a fully documented REST API. I used Zod and class-validator to ensure strict runtime type safety for every single request payload."

## 3. UI Login & Dashboard (2 mins)
*Switch to the Frontend tab (`http://localhost`).*
- **Action**: Log in using a test account.
- **Talking Track**: "Upon authenticating via JWT, the user lands on the Dashboard. This isn't mock data—the KPIs and charts are powered by real aggregation endpoints, and the Activity Ledger reflects real system events."

## 4. Inbound Workflow: Purchase Order to Inventory (3 mins)
*Navigate to Purchase Orders.*
- **Action**: Click "Create Order", fill out the supplier and add a product item, then submit.
- **Talking Track**: "Let's simulate receiving new stock. I'll create a Purchase Order. The form is validated client-side with React Hook Form and Zod."
- **Action**: Click into the PO details, click "Approve Order", then "Receive Goods".
- **Talking Track**: "Once approved, warehouse staff can receive the goods. Notice how the drawer handles partial or full receipts."
- **Action**: Navigate to Inventory -> Dashboard.
- **Talking Track**: "If we check the inventory, we immediately see the stock levels have increased, and the ledger reflects the receipt event. This uses a Prisma database transaction to ensure data integrity."

## 5. Outbound Workflow: Sales Order (2 mins)
*Navigate to Sales Orders.*
- **Action**: Create a new Sales Order for a customer.
- **Talking Track**: "Now let's fulfill a customer order."
- **Action**: Approve the Sales Order, then click "Dispatch Goods" from the drawer.
- **Talking Track**: "Dispatching the goods deducts the exact quantities from our specified warehouse."
- **Action**: Navigate back to the Dashboard or Reports.
- **Talking Track**: "And again, this immediately updates our global stock health and revenue metrics."

## 6. Reports & Analytics (1 min)
*Navigate to Reports.*
- **Action**: Click through the tabs: Inventory Valuation, Low Stock Alerts, and Sales Summary.
- **Talking Track**: "Finally, we have the analytics module. It calculates real-time inventory valuation based on current stock levels and unit costs, and flags items falling below their minimum threshold."

## 7. Conclusion (1 min)
- **Talking Track**: "In summary, I've built a complete, end-to-end CI/CD Inventory platform that meets all internship requirements and establishes a solid foundation for future SaaS enhancements. Thank you, and I'd be happy to take any questions or demonstrate specific code sections."
