// Subdomain detection and routing helpers

const INTERNAL_DOMAIN = "internal.pacificengineeringsf.com";
const CLIENT_DOMAIN = "portal.pacificengineeringsf.com";
const MAIN_DOMAIN = "pacificengineeringsf.com";

/**
 * Get the current hostname
 */
export function getHostname() {
  if (typeof window === "undefined") return "";
  return window.location.hostname;
}

/**
 * Detect the portal type based on subdomain
 * @returns {"internal" | "client" | "main" | "dev"}
 */
export function getPortalType() {
  const hostname = getHostname();

  // Local development
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "dev";
  }

  if (hostname === INTERNAL_DOMAIN) {
    return "internal";
  }

  if (hostname === CLIENT_DOMAIN) {
    return "client";
  }

  // Main domain or other
  return "main";
}

/**
 * Check if current domain is the internal portal
 */
export function isInternalPortal() {
  return getPortalType() === "internal";
}

/**
 * Check if current domain is the client portal
 */
export function isClientPortal() {
  return getPortalType() === "client";
}

/**
 * Check if current domain is the main public site
 */
export function isMainDomain() {
  const type = getPortalType();
  return type === "main" || type === "dev";
}

/**
 * Get the URL for the internal portal
 * @param {string} path - Optional path to append
 */
export function getInternalPortalUrl(path = "") {
  if (typeof window === "undefined") return "";
  const protocol = window.location.protocol;
  const baseUrl = `${protocol}//${INTERNAL_DOMAIN}`;
  return path ? `${baseUrl}${path}` : baseUrl;
}

/**
 * Get the URL for the client portal
 * @param {string} path - Optional path to append
 */
export function getClientPortalUrl(path = "") {
  if (typeof window === "undefined") return "";
  const protocol = window.location.protocol;
  const baseUrl = `${protocol}//${CLIENT_DOMAIN}`;
  return path ? `${baseUrl}${path}` : baseUrl;
}

/**
 * Get the URL for the main site
 * @param {string} path - Optional path to append
 */
export function getMainSiteUrl(path = "") {
  if (typeof window === "undefined") return "";
  const protocol = window.location.protocol;
  const baseUrl = `${protocol}//${MAIN_DOMAIN}`;
  return path ? `${baseUrl}${path}` : baseUrl;
}

/**
 * Alias for getMainSiteUrl (for backwards compatibility)
 * @param {string} path - Optional path to append
 */
export function getMainDomainUrl(path = "") {
  return getMainSiteUrl(path);
}

/**
 * Redirect to appropriate portal based on user role
 * @param {string} role - User role ('admin', 'user', 'client')
 */
export function redirectToPortal(role) {
  const portalType = getPortalType();
  
  if (role === "admin" || role === "user") {
    // Internal users should be on internal portal
    if (portalType !== "internal" && portalType !== "dev") {
      window.location.href = getInternalPortalUrl();
    }
  } else {
    // Clients should be on client portal
    if (portalType !== "client" && portalType !== "dev") {
      window.location.href = getClientPortalUrl();
    }
  }
}

export default {
  getHostname,
  getPortalType,
  isInternalPortal,
  isClientPortal,
  isMainDomain,
  getInternalPortalUrl,
  getClientPortalUrl,
  getMainSiteUrl,
  redirectToPortal
};