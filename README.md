# Core Platform Template

A production-ready fullstack platform template with authentication, user management, and multi-tenant support.

## Stack

- **Backend**: FastAPI + Pydantic v2 + MongoDB (Motor async)
- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS v4
- **Infrastructure**: Docker Compose + Nginx + Redis

## Features

- JWT Authentication with email verification
- Password reset with OTP
- Role-based access control (RBAC)
- Multi-tenant domain support
- User management (admin)
- Account settings (profile management)
- Responsive UI with dark mode support

## Quick Start

### 1. Initialize the Project

```bash
python init-project.py --name "My App" --slug my-app
```

This will:
- Create a `.env` file with generated secrets
- Update Docker service names to use your slug
- Configure the project with your app name

### 2. Start the Services

```bash
docker compose up --build
```

### 3. Access the Application

- **Frontend**: http://localhost:3700
- **API Docs**: http://localhost:3700/api/docs

### 4. Login

Use the admin credentials from your `.env` file:
- Email: `ADMIN_EMAIL`
- Password: `ADMIN_PASSWORD`

## Development

### Docker Commands

```bash
# Start all services
docker compose up -d

# Rebuild and start
docker compose up --build

# View logs
docker compose logs -f

# Stop services
docker compose down

# Stop and remove volumes
docker compose down -v
```

### Local Backend Development

```bash
cd backend
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8001
```

### Local Frontend Development

```bash
cd frontend
npm install
npm run dev  # Runs at http://localhost:5173
```

## Project Structure

```
├── backend/
│   └── app/
│       ├── api/           # Router registration
│       ├── auth/          # JWT utilities
│       ├── core/          # Config, database
│       ├── db/            # DB connection, seeding
│       ├── modules/       # Feature modules
│       │   ├── auth/      # Authentication
│       │   ├── admin/     # User management
│       │   ├── account/   # Profile settings
│       │   ├── domains/   # Multi-tenant
│       │   └── health/    # Health check
│       ├── odm/           # MongoDB models
│       └── services/      # Shared logic
├── frontend/
│   └── src/
│       ├── components/    # UI components
│       ├── contexts/      # React contexts
│       ├── hooks/         # Custom hooks
│       ├── lib/           # Utilities, API client
│       ├── pages/         # Route pages
│       ├── stores/        # Zustand stores
│       └── types/         # TypeScript types
├── docker-compose.yml
├── .env.example
├── .cursorrules           # AI coding rules
├── ai-guidelines.md       # Development guide
└── init-project.py        # Project setup script
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description | Required |
|----------|-------------|----------|
| `APP_NAME` | Application display name | Yes |
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret for JWT tokens | Yes |
| `ADMIN_EMAIL` | Initial admin email | Yes |
| `ADMIN_PASSWORD` | Initial admin password | Yes |
| `CORS_ORIGINS` | Allowed CORS origins | No |
| `REDIS_URL` | Redis connection URL | No |

## Adding New Features

### Backend Module

1. Create `backend/app/modules/<name>/`
2. Add `router.py`, `schemas.py`, `service.py`
3. Export router in `modules/__init__.py`
4. Register in `api/api.py`

### Frontend Page

1. Create `frontend/src/pages/<Name>.tsx`
2. Add route in `App.tsx`
3. Update `Sidebar.tsx` navigation

See `ai-guidelines.md` for detailed development guidelines.

## User Roles

| Role | Permissions |
|------|-------------|
| `viewer` | Read-only access |
| `editor` | Read and write access |
| `admin` | Manage users in their domain |
| `super_admin` | Full system access |

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Register
- `POST /api/auth/verify-otp` - Verify email
- `POST /api/auth/forgot-password` - Request reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Current user

### Account
- `GET /api/account` - Get profile
- `PUT /api/account` - Update profile
- `POST /api/account/change-password` - Change password

### Admin (super_admin only)
- `GET /api/admin/stats` - Dashboard stats
- `GET /api/admin/users` - List users
- `POST /api/admin/users` - Create user
- `GET /api/admin/users/{uuid}` - Get user
- `PUT /api/admin/users/{uuid}` - Update user
- `DELETE /api/admin/users/{uuid}` - Delete user

### Domains
- `GET /api/domains` - List domains
- `POST /api/domains` - Create domain
- `PUT /api/domains/{uuid}` - Update domain
- `DELETE /api/domains/{uuid}` - Delete domain

### Health
- `GET /api/health` - Health check

## License

MIT
