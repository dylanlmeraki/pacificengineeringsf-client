import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Settings } from "lucide-react";

export default function ComponentEditor({ component, onUpdate, onDelete }) {
  const updateProp = (key, value) => {
    onUpdate({ ...component.props, [key]: value });
  };

  const renderEditor = () => {
    switch (component.type) {
      case "text":
        return (
          <>
            <div>
              <Label>Content</Label>
              <Textarea
                value={component.props.content || ''}
                onChange={(e) => updateProp("content", e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Font Size</Label>
              <Select value={component.props.fontSize} onValueChange={(v) => updateProp("fontSize", v)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sm">Small</SelectItem>
                  <SelectItem value="base">Base</SelectItem>
                  <SelectItem value="lg">Large</SelectItem>
                  <SelectItem value="xl">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case "heading":
        return (
          <>
            <div>
              <Label>Text</Label>
              <Input
                value={component.props.text || ''}
                onChange={(e) => updateProp("text", e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Level</Label>
              <Select value={component.props.level} onValueChange={(v) => updateProp("level", v)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h1">Heading 1</SelectItem>
                  <SelectItem value="h2">Heading 2</SelectItem>
                  <SelectItem value="h3">Heading 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );
      
      case "signature":
        return (
          <>
            <div>
              <Label>Label</Label>
              <Input
                value={component.props.label || ''}
                onChange={(e) => updateProp("label", e.target.value)}
                placeholder="Signature"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Placeholder Text</Label>
              <Input
                value={component.props.placeholder || ''}
                onChange={(e) => updateProp("placeholder", e.target.value)}
                placeholder="Sign here"
                className="mt-2"
              />
            </div>
          </>
        );

      case "image":
        return (
          <>
            <div>
              <Label>Upload Image</Label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
                  if (!validTypes.includes(file.type)) {
                    alert('Invalid file type. Please upload .jpg, .jpeg, or .png files only.');
                    e.target.value = '';
                    return;
                  }
                  
                  try {
                    const base44Module = await import("@/api/base44Client");
                    const { file_url } = await base44Module.base44.integrations.Core.UploadFile({ file });
                    updateProp("url", file_url);
                  } catch (error) {
                    alert('Failed to upload image: ' + error.message);
                  }
                }}
                className="mt-2 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input
                value={component.props.url || ''}
                onChange={(e) => updateProp("url", e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Alt Text</Label>
              <Input
                value={component.props.alt || ''}
                onChange={(e) => updateProp("alt", e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Width</Label>
              <Select value={component.props.width} onValueChange={(v) => updateProp("width", v)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1/2">Half Width</SelectItem>
                  <SelectItem value="full">Full Width</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case "video":
        return (
          <div>
            <Label>Video URL (YouTube/Vimeo)</Label>
            <Input
              value={component.props.url}
              onChange={(e) => updateProp("url", e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="mt-2"
            />
          </div>
        );

      case "chart-bar":
      case "chart-line":
      case "chart-pie":
        return (
          <>
            <div>
              <Label>Chart Title</Label>
              <Input
                value={component.props.title}
                onChange={(e) => updateProp("title", e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Data Source</Label>
              <Select value={component.props.dataSource} onValueChange={(v) => updateProp("dataSource", v)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospects">Prospects</SelectItem>
                  <SelectItem value="projects">Projects</SelectItem>
                  <SelectItem value="interactions">Interactions</SelectItem>
                  <SelectItem value="tasks">Tasks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Metric</Label>
              <Input
                value={component.props.metric}
                onChange={(e) => updateProp("metric", e.target.value)}
                placeholder="e.g., status, created_date"
                className="mt-2"
              />
            </div>
          </>
        );

      case "data-table":
        return (
          <>
            <div>
              <Label>Data Source</Label>
              <Select value={component.props.dataSource} onValueChange={(v) => updateProp("dataSource", v)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospects">Prospects</SelectItem>
                  <SelectItem value="projects">Projects</SelectItem>
                  <SelectItem value="interactions">Interactions</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Columns (comma-separated)</Label>
              <Input
                value={component.props.columns.join(", ")}
                onChange={(e) => updateProp("columns", e.target.value.split(",").map(s => s.trim()))}
                placeholder="name, email, status"
                className="mt-2"
              />
            </div>
          </>
        );

      case "container":
        return (
          <>
            <div>
              <Label>Columns</Label>
              <Select value={String(component.props.columns)} onValueChange={(v) => updateProp("columns", Number(v))}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Column</SelectItem>
                  <SelectItem value="2">2 Columns</SelectItem>
                  <SelectItem value="3">3 Columns</SelectItem>
                  <SelectItem value="4">4 Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Gap</Label>
              <Select value={String(component.props.gap)} onValueChange={(v) => updateProp("gap", Number(v))}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">Small</SelectItem>
                  <SelectItem value="4">Medium</SelectItem>
                  <SelectItem value="6">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      default:
        return <p className="text-gray-600">No settings available for this component</p>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Properties</h3>
        </div>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {renderEditor()}
      </div>
    </div>
  );
}