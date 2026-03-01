import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Table2 } from "lucide-react";

function toCSV(data, columns) {
  if (!data.length) return "";
  const header = columns.map((c) => c.label).join(",");
  const rows = data.map((row) =>
    columns.map((c) => {
      const val = c.accessor(row);
      const str = val == null ? "" : String(val);
      return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(",")
  );
  return [header, ...rows].join("\n");
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
}

const EXPORT_CONFIGS = {
  projects: {
    label: "Projects",
    columns: [
      { label: "Name", accessor: (r) => r.project_name },
      { label: "Client", accessor: (r) => r.client_name },
      { label: "Type", accessor: (r) => r.project_type },
      { label: "Status", accessor: (r) => r.status },
      { label: "Priority", accessor: (r) => r.priority },
      { label: "Budget", accessor: (r) => r.budget },
      { label: "Progress", accessor: (r) => r.progress_percentage },
      { label: "Start Date", accessor: (r) => r.start_date },
      { label: "Est. Completion", accessor: (r) => r.estimated_completion },
      { label: "Location", accessor: (r) => r.location },
    ],
  },
  invoices: {
    label: "Invoices",
    columns: [
      { label: "Invoice #", accessor: (r) => r.invoice_number },
      { label: "Client", accessor: (r) => r.client_name },
      { label: "Project", accessor: (r) => r.project_name },
      { label: "Status", accessor: (r) => r.status },
      { label: "Total", accessor: (r) => r.total_amount },
      { label: "Issue Date", accessor: (r) => r.issue_date },
      { label: "Due Date", accessor: (r) => r.due_date },
      { label: "Paid Date", accessor: (r) => r.paid_date },
    ],
  },
  tasks: {
    label: "Tasks",
    columns: [
      { label: "Title", accessor: (r) => r.title },
      { label: "Type", accessor: (r) => r.task_type },
      { label: "Status", accessor: (r) => r.status },
      { label: "Priority", accessor: (r) => r.priority },
      { label: "Due Date", accessor: (r) => r.due_date },
      { label: "Assigned To", accessor: (r) => r.assigned_to },
    ],
  },
};

export default function DataExporter({ projects = [], invoices = [], tasks = [] }) {
  const [exportType, setExportType] = useState("projects");
  const [format, setFormat] = useState("csv");

  const handleExport = () => {
    const config = EXPORT_CONFIGS[exportType];
    const dataMap = { projects, invoices, tasks };
    const data = dataMap[exportType] || [];

    if (format === "csv") {
      const csv = toCSV(data, config.columns);
      downloadFile(csv, `${exportType}_export.csv`, "text/csv");
    } else {
      const jsonStr = JSON.stringify(data, null, 2);
      downloadFile(jsonStr, `${exportType}_export.json`, "application/json");
    }
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Select value={exportType} onValueChange={setExportType}>
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="projects">Projects</SelectItem>
          <SelectItem value="invoices">Invoices</SelectItem>
          <SelectItem value="tasks">Tasks</SelectItem>
        </SelectContent>
      </Select>
      <Select value={format} onValueChange={setFormat}>
        <SelectTrigger className="w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="csv">CSV</SelectItem>
          <SelectItem value="json">JSON</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={handleExport} variant="outline" className="gap-2">
        <Download className="w-4 h-4" />
        Export
      </Button>
    </div>
  );
}