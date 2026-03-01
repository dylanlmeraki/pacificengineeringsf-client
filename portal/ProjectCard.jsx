import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  TrendingUp,
  ArrowRight,
  Droplets,
  HardHat,
  ClipboardCheck,
  Building2,
  Shield
} from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  "Planning": "bg-gray-100 text-gray-700 border-gray-300",
  "In Progress": "bg-blue-100 text-blue-700 border-blue-300",
  "On Hold": "bg-yellow-100 text-yellow-700 border-yellow-300",
  "Under Review": "bg-purple-100 text-purple-700 border-purple-300",
  "Completed": "bg-green-100 text-green-700 border-green-300",
  "Closed": "bg-gray-100 text-gray-500 border-gray-200"
};

const priorityColors = {
  "Low": "text-gray-600",
  "Medium": "text-blue-600",
  "High": "text-orange-600",
  "Urgent": "text-red-600"
};

const projectTypeIcons = {
  "SWPPP": Droplets,
  "Construction": HardHat,
  "Inspections": ClipboardCheck,
  "Engineering": Building2,
  "Special Inspections": Shield,
  "Multiple Services": TrendingUp
};

export default function ProjectCard({ project }) {
  const Icon = projectTypeIcons[project.project_type] || TrendingUp;
  
  return (
    <Link to={createPageUrl(`ProjectDetail?id=${project.id}`)} className="block group">
      <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden transform hover:scale-[1.02]">
        {/* Status Bar */}
        <div className={`h-1 ${project.status === 'Completed' ? 'bg-green-500' : project.status === 'In Progress' ? 'bg-blue-500' : 'bg-gray-300'}`} />
        
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {project.project_name}
                </h3>
                <p className="text-sm text-gray-500">#{project.project_number}</p>
              </div>
            </div>
            <Badge className={`${statusColors[project.status]} border`}>
              {project.status}
            </Badge>
          </div>

          {/* Project Info */}
          <div className="space-y-3 mb-5">
            {project.location && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{project.location}</span>
              </div>
            )}
            
            {project.start_date && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Started: {format(new Date(project.start_date), 'MMM d, yyyy')}</span>
              </div>
            )}
            
            {project.estimated_completion && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>Est. Completion: {format(new Date(project.estimated_completion), 'MMM d, yyyy')}</span>
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-bold text-gray-900">{project.progress_percentage}%</span>
            </div>
            <Progress value={project.progress_percentage} className="h-2" />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {project.project_type}
              </Badge>
              {project.priority && (
                <span className={`text-xs font-medium ${priorityColors[project.priority]}`}>
                  {project.priority} Priority
                </span>
              )}
            </div>
            
            <div className="flex items-center text-blue-600 text-sm font-semibold group-hover:text-blue-700">
              View Details
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}