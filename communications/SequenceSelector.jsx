import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function SequenceSelector({ sequences = [], selectedId, onSelect }) {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
      <div className="flex-1">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Follow-up Sequence</label>
        <Select value={selectedId || ""} onValueChange={onSelect}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Choose a sequence" />
          </SelectTrigger>
          <SelectContent>
            {sequences.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">No sequences found</div>
            ) : (
              sequences.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name || s.title || `Sequence ${s.id.slice(0,6)}`}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      <Link to={createPageUrl("EmailSequences")} className="md:self-end">
        <Button variant="outline" className="h-12">
          <Settings className="w-4 h-4 mr-2" /> Manage Sequences
        </Button>
      </Link>
    </div>
  );
}