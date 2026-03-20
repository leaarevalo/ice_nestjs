# CLAUDE.md — ice_nestjs

## Project Overview

Backend API for **ICE (Iglesia de Cristo)** — a church management and academic system. Built with NestJS + MongoDB + JWT auth.

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
│   ├── user.controller.ts     # CRUD (role-based access)
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
├── history/                   # Pastoral counseling history records (encrypted)
│   ├── history.controller.ts
│   ├── history.service.ts
│   ├── schemas/history.schema.ts
│   └── dto/
├── schools/                   # Academic schools/programs
│   ├── school.controller.ts
│   ├── school.service.ts
│   ├── schemas/school.schema.ts
│   └── dto/
├── academic-modules/          # Modules within schools (courses)
│   ├── academic-module.controller.ts
│   ├── academic-module.service.ts
│   ├── schemas/academic-module.schema.ts
│   └── dto/
├── enrollments/               # Student enrollment in schools + module results
│   ├── enrollment.controller.ts
│   ├── enrollment.service.ts
│   ├── schemas/enrollment.schema.ts
│   └── dto/
└── submissions/               # Student document submissions + professor reviews
    ├── submission.controller.ts
    ├── submission.service.ts
    ├── schemas/submission.schema.ts
    └── dto/
```

## Architecture: Unified User Model

There is a **single `User` entity** that combines authentication and profile data. No separate Manager/auth account exists.

- Every user has: `document` (unique ID/DNI, used for login), `password` (bcrypt hashed), `role`, `isActive`
- The `Role` enum is defined in `src/users/schemas/user.schema.ts`
- Users are created via `POST /users` (MANAGER only) with a password
- Login via `POST /auth/login` with `{ document, password }`
- No public registration endpoint — users are created by MANAGER only

## Roles & Authorization

4 roles defined: `MANAGER`, `LIDER`, `COUNSELOR`, `USER`

- **MANAGER** — Full admin access to all resources, user CRUD (create/read/update/delete)
- **LIDER** — Group/small-group management (scoped to assigned groups). Can view users from their assigned groups (read-only). Can create/edit/delete small-groups within their groups.
- **COUNSELOR** — History (pastoral) records. Can view users (read-only).
- **USER** — Can view groups where they are collaborators. Can view small-groups where they are leaders or participants. Can view users (read-only). Cannot create/update/delete.

Guards: `@UseGuards(AuthGuard, RolesGuard)` + `@Roles(...)` for role-based access.

### Data scoping by role

- **Users endpoint (`/users`):**
  - MANAGER: sees all users
  - LIDER: sees only users from their assigned groups (managers + collaborators)
  - USER: sees only fellow students (enrolled in same schools) + professors of those schools
  - COUNSELOR: sees all users (read-only)
- **Groups endpoint (`/groups`):**
  - MANAGER: sees all groups
  - LIDER: sees only their assigned groups
  - USER: sees only groups where they are a collaborator
- **Small-groups endpoint (`/small-groups`):**
  - MANAGER: sees all small-groups
  - LIDER: sees small-groups within their assigned groups
  - USER: sees only small-groups where they are a leader or participant
- **Academic-modules endpoint (`/academic-modules`):**
  - MANAGER: sees all modules
  - Professor: sees modules they teach + modules from schools they're enrolled in
  - Enrolled student: sees only modules from schools they're enrolled in
  - Not enrolled / not professor: access denied (403)

## Key API Endpoints

| Route                            | Method         | Auth | Roles                              |
|----------------------------------|----------------|------|------------------------------------|
| `/auth/login`                    | POST           | No   | —                                  |
| `/users`                         | GET            | Yes  | MANAGER, LIDER, USER, COUNSELOR    |
| `/users`                         | POST           | Yes  | MANAGER                            |
| `/users/:id`                     | GET            | Yes  | MANAGER, LIDER, USER, COUNSELOR    |
| `/users/:id`                     | PUT/DELETE     | Yes  | MANAGER                            |
| `/groups`                        | GET            | Yes  | MANAGER, LIDER, USER               |
| `/groups`                        | POST           | Yes  | MANAGER                            |
| `/groups/:id`                    | GET            | Yes  | MANAGER, LIDER, USER               |
| `/groups/:id`                    | PUT            | Yes  | MANAGER, LIDER                     |
| `/groups/:id`                    | DELETE         | Yes  | MANAGER                            |
| `/small-groups`                  | GET            | Yes  | MANAGER, LIDER, USER               |
| `/small-groups`                  | POST           | Yes  | MANAGER, LIDER                     |
| `/small-groups/group/:groupId`   | GET            | Yes  | MANAGER, LIDER, USER               |
| `/small-groups/:id`              | GET            | Yes  | MANAGER, LIDER, USER               |
| `/small-groups/:id`              | PUT/DELETE     | Yes  | MANAGER, LIDER                     |
| `/history`                       | GET/POST       | Yes  | COUNSELOR                          |
| `/history/user/:userId`          | GET            | Yes  | COUNSELOR                          |
| `/schools`                       | CRUD           | Yes  | MANAGER                            |
| `/academic-modules`              | GET            | Yes  | ALL (scoped: professors see theirs)|
| `/academic-modules`              | POST/DELETE    | Yes  | MANAGER                            |
| `/academic-modules/school/:id`   | GET            | Yes  | ALL                                |
| `/academic-modules/:id`          | PUT            | Yes  | MANAGER, professor assigned        |
| `/enrollments`                   | GET            | Yes  | MANAGER                            |
| `/enrollments`                   | POST/DELETE    | Yes  | MANAGER, professor of school       |
| `/enrollments/my`                | GET            | Yes  | ALL (own enrollments)              |
| `/enrollments/school/:schoolId`  | GET            | Yes  | ALL                                |
| `/enrollments/:id/module-result` | PUT            | Yes  | MANAGER, professor of module       |
| `/submissions`                   | POST           | Yes  | ALL (as student)                   |
| `/submissions/my`                | GET            | Yes  | ALL (own submissions)              |
| `/submissions/module/:moduleId`  | GET            | Yes  | MANAGER, professor of module       |
| `/submissions/:id/review`        | PUT            | Yes  | MANAGER, professor of module       |

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
- `UserModule` imports Group schema (for LIDER user scoping)
- `SchoolModule` imports AuthModule (for guards)
- `AcademicModuleModule` imports AuthModule + UserModule (for document→ID resolution)
- `EnrollmentModule` imports AuthModule + UserModule + AcademicModuleModule
- `SubmissionModule` imports AuthModule + AcademicModuleModule (for professor validation)

## Database Schema

All schemas use `{ timestamps: true }` for automatic `createdAt`/`updatedAt`.

- **User** — document (unique), name, lastName, password (hashed), role (enum), isActive, assignedGroups[], email, phone, address, dateOfBirth, etc.
- **Group** — name (unique), managers[] (ref User), collaborators[] (ref User), description
- **SmallGroup** — name, group (ref Group), leaders[] (ref User), participants[] (ref User), description
- **History** — userId (ref User), managerId (ref User), content (AES encrypted)
- **School** — name (unique), description, isActive, createdBy (ref User)
- **AcademicModule** — name, description, school (ref School), professors[] (ref User), order, materialLinks[] (Google Drive URLs)
- **Enrollment** — student (ref User), school (ref School), status (active/completed/dropped), moduleResults[] (embedded: academicModule ref + status pending/in_progress/approved/failed)
- **Submission** — student (ref User), academicModule (ref AcademicModule), fileUrl, fileName, status (pending_review/approved/rejected), feedback, reviewedBy (ref User), reviewedAt

## Architecture: Academic System

Professor/student status is determined by **relationships**, not by the `role` field. This avoids modifying the existing role system.

- A user is a **student** when they have an `Enrollment` record for a school
- A user is a **professor** when they are in a module's `professors[]` array
- A user can be both professor and student simultaneously, and can also have any church role (LIDER, COUNSELOR, etc.)
- Materials are stored as Google Drive links in `AcademicModule.materialLinks[]`
- Student uploads use a generic `fileUrl` field (storage provider to be configured)
- When a student is enrolled, `moduleResults` are auto-populated with all existing modules of that school (status: pending)
- When all modules are approved, enrollment status auto-updates to `completed`

## JWT Payload

The JWT token contains: `sub` (userId), `document`, `role`, `assignedGroups` (array of group ID strings — not populated objects).

## Important Implementation Details

- Groups/SmallGroups accept `document` (DNI) arrays in DTOs for managers/collaborators/leaders/participants — these are resolved to ObjectIds via `getUserIdsByDocuments()` / `getLiderIdsByDocuments()` before saving.
- `assignedGroups` on User is synced automatically when groups are created/updated/deleted via `authService.syncGroupUsers()`.
- The `signIn` method populates `assignedGroups` for the response but stores only string IDs in the JWT payload.
- All services handle defensive extraction of IDs from `assignedGroups` (in case objects arrive instead of strings): `g._id ? g._id.toString() : g.toString()`.

## Deployment

- Previously deployed to **Render**
- No Dockerfile or CI/CD pipeline currently in repo
- Build output goes to `dist/`, run with `node dist/main`
