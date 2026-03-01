import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TemplateEditorPro from "./TemplateEditorPro";
import TemplateImporterPro from "./TemplateImporterPro";

export default function TemplateSuiteTabs() {
  return (
    <div className="w-full">
      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid grid-cols-2 md:w-auto md:inline-grid mb-4">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="importer">Importer</TabsTrigger>
        </TabsList>

        <TabsContent value="editor">
          <TemplateEditorPro />
        </TabsContent>

        <TabsContent value="importer">
          <TemplateImporterPro />
        </TabsContent>
      </Tabs>
    </div>
  );
}