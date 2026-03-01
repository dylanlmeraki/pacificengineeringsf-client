import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Building2, Ruler, PenTool, Layers, ArrowRight, CheckCircle, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ScrollFadeSection from "../components/ScrollFadeSection";

export default function StructuralEngineering() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 px-6 bg-gradient-to-br from-blue-900 to-cyan-800 overflow-hidden">
        <div className="absolute inset-0 opacity-70">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1600')] bg-cover bg-center" />
        </div>
                <div className="bg-black/21 mx-auto opacity-100 rounded-[3rem] backdrop-blur-md max-w-5xl shadow-2xl border border-white/10">        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h1 className="text-white mb-2 pt-6 text-5xl font-bold md:text-6xl">Engineering Consulting
            </h1>
          <p className="text-cyan-100 mx-auto pb-6 text-xl leading-relaxed max-w-3xl">Professional engineering expertise across civil and structural disciplines, providing innovative solutions and implementation to meet the unique needs of your project - from large-scale infrastructure to single family residential additions.
            </p>
        </div>
        </div>
      </section>

      {/* Introduction */}
      <ScrollFadeSection>
      <div className="border-0 hover:shadow-2xl">
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Client-Centric Engineering Consulting & Development
                </h2>
                <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                  <p>Through decades of deep, broad-reaching expertise, we've curated invaluable team members who are rooted in disciplined analysis and precision technical application, the most effective and practical solutions engineered to specification. Structural and Civii Engineering designs that satisfy all internal specifications and external regulations - keeping you on budget, on time, and with absolutely minimized stress.</p>
                  <p>Our in-house team of Professional Engineers (PEs) bring several decades of technical field experience in mixed-use commercial, municipal infrastructure and utilities, and even private residential projects of all scopes. We provide detailed design and development consultations tailored to your unique needs.</p>
                  <p>Our teams of in-house engineers, architects, contractors, specialized tradespeople, project managers, and more integrate seamlessly, bringing rigorous QA/QC and documentation, and proactive deployment coordination—minimizing delays, redesigns, and close guidance through permitting, bidding, and project-phasing.

</p>
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?w=800"
                    alt="Structural engineering"
                    className="w-full h-full object-cover" />
                  
                </div>
              </div>
            </div>
          </div>
        </section>
        </div>
      </ScrollFadeSection>

      {/* Services Grid */}
      <ScrollFadeSection>
      <div className="border-0 hover:shadow-2xl transition-all duration-300">
        <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Our Engineering Services
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Pacific Engineering & Construction Inc. provides end-to-end engineering consulting services across public, private, and industrial sectors. Our team integrates design, analysis, field verification, and construction-phase support to deliver solutions that meet regulatory standards, reduce project risk, and accelerate execution.
              </p>
            </div>

            {/*<div className="grid md:grid-cols-2 gap-8">
              <Card className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-0 bg-white">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500" />
                <div className="p-8">
                  <div className="bg-blue-100 mx-auto my-6 rounded-2xl w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building2 className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-gray-900 mx-auto my-4 text-2xl font-bold text-center">New Building Design</h3>
                  <p className="text-gray-600 mb-6 text-center leading-relaxed">
                    Complete structural systems for residential, commercial, and industrial buildings — from foundations to roof framing
                  </p>
                  <ul className="space-y-3 w-full flex flex-col items-center">
                    <li className="flex items-start gap-2 text-gray-700 max-w-md">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Single-family and multi-family residential</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700 max-w-md">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Commercial and retail structures</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700 max-w-md">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Industrial and warehouse facilities</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700 max-w-md">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Mixed-use developments</span>
                    </li>
                  </ul>
                </div>
              </Card>

              <Card className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-0 bg-white">
                <div className="h-2 bg-gradient-to-r from-cyan-500 to-teal-500" />
                <div className="p-8">
                  <div className="bg-cyan-100 mx-auto my-6 rounded-2xl w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Layers className="w-8 h-8 text-cyan-600" />
                  </div>
                  <h3 className="text-gray-900 mx-auto my-4 text-2xl font-bold text-center">Seismic Retrofits & Upgrades</h3>
                  <p className="text-gray-600 mb-6 text-center leading-relaxed">
                    Seismic strengthening and structural upgrades for existing buildings to meet current California seismic standards
                  </p>
                  <ul className="space-y-3 w-full flex flex-col items-center">
                    <li className="flex items-start gap-2 text-gray-700 max-w-md">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Soft-story retrofit design and analysis</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700 max-w-md">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Foundation bolting and cripple wall bracing</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700 max-w-md">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>URM (unreinforced masonry) strengthening</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700 max-w-md">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Code compliance upgrades</span>
                    </li>
                  </ul>
                </div>
              </Card>

              <Card className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-0 bg-white">
                <div className="h-2 bg-gradient-to-r from-teal-500 to-green-500" />
                <div className="p-8">
                  <div className="bg-teal-100 mx-auto my-6 rounded-2xl w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <PenTool className="w-8 h-8 text-teal-600" />
                  </div>
                  <h3 className="text-gray-900 mx-auto my-4 text-2xl font-bold text-center">Foundation Engineering</h3>
                  <p className="text-gray-600 mb-6 text-center leading-relaxed">
                    Foundation design and analysis for challenging soil conditions, expansive soils, and hillside construction
                  </p>
                  <ul className="space-y-3 w-full flex flex-col items-center">
                    <li className="flex items-start gap-2 text-gray-700 max-w-md">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Shallow and deep foundation systems</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700 max-w-md">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Drilled pier and caisson design</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700 max-w-md">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Retaining wall and earth retention systems</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700 max-w-md">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Foundation repair and underpinning</span>
                    </li>
                  </ul>
                </div>
              </Card>

              <Card className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-0 bg-white">
                <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500" />
                <div className="p-8">
                  <div className="bg-green-100 mx-auto my-6 rounded-2xl w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Ruler className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-gray-900 mx-auto my-4 text-2xl font-bold text-center">Structural Analysis & Evaluation</h3>
                  <p className="text-gray-600 mb-6 text-center leading-relaxed">
                    Engineering assessments, load evaluations, and structural investigations for existing buildings and structures
                  </p>
                  <ul className="space-y-3 w-full flex flex-col items-center">
                    <li className="flex items-start gap-2 text-gray-700 max-w-md">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Structural condition assessments</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700 max-w-md">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Load capacity evaluations</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700 max-w-md">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Damage investigation and repair design</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700 max-w-md">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Renovation and remodel engineering</span>
                    </li>
                  </ul>
                </div>
              </Card>
            </div> */}
          </div>
        </section> 
        </div>
      </ScrollFadeSection>

      {/* Structural & Civil Engineering Section */}
      <ScrollFadeSection>
        <div className="overflow-hidden hover:shadow-2xl">
        <section className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-20">
              {/* Structural Engineering Consulting */}
              <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-teal-500" />
                <div className="p-8">
                  <div className="flex items-center justify-center gap-4 mb-6 text-center">
                    <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl w-16 h-16 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-10 h-10 text-blue-500" />  
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-gray-900 text-center">Structural Engineering & Consulting</h3>
                      <p className="text-lg text-gray-600">Critical verification of structural integrity across all building materials.</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-bold text-gray-900 mb-2 text-center">Structural Design & Analysis</h4>
                      <p className="text-md text-gray-600 text-center">Develop feasible, code-compliant structural systems for new and existing residential and commercial structures.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-bold text-gray-900 mb-2 text-center">Inspections & Testing</h4>
                      <p className="text-md text-gray-600 text-center">Conduct field evaluations for existing structural systems: identifying any deficiencies, and providing corrective action recommendations and implementations as needed.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-bold text-gray-900 mb-2 text-center">Seismic Engineering</h4>
                      <p className="text-md text-gray-600 text-center">Seismic load-withstanding structural designs on new and existing structures.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-bold text-gray-900 mb-2 text-center">Structural Steel Systems</h4>
                      <p className="text-md text-gray-600 text-center">Design and verification of welds, bolts, and connection integrity per AISC.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-bold text-gray-900 mb-2 text-center">Forensic Structural Assessments</h4>
                      <p className="text-md text-gray-600 text-center">Inspection of deteriorated or failed systems - determining root cause in order to provide repair recommendations and upgrades.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-bold text-gray-900 mb-2 text-center">Wood-Framed Systems</h4>
                      <p className="text-md text-gray-600 text-center">Design and verification of wood-framed elements including shear walls, collectors and other load-transferring systems.</p>
                    </div>
                  </div>
                </div>
              </Card>

             {/* Civil Engineering Consulting */}
              <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl">
                <div className="h-2 bg-gradient-to-r from-teal-500 via-green-500 to-emerald-500" />
                <div className="p-8">
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="bg-gradient-to-br from-cyan-100 to-emerald-100 rounded-2xl w-16 h-16 flex items-center justify-center flex-shrink-0">
                    <Layers className="w-10 h-10 text-teal-500"/>                      
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-gray-900 text-center">Civil Engineering & Consulting</h3>
                      <p className="text-lg text-gray-600 text-center">Critical verification of structural integrity across all building materials.</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-bold text-gray-900 mb-2 text-center">Land Development</h4>
                      <p className="text-md text-gray-600 text-center">Grading, drainage, and utility layouts optimizing site usage; coordinating zoning and permitting requirements with applicable regulatory bodies.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-bold text-gray-900 mb-2 text-center">Stormwater Planning & Management</h4>
                      <p className="text-md text-gray-600 text-center">Design and development of stormwater drainage systems to catch, contain, and release stormwater - minimizing flooding impacts.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-bold text-gray-900 mb-2 text-center">Erosion Control & Environmental Compliance</h4>
                      <p className="text-md text-gray-600 text-center">Provide SWPPP development and implementation, BMP design, water pollution control plans and environmental mitigation strategies ensuring on-time completiona and compliance.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-bold text-gray-900 mb-2 text-center">Accessability & Feasibility Studie</h4>
                      <p className="text-md text-gray-600 text-center">Design and implementation of ADA accessible entries and pathways per regulatory guidelines as well as site analysis and data-driven research to determine project feasibility.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-bold text-gray-900 mb-2 text-center">Land Surveying</h4>
                      <p className="text-md text-gray-600 text-center">Boundary surveys, topographic surveys, subdivion mapping and planning, lot line adjustments, easements, construction staking, monument confirmation and preservation, city/county map review and verification.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-bold text-gray-900 mb-2 text-center">Construction Support & Project Management</h4>
                      <p className="text-md text-gray-600 text-center">Cost estimation, RFIs, submittals, field inspections, plan review, critical path and construction schedule monitoring..</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          <div className="max-w-7xl max-w mx-auto space-y-20 mt-10">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-0 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Steel Structures</h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  Structural steel framing, moment frames, braced frames, and metal building systems
                </p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-cyan-50 to-teal-50 border-0 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Concrete Design</h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  Reinforced and post-tensioned concrete, tilt-up construction, and cast-in-place systems
                </p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-teal-50 to-green-50 border-0 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Wood Framing</h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  Conventional and engineered wood framing, timber construction, and heavy timber design
                </p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Masonry</h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  Reinforced masonry walls, CMU construction, and brick veneer systems
                </p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-emerald-50 to-blue-50 border-0 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Cold-Formed Steel</h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  Light-gauge steel framing and panelized systems for commercial and residential use
                </p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-blue-50 to-teal-50 border-0 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Specialty Systems</h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  Engineering design coordinated with prefabricated and other modular structural components.
                </p>
              </Card>
            </div>
          </div>
        </section>
        </div>
      </ScrollFadeSection>.
     
      {/* Why Choose Us */}
      <ScrollFadeSection>
      
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Licensed in California</h3>
                <p className="text-gray-700 leading-relaxed">
                  Our Professional Engineers (PEs) are licensed by the California Board for Professional Engineers and carry full professional liability coverage
                </p>
              </div>

              <div className="text-center">
                <div className="bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <PenTool className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Designed for Efficiency</h3>
                <p className="text-gray-700 leading-relaxed">
                  We prioritize value engineering and feasibility - integrating this mindset vertically by maximizing efficiency and practicality.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Layers className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Complete Compliance Guidance</h3>
                <p className="text-gray-700 leading-relaxed">
                  Thorough technical understanding of local, state, federal regulatory compliance standards for end-to-end permitting.
                </p>
              </div>
            </div>
          </div>
        </section>
      </ScrollFadeSection>

      {/* Case Studies Section */}
      <ScrollFadeSection>
       {/*} <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Engineering Case Studies
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Complex engineering challenges solved through innovative design and practical field experience
              </p>
            </div>

            <div className="space-y-12"> */}
              {/* Case Study 1 */}
              {/* <Card className="overflow-hidden border-0 shadow-2xl hover:shadow-3xl">
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="relative h-80 lg:h-auto overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800"
                      alt="Seismic retrofit project"
                      className="w-full h-full object-cover" />
                    
                    <div className="absolute top-4 left-4">
                      <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">
                        Seismic Retrofit
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8 lg:p-12">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      Historic Building Soft-Story Retrofit
                    </h3>
                    
                    <div className="mb-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="bg-red-100 p-2 rounded-lg">
                          <Target className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">Challenge</h4>
                          <p className="text-gray-700">
                            1920s three-story unreinforced masonry building in San Francisco's Richmond District. Ground floor commercial with residential above. City-mandated soft-story retrofit required seismic upgrade while maintaining historical character and keeping tenants in place during construction.
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
                            Designed interior steel moment frame system that avoided façade modifications. Utilized existing basement for new foundation elements. Specified shallow embedment anchors requiring minimal concrete removal. Phased construction allowed business to remain operational with only weekend access required. Coordinated closely with city planning to satisfy historical preservation requirements.
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
                            Building achieved full seismic compliance under SF Building Code. Zero disruption to commercial tenant operations during 9-week construction. Historical review board approved design with commendation for sensitive approach. Total project cost 22% below initial estimates through value-engineering. Building now insurable and compliant with mandatory retrofit deadline.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">9 weeks</div>
                        <div className="text-sm text-gray-600">construction time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">22%</div>
                        <div className="text-sm text-gray-600">under budget</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">Zero</div>
                        <div className="text-sm text-gray-600">tenant disruption</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card> */}

              {/* Case Study 2 */}
              {/* <Card className="overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="relative h-80 lg:h-auto overflow-hidden lg:order-2">
                    <img
                      src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800"
                      alt="Foundation design project"
                      className="w-full h-full object-cover" />
                    
                    <div className="absolute top-4 left-4">
                      <div className="bg-cyan-600 text-white px-4 py-2 rounded-lg font-bold">
                        Foundation Design
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8 lg:p-12 lg:order-1">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      Bay Fill Site Deep Foundation System
                    </h3>
                    
                    <div className="mb-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="bg-red-100 p-2 rounded-lg">
                          <Target className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">Challenge</h4>
                          <p className="text-gray-700">
                            New 4-story office building on Bay fill site in Alameda with 40 feet of soft clay over dense sand. Preliminary geotechnical report recommended driven piles at $280K. High groundwater and liquefaction potential complicated foundation design. Tight budget required cost-effective solution.
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
                            Performed value-engineering analysis of foundation alternatives. Designed augered cast-in-place (ACIP) pile system with 18-inch diameter piles instead of driven piles. Specified real-time monitoring during installation to verify concrete volume and pile integrity. Coordinated with geotechnical engineer for load testing program. Design reduced pile count from 84 to 62 through optimized spacing and grade beam configuration.
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
                            Foundation cost reduced to $165K — 41% savings versus driven pile system. Load testing showed ACIP piles exceeded design capacity by 18%. Installation completed in 12 days versus estimated 21 days for driven piles. Eliminated noise and vibration concerns of pile driving in urban area. Building completed on schedule and passed final inspection without foundation-related issues.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-cyan-600">$115K</div>
                        <div className="text-sm text-gray-600">cost savings</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-cyan-600">62 piles</div>
                        <div className="text-sm text-gray-600">optimized count</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-cyan-600">12 days</div>
                        <div className="text-sm text-gray-600">installation</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Case Study 3 */}
             {/* <Card className="overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="relative h-80 lg:h-auto overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?w=800"
                      alt="Structural damage assessment"
                      className="w-full h-full object-cover" />
                    
                    <div className="absolute top-4 left-4">
                      <div className="bg-teal-600 text-white px-4 py-2 rounded-lg font-bold">
                        Structural Evaluation
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8 lg:p-12">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      Fire-Damaged Warehouse Structural Assessment
                    </h3>
                    
                    <div className="mb-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="bg-red-100 p-2 rounded-lg">
                          <Target className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">Challenge</h4>
                          <p className="text-gray-700">
                            60,000 SF industrial warehouse suffered significant fire damage to steel roof trusses and metal decking. Insurance company needed rapid structural assessment to determine repair versus replacement decision. Building was revenue-generating and client needed fastest possible re-occupancy timeline.
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
                            Mobilized PE team within 24 hours for emergency structural assessment. Used laser scanning to document deflections and deformation. Conducted material testing on heat-affected steel members. Performed structural analysis to determine remaining capacity of damaged trusses. Designed targeted repair strategy replacing only critically damaged members (18 of 45 trusses) while reinforcing others. Coordinated closely with fire marshal and building department for expedited permit approval.
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
                            Detailed engineering analysis proved 60% of structure salvageable — avoiding complete tear-down. Repair strategy saved $320K versus full replacement. PE-sealed emergency assessment satisfied insurance engineering review. Building department approved permit applications within 4 days based on comprehensive documentation. Client resumed operations 8 weeks after fire versus 6+ months for full rebuild.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-teal-600">$320K</div>
                        <div className="text-sm text-gray-600">cost savings</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-teal-600">60%</div>
                        <div className="text-sm text-gray-600">structure saved</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-teal-600">8 weeks</div>
                        <div className="text-sm text-gray-600">to re-occupancy</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section> */}
      </ScrollFadeSection>

      {/* CTA */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-cyan-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Get Engineering Assistance
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Whether you're a Superintendent dealing with Public Works overload, or a safety professional trying to keep your company's head above compliance waters, we've got your back. Let's discuss your project.
            </p>
            
            <Link to={createPageUrl("Consultation")}>
              <Button size="lg" className="bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-500 text-white px-8 py-6 text-lg font-medium rounded-xl inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow h-10 border-2 border-white hover:bg-white/10 backdrop-blur-sm group">
                Start Free Consultation
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>
      </ScrollFadeSection>
    </div>);

}