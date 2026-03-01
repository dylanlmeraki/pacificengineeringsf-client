import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function GlobalCRMSearch() {
  const [term, setTerm] = React.useState("");
  const [scopes, setScopes] = React.useState(['prospects','contacts','sequences','projects','proposals','rfis','templates']);

  const { data, refetch, isFetching } = useQuery({
    queryKey: ['crm-search', term, scopes.join(',')],
    queryFn: async () => {
      if (!term || term.trim().length < 2) return { results: {} };
      const { data } = await base44.functions.invoke('crmSearch', { term, scopes });
      return data || { results: {} };
    }
  });

  const results = data?.results || {};
  const toggle = (s) => setScopes((prev)=> prev.includes(s) ? prev.filter(x=>x!==s) : [...prev, s]);

  const goto = (entity, id) => {
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
    window.location.href = createPageUrl(`${mapping[entity] || 'InternalDashboard'}?entity=${entity}&id=${id}`);
  };

  const chips = [
    ['prospects','Prospects'],['contacts','Contacts'],['sequences','Sequences'],['projects','Projects'],['proposals','Proposals'],['rfis','RFIs'],['templates','Templates']
  ];

  return (
    <div className="space-y-4">
      <Card className="p-4 border-0 shadow-lg bg-white">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input value={term} onChange={(e)=>setTerm(e.target.value)} placeholder="Search CRM & Outreach… (min 2 chars)" className="pl-10 h-12" onKeyDown={(e)=>{ if (e.key==='Enter') refetch(); }} />
          </div>
          <Button onClick={()=>refetch()} disabled={isFetching} className="h-12">{isFetching ? 'Searching…' : 'Search'}</Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {chips.map(([k,label]) => (
            <button key={k} onClick={()=>toggle(k)} className={`px-3 py-1.5 rounded-full text-xs border ${scopes.includes(k)?'bg-blue-600 text-white border-blue-600':'bg-white text-gray-700 border-gray-300'}`}>{label}</button>
          ))}
        </div>
      </Card>

      {Object.keys(results).length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(results).map(([entity, items]) => (
            <Card key={entity} className="p-4 border-0 shadow-md">
              <div className="text-sm font-semibold text-gray-700 mb-2">{entity}</div>
              {(!items || items.length===0) ? (
                <div className="text-xs text-gray-500">No results</div>
              ) : (
                <ul className="space-y-2">
                  {items.map((it) => (
                    <li key={it.id}>
                      <button onClick={()=>goto(entity, it.id)} className="text-blue-700 hover:underline text-sm">
                        {(it.title || it.template_name || it.project_name || it.company_name || it.contact_name || it.name || it.slug || it.rfi_number) || it.id}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}