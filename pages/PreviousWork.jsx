import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Building2, CheckCircle, MapPin, Calendar, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ScrollFadeSection from "../components/ScrollFadeSection";

export default function PreviousWork() {
  const featuredProjects = [
    {
      title: "Port of San Francisco - Portwide Demolition Cost Estimate and Roof Inspection for Solar Panel Installation",
      client: "Port of San Francisco",
      contact: "Mr. Uday Prasad",
      budget: "$15,250",
      description: "PECI was the lead engineering firm for development of the Port of San Francisco construction cost estimate for the removal and disposal of dilapidated piers and wharfs along the San Francisco waterfront. Piers and wharfs inspected and costs for demolition/removal included piers ½, 2, 24, 30, 31, 32, 54, 60, 64, 70 (wharf 6, 7, & 8), 84, & 88. The cost estimate was subsequently provided to the U.S. Army Corps of Engineers as part of documentation required for funding. The construction cost estimate was developed by thoroughly inspecting the piers and wharfs from both the landside and water site. PECI also provided roof inspections and structural engineering consulting for the placement of solar panels on Port of San Francisco Property.",
      type: "Infrastructure",
      agencies: ["Port of San Francisco", "U.S. Army Corps of Engineers", "California Regional Water Quality Control Board"]
    },
    {
      title: "Caltrans - Design/Build Stormwater System Reconstruction & Emergency Infrastructure",
      client: "California Transportation Department (Caltrans)",
      contact: "Quang Tran, PE - Resident Engineer",
      budget: "$425,000",
      description: "PECI has been awarded various contracts by Caltrans for work along Northern California Highways. PECI completed the design and reconstruction of a stormwater drainage basin along the toe of the embankment at Highway 80 adjacent to American Canyon Blvd. This work included developing adequate field surveys and designs to properly collect, contain and direct all stormwater away from Highway 80 and the surrounding drainage basin to existing culverts passing under Highway 80. PECI also completed construction of a new emergency guardrail along Highway 780 and upgrades to ADA access, signal lighting and striping in Palo Alto. PECI provided all necessary field construction crews and equipment to self-perform the work. These projects also required PECI staff to develop stormwater pollution plans and erosion control plans. All projects were completed within schedule and budget.",
      type: "Infrastructure",
      agencies: ["California Transportation Department (Caltrans)"]
    },
    {
      title: "San Francisco Unified School District - Prop A and B Bond Program",
      client: "San Francisco Unified School District",
      contact: "Mr. DeWitt Mark",
      budget: "$315,000",
      description: "Since 2007 PECI has been providing civil, environmental and surveying services to the San Francisco Unified School District as part of the District Prop A and Prop B, 2006 and 2011 Bond Programs. During this project PECI has completed over 25 detailed topographic and underground surveys, civil grading plans for ADA access and for new and rehabilitation building construction for 15 San Francisco elementary, middle, and high schools, and developed comprehensive designs for stormwater treatment and disposal. PECI is familiar with, and has incorporated all applicable stormwater guidance documents in their civil designs during the development of the engineering plans for this ongoing project.",
      type: "Education",
      agencies: ["San Francisco Unified School District", "California Regional Quality Control Board", "Department of the State Architect", "San Francisco Fire Department", "San Francisco DPW"]
    },
    {
      title: "SFPUC - Microwave Replacement Phase II, Harry Tracy Water Treatment Plant, Crystal Springs Reservoir, Rim Fire Damage Reconstruction",
      client: "San Francisco Public Utilities Commission",
      contact: "Mr. Mark Rundle",
      budget: "$929,000",
      description: "PECI has provided construction and construction management services including demolition, asbestos abatement, hazardous materials abatement, excavation and tree removal for the SFPUC upgrade of the Crystal Springs/San Andreas Pipeline located in San Mateo and Harry Tracy Water Treatment Plant located in San Bruno. PECI prepared the required Hazardous Materials Management Plan, Health and Safety Plan, Demolition work plans, Debris and Disposal plan and worker safety plans. PECI has also provided construction services including excavation, paving, utility installation, concrete placement and roadway grading for the SFPUC's installation of microwave towers located in Yosemite National Park and Stanislaus National Forest. In addition to providing construction services, PECI has prepared Storm Water Pollution Prevention Plans and conducted weekly SWPPP monitoring for the Don Pedro Crossing and Peninsular Pipeline Projects.",
      type: "Infrastructure",
      agencies: ["San Francisco Public Utilities Commission", "US Forest Service", "Yosemite National Park"]
    },
    {
      title: "San Francisco International Airport - Design Build Terminal 3/Boarding Area E and Data Center",
      client: "San Francisco International Airport",
      contact: "Mr. Mark P. Costanzo",
      budget: "$1,600,000",
      schedule: "January 2012 - Current",
      description: "PECI was selected as part of the design build team for design and construction of the new Terminal 3/Boarding Area E and Data Center recently completed at the San Francisco International Airport. PECI was responsible for all civil related aspects of the project including but not limited to preparation of the stormwater pollution prevention plan, erosion control plan, grading plan, utility plan, specifications, details, topographic and underground surveying and construction administration related to the civil design. PECI staff installed the storm sewer, storm drain, and water system for the new boarding area E project.",
      type: "Airport",
      agencies: ["San Francisco International Airport"]
    },
    {
      title: "San Francisco Office of Chief Medical Examiner Building",
      client: "San Francisco Department of Public Works",
      contact: "Magdalena Ryor",
      budget: "$350,000",
      description: "PECI was selected as part of the construction team to build the new San Francisco Office of the Chief Medical Examiner Building. PECI's tasks included providing all survey construction staking, utility potholing investigation and surveying, and excavation for new footings, pile caps and grade beams.",
      type: "Municipal",
      agencies: ["San Francisco Department of Public Works"]
    }
  ];

  const additionalProjects = [
    {
      title: "Hetch Hetchy Water and Power/Safety Improvement Program",
      client: "San Francisco Public Utilities Commission",
      role: "Rim Fire and Project Coordinator for HHWP/HSIP",
      type: "Infrastructure"
    },
    {
      title: "SFPUC Project DB 124: San Joaquin Valley Communication System Upgrade",
      client: "San Francisco Public Utilities Commission",
      role: "Responsible Design Engineer",
      type: "Infrastructure"
    },
    {
      title: "Temporary Boarding Area B & Security Screening Checkpoint",
      client: "City & County of San Francisco Airport Commission",
      contract: "Contract No. 10003.41",
      role: "Project Management Support Services (with Hill International, Inc.)",
      type: "Airport"
    },
    {
      title: "Duct Bank Utility Replacement Project",
      client: "San Francisco International Airport",
      contract: "Contract Number 10511.76",
      role: "Engineering Consulting and Construction Services (with Hunt Construction Group)",
      type: "Airport"
    },
    {
      title: "SFO Tower ATCT & Integrated Facilities",
      client: "San Francisco International Airport",
      role: "Environmental Consulting and Construction Services (with Hensel Phelps Construction Company)",
      type: "Airport"
    }
  ];

  const capabilities = [
    "Civil Engineering Design",
    "Environmental Engineering",
    "Construction Management",
    "Surveying & Mapping",
    "Infrastructure Engineering",
    "Site Grading & Paving",
    "Utilities (Water, Sewer, Storm Drain)",
    "General Engineering 'A' Construction"
  ];

  const projectTypes = [
    "Airports",
    "Municipal Buildings",
    "Marinas",
    "Prisons",
    "Hospitals",
    "Schools",
    "Condominiums",
    "Casinos",
    "Residential Land Developments"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <section className="relative py-24 px-6 bg-gradient-to-br from-blue-900 via-indigo-900 to-cyan-800 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1600')] bg-cover bg-center" />
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-cyan-500/20 px-4 py-2 rounded-full backdrop-blur-sm border border-cyan-400/30 mb-6">
            <Award className="w-4 h-4 text-cyan-200" />
            <span className="text-cyan-200 text-sm font-medium">Since 2001</span>
          </div>
          <h1 className="text-white mb-6 text-5xl font-bold md:text-6xl">Previous Work</h1>
          <p className="text-xl text-cyan-100 max-w-3xl mx-auto leading-relaxed">
            Over two decades of excellence in civil engineering, construction management, and infrastructure development across California and Nevada
          </p>
        </div>
      </section>

      {/* Company Profile */}
      <ScrollFadeSection>
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">Company Profile</h2>
              <div className="max-w-4xl mx-auto">
                <Card className="p-8 border-0 shadow-xl bg-white">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Founded in 2001, Pacific Engineering & Construction, Inc. (PECI) has applied its civil, environmental, construction management, surveying, and infrastructure engineering capabilities to sites across California and Nevada. PECI provides complete site civil and environmental engineering design and surveying services for airports, municipal buildings, marinas, prisons, hospitals, schools, condominiums, casinos and new residential land developments.
                  </p>
                  <p className="text-lg text-gray-700 leading-relaxed mt-4">
                    PECI has developed construction plans and specifications for site grading, paving, curb and gutter, and sidewalks, as well as water, sewer, and storm drain utilities. PECI staff has extensive construction management and construction administration experience. PECI has also provided general engineering "A" construction services to both municipal and private clients.
                  </p>
                </Card>
              </div>
            </div>

            {/* Core Capabilities */}
            <div className="grid md:grid-cols-2 gap-12 mb-20">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Core Capabilities</h3>
                <div className="space-y-3">
                  {capabilities.map((capability, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-800 font-medium">{capability}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Project Types</h3>
                <div className="grid grid-cols-2 gap-3">
                  {projectTypes.map((type, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-cyan-50 rounded-lg">
                      <Building2 className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                      <span className="text-gray-800 text-sm font-medium">{type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollFadeSection>

      {/* Featured Projects */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Projects</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Detailed case studies of major projects for the City and County of San Francisco
              </p>
            </div>

            <div className="space-y-12">
              {featuredProjects.map((project, index) => (
                <Card key={index} className="border-0 shadow-2xl overflow-hidden bg-white hover:shadow-3xl transition-all duration-300">
                  <div className="p-8 lg:p-10">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Building2 className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{project.title}</h3>
                        <div className="flex flex-wrap gap-4 mb-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{project.client}</span>
                          </div>
                          {project.budget && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Award className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">Budget: {project.budget}</span>
                            </div>
                          )}
                          {project.schedule && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{project.schedule}</span>
                            </div>
                          )}
                        </div>
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-2 rounded-full border border-blue-200">
                          <span className="text-sm font-semibold text-blue-700">{project.type}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                      <p className="text-gray-700 leading-relaxed">{project.description}</p>
                    </div>

                    {project.agencies && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Agency Participation</h4>
                        <div className="flex flex-wrap gap-2">
                          {project.agencies.map((agency, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                              <span className="text-xs text-gray-700 font-medium">{agency}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </ScrollFadeSection>

      {/* Additional Projects */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Additional Projects</h2>
              <p className="text-lg text-gray-600">
                More projects for the City and County of San Francisco
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {additionalProjects.map((project, index) => (
                <Card key={index} className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{project.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{project.client}</span>
                      </div>
                      {project.contract && (
                        <p className="text-xs text-gray-500 mb-2">{project.contract}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="pl-15">
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">{project.role}</p>
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-50 to-teal-50 px-3 py-1 rounded-full">
                      <span className="text-xs font-semibold text-cyan-700">{project.type}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </ScrollFadeSection>

      {/* Geographic Reach */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Geographic Reach</h2>
            <Card className="p-8 border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
              <div className="flex items-center justify-center gap-4 mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-900">California & Nevada</h3>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                Our expertise spans across multiple states, with extensive experience in both California and Nevada markets. From the San Francisco Bay Area to regional projects throughout Northern California and beyond, PECI brings local knowledge and proven capabilities to every engagement.
              </p>
            </Card>
          </div>
        </section>
      </ScrollFadeSection>

      {/* CTA */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-cyan-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Let's Build Your Next Project Together
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              With over 20 years of experience and a proven track record of successful projects, we're ready to bring your vision to life
            </p>
            
            <Link to={createPageUrl("Contact")}>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg font-semibold shadow-xl">
                Start Your Project
              </Button>
            </Link>
          </div>
        </section>
      </ScrollFadeSection>
    </div>
  );
}