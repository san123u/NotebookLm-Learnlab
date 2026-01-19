# AI Development Guidelines

## Project Architecture

This is a fullstack platform template with the following stack:

### Backend (FastAPI + Python)
- **Framework**: FastAPI with Pydantic v2
- **Database**: MongoDB with Motor async driver
- **Authentication**: JWT with bcrypt password hashing
- **Structure**: Domain-driven modular architecture

### Frontend (React + TypeScript)
- **Framework**: React 19 with Vite
- **Styling**: TailwindCSS v4
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router v6

## Directory Structure

```
backend/
├── app/
│   ├── api/           # Router registration and dependencies
│   ├── auth/          # JWT and password utilities
│   ├── core/          # Config and database setup
│   ├── db/            # Database connection and seeding
│   ├── modules/       # Feature modules (router, service, schemas)
│   ├── odm/           # MongoDB document models
│   └── services/      # Shared business logic

frontend/
├── src/
│   ├── components/    # Reusable UI components
│   ├── contexts/      # React contexts (Auth, Theme)
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities and API client
│   ├── pages/         # Route page components
│   ├── stores/        # Zustand stores
│   └── types/         # TypeScript interfaces
```

## Development Guidelines

### Adding a New Backend Module

1. Create a new directory in `backend/app/modules/<module_name>/`
2. Add the following files:
   - `__init__.py` - Module exports
   - `router.py` - FastAPI router with endpoints
   - `schemas.py` - Pydantic request/response models
   - `service.py` - Business logic functions
3. Export the router in `backend/app/modules/__init__.py`
4. Register the router in `backend/app/api/api.py`

### Adding a New Frontend Page

1. Create the page component in `frontend/src/pages/<PageName>.tsx`
2. Add the route in `frontend/src/App.tsx`
3. If protected, wrap with `AuthGuard` component
4. Update navigation in `frontend/src/components/layout/Sidebar.tsx` if needed

### Adding a New UI Component

1. Create the component in `frontend/src/components/ui/<ComponentName>.tsx`
2. Export from the component file
3. Use Tailwind utility classes for styling
4. Follow existing component patterns for consistency

## Code Standards

### Backend
- Use async/await for all database operations
- Validate all inputs with Pydantic schemas
- Use dependency injection via FastAPI's `Depends()`
- Handle errors with appropriate HTTP status codes
- Use type hints for all function parameters and returns

### Frontend
- Use TypeScript strict mode
- Define interfaces for all props and API responses
- Use functional components with hooks
- Prefer composition over inheritance
- Keep components small and focused

### Security
- Never bypass authentication checks
- Always validate user permissions via RBAC
- Sanitize all user inputs
- Never log sensitive data (passwords, tokens)
- Use parameterized queries for database operations

## Docker Development

- Run `docker compose up -d` to start all services
- Run `docker compose up --build` to rebuild after code changes
- Access frontend at http://localhost:3700
- MongoDB is exposed at localhost:27100
- Use `docker compose logs -f <service>` to view logs

## Environment Variables

Required variables in `.env`:
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `ADMIN_EMAIL` - Initial admin user email
- `ADMIN_PASSWORD` - Initial admin user password

See `.env.example` for all available options.
