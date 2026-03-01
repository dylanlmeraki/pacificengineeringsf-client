import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Clock } from "lucide-react";

export default function ProgressTracker({ milestones = [] }) {
  const completedCount = milestones.filter(m => m.completion_percentage >= 100).length;
  const totalCount = milestones.length;
  const overallProgress = totalCount > 0 
    ? Math.round((completedCount / totalCount) * 100) 
    : 0;

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900">Project Progress</h3>
          <Badge className="bg-blue-100 text-blue-700">
            {completedCount}/{totalCount} Complete
          </Badge>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-1">{overallProgress}% Overall Completion</p>
      </div>

      <div className="space-y-4">
        {milestones.map((milestone, idx) => {
          const isComplete = milestone.completion_percentage >= 100;
          const isPending = milestone.status === "Pending Client Approval";
          
          return (
            <div key={milestone.id} className="flex items-start gap-4">
              <div className="mt-1">
                {isComplete ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : isPending ? (
                  <Clock className="w-6 h-6 text-orange-500" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-400" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h4 className="font-semibold text-gray-900">{milestone.milestone_name}</h4>
                    <p className="text-sm text-gray-600">{milestone.description}</p>
                  </div>
                  <Badge className={
                    milestone.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    milestone.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                    milestone.status === 'In Progress' ? 'bg-cyan-100 text-cyan-700' :
                    milestone.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    'bg-orange-100 text-orange-700'
                  }>
                    {milestone.status}
                  </Badge>
                </div>
                
                <div className="mt-2">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        isComplete ? 'bg-green-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${milestone.completion_percentage || 0}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                    <span>{milestone.completion_percentage || 0}%</span>
                    {milestone.due_date && (
                      <span>Due: {new Date(milestone.due_date).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}