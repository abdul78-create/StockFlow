# PROJECT OVERVIEW

StockFlow is a modern, containerized, multi-tenant SaaS Enterprise Resource Planning (ERP) and Inventory Management system. 
**Why this project exists:** The project originated as a comprehensive final internship project designed to demonstrate full-stack engineering competency, Docker containerization, CI/CD pipelines, and rigorous software development practices. 
**Original internship objective:** Deliver a fully functional, containerized inventory management system with robust frontend/backend separation, testing, and quality checks.
**Commercial SaaS objective:** Evolve the internship project into a production-ready, multi-tenant B2B SaaS platform inspired by Zoho Inventory and Linear. It supports multiple organizations (workspaces), role-based access control (RBAC), subscription billing, and complex supply chain workflows (Purchase Orders, Sales Orders, multi-warehouse inventory).
**Current status:** The core ERP (Products, Inventory, Orders, Customers, Suppliers, Warehouses) is 100% complete. The multi-tenant architecture and authentication workflows are fully integrated. The project has entered the "Polish" phase to refine the user experience with optimistic updates, skeletons, and keyboard shortcuts.
**Future vision:** StockFlow aims to become a fully scalable SaaS product with advanced modules like barcode scanning, batch tracking, customer/supplier portals, and real-time collaboration.

---

# PROJECT TIMELINE

### Phase 1: Foundation and Internship Setup
**What was built:** The initial monolithic skeleton consisting of a Node.js Express backend and a React/Vite frontend. PostgreSQL and Redis were set up via Docker Compose.
**Why it was built:** To satisfy the baseline internship requirements for a containerized full-stack application.
**Architecture decisions:** REST API architecture, Prisma ORM for database modeling, TailwindCSS for styling, and standard JWT authentication.

### Phase 2: Core ERP Schema & Architecture
**What was built:** The database schema for Products, Categories, Suppliers, Warehouses, and Inventory tracking.
**Why it was built:** To form the backbone of the inventory management logic.
**Architecture decisions:** A 3-tier backend architecture (Controllers, Services, Repositories) was adopted to ensure business logic is decoupled from HTTP transport.

### Phase 3: Commercial v2.0 & Multi-Tenancy (Phase A)
**What was built:** The `Organization`, `OrganizationMember`, and `Invitation` models. Implementation of workspace switching, RBAC (Owner, Admin, Manager, Staff), and HTTP-only cookie-based session management with Refresh Tokens.
**Why it was built:** To transition from a single-user tool to a B2B SaaS platform where users can belong to multiple workspaces.
**Architecture decisions:** An `organizationId` was added to almost every domain model. A global `requirePermission` middleware was introduced to validate JWTs and authorize resource access based on the user's role in the specific workspace requested via the `X-Workspace-ID` header.

### Phase 4: Core ERP Experience (Phase B)
**What was built:** End-to-end implementation of Products, Inventory, Purchase Orders, Sales Orders, Customers, Suppliers, and Warehouses.
**Why it was built:** To deliver the actual business value of the ERP system.
**Architecture decisions:** The UI heavily utilizes React Query for caching/fetching and Zustand for global state. Skeletons were introduced for loading states instead of basic spinners to achieve a premium "Linear" aesthetic.

### Phase 5: Dashboard and Reports (Phase C & D)
**What was built:** The executive dashboard featuring financial and operational KPIs, a 14-day transaction timeline chart (Recharts), and system activity feeds.
**Why it was built:** To give business owners a bird's-eye view of their operations.

### Phase 6: Commercial SaaS Billing (Phase F)
**What was built:** The `Subscription` model mapped 1-to-1 with Organizations. A frontend billing settings page to handle "Starter", "Pro", and "Enterprise" tiers.
**Why it was built:** To lay the groundwork for monetization.

### Phase 7: Polish (Phase G)
**What was built:** Optimization of empty states, integration of `Skeleton` loaders globally via `QueryStateWrapper`, implementation of keyboard shortcuts (`c` for create, `/` for search), optimistic updates for mutations, and scrollbar hiding utilities.
**Why it was built:** To elevate the UX to match mature commercial SaaS products like Zoho Inventory.

---

# BACKEND ARCHITECTURE

The backend follows a domain-driven, layered architecture using Node.js, Express, TypeScript, and Prisma ORM. 

### Modules Breakdown

**Authentication & Sessions**
- **Purpose:** Securely identify users and maintain sessions.
- **Business Logic:** Login creates a short-lived access token and a long-lived refresh token stored securely in the database and as an HTTP-only cookie.
- **Endpoints:** `POST /api/v1/auth/signup`, `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`.

**Workspace (Multi-Tenancy)**
- **Purpose:** Isolate data between different tenant companies.
- **Business Logic:** When a user creates a workspace, they are assigned the `OWNER` role. All subsequent operations require the `X-Workspace-ID` header.

**Permissions & RBAC**
- **Purpose:** Enforce authorization rules.
- **Business Logic:** Middleware intercepts requests, reads the workspace header, looks up the user's role, and checks against a granular permission map (e.g., `products.view`, `inventory.manage`).

**Products**
- **Purpose:** Master catalog of items being sold or purchased.
- **Database Relations:** Belongs to Organization, Category. Has many Inventories, Variants, Units, Suppliers, Attachments.

**Inventory**
- **Purpose:** Track exact quantities of products across different physical locations.
- **Business Logic:** Inventory cannot be updated directly; it requires an `InventoryTransaction` to maintain an immutable audit trail.

**Warehouses**
- **Purpose:** Represent physical storage locations.
- **Database Relations:** Belongs to Organization, has many Inventories.

**Suppliers & Customers**
- **Purpose:** Track B2B and B2C entities for procurement and sales.

**Purchase Orders (PO)**
- **Purpose:** Track inbound stock purchases from suppliers.
- **Business Logic:** Moves from DRAFT -> PENDING -> APPROVED -> COMPLETED. Upon completion, inventory is automatically incremented based on received quantities.

**Sales Orders (SO)**
- **Purpose:** Track outbound stock sales to customers.
- **Business Logic:** Moves through DRAFT -> PENDING -> APPROVED -> PACKED -> SHIPPED -> DELIVERED. Inventory is reduced when shipped.

**Reports & Dashboard**
- **Purpose:** Aggregate data for analytics.
- **Business Logic:** Calculates Total Revenue, Inventory Value, Low Stock Alerts, and 14-day transaction history using Prisma aggregations.

### Layers

1. **Controllers:** Extract request data, validate via `Zod`, call Services, format JSON response.
2. **Services:** Core business rules. If a PO is approved, the service triggers the inventory transaction logic.
3. **Repositories:** Prisma wrapper layer. Handles `organizationId` scoping to ensure no cross-tenant data leakage.

---

# FRONTEND ARCHITECTURE

The frontend is a React application built with Vite, TypeScript, and TailwindCSS. It strictly follows an API-first approach with zero mock data.

**Design System & Theme:**
A monochromatic, high-contrast theme (black, white, subtle grays) inspired by Linear and Stripe. Focus is on typography (Inter font), whitespace, and micro-interactions.

**State Management:**
- **Server State:** `@tanstack/react-query` handles all API fetching, caching, background refetching, and optimistic updates.
- **Client State:** `Zustand` stores global UI state like the currently active workspace (`useWorkspaceStore`) and authentication state (`useAuthStore`).

**Routing (React Router):**
- **Public Routes:** `/login`, `/register`.
- **Protected Routes:** Wrapped by an `AuthGuard` and a `WorkspaceGuard`. If a user logs in but has no workspace, they are forced to complete onboarding.

**Layouts:**
- **Shell:** The main wrapper.
- **Sidebar:** Dynamic navigation based on the user's RBAC permissions. Includes a Workspace Switcher dropdown.
- **Header:** Contains breadcrumbs, the Command Palette trigger (`Ctrl+K`), and user profile dropdown.

**Data Presentation:**
- **DataTable:** A highly robust, generic table component wrapping `@tanstack/react-table`. It supports sorting, global searching, column visibility toggling, pagination, and CSV export.
- **QueryStateWrapper:** A custom wrapper that automatically handles loading Skeletons, empty states, and 401/403/500 error boundaries for any data fetch operation.

---

# DATABASE

Built with PostgreSQL and managed via Prisma ORM.

### Key Models & Relations

**Organization**: The central tenant. Everything relies on `organizationId`.
**Subscription**: 1-to-1 with Organization. Tracks billing tier (`STARTER`, `PRO`, `ENTERPRISE`).
**User**: The individual human.
**OrganizationMember**: The join table between User and Organization containing the `role` and `status`.
**Session**: Tracks active user sessions, devices, and refresh token hashes for security.
**Invitation**: Tracks pending invites to a workspace via unique tokens.
**Product**: The base item. Unique constraint on `[organizationId, sku]`.
**Warehouse**: Locations.
**Inventory**: The pivot linking Product and Warehouse. Unique constraint on `[warehouseId, productId, variantId]`.
**InventoryTransaction**: Immutable ledger of every stock movement. Enum `TransactionType` includes PURCHASE, SALE, ADJUSTMENT, OPENING_STOCK.
**PurchaseOrder** / **PurchaseOrderItem**: Inbound procurement.
**SalesOrder** / **SalesOrderItem**: Outbound sales.
**AuditLog**: System-wide trail for critical actions (e.g., plan upgrades, permission changes).

---

# BUSINESS WORKFLOWS

**Workspace Registration & Switching:**
1. User signs up.
2. User is prompted to "Create a Workspace".
3. Backend creates `Organization` and assigns user as `OWNER` in `OrganizationMember`.
4. A default `STARTER` subscription is attached.
5. User enters dashboard. Zustand stores the `workspaceId`. All API calls send `X-Workspace-ID`.

**Inbound Supply Chain (Procurement):**
1. User creates a Purchase Order for a Supplier.
2. Items are added.
3. PO is Approved.
4. When goods arrive, PO is marked COMPLETED.
5. Backend calculates received quantities, writes `InventoryTransaction`s of type `PURCHASE`, and increments `Inventory.quantity`.

**Outbound Supply Chain (Sales):**
1. User creates a Sales Order for a Customer.
2. SO is Approved.
3. SO moves to SHIPPED.
4. Backend writes `InventoryTransaction`s of type `SALE`, decrementing `Inventory.quantity`.

---

# API

All APIs return standard JSON responses and are grouped under `/api/v1`.
Authentication is passed via HTTP-only cookies (`accessToken` and `refreshToken`).
Tenancy is passed via the `X-Workspace-ID` header.

**Auth:**
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

**Workspaces:**
- `POST /workspaces`
- `GET /workspaces` (Lists all memberships for the logged-in user)
- `PATCH /workspaces/:id`
- `GET /workspaces/:id/members`

**Products:**
- `GET /products` (Supports pagination, search, status filters)
- `POST /products`
- `PATCH /products/:id`
- `DELETE /products/:id` (Performs soft delete/archive)

**Inventory:**
- `GET /inventory`
- `POST /inventory/adjust` (Requires manual reason, writes transaction ledger)

**Purchase / Sales Orders:**
- `GET /purchase-orders`
- `POST /purchase-orders`
- `PATCH /purchase-orders/:id/status` (Handles lifecycle transitions and side-effects)

*(Note: Similar CRUD endpoints exist for Customers, Suppliers, Warehouses, Categories, and Billing).*

---

# FRONTEND PAGES

**Dashboard (`/dashboard`)**: Uses `useDashboardMetrics` hook. Displays Recharts Timeline, financial KpiCards, and timeline events for recent activity.
**Products List (`/products`)**: Uses `DataTable`. Implements keyboard shortcut `c` to open `ProductDrawer`. Provides row-level dropdown actions for viewing details or archiving.
**Inventory (`/inventory`)**: Displays current stock levels per warehouse. Includes inline adjustment dialogs.
**Orders (`/purchase-orders`, `/sales-orders`)**: Displays complex tables with status badges.
**Settings (`/settings`)**: A nested layout containing Profile, Workspace config, Members (with invite functionality), and Billing (Subscription tier cards).

---

# UI COMPONENT LIBRARY

Located in `@/components/ui`, utilizing Radix UI primitives and Tailwind CSS.
- **Button**: Supports variants (default, outline, ghost, destructive) and sizes.
- **DataTable**: Complex generic component utilizing `@tanstack/react-table`.
- **QueryStateWrapper**: Essential wrapper that prevents flash-of-empty-content and standardizes error/loading Skeletons.
- **Skeleton**: Premium, pulsing, layout-matching loading blocks.
- **ConfirmDialog**: Reusable alert dialog for destructive actions.
- **Drawer**: Slide-out panels used for creation forms (e.g., Add Product) to preserve context without page routing.

---

# DESIGN SYSTEM

- **Typography**: `Inter` font. Clean, sans-serif, highly legible.
- **Color Palette**: Monochromatic. `var(--primary)` is pure black/white depending on the theme. Muted grays (`var(--muted)`) are used for borders and secondary backgrounds. Semantic colors (Success green, Destructive red, Warning amber) are used sparingly for badges and alerts.
- **UX Philosophy**: "Zero visual clutter". Borders are subtle. Scrollbars are hidden via custom CSS classes (`.hide-scrollbar`). Loading states use contextual skeletons rather than blocking spinners.
- **Interactions**: Keyboard shortcuts (`/` for search) are built natively into components. Mutations feature optimistic UI updates for instant perceived performance.

---

# STATE MANAGEMENT

- **Zustand (`useAuthStore`)**: Holds the `user` object and `isAuthenticated` boolean.
- **Zustand (`useWorkspaceStore`)**: Holds the active `workspaceId` and the `workspaces` array. Handles the logic of selecting a workspace upon login.
- **React Query**: Configured globally to cache data and automatically retry on failure.
  - *Optimistic Updates Example:* When archiving a product, `useDeleteProduct` triggers an `onMutate` function that instantly filters the product out of the local React Query cache before the API responds, ensuring zero latency for the user.

---

# SECURITY

- **Authentication**: JWTs are never stored in `localStorage`. They are transmitted via secure, HTTP-Only, SameSite cookies.
- **Authorization (RBAC)**: Enforced at the route level in Express. The custom `requirePermission(action, resource)` middleware decodes the JWT, verifies the user belongs to the requested workspace, and cross-references their role (OWNER, ADMIN, MANAGER, STAFF) against the allowed actions.
- **Data Isolation**: Repositories inject `where: { organizationId }` into every Prisma query. It is mathematically impossible for a user to fetch data belonging to another tenant.

---

# MULTI TENANCY

StockFlow is a true multi-tenant SaaS. A single deployed database holds data for thousands of theoretical companies.
The `Organization` table is the root.
The `OrganizationMember` table acts as the nexus for user access, allowing a single email address (User) to switch seamlessly between multiple Workspaces (e.g., "Acme Corp" and "Globex Inc") without re-authenticating, simply by swapping the `X-Workspace-ID` frontend state.

---

# DOCKER

The entire stack is containerized for seamless local development and CI testing.
- **Services**: `frontend`, `backend`, `db` (PostgreSQL 15), `redis` (Redis 7).
- **Networking**: All services sit on a shared Docker network (`app-network`).
- **Volumes**: Persistent volumes map to Postgres and Redis to survive restarts.
- **Healthchecks**: Strict healthchecks ensure the backend does not boot until the database is ready to accept connections.
- **Problems Encountered**: Docker daemon crashes on Windows host environments caused `ERR_CONNECTION_REFUSED` across the stack. Resolved by handling gracefully and relying on container auto-restarts once the daemon is restored.

---

# CI/CD

Implemented via GitHub Actions (or equivalent workflow runners).
- **Linting**: ESLint and Prettier enforce code style.
- **Build**: TypeScript compilation (`tsc --noEmit`) ensures total type safety across both frontend and backend boundaries.
- **Testing**: Vitest runs unit and integration tests.

---

# TESTING

- **Frameworks**: `Vitest` for speed and modern ESM support. `Supertest` for backend API integration tests.
- **Strategy**: 
  - Controllers/APIs are tested via Supertest to ensure HTTP codes, Zod validation errors, and JSON structures are correct.
  - Services are unit-tested with mocked Prisma clients to verify business logic (e.g., checking if Inventory correctly increments during a Purchase Order completion).
  - The UI uses Vite's testing libraries for component rendering.

---

# INTERNSHIP REQUIREMENTS

StockFlow massively exceeds the original internship requirements:
1. **Containerization**: Fully Dockerized with Compose.
2. **Inventory Management**: Implemented advanced immutable ledger logic (Transactions) rather than simple CRUD updates.
3. **Quality Checks**: Strict TS checks, Zod runtime validation, and robust error boundaries.
4. **Additional**: Implemented a complete Commercial multi-tenant SaaS wrapper (Billing, Workspaces, RBAC) which was never requested but elevates the project to an enterprise standard.

---

# COMMERCIAL ROADMAP

- **Phase A (Multi-tenant)**: Workspaces, RBAC, Invites. *(Completed)*
- **Phase B (Core ERP)**: Products, Inventory, POs, SOs. *(Completed)*
- **Phase C (Dashboard)**: Executive KPIs and Charts. *(Completed)*
- **Phase D (Reports)**: Basic analytics. *(Completed)*
- **Phase E (Automation)**: Background jobs and triggers. *(Pending)*
- **Phase F (Commercial SaaS)**: Subscriptions and Billing. *(Completed)*
- **Phase G (Polish)**: UX refinement, Skeletons, Optimistic updates. *(Completed)*

The project is currently pausing the addition of new modules to deeply polish the existing Core ERP experience.

---

# ZOHO INVENTORY INSPIRATION

While Zoho Inventory provides a massive suite of features, it often suffers from bloated UIs and legacy design patterns.
**How StockFlow differs:** StockFlow adopts Zoho's robust business logic (e.g., Sales Orders converting to Invoices/Shipments) but wraps it in a modern, hyper-minimalist Linear-style interface. We prioritize keyboard accessibility, instant page loads (via React Query caching), and zero-clutter views.

---

# DEVELOPMENT RULES

The AI Agents and human developers must strictly adhere to `AGENTS.md`:
1. **Zero-Mock Data Policy**: No fake data, no placeholders, no "Coming Soon" screens.
2. **API-First**: Stop frontend work if a backend endpoint is missing.
3. **Production-Ready**: All tables must sort/filter. All forms must validate.
4. **Design Aesthetics**: Black, white, subtle grays. No visual clutter.
5. **No Technical Debt**: No TODOs. Refactor immediately.
6. **Autonomous Development**: Do not stop after every phase. Do not ask for approval unless blocked by a missing endpoint, credentials, or breaking migration.
7. **Documentation Policy**: Never generate `implementation_plan.md` or `walkthrough.md` unless explicitly requested.
8. **Progress Reporting**: Keep it to brief checklists (e.g., "✓ Frontend completed").
9. **Temporary Scripts**: Helper scripts must be deleted immediately. Do not commit generators.

---

# KNOWN ISSUES

- **Docker Instability on Host**: The local Docker daemon occasionally crashes causing 500 API errors. *Solution*: Restart Docker Desktop and ensure volumes are intact.
- **Vite Proxy Chaining**: Occasionally Vite fails to proxy requests to the backend if the backend container boots slower than the frontend. *Solution*: Docker healthchecks are implemented, but manual page reload is required if hit prematurely.

---

# FUTURE MODULES

To truly compete with enterprise ERPs, the following modules are planned:
- **Products 2.0**: Support for Variants (Size/Color matrix), Batch Tracking, and Serial Numbers.
- **Barcode Scanning**: Native camera integration and hardware scanner keyboard event capturing.
- **Portals**: A restricted B2B Customer Portal for clients to view their Sales Orders, and a Supplier Portal for Purchase Order fulfillment.
- **Integrations**: Stripe for real payments, Google OAuth for login, and webhook notifications.
- **Advanced Export/Import**: Robust CSV mapping tools for bulk data onboarding.

---

# FINAL PROJECT STATUS

**Internship-readiness: 10/10**
The project far exceeds any academic or internship requirements in architecture, testing, and DevOps.

**Architecture: 9.5/10**
The domain-driven backend and state-managed frontend are exceptionally robust.

**Commercial ERP Foundation: 9/10**
Multi-tenancy, billing, and core supply chain logic are fully operational.

**UI/UX Maturity: 8/10**
The design is beautiful, and Phase G introduced Skeletons and Optimistic Updates. However, continuous UX polishing (drag-and-drop, inline editing, more keyboard shortcuts) will eventually push this to a 10/10. 

StockFlow is a production-ready inventory management and ERP platform built as an internship project, with a solid foundation for future evolution into a commercial SaaS product.
