import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function ClientProjectFilter({ projects = [], value, onChange }) {
  const clients = React.useMemo(() => {
    const map = new Map();
    projects.forEach(p => {
      const key = p.client_email || p.client_name || "unknown";
      if (!map.has(key)) map.set(key, { email: p.client_email || null, name: p.client_name || key });
    });
    return Array.from(map.values());
  }, [projects]);

  const projectOptions = React.useMemo(() => {
    if (!value?.clientEmail) return projects;
    return projects.filter(p => (p.client_email || null) === value.clientEmail);
  }, [projects, value?.clientEmail]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={value?.clientEmail || ""} onValueChange={(v)=> onChange?.({ clientEmail: v || null, projectId: null })}>
        <SelectTrigger className="w-64"><SelectValue placeholder="Filter by client (optional)" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={null}>All Clients</SelectItem>
          {clients.map(c => (
            <SelectItem key={c.email || c.name} value={c.email || ""}>
              {c.name}{c.email ? ` • ${c.email}` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={value?.projectId || ""} onValueChange={(v)=> onChange?.({ clientEmail: value?.clientEmail || null, projectId: v || null })}>
        <SelectTrigger className="w-64"><SelectValue placeholder="Filter by project (optional)" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={null}>All Projects</SelectItem>
          {projectOptions.map(p => (
            <SelectItem key={p.id} value={p.id}>{p.project_name} {p.project_number ? `(#${p.project_number})` : ""}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {(value?.clientEmail || value?.projectId) && (
        <Button variant="outline" onClick={()=> onChange?.({ clientEmail: null, projectId: null })}>Clear</Button>
      )}
    </div>
  );
}