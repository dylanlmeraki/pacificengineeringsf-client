import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Clock, Target, AlertTriangle, DollarSign } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function ProposalAnalytics({ proposals = [], dateRange = "30d" }) {
  const analytics = useMemo(() => {
    const now = new Date();
    const daysAgo = parseInt(dateRange) || 30;
    const cutoffDate = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
    
    const filtered = proposals.filter(p => new Date(p.created_date) >= cutoffDate);
    
    // Pipeline stages
    const stageDistribution = {
      draft: filtered.filter(p => p.status === 'draft').length,
      sent: filtered.filter(p => p.status === 'sent').length,
      viewed: filtered.filter(p => p.status === 'viewed').length,
      awaiting_signature: filtered.filter(p => p.status === 'awaiting_signature').length,
      signed: filtered.filter(p => p.status === 'signed').length,
      declined: filtered.filter(p => p.status === 'declined').length
    };
    
    // Win/loss ratio
    const totalDecided = stageDistribution.signed + stageDistribution.declined;
    const winRate = totalDecided > 0 ? (stageDistribution.signed / totalDecided * 100).toFixed(1) : 0;
    
    // Average time per stage (days)
    const signedProposals = filtered.filter(p => p.status === 'signed' && p.sent_date && p.signed_date);
    const avgTimeToClose = signedProposals.length > 0
      ? signedProposals.reduce((sum, p) => {
          const sent = new Date(p.sent_date);
          const signed = new Date(p.signed_date);
          return sum + (signed - sent) / (1000 * 60 * 60 * 24);
        }, 0) / signedProposals.length
      : 0;
    
    // Aging analysis (proposals pending > 7 days)
    const agingProposals = filtered.filter(p => {
      if (!['sent', 'viewed', 'awaiting_signature'].includes(p.status)) return false;
      if (!p.sent_date) return false;
      const daysSinceSent = (now - new Date(p.sent_date)) / (1000 * 60 * 60 * 24);
      return daysSinceSent > 7;
    });
    
    // Value analysis
    const totalValue = filtered.reduce((sum, p) => sum + (p.amount || 0), 0);
    const wonValue = filtered
      .filter(p => p.status === 'signed')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    
    // By project type
    const byType = {};
    filtered.forEach(p => {
      const type = p.fields_data?.service_interest || 'Other';
      if (!byType[type]) byType[type] = { total: 0, won: 0, lost: 0 };
      byType[type].total++;
      if (p.status === 'signed') byType[type].won++;
      if (p.status === 'declined') byType[type].lost++;
    });
    
    // Trend data (last 6 periods)
    const trendData = [];
    for (let i = 5; i >= 0; i--) {
      const periodEnd = new Date(now - i * 7 * 24 * 60 * 60 * 1000);
      const periodStart = new Date(periodEnd - 7 * 24 * 60 * 60 * 1000);
      const periodProposals = proposals.filter(p => {
        const d = new Date(p.created_date);
        return d >= periodStart && d < periodEnd;
      });
      trendData.push({
        period: `Week ${6-i}`,
        created: periodProposals.length,
        won: periodProposals.filter(p => p.status === 'signed').length,
        lost: periodProposals.filter(p => p.status === 'declined').length
      });
    }
    
    return {
      stageDistribution,
      winRate,
      avgTimeToClose: avgTimeToClose.toFixed(1),
      agingProposals,
      totalValue,
      wonValue,
      byType: Object.entries(byType).map(([name, data]) => ({
        name,
        ...data,
        winRate: data.total > 0 ? ((data.won / data.total) * 100).toFixed(1) : 0
      })),
      trendData
    };
  }, [proposals, dateRange]);
  
  const pieData = [
    { name: 'Draft', value: analytics.stageDistribution.draft },
    { name: 'Sent', value: analytics.stageDistribution.sent },
    { name: 'Viewed', value: analytics.stageDistribution.viewed },
    { name: 'Awaiting Signature', value: analytics.stageDistribution.awaiting_signature },
    { name: 'Signed', value: analytics.stageDistribution.signed },
    { name: 'Declined', value: analytics.stageDistribution.declined }
  ].filter(d => d.value > 0);
  
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-blue-600" />
            <Badge className="bg-blue-600 text-white">{analytics.winRate}%</Badge>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{analytics.stageDistribution.signed}</h3>
          <p className="text-sm text-gray-600">Proposals Won</p>
        </Card>
        
        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-600" />
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            ${(analytics.wonValue / 1000).toFixed(0)}K
          </h3>
          <p className="text-sm text-gray-600">Revenue Won</p>
        </Card>
        
        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-orange-600" />
            <span className="text-lg font-bold text-orange-600">{analytics.avgTimeToClose}d</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Avg Close Time</h3>
          <p className="text-sm text-gray-600">Days to Decision</p>
        </Card>
        
        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-red-50 to-pink-50">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <Badge variant="outline" className="border-red-300 text-red-700">
              {analytics.agingProposals.length}
            </Badge>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Aging</h3>
          <p className="text-sm text-gray-600">Proposals &gt; 7 Days</p>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pipeline Distribution */}
        <Card className="p-6 border-0 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Pipeline Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        
        {/* Trend Analysis */}
        <Card className="p-6 border-0 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">6-Week Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={2} name="Created" />
              <Line type="monotone" dataKey="won" stroke="#10b981" strokeWidth={2} name="Won" />
              <Line type="monotone" dataKey="lost" stroke="#ef4444" strokeWidth={2} name="Lost" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
      
      {/* Win Rate by Type */}
      <Card className="p-6 border-0 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Performance by Service Type</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics.byType}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="won" fill="#10b981" name="Won" />
            <Bar dataKey="lost" fill="#ef4444" name="Lost" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}