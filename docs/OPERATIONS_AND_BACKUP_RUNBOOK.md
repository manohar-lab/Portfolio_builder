# PortfolioCraft - Operations, Backup, & Recovery Runbook (Phase 30)

This document outlines the operational monitoring, health checks, backup strategies, incident response protocols, and recovery procedures for the **PortfolioCraft SaaS** platform.

---

## 1. Application Health & Monitoring Endpoints

### Liveness Endpoint (`/api/health`)
- **Purpose**: Verifies that the Next.js application process is running and responding.
- **HTTP Method**: `GET`
- **Expected Status**: `200 OK`
- **Response Format**:
  ```json
  {
    "status": "ok",
    "service": "PortfolioCraft SaaS",
    "version": "1.0.0",
    "environment": "production",
    "uptimeSeconds": 1420,
    "timestamp": "2026-10-01T15:00:00.000Z"
  }
  ```
- **Security**: No database credentials or internal secrets are exposed.

### Readiness Endpoint (`/api/ready`)
- **Purpose**: Verifies database connectivity and essential startup environment configuration.
- **HTTP Method**: `GET`
- **Expected Status**: `200 OK` (when ready) or `503 Service Unavailable` (when required database is down).
- **Dependency Isolation**: Optional external integrations (GitHub OAuth, OpenAI API, Stripe Billing) are monitored separately. Disconnection of an optional integration will **not** degrade core portfolio rendering or cause a `503`.

---

## 2. Database Backup & Disaster Recovery Strategy

### Supabase Managed Database Backups
- **Automated Snapshots**: Daily full physical backups managed by Supabase infrastructure with 7-day point-in-time retention for Pro plans.
- **Point-In-Time-Recovery (PITR)**: Enables restoring database state to any specific second within the retention window in case of accidental data loss or corruption.
- **Backup Location**: Stored across redundant cloud storage nodes in isolated regions with AES-256 encryption at rest.

### Recovery Protocol (Disaster Recovery Step-by-Step)
1. **Incident Declaration**: Identify corruption or loss via `/api/ready` reporting or operational error spikes.
2. **Access Management Console**: Log into Supabase Project Dashboard -> Database -> Backups.
3. **Select PITR Timestamp**: Select a restore timestamp immediately prior to the failure event.
4. **Initiate Restore to Staging**: Restore snapshot to a temporary staging project first to verify integrity.
5. **Verify Data Integrity**:
   - Verify `users`, `profiles`, and `portfolios` tables.
   - Verify custom domain mappings and user-owned projects.
6. **Switch Production Connection String**: Update `NEXT_PUBLIC_SUPABASE_URL` and service role keys to point to restored instance.
7. **Run Readiness Check**: Call `GET /api/ready` to verify system health.

---

## 3. Storage & File Asset Recovery

### Profile & Portfolio Image Buckets
- **Storage Provider**: Supabase Storage Buckets (`avatars`, `portfolio-images`).
- **Access Model**: Public read access for portfolio images; server-authorized write access strictly guarded by RLS policies.
- **Backup Strategy**: Multi-region object replication.

---

## 4. Operational Alert Conditions & Thresholds

| Metric / Event | Severity | Threshold | Recommended Action |
| :--- | :--- | :--- | :--- |
| **Readiness Check Failure** | CRITICAL | 2 consecutive `503` responses on `/api/ready` | Check Supabase DB pool & connection limits |
| **High Server Error Rate** | HIGH | > 5% requests returning `500` in 5 mins | Search server logs for `ERR-` correlation IDs |
| **Database Latency** | WARN | DB latency > 1500ms on `/api/ready` | Investigate unindexed queries or connection saturation |
| **Failed Webhook Retries** | WARN | > 3 consecutive failures on `/api/billing/webhook` | Verify Stripe webhook secret and signature validation |

---

## 5. Incident Reference Tracing (`ERR-XXXXX`)

When an unhandled exception occurs, the server logs a structured JSON event containing:
- `timestamp` (UTC ISO string)
- `level` (`ERROR` / `CRITICAL`)
- `requestId` (Correlation ID, e.g. `req_1727772000000_abc123`)
- `route` (API endpoint or Server Action name)
- `metadata` (Sanitized parameters with redacted secrets)

Clients receive a safe user-facing reference ID (e.g. `ERR-ABC123`). Support engineers can locate the exact stack trace in production logs by searching for the corresponding correlation ID.

---

## 6. Multi-Tenant Isolation & RLS Security

- PostgreSQL Row-Level Security (RLS) is active across `portfolios`, `projects`, `skills`, `education`, `research`, `social_links`, and `profiles`.
- User A cannot view or mutate User B's portfolio drafts, account preferences, or integration settings.
- Disconnecting GitHub or third-party integrations stops background synchronization without deleting user-owned portfolio projects.
