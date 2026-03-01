export interface RenderCtx {
  doc?: any;
  project?: any;
  fields?: Record<string, any>;
}

// Replaces placeholders like {{doc.title}}, {{project.project_name}}, {{fieldKey}}
export function renderTemplateBody(html: string, ctx: RenderCtx): string {
  if (!html) return '';
  const map: Record<string, any> = {
    ...(ctx.fields || {}),
    doc: ctx.doc || {},
    project: ctx.project || {}
  } as any;

  const getPath = (obj: any, path: string) => path.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), obj);

  // Replace {{...}}
  const replaced = html.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_: any, raw: string) => {
    const key = String(raw).trim();
    if (key.startsWith('doc.') || key.startsWith('project.')) {
      const val = getPath(map, key);
      return val != null ? String(val) : '';
    }
    const val = map[key];
    return val != null ? String(val) : '';
  });

  // Also replace [[KEY]] forms
  return replaced.replace(/\[\[\s*([^\]]+)\s*\]\]/g, (_: any, raw: string) => {
    const key = String(raw).trim();
    const val = (map as any)[key] ?? getPath(map, key);
    return val != null ? String(val) : '';
  });
}