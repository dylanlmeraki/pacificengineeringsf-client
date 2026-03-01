
# ===========================================
# Pacific Engineering - Production Environment
# ===========================================
# Production-specific environment variables
# These should be set in your deployment platform
# (e.g., Vercel, Heroku, AWS, etc.)
# ===========================================

# Application Environment
NODE_ENV=production

# ===========================================
# Base44 Platform Configuration
# ===========================================
BASE44_APP_ID=${BASE44_APP_ID}
VITE_BASE_URL=https://pacificengineeringsf.com
VITE_API_BASE_URL=

# ===========================================
# Domain Configuration
# ===========================================
VITE_MAIN_DOMAIN=pacificengineeringsf.com
VITE_INTERNAL_SUBDOMAIN=internalportal
VITE_CLIENT_SUBDOMAIN=clientportal

# ===========================================
# Stripe Integration (LIVE KEYS)
# ===========================================
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
VITE_STRIPE_PUBLIC_KEY=${VITE_STRIPE_PUBLIC_KEY}

# ===========================================
# Google Calendar Integration
# ===========================================
GOOGLE_CALENDAR_CLIENT_ID=${GOOGLE_CALENDAR_CLIENT_ID}
GOOGLE_CALENDAR_API_KEY=${GOOGLE_CALENDAR_API_KEY}
google_oauth_client_secret=${google_oauth_client_secret}

# ===========================================
# Feature Flags
# ===========================================
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_CHATBOT=true
VITE_ENABLE_NOTIFICATIONS=true

# ===========================================
# Application Settings
# ===========================================
VITE_APP_NAME=Pacific Engineering
VITE_APP_VERSION=1.0.0

# ===========================================
# Logging Configuration
# ===========================================
LOG_LEVEL=warn

# ===========================================
# Session & Security
# ===========================================
SESSION_SECRET=${SESSION_SECRET}
COOKIE_SECURE=true

# ===========================================
# Rate Limiting
# ===========================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ===========================================
# CORS Configuration
# ===========================================
CORS_ALLOWED_ORIGINS=https://pacificengineeringsf.com,https://internalportal.pacificengineeringsf.com,https://clientportal.pacificengineeringsf.com
