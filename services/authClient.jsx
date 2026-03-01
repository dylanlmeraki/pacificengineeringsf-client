/**
 * Abstracted Authentication Client for Pacific Engineering Internal Portal
 * 
 * MIGRATION LAYER: Currently wraps Base44 SDK auth.
 * Post-migration: Replace with Lucia session-based auth via cookies
 * hitting https://api.pacificengineeringsf.com/api/auth/*
 * 
 * All frontend code should import from this file, NOT from base44.auth directly.
 */

import { base44 } from "@/api/base44Client";
import { config } from "@/components/utils/envConfig";

// ============================================================================
// Provider flag — flip to switch from Base44 to Lucia REST endpoints
// ============================================================================
const USE_BASE44 = true;

const API_BASE_URL = config.apiBaseUrl || 'https://api.pacificengineeringsf.com/api';

/**
 * Get the current authenticated user
 * @returns {Promise<Object|null>} User object or null if not authenticated
 */
export async function getMe() {
  if (USE_BASE44) {
    try { return await base44.auth.me(); } catch { return null; }
  }
  // POST-MIGRATION:
  // try {
  //   const res = await fetch(`${API_BASE_URL}/auth/me`, { credentials: 'include' });
  //   if (!res.ok) return null;
  //   return await res.json();
  // } catch { return null; }
}

/**
 * Check if user is currently authenticated
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  if (USE_BASE44) {
    try { return await base44.auth.isAuthenticated(); } catch { return false; }
  }
  // POST-MIGRATION:
  // try {
  //   const res = await fetch(`${API_BASE_URL}/auth/session`, { credentials: 'include' });
  //   return res.ok;
  // } catch { return false; }
}

/**
 * Log out the current user
 * @param {string} [redirectUrl] - URL to redirect to after logout
 */
export async function logout(redirectUrl) {
  if (USE_BASE44) {
    try { await base44.auth.logout(redirectUrl); } catch (e) { console.error("logout failed", e); }
    return;
  }
  // POST-MIGRATION:
  // try {
  //   await fetch(`${API_BASE_URL}/auth/logout`, {
  //     method: 'POST',
  //     credentials: 'include',
  //   });
  //   if (redirectUrl) {
  //     window.location.href = redirectUrl;
  //   } else {
  //     window.location.reload();
  //   }
  // } catch (e) { console.error("logout failed", e); }
}

/**
 * Redirect user to the login page
 * @param {string} [nextUrl] - URL to redirect back to after login
 */
export function redirectToLogin(nextUrl) {
  if (USE_BASE44) {
    try { base44.auth.redirectToLogin(nextUrl); } catch (e) { console.error("login redirect failed", e); }
    return;
  }
  // POST-MIGRATION:
  // window.location.href = `/login${nextUrl ? `?next=${encodeURIComponent(nextUrl)}` : ''}`;
}

/**
 * Update the current user's profile data
 * @param {Object} data - Fields to update
 * @returns {Promise<Object>} Updated user object
 */
export async function updateMe(data) {
  if (USE_BASE44) {
    return await base44.auth.updateMe(data);
  }
  // POST-MIGRATION:
  // const res = await fetch(`${API_BASE_URL}/auth/me`, {
  //   method: 'PUT',
  //   credentials: 'include',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data),
  // });
  // return res.json();
}

/**
 * Login with email/password credentials (post-migration only)
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} User object
 */
export async function login(credentials) {
  if (USE_BASE44) {
    // Base44 handles login via redirectToLogin — no direct credential login
    throw new Error('Direct login not available on Base44. Use redirectToLogin().');
  }
  // POST-MIGRATION:
  // const res = await fetch(`${API_BASE_URL}/auth/login`, {
  //   method: 'POST',
  //   credentials: 'include',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(credentials),
  // });
  // if (!res.ok) {
  //   const err = await res.json();
  //   throw new Error(err.message || 'Login failed');
  // }
  // return res.json();
}

/**
 * Register a new user (post-migration only)
 * @param {Object} userData - { email, password, full_name }
 * @returns {Promise<Object>} Created user object
 */
export async function register(userData) {
  if (USE_BASE44) {
    throw new Error('Registration not available on Base44. Users must be invited.');
  }
  // POST-MIGRATION:
  // const res = await fetch(`${API_BASE_URL}/auth/register`, {
  //   method: 'POST',
  //   credentials: 'include',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(userData),
  // });
  // if (!res.ok) {
  //   const err = await res.json();
  //   throw new Error(err.message || 'Registration failed');
  // }
  // return res.json();
}

export default { getMe, isAuthenticated, logout, redirectToLogin, updateMe, login, register };