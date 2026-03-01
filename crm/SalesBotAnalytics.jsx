import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, Mail, Target, Award, Calendar, Activity } from "lucide-react";
import { format, subDays } from "date-fns";

export default function SalesBotAnalytics() {
  const { data: prospects = [] } = useQuery({
    queryKey: ['prospects-analytics'],
    queryFn: () => base44.entities.Prospect.list('-created_date', 500),
    initialData: []
  });

  const { data: outreach = [] } = useQuery({
    queryKey: ['outreach-analytics'],
    queryFn: () => base44.entities.SalesOutreach.list('-sent_date', 500),
    initialData: []
  });

  const { data: interactions = [] } = useQuery({
    queryKey: ['interactions-analytics'],
    queryFn: () => base44.entities.Interaction.list('-interaction_date', 500),
    initialData: []
  });

  // Calculate metrics
  const totalProspects = prospects.length;
  const botGeneratedLeads = prospects.filter(p => p.lead_source === "AI Research" || p.tags?.includes("Sales Bot")).length;
  const qualifiedLeads = prospects.filter(p => p.status === "Qualified" || p.status === "Meeting Scheduled").length;
  const conversionRate = botGeneratedLeads > 0 ? ((qualifiedLeads / botGeneratedLeads) * 100).toFixed(1) : 0;

  // Emails sent over time (last 30 days)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    const dateStr = format(date, 'MMM d');
    const count = outreach.filter(o => {
      const sentDate = new Date(o.sent_date);
      return format(sentDate, 'MMM d') === dateStr;
    }).length;
    return { date: dateStr, emails: count };
  });

  // Lead quality distribution
  const scoreDistribution = [
    { range: '1-3', count: prospects.filter(p => p.prospect_score >= 1 && p.prospect_score <= 3).length },
    { range: '4-6', count: prospects.filter(p => p.prospect_score >= 4 && p.prospect_score <= 6).length },
    { range: '7-8', count: prospects.filter(p => p.prospect_score >= 7 && p.prospect_score <= 8).length },
    { range: '9-10', count: prospects.filter(p => p.prospect_score >= 9 && p.prospect_score <= 10).length }
  ];

  // Response rates
  const emailsSent = outreach.length;
  const emailsReplied = outreach.filter(o => o.replied).length;
  const responseRate = emailsSent > 0 ? ((emailsReplied / emailsSent) * 100).toFixed(1) : 0;

  // Status breakdown
  const statusBreakdown = [
    { name: 'New', value: prospects.filter(p => p.status === "New").length, color: '#3b82f6' },
    { name: 'Contacted', value: prospects.filter(p => p.status === "Contacted").length, color: '#06b6d4' },
    { name: 'Engaged', value: prospects.filter(p => p.status === "Engaged").length, color: '#8b5cf6' },
    { name: 'Qualified', value: prospects.filter(p => p.status === "Qualified").length, color: '#10b981' },
    { name: 'Nurture', value: prospects.filter(p => p.status === "Nurture").length, color: '#f59e0b' }
  ].filter(s => s.value > 0);

  // Top performing email types
  const emailTypeStats = {};
  outreach.forEach(o => {
    if (!emailTypeStats[o.email_type]) {
      emailTypeStats[o.email_type] = { sent: 0, replied: 0 };
    }
    emailTypeStats[o.email_type].sent++;
    if (o.replied) emailTypeStats[o.email_type].replied++;
  });

  const emailTypePerformance = Object.entries(emailTypeStats).map(([type, stats]) => ({
    type,
    sent: stats.sent,
    replied: stats.replied,
    rate: ((stats.replied / stats.sent) * 100).toFixed(1)
  })).sort((a, b) => parseFloat(b.rate) - parseFloat(a.rate));

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{botGeneratedLeads}</span>
          </div>
          <p className="text-sm opacity-90">Bot Generated Leads</p>
        </Card>

        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{conversionRate}%</span>
          </div>
          <p className="text-sm opacity-90">Conversion Rate</p>
        </Card>

        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <div className="flex items-center justify-between mb-2">
            <Mail className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{responseRate}%</span>
          </div>
          <p className="text-sm opacity-90">Response Rate</p>
        </Card>

        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{qualifiedLeads}</span>
          </div>
          <p className="text-sm opacity-90">Qualified Leads</p>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Email Activity Over Time */}
        <Card className="p-6 border-0 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Email Activity (Last 30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={last30Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#6b7280" />
              <YAxis tick={{ fontSize: 11 }} stroke="#6b7280" />
              <Tooltip />
              <Line type="monotone" dataKey="emails" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Lead Quality Distribution */}
        <Card className="p-6 border-0 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Lead Quality Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} stroke="#6b7280" />
              <YAxis tick={{ fontSize: 11 }} stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Lead Status Breakdown */}
        <Card className="p-6 border-0 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Lead Status Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Email Template Performance */}
        <Card className="p-6 border-0 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-green-600" />
            Email Template Performance
          </h3>
          <div className="space-y-3">
            {emailTypePerformance.slice(0, 5).map((template) => (
              <div key={template.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{template.type}</p>
                  <p className="text-xs text-gray-600">{template.sent} sent • {template.replied} replied</p>
                </div>
                <Badge className={
                  parseFloat(template.rate) >= 20 ? 'bg-green-100 text-green-700' :
                  parseFloat(template.rate) >= 10 ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }>
                  {template.rate}%
                </Badge>
              </div>
            ))}
            {emailTypePerformance.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Mail className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm">No email data yet</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6 border-0 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Recent Bot Activity
        </h3>
        <div className="space-y-2">
          {outreach.slice(0, 10).map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{item.prospect_name}</p>
                <p className="text-xs text-gray-600">{item.company_name} • {item.email_type}</p>
              </div>
              <div className="text-xs text-gray-500">
                {format(new Date(item.sent_date), 'MMM d, h:mm a')}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}