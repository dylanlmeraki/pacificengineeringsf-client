import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminRoute from "../components/internal/AdminRoute";
import InternalLayout from "../components/internal/InternalLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Clock,
  Activity,
  TrendingUp,
  PlayCircle,
  FileText
} from "lucide-react";
import moment from "moment";

export default function WebsiteMonitoring() {
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState(null);
  const queryClient = useQueryClient();

  const { data: monitors = [], isLoading } = useQuery({
    queryKey: ['website-monitors'],
    queryFn: async () => {
      return await base44.entities.WebsiteMonitor.list('-last_checked', 50);
    },
    refetchInterval: 60000 // Refresh every minute
  });

  const handleCheckNow = async () => {
    setIsChecking(true);
    setResult(null);

    try {
      const response = await base44.functions.invoke('monitorWebsiteChanges', {});
      setResult(response.data);
      queryClient.invalidateQueries(['website-monitors']);
    } catch (err) {
      setResult({
        success: false,
        error: err.message || 'Monitoring check failed'
      });
    }

    setIsChecking(false);
  };

  const totalChecks = monitors.reduce((sum, m) => sum + (m.check_count || 0), 0);
  const totalChanges = monitors.reduce((sum, m) => sum + (m.change_count || 0), 0);
  const activeMonitors = monitors.filter(m => m.monitoring_active).length;

  return (
    <AdminRoute>
      <InternalLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-6 shadow-xl">
                <Eye className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4">AI Website Monitor</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Automatic change detection and PDF regeneration
              </p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card className="p-6 border-0 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-8 h-8 text-purple-600" />
                  <span className="text-3xl font-bold">{activeMonitors}</span>
                </div>
                <p className="text-sm text-gray-600 font-medium">Active Monitors</p>
              </Card>

              <Card className="p-6 border-0 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-8 h-8 text-blue-600" />
                  <span className="text-3xl font-bold">{totalChecks}</span>
                </div>
                <p className="text-sm text-gray-600 font-medium">Total Checks</p>
              </Card>

              <Card className="p-6 border-0 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  <span className="text-3xl font-bold">{totalChanges}</span>
                </div>
                <p className="text-sm text-gray-600 font-medium">Changes Detected</p>
              </Card>

              <Card className="p-6 border-0 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-8 h-8 text-cyan-600" />
                  <span className="text-3xl font-bold">{totalChanges}</span>
                </div>
                <p className="text-sm text-gray-600 font-medium">PDFs Generated</p>
              </Card>
            </div>

            {/* Control Panel */}
            <Card className="p-8 border-0 shadow-2xl mb-8 bg-white/90 backdrop-blur">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 p-6 rounded-r-lg">
                  <h3 className="font-bold text-gray-900 mb-2">How It Works</h3>
                  <ul className="text-gray-700 text-sm space-y-2">
                    <li>• Monitors all 13 public pages for content changes</li>
                    <li>• Uses SHA-256 hashing to detect even minor updates</li>
                    <li>• Automatically regenerates PDFs when changes detected</li>
                    <li>• Emails updated PDFs to dylanllouis@gmail.com</li>
                    <li>• Notifies admin if regeneration fails</li>
                    <li>• Run manually below or schedule automatic checks</li>
                  </ul>
                </div>

                <Button
                  onClick={handleCheckNow}
                  disabled={isChecking}
                  size="lg"
                  className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                      Checking for Changes...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-6 h-6 mr-3" />
                      Check for Changes Now
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Result */}
            {result && (
              <Card className={`p-8 border-0 shadow-xl mb-8 ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-start gap-4">
                  {result.success ? (
                    <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      {result.changesDetected ? 'Changes Detected!' : 'No Changes'}
                    </h2>
                    <p className="text-gray-700 mb-4">{result.message}</p>
                    {result.changedPages && result.changedPages.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900">Changed Pages:</h3>
                        <ul className="space-y-1">
                          {result.changedPages.map((page, idx) => (
                            <li key={idx} className="text-gray-700">
                              • {page.name} ({page.path})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Monitor Status Table */}
            <Card className="p-8 border-0 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Monitoring Status</h2>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
              ) : monitors.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No monitoring data yet. Click "Check for Changes Now" to initialize.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Page</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Checked</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Changed</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Checks</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Changes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monitors.map((monitor, idx) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="font-medium text-gray-900">{monitor.page_name}</div>
                            <div className="text-xs text-gray-500">{monitor.page_path}</div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={monitor.monitoring_active ? 'bg-green-500' : 'bg-gray-400'}>
                              {monitor.monitoring_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {monitor.last_checked ? moment(monitor.last_checked).fromNow() : 'Never'}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {monitor.last_changed ? moment(monitor.last_changed).fromNow() : 'Never'}
                          </td>
                          <td className="py-4 px-4 text-right text-sm font-medium">
                            {monitor.check_count || 0}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <Badge variant={monitor.change_count > 0 ? 'default' : 'outline'}>
                              {monitor.change_count || 0}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>
      </InternalLayout>
    </AdminRoute>
  );
}