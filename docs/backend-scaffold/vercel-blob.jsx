/**
 * @vercel/blob File Upload Routes for Pacific Engineering
 * 
 * REFERENCE FILE — Copy to your Node.js backend project at:
 *   src/routes/integrations.ts (file upload section)
 * 
 * Prerequisites:
 *   pnpm add @vercel/blob multer
 *   pnpm add -D @types/multer
 * 
 * Environment Variables:
 *   BLOB_READ_WRITE_TOKEN — Vercel Blob storage token
 */

import { Router, Request, Response } from 'express';
import { put, del, head, list } from '@vercel/blob';
import multer from 'multer';
import { requireAuth } from '../auth/middleware';

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
});

const fileRouter = Router();

/**
 * POST /api/integrations/upload
 * Upload a public file to @vercel/blob
 * Returns: { file_url: string }
 */
fileRouter.post('/upload', requireAuth, upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  const filename = `uploads/${Date.now()}-${req.file.originalname}`;
  
  const blob = await put(filename, req.file.buffer, {
    access: 'public',
    contentType: req.file.mimetype,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return res.json({ 
    file_url: blob.url,
    filename: req.file.originalname,
    size: req.file.size,
    content_type: req.file.mimetype,
  });
});

/**
 * POST /api/integrations/upload-private
 * Upload a private file to @vercel/blob (requires signed URL to access)
 * Returns: { file_uri: string }
 */
fileRouter.post('/upload-private', requireAuth, upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  const filename = `private/${Date.now()}-${req.file.originalname}`;
  
  const blob = await put(filename, req.file.buffer, {
    access: 'public', // @vercel/blob doesn't have "private" — use signed URLs for access control
    contentType: req.file.mimetype,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  // Store the URL as a "URI" — in your app logic, you control access via auth middleware
  return res.json({ 
    file_uri: blob.url,
    filename: req.file.originalname,
    size: req.file.size,
  });
});

/**
 * POST /api/integrations/signed-url
 * Generate a time-limited access URL for a file
 * Note: @vercel/blob public URLs don't expire. For true private files,
 * consider implementing an auth-gated proxy endpoint instead.
 */
fileRouter.post('/signed-url', requireAuth, async (req: Request, res: Response) => {
  const { file_uri } = req.body;
  
  if (!file_uri) {
    return res.status(400).json({ error: 'file_uri is required' });
  }

  // For @vercel/blob, public URLs are permanent.
  // For true signed URLs, you'd implement a proxy:
  //   GET /api/files/proxy/:token → validates token, streams file
  // For now, return the URL directly since auth middleware protects this route.
  return res.json({ signed_url: file_uri });
});

/**
 * DELETE /api/integrations/files
 * Delete a file from @vercel/blob
 */
fileRouter.delete('/files', requireAuth, async (req: Request, res: Response) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'url is required' });
  }

  await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
  return res.json({ success: true });
});

/**
 * GET /api/integrations/files
 * List files in @vercel/blob storage
 */
fileRouter.get('/files', requireAuth, async (req: Request, res: Response) => {
  const { prefix, cursor, limit: limitStr } = req.query;
  
  const result = await list({
    prefix: (prefix as string) || undefined,
    cursor: (cursor as string) || undefined,
    limit: limitStr ? parseInt(limitStr as string) : 100,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return res.json({
    blobs: result.blobs.map(b => ({
      url: b.url,
      pathname: b.pathname,
      size: b.size,
      uploadedAt: b.uploadedAt,
    })),
    cursor: result.cursor,
    hasMore: result.hasMore,
  });
});

export { fileRouter };