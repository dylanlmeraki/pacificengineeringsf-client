import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Award, Users, Target, Shield, ArrowRight, Building2, HardHat, ClipboardCheck, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ScrollFadeSection from "../components/ScrollFadeSection";

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 px-6 bg-gradient-to-br from-blue-900 to-cyan-800 overflow-hidden">
        <div className="absolute inset-0 opacity-70">
          <div className="absolute inset-0 bg-[url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/3778041a3_Bay_Area_Evening_Cityscape.jpg')] bg-cover bg-center" />
        </div>
        
        <div className="py-6 bg-black/17 mx-auto opacity-100 rounded-[3rem] backdrop-blur-md max-w-5xl shadow-2xl border border-white/10">
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h1 className="text-white mb-6 text-5xl font-bold md:text-6xl">About Pacific Engineering</h1>
          <p className="text-xl text-cyan-100 max-w-3xl mx-auto leading-relaxed">
            Engineering, consulting, and construction services backed by decades of experience and a commitment to getting projects done right
          </p>
        </div>
        </div>
      </section>

      {/* Company Story */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Who We Are
                </h2>
                <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                  <p>
                   Founded in 2001, Pacific Engineering &amp; Construction, Inc. (PECI) has applied its surveying and
civil and environmental engineering, construction management, and infrastructure engineering
capabilities to sites across California, and Nevada, PECI provides site civil engineering design
and surveying services for municipal buildings, marinas, prisons, hospitals, schools,
condominiums, casinos and new residential land developments. PECI has developed construction
plans and specifications for site grading, paving, curb and gutter, and sidewalks, as well as water,
sewer, and storm drain utilities. PECI staff has extensive construction management and
construction administration experience. Master plans have been prepared for commercial, light
industrial and residential developments in multiple communities in Northern California. Recent
school projects that PECI has provided engineering services to include projects at the San
Francisco International Airport and schools in Marin, San Francisco, Daly City, and
Sacramento.</p>
<p>PECI continuously strives to improve quality by providing quality control and quality assurance
(QA/QC) on all deliverables and work products. Our firm has an established record of meeting
project and schedule commitments. PECI’s engineers and technicians have hands-on experience
providing contract administration, as well as quality assurance/quality control monitoring and
material testing on a variety of public and private sector projects. Our wide range of in-house
capabilities enables us to provide high-quality, cost-effective services.</p>
<p>PECI’s provides professional surveying, mapping, G.I.S., G.P.S., 3-D laser scanning, and
consulting services throughout California. Our staff has successfully completed projects of all
sizes for both the private, municipal, and public sector.</p>
<p>We are dedicated to providing our clients with quality surveying support for their projects.
Whether it is a small boundary line dispute or providing mapping services to a large utility
company, Pacific Engineering &amp; Construction, Inc. consistently delivers an economical product
in a timely manner.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800"
                    alt="Pacific Engineering team"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* What We Do */}
            <div className="mb-20">
              <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
                What We Do
              </h2>
              
             <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <Link to={createPageUrl("Services")} className="block group">
                <Card className="h-full hover:shadow-2xl transition-all duration-300 overflow-hidden border-0 bg-white cursor-pointer transform hover:scale-[1.02]">
                  <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500" />
                  <div className="p-8">
                    <div className="bg-gradient-to-br from-blue-100 to-cyan-100 mx-auto my-6 rounded-2xl w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-gray-900 mx-auto my-4 text-2xl font-bold text-center">Stormwater Planning</h3>
                    <p className="text-gray-600 mb-6 text-center leading-relaxed">Custom plans from initial assessments, tailored practical BMP designs, and full local, state, and federal regulatory compliance assurance and permitting walkthroughs.
                    </p>
                    <ul className="space-y-3 w-full flex flex-col items-center">
                      <li className="flex items-start gap-3 text-gray-700 max-w-md">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>In-house PE/QSD/QSP site assessment</span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700 max-w-md">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>BMP design and maintenance</span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700 max-w-md">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Clear documentation with action items</span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700 max-w-md">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Full local, state, and Federal compliance assurance</span>
                      </li>
                    </ul>
                  </div>
                </Card>
              </Link>

              <Link to={createPageUrl("Construction")} className="block group">
                <Card className="h-full hover:shadow-2xl transition-all duration-300 overflow-hidden border-0 bg-white cursor-pointer transform hover:scale-[1.02]">
                  <div className="h-2 bg-gradient-to-r from-cyan-500 to-teal-500" />
                  <div className="p-8">
                    <div className="bg-gradient-to-br from-cyan-100 to-teal-100 mx-auto my-6 rounded-2xl w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Shield className="w-8 h-8 text-cyan-600" />
                    </div>
                    <h3 className="text-gray-900 mx-auto my-4 text-2xl font-bold text-center">Construction Service</h3>
                    <p className="text-gray-600 mx-auto my-6 text-center leading-relaxed">We are fully licensed and ready to take on any and all work from residential additions, multi-unit residential, commercial mixed-use, up to public and governmental infrastructure.
                    </p>
                    <ul className="space-y-3 w-full flex flex-col items-center">
                      <li className="flex items-start gap-3 text-gray-700 max-w-md">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Class A License</span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700 max-w-md">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Class B License</span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700 max-w-md">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Infrastructure & Public Works</span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700 max-w-md">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Residential, Commercial, and Municipal Infrastructure</span>
                      </li>
                    </ul>
                  </div>
                </Card>
              </Link>

              <Link to={createPageUrl("InspectionsTesting")} className="block group">
                <Card className="h-full hover:shadow-2xl transition-all duration-300 overflow-hidden border-0 bg-white cursor-pointer transform hover:scale-[1.02]">
                  <div className="h-2 bg-gradient-to-r from-teal-500 to-green-500" />
                  <div className="p-8">
                    <div className="bg-gradient-to-br from-teal-100 to-emerald-100 mx-auto my-6 rounded-2xl w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ClipboardCheck className="w-8 h-8 text-teal-600" />
                    </div>
                    <h3 className="text-gray-900 mx-auto my-4 text-2xl font-bold text-center">Inspections & Testing</h3>
                    <p className="text-gray-600 mb-6 text-center leading-relaxed">Thorough inspections to ensure ongoing compliance with recommendation and implementation of areas for improvement.

                    </p>
                    <ul className="space-y-3 w-full flex flex-col items-center">
                      <li className="flex items-start gap-3 text-gray-700 max-w-md">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Structural Systems Inspections</span>
                      </li>
                        <li className="flex items-start gap-3 text-gray-700 max-w-md">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Stormwater Testing and Inspections</span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700 max-w-md">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="mx-auto text-center">Materials Sampling & Testing</span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700 max-w-md">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Environmental Compliance</span>
                      </li>
                    </ul>
                  </div>
                </Card>
              </Link>
              
              <Link to={createPageUrl("StructuralEngineering")} className="block group">
                <Card className="h-full hover:shadow-2xl transition-all duration-300 overflow-hidden border-0 bg-white cursor-pointer transform hover:scale-[1.02]">
                  <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500" />
                  <div className="p-8">
                    <div className="bg-gradient-to-br from-green-100 to-emerald-100 mx-auto my-6 rounded-2xl w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ClipboardCheck className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-gray-900 mx-auto my-4 text-2xl font-bold text-center">Engineering Consulting</h3>
                    <p className="text-gray-600 mb-6 text-center leading-relaxed">Professional engineering expertise across civil and structural disciplines, providing innovative solutions and implementation to meet the unique needs of your project - from large-scale infrastructure to single family residential additions.

                    </p>
                    <ul className="space-y-3 w-full flex flex-col items-center">
                      <li className="flex items-start gap-3 text-gray-700 max-w-md">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Civil Engineering Consulting</span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700 max-w-md">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Structural Consulting</span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700 max-w-md">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Site Assessment & Design</span>
                      </li>
                        <li className="flex items-start gap-3 text-gray-700 max-w-md">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Development Management & Support</span>
                      </li>
                    </ul>
                  </div>
                </Card>
              </Link>
            </div>
            </div>

            {/* Our Approach */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800"
                    alt="Engineering and construction expertise"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div className="order-1 lg:order-2">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  How We Work
                </h2>
                <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                  <p>
                  Our in-house Professional Engineering and Construction teams operate as a unified teamtight, coordinated, and accountable. This integrated structure drives faster decisions, cleaner execution, and consistent technical accuracy on every project.
                  </p>
                  <p>
                  We navigate local SF Bay Area, California, and Federal regulatory compliance standards with precision backed by long-standing relationships with architects, contractors, and construction professionals streamlining approvals and keep schedules on track.
                </p>
                  <p>
                   When site issues surface, our teams identify them early and resolve them immediately. No bottlenecks, no unclear responsibility. We address it, document it, and keep the project moving.
                   </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollFadeSection>

      {/* Core Values */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
              What Drives Us
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="p-6 text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Technical Excellence</h3>
                <p className="text-gray-600">
                  Precision engineering, rigorous testing, and PE-certified work that stands up to scrutiny and performs as designed
                </p>
              </Card>

              <Card className="p-6 text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-cyan-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Results-Focused</h3>
                <p className="text-gray-600">
                  Delivering outcomes that matter — compliance achieved, structures built right, projects completed on schedule
                </p>
              </Card>

              <Card className="p-6 text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Collaborative</h3>
                <p className="text-gray-600">
                  Working closely with your team, communicating clearly, and coordinating seamlessly across all project phases
                </p>
              </Card>

              <Card className="p-6 text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Accountable</h3>
                <p className="text-gray-600">
                  Taking ownership of our work, standing behind our designs, and delivering what we promise
                </p>
              </Card>
            </div>
          </div>
        </section>
      </ScrollFadeSection>

      {/* Stats */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
              By the Numbers
            </h2>
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-2xl shadow-lg">
                <div className="text-5xl font-bold text-blue-600 mb-2">40+</div>
                <div className="text-xl text-gray-700 font-medium">Years</div>
                <p className="text-gray-600 mt-2">Combined experience across engineering and construction</p>
              </div>
              
              <div className="bg-gradient-to-br from-cyan-50 to-teal-50 p-8 rounded-2xl shadow-lg">
                <div className="text-5xl font-bold text-cyan-600 mb-2">2,500+</div>
                <div className="text-xl text-gray-700 font-medium">Projects</div>
                <p className="text-gray-600 mt-2">Successfully completed throughout the Bay Area</p>
              </div>
              
              <div className="bg-gradient-to-br from-teal-50 to-green-50 p-8 rounded-2xl shadow-lg">
                <div className="text-5xl font-bold text-teal-600 mb-2">100%</div>
                <div className="text-xl text-gray-700 font-medium">Compliance</div>
                <p className="text-gray-600 mt-2">Track record across environmental and building code requirements</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl shadow-lg">
                <div className="text-5xl font-bold text-green-600 mb-2">$5B+</div>
                <div className="text-xl text-gray-700 font-medium">Project Value</div>
                <p className="text-gray-600 mt-2">Total construction value across all completed work</p>
              </div>
            </div>
          </div>
        </section>
      </ScrollFadeSection>

      {/* Service Areas */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Serving the Bay Area
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              Based in San Francisco, we provide engineering, inspection, testing, and construction services throughout the Bay Area. Our teams are familiar with local jurisdictional requirements across San Francisco, Oakland, San Jose, and surrounding counties — streamlining approvals and keeping your project moving forward.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              From hillside developments in Oakland to commercial projects in Silicon Valley, waterfront construction in San Francisco to infrastructure work in the East Bay — we bring local expertise and proven results to every project.
            </p>
          </div>
        </section>
      </ScrollFadeSection>

      {/* CTA */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-cyan-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              We'd Love to Hear From You
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              If you are a local engineering or construction professional, let's chat. Our in-house engineering and construction teams can help streamline your current or future projects and bring your ideas to life. 
            </p>
            
            <Link to={createPageUrl("Contact")}>
              <Button size="lg" className="bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-500 text-white px-8 py-6 text-lg font-medium rounded-xl inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow h-10 border-2 border-white hover:bg-white/10 backdrop-blur-sm group">
                Get in Contact
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>
      </ScrollFadeSection>
    </div>
  );
}