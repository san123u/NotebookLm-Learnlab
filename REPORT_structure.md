# Core Platform Template - Transformation Report

## Overview

**Original Project:** IHC XAILON Financial Analytics Platform
**Transformed To:** Core Platform Template (Starter Kit)
**Date:** January 19, 2026
**Purpose:** Create a minimal, reusable fullstack template for AI-assisted app generation

---

## Quick Start

```bash
# 1. Clone and navigate to project
cd starter-kit

# 2. Copy environment file
cp .env.example .env

# 3. Start all services
docker compose up -d --build

# 4. Access the application
# Frontend: http://localhost:3700
# API Health: http://localhost:3700/api/health/

# 5. Default Admin Login
# Email: admin@example.com
# Password: YourSecurePassword123!
```

---

## Project Structure (After Transformation)

```
starter-kit/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI application entry
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── api.py                 # Router registration
│   │   │   └── deps.py                # Dependencies (get_db, get_current_user)
│   │   ├── auth/
│   │   │   ├── __init__.py
│   │   │   ├── jwt.py                 # JWT token handling
│   │   │   └── passwords.py           # Password hashing (bcrypt)
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py              # Pydantic settings
│   │   │   ├── database.py            # MongoDB connection (Motor)
│   │   │   └── exceptions.py          # Custom exceptions
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   └── seeder.py              # Database seeding (admin user)
│   │   ├── modules/                   # Domain modules
│   │   │   ├── __init__.py
│   │   │   ├── auth/                  # Authentication (login, signup, OTP)
│   │   │   ├── account/               # User profile management
│   │   │   ├── admin/                 # Admin user management
│   │   │   ├── domains/               # Multi-tenant domain management
│   │   │   └── health/                # Health check endpoints
│   │   ├── odm/                       # MongoDB ODM layer
│   │   │   ├── __init__.py
│   │   │   ├── base.py                # Extended Document base
│   │   │   ├── document.py            # Core Document class
│   │   │   ├── user.py                # UserDocument, GroupDocument
│   │   │   └── domain.py              # DomainDocument
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── rbac.py                # Role-based access control
│   │   │   └── email.py               # Email service (stub)
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── email_validation.py    # Email format/blocklist validation
│   │       ├── blocked_domains.py     # Blocked email domains list
│   │       └── rate_limit.py          # Rate limiting utility
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── main.tsx                   # React entry point
│   │   ├── App.tsx                    # Main app with routing
│   │   ├── index.css                  # Tailwind imports
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── RoleGuard.tsx      # Route protection
│   │   │   ├── common/
│   │   │   │   ├── Avatar.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── IconButton.tsx
│   │   │   │   ├── Spinner.tsx
│   │   │   │   └── Tooltip.tsx
│   │   │   ├── layout/
│   │   │   │   ├── AdminHeader.tsx
│   │   │   │   ├── AdminLayout.tsx
│   │   │   │   ├── AdminSidebar.tsx
│   │   │   │   ├── AuthLayout.tsx
│   │   │   │   ├── DashboardHeader.tsx
│   │   │   │   ├── Layout.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   └── ui/
│   │   │       ├── Button.tsx
│   │   │       ├── Card.tsx
│   │   │       ├── DataTable.tsx
│   │   │       └── ...
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx        # Authentication state
│   │   │   └── ThemeContext.tsx       # Theme management
│   │   ├── lib/
│   │   │   ├── api.ts                 # Axios API client
│   │   │   ├── routes.ts              # Route definitions
│   │   │   ├── utils.ts               # Utility functions
│   │   │   └── validation.ts          # Form validation
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── SignupPage.tsx
│   │   │   │   ├── ForgotPasswordPage.tsx
│   │   │   │   ├── ResetPasswordPage.tsx
│   │   │   │   └── VerifyOtpPage.tsx
│   │   │   ├── admin/
│   │   │   │   ├── DashboardAdmin.tsx
│   │   │   │   ├── Users.tsx
│   │   │   │   ├── CreateUser.tsx
│   │   │   │   ├── EditUser.tsx
│   │   │   │   └── Domains.tsx
│   │   │   ├── AccountSettings.tsx
│   │   │   ├── DashboardV2.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   └── NotFound.tsx
│   │   └── types/
│   │       └── index.ts               # TypeScript interfaces
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── .env.example
├── .cursorrules                       # AI coding guardrails
├── ai-guidelines.md                   # Development guidelines
├── init-project.py                    # Project initialization script
├── README.md                          # Setup instructions
├── CLAUDE.md                          # Claude Code instructions
└── REPORT_structure.md                # This file
```

---

## What Was Kept (Core Features)

### Backend Modules

| Module | Path | Purpose |
|--------|------|---------|
| auth | `modules/auth/` | JWT login, signup, OTP verification, password reset |
| account | `modules/account/` | User profile CRUD, password change |
| admin | `modules/admin/` | Super admin user management, stats |
| domains | `modules/domains/` | Multi-tenant domain CRUD |
| health | `modules/health/` | API health checks, DB connectivity |

### Backend Services

| Service | Path | Purpose |
|---------|------|---------|
| RBAC | `services/rbac.py` | Role-based access control |
| Email | `services/email.py` | OTP email sending (stub) |

### Frontend Pages

| Page | Path | Access |
|------|------|--------|
| Login | `/login` | Public |
| Signup | `/signup` | Public |
| Forgot Password | `/forgot-password` | Public |
| Reset Password | `/reset-password` | Public |
| Verify OTP | `/verify-otp` | Public |
| Dashboard | `/dashboard` | Authenticated |
| Account Settings | `/dashboard/account` | Authenticated |
| Admin Dashboard | `/admin` | Super Admin |
| User Management | `/admin/users` | Super Admin |
| Create User | `/admin/users/create` | Super Admin |
| Edit User | `/admin/users/:id` | Super Admin |
| Domain Management | `/admin/domains` | Super Admin |

---

## What Was Removed

### Backend Modules Removed

| Module | Original Purpose |
|--------|------------------|
| chat/ | AI chat with RAG |
| agents/ | Digital persona management |
| entities/ | Entity hierarchy management |
| companies/ | Company data management |
| financial_data/ | Balance sheet/income statement |
| financials/ | Financial periods/metrics |
| hierarchy/ | Entity tree structure |
| comparison/ | Multi-entity comparison |
| forecast/ | Forecasting module |
| team/ | Team member management |
| files/ | S3 file storage |
| jobs/ | Background job queue |
| reference/ | Reference data tables |
| groups/ | Entity groups |
| speech/ | Speech-to-text |
| config/ | App configuration |
| company_metadata/ | Company metadata |
| audited_statements/ | Audited financial statements |
| supplementary/ | Supplementary data |
| hierarchy_coverage/ | Coverage tracking |
| entity_upload/ | Entity data upload |
| consolidated_upload/ | Consolidated data upload |
| report_book/ | Report generation |
| storage_admin/ | Storage management |
| myprofile/ | Employee profiles |

### Backend Services Removed

| Service | Original Purpose |
|---------|------------------|
| agents/ | AI agent services |
| rag_integration.py | RAG pipeline |
| hybrid_search.py | Vector + keyword search |
| file_storage.py | S3 file operations |
| document_context.py | Document processing |
| intent_classifier.py | Query intent classification |
| memory_embeddings.py | Vector embeddings |
| company_rbac.py | Company-level RBAC |
| company_epm_resolver.py | EPM code resolution |
| parsers/ | Document parsers |
| token_service.py | Token counting |
| unified_financial_parser.py | Financial data parsing |
| report_book_parser.py | Report parsing |
| consolidated_parser.py | Consolidated data parsing |
| agents_sdk/ | OpenAI agents SDK |
| agent_registry.py | Agent management |

### Backend Workers Removed

| Worker | Original Purpose |
|--------|------------------|
| ocr_worker.py | OCR processing |
| financial_data_worker.py | Financial data processing |
| job_worker.py | Background job execution |
| chat_cleanup.py | Chat history cleanup |

### ODM Models Removed

| Model | Original Purpose |
|-------|------------------|
| company.py | Company documents |
| entity.py | Entity documents |
| financial.py | Financial data |
| chat.py | Chat messages/threads |
| agent.py | Agent documents |
| memory.py | Memory/embeddings |
| file_store.py | File records |
| processing_job.py | Job queue |
| forecast.py | Forecasts |
| reference.py | Reference data |
| templates/ | Financial templates |
| links/ | Company-entity links |
| audit/ | Change history |
| misc/ | Enums, processing |

### Frontend Pages Removed

| Page | Original Purpose |
|------|------------------|
| Chat.tsx | AI chat interface |
| Space.tsx | Chat spaces |
| Companies.tsx | Company list |
| CompanyDetail.tsx | Company details |
| CompanyTree.tsx | Hierarchy view |
| Entities.tsx | Entity list |
| EntityProfile.tsx | Entity details |
| Financials.tsx | Financial data |
| FinancialData.tsx | Data entry |
| Forecasts.tsx | Forecast view |
| AuditedStatements.tsx | Audited statements |
| Groups.tsx | Entity groups |
| GroupDetail.tsx | Group details |
| TeamManagement.tsx | Team management |
| HierarchyCoverage.tsx | Coverage tracking |
| Comparison.tsx | Entity comparison |
| UploadData.tsx | Data upload |
| ConsolidatedUpload.tsx | Consolidated upload |
| CompanyDataUpload.tsx | Company upload |
| EmployeeProfilePage.tsx | Employee profiles |
| MyProfilePage.tsx | My profile |
| ReferenceData.tsx | Reference data |

### Docker Services Removed

| Service | Original Purpose |
|---------|------------------|
| ihc-ocr-service | PaddleOCR processing |
| ihc-dashboard-qdrant | Vector database |
| ihc-rag-service | RAG service |

---

## Files Created During Transformation

| File | Purpose |
|------|---------|
| `.cursorrules` | AI coding guardrails |
| `ai-guidelines.md` | Development guidelines |
| `init-project.py` | Project initialization script |
| `README.md` | Setup instructions |
| `backend/app/utils/blocked_domains.py` | Email blocklist |
| `backend/app/services/email.py` | Email service stub |

---

## Files Modified During Transformation

| File | Changes |
|------|---------|
| `docker-compose.yml` | Renamed services to app-*, removed OCR/RAG/Qdrant |
| `.env.example` | Simplified to core variables |
| `backend/app/odm/__init__.py` | Removed deleted module imports |
| `backend/app/modules/__init__.py` | Kept only core modules |
| `backend/app/modules/admin/__init__.py` | Removed reference_data import |
| `backend/app/utils/email_validation.py` | Simplified, removed config cache |
| `backend/pyproject.toml` | Renamed to core-platform |
| `backend/app/__init__.py` | Updated comment |
| `backend/app/modules/health/router.py` | Updated service name |
| `frontend/index.html` | Changed title to "Core Platform" |
| `frontend/src/components/auth/RoleGuard.tsx` | Simplified to isSuperAdmin only |
| `frontend/src/components/common/Avatar.tsx` | Removed agent type |
| `frontend/src/pages/AccountSettings.tsx` | Simplified to Profile/Security tabs |
| `frontend/src/pages/admin/Users.tsx` | Removed company access |
| `frontend/src/pages/admin/EditUser.tsx` | Simplified user editing |
| `frontend/src/pages/admin/CreateUser.tsx` | Simplified user creation |
| `frontend/src/pages/admin/DashboardAdmin.tsx` | Simplified dashboard |
| `frontend/src/pages/admin/Domains.tsx` | Simplified domain management |
| `frontend/src/pages/auth/LoginPage.tsx` | Simplified to password-only |
| `frontend/src/pages/auth/index.ts` | Removed AcceptInvitePage |
| `frontend/src/types/index.ts` | Added missing properties |
| `frontend/src/lib/api.ts` | Added alias functions |

---

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health/` | Health check |
| GET | `/api/health/db` | Database connectivity |
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/signup` | Create new account |
| POST | `/api/auth/verify-otp` | Verify email OTP |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with OTP |
| POST | `/api/auth/resend-otp` | Resend OTP |

### Authenticated Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/account/me` | Get current user profile |
| PUT | `/api/account/me` | Update profile |
| POST | `/api/account/change-password` | Change password |

### Admin Endpoints (Super Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/users/{id}` | Get user by ID |
| POST | `/api/admin/users` | Create user |
| PUT | `/api/admin/users/{id}` | Update user |
| DELETE | `/api/admin/users/{id}` | Suspend user |
| GET | `/api/admin/stats` | Get admin statistics |
| GET | `/api/domains/` | List domains |
| POST | `/api/domains/` | Create domain |
| PUT | `/api/domains/{id}` | Update domain |
| DELETE | `/api/domains/{id}` | Delete domain |

---

## Environment Variables

```bash
# Application
APP_NAME="Core Platform"

# MongoDB
MONGO_USER=app_admin
MONGO_PASSWORD=app_secure_pass
MONGO_DB=app_database
MONGO_URI=mongodb://app_admin:app_secure_pass@app-mongo:27017/app_database?authSource=admin

# JWT Authentication
JWT_SECRET=<generate with: openssl rand -hex 32>
JWT_ALGORITHM=HS256
JWT_EXPIRE_DAYS=7

# Admin User (seeded on startup)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=YourSecurePassword123!

# CORS
CORS_ORIGINS=["http://localhost:3700","http://localhost:5173"]

# Redis
REDIS_URL=redis://app-redis:6379

# Frontend URL
APP_BASE_URL=http://localhost:3700

# Email (optional - logs by default)
EMAIL_ENABLED=false
EMAIL_FROM=noreply@example.com
EMAIL_FROM_NAME=Core Platform

# Debug
DEBUG=false
```

---

## Docker Services

| Service | Image | Internal Port | External Port | Purpose |
|---------|-------|---------------|---------------|---------|
| app-mongo | mongo:7.0.14 | 27017 | 27100 | MongoDB database |
| app-redis | redis:7.4-alpine | 6379 | - | Cache/sessions |
| app-backend | starter-kit-app-backend | 8000 | - | FastAPI API |
| app-frontend | starter-kit-app-frontend | 80 | 3700 | Nginx + React |

---

## User Roles

| Role | Description | Access |
|------|-------------|--------|
| `super_admin` | System administrator | Full access to all features |
| `admin` | Admin user | User management (future) |
| `editor` | Content editor | Edit access (future) |
| `viewer` | Read-only user | View access (future) |
| `null` | Regular user | Basic authenticated access |

---

## Technology Stack

### Backend
- **Framework:** FastAPI 0.115+
- **Database:** MongoDB 7.0 (Motor async driver)
- **ODM:** Custom Mongoose-style Document classes
- **Auth:** JWT (python-jose) + bcrypt
- **Validation:** Pydantic v2
- **Logging:** Loguru

### Frontend
- **Framework:** React 19 + TypeScript
- **Build:** Vite
- **Styling:** TailwindCSS v4
- **State:** Zustand
- **Data Fetching:** TanStack Query
- **HTTP Client:** Axios
- **Icons:** Lucide React

### Infrastructure
- **Containerization:** Docker + Docker Compose
- **Reverse Proxy:** Nginx
- **Cache:** Redis 7.4

---

## Commands Reference

```bash
# Start all services
docker compose up -d

# Rebuild and start
docker compose up -d --build

# View logs
docker compose logs -f app-backend
docker compose logs -f app-frontend

# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v

# Rebuild specific service
docker compose build app-backend
docker compose build app-frontend

# Access MongoDB shell
docker exec -it app-mongo mongosh -u app_admin -p app_secure_pass --authenticationDatabase admin

# Local development (backend)
cd backend
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8001

# Local development (frontend)
cd frontend
npm install
npm run dev
```

---

## Next Steps / Customization

1. **Rename Project:** Run `python init-project.py` to customize names
2. **Add Email Provider:** Implement `services/email.py` with SendGrid/Mailgun
3. **Add New Modules:** Create in `modules/` following existing patterns
4. **Add New Pages:** Create in `pages/` and register routes in `App.tsx`
5. **Customize Blocklist:** Edit `utils/blocked_domains.py`
6. **Add Database Indexes:** Add to `db/seeder.py`
7. **Configure Redis Caching:** Add caching layer as needed

---

## Known Limitations

1. **Email Service:** Currently logs emails instead of sending (stub implementation)
2. **OTP Verification:** No actual email sent; check backend logs for OTP
3. **File Uploads:** S3/file storage removed; add if needed
4. **Background Jobs:** Worker system removed; add Celery/ARQ if needed
5. **Vector Search:** RAG/embeddings removed; add Qdrant if needed

---

## Support Files

| File | Purpose |
|------|---------|
| `.cursorrules` | Rules for AI coding assistants |
| `ai-guidelines.md` | Detailed development guidelines |
| `CLAUDE.md` | Instructions for Claude Code |
| `README.md` | Quick start guide |
| `init-project.py` | Project renaming script |

---

*Generated: January 19, 2026*
