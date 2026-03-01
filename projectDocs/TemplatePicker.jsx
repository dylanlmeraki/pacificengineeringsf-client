import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { projectDocsApi } from "@/components/services/projectDocsApiClient";

export default function TemplatePicker({ docType, onSelect }) {
  const { data: templates = [] } = useQuery({
    queryKey: ['projectdoc_templates', docType],
    queryFn: () => projectDocsApi.listTemplates(docType),
    enabled: !!docType
  });

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {templates.map((tpl) => (
        <Card key={tpl.id} className="p-3 hover:shadow-md transition cursor-pointer" onClick={() => onSelect?.(tpl)}>
          <div className="font-medium text-gray-800">{tpl.template_name}</div>
          {tpl.description && <div className="text-xs text-gray-500 mt-1">{tpl.description}</div>}
        </Card>
      ))}
      {templates.length === 0 && (
        <div className="text-sm text-gray-500">No templates yet for {docType}.</div>
      )}
    </div>
  );
}