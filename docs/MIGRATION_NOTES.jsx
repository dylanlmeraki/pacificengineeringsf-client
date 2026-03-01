# Pacific Engineering — Migration Notes

## Overview
This document tracks the migration from Base44 to a self-hosted Node.js/TypeScript/Express stack.

### Target Architecture
- **Frontend:** React + TypeScript + Tailwind + shadcn/ui (deployed to Vercel)
- **Backend:** Node.js + TypeScript + Express (deployed to Vercel serverless, then Render long-term)
- **Database:** PostgreSQL + Drizzle ORM
- **Auth:** Lucia (session-based, JWT in HTTP-only cookies)
- **File Storage:** @vercel/blob
- **Email:** Resend
- **Payments:** Stripe (existing)
- **API Endpoint:** https://api.pacificengineeringsf.com

### Portal Architecture
| Portal | Domain | Description |
|--------|--------|-------------|
| Internal | internal.pacificengineeringsf.com | Admin/employee dashboard |
| Client | portal.pacificengineeringsf.com | Client-facing project portal |
| API | api.pacificengineeringsf.com | Backend API (Express) |
| Public | pacificengineeringsf.com | Marketing website |

---

## Phase 1: Preparation (COMPLETED)

### 1.1 TypeScript Entity Definitions ✅
- **File:** `components/types/entities.ts`
- **Content:** 745 lines of TypeScript interfaces for ALL entities
- **Includes:** BaseEntity, User, Prospect, Interaction, Task, Project, ProjectDocument, ProjectMilestone, ChangeOrder, ProjectMessage, Proposal, ProposalTemplate, Invoice, Workflow, BlogPost, CalendarSettings, EmailSettings, ICPSettings, AuditLog, Notification, ClientInvite, ProjectRequest, RFI, SalesOutreach, EmailSequence, ScheduledReport, CustomPage, DashboardConfig
- **Features:** EntityTypeMap registry, utility types (DateTime, EntityId, Email, FileUrl, PaginatedResponse, ApiError, Result)

### 1.2 Abstracted API Client ✅
- **File:** `components/services/apiClient.js`
- **Methods:** list, filter, create, bulkCreate, update, remove, schema, subscribe, entityAccessor
- **Feature:** USE_BASE44 flag — flip to false to activate REST API calls
- **Comments:** Every method has commented-out POST-MIGRATION code ready to uncomment

### 1.3 Abstracted Auth Client ✅
- **File:** `components/services/authClient.js`
- **Methods:** getMe, isAuthenticated, logout, redirectToLogin, updateMe, login, register
- **Feature:** USE_BASE44 flag — flip to false to activate Lucia session endpoints
- **Notes:** login() and register() throw errors on Base44 (not supported), ready for Lucia

### 1.4 Abstracted Functions Client ✅
- **File:** `components/services/functionsClient.js`
- **Methods:** invoke, invokeRaw
- **Feature:** USE_BASE44 flag — flip to false to activate Express function routes

### 1.5 Abstracted Integrations Client ✅
- **File:** `components/services/integrationsClient.js`
- **Methods:** invokeLLM, sendEmail, uploadFile, uploadPrivateFile, createSignedUrl, generateImage, extractData
- **Feature:** USE_BASE44 flag — flip to false to activate custom integration routes
- **Post-migration targets:** @vercel/blob for files, Resend for email

### 1.6 Environment Config Updated ✅
- **File:** `components/utils/envConfig.js`
- **Added:** useBase44, backendProvider, authProvider, fileStorageProvider, emailProvider flags
- **Fixed:** Typo in clientPortalUrl domain name

### 1.7 InternalLayout Refactored ✅
- **File:** `components/internal/InternalLayout.jsx`
- **Changed:** Replaced direct `base44.auth.me()` with `authClient.getMe()`
- **Changed:** Replaced direct `base44.auth.logout()` with `authClient.logout()`

---

## Phase 2: Backend Setup (REFERENCE — Implemented Outside Base44)

These files are reference implementations to be created in your new Node.js project:

### 2.1 Backend Scaffold Reference ✅
- **File:** `components/docs/backend-scaffold/README.md`
- **Content:** Complete project structure, setup instructions, deployment guide

### 2.2 Drizzle Schema Reference ✅
- **File:** `components/docs/backend-scaffold/drizzle-schema.ts`
- **Content:** Full Drizzle ORM schema for all entities matching TypeScript interfaces

### 2.3 Lucia Auth Reference ✅
- **File:** `components/docs/backend-scaffold/lucia-auth.ts`
- **Content:** Lucia configuration with Drizzle adapter, session management

### 2.4 Express Routes Reference ✅
- **File:** `components/docs/backend-scaffold/express-routes.ts`
- **Content:** Express router setup for all entity CRUD + auth + integrations

### 2.5 Vercel Blob Reference ✅
- **File:** `components/docs/backend-scaffold/vercel-blob.ts`
- **Content:** @vercel/blob upload/signed-url routes

### 2.6 Resend Email Reference ✅
- **File:** `components/docs/backend-scaffold/resend-email.ts`
- **Content:** Resend integration for transactional emails

---

## Phase 3: Frontend Migration

### Switching from Base44 to Custom Backend
1. Set `USE_BASE44 = false` in all service clients
2. Update `config.apiBaseUrl` in envConfig to `https://api.pacificengineeringsf.com/api`
3. Uncomment POST-MIGRATION code blocks in service clients
4. Test all CRUD operations and auth flows

### Real-time Updates
- Base44 subscriptions → WebSocket or SSE from Express backend
- File: `components/services/apiClient.js` → subscribe() method

---

## Phase 4: Deployment

### Frontend (Vercel)
- Deploy React SPA to Vercel
- Set env vars: VITE_API_BASE_URL, VITE_STRIPE_PUBLIC_KEY
- Configure custom domain: internal.pacificengineeringsf.com

### Backend (Vercel Serverless → Render)
- Initial: Vercel serverless functions
- Long-term: Render web service
- API domain: api.pacificengineeringsf.com
- Set env vars: DATABASE_URL, RESEND_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, BLOB_READ_WRITE_TOKEN

### Database
- PostgreSQL (Neon, Supabase, or Railway recommended)
- Run Drizzle migrations: `npx drizzle-kit push`

---

## Migration Checklist

### Pre-Migration
- [x] TypeScript type definitions created
- [x] Service clients abstracted with provider flags
- [x] InternalLayout uses abstracted auth
- [x] Environment config updated with migration flags
- [x] Backend scaffold documentation created

### During Migration
- [ ] Set up PostgreSQL database
- [ ] Initialize Drizzle ORM and run migrations
- [ ] Implement Lucia auth (sessions + cookies)
- [ ] Create Express routes for all entities
- [ ] Set up @vercel/blob for file uploads
- [ ] Set up Resend for transactional emails
- [ ] Migrate Stripe webhook handler
- [ ] Migrate all backend functions to Express routes

### Post-Migration
- [ ] Flip USE_BASE44 = false in all service clients
- [ ] Uncomment REST API code in service clients
- [ ] Test all CRUD operations
- [ ] Test authentication flows (login, logout, session persistence)
- [ ] Test file uploads and downloads
- [ ] Test email sending
- [ ] Test Stripe payments and webhooks
- [ ] Deploy frontend to Vercel with custom domain
- [ ] Deploy backend to Vercel (then Render)
- [ ] Run end-to-end tests
- [ ] Data migration from Base44 to PostgreSQL