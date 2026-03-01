import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { FileText, Shield, ArrowRight, Check, Droplets, ClipboardCheck, Users, Zap, CheckCircle, Info, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ScrollFadeSection from "../components/ScrollFadeSection";

export default function Services() {
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 px-6 bg-gradient-to-br from-blue-900 to-cyan-800 overflow-hidden">
        <div className="absolute inset-0 opacity-70">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1600')] bg-cover bg-center" />
        </div>
        <div className="bg-black/17 mx-auto opacity-100 rounded-[3rem] backdrop-blur-md max-w-5xl shadow-2xl border border-white/10">
          <div className="mx-auto text-center relative z-10 max-w-5xl">
            <p className="text-white mb-6 pt-6 text-5xl font-bold md:text-6xl">Stormwater Pollution Planning Services</p>
            <p className="text-cyan-100 mx-auto pb-8 text-xl font-medium text-center leading-relaxed max-w-3xl">We help keep your projects on track, on time, and compliant - providing Stormwater Plans from inception to completion. All work is performed by our in-house Professional Engineers (PEs), Qualified SWPPP Developers (QSDs), and Qualified SWPPP Practitioners (QSPs),</p>
          </div>
        </div>
      </section>

      {/* Service Overview Cards */}
      <ScrollFadeSection>
        <section className="py-16 px-6 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Droplets className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">100%</h3>
                <p className="text-gray-600">Compliance Rate</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <ClipboardCheck className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">500+</h3>
                <p className="text-gray-600">Projects Completed</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">24/7</h3>
                <p className="text-gray-600">Support Available</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Fast</h3>
                <p className="text-gray-600">Turnaround Time</p>
              </div>
            </div>
          </div>
        </section>
      </ScrollFadeSection>

      {/* Services Detail */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto space-y-20">
            {/* Service 1: QSD Services */}
            <Card className="border-0 shadow-2xl overflow-hidden bg-white">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="relative order-2 lg:order-1 h-96 lg:h-auto">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/10" />
                  <img 
                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800"
                    alt="San Francisco commercial construction planning" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                
                <div className="order-1 lg:order-2 p-8 lg:p-12">
                <div className="max-w-4xl mx-auto text-center">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-3 rounded-full mb-6 border border-blue-200">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-700 font-semibold">Design • Compliance</span>
                  </div>
                  </div>
                  
                  <h2 className="text-gray-900 mb-6 text-3xl lg:text-4xl font-bold text-center">
                    Qualified SWPPP Developer (QSD) Services
                  </h2>
                  
                  <p className="text-gray-700 mb-8 text-lg text-center">
                    Clear actionable Stormwater Plan development - tailored for your unique jobsite(s). Our QSDs come equipped with in-depth compliance and construction experience to delivering SWPPPs with consistent professional integrity with your goals in mind of anticipating issues and minimizing project sequencing delays.
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
                      <h3 className="text-xl font-bold text-gray-900">What We Do</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 bg-gradient-to-r from-blue-50 to-transparent p-4 rounded-xl border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">Permit Coverage</div>
                          <p className="text-gray-600 text-sm">Verify CGP/NPDES applicability, complete NOI/permit filings, and define compliance responsibilities up front.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 bg-gradient-to-r from-blue-50 to-transparent p-4 rounded-xl border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">Site Assessment & Clear SWPPP Documentation</div>
                          <p className="text-gray-600 text-sm">Evaluate grading, soils, and drainage inlet/outlet flows to develop effective Water Pollution Control Plans and site Mapping.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 bg-gradient-to-r from-blue-50 to-transparent p-4 rounded-xl border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">Integrate Effective BMPs with Project Phasing</div>
                          <p className="text-gray-600 text-sm">Ensure erosion, sediment, and source control BMPs meet permit criteria and flow efficiently with your project phasing.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 bg-gradient-to-r from-blue-50 to-transparent p-4 rounded-xl border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">Provide Training and Ongoing Support</div>
                          <p className="text-gray-600 text-sm">Provide initial and as-needed site-specific procedure briefings for dewatering, concrete washout, fueling, and other non-stormwater spill response - minimizing non-compliance risk.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 bg-gradient-to-r from-blue-50 to-transparent p-4 rounded-xl border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">Certify and Deliver SWPPP(s)</div>
                          <p className="text-gray-600 text-sm">Deliver signed, stamped, and certified plans by our Professional Engineers and QSDs that satisfy all local, state, and federal requirements.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 bg-gradient-to-r from-blue-50 to-transparent p-4 rounded-xl border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">Ongoing Plan Management</div>
                          <p className="text-gray-600 text-sm">Continue ongoing communication with QSPs and site management for any ammendments to the SWPPP as site logistics and/OR sequencing change.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="max-w-4xl mx-auto text-center">
                  <Link to={createPageUrl("Consultation")}>
                    <Button size="lg" className="w-full lg:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 group">
                      Start Your SWPPP
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  </div>
                </div>
              </div>
            </Card>

            {/* Service 2: QSP Services */}
            <div className="max-w-7xl mx-auto space-y-20">
            <Card className="border-0 shadow-2xl overflow-hidden bg-white">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="p-8 lg:p-12">
                <div className="max-w-4xl mx-auto text-center">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-50 to-teal-50 px-6 py-3 rounded-full mb-6 border border-cyan-200">
                    <Shield className="w-5 h-5 text-cyan-600" />
                    <span className="text-cyan-700 font-semibold">Implementation • Field Compliance</span>
                  </div>
                </div>  
                  <h2 className="text-gray-900 mb-6 text-3xl lg:text-4xl font-bold text-center">
                    Qualified SWPPP Practitioner (QSP) Services
                  </h2>
                  
                  <p className="text-gray-700 mb-8 text-lg text-center">
                    Our QSPs ensure that BMP's and water pollution controls are installed and maintained. With hands-on experience and regulatory knowledge, we keep you in compliance and minimize any adverse sequencing impacts.
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-1 w-12 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full" />
                      <h3 className="text-xl font-bold text-gray-900">What We Do</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 bg-gradient-to-r from-cyan-50 to-transparent p-4 rounded-xl border-l-4 border-cyan-500 hover:shadow-md transition-shadow">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">Implement SWPPP from QSDs</div>
                          <p className="text-gray-600 text-sm">Verify initial and ongoing BMP efficiency through scheduled weekly, pre-storm, during-storm, and post-storm inspections with photo documentation and action items as needed.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 bg-gradient-to-r from-cyan-50 to-transparent p-4 rounded-xl border-l-4 border-cyan-500 hover:shadow-md transition-shadow">    
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">As Needed Monitoring and Sampling</div>
                          <p className="text-gray-600 text-sm">Update site maps, BMP inventories, and narratives to reflect grading, drainage, or sequencing changes.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 bg-gradient-to-r from-cyan-50 to-transparent p-4 rounded-xl border-l-4 border-cyan-500 hover:shadow-md transition-shadow">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">BMP Maintenance and Repairs</div>
                          <p className="text-gray-600 text-sm">Assist in BMP maintenance and repairs in coordination with onsite crews to spot and correct potential issues early and to reduce any potential project timeline delays.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 bg-gradient-to-r from-cyan-50 to-transparent p-4 rounded-xl border-l-4 border-cyan-500 hover:shadow-md transition-shadow">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">Keep SWPPPs Current and Organized</div>
                          <p className="text-gray-600 text-sm">Maintain and update mapping, inspection records, and ongoing BMP changes in order to minimize any timeline delays - keeping work on track.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 bg-gradient-to-r from-cyan-50 to-transparent p-4 rounded-xl border-l-4 border-cyan-500 hover:shadow-md transition-shadow">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">Toolbox Talks and Crew Training</div>
                          <p className="text-gray-600 text-sm">Deliver actionable onsite training that equips crews to meet stormwater responsibilities and prevent delays deficiencies, by adhering to action items.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 bg-gradient-to-r from-cyan-50 to-transparent p-4 rounded-xl border-l-4 border-cyan-500 hover:shadow-md transition-shadow">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">Support Final Stabilization and Closeout</div>
                          <p className="text-gray-600 text-sm">Verify permanent stabilization, oversee temporary BMP removal, and prepare documentation for Notice of Termination (NOT).</p>
                        </div>
                      </div>
                    </div>
                  </div>
                 <div className="max-w-4xl mx-auto text-center"> 
                  <Link to={createPageUrl("Consultation")}>
                    <Button size="lg" className="w-full lg:w-auto bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-8 group">
                      Get Your SWPPP
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  </div>
                </div>
                
                <div className="relative h-96 lg:h-auto">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 to-teal-600/10" />
                  <img
                    src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800"
                    alt="Bay Area construction site implementation"
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>
            </Card>
          </div>
           <Card className="p-8 mb-8 bg-blue-50 border-blue-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                      <Info className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">About SWPPP Requirements</h3>
                    {isInfoExpanded &&
                    <p className="text-gray-700 leading-relaxed mt-4">
                        A Stormwater Pollution Prevention Plan (SWPPP) is typically required for construction projects that disturb one acre or more of land, or are part of a larger common plan of development that disturbs one acre or more. Requirements may vary by location and project type. Please fill out form below fully, so that our licensed and certified professionals can best assist you.
                      </p>
                    }
                  </div>
                </div>
                <button
                  onClick={() => setIsInfoExpanded(!isInfoExpanded)}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                  
                  {isInfoExpanded ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </button>
              </div>
            </Card>

            {/* General Information */}
            <div className="mt-12 space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">When is a SWPPP Required?</h3>
                <div className="space-y-3 text-gray-700 leading-relaxed">
                  <p>
                    <strong>Federal Requirements:</strong> Under the Clean Water Act's National Pollutant Discharge Elimination System (NPDES) program, a SWPPP is required for construction activities that disturb one acre or more of land surface, or are part of a larger common plan of development.
                  </p>
                  <p>
                    <strong>California Requirements:</strong> The California State Water Resources Control Board requires coverage under the Construction General Permit for qualifying projects throughout the state, including the San Francisco Bay Area.
                  </p>
                  <p>
                    <strong>Local Requirements:</strong> Many California municipalities have additional local stormwater requirements that may apply to smaller projects or have specific provisions. It is pertinent that you are in touch with locally trained and qualified professionals to work with you through nuanced local regulations.
                  </p>
                </div>
              </Card>
              </div>
              </div>
        </section>
      </ScrollFadeSection>

      {/* Why Choose Us Section */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Pacific Engineering</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We deliver more than compliance — we deliver confidence and peace of mind
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <ClipboardCheck className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">PE-Certified Team</h3>
                <p className="text-gray-600 leading-relaxed">
                  All work performed and certified by our in-house Professional Engineers and QSD/QSP team with well-rounded Bay Area compliance expertise.
                </p>
              </Card>

              <Card className="p-8 border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Turnaround</h3>
                <p className="text-gray-600 leading-relaxed">
                  Quick response times and efficient processes keep your projects moving forward without delays
                </p>
              </Card>

              <Card className="p-8 border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Compliance Expertise</h3>
                <p className="text-gray-600 leading-relaxed">
                  Deep knowledge of SF Bay Area as well as State and Federal regulatory compliance requirements
                </p>
              </Card>
            </div>
          </div>
        </section>
      </ScrollFadeSection>

      {/* CTA Section */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-cyan-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Need Stormwater Planning?
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Every project is unique. Let's discuss your specific requirements and determine if a SWPPP is needed for your site.
            </p>
            
            <Link to={createPageUrl("SWPPPChecker")}>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-10 py-7 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all group">
                Begin Free Consultation
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>
      </ScrollFadeSection>
    </div>
  );
}