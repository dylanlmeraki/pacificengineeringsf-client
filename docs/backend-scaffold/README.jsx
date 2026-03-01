# Pacific Engineering — Backend Scaffold

## Quick Start

```bash
# 1. Clone and install
mkdir pe-api && cd pe-api
pnpm init
pnpm add express cors cookie-parser helmet
pnpm add drizzle-orm pg lucia @lucia-auth/adapter-drizzle oslo @node-rs/argon2
pnpm add resend @vercel/blob multer stripe
pnpm add -D typescript @types/express @types/cors @types/cookie-parser @types/multer
pnpm add -D drizzle-kit tsx nodemon

# 2. Copy reference files from components/docs/backend-scaffold/ to src/
# 3. Set up environment variables (see below)
# 4. Push database schema
npx drizzle-kit push

# 5. Run dev server
npx tsx watch src/index.ts
```

## Project Structure

```
pe-api/
├── src/
│   ├── index.ts                  # Express server entry
│   ├── db/
│   │   ├── index.ts              # Drizzle client setup
│   │   └── schema.ts             # ← drizzle-schema.ts
│   ├── auth/
│   │   ├── index.ts              # ← lucia-auth.ts (Lucia config)
│   │   ├── middleware.ts          # ← lucia-auth.ts (middleware section)
│   │   └── routes.ts             # ← lucia-auth.ts (routes section)
│   ├── routes/
│   │   ├── entities.ts           # ← express-routes.ts (entity CRUD factory)
│   │   ├── integrations.ts       # Combined: vercel-blob.ts + resend-email.ts + LLM
│   │   ├── stripe.ts             # Stripe webhook handler
│   │   └── functions.ts          # Migrated Base44 backend functions
│   └── lib/
│       └── email.ts              # ← resend-email.ts (utility)
├── drizzle.config.ts
├── package.json
├── tsconfig.json
└── .env
```

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/pacific_engineering

# Auth
NODE_ENV=production

# File Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx

# Email (Resend)
RESEND_API_KEY=re_xxxxx
FROM_EMAIL=notifications@pacificengineeringsf.com
FROM_NAME=Pacific Engineering

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Google Calendar (existing)
GOOGLE_CALENDAR_API_KEY=xxxxx
GOOGLE_CALENDAR_CLIENT_ID=xxxxx
google_oauth_client_secret=xxxxx
```

## drizzle.config.ts

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"]
}
```

## Deployment

### Vercel (Initial)
- Create a new Vercel project
- Set environment variables in Vercel dashboard
- Deploy with `vercel deploy`

### Render (Long-term)
- Create a new Web Service on Render
- Connect your Git repository
- Set build command: `pnpm build`
- Set start command: `node dist/index.js`
- Set environment variables
- Configure custom domain: api.pacificengineeringsf.com

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login with credentials |
| POST | /api/auth/logout | Logout (clear session) |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/me | Update current user profile |
| GET | /api/auth/session | Check session validity |

### Entities (repeated for each entity)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/{entity} | List records |
| POST | /api/{entity}/filter | Filter records |
| GET | /api/{entity}/:id | Get single record |
| POST | /api/{entity} | Create record |
| POST | /api/{entity}/bulk | Bulk create |
| PUT | /api/{entity}/:id | Update record |
| DELETE | /api/{entity}/:id | Delete record |

### Integrations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/integrations/upload | Upload file (@vercel/blob) |
| POST | /api/integrations/upload-private | Upload private file |
| POST | /api/integrations/signed-url | Get signed URL |
| DELETE | /api/integrations/files | Delete file |
| GET | /api/integrations/files | List files |
| POST | /api/integrations/email | Send email (Resend) |
| POST | /api/integrations/llm | Invoke LLM |

### Stripe
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/stripe/webhook | Stripe webhook handler |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |