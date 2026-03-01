import React from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

type UploadAreaProps = {
  docId: string;
  onComplete?: () => void;
};

const ACCEPT = [".pdf", ".docx", ".jpg", ".jpeg", ".png", ".gif", ".csv", ".xlsx"]; // must match backend allowlist

export default function UploadArea({ docId, onComplete }: UploadAreaProps) {
  const [dragOver, setDragOver] = React.useState(false);
  const [items, setItems] = React.useState<{ name: string; status: "queued" | "uploading" | "processing" | "done" | "error"; error?: string }[]>([]);

  const updateItem = (name: string, patch: Partial<{ status: "queued" | "uploading" | "processing" | "done" | "error"; error?: string }>) => {
    setItems((prev) => prev.map((it) => (it.name === name ? { ...it, ...patch } : it)));
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || !fileList.length) return;
    const files = Array.from(fileList);
    setItems((prev) => [
      ...prev,
      ...files.map((f) => ({ name: f.name, status: "queued" as const })),
    ]);

    await Promise.all(
      files.map(async (file) => {
        try {
          updateItem(file.name, { status: "uploading" });
          const { file_url } = await base44.integrations.Core.UploadFile({ file });

          updateItem(file.name, { status: "processing" });
          await base44.functions.invoke("processAttachment", {
            doc_id: docId,
            url: file_url,
            name: file.name,
            size: file.size,
          });

          updateItem(file.name, { status: "done" });
        } catch (e: any) {
          updateItem(file.name, { status: "error", error: e?.message || "Upload failed" });
        }
      })
    );

    onComplete?.();
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-lg p-4 text-center transition ${dragOver ? "border-blue-500 bg-blue-50" : "border-slate-200"}`}
      >
        <div className="text-sm text-slate-700">Drag & drop files here, or</div>
        <div className="mt-2">
          <label>
            <input
              type="file"
              multiple
              accept={ACCEPT.join(",")}
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
            <Button asChild>
              <span>Select files</span>
            </Button>
          </label>
        </div>
        <div className="mt-2 text-xs text-slate-500">Accepted: {ACCEPT.join(", ")}</div>
      </div>

      {items.length > 0 && (
        <div className="space-y-1">
          {items.map((it) => (
            <div key={it.name} className="flex items-center justify-between text-sm border rounded p-2">
              <div className="truncate mr-2">{it.name}</div>
              <div className="text-xs">
                {it.status === "uploading" && <span className="text-blue-600">Uploading…</span>}
                {it.status === "processing" && <span className="text-amber-600">Processing…</span>}
                {it.status === "done" && <span className="text-green-600">Done</span>}
                {it.status === "error" && <span className="text-red-600">{it.error || "Error"}</span>}
                {it.status === "queued" && <span className="text-slate-500">Queued</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}