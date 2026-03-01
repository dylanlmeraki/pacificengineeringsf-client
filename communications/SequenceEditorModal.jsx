import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SequenceEditor from "@/components/communications/SequenceEditor";

export default function SequenceEditorModal({ isOpen, onClose, sequence, templates = [], onSave }) {
  return (
    <Dialog open={isOpen} onOpenChange={(open)=>{ if (!open) onClose?.(); }}>
      <DialogContent className="max-w-3xl p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>{sequence?.id ? 'Edit Follow-Up Sequence' : 'New Follow-Up Sequence'}</DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-6">
          <SequenceEditor
            sequence={sequence || { steps: [], active: true, approval_required: true }}
            templates={templates}
            onCancel={onClose}
            onSave={onSave}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}