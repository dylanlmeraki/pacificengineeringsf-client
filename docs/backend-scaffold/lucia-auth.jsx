/**
 * Lucia Auth Configuration for Pacific Engineering
 * 
 * REFERENCE FILE — Copy to your Node.js backend project at:
 *   src/auth/index.ts
 * 
 * Based on: https://github.com/iamtouha/next-lucia-auth
 * Adapted for: Express (not Next.js), Drizzle ORM, PostgreSQL
 * 
 * Prerequisites:
 *   pnpm add lucia @lucia-auth/adapter-drizzle oslo
 *   pnpm add @node-rs/argon2   # For password hashing
 */

// ===== src/auth/index.ts =====

import { Lucia, TimeSpan } from 'lucia';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { db } from '../db'; // Your Drizzle db instance
import { users, sessions } from '../db/schema';

// Initialize the Drizzle adapter for Lucia
const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

// Create the Lucia instance
export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(30, 'd'), // 30 day sessions
  sessionCookie: {
    name: 'pe_session', // Pacific Engineering session cookie
    attributes: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: process.env.NODE_ENV === 'production' 
        ? '.pacificengineeringsf.com'  // Allows cookie sharing across subdomains
        : undefined,
    },
  },
  getUserAttributes: (attributes) => {
    return {
      email: attributes.email,
      full_name: attributes.full_name,
      role: attributes.role,
      avatar_url: attributes.avatar_url,
      phone: attributes.phone,
      department: attributes.department,
      title: attributes.title,
      email_verified: attributes.email_verified,
    };
  },
});

// TypeScript module augmentation for Lucia
declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  email: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
  phone: string | null;
  department: string | null;
  title: string | null;
  email_verified: boolean;
}


// ===== src/auth/middleware.ts =====
// Express middleware for session validation

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware: Validates session cookie and attaches user to req
 * Usage: app.use(authMiddleware);
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const sessionId = lucia.readSessionCookie(req.headers.cookie ?? '');
  
  if (!sessionId) {
    req.user = null;
    req.session = null;
    return next();
  }

  const { session, user } = await lucia.validateSession(sessionId);

  if (session && session.fresh) {
    // Refresh the session cookie
    const cookie = lucia.createSessionCookie(session.id);
    res.cookie(cookie.name, cookie.value, cookie.attributes);
  }

  if (!session) {
    // Clear invalid session cookie
    const cookie = lucia.createBlankSessionCookie();
    res.cookie(cookie.name, cookie.value, cookie.attributes);
  }

  req.user = user;
  req.session = session;
  next();
}

/**
 * Middleware: Requires authentication — returns 401 if not authenticated
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user || !req.session) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

/**
 * Middleware: Requires admin role — returns 403 if not admin
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}


// ===== src/auth/routes.ts =====
// Auth Express routes

import { Router } from 'express';
import { hash, verify } from '@node-rs/argon2';
import { generateIdFromEntropySize } from 'lucia';

const authRouter = Router();

// POST /api/auth/register
authRouter.post('/register', async (req, res) => {
  const { email, password, full_name } = req.body;

  if (!email || !password || !full_name) {
    return res.status(400).json({ error: 'Email, password, and full name are required' });
  }

  // Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email.toLowerCase()),
  });

  if (existingUser) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  // Hash password with Argon2id
  const hashedPassword = await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  // Create user
  const userId = generateIdFromEntropySize(10);
  const [newUser] = await db.insert(users).values({
    id: userId,
    email: email.toLowerCase(),
    full_name,
    hashed_password: hashedPassword,
    role: 'user',
    created_by: email.toLowerCase(),
  }).returning();

  // Create session
  const session = await lucia.createSession(userId, {});
  const cookie = lucia.createSessionCookie(session.id);
  res.cookie(cookie.name, cookie.value, cookie.attributes);

  return res.status(201).json({
    id: newUser.id,
    email: newUser.email,
    full_name: newUser.full_name,
    role: newUser.role,
  });
});

// POST /api/auth/login
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email.toLowerCase()),
  });

  if (!user || !user.hashed_password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const validPassword = await verify(user.hashed_password, password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const session = await lucia.createSession(user.id, {});
  const cookie = lucia.createSessionCookie(session.id);
  res.cookie(cookie.name, cookie.value, cookie.attributes);

  return res.json({
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
  });
});

// POST /api/auth/logout
authRouter.post('/logout', async (req, res) => {
  if (req.session) {
    await lucia.invalidateSession(req.session.id);
  }
  const cookie = lucia.createBlankSessionCookie();
  res.cookie(cookie.name, cookie.value, cookie.attributes);
  return res.json({ success: true });
});

// GET /api/auth/me
authRouter.get('/me', requireAuth, async (req, res) => {
  return res.json({
    id: req.user!.id,
    email: req.user!.email,
    full_name: req.user!.full_name,
    role: req.user!.role,
    avatar_url: req.user!.avatar_url,
    phone: req.user!.phone,
    department: req.user!.department,
    title: req.user!.title,
  });
});

// PUT /api/auth/me
authRouter.put('/me', requireAuth, async (req, res) => {
  const allowedFields = ['full_name', 'avatar_url', 'phone', 'department', 'title'];
  const updateData: Record<string, any> = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  }

  updateData.updated_date = new Date();

  const [updated] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, req.user!.id))
    .returning();

  return res.json({
    id: updated.id,
    email: updated.email,
    full_name: updated.full_name,
    role: updated.role,
    avatar_url: updated.avatar_url,
    phone: updated.phone,
    department: updated.department,
    title: updated.title,
  });
});

// GET /api/auth/session — lightweight session check
authRouter.get('/session', (req, res) => {
  if (req.user && req.session) {
    return res.json({ valid: true, userId: req.user.id });
  }
  return res.status(401).json({ valid: false });
});

export { authRouter };