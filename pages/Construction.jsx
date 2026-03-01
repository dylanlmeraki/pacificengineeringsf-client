
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { HardHat, Truck, Wrench, Users, ArrowRight, CheckCircle, Building2, Layers, PenTool, Ruler, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ScrollFadeSection from "../components/ScrollFadeSection";

export default function Construction() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 px-6 bg-gradient-to-br from-blue-900 to-cyan-800 overflow-hidden">
        <div className="absolute inset-0 opacity-70">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?w=1600')] bg-cover bg-center" />
        </div>
        <div className="bg-black/21 mx-auto opacity-100 rounded-[3rem] backdrop-blur-md max-w-5xl shadow-2xl border border-white/10">        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h1 className="text-white mb-6 pt-6 text-5xl font-bold md:text-6xl">
            Construction Services
          </h1>
          <p className="text-xl text-cyan-100 max-w-3xl mx-auto leading-relaxed mb-6">
            We are fully licensed and ready to take on any and all work including residential additions, multi-unit residential, commercial mixed-use, public works, and large-scale infrastructure.
          </p>
        </div>
        </div>
      </section>

      {/* Introduction */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
              <div className="relative">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800"
                    alt="Construction site"
                    className="w-full h-full object-cover" />
                  
                </div>
              </div>

              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Foundationally Deep Expertise
                </h2>
                <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                  <p>
                    With over 40 years of combined experience in civil engineering and construction, our Professional Engineers don't just design systems — we build them. This integrated approach means practical solutions that translate seamlessly from plans to field execution, minimizing conflicts and keeping projects on schedule.
                  </p>
                  <p>
                    Our Class A and Class B licensed contractors, backed by PE-certified engineers, deliver full-scale construction services from site development and utility installation to structural work and building envelope systems. Whether serving as general contractor or specialized subcontractor, we bring the same precision, technical expertise, and commitment to quality that defines our engineering practice.
                  </p>
                  <p>
                    From residential additions to commercial mixed-use developments and public infrastructure projects throughout the Bay Area, we ensure on-time delivery, full compliance, and maximum project efficiency — handling the technical complexity so you can focus on your vision.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollFadeSection>

      {/* Project Types */}
      <ScrollFadeSection>
      </ScrollFadeSection>

      {/* Services Grid */}
      <ScrollFadeSection>
      
        <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                What We Build
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Our in-house team of Engineering and Construction experts are here to help you develop and implement all of your project ideas - keeping you on-time, within-budget, and in full compliance allowing for your maximum creative output.
              </p>
            </div>
            
            <div className="space-y-8">
              {/* Class A - General Engineering */}
              <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500" />
                <div className="p-8">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="bg-blue-100 rounded-2xl w-16 h-16 flex items-center justify-center mb-4">
                      <img
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/3ae5fcb9b_Clipboard_PNG.png"
                        alt="Structural Materials Icon"
                        className="w-10 h-10 object-contain" />
                      
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Class A (General Engineering) Contracting</h3>
                      <p className="text-gray-600">Public utililty and infrastructure construction services delivering engineered solutions for complex public and private projects.</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <h4 className="font-semibold text-gray-900 mb-2">Public Infrastructure</h4>
                      <p className="text-sm text-gray-600">Build roadways, highways, and transportation structures - coordinating traffic control planning with full local and state agency compliance.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <h4 className="font-semibold text-gray-900 mb-2">Grading & Excavation</h4>
                      <p className="text-sm text-gray-600">Precision large-scale grading and excavation, cut/fill balancing, and site preparation using in-house earthwork modeling.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <h4 className="font-semibold text-gray-900 mb-2">Public Utilities Installation</h4>
                      <p className="text-sm text-gray-600">Istallation of water, sanitary sewer, storm drain, and recycled water systems; providing full-scale implementation.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <h4 className="font-semibold text-gray-900 mb-2">Stormwater Drainage Systems</h4>
                      <p className="text-sm text-gray-600">Design and construct catch basins, bioswales, and flood-control improvements, ensuring compliance and long-term performance.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <h4 className="font-semibold text-gray-900 mb-2">Specialized Structural Engineering</h4>
                      <p className="text-sm text-gray-600">Pump stations, treatment facilities, retaining structures, and other specialized infrastructure engineering combined with QA/QC.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <h4 className="font-semibold text-gray-900 mb-2">Project Delivery</h4>
                      <p className="text-sm text-gray-600">Manage permitting, submittals, inspections, and coordination with regulatory bodies - executing deliverables within budget and timeline.</p>
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* Class B - General Building */}
                <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500" />
                <div className="p-8">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="bg-blue-100 rounded-2xl w-16 h-16 flex items-center justify-center mb-4">
                      <img
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/3ae5fcb9b_Clipboard_PNG.png"
                        alt="Structural Materials Icon"
                        className="w-10 h-10 object-contain" />
                      
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Class B (General Building) Contracting</h3>
                      <p className="text-gray-600">Comprehensive construction and renovation services integrating our network of highly skilled tradespeople to deliver you the best.</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <h4 className="font-semibold text-gray-900 mb-2">New Building Construction</h4>
                      <p className="text-sm text-gray-600">Ground-up building from foundations through to finishes, managing all major building systems and subcontractor coordination.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <h4 className="font-semibold text-gray-900 mb-2">Structural Work & Building Envelope</h4>
                      <p className="text-sm text-gray-600">Installation of framing, shear walls, roofing, windows, and waterproofing to create a durable and compliant envelope.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <h4 className="font-semibold text-gray-900 mb-2">Interior Buildout & Renovation</h4>
                      <p className="text-sm text-gray-600">Mixed-use commercial and residential interior renovations from coordinated MEP updates and sequencing to projecgt completion.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <h4 className="font-semibold text-gray-900 mb-2">Residential Remodels & Additions</h4>
                      <p className="text-sm text-gray-600">Full-home remodels including kitchen, bath, and additions; preserving and upgrading structures at any scale.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <h4 className="font-semibold text-gray-900 mb-2">Trad Integration & Management</h4>
                      <p className="text-sm text-gray-600">Coordinate our MEP and safety tradespeople to ensure proper sequencing, compliance, and inspection readiness.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <h4 className="font-semibold text-gray-900 mb-2">Permitting Coordination & Managementn</h4>
                      <p className="text-sm text-gray-600">We manage permitting, plan reviews, inspections, and project timeline efficiency - meeting all client specifications.</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Specialty Contracting */}
                <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500" />
                <div className="p-8">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="bg-blue-100 rounded-2xl w-16 h-16 flex items-center justify-center mb-4">
                      <img
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/3ae5fcb9b_Clipboard_PNG.png"
                        alt="Structural Materials Icon"
                        className="w-10 h-10 object-contain" />
                      
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Specialty Contracting & Consulting</h3>
                      <p className="text-gray-600">Broad-reaching trade expertise culminating in precision workmanship, practical solutions, and reliable specialized construction guidance.</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <h4 className="font-semibold text-gray-900 mb-2">Specialized Trade Execution</h4>
                      <p className="text-sm text-gray-600">Our skilled network of electrical, plumbing, HVAC, and machinist specialty contractors understand the nuances of true quality workmanship.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <h4 className="font-semibold text-gray-900 mb-2">Technical Field Assessment & Consulting</h4>
                      <p className="text-sm text-gray-600">Our teams evaluate systemic issues or failures onsite - providing experience-backed recommendations for repairs or improvements.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <h4 className="font-semibold text-gray-900 mb-2">On-Call Installation & Updating</h4>
                      <p className="text-sm text-gray-600">Install and retrofit mechanical equipment, fire protection systems, low-voltage networks, and more with an emphasis on production speed and precision, durability, and clean craftsmanship.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <h4 className="font-semibold text-gray-900 mb-2">Code, Permitting, & Compliance Support</h4>
                      <p className="text-sm text-gray-600">On-call trade-specific code compliance consulting, documentation prep, and swift, efficient movement through inspections and approvals.</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Vertically Integrated */}
              <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="h-2 bg-gradient-to-r from-cyan-500 to-teal-500" />
                <div className="p-8">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="bg-cyan-100 rounded-2xl w-16 h-16 flex items-center justify-center mb-4">
                      <Layers className="w-8 h-8 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Vertically Integrated Engineering & Construction Consulting</h3>
                      <p className="text-gray-600">Ground and virtual support by our highly-skilled in-house teams of Licensed and Certified engineering and construction professionals.</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <h4 className="font-semibold text-gray-900 mb-2">Vertically Scalable Project Support</h4>
                      <p className="text-sm text-gray-600">We have you covered during all phases and potential changes - providing full-service preventative measures against project delays.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <h4 className="font-semibold text-gray-900 mb-2">Integrated Engineering & Technical Design</h4>
                      <p className="text-sm text-gray-600">We delivery coordinated civil and structural engineering under one roof, minimizing redesign, reducing conflicts, and ensuring seamlessly scalable integrated solutions.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <h4 className="font-semibold text-gray-900 mb-2">Expert Construction Management & Planning</h4>
                      <p className="text-sm text-gray-600">Our many years of in-field expertise and networking will streamline your project logistics, phasing, value engineering, and permitting so you get full clarity at every step.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <h4 className="font-semibold text-gray-900 mb-2">Lifecycle Oversight & Owner Representation</h4>
                      <p className="text-sm text-gray-600">Nuanced guidance on bidding, contractor selection, inspections, RFIs, project updates, and close-outs, acting as your technical advocate from start to finish.</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
           </div>
        </section>
      </ScrollFadeSection>

      {/* Case Studies Section */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-gray-900 mb-4 text-4xl font-bold text-center">Projects Brought to Life</h3>
            <div className="p-8 grid md:grid-cols-3 gap-6">
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-0 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 text-center mb-3">Residential Development</h3>
                <p className="text-gray-700 leading-relaxed text-center">
                  Single-family subdivisions, multi-family housing, custom homes, and residential site work
                </p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-cyan-50 to-teal-50 border-0 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 text-center mb-3">Commercial Projects</h3>
                <p className="text-gray-700 leading-relaxed text-center">
                  Retail centers, office buildings, industrial facilities, and mixed-use developments
                </p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-teal-50 to-green-50 border-0 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 text-center mb-3">Public Infrastructure</h3>
                <p className="text-gray-700 leading-relaxed text-center">
                  Transportation improvements, utility upgrades, municipal facilities, and public works projects
                </p>
              </Card>
            </div>

            <div className="space-y-12">
              {/* Case Study 1 */}
              <Card className="overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="relative h-80 lg:h-auto overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800"
                      alt="Mixed-use development site"
                      className="w-full h-full object-cover" />
                    
                    <div className="absolute top-4 left-4">
                      <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
                        Mixed-Use Development
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8 lg:p-12">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      Downtown Oakland Mixed-Use Complex
                    </h3>
                    
                    <div className="mb-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="bg-red-100 p-2 rounded-lg">
                          <Target className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">Challenge</h4>
                          <p className="text-gray-700">
                            Tight urban site with active adjacent businesses, limited staging area, and strict noise restrictions. Underground utilities required coordination with city services during active business hours.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 mb-4">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">Solution</h4>
                          <p className="text-gray-700">
                            Implemented phased construction with off-site equipment staging. Coordinated night work for noisy operations with advance notification. Our engineers designed temporary shoring that minimized excavation footprint by 30%.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">Outcome</h4>
                          <p className="text-gray-700">
                            Completed 3 weeks ahead of schedule with zero neighbor complaints. Received city commendation for coordination during utility work. Project value: $8.2M, delivered on budget.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">65,000</div>
                        <div className="text-sm text-gray-600">sq ft developed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">8 months</div>
                        <div className="text-sm text-gray-600">completion time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">100%</div>
                        <div className="text-sm text-gray-600">on budget</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Case Study 2 */}
              <Card className="overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="relative h-80 lg:h-auto overflow-hidden lg:order-2">
                    <img
                      src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800"
                      alt="Hillside foundation construction"
                      className="w-full h-full object-cover" />
                    
                    <div className="absolute top-4 left-4">
                      <div className="bg-cyan-600 text-white px-4 py-2 rounded-lg font-semibold">
                        Hillside Foundation
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8 lg:p-12 lg:order-1">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      Tiburon Hillside Residential Project
                    </h3>
                    
                    <div className="mb-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="bg-red-100 p-2 rounded-lg">
                          <Target className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">Challenge</h4>
                          <p className="text-gray-700">
                            Steep hillside site with 40% grade, expansive clay soils, and limited access for equipment. Bedrock at varying depths required flexible foundation design.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 mb-4">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">Solution</h4>
                          <p className="text-gray-700">
                            Our PE team designed hybrid foundation system combining drilled piers and grade beams. Used compact equipment for excavation and placed concrete with line pump from street level. Implemented real-time soils testing to adjust pier depths.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">Outcome</h4>
                          <p className="text-gray-700">
                            Foundation passed all inspections on first submittal. Engineering adaptations saved client $45K in pier costs. Structure has performed flawlessly through three rainy seasons with zero settlement.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-cyan-600">42 piers</div>
                        <div className="text-sm text-gray-600">installed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-cyan-600">$45K</div>
                        <div className="text-sm text-gray-600">cost savings</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-cyan-600">6 weeks</div>
                        <div className="text-sm text-gray-600">foundation time</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Case Study 3 */}
              <Card className="overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="relative h-80 lg:h-auto overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?w=800"
                      alt="Infrastructure utility installation"
                      className="w-full h-full object-cover" />
                    
                    <div className="absolute top-4 left-4">
                      <div className="bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold">
                        Public Infrastructure
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8 lg:p-12">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      San Rafael Storm Drain Upgrade
                    </h3>
                    
                    <div className="mb-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="bg-red-100 p-2 rounded-lg">
                          <Target className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">Challenge</h4>
                          <p className="text-gray-700">
                            Replace 1,200 linear feet of deteriorating 48" storm drain under active roadway during rainy season. High groundwater and conflicting utilities complicated excavation. Traffic flow had to be maintained.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 mb-4">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">Solution</h4>
                          <p className="text-gray-700">
                            Engineered trench shoring system allowing safe excavation adjacent to existing utilities. Implemented bypass pumping for groundwater control. Coordinated night work for pipe installation to minimize traffic impact. Pre-fabricated pipe sections for rapid installation.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">Outcome</h4>
                          <p className="text-gray-700">
                            Completed project 2 weeks early despite challenging conditions. Zero utility strikes or service interruptions. System functioned perfectly during record rainfall the following winter. City extended contract for additional phases.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-teal-600">1,200</div>
                        <div className="text-sm text-gray-600">linear feet</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-teal-600">48"</div>
                        <div className="text-sm text-gray-600">pipe diameter</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-teal-600">Zero</div>
                        <div className="text-sm text-gray-600">utility strikes</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </ScrollFadeSection>

            <ScrollFadeSection>
        <section className="py-20 px-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
              What Makes Us Different
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <HardHat className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Engineering Background</h3>
                <p className="text-gray-700 leading-relaxed">
                  Our crews are backed by professional engineers who understand the technical requirements behind the work
                </p>
              </div>

              <div className="text-center">
                <div className="bg-cyan-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Own Equipment & Crews</h3>
                <p className="text-gray-700 leading-relaxed">
                  We maintain our own equipment fleet and employ experienced crews — no last-minute scrambling for resources
                </p>
              </div>

              <div className="text-center">
                <div className="bg-teal-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">On-Time Performance</h3>
                <p className="text-gray-700 leading-relaxed">
                  We plan our work, show up when we say we will, and keep your project moving forward without unnecessary delays
                </p>
              </div>
            </div>
          </div>
        </section>
      </ScrollFadeSection>

      {/* CTA */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-cyan-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Let's Get Building
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Whether you're a Class A contractor with a neverending workload or a homeowner just trying to maximize your property value — we can help. Let's discuss how we can maximize your schedule and minimize your budget spend.
            </p>
            
            <Link to={createPageUrl("Consultation")}>
              <Button size="lg" className="bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-500 text-white px-8 py-6 text-lg font-medium rounded-xl inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow h-10 border-2 border-white hover:bg-white/10 backdrop-blur-sm group">
                Free Construction Consultation
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>
      </ScrollFadeSection>
    </div>);

}