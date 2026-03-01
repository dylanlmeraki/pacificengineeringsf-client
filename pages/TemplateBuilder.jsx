import React from "react";
import TemplateEditorPro from "@/components/projectDocs/templateBuilder/TemplateEditorPro";
import TemplateImporterPro from "@/components/projectDocs/templateBuilder/TemplateImporterPro";

export default function TemplateBuilderPage(){
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-7xl mx-auto py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-slate-900">Template Builder</h1>
          <TemplateImporterPro />
        </div>
        <TemplateEditorPro />
      </div>
    </div>
  );
}