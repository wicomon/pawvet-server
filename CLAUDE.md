# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Multi-tenant SaaS backend (NestJS + GraphQL + Prisma/PostgreSQL) for veterinary & pet shop management ("pawnvet"). Package manager is **pnpm**.

## Commands

```bash
pnpm start:dev          # run with watch mode (default dev loop)
pnpm build               # nest build
pnpm lint                 # eslint --fix over src/apps/libs/test
pnpm format                # prettier --write

pnpm test                  # unit tests (jest, rootDir: src, *.spec.ts)
pnpm test -- path/to/x.spec.ts   # run a single unit test file
pnpm test:watch
pnpm test:cov
pnpm test:e2e              # jest -c test/jest-e2e.json

pnpm prisma:generate        # regenerate Prisma client after schema changes
pnpm prisma:migrate          # create/apply a dev migration
pnpm prisma:seed              # tsx prisma/seed/seed.ts
```

There is no separate typecheck script; `pnpm build` (tsc via nest build) is the way to verify types.

## Architecture

- **Transport**: GraphQL only (Apollo Driver) at path `/gql`, schema auto-generated to `src/schema.gql` (`app.module.ts`). One REST exception: `FileModule` (`src/file/file.controller.ts`) for multipart upload/serving of images, since GraphQL doesn't handle file uploads here.
- **Modules** follow one shape: `<name>.module.ts`, `<name>.resolver.ts` (or `.controller.ts` for file), `<name>.service.ts`, `dto/`, `entities/`. Domain modules: `user`, `auth`, `organization`, `role`, `menu`, `file`. `CommonModule` is `@Global()` and exports `PrismaService`/`CommonService` to every module without re-importing.
- **Multi-tenancy**: every `User` belongs to one `Organization`; most list queries filter `where: { organizationId: contextUser.organization.id }` unless the caller's role is `ValidRoles.ROOT`, which bypasses tenant scoping (see `src/user/user.service.ts`). When adding a new resolver/service, follow this same root-bypass pattern rather than inventing a new one.
- **Vet domain (schema-only)**: `Owner`, `Pet`, `Appointment`, `MedicalRecord`, `Vaccine`, `Product`, `Invoice`, `InvoiceItem`, `NotificationLog` exist in `prisma/schema.prisma` (migration `20260710005048_add_vet_clinic_crm_billing`) but have **no NestJS modules yet**. Conventions baked into that schema, to preserve when building on it: every table (including children like `InvoiceItem`) carries `organizationId` with composite indexes led by it; money is `Decimal(12,2)`; pet weight is strictly kilograms in `weightKg Decimal(6,3)` — never store other units (enforced by SQL `CHECK` constraints added by hand in the migration, which Prisma can't express — repeat that pattern for future business-rule constraints); `Invoice` SUNAT fields (`tipoComprobante`/`serie`/`correlativo`/`estadoSunat`/`hashFirma`) and `NotificationLog` are Phase-2 stubs, all nullable and unused by the MVP.
- **Auth flow**: login (`AuthService.login`) issues a JWT containing only `{ id }`. `JwtStrategy.validate` calls `AuthService.userById(id)` to hydrate the full user (org + role + permission flags + nested menu tree, up to 3 levels of `subMenu`) onto the request. `@CurrentUser(roles?)` (`src/common/decorators/current-user.decorator.ts`) then reads that off the GraphQL context and reshapes it into `ContextUser`, throwing `ForbiddenException` if the caller's role isn't in the allowed list. Guard resolvers with `@UseGuards(JwtAuthGuard)` (a GraphQL-context-aware subclass of `AuthGuard('jwt')`) — note `OrganizationResolver` is currently missing this guard, a known gap (see specs).
- **Permissions model**: `Role` carries blanket `canRead/canCreate/canUpdate/canDelete` booleans (not per-resource), plus a `RoleMenu` join table controlling which `Menu` items (with recursive `parentId`/`subMenu`) a role can see — used to drive frontend nav, not fine-grained authorization.
- **`userById` in-memory cache**: `AuthService` caches the hydrated user tree per-id for 30s (`USER_CACHE_TTL_MS`) to avoid re-running the deep nested select on every authenticated GraphQL request. Any mutation that changes a user's password, role, or permissions must call `invalidateUserCache(userId)` (or `clearUserCache()` for broad role/menu changes) — see call sites in `user.service.ts` / `role.service.ts`. This cache is single-process only; it must move to Redis before scaling beyond one instance.
- **GraphQL select optimization**: `@SelectFields()` (`src/common/decorators/selected-fields.decorator.ts`) converts the incoming GraphQL query's requested fields into a Prisma `select` object (via `graphql-fields`), so resolvers only fetch columns/relations actually requested. There's currently no depth/complexity limit on this — a deeply nested query produces an unrestricted nested `select`.
- **Error handling**: services wrap logic in try/catch and call `CommonService.handleErrors(error)`, which rethrows `HttpException`s as-is, maps known `Prisma.PrismaClientKnownRequestError` codes to HTTP exceptions via `mapPrismaError` (`src/common/utils/prisma-error.util.ts`), and otherwise throws a generic 500. `AllExceptionsFilter` (global `APP_FILTER`) applies the same mapping as a fallback for errors that bypass service try/catch (guards, strategies, pipes). `GraphQLModule.formatError` in `app.module.ts` reads `extensions.originalError.statusCode` to shape the client-facing error — keep that field intact if you touch error mapping.
- **Rate limiting**: global `ThrottlerModule` (60 req/60s) applied via `GqlThrottlerGuard`, a GraphQL-context adapter for `ThrottlerGuard` (same `GqlExecutionContext` pattern as `JwtAuthGuard`). In-memory storage — not shared across instances.
- **Env validation**: `src/common/config/env.validation.ts` (Joi) is the source of truth for required env vars (`DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ACCEPTED_URLS`, etc.) — `ConfigModule.forRoot` fails fast if these are missing/invalid. Update this schema whenever adding a new required env var.
- **File uploads**: `FileService` writes to local disk (`./public/uploads`), served back via `ServeStaticModule`/`FileController`. This is single-instance only (see specs on horizontal scaling below).
- **Path alias**: import via `src/...` (tsconfig `paths`), not relative `../../..` chains, matching existing files.

## Known gaps / in-flight work

`specs/performance-100-concurrent-users.md` tracks a performance review (as of 2026-07-06) and what's still pending after an initial "quick wins" pass (async bcrypt/file writes, the `userById` cache, Prisma pool docs). Still open when this was written:
- No real pagination wired up — `PaginationArgs` (`src/common/dto/args/pagination.args.ts`) exists but isn't used in any `findAll` (user/role/menu/organization all return unbounded result sets).
- No GraphQL query depth/complexity limit.
- `OrganizationResolver` missing `@UseGuards(JwtAuthGuard)`.
- Everything single-instance-only: in-memory user cache, in-memory throttler storage, local-disk file uploads — all need to move to shared/external stores (Redis, S3) before scaling horizontally.

Check this file before assuming these are already fixed, and update/remove entries there as they're resolved.
