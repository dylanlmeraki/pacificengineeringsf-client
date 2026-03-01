import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function ClientTaskList({ projectId, user }) {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['client-tasks', projectId],
    queryFn: () => base44.entities.ClientTask.filter({ project_id: projectId }, 'order_index'),
    enabled: !!projectId
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, completed }) => {
      return await base44.entities.ClientTask.update(taskId, {
        completed,
        completed_date: completed ? new Date().toISOString() : null,
        completed_by: completed ? user.email : null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['client-tasks']);
    }
  });

  const handleToggle = (task) => {
    toggleTaskMutation.mutate({
      taskId: task.id,
      completed: !task.completed
    });
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Circle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">No tasks assigned yet</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-0 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Your Tasks</h3>
        <Badge className="bg-blue-100 text-blue-700">
          {completedCount} / {tasks.length} Complete
        </Badge>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Progress</span>
          <span className="font-semibold text-gray-900">{progressPercentage}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-4 rounded-lg border transition-all ${
              task.completed 
                ? 'bg-green-50 border-green-200' 
                : 'bg-white border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => handleToggle(task)}
                disabled={toggleTaskMutation.isPending}
                className="mt-1"
              >
                {task.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400 hover:text-blue-600" />
                )}
              </button>
              
              <div className="flex-1">
                <h4 className={`font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {task.task_title}
                </h4>
                {task.task_description && (
                  <p className="text-sm text-gray-600 mt-1">{task.task_description}</p>
                )}
                
                <div className="flex items-center gap-3 mt-2 text-xs">
                  {task.due_date && (
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>Due {format(new Date(task.due_date), 'MMM d')}</span>
                    </div>
                  )}
                  {task.completed && task.completed_date && (
                    <div className="text-green-600">
                      Completed {format(new Date(task.completed_date), 'MMM d, yyyy')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}