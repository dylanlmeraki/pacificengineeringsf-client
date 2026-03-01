import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Inline template renderer (server-safe, no local imports)
function renderTemplateBody(html, ctx) {
  if (!html) return '';
  const map = Object.assign({}, ctx.fields || {}, { doc: ctx.doc || {}, project: ctx.project || {} });
  const getPath = (obj, path) => (path || '').split('.').reduce((acc, k) => (acc ? acc[k] : undefined), obj);
  const replaced = html.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, raw) => {
    const key = String(raw).trim();
    if (key.startsWith('doc.') || key.startsWith('project.')) {
      const val = getPath(map, key); return val != null ? String(val) : '';
    }
    const val = map[key]; return val != null ? String(val) : '';
  });
  return replaced.replace(/\[\[\s*([^\]]+)\s*\]\]/g, (_, raw) => {
    const key = String(raw).trim();
    const direct = map[key]; if (direct != null) return String(direct);
    const via = getPath(map, key); return via != null ? String(via) : '';
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action, data = {} } = body || {};

    const ensureOwnedOrAdmin = (record) => {
      if (user.role === 'admin') return true;
      if (record?.created_by === user.email) return true;
      if (record?.assigned_to && record.assigned_to === user.email) return true;
      if (record?.client_email && record.client_email === user.email) return true;
      return false;
    };

    if (action === 'listDocs') {
      const { filter = {}, sort = '-updated_date', limit = 100 } = data;
      const items = await base44.entities.ProjectDoc.filter(filter, sort, limit);
      return Response.json({ items });
    }

    if (action === 'getDoc') {
      const { id } = data;
      const it = await base44.entities.ProjectDoc.get(id);
      if (!ensureOwnedOrAdmin(it)) return Response.json({ error: 'Forbidden' }, { status: 403 });
      return Response.json({ doc: it });
    }

    if (action === 'createDoc') {
      const payload = data;
      // Render final body if a template body exists
      const tplHtml = payload?.template_meta?.template_body;
      if (tplHtml) {
        let project = null;
        if (payload.project_id) {
          const list = await base44.entities.Project.filter({ id: payload.project_id }, undefined, 1);
          project = (list && list[0]) || null;
        }
        const rendered = renderTemplateBody(tplHtml, { doc: payload, project, fields: payload.dynamic_fields || {} });
        payload.rendered_body = rendered;
      }
      const created = await base44.entities.ProjectDoc.create(payload);
      return Response.json({ doc: created });
    }

    if (action === 'updateDoc') {
      const { id, updates } = data;
      const existing = await base44.entities.ProjectDoc.get(id);
      if (!ensureOwnedOrAdmin(existing)) return Response.json({ error: 'Forbidden' }, { status: 403 });

      // Compute rendered body if applicable
      const tplHtml = (updates?.template_meta?.template_body) || (existing?.template_meta?.template_body);
      if (tplHtml) {
        const merged = { ...existing, ...updates };
        let project = null;
        if (merged.project_id) {
          const list = await base44.entities.Project.filter({ id: merged.project_id }, undefined, 1);
          project = (list && list[0]) || null;
        }
        const rendered = renderTemplateBody(tplHtml, { doc: merged, project, fields: merged.dynamic_fields || {} });
        updates.rendered_body = rendered;
      }

      const updated = await base44.entities.ProjectDoc.update(id, updates);
      return Response.json({ doc: updated });
    }

    if (action === 'listMessages') {
      const { doc_id, sort = 'created_date', limit = 200 } = data;
      const items = await base44.entities.ProjectDocMessage.filter({ doc_id }, sort, limit);
      return Response.json({ items });
    }

    if (action === 'createMessage') {
      const payload = data;
      const created = await base44.entities.ProjectDocMessage.create(payload);
      return Response.json({ message: created });
    }

    if (action === 'listTemplates') {
      const { doc_type } = data;
      let items = [];
      if (doc_type === 'RFI' && base44.entities.RFITemplate) {
        items = await base44.entities.RFITemplate.filter({ active: true }, 'template_name', 200);
      } else if (base44.entities.ProjectDocTemplate) {
        items = await base44.entities.ProjectDocTemplate.filter({ doc_type, active: true }, 'template_name', 200);
      }
      return Response.json({ items });
    }

    if (action === 'upsertTemplate') {
      const { id, values } = data;
      let tpl;
      if (values?.doc_type === 'RFI') {
        // Keep RFI templates in RFITemplate entity for backward-compat
        tpl = id ? await base44.entities.RFITemplate.update(id, values) : await base44.entities.RFITemplate.create(values);
      } else {
        tpl = id ? await base44.entities.ProjectDocTemplate.update(id, values) : await base44.entities.ProjectDocTemplate.create(values);
      }
      return Response.json({ template: tpl });
    }

    if (action === 'bulkShare') {
      const { ids = [], share } = data || {};
      const SAFE_MAX = 200;
      if (!Array.isArray(ids) || ids.length === 0) return Response.json({ error: 'No ids provided' }, { status: 400 });
      if (ids.length > SAFE_MAX) return Response.json({ error: `Too many ids (max ${SAFE_MAX})` }, { status: 400 });
      if (typeof share !== 'boolean') return Response.json({ error: 'share must be boolean' }, { status: 400 });

      let updated = 0; const failures = [];
      for (const id of ids) {
        try {
          const existing = await base44.entities.ProjectDoc.get(id);
          if (!existing) { failures.push({ id, reason: 'Not found' }); continue; }
          if (!ensureOwnedOrAdmin(existing)) { failures.push({ id, reason: 'Forbidden' }); continue; }

          const patch = { is_shared_with_client: share };
          const newDoc = await base44.entities.ProjectDoc.update(id, patch);
          updated += 1;

          // audit log
          await base44.entities.AuditLog.create({
            actor_email: user.email,
            actor_name: user.full_name,
            action: share ? 'projectdoc_shared' : 'projectdoc_unshared',
            resource_type: 'ProjectDoc',
            resource_id: id,
            resource_name: newDoc?.title || newDoc?.doc_number || 'Document',
            details: JSON.stringify({ before: { is_shared_with_client: existing.is_shared_with_client }, after: { is_shared_with_client: share } })
          });
        } catch (e) {
          failures.push({ id, reason: e?.message || 'Update failed' });
        }
      }
      return Response.json({ updated, failures });
    }

    if (action === 'bulkUpdate') {
      const { ids = [], patch = {} } = data || {};
      const SAFE_MAX = 200;
      if (!Array.isArray(ids) || ids.length === 0) return Response.json({ error: 'No ids provided' }, { status: 400 });
      if (ids.length > SAFE_MAX) return Response.json({ error: `Too many ids (max ${SAFE_MAX})` }, { status: 400 });
      // Whitelist fields
      const allowed = ['status','due_date','approver_email'];
      const updates = Object.fromEntries(Object.entries(patch).filter(([k]) => allowed.includes(k)));
      if (Object.keys(updates).length === 0) return Response.json({ error: 'No allowed fields to update' }, { status: 400 });

      let updated = 0; const failures = [];
      for (const id of ids) {
        try {
          const existing = await base44.entities.ProjectDoc.get(id);
          if (!existing) { failures.push({ id, reason: 'Not found' }); continue; }
          if (!ensureOwnedOrAdmin(existing)) { failures.push({ id, reason: 'Forbidden' }); continue; }

          const newDoc = await base44.entities.ProjectDoc.update(id, updates);
          updated += 1;

          await base44.entities.AuditLog.create({
            actor_email: user.email,
            actor_name: user.full_name,
            action: 'projectdoc_bulk_update',
            resource_type: 'ProjectDoc',
            resource_id: id,
            resource_name: newDoc?.title || newDoc?.doc_number || 'Document',
            details: JSON.stringify({ updates })
          });
        } catch (e) {
          failures.push({ id, reason: e?.message || 'Update failed' });
        }
      }
      return Response.json({ updated, failures });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
});