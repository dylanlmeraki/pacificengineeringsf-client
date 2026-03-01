import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Beaker, CheckCircle, Droplets, FlaskConical, ArrowRight, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ScrollFadeSection from "../components/ScrollFadeSection";

export default function InspectionsTesting() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 px-6 bg-gradient-to-br from-blue-900 to-cyan-800 overflow-hidden">
        <div className="absolute inset-0 opacity-70">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1600')] bg-cover bg-center" />
        </div>
        <div className="bg-black/21 mx-auto opacity-100 rounded-[3rem] backdrop-blur-md max-w-5xl shadow-2xl border border-white/10">        
          <div className="relative z-10 max-w-5xl mx-auto text-center">
            <h1 className="text-white mb-6 pt-6 text-5xl font-bold md:text-6xl">
              Testing & Inspection Services
            </h1>
            <p className="text-xl text-cyan-100 max-w-3xl mx-auto text-center mb-10">
              Comprehensive field and lab testing verifying compliance at every necessary step to keep your project moving forward efficiently.
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-gradient-to-br from-blue-100 via-cyan-50 to-green-50">
          <div className="max-w-6xl mx-auto">            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6 bg-white border-0 shadow-2xl">
                <h3 className="text-xl font-bold text-gray-900 text-center mb-3">Fast Turnaround</h3>
                <p className="text-gray-700 text-center leading-relaxed">
                  We prioritize quick lab processing and same-day field results when possible. We aim to minimize and ideally negate any downtime caused by testing and sampling delays.
                </p>
              </Card>

              <Card className="p-6 bg-white border-0 shadow-2xl">
                <h3 className="text-xl font-bold text-gray-900 text-center mb-3">Certified & Accredited</h3>
                <p className="text-gray-700 text-center leading-relaxed">
                  Our technicians hold current certifications from ACI, ICC, and other recognized bodies. Our partner labs are NELAC and EPA-certified.
                </p>
              </Card>

              <Card className="p-6 bg-white border-0 shadow-2xl">
                <h3 className="text-xl font-bold text-gray-900 text-center mb-3">Clear Reporting</h3>
                <p className="text-gray-700 text-center leading-relaxed">
                  You get streamlined reports that inspectors and engineers actuate on quickly — no waiting around, just the organized data keeping your projects' timelines at our front of mind.
                </p>
              </Card>
            </div>
          </div>
        </section>
      </ScrollFadeSection>

      {/* Services Grid */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Testing Services
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Testing Services 

We provide comprehensive and extensive testing keeping all facets of your project compliant and on track including stormwater, concrete, structural materials, foundational integrity, full environmental pollution panels and much more.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-0 bg-white">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500" />
                <div className="p-8 flex flex-col items-center">
                  <div className="bg-blue-100 mx-auto my-6 rounded-2xl w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Droplets className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-gray-900 mx-auto my-4 text-2xl font-bold text-center">Stormwater Testing & Inspections</h3>
                  <p className="text-gray-600 mb-6 text-center leading-relaxed">
                    NPDES permit compliance testing, pH monitoring, turbidity analysis, and pollutant screening ensuring you're meeting standards.
                  </p>
                  <ul className="space-y-3 w-full flex flex-col items-center">
                    <li className="flex items-start gap-3 text-gray-700 max-w-md">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Pre-storm, During, and post-storm sampling</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-700 max-w-md">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Visual observations monitored during, pre, and post QPE. </span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-700 max-w-md">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>NAL exceedance response planning</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-700 max-w-md">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Comprehensive lab analysis coordination</span>
                    </li>
                  </ul>
                </div>
              </Card>

              <Card className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-0 bg-white">
                <div className="h-2 bg-gradient-to-r from-cyan-500 to-teal-500" />
                <div className="p-8 flex flex-col items-center">
                  <div className="bg-cyan-100 mx-auto my-6 rounded-2xl w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FlaskConical className="w-8 h-8 text-cyan-600" />
                  </div>
                  <h3 className="text-gray-900 mx-auto my-4 text-2xl font-bold text-center">Materials Sampling & Testing</h3>
                  <p className="text-gray-600 mb-6 text-center leading-relaxed">
                    Comprehensive  field and laboratory testing to ensure compliance with local, state, and federal requirements and engineering specific ations.
                  </p>
                  <ul className="space-y-3 w-full flex flex-col items-center">
                    <li className="flex items-start gap-3 text-gray-700 max-w-md">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Concrete field strength testing</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-700 max-w-md">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Hazardous Materials Sampling and Testing</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-700 max-w-md">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-center">Reinforced steel, bolts, tiedowns, wood-framed structure, and anchorage system testing</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-700 max-w-md">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Welding and structural connectionstrength testing</span>
                    </li>
                  </ul>
                </div>
              </Card>

              <Card className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-0 bg-white">
                <div className="h-2 bg-gradient-to-r from-teal-500 to-green-500" />
                <div className="p-8 flex flex-col items-center">
                  <div className="bg-teal-100 mx-auto my-6 rounded-2xl w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Beaker className="w-8 h-8 text-teal-600" />
                  </div>
                  <h3 className="text-gray-900 mx-auto my-4 text-2xl font-bold text-center">Structural Systems Inspections</h3>
                  <p className="text-gray-600 mb-6 text-center leading-relaxed">
                    Field and laboratory testing of concrete, asphalt, aggregates, and other construction materials to ensure quality and code compliance
                  </p>
                  <ul className="space-y-3 w-full flex flex-col items-center">
                    <li className="flex items-start gap-3 text-gray-700 max-w-md">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Concrete cylinder testing (compression)</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-700 max-w-md">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Slump, air content, and temperature resistance checks</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-700 max-w-md">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Asphalt core sampling and density testing</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-700 max-w-md">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Aggregate gradation and quality validation</span>
                    </li>
                  </ul>
                </div>
              </Card>

              <Card className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-0 bg-white">
                <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500" />
                <div className="p-8 flex flex-col items-center">
                  <div className="bg-green-100 mx-auto my-6 rounded-2xl w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-gray-900 mx-auto my-4 text-2xl font-bold text-center">Environmental Compliance</h3>
                  <p className="text-gray-600 mb-6 text-center leading-relaxed">
                    Specialized testing to support environmental permits, remediation projects, and hazardous material management
                  </p>
                  <ul className="space-y-3 w-full flex flex-col items-center">
                    <li className="flex items-start gap-3 text-gray-700 max-w-md">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Phase 1 and Phas 2 Groundwater and well monitoring</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-700 max-w-md">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Hazardous material screening</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-700 max-w-md">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Soil contamination assessments</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-700 max-w-md">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Air and water quality testing</span>
                    </li>
                  </ul>
                </div>
              </Card>
            </div>
            
            <div className="flex justify-center mt-12">
              <Link to={createPageUrl("Contact")}>
                <Button size="lg" className="bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-500 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl border-2 border-white hover:bg-blue-700 transition-all group">
                  Get Testing Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </ScrollFadeSection>

      {/* Testing That Matters */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"> 
                Testing That Matters
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Managing necessary, mitigating, and anticipatory testing and sampling scheduling and compliance can be a headache especially when you've already got enough people to manage and a company to grow. However, proper testing ensures compliance and avoidance of costly mistakes down the line.
              </p>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mt-4">
              Whether you're monitoring stormwater plans, verifying ongoing structural integrity, or checking the many other environmental and engineering conditions - we streamline the process. Our team handles everything from sample collection to lab coordination, so you can retain integrity while staying outcome-focused.
              </p>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mt-4">
              Our teams are well versed in what to look for and how to keep your project on schedule and compliant with foresight backed by decades of extensive experience.
              </p>
            </div>
          </div>
        </section>
      </ScrollFadeSection>

      {/* CTA */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-cyan-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Stay On Time & In Compliance
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              We have you covered - from stormwater compliance, engineered structural materials verification, or environmental analysis and assessments.
            </p>
            <Link to={createPageUrl("Consultation")}>
              <Button size="lg" className="bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-500 text-white px-8 py-6 text-lg font-medium rounded-xl shadow-xl hover:shadow-2xl border-2 border-white hover:bg-white/10 backdrop-blur-sm transition-all group">
                Begin Inspections Consultation
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>
      </ScrollFadeSection>
    </div>);

}