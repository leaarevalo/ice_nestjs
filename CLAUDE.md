# CLAUDE.md — ice_nestjs

## Project Overview

Backend API for **ICE (Iglesia de Cristo)** — a church management system. Built with NestJS + MongoDB + JWT auth.

## Tech Stack

- **Framework:** NestJS v11 (TypeScript)
- **Database:** MongoDB via Mongoose v8
- **Auth:** JWT (@nestjs/jwt) + bcryptjs for password hashing
- **Validation:** class-validator + class-transformer
- **Runtime:** Node.js

## Commands

```bash
npm run start:dev      # Dev server with hot reload
npm run build          # Build to dist/
npm run start:prod     # Run compiled app (node dist/main)
npm run test           # Unit tests (Jest)
npm run test:e2e       # E2E tests
npm run test:cov       # Coverage report
npm run lint           # ESLint fix
npm run format         # Prettier format
```

## Project Structure

```
src/
├── main.ts                    # Bootstrap, CORS, port config
├── app.module.ts              # Root module (ConfigModule global, all feature modules)
├── auth/                      # Auth module: login, JWT guard, roles guard
│   ├── auth.controller.ts     # POST /auth/login
│   ├── auth.service.ts        # Login, lider validation, group-user sync
│   ├── auth.guard.ts          # JWT validation guard
│   ├── roles.guard.ts         # Role-based access guard
│   ├── roles.decorator.ts     # @Roles() decorator
│   └── dto/login.dto.ts
├── users/                     # Unified user entity (auth + profile)
│   ├── user.controller.ts     # CRUD (MANAGER only)
│   ├── user.service.ts        # User CRUD with password hashing
│   ├── schemas/user.schema.ts # Unified schema: auth + personal data + Role enum
│   └── dto/
├── groups/                    # Group management (church groups)
│   ├── group.controller.ts
│   ├── group.service.ts
│   ├── schemas/group.schema.ts
│   └── dto/
├── small-groups/              # Small groups (subgroups within groups)
│   ├── small-group.controller.ts
│   ├── small-group.service.ts
│   ├── schemas/small-group.schema.ts
│   └── dto/
└── history/                   # Pastoral counseling history records (encrypted)
    ├── history.controller.ts
    ├── history.service.ts
    ├── schemas/history.schema.ts
    └── dto/
```

## Architecture: Unified User Model

There is a **single `User` entity** that combines authentication and profile data. No separate Manager/auth account exists.

- Every user has: `document` (unique ID/DNI, used for login), `password` (bcrypt hashed), `role`, `isActive`
- The `Role` enum is defined in `src/users/schemas/user.schema.ts`
- Users are created via `POST /users` (MANAGER only) with a password
- Login via `POST /auth/login` with `{ document, password }`

## Roles & Authorization

4 roles defined: `MANAGER`, `LIDER`, `COUNSELOR`, `USER`

- **MANAGER** — Full admin access to all resources, user CRUD
- **LIDER** — Group/small-group management (scoped to assigned groups)
- **COUNSELOR** — History (pastoral) records only
- **USER** — Basic access

Guards: `@UseGuards(AuthGuard, RolesGuard)` + `@Roles(...)` for role-based access.

## Key API Endpoints

| Route                            | Method         | Auth | Roles              |
|----------------------------------|----------------|------|--------------------|
| `/auth/login`                    | POST           | No   | —                  |
| `/users`                         | GET/POST       | Yes  | MANAGER            |
| `/users/:id`                     | GET/PUT/DELETE | Yes  | MANAGER            |
| `/groups`                        | GET/POST       | Yes  | MANAGER, LIDER     |
| `/groups/:id`                    | GET/PUT/DELETE | Yes  | MANAGER, LIDER     |
| `/small-groups`                  | GET/POST       | Yes  | MANAGER, LIDER     |
| `/small-groups/group/:groupId`   | GET            | Yes  | MANAGER, LIDER     |
| `/history`                       | GET/POST       | Yes  | COUNSELOR          |
| `/history/user/:userId`          | GET            | Yes  | COUNSELOR          |

## Environment Variables

Configured in `.env`:

- `NODE_ENV` — production/development
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — JWT signing secret
- `SECRET_KEY` — App secret key (used for history encryption)
- `PORT` — Server port (default 3001)
- `CORS_ORIGINS` — Comma-separated allowed origins

## Module Dependencies

- `AuthModule` imports User schema for login/validation
- `GroupModule` uses `forwardRef()` to AuthModule and UserModule
- `SmallGroupModule` uses `forwardRef()` to UserModule
- `JwtModule` is registered globally in AuthModule
- `UserModule` is self-contained (no auth dependency)

## Database Schema (single collection: users)

All schemas use `{ timestamps: true }` for automatic `createdAt`/`updatedAt`.

- **User** — document (unique), name, lastName, password (hashed), role (enum), isActive, assignedGroups[], email, phone, address, dateOfBirth, etc.
- **Group** — name (unique), managers[] (ref User), collaborators[] (ref User), description
- **SmallGroup** — name, group (ref Group), leaders[] (ref User), participants[] (ref User), description
- **History** — userId (ref User), managerId (ref User), content (AES encrypted)

## Deployment

- Previously deployed to **Render**
- No Dockerfile or CI/CD pipeline currently in repo
- Build output goes to `dist/`, run with `node dist/main`
