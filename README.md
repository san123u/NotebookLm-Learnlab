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
- Modern collapsible sidebar with localStorage persistence
- Design system with consistent UI components

## Creating a new app

```bash
./init-project.sh
docker compose up --build
```

The initialization script will interactively ask you:
- **App Name** - Display name for your app
- **App Slug** - URL/Docker-friendly identifier (e.g., `my-app`)
- **Primary Color** - Tailwind color name or hex code
- **App Description** - One-line description
- **App Type** - SaaS Dashboard, Marketplace, Internal Tool, AI Chat App, or Other

After initialization:
- `system.config.json` contains your app configuration
- Docker services are renamed to `<slug>-backend`, `<slug>-frontend`, etc.
- Design tokens use your chosen primary color
- Landing page displays your app name and description

## System Configuration

The `system.config.json` file controls:

```json
{
  "app": {
    "name": "My App",
    "slug": "my-app",
    "description": "My awesome app",
    "type": "saas-dashboard"
  },
  "theme": {
    "primaryColor": "indigo"
  },
  "layout": {
    "sidebarCollapsedByDefault": false
  }
}
```

Access this configuration in React using the `useSystemConfig()` hook:

```tsx
import { useSystemConfig } from './hooks/useSystemConfig';

function MyComponent() {
  const { config } = useSystemConfig();
  return <h1>{config.app.name}</h1>;
}
```

## Layout System

The application uses a modern layout with:

- **AppShell** - Main layout wrapper with sidebar, header, and content area
- **Sidebar** - Collapsible navigation (state persisted in localStorage)
- **HeaderBar** - Top navigation bar with breadcrumbs and user menu

The sidebar collapsed state is automatically saved to `localStorage` and restored on page load.

## Quick Start

### 1. Initialize the Project

```bash
./init-project.sh
```

Follow the interactive prompts to configure your app.

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
└── init-project.sh        # Project setup script
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

## Design System

The project includes a design system for UI consistency:

### UI Components (`frontend/src/components/ui/`)
- `Button` - Primary, secondary, outline, and ghost variants
- `Input` - Text inputs with label, error, and helper text support
- `Select` - Dropdown select inputs
- `Checkbox`, `Radio`, `Switch` - Form controls
- `Card` - Content containers with optional headers
- `Modal` - Dialog overlays
- `Tabs` - Tabbed navigation
- `Badge` - Status indicators
- `Alert` - Notification messages
- `Tooltip` - Hover information
- `Spinner` - Loading indicators
- `OtpInput` - OTP/verification code input

### Design Tokens (`frontend/src/design-system/`)
- `design-tokens.css` - CSS custom properties for colors, spacing, etc.
- `design-system.md` - Component usage documentation

### Usage Rules
- Always use design system components instead of raw HTML elements
- Use CSS variables like `var(--btn-primary-bg)` for colors
- Never hardcode color values - use design tokens
- Refer to `design-system.md` for component examples
- Visit `/design-system` route to see all components in action

## Validation

Form validation is consistent between frontend and backend:

### Frontend (TypeScript)
Located in `frontend/src/lib/validation.ts`:

```typescript
import { validateLoginForm, validateSignupForm, validatePassword } from './lib/validation';

// Validate login form
const result = validateLoginForm({ email, password });
if (!result.isValid) {
  console.log(result.errors);
}

// Validate password with detailed checks
const pwResult = validatePassword(password);
console.log(pwResult.checks); // { minLength, hasUppercase, hasLowercase, hasNumber, hasSymbol }
```

### Backend (Pydantic)
Located in `backend/app/modules/auth/schemas.py`:

```python
from pydantic import BaseModel, EmailStr, Field

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
```

### Validation Rules
- Email: Valid email format required
- Password: Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character

## Verification

Run the verification script to check project configuration:

```bash
./verify-project.sh
```

The script checks:
- Configuration files exist (`system.config.json`)
- Docker services are properly named
- Design system compliance (no raw HTML form elements)
- Required guardrail files exist
- YAML validity

Fix any warnings or errors before deployment.

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
