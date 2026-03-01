import { base44 } from "@/api/base44Client";

// Integrations wrapper to swap Base44 Core integrations with your own backend later
export async function invokeLLM(params: any) {
  try {
    return await base44.integrations.Core.InvokeLLM(params);
  } catch (err: any) {
    console.error("[integrationsClient.invokeLLM] failed", err);
    throw new Error(err?.message || "LLM invocation failed");
  }
}

export async function sendEmail(params: { to: string; subject: string; body: string; from_name?: string }) {
  try {
    return await base44.integrations.Core.SendEmail(params as any);
  } catch (err: any) {
    console.error("[integrationsClient.sendEmail] failed", err);
    throw new Error(err?.message || "Email send failed");
  }
}

export async function uploadFile(file: File) {
  try {
    return await base44.integrations.Core.UploadFile({ file } as any);
  } catch (err: any) {
    console.error("[integrationsClient.uploadFile] failed", err);
    throw new Error(err?.message || "File upload failed");
  }
}

export default { invokeLLM, sendEmail, uploadFile };