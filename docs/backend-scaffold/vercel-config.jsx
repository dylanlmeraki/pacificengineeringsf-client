{
  "_comment": "REFERENCE FILE — Place in root of your backend project as vercel.json",
  "_comment2": "This configures Vercel serverless deployment for the Express API",
  
  "version": 2,
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "src/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "src/index.ts"
    }
  ],
  "env": {
    "DATABASE_URL": "@database-url",
    "STRIPE_SECRET_KEY": "@stripe-secret-key",
    "STRIPE_WEBHOOK_SECRET": "@stripe-webhook-secret",
    "BLOB_READ_WRITE_TOKEN": "@blob-read-write-token",
    "RESEND_API_KEY": "@resend-api-key",
    "FROM_EMAIL": "notifications@pacificengineeringsf.com",
    "FROM_NAME": "Pacific Engineering",
    "NODE_ENV": "production",
    "GOOGLE_CALENDAR_API_KEY": "@google-calendar-api-key",
    "GOOGLE_CALENDAR_CLIENT_ID": "@google-calendar-client-id",
    "google_oauth_client_secret": "@google-oauth-client-secret"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Credentials",
          "value": "true"
        },
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://internal.pacificengineeringsf.com"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET,POST,PUT,DELETE,OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}