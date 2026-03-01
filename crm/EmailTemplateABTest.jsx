import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { FlaskConical, Play, TrendingUp, Mail, Award } from "lucide-react";

export default function EmailTemplateABTest() {
  const [testConfig, setTestConfig] = useState({
    testName: "",
    variantA: { subject: "", body: "" },
    variantB: { subject: "", body: "" },
    sampleSize: 20
  });

  const [testResults, setTestResults] = useState(null);

  const sampleResults = {
    variantA: { sent: 10, opened: 6, replied: 2, responseRate: 20 },
    variantB: { sent: 10, opened: 8, replied: 4, responseRate: 40 },
    winner: "B"
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
            <FlaskConical className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">A/B Testing Lab</h3>
            <p className="text-sm text-gray-700">
              Test different email templates to optimize response rates. The bot will split test between two variants and identify the winner.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-0 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Configure A/B Test</h3>
        
        <div className="space-y-6">
          <div>
            <Label>Test Name</Label>
            <Input
              value={testConfig.testName}
              onChange={(e) => setTestConfig({ ...testConfig, testName: e.target.value })}
              placeholder="e.g., Value Proposition Test"
            />
          </div>

          <div>
            <Label>Sample Size (prospects per variant)</Label>
            <Input
              type="number"
              value={testConfig.sampleSize}
              onChange={(e) => setTestConfig({ ...testConfig, sampleSize: parseInt(e.target.value) })}
              min="10"
              max="100"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Variant A */}
            <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Badge className="bg-blue-600">Variant A</Badge>
              </h4>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Subject Line</Label>
                  <Input
                    value={testConfig.variantA.subject}
                    onChange={(e) => setTestConfig({
                      ...testConfig,
                      variantA: { ...testConfig.variantA, subject: e.target.value }
                    })}
                    placeholder="Subject line..."
                  />
                </div>
                <div>
                  <Label className="text-sm">Email Body</Label>
                  <Textarea
                    value={testConfig.variantA.body}
                    onChange={(e) => setTestConfig({
                      ...testConfig,
                      variantA: { ...testConfig.variantA, body: e.target.value }
                    })}
                    rows={8}
                    placeholder="Email body..."
                  />
                </div>
              </div>
            </div>

            {/* Variant B */}
            <div className="border-2 border-green-300 rounded-lg p-4 bg-green-50">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Badge className="bg-green-600">Variant B</Badge>
              </h4>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Subject Line</Label>
                  <Input
                    value={testConfig.variantB.subject}
                    onChange={(e) => setTestConfig({
                      ...testConfig,
                      variantB: { ...testConfig.variantB, subject: e.target.value }
                    })}
                    placeholder="Subject line..."
                  />
                </div>
                <div>
                  <Label className="text-sm">Email Body</Label>
                  <Textarea
                    value={testConfig.variantB.body}
                    onChange={(e) => setTestConfig({
                      ...testConfig,
                      variantB: { ...testConfig.variantB, body: e.target.value }
                    })}
                    rows={8}
                    placeholder="Email body..."
                  />
                </div>
              </div>
            </div>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12"
            disabled={!testConfig.testName || !testConfig.variantA.body || !testConfig.variantB.body}
          >
            <Play className="w-5 h-5 mr-2" />
            Launch A/B Test
          </Button>
        </div>
      </Card>

      {/* Sample Results Display */}
      <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-gray-50 to-blue-50">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Test Results Preview
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className={`p-4 rounded-lg border-2 ${sampleResults.winner === 'A' ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'}`}>
            <div className="flex items-center justify-between mb-3">
              <Badge className="bg-blue-600">Variant A</Badge>
              {sampleResults.winner === 'A' && <Award className="w-5 h-5 text-green-600" />}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Sent:</span>
                <span className="font-semibold">{sampleResults.variantA.sent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Opened:</span>
                <span className="font-semibold">{sampleResults.variantA.opened}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Replied:</span>
                <span className="font-semibold">{sampleResults.variantA.replied}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-700 font-semibold">Response Rate:</span>
                <span className="font-bold text-blue-600">{sampleResults.variantA.responseRate}%</span>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg border-2 ${sampleResults.winner === 'B' ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'}`}>
            <div className="flex items-center justify-between mb-3">
              <Badge className="bg-green-600">Variant B</Badge>
              {sampleResults.winner === 'B' && <Award className="w-5 h-5 text-green-600" />}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Sent:</span>
                <span className="font-semibold">{sampleResults.variantB.sent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Opened:</span>
                <span className="font-semibold">{sampleResults.variantB.opened}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Replied:</span>
                <span className="font-semibold">{sampleResults.variantB.replied}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-700 font-semibold">Response Rate:</span>
                <span className="font-bold text-green-600">{sampleResults.variantB.responseRate}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-100 border border-green-300 rounded-lg p-4">
          <p className="text-sm text-gray-900">
            <span className="font-bold text-green-700">Winner: Variant {sampleResults.winner}</span>
            {' '}• Variant {sampleResults.winner} outperformed by {Math.abs(sampleResults.variantB.responseRate - sampleResults.variantA.responseRate)}%
          </p>
        </div>
      </Card>
    </div>
  );
}