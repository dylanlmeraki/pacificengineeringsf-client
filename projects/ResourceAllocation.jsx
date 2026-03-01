import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, FolderOpen, CheckCircle2, AlertTriangle } from "lucide-react";

export default function ResourceAllocation({ projects = [], tasks = [], users = [] }) {
  const teamData = React.useMemo(() => {
    const map = {};
    // Count projects per member
    projects.forEach((p) => {
      (p.assigned_team_members || []).forEach((email) => {
        if (!map[email]) {
          const u = users.find((u) => u.email === email);
          map[email] = {
            email,
            name: u?.full_name || email.split("@")[0],
            projectCount: 0,
            tasksPending: 0,
            tasksCompleted: 0,
            activeProjects: [],
          };
        }
        map[email].projectCount += 1;
        if (["Planning", "In Progress", "Under Review"].includes(p.status)) {
          map[email].activeProjects.push(p.project_name);
        }
      });
    });
    // Count tasks per member
    tasks.forEach((t) => {
      if (t.assigned_to && map[t.assigned_to]) {
        if (t.status === "Completed") map[t.assigned_to].tasksCompleted += 1;
        else map[t.assigned_to].tasksPending += 1;
      }
    });
    return Object.values(map).sort((a, b) => b.projectCount - a.projectCount);
  }, [projects, tasks, users]);

  const maxLoad = Math.max(...teamData.map((m) => m.projectCount), 1);

  return (
    <Card className="p-6 border-0 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-indigo-600" />
        Resource Allocation
      </h3>
      {teamData.length === 0 ? (
        <div className="text-sm text-gray-500 text-center py-8">No team members assigned</div>
      ) : (
        <div className="space-y-4">
          {teamData.map((member) => {
            const loadPct = (member.projectCount / maxLoad) * 100;
            const isOverloaded = member.projectCount >= 5;
            return (
              <div key={member.email} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium text-gray-900">{member.name}</span>
                    <span className="text-xs text-gray-500 ml-2">{member.email}</span>
                  </div>
                  {isOverloaded && (
                    <Badge className="bg-red-100 text-red-700 gap-1">
                      <AlertTriangle className="w-3 h-3" /> Overloaded
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <span className="flex items-center gap-1">
                    <FolderOpen className="w-3.5 h-3.5" /> {member.projectCount} projects
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {member.tasksCompleted} done
                  </span>
                  <span className="flex items-center gap-1">
                    {member.tasksPending} pending
                  </span>
                </div>
                <Progress value={loadPct} className="h-2" />
                {member.activeProjects.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {member.activeProjects.slice(0, 4).map((pn, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {pn.length > 20 ? pn.slice(0, 18) + "…" : pn}
                      </Badge>
                    ))}
                    {member.activeProjects.length > 4 && (
                      <Badge variant="outline" className="text-xs">+{member.activeProjects.length - 4}</Badge>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}