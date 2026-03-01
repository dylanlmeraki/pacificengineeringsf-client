import React, { useState } from "react";
import AdminRoute from "../components/internal/AdminRoute";
import InternalLayout from "../components/internal/InternalLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Zap, FileText, BarChart3 } from "lucide-react";
import TemplateManager from "../components/communications/TemplateManager";
import AutomationDashboard from "../components/communications/AutomationDashboard";
import ReportScheduler from "../components/communications/ReportScheduler";

export default function Communications() {
  return (
    <AdminRoute>
      <InternalLayout>
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Mail className="w-10 h-10 text-blue-600" />
              Client Communications
            </h1>
            <p className="text-gray-600 text-lg">
              Manage automated emails, notifications, and communication templates
            </p>
          </div>

          <Tabs defaultValue="automation" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="automation">
                <Zap className="w-4 h-4 mr-2" />
                Automation
              </TabsTrigger>
              <TabsTrigger value="templates">
                <FileText className="w-4 h-4 mr-2" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="reports">
                <BarChart3 className="w-4 h-4 mr-2" />
                Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="automation">
              <AutomationDashboard />
            </TabsContent>

            <TabsContent value="templates">
              <TemplateManager />
            </TabsContent>

            <TabsContent value="reports">
              <ReportScheduler projects={[]} clients={[]} />
            </TabsContent>
          </Tabs>
        </div>
      </InternalLayout>
    </AdminRoute>
  );
}