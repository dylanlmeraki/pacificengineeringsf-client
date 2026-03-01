import React from "react";
import AdminRoute from "../components/internal/AdminRoute";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Beaker, Shield, Bug, ServerCog } from "lucide-react";

import SeedPanel from "../components/qaqc/SeedPanel.jsx";
import FunctionTester from "../components/qaqc/FunctionTester.jsx";
import QAChecklist from "../components/qaqc/QAChecklist.jsx";

export default function QAQC() {
  return (
    <AdminRoute>
      <div className="py-6 lg:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Beaker className="w-8 h-8 text-blue-600" /> Internal QA / QC
            </h1>
            <p className="text-gray-600">Seed realistic data, test critical functions, and run the QA checklist.</p>
          </div>

          <Tabs defaultValue="data">
            <TabsList className="mb-6">
              <TabsTrigger value="data">Test Data</TabsTrigger>
              <TabsTrigger value="functions">Function Tests</TabsTrigger>
              <TabsTrigger value="checklist">QA Checklist</TabsTrigger>
            </TabsList>

            <TabsContent value="data">
              <SeedPanel />
            </TabsContent>

            <TabsContent value="functions">
              <FunctionTester />
            </TabsContent>

            <TabsContent value="checklist">
              <QAChecklist />
              <Card className="p-6 mt-6 border-0 shadow-xl bg-gradient-to-br from-slate-50 to-white">
                <div className="font-semibold text-gray-900 flex items-center gap-2 mb-2"><Shield className="w-4 h-4" /> Notes</div>
                <ul className="list-disc ml-6 text-sm text-gray-700 space-y-1">
                  <li>All actions write to persistent storage and reflect in ActivityLog when applicable.</li>
                  <li>Use admin account for seeding and backend function tests.</li>
                  <li>This module is internal-only and safe for dev/QA environments.</li>
                </ul>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminRoute>
  );
}