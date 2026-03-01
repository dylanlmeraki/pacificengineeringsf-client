/**
 * Express Routes Reference for Pacific Engineering API
 * 
 * REFERENCE FILE — Copy and adapt for your Node.js backend project.
 * 
 * Structure:
 *   src/routes/index.ts     — Main router
 *   src/routes/auth.ts      — Auth routes (see lucia-auth.ts)
 *   src/routes/entities.ts  — Generic entity CRUD
 *   src/routes/integrations.ts — LLM, email, file upload
 *   src/routes/stripe.ts    — Stripe webhooks
 *   src/routes/functions.ts — Migrated backend functions
 * 
 * Prerequisites:
 *   pnpm add express cors cookie-parser helmet
 *   pnpm add -D @types/express @types/cors @types/cookie-parser
 */

// ===== src/index.ts — Main server entry point =====

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { authMiddleware } from './auth/middleware';
import { authRouter } from './auth/routes';
import { createEntityRouter } from './routes/entities';
import { integrationsRouter } from './routes/integrations';
import { stripeRouter } from './routes/stripe';
import { functionsRouter } from './routes/functions';

const app = express();

// Security
app.use(helmet());

// CORS — allow both internal and client portals
app.use(cors({
  origin: [
    'https://internal.pacificengineeringsf.com',
    'https://portal.pacificengineeringsf.com',
    'https://pacificengineeringsf.com',
    'http://localhost:3000', // Local dev
    'http://localhost:5173', // Vite dev
  ],
  credentials: true, // Required for cookies
}));

// Body parsing — IMPORTANT: Stripe webhooks need raw body
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Session middleware — runs on every request
app.use(authMiddleware);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/integrations', integrationsRouter);
app.use('/api/stripe', stripeRouter);
app.use('/api/functions', functionsRouter);

// Entity CRUD routes — one router per entity
const entityNames = [
  'prospects', 'interactions', 'tasks', 'projects',
  'project-documents', 'project-milestones', 'change-orders', 'project-messages',
  'proposals', 'proposal-templates', 'invoices', 'workflows',
  'blog-posts', 'calendar-settings', 'email-settings', 'icp-settings',
  'audit-logs', 'notifications', 'client-invites', 'project-requests',
  'rfis', 'sales-outreach', 'email-sequences', 'scheduled-reports',
  'custom-pages', 'dashboard-configs',
];

for (const entity of entityNames) {
  app.use(`/api/${entity}`, createEntityRouter(entity));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});


// ===== src/routes/entities.ts — Generic entity CRUD factory =====

import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../auth/middleware';
import { db } from '../db';
import * as schema from '../db/schema';
import { eq, desc, asc, and, sql } from 'drizzle-orm';

/**
 * Creates a CRUD router for any entity table.
 * Maps URL entity name (kebab-case) to Drizzle table name (camelCase).
 */
export function createEntityRouter(entityName: string): Router {
  const router = Router();

  // Map kebab-case URL to Drizzle schema table
  const tableMap: Record<string, any> = {
    'prospects': schema.prospects,
    'interactions': schema.interactions,
    'tasks': schema.tasks,
    'projects': schema.projects,
    'project-documents': schema.projectDocuments,
    'project-milestones': schema.projectMilestones,
    'change-orders': schema.changeOrders,
    'project-messages': schema.projectMessages,
    'proposals': schema.proposals,
    'proposal-templates': schema.proposalTemplates,
    'invoices': schema.invoices,
    'workflows': schema.workflows,
    'blog-posts': schema.blogPosts,
    'calendar-settings': schema.calendarSettings,
    'email-settings': schema.emailSettings,
    'icp-settings': schema.icpSettings,
    'audit-logs': schema.auditLogs,
    'notifications': schema.notifications,
    'client-invites': schema.clientInvites,
    'project-requests': schema.projectRequests,
    'rfis': schema.rfis,
    'sales-outreach': schema.salesOutreach,
    'email-sequences': schema.emailSequences,
    'scheduled-reports': schema.scheduledReports,
    'custom-pages': schema.customPages,
    'dashboard-configs': schema.dashboardConfigs,
  };

  const table = tableMap[entityName];
  if (!table) throw new Error(`Unknown entity: ${entityName}`);

  // GET / — List all records (with optional sort & limit)
  router.get('/', requireAuth, async (req: Request, res: Response) => {
    const { sort, limit: limitStr } = req.query;
    const limit = limitStr ? parseInt(limitStr as string) : 50;
    
    let orderBy = desc(table.created_date);
    if (sort && typeof sort === 'string') {
      const field = sort.startsWith('-') ? sort.slice(1) : sort;
      const direction = sort.startsWith('-') ? desc : asc;
      if (table[field]) {
        orderBy = direction(table[field]);
      }
    }

    const records = await db.select().from(table).orderBy(orderBy).limit(limit);
    return res.json(records);
  });

  // POST /filter — Filter records by query
  router.post('/filter', requireAuth, async (req: Request, res: Response) => {
    const { query, sort, limit: limitVal } = req.body;
    const limit = limitVal || 50;

    // Build WHERE conditions from query object
    const conditions = [];
    for (const [key, value] of Object.entries(query || {})) {
      if (table[key]) {
        conditions.push(eq(table[key], value));
      }
    }

    let orderBy = desc(table.created_date);
    if (sort && typeof sort === 'string') {
      const field = sort.startsWith('-') ? sort.slice(1) : sort;
      const direction = sort.startsWith('-') ? desc : asc;
      if (table[field]) {
        orderBy = direction(table[field]);
      }
    }

    const records = await db
      .select()
      .from(table)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(orderBy)
      .limit(limit);

    return res.json(records);
  });

  // GET /:id — Get single record
  router.get('/:id', requireAuth, async (req: Request, res: Response) => {
    const [record] = await db.select().from(table).where(eq(table.id, req.params.id)).limit(1);
    if (!record) return res.status(404).json({ error: 'Not found' });
    return res.json(record);
  });

  // POST / — Create record
  router.post('/', requireAuth, async (req: Request, res: Response) => {
    const data = {
      ...req.body,
      created_by: req.user!.email,
    };
    const [record] = await db.insert(table).values(data).returning();
    return res.status(201).json(record);
  });

  // POST /bulk — Bulk create
  router.post('/bulk', requireAuth, async (req: Request, res: Response) => {
    const { records: recordsData } = req.body;
    const data = recordsData.map((r: any) => ({
      ...r,
      created_by: req.user!.email,
    }));
    const records = await db.insert(table).values(data).returning();
    return res.status(201).json(records);
  });

  // PUT /:id — Update record
  router.put('/:id', requireAuth, async (req: Request, res: Response) => {
    const data = {
      ...req.body,
      updated_date: new Date(),
    };
    delete data.id;
    delete data.created_date;
    delete data.created_by;

    const [record] = await db
      .update(table)
      .set(data)
      .where(eq(table.id, req.params.id))
      .returning();

    if (!record) return res.status(404).json({ error: 'Not found' });
    return res.json(record);
  });

  // DELETE /:id — Delete record
  router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
    const [deleted] = await db.delete(table).where(eq(table.id, req.params.id)).returning();
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    return res.status(204).send();
  });

  return router;
}