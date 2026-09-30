# PORTFOLIOCRAFT SAAS - PRODUCTION OPERATIONS RUNBOOK (PHASE 20)

## 1. System Health & Observability Architecture

### Endpoints
- **Liveness Check**: `GET /api/health`
  - Returns HTTP 200 `{ "status": "ok", "service": "PortfolioCraft SaaS", "timestamp": "..." }`.
  - Light-weight process health check for load balancer health probes.
- **Readiness Check**: `GET /api/ready`
  - Performs database connection test and returns HTTP 200 `{ "status": "ready", "checks": { "database": { "status": "healthy", "latencyMs": 15 } } }` or HTTP 503 if database is unreachable.

### Request Correlation & Logging
- **Header**: `X-Request-ID` is assigned or propagated by `middleware.ts`.
- **Structured Logging**: `logStructuredEvent()` in `src/utilities/observability.ts` emits JSON logs with `timestamp`, `level`, `requestId`, `route`, `status`, `durationMs`.
- **Sanitization**: All passwords, OAuth tokens, Stripe webhook secrets, and API keys are automatically redacted (`[REDACTED]`).

---

## 2. Production Smoke Test Procedure

Run the following non-destructive sequence post-deployment:

1. **Liveness Check**:
   ```bash
   curl -I https://portfoliocraft.com/api/health
   # Expected: HTTP 200 OK
   ```

2. **Readiness Check**:
   ```bash
   curl -i https://portfoliocraft.com/api/ready
   # Expected: HTTP 200 OK with JSON status: "ready"
   ```

3. **Public Route Check**:
   ```bash
   curl -I https://portfoliocraft.com/
   # Expected: HTTP 200 OK
   ```

4. **Public Portfolio Routing Check**:
   ```bash
   curl -I https://portfoliocraft.com/u/demo-user
   # Expected: HTTP 200 OK (if published) or HTTP 404 (if private)
   ```

---

## 3. Maintenance Mode Procedure

To perform scheduled platform maintenance:

1. Set `NEXT_PUBLIC_MAINTENANCE_MODE="true"` in production environment configuration.
2. Redeploy / refresh edge instances.
3. Public visitors receive HTTP 503 with a clean maintenance page.
4. Admin routes (`/admin`) and API health endpoints (`/api/health`) remain accessible for verification.
5. To resume normal operations, set `NEXT_PUBLIC_MAINTENANCE_MODE="false"`.

---

## 4. Disaster Recovery & Backup Strategy

- **Database Backups**: Managed via Supabase Automated Daily Backups and Point-In-Time Recovery (PITR) with a 7-day retention window.
- **Database Restoration**:
  1. Access Supabase Project Dashboard -> Project Settings -> Database -> Backups.
  2. Select targeted PITR timestamp prior to incident.
  3. Initiate restore to point-in-time.
  4. Run `/api/ready` to verify restored schema connectivity.

---

## 5. Secret Rotation Procedure

If a secret key is compromised:

1. **Stripe Webhook Secret (`STRIPE_WEBHOOK_SECRET`)**:
   - Generate a new webhook signing secret in Stripe Dashboard.
   - Update `STRIPE_WEBHOOK_SECRET` in environment variables.
   - Restart server instances.

2. **GitHub OAuth Client Secret (`GITHUB_CLIENT_SECRET`)**:
   - Generate a new client secret in GitHub Developer Settings.
   - Update `GITHUB_CLIENT_SECRET` in environment variables.

3. **Supabase Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`)**:
   - Rotate service key in Supabase Project API Settings.
   - Update `SUPABASE_SERVICE_ROLE_KEY` in environment.

---

## 6. Deployment Rollback Procedure

If a production release introduces regression:

1. In deployment platform (e.g. Vercel), locate previous successful deployment commit.
2. Select **Promote to Production** / **Rollback**.
3. Verify `/api/health` and `/api/ready` exit code 200.
