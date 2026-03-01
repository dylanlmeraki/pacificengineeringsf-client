import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, CheckCircle, Hammer, Layers, Shield, ClipboardCheck, HardHat, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ScrollFadeSection from "../components/ScrollFadeSection";

export default function SpecialInspections() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 px-6 bg-gradient-to-br from-blue-900 to-cyan-800 overflow-hidden">
        <div className="absolute inset-0 opacity-70">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600')] bg-cover bg-center" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h1 className="text-white mb-6 pt-40 text-5xl font-bold md:text-6xl">Special Inspections
          </h1>
          <p className="text-xl text-cyan-100 max-w-3xl mx-auto leading-relaxed">
           Our Team of in-house Professional Engineers, and certified professionals with decades worth of combined experience are ready to perform any and all special inspections ensuring structural integrity and code compliance for critical building systems.
          </p>
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
                    src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800"
                    alt="Construction inspection"
                    className="w-full h-full object-cover" />

                </div>
              </div>

              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Engineer-Backed Verification
                </h2>
                <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                  <p>
                    Special inspections aren't optional — they're a building code requirement for critical structural elements. Our Professional Engineers perform, supervise, and certify special inspections across all major structural systems.
                  </p>
                  <p>
                    We provide independent third-party inspections required by the International Building Code (IBC) and California Building Code (CBC). Our PE-certified team interprets results, ensures conformance with structural design intent, and provides sealed reports.
                  </p>
                  <p>
                    From structural steel and concrete to seismic systems and fire protection — we deliver comprehensive inspection services that catch problems early and keep your project moving forward.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollFadeSection>

      {/* Main Inspection Categories */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Comprehensive Special Inspections
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Inspections performed and certified by our team of in-house Professional Engineers (PEs) across all critical structural materials, systems, and components
              </p>
            </div>

            <div className="space-y-8">
              {/* Structural Materials & Systems */}
              <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500" />
                <div className="p-8">
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="bg-blue-100 rounded-2xl w-16 h-16 flex items-center justify-center flex-shrink-0">
                      <img 
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/3ae5fcb9b_Clipboard_PNG.png"
                        alt="Structural Materials Icon"
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Inspections of Structural Materials & Systems</h3>
                      <p className="text-gray-600">Critical verification of structural integrity across all building materials.</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Reinforced Concrete Inspection</h4>
                      <p className="text-sm text-gray-600">Verification of concrete mix design, placement, size, and cover.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Prestressed/Post-Tensioned Concrete</h4>
                      <p className="text-sm text-gray-600">Monitoring of tendon installation, stressing, grouting, and anchorage.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Structural Masonry</h4>
                      <p className="text-sm text-gray-600">Confirm viability of masonry mortar, grout, reinforcement, and placement.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Structural Steel</h4>
                      <p className="text-sm text-gray-600">Verify member placement, welds, bolts, and connection integrity per AISC.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Cold-Formed Steel Framing</h4>
                      <p className="text-sm text-gray-600">Confirm connections, bracing, and member alignment.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Wood Construction Inspection</h4>
                      <p className="text-sm text-gray-600">Viability confirmation of framing connections, and hold-down installations</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Earthwork & Foundations */}
              <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="h-2 bg-gradient-to-r from-cyan-500 to-teal-500" />
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-cyan-100 rounded-2xl w-16 h-16 flex items-center justify-center flex-shrink-0">
                      <Layers className="w-8 h-8 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Earthwork & Foundations</h3>
                      <p className="text-gray-600">Ground support and foundation systems verification</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Soil & Compaction Testing</h4>
                      <p className="text-sm text-gray-600">Subgrade prep, moisture-density control, and field density verification</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Driven Foundational Piles</h4>
                      <p className="text-sm text-gray-600">Capacity verification, embedment depth, concrete placement, and reinforcement stability check.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Shallow Foundations Inspection</h4>
                      <p className="text-sm text-gray-600">Bearing verification, excavation inspection, and anchor bolt placement.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Ground Improvement & Grouting</h4>
                      <p className="text-sm text-gray-600">Observe compaction grouting, stone columns, or soil mixing operations.</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Welding, Bolting & Connections */}
              <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500" />
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-green-100 rounded-2xl w-16 h-16 flex items-center justify-center flex-shrink-0">
                      <Hammer className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Welding, Bolting & Structural Connections</h3>
                      <p className="text-gray-600">Critical connection verification for structural integrity</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Welding Inspections (Shop & Field)</h4>
                      <p className="text-sm text-gray-600">Confirm qualified welders, correct procedures, and sound weld quality per AWS D1.1.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Bolting Strength Inspection</h4>
                      <p className="text-sm text-gray-600">Verify bolt type, installation torque/tension, and connection compliance.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Structural Fastening Systems</h4>
                      <p className="text-sm text-gray-600">Check anchors, adhesives, and proprietary fastening systems per ICC-ES reports.</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Building Envelope & Fire Protection */}
              <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="h-2 bg-gradient-to-r from-emerald-500 to-blue-500" />
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-emerald-100 rounded-2xl w-16 h-16 flex items-center justify-center flex-shrink-0">
                      <img 
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/6ad529a7e_Flame_PNG.png"
                        alt="Fire Protection Icon"
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Building Envelope & Fire Protection</h3>
                      <p className="text-gray-600">Verify substrate preparation, mesh embedment, coatings, and drainage layers.</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Exterior Insulation & Finish Systems (EIFS)</h4>
                      <p className="text-sm text-gray-600">Thickness, density, adhesion, and coverage verification</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Fireproofing Inspections</h4>
                      <p className="text-sm text-gray-600">Measure thickness, adhesion, and coverage of spray-applied fire-resistive materials (SFRM).</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Firestopping Systems</h4>
                      <p className="text-sm text-gray-600">Confirm firestop materials and installation details rated to assemblies.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Smoke Control Testing</h4>
                      <p className="text-sm text-gray-600">Verify airflows, pressures, and control sequences under testing conditions.</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Seismic & Wind Resistance */}
              <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-500" />
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-amber-100 rounded-2xl w-16 h-16 flex items-center justify-center flex-shrink-0">
                      <img 
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/75ea84df6_Seismic_PNG.png"
                        alt="Seismic Icon"
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Seismic & Wind Resistance</h3>
                      <p className="text-gray-600">Critical safety system verification for seismic zones</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Seismic Resisting Systems</h4>
                      <p className="text-sm text-gray-600">Verify installation of braced frames, moment connections, collectors, and diaphragms.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Wind Resisting Systems</h4>
                      <p className="text-sm text-gray-600">Inspect framing, diaphragms, and anchorage in designated high-wind regions.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Seismic Anchorage of Equiptment & Nonstructural Components</h4>
                      <p className="text-sm text-gray-600">Confirm anchors, bracing, and details for mechanical/electrical/plumbing systems.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Structural Integrity Inspections</h4>
                      <p className="text-sm text-gray-600">As-built confirmation after critical load events or retrofit projects</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Deep Foundations & Ground Improvements */}
              <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500" />
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-purple-100 rounded-2xl w-16 h-16 flex items-center justify-center flex-shrink-0">
                      <img 
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/00ae96081_Hardhat_PNG.png"
                        alt="Hard Hat Icon"
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Deep Foundations & Ground Improvements</h3>
                      <p className="text-gray-600">Advanced foundation systems and soil stabilization</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Helical Piles / Micropiles</h4>
                      <p className="text-sm text-gray-600">Torque verification, alignment, and bearing capacity</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Ground Anchors / Tiebacks</h4>
                      <p className="text-sm text-gray-600">Testing, load verification, and lock-off tension</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Soil Nail Walls</h4>
                      <p className="text-sm text-gray-600">Nail installation, grouting, testing, and facing inspection</p>
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* Other Specialized Inspections */}
              <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="h-2 bg-gradient-to-r from-indigo-500 to-violet-500" />
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-indigo-100 rounded-2xl w-16 h-16 flex items-center justify-center flex-shrink-0">
                      <img 
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/00ae96081_Hardhat_PNG.png"
                        alt="Specialized Inspections Icon"
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Other Specialized Inspections</h3>
                      <p className="text-gray-600">Advanced and specialty structural systems verification</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Post-Installed Anchors</h4>
                      <p className="text-sm text-gray-600">Epoxy/mechanical anchor installation procedures, curing times, and torque testing</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Reinforcing Steel Welding or Couplers</h4>
                      <p className="text-sm text-gray-600">Material verification and tension testing</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Precast Concrete Erection</h4>
                      <p className="text-sm text-gray-600">Connections, grouting, bearing pads, and lateral stability</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Modular or Prefabricated Assemblies</h4>
                      <p className="text-sm text-gray-600">Verification of critical welds, joints, and anchorage during installation</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </ScrollFadeSection>

      {/* PE Authority Section */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 rounded-3xl p-12 border-2 border-blue-100">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-blue-600 rounded-xl w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Professional Engineer Authority</h3>
                    <p className="text-lg text-gray-700 leading-relaxed mb-4">
                      While Special Inspectors (certified under ICC or equivalent) often perform the fieldwork, Professional Engineers are uniquely authorized to:
                    </p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 ml-16">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Perform, supervise, or certify special inspections</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Interpret results and ensure conformance with structural design intent</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Provide reports to the Building Official</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Seal and sign inspection documentation where required by jurisdiction</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollFadeSection>

      {/* Inspection Types */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
              Inspection Levels
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
                <h3 className="text-gray-900 mb-4 text-2xl font-bold text-center">Continuous Inspection</h3>
                <p className="text-gray-700 mb-6 text-center leading-relaxed">Required for seismic force-resisting systems and other critical structural elements where work must not proceed without inspector verification

                </p>
                <ul className="space-y-3 w-full flex flex-col items-center">
                  <li className="flex items-start gap-3 text-gray-700 max-w-md">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Inspector present during all critical work</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700 max-w-md">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Real-time verification and documentation</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700 max-w-md">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Immediate issue identification and resolution</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-8 border-0 shadow-xl bg-gradient-to-br from-teal-50 to-green-50">
                <h3 className="text-gray-900 mb-4 text-2xl font-bold text-center">Periodic Inspection</h3>
                <p className="text-gray-700 mb-6 text-center leading-relaxed">Scheduled inspections at key phases of construction for work that doesn't require continuous oversight but still needs third-party verification

                </p>

                <ul className="space-y-3 w-full flex flex-col items-center">
                  <li className="flex items-start gap-3 text-gray-700 max-w-md">
                    <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>Coordinated inspection scheduling</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700 max-w-md">
                    <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>Phase-specific verification points</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700 max-w-md">
                    <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>Comprehensive reporting after each visit</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </section>
      </ScrollFadeSection>

      {/* Why Choose Us */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
              What Sets Us Apart
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">PE-Certified Team</h3>
                <p className="text-gray-700 leading-relaxed">
                  Professional Engineers certified for structural steel, concrete, masonry, and much more.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-cyan-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <ClipboardCheck className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Sealed Reports</h3>
                <p className="text-gray-700 leading-relaxed">
                  PE-sealed documentation satisfying permitting and compliance requirements - streamlining your project's in-betweens. 
                </p>
              </div>

              <div className="text-center">
                <div className="bg-teal-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <HardHat className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Design Intent Verification</h3>
                <p className="text-gray-700 leading-relaxed">
                  We ensure field conditions match design specifications and provide engineering interpretation when needed.
                </p>
              </div>
            </div>
          </div>
        </section>
      </ScrollFadeSection>

      {/* NEW: Case Studies Section */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Inspection Case Studies
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Real inspection scenarios where PE-certified oversight caught critical issues and ensured structural integrity
              </p>
            </div>

            <div className="space-y-12">
              {/* Case Study 1 */}
              <Card className="overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="relative h-80 lg:h-auto overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1572195831884-bae1f2012e3c?w=800"
                      alt="Steel structure inspection"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
                        Structural Steel
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8 lg:p-12">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      High-Rise Moment Frame Connection Deficiency
                    </h3>
                    
                    <div className="mb-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="bg-red-100 p-2 rounded-lg">
                          <Target className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">Challenge</h4>
                          <p className="text-gray-700">
                            12-story office building with special moment-resisting steel frame. During continuous weld inspection, our PE discovered that welding procedure specifications (WPS) used for beam-to-column connections differed from approved submittals. Six connections already completed before discovery.
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
                            Immediately halted welding operations and issued non-conformance report. Our PE coordinated with structural engineer of record to evaluate existing welds. Specified ultrasonic testing (UT) on completed connections. Required re-qualification of welding procedure and welder certification verification before resuming work. Supervised corrective welding on two connections that failed UT.
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
                            Caught deficiency early — only 6 of 240 connections affected. Building Official commended catch before more connections were completed. All remedial welds passed final inspection. Implemented enhanced weld procedure verification process preventing future issues. Project obtained Certificate of Occupancy on schedule despite 3-day welding delay.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">240</div>
                        <div className="text-sm text-gray-600">connections inspected</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">6</div>
                        <div className="text-sm text-gray-600">early detection</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">100%</div>
                        <div className="text-sm text-gray-600">final compliance</div>
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
                      src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800"
                      alt="Seismic system inspection"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <div className="bg-cyan-600 text-white px-4 py-2 rounded-lg font-semibold">
                        Seismic Systems
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8 lg:p-12 lg:order-1">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      Hospital Seismic Anchor Bolt Installation
                    </h3>
                    
                    <div className="mb-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="bg-red-100 p-2 rounded-lg">
                          <Target className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">Challenge</h4>
                          <p className="text-gray-700">
                            Hospital renovation required seismic anchorage of all mechanical equipment per OSHPD standards. Rooftop units weighing up to 8,000 lbs required post-installed epoxy anchors into existing concrete. Inspector access limited to swing-stage from roof edge. OSHPD inspector scheduled for final verification in 5 days.
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
                            Our PE performed continuous inspection during all anchor installations. Verified hole depth, diameter, and cleanliness before epoxy injection. Monitored epoxy batch numbers and expiration dates. Witnessed torque testing on 25% of anchors per ICC-ES acceptance criteria. Documented ambient temperature to ensure epoxy cure time compliance. Required re-installation of 14 anchors with insufficient embedment depth.
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
                            All 428 anchors passed final pull-test verification. OSHPD inspector accepted installation without deficiencies — rare for complex seismic anchorage work. PE-sealed reports satisfied hospital risk management requirements. Equipment operational for patient care areas with zero compliance delays. Mechanical contractor requested our team for subsequent phases across three additional hospital buildings.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-cyan-600">428</div>
                        <div className="text-sm text-gray-600">anchors verified</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-cyan-600">107</div>
                        <div className="text-sm text-gray-600">torque tests</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-cyan-600">100%</div>
                        <div className="text-sm text-gray-600">pass rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </ScrollFadeSection>

      {/* CTA */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-cyan-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Get Your PE-Certified Special Inspections Started
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Let's review your project determine which inspection services you need to ensure structural integrity and code compliance.
            </p>
            
            <Link to={createPageUrl("Contact")}>
              <Button size="lg" className="bg-cyan-500 text-white px-8 py-6 text-lg font-medium rounded-xl inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow h-10 border-2 border-white hover:bg-white/10 backdrop-blur-sm group">
                Request Inspection Services
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>
      </ScrollFadeSection>
    </div>
  );
}