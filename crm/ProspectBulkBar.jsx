import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function ProspectBulkBar({ selectedCount, owners = [], onApply, onClear }) {
  const [status, setStatus] = React.useState("");
  const [segment, setSegment] = React.useState("");
  const [owner, setOwner] = React.useState("");

  return (
    <div className="p-3 mb-4 rounded-lg border bg-white shadow-sm flex flex-wrap items-center gap-3">
      <div className="text-sm font-medium">Bulk edit ({selectedCount})</div>

      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Set status" /></SelectTrigger>
        <SelectContent>
          {["New","Researched","Contacted","Engaged","Qualified","Meeting Scheduled","Proposal Sent","Negotiation","Won","Lost","Nurture"].map(s => (
            <SelectItem key={s} value={s}>{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={segment} onValueChange={setSegment}>
        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Set segment" /></SelectTrigger>
        <SelectContent>
          {["Hot Lead","Warm Lead","Cold Lead","High Value","Low Priority","Key Account","Quick Win","Long Term"].map(s => (
            <SelectItem key={s} value={s}>{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={owner} onValueChange={setOwner}>
        <SelectTrigger className="w-[220px]"><SelectValue placeholder="Assign owner" /></SelectTrigger>
        <SelectContent>
          {owners.map(o => (
            <SelectItem key={o} value={o}>{o}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="ml-auto flex gap-2">
        <Button variant="outline" onClick={onClear}>Clear</Button>
        <Button onClick={() => onApply({ status, segment, assigned_to: owner })}>Apply</Button>
      </div>
    </div>
  );
}