import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { term = '', scopes = ['prospects','contacts','sequences','projects','proposals','rfis','templates'], limit = 20 } = await req.json().catch(()=>({}));
    const q = (term || '').toLowerCase();
    const contains = (s) => s && String(s).toLowerCase().includes(q);

    const out = {};

    const fetchFilter = async (entity, fields) => {
      const items = await base44.entities[entity].list('-updated_date', 200);
      return items.filter((r) => fields.some((f)=> contains(r[f]))).slice(0, limit);
    };

    if (scopes.includes('prospects')) out.Prospect = await fetchFilter('Prospect', ['company_name','contact_name','company_location','notes']);
    if (scopes.includes('contacts') && base44.entities.Contact) out.Contact = await fetchFilter('Contact', ['name','email','company']);
    if (scopes.includes('sequences') && base44.entities.EmailSequence) out.EmailSequence = await fetchFilter('EmailSequence', ['name','description']);
    if (scopes.includes('projects')) out.Project = await fetchFilter('Project', ['project_name','project_number','client_name','location']);
    if (scopes.includes('proposals')) out.Proposal = await fetchFilter('Proposal', ['title','proposal_number']);
    if (scopes.includes('rfis') && base44.entities.RFI) out.RFI = await fetchFilter('RFI', ['title','rfi_number','project_name','question']);
    if (scopes.includes('templates')) {
      if (base44.entities.ProposalTemplate) out.ProposalTemplate = await fetchFilter('ProposalTemplate', ['template_name','description']);
      if (base44.entities.RFITemplate) out.RFITemplate = await fetchFilter('RFITemplate', ['template_name','description']);
    }

    return Response.json({ results: out });
  } catch (error) {
    return Response.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
});