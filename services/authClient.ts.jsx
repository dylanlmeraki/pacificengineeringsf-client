import { base44 } from "@/api/base44Client";

// Auth wrapper to decouple pages from Base44 auth API
export async function getMe() {
  try {
    return await base44.auth.me();
  } catch (err: any) {
    console.error("[authClient.getMe] failed", err);
    return null; // be forgiving in UI paths
  }
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    return await base44.auth.isAuthenticated();
  } catch {
    return false;
  }
}

export async function logout(redirectUrl?: string) {
  try {
    await base44.auth.logout(redirectUrl);
  } catch (err) {
    console.error("[authClient.logout] failed", err);
  }
}

export async function redirectToLogin(nextUrl?: string) {
  try {
    await base44.auth.redirectToLogin(nextUrl);
  } catch (err) {
    console.error("[authClient.redirectToLogin] failed", err);
  }
}

export default { getMe, isAuthenticated, logout, redirectToLogin };