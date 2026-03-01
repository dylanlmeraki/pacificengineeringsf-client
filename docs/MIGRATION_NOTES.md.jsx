# Migration Notes: Decoupling from Base44 and TypeScript Enablement

Date: 2026-02-04

This document captures the changes made in this repo to minimize Base44 coupling, introduce a migration seam for a future Node.js/Express + PostgreSQL backend, add TypeScript scaffolding, and standardize domain usage. It also lists remaining items to complete after moving to Replit.

---

## What Changed (in this commit)

1. Introduced migration seam (TypeScript service layer)
   - Added typed wrappers that proxy current Base44 usage and can later point to your Express API without touching pages/components:
     - components/services/apiClient.ts → list/filter/create/update/remove for entities
     - components/services/authClient.ts → me/isAuthenticated/logout/login redirect
     - components/services/integrationsClient.ts → InvokeLLM/SendEmail/UploadFile
     - components/services/functionsClient.ts → functions.invoke
   - All wrappers include try/catch logging and consistent error messages.

2. Environment/domain centralization
   - components/utils/envConfig: added
     - internalPortalUrl = https://internal.pacificengineeringsf.com
     - mainWebsiteUrl = https://pacificengineeringsf.com
     - clientPortalUrl = https://portal.pacificengineereingsf.com (note: as provided, contains “engineereingsf”)
   - Replaced hardcoded window.location.origin references in critical flows with envConfig.

3. Page refactors to use wrappers (minimize Base44 at call sites)
   - pages/UserManagement: now uses apiClient/authClient/integrationsClient + domain envs
   - pages/SalesBotControl: uses apiClient/integrationsClient for ICP, LLM, Prospect/Task/Outreach, follow-ups
   - pages/SEOAssistant: uses integrationsClient + functionsClient
   - pages/ProposalDashboard: uses apiClient/functionsClient + domain envs
   - Behavior preserved; adds safer error handling via wrappers. UI unchanged.

4. Initial TypeScript types
   - components/types/entities.ts: baseline types for Project, User, Contact, Proposal to begin incremental TS migration.

---

## What Remains (post-Replit tasks)

A. Backend (Node.js/Express + PostgreSQL)
   - Create Express app with PostgreSQL (pg or Prisma/TypeORM/Sequelize). Recommended: Prisma for DX.
   - Convert entities/*.json → SQL schema. Suggested tables: User, Project, Prospect, Interaction, Task, SalesOutreach, EmailSequence, OutreachSequenceRun, etc.
   - Implement REST endpoints mapping current needs (examples):
     - GET/POST/PATCH/DELETE /api/projects
     - GET/POST/PATCH/DELETE /api/prospects
     - GET /api/sales-outreach?sort=-sent_date&limit=500, etc.
   - Wire the frontend seam: update components/services/apiClient.ts to call your REST API via fetch/axios.

B. Authentication
   - Add /api/auth/register, /api/auth/login, /api/auth/me with bcrypt + JWT (HttpOnly cookie recommended).
   - Replace authClient to call your endpoints.
   - Port roles/permissions logic and replace any remaining Base44 role gates.

C. Integrations
   - LLM: expose POST /api/llm/invoke → OpenAI (or provider) SDK using server-side API key.
   - Email: expose POST /api/email/send → Resend/SendGrid/Postmark.
   - File upload: expose POST /api/files → S3/Cloudflare R2/GCS signed uploads.
   - Update integrationsClient to call these endpoints.

D. Functions/Automations
   - Migrate Deno functions to Express routes or service modules:
     - examples in repo: approveAndSendOutreach, queueNextOutreachStep, startOutreachSequence, generateAndEmailPDFs, monitorWebsiteChanges, shareProposal, etc.
   - Scheduled automations: node-cron for intervals; or a hosted scheduler (Railway/Render/Cloudflare Workers cron).
   - Entity-triggered automations: implement in your service layer/ORM hooks.

E. Remaining Base44 usage to replace after backend is ready (non-exhaustive)
   - Pages likely still using Base44 directly: InternalDashboard, SalesDashboard, ProjectsManager, ContactManager, AISalesAssistant, ClientPortal, and various modals/components under components/*.
   - Strategy: progressively replace base44.* calls with apiClient/authClient/integrationsClient/functionsClient.

F. TypeScript Migration Plan
   - Enable TS in Vite config (already TS-friendly here). Gradually rename files to .ts/.tsx.
   - Add types for remaining entities (Prospect, Interaction, Task, SalesOutreach, EmailSequence, etc.).
   - Tighten tsconfig ("strict": true) after initial pass, fix surfaced issues.
   - Add ESLint + Prettier with TS plugins; CI check if applicable.

G. Domains/ENV
   - In Replit, set ENV:
     - INTERNAL_PORTAL_URL, MAIN_WEBSITE_URL, CLIENT_PORTAL_URL
     - API_BASE_URL (e.g., https://internal.pacificengineeringsf.com/api)
     - third-party keys: OPENAI_API_KEY, RESEND_API_KEY, etc.
   - Confirm whether client portal domain spelling is intentional (engineereingsf vs engineeringSF). Adjust envConfig accordingly.

H. QA/Validation Checklist
   - Smoke test pages refactored to wrappers (UserManagement, SalesBotControl, SEOAssistant, ProposalDashboard):
     - List, filter, create/update flows still work.
     - Email send flows reach integrationsClient without UI regression.
     - LLM calls return expected JSON and render.
     - Share links use internalPortalUrl.
   - After backend swap, re-test with API_BASE_URL set and apiClient updated.

---

## How to Switch to Your Express API (single-file change per concern)

- Entities: edit components/services/apiClient.ts to:
```ts
import axios from 'axios';
const API = import.meta.env.VITE_API_BASE_URL || process.env.API_BASE_URL || '';
export async function list<T>(entity: string, sort?: string, limit?: number): Promise<T[]> {
  const { data } = await axios.get(`${API}/entities/${entity}`, { params: { sort, limit } });
  return data;
}
// Repeat for filter/create/update/delete
```

- Auth: edit components/services/authClient.ts to call /api/auth/*.
- Integrations: edit components/services/integrationsClient.ts to call /api/llm/invoke, /api/email/send, etc.
- Functions: edit components/services/functionsClient.ts to call your routes instead of base44.functions.invoke.

---

## Notes
- All refactors preserve current behavior by still calling Base44 under the hood; swapping to your API is localized to the new service layer files.
- Added basic error handling in services to avoid silent failures and to standardize messages for debugging.
- UI/UX and data contracts remain unchanged to minimize regression risk before the backend cutover.