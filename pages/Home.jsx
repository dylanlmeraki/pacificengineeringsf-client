import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CheckCircle, FileText, ClipboardCheck, Shield, ArrowRight, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ScrollFadeSection from "../components/ScrollFadeSection";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900">
        <div className="absolute inset-0 opacity-75">
          <div className="absolute inset-0 bg-[url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/3778041a3_Bay_Area_Evening_Cityscape.jpg')] bg-cover bg-center" />
        </div>
        
        {/* Animated water drops effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) =>
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }} />

          )}
        </div>

        <div className="text-center relative z-10 max-w-7xl px-4">
          <div className="bg-black/25 mx-auto opacity-100 rounded-[3rem] backdrop-blur-md max-w-5xl shadow-2xl border border-white/10">
            <h1 className="text-white mt-6 mb-6 mr-3 ml-3 text-4xl font-bold normal-case leading-tight md:text-7xl">Pacific Engineering & Construction Inc.

            </h1>
            <div className="mb-10">
            <p className="text-cyan-100 mb-4 mx-auto text-xl leading-relaxed md:text-2xl max-w-3xl">Consulting Engineers & Contractors

            </p>
            </div>
          <div className="pt-2 pb-20 flex flex-col sm:flex-row gap-8 justify-center">
            <Link to={createPageUrl("ServicesOverview")}>
              <Button size="lg" className="bg-gradient-to-b from-cyan-400 via-teal-400 to-blue-500 text-white px-8 py-6 text-lg font-medium rounded-xl inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow h-10 border-0,5 border-white hover:bg-white/10 hover:text-bold group">
                Our Services
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to={createPageUrl("Consultation")}>
              <Button size="lg" className="bg-gradient-to-b from-cyan-400 via-teal-400 to-blue-500 text-white px-8 py-6 text-lg font-medium rounded-xl inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow h-10 border-0,5 border-white hover:bg-white/10 hover:text-bold group">
                Free Consultation
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to={createPageUrl("ClientAuth")}>
              <Button size="lg" className="bg-white/10 text-white backdrop-blur border border-white/50 px-8 py-6 text-lg font-medium rounded-xl inline-flex items-center justify-center gap-2 hover:bg-white/20 transition">
                Client Login
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to={createPageUrl("ClientAuth")}>
              <Button size="lg" className="bg-white/10 text-white backdrop-blur border border-white/50 px-8 py-6 text-lg font-medium rounded-xl inline-flex items-center justify-center gap-2 hover:bg-white/20 transition">
                Client Login
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2 justify-items-center pb-10">
            <div className="text-center pl-8">
              <div className="text-cyan-400 text-3xl font-bold">40+</div>
              <div className="text-blue-200 text-sm">Years Experience</div>
            </div>
            <div className="text-center pr-16">
              <div className="text-cyan-400 text-3xl font-bold">Full-Service</div>
              <div className="text-blue-200 text-sm">Vertically Integrated Engineering</div>
            </div>
            <div className="text-center pr-20">
              <div className="text-cyan-400 text-3xl font-bold">Full-Scale</div>
              <div className="text-blue-200 text-sm">Residential, Commercial, and Infrastructure</div>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Consulting Engineers & Contractors
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">Full-scale civil and structural engineering and construction plans developed and implemented by our teams of in-house Engineers, QSD/QSPs, and construction experts.

              Helping you ensure on-time, on budget, full compliance, and with maximum creative outlook for your project.

              Keep everything on track.</p>
            </div>

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

            <div className="text-center mt-12">
              <Link to={createPageUrl("Services")}>
                <Button size="lg" className="bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-600 text-primary-foreground px-8 text-sm font-medium rounded-[10px] inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow h-10 hover:bg-blue-700">
                 View All Services
                 <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </ScrollFadeSection>

      {/* Why Choose Us */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-gray-900 mb-6 text-4xl font-bold text-center md:text-5xl">Why Pacific Engineering?

                </h2>
                <p className="text-xl text-gray-700 text-center mb-8 leading-relaxed">
                  With over 40 years of experience in private, commercial, and institutional full-scale civil engineering and construction contractiong, we deliver comprehensive solutions and deliverables keeping projects on track with the utmost professional efficiency.
                </p>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Knowledge</h3>
                      <p className="text-gray-600">Deep understanding of federal, state, and local stormwater regulations</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Proven Track Record</h3>
                      <p className="text-gray-600">100% client satisfaction across 2,5K+ projects</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 max-w-md">Responsive Service</h3>
                      <p className="text-gray-600">Quick turnaround times and dedicated project support</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10">
                  <Link to={createPageUrl("About")}>
                    <Button variant="outline" size="lg" className="bg-gradient-to-br text-white mr-12 ml-48 px-16 text-sm font-medium rounded-[10px] from-blue-400 via-cyan-500 to-blue-500 inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-sm h-10 border-2 border-white hover:bg-blue-600 hover:text-white">
                      About Us
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                  <img src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800" alt="San Francisco construction projects"
                  className="w-full h-full object-cover" />

                </div>
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl border-4 border-cyan-500">
                  <div className="text-3xl font-bold text-cyan-600 text-center mb-1">2.5K+</div>
                  <div className="text-gray-700 font-medium">Successful Projects</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollFadeSection>

      {/* CTA Section */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-700 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/8799e5f43_Bay_Bridge_undersitde_sunrise.jpg')] bg-cover bg-center" />
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">How Can We Help?

            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">Let's discuss your Projects' unique needs and develop a comprehensive solution to keep your ideas on schedule, under budget, allowing you to maximize your capabilities.

            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to={createPageUrl("servicesoverview")}>
                <Button size="lg" className="bg-white text-blue-600 px-8 py-6 text-lg font-medium rounded-[10px] inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow h-10 hover:bg-gray-100">
                  <Mail className="mr-2 w-5 h-5" />
                  Services
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
                <Button size="lg" className="bg-white text-blue-600 px-8 py-6 text-lg font-medium rounded-[10px] inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow h-10 hover:bg-gray-100">
                  <Phone className="mr-2 w-5 h-5" />
                  Get In Touch
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>
          </div>
        </section>
      </ScrollFadeSection>
    </div>);

}