import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Search, X } from "lucide-react";

const DEFAULT_SCOPES = [
  { key: "all", label: "All" },
  { key: "crm", label: "CRM (Prospects, Contacts)" },
  { key: "salesbot", label: "SalesBot (Sequences)" },
  { key: "projects", label: "Projects" },
  { key: "proposals", label: "Proposals" },
  { key: "rfis", label: "RFIs" },
  { key: "templates", label: "Templates" },
];

export default function GlobalSearchBar({ portal = "internal" }) {
  const [q, setQ] = React.useState("");
  const [scope, setScope] = React.useState("crm");
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState({});

  const runSearch = async () => {
    const query = q.trim().toLowerCase();
    if (query.length < 2) { setResults({}); return; }
    setLoading(true);

    const should = (s) => s && String(s).toLowerCase().includes(query);

    // helper to fetch and filter client side (limit small for UX)
    const fetchAndFilter = async (entity, fields, limit = 5) => {
      const list = await base44.entities[entity].list('-updated_date', 50);
      const filtered = list.filter((r) => fields.some((f) => should(r[f]))).slice(0, limit);
      return filtered;
    };

    const out = {};

    try {
      if (scope === 'all' || scope === 'crm') {
        out.Prospect = await fetchAndFilter('Prospect', ['company_name','contact_name','notes','company_location']);
        out.Contact = (base44.entities.Contact ? await fetchAndFilter('Contact', ['name','email','company']) : []);
      }
      if (scope === 'all' || scope === 'salesbot') {
        out.EmailSequence = (base44.entities.EmailSequence ? await fetchAndFilter('EmailSequence', ['name','description']) : []);
      }
      if (scope === 'all' || scope === 'projects') {
        out.Project = await fetchAndFilter('Project', ['project_name','project_number','client_name','location']);
      }
      if (scope === 'all' || scope === 'proposals') {
        out.Proposal = await fetchAndFilter('Proposal', ['title','proposal_number']);
      }
      if (scope === 'all' || scope === 'rfis') {
        out.RFI = (base44.entities.RFI ? await fetchAndFilter('RFI', ['title','rfi_number','project_name','question']) : []);
      }
      if (scope === 'all' || scope === 'templates') {
        out.ProposalTemplate = (base44.entities.ProposalTemplate ? await fetchAndFilter('ProposalTemplate', ['template_name','description']) : []);
        out.RFITemplate = (base44.entities.RFITemplate ? await fetchAndFilter('RFITemplate', ['template_name','description']) : []);
      }
    } finally {
      setLoading(false);
      setResults(out);
      setOpen(true);
    }
  };

  const goto = (entity, id) => {
    // navigate to base page with query param; target pages can handle it progressively
    const mapping = {
      Prospect: 'SalesDashboard',
      Contact: 'ContactManager',
      EmailSequence: 'EmailSequences',
      Project: 'ProjectsManager',
      Proposal: 'ProposalDashboard',
      RFI: 'RFIs',
      ProposalTemplate: 'ProposalDashboard',
      RFITemplate: 'RFIs'
    };
    const page = mapping[entity] || 'InternalDashboard';
    const url = createPageUrl(`${page}?entity=${entity}&id=${id}`);
    window.location.href = url;
  };

  React.useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 bg-white border rounded-lg px-2 py-1 shadow-sm">
        <Search className="w-4 h-4 text-gray-500" />
        <Input
          placeholder="Search (Ctrl/Cmd+K)"
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          onKeyDown={(e)=>{ if (e.key==='Enter') runSearch(); }}
          className="border-0 focus-visible:ring-0 h-9"
        />
        <Select value={scope} onValueChange={setScope}>
          <SelectTrigger className="h-8 w-52">
            <SelectValue placeholder="Scope" />
          </SelectTrigger>
          <SelectContent>
            {DEFAULT_SCOPES.map((s)=>(
              <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={runSearch} disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </Button>
      </div>

      {open && (
        <Card className="mt-2 p-2 shadow-lg border-0">
          <div className="flex items-center justify-between px-2 pb-1">
            <div className="text-xs text-gray-500">Results for “{q}”</div>
            <button className="text-xs text-gray-500 hover:text-gray-700" onClick={()=>setOpen(false)}><X className="w-3 h-3 inline mr-1" />Close</button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.keys(results).length === 0 && (
              <div className="text-sm text-gray-600 px-2 py-3">No results yet.</div>
            )}
            {Object.entries(results).map(([entity, items]) => (
              <div key={entity} className="bg-gray-50 rounded-md p-2">
                <div className="text-xs font-semibold text-gray-700 mb-1">{entity}</div>
                {items.length === 0 ? (
                  <div className="text-xs text-gray-500">No matches</div>
                ) : (
                  <ul className="space-y-1">
                    {items.map((it) => (
                      <li key={it.id}>
                        <button
                          onClick={()=>goto(entity, it.id)}
                          className="w-full text-left text-sm text-blue-700 hover:underline"
                        >
                          {(it.title || it.template_name || it.project_name || it.company_name || it.contact_name || it.name || it.slug || it.rfi_number) || it.id}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}