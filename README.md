# PawnVet Server

Multi-tenant SaaS backend for veterinary clinic and pet shop management, built
with **NestJS**, **GraphQL**, and **Prisma/PostgreSQL**.

## Project goal

PawnVet lets multiple organizations (clinics, pet shops) run on a single
deployment while keeping their data isolated from one another. Every user
belongs to exactly one organization, and most queries/mutations scope their
results by `organizationId` — except for the `ROOT` role, which bypasses
tenant scoping for platform-wide administration. The API also drives
role-based permissions and a configurable navigation menu per role, on top of
core domain features like users, organizations, and file uploads (pet/clinic
images).

## Tech stack

- **Runtime / language**: Node.js, TypeScript
- **Framework**: [NestJS](https://nestjs.com/) 11
- **API layer**: GraphQL (Apollo Driver via `@nestjs/graphql` + `@nestjs/apollo`),
  schema auto-generated to `src/schema.gql`, served at `/gql`. One REST
  exception: `FileModule` (`src/file/file.controller.ts`) handles multipart
  file upload/serving, since GraphQL doesn't handle file uploads here.
- **Database / ORM**: PostgreSQL with [Prisma](https://www.prisma.io/) 6
- **Auth**: JWT (`@nestjs/jwt`, `passport-jwt`) with `bcryptjs` password hashing
- **Security**: `helmet` for HTTP headers, `@nestjs/throttler` for rate limiting
- **Validation**: `class-validator` / `class-transformer` for DTOs, `joi` for
  environment variable validation
- **Static files**: `@nestjs/serve-static` to serve uploaded files
- **Testing**: Jest (unit + e2e)
- **Package manager**: [pnpm](https://pnpm.io/)

## Key features

- **Multi-tenancy**: tenant isolation by `organizationId`, with a `ROOT` role
  that bypasses scoping.
- **Auth flow**: JWT stores only the user id; each request hydrates the full
  user (organization, role, permission flags, and a nested menu tree) and
  caches it in-memory for 30s to avoid re-querying on every request.
- **Permissions model**: roles carry blanket `canRead/canCreate/canUpdate/canDelete`
  flags, plus a `RoleMenu` join table controlling which menu items a role can
  see (drives frontend navigation).
- **GraphQL select optimization**: `@SelectFields()` turns the requested
  GraphQL fields into a Prisma `select`, so resolvers only fetch what's asked
  for.
- **Centralized error handling**: known Prisma errors are mapped to proper
  HTTP exceptions; a global exception filter catches anything that slips
  through.
- **Rate limiting**: global throttling (60 requests / 60s) via a
  GraphQL-context-aware guard.

## Prerequisites

- Node.js
- [pnpm](https://pnpm.io/)
- A PostgreSQL database
- A `.env` file based on [`.env.example`](.env.example), providing at least:
  `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ACCEPTED_URLS`
  (validated at startup, see `src/common/config/env.validation.ts`)

## Project setup

```bash
$ pnpm install
```

## Database setup

```bash
# generate the Prisma client
$ pnpm prisma:generate

# apply migrations (dev)
$ pnpm prisma:migrate

# seed initial data
$ pnpm prisma:seed
```

## Compile and run the project

```bash
# watch mode (default dev loop)
$ pnpm start:dev

# production mode
$ pnpm start:prod
```

## Available scripts

| Script                 | Description                                  |
| ---------------------- | --------------------------------------------- |
| `pnpm start:dev`       | Run in watch mode                              |
| `pnpm start:prod`      | Run the compiled build                         |
| `pnpm build`           | Compile with `nest build`                      |
| `pnpm lint`            | ESLint with `--fix` over `src/apps/libs/test`   |
| `pnpm format`          | Format with Prettier                           |
| `pnpm test`            | Run unit tests (Jest)                          |
| `pnpm test:watch`      | Unit tests in watch mode                       |
| `pnpm test:cov`        | Unit tests with coverage                       |
| `pnpm test:e2e`        | Run e2e tests                                  |
| `pnpm prisma:generate` | Regenerate the Prisma client                   |
| `pnpm prisma:migrate`  | Create/apply a dev migration                   |
| `pnpm prisma:seed`     | Seed the database                              |

## Module structure

Domain modules follow a consistent shape (`*.module.ts`, `*.resolver.ts` or
`*.controller.ts`, `*.service.ts`, `dto/`, `entities/`):

- `user` — user management
- `auth` — login, JWT issuance, and user hydration
- `organization` — tenant management
- `role` — roles, permission flags, and role-menu assignments
- `menu` — navigation menu tree
- `file` — REST file upload/serving

`CommonModule` is global and exposes shared services (`PrismaService`,
`CommonService`) to every other module without needing to re-import it.
