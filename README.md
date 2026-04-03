# <img src="https://img.icons8.com/fluency/48/000000/lightning-bolt.png" width="32" /> FinFlow — Enterprise Financial Ecosystem

---

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)](https://jwt.io/)
[![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)

### *Precision Finance. Real-time Analytics. Bulletproof Security.*

FinFlow is a high-performance, full-stack financial management platform designed for modern business intelligence. It bridges the gap between complex financial data and actionable insights through a secure, role-based ecosystem.


---

## 📸 Visual Showcase

### 1. Unified Finance Dashboard
![Dashboard Overview](./screenshot/Screenshot_3-4-2026_212122_localhost.jpeg)
*Real-time intelligence hub featuring multi-currency KPI tracking, 6-month trend analysis, and comprehensive expense categorization.*

### 2. Secure Authentication Portal
![Login Interface](./screenshot/Screenshot_3-4-2026_21217_localhost.jpeg)
*Modern, high-security gateway with role-based access control (RBAC) and streamlined auth flows.*

### 3. Granular Transaction Management
![Transactions](./screenshot/Screenshot_3-4-2026_212420_localhost.jpeg)
*Complete CRUD ecosystem for financial records with advanced filtering, search, and intuitive data entry modals.*

### 4. Interactive API Documentation (Swagger)
![API Docs](./screenshot/Screenshot_3-4-2026_213044_localhost.jpeg)
*Live OpenAPI 3.0 documentation providing a developer-first experience for system integration.*


---

## 💎 The FinFlow Core Pillars

| 🔐 Security First | 📊 Visual Intelligence | 🛠️ Engineering Depth |
| :--- | :--- | :--- |
| JWT-powered Auth, bcrypt hashing, and full RBAC. Every action is tracked in a secure **Audit Trail**. | Dynamic data visualization using **Recharts** with real-time KPI tracking and trend analysis. | Modular architecture with **OpenAPI 3.0** docs, soft-deletes, and input validation. |

---

## 🏗️ System Architecture

Custom-built for scalability and clarity:

```mermaid
graph TD
    subgraph "Frontend (React 18 + Context API)"
        UI["🎨 UI Layer (Lucide / Syne Font)"]
        RC["📉 Recharts / Analytics"]
        AC["📡 Axios API Client"]
        AuthContext["🔑 Auth State / JWT"]
    end

    subgraph "Backend (Node.js + Express)"
        Route["🛣️ Express Router"]
        Midd["🛡️ Middleware: JWT/Audit/Validation"]
        Ctrl["⚙️ Business Logic (Controllers)"]
        DB_Wrapper["💾 sql.js / SQLite Engine"]
        Swagger["📚 Swagger UI (OpenAPI 3.0)"]
    end

    subgraph "Data Persistence"
        DB[("🗄️ SQLite Database")]
        Seed["🌱 Production Seeding"]
    end

    UI --> AC
    RC --> AC
    AC --> AuthContext
    AuthContext -- bearer token --> Route
    Route --> Midd
    Midd --> Ctrl
    Ctrl --> DB_Wrapper
    DB_Wrapper <--> DB
    Seed --> DB
    Route --> Swagger
```

---

## ✨ Enterprise-Grade Features

- **🔔 Smart Notifications**: Real-time badge updates every 30s with broadcast capability for admins.
- **📄 High-Performance Pagination**: Server-side pagination for transactions, users, and logs to ensure O(1) front-end performance.
- **🎯 Precision Search**: Full-text search across descriptions and categories with multi-layered filtering.
- **🛡️ Audit-Ready Logging**: Captures `ACTION`, `RESOURCE`, `USER`, and `IP` for every mutating state change.
- **📱 Responsive Excellence**: A sleek, collapsible sidebar and dynamic navigation that adapts to user permissions.
- **📊 Admin Control Center**: Deep-dive user statistics and role management dashboards.

---

## 🚀 Deployment & Quick Start

### Prerequisites
- **Node.js** v16.0.0+
- **npm** v8.0.0+

### 1. Installation
```bash
# Clone and install dependencies
cd backend && npm install
cd ../frontend && npm install
```

### 2. Database Initialization
```bash
cd backend
npm run seed  # Generates 5 users, 299 transactions, and 12 categories
```

### 3. Execution
| Environment | Command | Port |
| :--- | :--- | :--- |
| **Backend** | `npm run dev` | `3001` |
| **Frontend** | `npm start` | `3000` |

### 4. Direct Access
- **Dashboard**: [http://localhost:3000](http://localhost:3000)
- **API Documentation**: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)
- **Health Check**: [http://localhost:3001/api/health](http://localhost:3001/api/health)

---

## 🔑 Access Management & Test Roles

| Role | Credentials | Permissions |
| :--- | :--- | :--- |
| **Admin** | `admin@finflow.com` / `admin123` | **Full Authority**: Global view, user mgmt, audit logs, broadcasting. |
| **Analyst** | `sarah@finflow.com` / `password123` | **Power User**: Create/Edit transactions, deep analytics access. |
| **Viewer** | `john@finflow.com` / `password123` | **Audit Only**: Read-only access to own financial records. |

---

## 📡 API Ecosystem (OpenAPI 3.0)

Full interactive documentation is available via Swagger UI. Below is the endpoint summary:

### 🔐 Authentication
`POST /api/auth/register` (Public) | `POST /api/auth/login` (Public) | `GET /api/auth/me` | `PUT /api/auth/profile` | `PUT /api/auth/password`

### 📈 Intelligence & Data
- **Dashboard**: `GET /api/dashboard/summary` (Analytics, KPIs, Activity)
- **Analytics**: `GET /api/dashboard/analytics` (Analyst+)
- **Transactions**: Full CRUD at `/api/transactions` (Admin: Global | Others: Self)
  - *Parameters: type, category, date range, search, pagination.*

### 🛡️ Administration (Admin Only)
- **Users**: List, stats, update, delete at `/api/users`.
- **Engagement**: `POST /api/notifications/broadcast` to specific roles.
- **Compliance**: `GET /api/audit-logs` for system-wide transparency.
- **Organization**: `POST /api/categories` to manage financial taxonomy.

---

## 🛠️ Technical Stack Deep-Dive

### Backend Architecture
- **Engine**: Node.js & Express.js
- **Database**: `sql.js` (Pure-JS SQLite) for zero-dependency environment setup.
- **Security**: `jsonwebtoken` (JWT), `bcryptjs` (Hashing), `helmet` (Security headers).
- **Quality**: `express-validator` for robust server-side schema verification.
- **Performance**: `compression` and `morgan` logging.

### Frontend Experience
- **Framework**: React 18 with high-performance Context API state management.
- **Visualization**: `Recharts` for pixel-perfect SVG data rendering.
- **Styling**: Modern CSS with **Syne** and **DM Sans** typography.
- **Assets**: `Lucide React` for a consistent, premium iconography system.

---

## 🔒 Security Matrix (RBAC)

| Feature | Viewer | Analyst | Admin |
| :--- | :---: | :---: | :---: |
| Global Dashboards | ✅ | ✅ | ✅ |
| Personal Records | ✅ | ✅ | ✅ |
| Transaction Creation | ❌ | ✅ | ✅ |
| Modification | ❌ | ✅ (Own) | ✅ (All) |
| Hard Deletion | ❌ | ❌ | ✅ (Soft) |
| System Audits | ❌ | ❌ | ✅ |
| User Governance | ❌ | ❌ | ✅ |

---

## 🎨 Technical Decisions and Trade-offs

### 💾 Zero-Dependency SQLite Engine (sql.js)
I opted for `sql.js` (Pure-JS SQLite) over native drivers like `better-sqlite3`.
- **Decision**: Ensures a lightning-fast "clone-and-run" experience across any OS without requiring C++ build tools.
- **Trade-off**: While native drivers offer slightly higher raw throughput, `sql.js` provides superior **portability** for cloud environments like Render, which is critical for a smooth evaluation process.

### 🛡️ Backend-Driven RBAC (Security Architecture)
Security is implemented at the **API Middleware level**, not just the UI.
- **Decision**: Every request is validated against a JWT role before reaching the controller.
- **Trade-off**: This adds a layer of complexity to the route definitions but ensures **bulletproof data integrity**. Even a direct API call from Postman cannot bypass the permission hierarchy.

### 📜 Strategic Soft-Deletion & Audit Trails
- **Decision**: Transactions use `is_deleted` flags rather than hard-deletes.
- **Reasoning**: In financial systems, data history is vital. This approach preserves the **Audit Trail** (tracking WHOM, WHEN, and HOW) while keeping the UI clean, matching enterprise-grade compliance standards.

---

## 📝 Additional Context

### 🚀 Enterprise Observability
Beyond the core requirements, I implemented a full **Audit Logging system** that captures every mutating action (Create/Update/Delete) with user metadata and IP tracking. This demonstrates a focus on system transparency and accountability.

### 📚 Developer-First API Ecosystem
I integrated a live **OpenAPI 3.0 (Swagger)** dashboard. By providing an interactive UI for testing every endpoint, I’ve ensured the project is self-documenting and ready for team collaboration from day one.

### 🌍 Cloud-Optimized Deployment
The project is fully container-ready and deployed across **Render** and **Vercel**. I implemented dynamic **CORS policies** and environment-aware **API routing** to ensure the production build is secure and production-ready.

---

**Built with ❤️ for High-Stakes Financial Management.**
