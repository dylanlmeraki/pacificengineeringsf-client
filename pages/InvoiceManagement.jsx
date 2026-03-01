import React from "react";
import AdminRoute from "../components/internal/AdminRoute";

import InvoiceManager from "../components/invoices/InvoiceManager";
import { DollarSign } from "lucide-react";

export default function InvoiceManagement() {
  return (
    <AdminRoute>
      
        <div className="py-6 lg:py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <DollarSign className="w-10 h-10 text-blue-600" />
              Invoice Management
            </h1>
            <p className="text-gray-600 text-lg">
              Create, manage, and track client invoices with Stripe integration ready
            </p>
          </div>

          <InvoiceManager />
        </div>
      
    </AdminRoute>
  );
}