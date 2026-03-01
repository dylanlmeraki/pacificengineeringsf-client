import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TemplateEditorPro from "./TemplateEditorPro";
import TemplateImporterPro from "./TemplateImporterPro";
import TemplateLibrary from "./TemplateLibrary";

export default function TemplateSuiteTabs(): JSX.Element {
  return (
    <Tabs defaultValue="editor" className="w-full">
      <TabsList className="grid grid-cols-3 w-full md:w-auto md:inline-grid mb-4">
        <TabsTrigger value="editor">Editor</TabsTrigger>
        <TabsTrigger value="importer">Importer</TabsTrigger>
        <TabsTrigger value="library">Library</TabsTrigger>
      </TabsList>
      <TabsContent value="editor">
        <TemplateEditorPro />
      </TabsContent>
      <TabsContent value="importer">
        <TemplateImporterPro />
      </TabsContent>
      <TabsContent value="library">
        <TemplateLibrary />
      </TabsContent>
    </Tabs>
  );
}