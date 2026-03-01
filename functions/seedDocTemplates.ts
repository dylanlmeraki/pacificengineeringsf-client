import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

type TemplateSpec = { template_name: string; doc_type: string; description?: string; style?: any; template_body: string; active?: boolean };

const accentByType: Record<string,string> = {
  RFI: '#4f46e5', // indigo
  RFQ: '#0891b2', // teal
  RFP: '#7c3aed', // violet
  RFC: '#f59e0b', // amber
  ASI: '#2563eb', // blue
  CCD: '#ef4444', // red
  Submittal: '#16a34a', // green
  FieldReport: '#334155', // slate
};

function shell(title: string, accent: string, body: string) {
  return `
  <style>
    .wrap{font-family:Inter,Arial,Helvetica,sans-serif;color:#111;}
    .hdr{display:flex;justify-content:space-between;align-items:end;border-bottom:2px solid ${accent};padding:12px 0;margin-bottom:12px}
    .title{font-size:22px;font-weight:800;letter-spacing:.2px}
    .meta{font-size:12px;color:#475569}
    .sec{margin:14px 0}
    .sec h3{font-size:13px;font-weight:700;margin:0 0 6px 0;color:${accent}}
    .box{border:1px solid #e5e7eb;border-left:3px solid ${accent};border-radius:6px;padding:10px}
    .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
    .kv{font-size:12px;color:#334155}
  </style>
  <div class="wrap">
    <div class="hdr">
      <div class="title">${title}</div>
      <div class="meta">Project: {{project.project_name}} • Doc #: {{doc.doc_number}}</div>
    </div>
    ${body}
  </div>`;
}

function commonHeader(accent: string){
  return `
  <div class="sec box">
    <div class="grid">
      <div class="kv"><b>From:</b> {{doc.created_by}}</div>
      <div class="kv"><b>To:</b> {{doc.approver_email}}</div>
      <div class="kv"><b>Date Issued:</b> [[doc.created_date]]</div>
      <div class="kv"><b>Required By:</b> [[doc.due_date]]</div>
      <div class="kv"><b>Spec Section:</b> [[fields.spec_section]]</div>
      <div class="kv"><b>Drawing Ref:</b> [[fields.drawing_ref]]</div>
    </div>
  </div>`;
}

const builders: Record<string,(accent:string)=>string> = {
  RFI: (accent) => shell('RFI — Request for Information', accent,
    commonHeader(accent)+
    `<div class="sec">
      <h3>Issue / Question</h3>
      <div class="box">[[fields.issue]]</div>
    </div>
    <div class="sec">
      <h3>Existing Condition / Background</h3>
      <div class="box">[[fields.background]]</div>
    </div>`),
  RFQ: (accent) => shell('RFQ — Request for Quotation', accent,
    commonHeader(accent)+
    `<div class="sec">
      <h3>Scope Package</h3>
      <div class="box">[[fields.scope]]</div>
    </div>
    <div class="sec">
      <h3>Deliverables</h3>
      <div class="box">[[fields.deliverables]]</div>
    </div>`),
  RFP: (accent) => shell('RFP — Request for Proposal', accent,
    commonHeader(accent)+
    `<div class="sec">
      <h3>Project Background</h3>
      <div class="box">[[fields.background]]</div>
    </div>
    <div class="sec">
      <h3>Scope of Work</h3>
      <div class="box">[[fields.sow]]</div>
    </div>`),
  RFC: (accent) => shell('RFC — Request for Clarification / Change', accent,
    commonHeader(accent)+
    `<div class="sec">
      <h3>Issue / Proposed Change</h3>
      <div class="box">[[fields.change]]</div>
    </div>`),
  ASI: (accent) => shell('ASI — Architect’s Supplemental Instructions', accent,
    commonHeader(accent)+
    `<div class="sec">
      <h3>Instruction / Revision</h3>
      <div class="box">[[fields.instruction]]</div>
    </div>
    <div class="sec">
      <h3>Reason / Background</h3>
      <div class="box">[[fields.reason]]</div>
    </div>`),
  CCD: (accent) => shell('CCD — Construction Change Directive', accent,
    commonHeader(accent)+
    `<div class="sec">
      <h3>Directive (work to be performed)</h3>
      <div class="box">[[fields.directive]]</div>
    </div>`),
  Submittal: (accent) => shell('Submittal — Product Data / Shop Drawings / Samples', accent,
    commonHeader(accent)+
    `<div class="sec">
      <h3>Submittal Details</h3>
      <div class="box">[[fields.submittal_details]]</div>
    </div>`),
  FieldReport: (accent) => shell('Field Report — Daily Report / Site Observation', accent,
    commonHeader(accent)+
    `<div class="sec">
      <h3>Work Performed</h3>
      <div class="box">[[fields.work_performed]]</div>
    </div>
    <div class="sec">
      <h3>Issues / Blockers</h3>
      <div class="box">[[fields.issues]]</div>
    </div>`),
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const created: any[] = [];
    for (const type of Object.keys(builders)) {
      const accent = accentByType[type] || '#111827';
      const body = builders[type](accent);
      const tpl: TemplateSpec = {
        template_name: `${type} – Clean Pro` as any,
        doc_type: type,
        description: `Minimal monochrome with ${accent} accent for ${type}`,
        style: { accent_color: accent, theme: 'minimal' },
        template_body: body,
        active: true,
        // Basic field set used by DynamicDocForm / DocForm
        ...(true && { field_sections: [
          { section_id: 'common', label: 'Common', fields: [
            { key: 'spec_section', label: 'Spec Section', kind: 'text' },
            { key: 'drawing_ref', label: 'Drawing Ref', kind: 'text' }
          ]},
          { section_id: 'main', label: 'Main', fields: [
            { key: 'issue', label: 'Issue / Question / Change', kind: 'textarea' },
            { key: 'background', label: 'Background', kind: 'textarea' },
            { key: 'scope', label: 'Scope / Package', kind: 'textarea' },
            { key: 'deliverables', label: 'Deliverables', kind: 'textarea' },
            { key: 'sow', label: 'Scope of Work', kind: 'textarea' },
            { key: 'change', label: 'Proposed Change', kind: 'textarea' },
            { key: 'instruction', label: 'Instruction / Revision', kind: 'textarea' },
            { key: 'reason', label: 'Reason', kind: 'textarea' },
            { key: 'directive', label: 'Directive', kind: 'textarea' },
            { key: 'submittal_details', label: 'Submittal Details', kind: 'textarea' },
            { key: 'work_performed', label: 'Work Performed', kind: 'textarea' },
            { key: 'issues', label: 'Issues / Blockers', kind: 'textarea' }
          ]}
        ] })
      } as any;
      const rec = await base44.entities.ProjectDocTemplate.create(tpl as any);
      created.push(rec);
    }

    return Response.json({ created_count: created.length });
  } catch (error) {
    return Response.json({ error: (error as any)?.message || 'Server error' }, { status: 500 });
  }
});