import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

function get(obj, path) {
  if (!obj || !path) return "";
  return path.split('.').reduce((acc, k) => (acc && acc[k] != null ? acc[k] : ""), obj);
}

export default function DynamicDocForm({ template, doc, onChange }) {
  const sections = template?.field_sections || [];
  const [values, setValues] = React.useState({});

  React.useEffect(() => {
    // initialize with defaults and mappings
    const init = {};
    sections.forEach((s) => {
      (s.fields || []).forEach((f) => {
        let v = f.default_value;
        if (!v && f.mapping?.source && f.mapping?.path) {
          const source = f.mapping.source === "Project" ? doc?.project : doc;
          v = get(source || {}, f.mapping.path);
        }
        if (v !== undefined) init[f.key] = v;
      });
    });
    setValues((prev) => ({ ...init, ...prev }));
  }, [template]);

  React.useEffect(() => {
    onChange?.(values);
  }, [values]);

  const set = (k, v) => setValues((prev) => ({ ...prev, [k]: v }));

  const shouldShow = (field) => {
    const conds = field?.conditionals || [];
    if (!conds.length) return true;
    // basic support: all conditions must pass
    return conds.every((c) => {
      const other = values[c.field_key];
      switch (c.operator) {
        case "equals": return (c.action === "hide") ? other !== c.value : other === c.value;
        case "not_equals": return (c.action === "hide") ? other === c.value : other !== c.value;
        case "truthy": return (c.action === "hide") ? !other : !!other;
        case "falsy": return (c.action === "hide") ? !!other : !other;
        case "in": return (c.action === "hide") ? Array.isArray(c.value) && !c.value.includes(other) : Array.isArray(c.value) && c.value.includes(other);
        case "not_in": return (c.action === "hide") ? Array.isArray(c.value) && c.value.includes(other) : Array.isArray(c.value) && !c.value.includes(other);
        default: return true;
      }
    });
  };

  const Field = ({ f }) => {
    if (!shouldShow(f)) return null;
    const common = (
      <label className="text-xs text-gray-500 block mb-1">{f.label}{f.required ? " *" : ""}</label>
    );
    switch (f.kind) {
      case "textarea":
        return (
          <div className="space-y-1">
            {common}
            <Textarea value={values[f.key] || ""} onChange={(e)=>set(f.key, e.target.value)} placeholder={f.placeholder || ""} />
          </div>
        );
      case "number":
        return (
          <div className="space-y-1">
            {common}
            <Input type="number" value={values[f.key] ?? ""} onChange={(e)=>set(f.key, e.target.value === "" ? "" : Number(e.target.value))} placeholder={f.placeholder || ""} />
          </div>
        );
      case "date":
        return (
          <div className="space-y-1">
            {common}
            <Input type="date" value={values[f.key] || ""} onChange={(e)=>set(f.key, e.target.value)} />
          </div>
        );
      case "dropdown":
        return (
          <div className="space-y-1">
            {common}
            <Select value={values[f.key] || ""} onValueChange={(v)=>set(f.key, v)}>
              <SelectTrigger><SelectValue placeholder={f.placeholder || "Select"} /></SelectTrigger>
              <SelectContent>
                {(f.options || []).map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case "checkbox":
      case "boolean":
        return (
          <div className="flex items-center gap-2 py-1">
            <Checkbox checked={!!values[f.key]} onCheckedChange={(v)=>set(f.key, !!v)} />
            <span className="text-sm text-gray-700">{f.label}</span>
          </div>
        );
      case "radio":
        return (
          <div className="space-y-1">
            {common}
            <div className="flex flex-wrap gap-3">
              {(f.options || []).map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm">
                  <input type="radio" name={f.key} value={opt} checked={values[f.key] === opt} onChange={()=>set(f.key, opt)} />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        );
      case "multiselect":
        return (
          <div className="space-y-1">
            {common}
            <div className="flex flex-wrap gap-2">
              {(f.options || []).map((opt) => {
                const selected = Array.isArray(values[f.key]) ? values[f.key].includes(opt) : false;
                return (
                  <button type="button" key={opt} onClick={() => {
                      const curr = Array.isArray(values[f.key]) ? values[f.key] : [];
                      set(f.key, selected ? curr.filter(x=>x!==opt) : [...curr, opt]);
                    }} className={`px-2 py-1 rounded border text-sm ${selected ? "bg-slate-900 text-white" : "bg-white"}`}>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-1">
            {common}
            <Input value={values[f.key] || ""} onChange={(e)=>set(f.key, e.target.value)} placeholder={f.placeholder || ""} />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {sections.map((s) => (
        <div key={s.section_id} className="border rounded-lg p-3">
          <div className="font-medium text-gray-800 mb-2">{s.label}</div>
          <div className="grid md:grid-cols-2 gap-3">
            {(s.fields || []).map((f) => (
              <Field key={f.key} f={f} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}