import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Droplets,
  HardHat,
  ClipboardCheck,
  Building2,
  Shield,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  FileText,
  CheckCircle } from
"lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ScrollFadeSection from "../components/ScrollFadeSection";

export default function ServicesOverview() {
  // ============================================================
  // 📝 EDITABLE SERVICE CARDS CONTENT
  // ============================================================
  // Edit titles, descriptions, and features below to update service cards
  // Note: Keep 'icon', 'gradient', 'bgGradient', and 'link' properties unchanged

  const services = [
  {
    id: 1,
    title: "Stormwater Planning (SWPPP)",
    description: "Comprehensive stormwater pollution prevention plans developed by certified QSDs and Professional Engineers.",
    icon: Droplets,
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-50 to-cyan-50",
    link: "Services",
    features: [
    "QSD/QSP Services",
    "Site Assessment & Analysis",
    "BMP Design & Implementation",
    "Regulatory Compliance"]

  },
  {
    id: 2,
    title: "Construction Services",
    description: "Full-scale construction expertise with Class A & B licenses for infrastructure and residential projects.",
    icon: HardHat,
    gradient: "from-cyan-500 to-teal-500",
    bgGradient: "from-cyan-50 to-teal-50",
    link: "Construction",
    features: [
    "Class A & B Licensed",
    "Public Infrastructure",
    "Commercial & Residential",
    "Project Management"]

  },
  {
    id: 3,
    title: "Inspections & Testing",
    description: "Certified testing and sampling services ensuring code compliance and project quality across all phases.",
    icon: ClipboardCheck,
    gradient: "from-teal-500 to-green-500",
    bgGradient: "from-teal-50 to-green-50",
    link: "InspectionsTesting",
    features: [
    "Stormwater Testing",
    "Materials Testing",
    "Soil & Geotechnical",
    "Lab Coordination"]

  },
  {
    id: 4,
    title: "Structural Engineering",
    description: "Licensed PE-certified structural design, analysis, and seismic retrofit services for all project types.",
    icon: Building2,
    gradient: "from-green-500 to-emerald-500",
    bgGradient: "from-green-50 to-emerald-50",
    link: "StructuralEngineering",
    features: [
    "Seismic Retrofits",
    "Foundation Design",
    "Structural Analysis",
    "Building Design"]

  },
  {
    id: 5,
    title: "Special Inspections",
    description: "PE-backed verification services for structural materials, welding, seismic systems, and building envelope.",
    icon: Shield,
    gradient: "from-emerald-500 to-indigo-500",
    bgGradient: "from-emerald-50 to-indigo-50",
    link: "SpecialInspections",
    features: [
    "Structural Materials",
    "Welding Inspection",
    "Seismic Systems",
    "Building Envelope"]

  }];

  // ============================================================

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-32 px-6 bg-gradient-to-br from-blue-900 via-indigo-900 to-cyan-800 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600')] bg-cover bg-center" />
        </div>    

        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 animate-pulse" />
        <div className="p-6 bg-black/21 mx-auto opacity-100 rounded-[3rem] backdrop-blur-md max-w-5xl shadow-2xl border border-white/10">
        <div className="mx-auto text-center relative z-10 max-w-5xl">
           <h1 className="text-white mb-6 text-5xl font-bold md:text-6xl lg:text-7xl">
            Our Services
          </h1>
          
          <p className="text-cyan-100 mx-auto text-xl md:text-2xl font-medium leading-relaxed max-w-3xl">
            Local SF Bay Area experts delivering superior vertically integrated services from in-depth environmental compliance to civil and structural engineering at any scale. No matter the project, our teams of highly skilled professionals have your back.
          </p>
        </div>
        </div>
      </section>

      {/* Services Grid */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Civil & Structural Engineering & Construction Consulting
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Full-scale civil and structural engineering and construction plans developed and implemented by our teams of in-house Engineers, QSD/QSPs, and construction experts. Helping you ensure on-time, on budget, full compliance, and with maximum creative outlook for your project. Keep everything on track.
              </p>
            </div>
          </div>
        </section>
        </ScrollFadeSection>

        <ScrollFadeSection>
        <section className="mb-32">
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
        </section>
      </ScrollFadeSection>

      {/* Why Choose Us */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Choose Pacific Engineering
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Delivering excellence across every discipline with licensed professionals and proven results
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 text-center border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Licensed & Certified</h3>
                <p className="text-gray-600 leading-relaxed">
                  Professional Engineers, QSD/QSPs, and contractors with California licenses and certifications
                </p>
              </Card>

              <Card className="p-8 text-center border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Integrated Solutions</h3>
                <p className="text-gray-600 leading-relaxed">
                  Seamless coordination across engineering, construction, and compliance for streamlined projects
                </p>
              </Card>

              <Card className="p-8 text-center border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <ClipboardCheck className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Bay Area Experts</h3>
                <p className="text-gray-600 leading-relaxed">
                  Deep knowledge of local jurisdictions, regulations, and conditions across the region
                </p>
              </Card>
            </div>
          </div>
        </section>
      </ScrollFadeSection>

      {/* CTA */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Let's discuss your project needs and how we can help ensure its success
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl("Contact")}>
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-10 py-7 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all">
                  Get in Touch
                  <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
              </Link>
              
              <Link to={createPageUrl("Consultation")}>
                <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur border-2 border-white text-white hover:bg-white/20 px-10 py-7 text-lg font-semibold rounded-xl shadow-xl transition-all">
                  Get Free Consultation
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </ScrollFadeSection>
    </div>);

}