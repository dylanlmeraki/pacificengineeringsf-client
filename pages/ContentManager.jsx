import React from "react";
import AdminRoute from "../components/internal/AdminRoute";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { FileText, Search } from "lucide-react";

// Import existing pages to embed within tabs
import BlogEditor from "./BlogEditor";
import SEOAssistant from "./SEOAssistant";

export default function ContentManager() {
  return (
    <AdminRoute>
      <div className="py-6 lg:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              Content Manager
            </h1>
            <p className="text-gray-600 text-lg">Manage blog content and run SEO analysis from one place</p>
          </div>

          {/* Horizontal tabs for Blog Manager and SEO Assistant */}
          <Tabs defaultValue="blog" className="w-full" activationMode="automatic">
            <TabsList className="mb-6 bg-white shadow-sm">
              <TabsTrigger value="blog" className="flex items-center gap-2">
                <FileText className="w-4 h-4" /> Blog Manager
              </TabsTrigger>
              <TabsTrigger value="seo" className="flex items-center gap-2">
                <Search className="w-4 h-4" /> SEO Assistant
              </TabsTrigger>
            </TabsList>

            <TabsContent value="blog">
              {/* Embed existing Blog Editor page/component */}
              <Card className="border-0 shadow-none p-0 bg-transparent">
                <BlogEditor />
              </Card>
            </TabsContent>

            <TabsContent value="seo">
              {/* Embed existing SEO Assistant page/component */}
              <Card className="border-0 shadow-none p-0 bg-transparent">
                <SEOAssistant />
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminRoute>
  );
}