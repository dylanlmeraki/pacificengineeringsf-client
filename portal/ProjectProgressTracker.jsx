import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Clock, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { format, differenceInDays } from "date-fns";

export default function ProjectProgressTracker({ project, milestones = [] }) {
  const projectMilestones = milestones
    .filter(m => m.project_id === project.id)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  const completedMilestones = projectMilestones.filter(m => m.status === "Completed");
  const pendingMilestones = projectMilestones.filter(m => m.status === "Pending Client Approval");
  const upcomingMilestones = projectMilestones.filter(m => 
    m.status === "In Progress" || m.status === "Not Started"
  );

  const nextMilestone = upcomingMilestones[0];
  const daysUntilNext = nextMilestone?.due_date 
    ? differenceInDays(new Date(nextMilestone.due_date), new Date())
    : null;

  const statusColors = {
    "Planning": "bg-blue-100 text-blue-700 border-blue-300",
    "In Progress": "bg-green-100 text-green-700 border-green-300",
    "Under Review": "bg-purple-100 text-purple-700 border-purple-300",
    "On Hold": "bg-orange-100 text-orange-700 border-orange-300",
    "Completed": "bg-gray-100 text-gray-700 border-gray-300",
    "Closed": "bg-gray-100 text-gray-700 border-gray-300"
  };

  const priorityColors = {
    "Low": "text-blue-600",
    "Medium": "text-yellow-600",
    "High": "text-orange-600",
    "Urgent": "text-red-600"
  };

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{project.project_name}</h2>
            <p className="text-cyan-100 mb-3">#{project.project_number}</p>
            {project.description && (
              <p className="text-sm text-cyan-50 mb-4 leading-relaxed">{project.description}</p>
            )}
          </div>
          <Badge className={`${statusColors[project.status]} border-2`}>
            {project.status}
          </Badge>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <div className="text-xs text-cyan-100 mb-1">Progress</div>
            <div className="text-2xl font-bold">{project.progress_percentage || 0}%</div>
          </div>
          {project.start_date && (
            <div className="bg-white/10 backdrop-blur rounded-lg p-3">
              <div className="text-xs text-cyan-100 mb-1">Started</div>
              <div className="text-sm font-semibold">{format(new Date(project.start_date), 'MMM d, yyyy')}</div>
            </div>
          )}
          {project.estimated_completion && (
            <div className="bg-white/10 backdrop-blur rounded-lg p-3">
              <div className="text-xs text-cyan-100 mb-1">Est. Completion</div>
              <div className="text-sm font-semibold">{format(new Date(project.estimated_completion), 'MMM d, yyyy')}</div>
            </div>
          )}
        </div>

        <Progress value={project.progress_percentage || 0} className="h-3 bg-white/20" />
      </Card>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">{completedMilestones.length}</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Completed</p>
        </Card>

        <Card className="p-4 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-6 h-6 text-orange-600" />
            <span className="text-2xl font-bold text-gray-900">{pendingMilestones.length}</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Pending Approval</p>
        </Card>

        <Card className="p-4 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">{upcomingMilestones.length}</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Upcoming</p>
        </Card>

        <Card className="p-4 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-6 h-6 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">{projectMilestones.length}</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Total Milestones</p>
        </Card>
      </div>

      {/* Next Milestone */}
      {nextMilestone && (
        <Card className="p-6 border-0 shadow-xl bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-500">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Next Milestone</h3>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">{nextMilestone.milestone_name}</h4>
              {nextMilestone.description && (
                <p className="text-gray-700 mb-3">{nextMilestone.description}</p>
              )}
              <div className="flex items-center gap-4 flex-wrap text-sm">
                {daysUntilNext !== null && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold">
                      {daysUntilNext > 0 ? `${daysUntilNext} days remaining` : 
                       daysUntilNext === 0 ? 'Due today' : 
                       `${Math.abs(daysUntilNext)} days overdue`}
                    </span>
                  </div>
                )}
                {nextMilestone.amount && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold">${nextMilestone.amount.toLocaleString()}</span>
                  </div>
                )}
                <Badge className="bg-purple-100 text-purple-700">
                  {nextMilestone.status}
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Milestone Timeline */}
      <Card className="p-6 border-0 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Project Timeline</h3>
        
        {projectMilestones.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Circle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p>No milestones defined yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projectMilestones.map((milestone, idx) => {
              const isCompleted = milestone.status === "Completed";
              const isPending = milestone.status === "Pending Client Approval";
              const isOverdue = milestone.due_date && new Date(milestone.due_date) < new Date() && !isCompleted;

              return (
                <div key={milestone.id} className="relative">
                  {/* Timeline Line */}
                  {idx < projectMilestones.length - 1 && (
                    <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-200" />
                  )}
                  
                  <div className="flex gap-4">
                    {/* Status Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                      isCompleted ? 'bg-green-100' : 
                      isPending ? 'bg-orange-100' :
                      'bg-gray-100'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : isPending ? (
                        <Clock className="w-5 h-5 text-orange-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    {/* Milestone Content */}
                    <div className="flex-1 pb-6">
                      <div className={`p-4 rounded-lg border-2 transition-all ${
                        isCompleted ? 'bg-green-50 border-green-200' :
                        isPending ? 'bg-orange-50 border-orange-200' :
                        isOverdue ? 'bg-red-50 border-red-200' :
                        'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-lg mb-1">{milestone.milestone_name}</h4>
                            {milestone.description && (
                              <p className="text-sm text-gray-700 mb-2">{milestone.description}</p>
                            )}
                          </div>
                          <Badge className={
                            isCompleted ? 'bg-green-100 text-green-700' :
                            isPending ? 'bg-orange-100 text-orange-700' :
                            isOverdue ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }>
                            {milestone.status}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 flex-wrap text-sm text-gray-600">
                          {milestone.due_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>Due: {format(new Date(milestone.due_date), 'MMM d, yyyy')}</span>
                            </div>
                          )}
                          {milestone.amount && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span>${milestone.amount.toLocaleString()}</span>
                            </div>
                          )}
                          {milestone.progress_percentage !== undefined && (
                            <div className="flex items-center gap-2 flex-1 min-w-[150px]">
                              <span className="font-semibold">{milestone.progress_percentage}%</span>
                              <Progress value={milestone.progress_percentage} className="h-2 flex-1" />
                            </div>
                          )}
                        </div>

                        {milestone.completed_date && (
                          <div className="mt-2 text-xs text-gray-500">
                            Completed on {format(new Date(milestone.completed_date), 'MMM d, yyyy')}
                          </div>
                        )}

                        {isOverdue && !isCompleted && (
                          <div className="mt-2 text-xs text-red-600 font-semibold">
                            ⚠️ Overdue by {Math.abs(differenceInDays(new Date(milestone.due_date), new Date()))} days
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Project Team & Details */}
      <Card className="p-6 border-0 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Project Details</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {project.project_type && (
            <div>
              <span className="text-sm text-gray-600 font-semibold">Project Type:</span>
              <p className="text-gray-900">{project.project_type}</p>
            </div>
          )}
          {project.location && (
            <div>
              <span className="text-sm text-gray-600 font-semibold">Location:</span>
              <p className="text-gray-900">{project.location}</p>
            </div>
          )}
          {project.priority && (
            <div>
              <span className="text-sm text-gray-600 font-semibold">Priority:</span>
              <p className={`font-bold ${priorityColors[project.priority]}`}>{project.priority}</p>
            </div>
          )}
          {project.assigned_team_members && project.assigned_team_members.length > 0 && (
            <div>
              <span className="text-sm text-gray-600 font-semibold">Team Members:</span>
              <p className="text-gray-900">{project.assigned_team_members.join(', ')}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}