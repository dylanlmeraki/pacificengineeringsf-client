// Pure JS template renderer (no TS/Flow)
// Usage: renderTemplateBody(html, { doc, project, fields })

export function renderTemplateBody(template = "", ctx = {}) {
  const get = (obj, path) => {
    if (!obj || !path) return "";
    return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined && acc[key] !== null ? acc[key] : undefined), obj);
  };

  const map = Object.assign({}, ctx.fields || {}, { doc: ctx.doc || {}, project: ctx.project || {} });

  // Replace {{ ... }} placeholders
  const withBraces = String(template).replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, raw) => {
    const key = String(raw).trim();
    if (key.startsWith('doc.') || key.startsWith('project.')) {
      const v = get(map, key);
      return v != null ? String(v) : "";
    }
    const v = map[key];
    return v != null ? String(v) : "";
  });

  // Also support [[ KEY ]] style
  return withBraces.replace(/\[\[\s*([^\]]+)\s*\]\]/g, (_, raw) => {
    const key = String(raw).trim();
    const direct = map[key];
    if (direct != null) return String(direct);
    const via = get(map, key);
    return via != null ? String(via) : "";
  });
}

export function buildRenderContext({ doc, project, fields } = {}) {
  return { doc: doc || {}, project: project || {}, fields: fields || {} };
}