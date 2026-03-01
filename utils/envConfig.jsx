// Environment Configuration Helper for Node.js Deployment
// Provides safe access to environment variables with fallbacks

/**
 * Get environment variable with optional default
 * Works in both browser and Node.js environments
 */
export function getEnvVar(key, defaultValue = '') {
  // Node.js environment
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  
  // Browser environment with import.meta.env (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || import.meta.env[`VITE_${key}`] || defaultValue;
  }
  
  // Fallback
  return defaultValue;
}

/**
 * Check if running in production
 */
export function isProduction() {
  return getEnvVar('NODE_ENV', 'development') === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment() {
  return getEnvVar('NODE_ENV', 'development') === 'development';
}

/**
 * Get the base URL for the application
 */
export function getBaseUrl() {
  return getEnvVar('VITE_BASE_URL', getEnvVar('BASE_URL', 'http://localhost:3000'));
}

/**
 * Get API base URL
 */
export function getApiBaseUrl() {
  return getEnvVar('VITE_API_BASE_URL', getEnvVar('API_BASE_URL', ''));
}

/**
 * Configuration object with all environment settings
 */
export const config = {
  // App settings
  appName: getEnvVar('VITE_APP_NAME', 'Pacific Engineering'),
  appId: getEnvVar('BASE44_APP_ID', ''),
  
  // URLs
  baseUrl: getBaseUrl(),
  apiBaseUrl: getApiBaseUrl(),
  mainDomain: getEnvVar('VITE_MAIN_DOMAIN', 'pacificengineeringsf.com'),
  internalPortalUrl: getEnvVar('INTERNAL_PORTAL_URL', 'https://internal.pacificengineeringsf.com'),
  mainWebsiteUrl: getEnvVar('MAIN_WEBSITE_URL', 'https://pacificengineeringsf.com'),
  clientPortalUrl: getEnvVar('CLIENT_PORTAL_URL', 'https://portal.pacificengineeringsf.com'),
  
  // Feature flags
  enableAnalytics: getEnvVar('VITE_ENABLE_ANALYTICS', 'true') === 'true',
  enableChatbot: getEnvVar('VITE_ENABLE_CHATBOT', 'true') === 'true',
  enableNotifications: getEnvVar('VITE_ENABLE_NOTIFICATIONS', 'true') === 'true',
  
  // External services
  stripePublicKey: getEnvVar('VITE_STRIPE_PUBLIC_KEY', ''),
  googleCalendarClientId: getEnvVar('GOOGLE_CALENDAR_CLIENT_ID', ''),
  
  // Migration configuration
  useBase44: true, // Set to false post-migration to switch to custom backend
  
  // Post-migration backend config
  backendProvider: 'base44', // 'base44' | 'custom' — controls which API layer is active
  authProvider: 'base44', // 'base44' | 'lucia' — controls auth strategy
  fileStorageProvider: 'base44', // 'base44' | 'vercel-blob' — controls file upload target
  emailProvider: 'base44', // 'base44' | 'resend' — controls email sending
  
  // Environment
  isProduction: isProduction(),
  isDevelopment: isDevelopment(),
  nodeEnv: getEnvVar('NODE_ENV', 'development')
};

export default config;