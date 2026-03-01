/**
 * Abstracted Integrations Client for Pacific Engineering Internal Portal
 * 
 * MIGRATION LAYER: Currently wraps Base44 SDK integrations.
 * Post-migration:
 *   - InvokeLLM → Express route /api/integrations/llm (calls OpenAI/Anthropic)
 *   - SendEmail → Express route /api/integrations/email (uses Resend)
 *   - UploadFile → Express route /api/integrations/upload (uses @vercel/blob)
 *   - GenerateImage → Express route /api/integrations/image
 *   - ExtractData → Express route /api/integrations/extract
 * 
 * All frontend code should import from this file, NOT from base44.integrations directly.
 */

import { base44 } from "@/api/base44Client";
import { config } from "@/components/utils/envConfig";

// ============================================================================
// Provider flag
// ============================================================================
const USE_BASE44 = true;

const API_BASE_URL = config.apiBaseUrl || 'https://api.pacificengineeringsf.com/api';

/**
 * Invoke an LLM with a prompt
 * @param {Object} params - { prompt, add_context_from_internet?, response_json_schema?, file_urls? }
 * @returns {Promise<Object|string>} LLM response
 */
export async function invokeLLM(params) {
  if (USE_BASE44) {
    return await base44.integrations.Core.InvokeLLM(params);
  }
  // POST-MIGRATION:
  // const res = await fetch(`${API_BASE_URL}/integrations/llm`, {
  //   method: 'POST',
  //   credentials: 'include',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(params),
  // });
  // return res.json();
}

/**
 * Send an email via Resend (post-migration) or Base44 (current)
 * @param {Object} params - { to, subject, body, from_name? }
 * @returns {Promise<Object>}
 */
export async function sendEmail(params) {
  if (USE_BASE44) {
    return await base44.integrations.Core.SendEmail(params);
  }
  // POST-MIGRATION (Resend):
  // const res = await fetch(`${API_BASE_URL}/integrations/email`, {
  //   method: 'POST',
  //   credentials: 'include',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(params),
  // });
  // return res.json();
}

/**
 * Upload a file
 * Currently: Base44 file storage
 * Post-migration: @vercel/blob
 * @param {File} file - File object to upload
 * @returns {Promise<{file_url: string}>}
 */
export async function uploadFile(file) {
  if (USE_BASE44) {
    return await base44.integrations.Core.UploadFile({ file });
  }
  // POST-MIGRATION (@vercel/blob):
  // const formData = new FormData();
  // formData.append('file', file);
  // const res = await fetch(`${API_BASE_URL}/integrations/upload`, {
  //   method: 'POST',
  //   credentials: 'include',
  //   body: formData,
  // });
  // return res.json(); // { file_url: string }
}

/**
 * Upload a private file (signed URL access only)
 * @param {File} file
 * @returns {Promise<{file_uri: string}>}
 */
export async function uploadPrivateFile(file) {
  if (USE_BASE44) {
    return await base44.integrations.Core.UploadPrivateFile({ file });
  }
  // POST-MIGRATION:
  // const formData = new FormData();
  // formData.append('file', file);
  // const res = await fetch(`${API_BASE_URL}/integrations/upload-private`, {
  //   method: 'POST',
  //   credentials: 'include',
  //   body: formData,
  // });
  // return res.json(); // { file_uri: string }
}

/**
 * Create a signed URL for a private file
 * @param {string} fileUri
 * @param {number} [expiresIn=300] - Seconds until URL expires
 * @returns {Promise<{signed_url: string}>}
 */
export async function createSignedUrl(fileUri, expiresIn = 300) {
  if (USE_BASE44) {
    return await base44.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri, expires_in: expiresIn });
  }
  // POST-MIGRATION:
  // const res = await fetch(`${API_BASE_URL}/integrations/signed-url`, {
  //   method: 'POST',
  //   credentials: 'include',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ file_uri: fileUri, expires_in: expiresIn }),
  // });
  // return res.json();
}

/**
 * Generate an image via AI
 * @param {Object} params - { prompt, existing_image_urls? }
 * @returns {Promise<{url: string}>}
 */
export async function generateImage(params) {
  if (USE_BASE44) {
    return await base44.integrations.Core.GenerateImage(params);
  }
  // POST-MIGRATION:
  // const res = await fetch(`${API_BASE_URL}/integrations/image`, {
  //   method: 'POST',
  //   credentials: 'include',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(params),
  // });
  // return res.json();
}

/**
 * Extract structured data from an uploaded file
 * @param {Object} params - { file_url, json_schema }
 * @returns {Promise<Object>}
 */
export async function extractData(params) {
  if (USE_BASE44) {
    return await base44.integrations.Core.ExtractDataFromUploadedFile(params);
  }
  // POST-MIGRATION:
  // const res = await fetch(`${API_BASE_URL}/integrations/extract`, {
  //   method: 'POST',
  //   credentials: 'include',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(params),
  // });
  // return res.json();
}

export default {
  invokeLLM,
  sendEmail,
  uploadFile,
  uploadPrivateFile,
  createSignedUrl,
  generateImage,
  extractData,
};