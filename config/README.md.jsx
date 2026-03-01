# Environment Configuration Guide

## Overview

This application is designed to run in a Node.js environment and uses environment variables for configuration. This guide explains how to set up your environment for development and production deployments.

## Quick Start

1. Copy the example environment file:
   ```bash
   cp components/config/env.example .env
   ```

2. Fill in your values in the `.env` file

3. Never commit `.env` files to version control

## Environment Files

| File | Purpose |
|------|---------|
| `env.example` | Template with all available variables and documentation |
| `env.development` | Development-specific defaults |
| `env.production` | Production-specific defaults |

## Required Variables

### Base44 Platform
- `BASE44_APP_ID` - Your Base44 application ID

### Stripe Integration
- `STRIPE_SECRET_KEY` - Stripe secret API key
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret
- `VITE_STRIPE_PUBLIC_KEY` - Publishable key for frontend

### Google Calendar
- `GOOGLE_CALENDAR_CLIENT_ID` - OAuth client ID
- `GOOGLE_CALENDAR_API_KEY` - API key
- `google_oauth_client_secret` - OAuth client secret

## Feature Flags

Control features via environment variables:
- `VITE_ENABLE_ANALYTICS` - Enable/disable analytics tracking
- `VITE_ENABLE_CHATBOT` - Enable/disable the chatbot
- `VITE_ENABLE_NOTIFICATIONS` - Enable/disable notifications

## Domain Configuration

For multi-subdomain support:
- `VITE_MAIN_DOMAIN` - Main domain (e.g., `pacificengineeringsf.com`)
- `VITE_INTERNAL_SUBDOMAIN` - Internal portal subdomain
- `VITE_CLIENT_SUBDOMAIN` - Client portal subdomain

## Security Notes

1. **Never expose secret keys** in frontend code
2. **Use HTTPS** in production (`COOKIE_SECURE=true`)
3. **Rotate secrets** periodically
4. **Set strong session secrets** (minimum 32 characters)

## Deployment Platforms

### Vercel
Set environment variables in Project Settings > Environment Variables

### Heroku
```bash
heroku config:set NODE_ENV=production
heroku config:set STRIPE_SECRET_KEY=sk_live_xxx
```

### AWS/Docker
Use `.env` files or environment-specific configurations

## Logging

Configure log levels:
- `debug` - All logs (development only)
- `info` - Info and above
- `warn` - Warnings and errors only (recommended for production)
- `error` - Errors only

## Troubleshooting

### Common Issues

1. **Authentication errors** - Check `BASE44_APP_ID` is set correctly
2. **Stripe not working** - Verify all three Stripe keys are set
3. **Calendar issues** - Ensure Google OAuth credentials are valid
4. **CORS errors** - Update `CORS_ALLOWED_ORIGINS`

### Debug Mode

Set `LOG_LEVEL=debug` to see detailed logs during development.