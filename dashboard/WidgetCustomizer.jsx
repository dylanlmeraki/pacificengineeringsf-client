import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function WidgetCustomizer({ current = [], onChange, children }) {
  const [open, setOpen] = React.useState(false);
  const [widgets, setWidgets] = React.useState(current);

  React.useEffect(()=> setWidgets(current), [current]);

  const move = (idx, dir) => {
    const next = widgets.slice();
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    const [it] = next.splice(idx, 1);
    next.splice(j, 0, it);
    const ordered = next.map((w, i) => ({ ...w, order: i }));
    setWidgets(ordered);
  };

  const save = () => {
    onChange?.(widgets);
    setOpen(false);
  };

  return (
    <div>
      <span onClick={()=>setOpen(true)}>{children}</span>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={()=>setOpen(false)} />
      )}
      {open && (
        <div className="fixed right-4 top-20 z-50 w-80 bg-white border rounded-xl shadow-lg p-4 space-y-3">
          <div className="text-sm font-semibold">Customize Widgets</div>
          <div className="space-y-2 max-h-80 overflow-auto pr-2">
            {widgets.map((w, idx)=> (
              <div key={w.key} className="flex items-center justify-between gap-2 py-1 border-b last:border-0">
                <div className="flex-1">
                  <div className="text-sm capitalize">{w.key.replace('_',' ')}</div>
                  <div className="text-xs text-slate-500">Order: {idx+1}</div>
                </div>
                <Switch checked={!!w.visible} onCheckedChange={(v)=>{
                  const next = widgets.map(x => x.key===w.key ? { ...x, visible: v } : x);
                  setWidgets(next);
                }} />
                <div className="flex flex-col gap-1 ml-2">
                  <Button size="sm" variant="outline" onClick={()=>move(idx, -1)}>Up</Button>
                  <Button size="sm" variant="outline" onClick={()=>move(idx, 1)}>Down</Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </div>
        </div>
      )}
    </div>
  );
}