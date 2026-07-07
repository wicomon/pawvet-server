# Rendimiento para ~100 usuarios concurrentes — pendiente

Contexto: revisión de arquitectura (2026-07-06) confirmó que el servidor no estaba
preparado para ~100 usuarios simultáneos. La Fase A (quick wins) ya se implementó:
bcrypt async, escritura de archivos async, caché in-memory de `userById` con
invalidación, pool de Prisma documentado, limpieza de logs. Este documento cubre
lo que **falta**.

## Fase B — Paginación y límites (medio plazo)

### B1. Aplicar paginación real en los listados
`PaginationArgs` (`src/common/dto/args/pagination.args.ts`, offset/limit) existe
pero no se usa en ningún resolver. Todos los `findMany` devuelven el set completo:
- `src/user/user.service.ts:29` (`findAll`)
- `src/role/role.service.ts:25` (`findAll`)
- `src/menu/menu.service.ts:18` (`findAll`)
- `src/organization/organization.service.ts:23` (`findAll`)

Conectar `PaginationArgs` a estos servicios con `take`/`skip`, y aplicar un límite
máximo defensivo (ej. cap a 100) para que un cliente no pueda pedir `limit: 999999`.

### B2. Límite de profundidad/complejidad en GraphQL
El decorador `@SelectFields` traduce el query del cliente directamente a un
`select` de Prisma sin límite de profundidad ni de complejidad (`app.module.ts`
no define `validationRules` para esto). Un query anidado profundo puede generar
un `select` pesado sin restricción. Añadir `graphql-depth-limit` o un plugin de
costo de Apollo en la config de `GraphQLModule.forRoot` (`src/app.module.ts`).

### B3. Guard de autenticación faltante en Organization
`OrganizationResolver` no tiene `@UseGuards(JwtAuthGuard)` — todas sus queries y
mutations están sin autenticar. Es un tema de seguridad/multi-tenant más que de
rendimiento puro, pero conviene cerrarlo en la misma pasada.
`src/organization/organization.resolver.ts`.

## Fase C — Escalado horizontal (cuando se defina el despliegue)

Bloqueado hasta decidir dónde corre en producción (1 servidor / contenedores-K8s
/ PaaS). Tareas:

- **Clustering en 1 servidor:** ejecutar bajo PM2 en modo cluster (o `cluster`
  nativo de Node) para aprovechar todos los cores. El código ya es stateless
  salvo la caché in-memory de A3 y los uploads a disco local.
- **Throttler con storage compartido:** hoy usa storage en memoria
  (`@nestjs/throttler` default) — no se comparte entre instancias. Migrar a
  Redis (ej. `@nest-lab/throttler-storage-redis`) si hay >1 instancia.
- **Caché de usuario (A3) a Redis:** la caché in-memory implementada en
  `src/auth/auth.service.ts` (`userCache`, TTL 30s) solo sirve para 1 proceso.
  Con múltiples instancias, cada una tendría su propia copia y las
  invalidaciones (`invalidateUserCache`/`clearUserCache`) no se propagarían
  entre procesos. Mover a Redis con pub/sub o TTL corto compensando la demora
  de invalidación.
- **Storage de archivos externo:** `src/file/file.service.ts` escribe a
  `./public/uploads` en disco local, servido por `ServeStaticModule` en el
  mismo proceso. Con >1 instancia cada una vería un disco distinto. Migrar a
  S3 (o compatible) y servir estáticos vía CDN/servicio dedicado.
- **PgBouncer** delante de PostgreSQL si el número de instancias ×
  `connection_limit` (ver `.env.example`) supera el máximo de conexiones que
  soporta la base de datos.
- **Healthcheck** con `@nestjs/terminus` para que el orquestador (K8s/PaaS)
  pueda hacer liveness/readiness probes.

## Verificación sugerida al implementar cada fase
- **B1/B2:** probar con un cliente GraphQL que pida `limit` alto y un query
  anidado profundo; confirmar que se recorta/rechaza.
- **B3:** confirmar que `organizationFindAll` sin token devuelve 401.
- **C:** prueba de carga (`autocannon`/`k6`) con ≥2 instancias detrás de un
  balanceador, verificando que rate-limit y caché de usuario se comportan
  igual que con 1 instancia (sin bypass del throttler ni datos stale
  prolongados tras una actualización de rol).
