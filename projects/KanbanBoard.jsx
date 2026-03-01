import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const TASK_COLUMNS = [
  { id: "Pending", label: "To Do", color: "bg-gray-500" },
  { id: "In Progress", label: "In Progress", color: "bg-blue-500" },
  { id: "Completed", label: "Done", color: "bg-green-500" },
  { id: "Cancelled", label: "Cancelled", color: "bg-red-500" },
];

const PRIORITY_COLORS = {
  Low: "bg-gray-100 text-gray-700",
  Medium: "bg-blue-100 text-blue-700",
  High: "bg-orange-100 text-orange-700",
  Urgent: "bg-red-100 text-red-700",
};

export default function KanbanBoard({ tasks = [], queryKey = "analytics-tasks" }) {
  const qc = useQueryClient();

  const updateTask = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Task.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
    onError: (e) => toast.error(`Failed to update: ${e?.message}`),
  });

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId;
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== newStatus) {
      updateTask.mutate({ id: taskId, status: newStatus });
    }
  };

  const getColumnTasks = (columnId) =>
    tasks.filter((t) => t.status === columnId);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {TASK_COLUMNS.map((col) => {
          const colTasks = getColumnTasks(col.id);
          return (
            <div key={col.id} className="flex flex-col">
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className={`w-3 h-3 rounded-full ${col.color}`} />
                <h4 className="font-semibold text-gray-800">{col.label}</h4>
                <Badge variant="outline" className="ml-auto text-xs">
                  {colTasks.length}
                </Badge>
              </div>
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 min-h-[200px] rounded-lg p-2 transition-colors ${
                      snapshot.isDraggingOver ? "bg-blue-50 border-2 border-blue-200 border-dashed" : "bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <div className="space-y-2">
                      {colTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`bg-white rounded-lg border p-3 shadow-sm ${
                                snapshot.isDragging ? "shadow-lg ring-2 ring-blue-300" : "hover:shadow-md"
                              } transition-all`}
                            >
                              <div className="flex items-start gap-2">
                                <div {...provided.dragHandleProps} className="pt-0.5 cursor-grab">
                                  <GripVertical className="w-4 h-4 text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                                  {task.task_type && (
                                    <p className="text-xs text-gray-500 mt-0.5">{task.task_type}</p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    {task.priority && (
                                      <Badge className={`text-xs ${PRIORITY_COLORS[task.priority] || ""}`}>
                                        {task.priority}
                                      </Badge>
                                    )}
                                    {task.due_date && (
                                      <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {format(new Date(task.due_date), "MMM d")}
                                      </span>
                                    )}
                                    {task.assigned_to && (
                                      <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        {task.assigned_to.split("@")[0]}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}