import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, MapPin, Calendar, Building2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import ScrollFadeSection from "../components/ScrollFadeSection";

export default function ProjectGallery() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectTypeFilter, setProjectTypeFilter] = useState("all");
  const [selectedServices, setSelectedServices] = useState([]);

  const projects = [
    {
      id: 1,
      title: "Port of San Francisco - Portwide Demolition Cost Estimate and Roof Inspection for Solar Panel Installation",
      location: "San Francisco, CA",
      category: "infrastructure",
      date: "2022",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
      description: "PECI was the lead engineering firm for development of the Port of San Francisco construction cost estimate for the removal and disposal of dilapidated piers and wharfs along the San Francisco waterfront. PECI also provided roof inspections and structural engineering consulting for the placement of solar panels on Port of San Francisco Property.",
      services: ["Cost Estimation", "Structural Engineering", "Solar Panel Engineering"],
      scope: "Portwide demolition cost estimates for piers ½, 2, 24, 30, 31, 32, 54, 60, 64, 70, 84, & 88 plus roof inspections for solar panel installations",
      agencies: ["Port of San Francisco", "U.S. Army Corps of Engineers", "California Regional Water Quality Control Board"],
      images: [
        "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=800",
        "https://images.unsplash.com/photo-1509395176047-4a66953fd231?w=800"
      ]
    },
    {
      id: 2,
      title: "San Francisco International Airport - Terminal 3/Boarding Area E and Data Center",
      location: "San Francisco, CA",
      category: "infrastructure",
      date: "2012-2016",
      image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800",
      description: "PECI was selected as part of the design build team for design and construction of the new Terminal 3/Boarding Area E and Data Center at SFO. PECI was responsible for all civil related aspects including SWPPP, erosion control, grading, utilities, surveying and construction administration.",
      services: ["Civil Engineering", "SWPPP Development", "Construction Management", "Surveying"],
      scope: "Complete civil engineering for new terminal boarding area and data center construction",
      agencies: ["San Francisco International Airport"]
    },
    {
      id: 3,
      title: "SF Unified School District - Prop A and B Bond Program",
      location: "San Francisco, CA",
      category: "education",
      date: "2007-Present",
      image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800",
      description: "Since 2007, PECI has been providing civil, environmental and surveying services to SFUSD as part of the Prop A and Prop B Bond Programs. Completed over 25 detailed surveys, civil grading plans for ADA access, and comprehensive stormwater treatment designs for 15 schools.",
      services: ["Civil Engineering", "Surveying", "SWPPP Design", "ADA Compliance"],
      scope: "25+ topographic surveys and civil designs for 15 elementary, middle, and high schools",
      agencies: ["San Francisco Unified School District", "California Regional Quality Control Board", "Department of the State Architect", "SF Fire Department", "SF DPW"]
    },
    {
      id: 4,
      title: "Bay Area Transit Hub",
      location: "San Francisco, CA",
      category: "infrastructure",
      date: "2023",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
      description: "Complete SWPPP implementation and structural inspection for major transit infrastructure project.",
      services: ["SWPPP Development", "Special Inspections", "Civil Engineering"],
      scope: "50,000 sq ft development with complex drainage systems and seismic requirements",
      agencies: ["Bay Area Rapid Transit", "SF Municipal Transportation Agency"]
    },
    {
      id: 5,
      title: "Residential Complex Development",
      location: "Oakland, CA",
      category: "residential",
      date: "2023",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
      description: "Multi-family residential development with comprehensive stormwater management and structural engineering.",
      services: ["SWPPP Services", "Construction Management", "Testing & Sampling"],
      scope: "250-unit residential complex with on-site detention and treatment systems"
    },
    {
      id: 6,
      title: "Commercial Office Tower",
      location: "San Jose, CA",
      category: "commercial",
      date: "2024",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
      description: "High-rise commercial development with advanced stormwater controls and structural inspections.",
      services: ["Structural Engineering", "Special Inspections", "SWPPP Implementation"],
      scope: "15-story office building with underground parking and rooftop BMP systems"
    },
    {
      id: 7,
      title: "Caltrans - Stormwater System Reconstruction & Emergency Infrastructure",
      location: "Northern California",
      category: "infrastructure",
      date: "2020-2022",
      image: "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=800",
      description: "PECI completed design and reconstruction of stormwater drainage basin along Highway 80 adjacent to American Canyon Blvd, plus emergency guardrail construction along Highway 780 and ADA access upgrades in Palo Alto.",
      services: ["SWPPP Development", "Design-Build Services", "Construction Management"],
      scope: "Multiple highway projects including drainage reconstruction, emergency guardrails, and ADA upgrades",
      agencies: ["California Transportation Department (Caltrans)"]
    },
    {
      id: 8,
      title: "Mixed-Use Development",
      location: "Berkeley, CA",
      category: "commercial",
      date: "2024",
      image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800",
      description: "Urban mixed-use development integrating retail, residential, and public spaces.",
      services: ["SWPPP Services", "Construction Services", "Inspections & Testing"],
      scope: "200,000 sq ft mixed-use with innovative green infrastructure solutions"
    }
  ];

  const categories = [
    { value: "all", label: "All Projects" },
    { value: "residential", label: "Residential" },
    { value: "commercial", label: "Commercial" },
    { value: "infrastructure", label: "Infrastructure" },
    { value: "education", label: "Education" }
  ];

  const normalizeProject = (p) => ({
    ...p,
    projectType: p.projectType || ({
      infrastructure: 'Infrastructure',
      commercial: 'Commercial',
      residential: 'Residential',
      education: 'Education',
      airport: 'Airport',
      municipal: 'Municipal'
    }[p.category] || 'Infrastructure'),
    servicesProvided: p.servicesProvided || p.services || []
  });
  const normalizedProjects = projects.map(normalizeProject);

  const servicesOptions = Array.from(new Set(normalizedProjects.flatMap(p => p.servicesProvided)));

  const filteredProjects = normalizedProjects.filter(p => {
    const typeOk = projectTypeFilter === 'all' || p.projectType === projectTypeFilter;
    const servicesOk = selectedServices.length === 0 || selectedServices.some(s => p.servicesProvided.includes(s));
    return typeOk && servicesOk;
  });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 px-6 bg-gradient-to-br from-blue-900 to-cyan-800 overflow-hidden">
        <div className="absolute inset-0 opacity-70">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600')] bg-cover bg-center" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h1 className="text-white mb-6 pt-40 text-5xl font-bold md:text-6xl">
            Project Gallery
          </h1>
          <p className="text-xl text-cyan-100 max-w-3xl mx-auto leading-relaxed">
            Explore our portfolio of successful projects across the Bay Area. From residential developments to major infrastructure, see how we deliver compliance and excellence.
          </p>
        </div>
      </section>

      {/* Filters */}
      <ScrollFadeSection>
        <section className="py-12 px-6 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto grid gap-6 md:grid-cols-3 items-start">
            <div>
              <div className="text-sm text-gray-600 mb-2">Project Type</div>
              <Select value={projectTypeFilter} onValueChange={setProjectTypeFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Residential">Residential</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Airport">Airport</SelectItem>
                  <SelectItem value="Municipal">Municipal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm text-gray-600 mb-2">Services Provided</div>
              <div className="flex flex-wrap gap-3">
                {servicesOptions.map(s => (
                  <label key={s} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white">
                    <Checkbox checked={selectedServices.includes(s)} onCheckedChange={(v)=>{
                      if (v) setSelectedServices(prev => [...prev, s]);
                      else setSelectedServices(prev => prev.filter(x=>x!==s));
                    }} />
                    <span className="text-sm text-gray-700">{s}</span>
                  </label>
                ))}
                {servicesOptions.length === 0 && (
                  <div className="text-gray-500 text-sm">No services listed.</div>
                )}
              </div>
              <div className="mt-3">
                <Button variant="outline" onClick={()=>{ setProjectTypeFilter('all'); setSelectedServices([]); }}>Clear Filters</Button>
              </div>
            </div>
          </div>
        </section>
      </ScrollFadeSection>

      {/* Projects Grid */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-blue-600">
                        {project.date}
                      </span>
                      <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-cyan-700">
                        {project.projectType || (project.category?.charAt(0).toUpperCase() + project.category?.slice(1))}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{project.location}</span>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(project.servicesProvided || project.services).slice(0, 2).map((service, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full"
                        >
                          {service}
                        </span>
                      ))}
                      {(project.servicesProvided || project.services).length > 2 && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                          +{(project.servicesProvided || project.services).length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </ScrollFadeSection>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Image Gallery */}
            {selectedProject.images && selectedProject.images.length > 1 ? (
              <div className="grid grid-cols-2 gap-0">
                {selectedProject.images.map((img, idx) => (
                  <div key={idx} className="relative h-72">
                    <img
                      src={img}
                      alt={`${selectedProject.title} - Image ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative h-96">
                <img
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors shadow-lg"
            >
              <X className="w-6 h-6 text-gray-800" />
            </button>
            
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-medium">
                  {selectedProject.date}
                </span>
                <span className="bg-cyan-100 text-cyan-700 px-4 py-1 rounded-full text-sm font-medium">
                  {selectedProject.projectType || (selectedProject.category?.charAt(0).toUpperCase() + selectedProject.category?.slice(1))}
                </span>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {selectedProject.title}
              </h2>
              
              <div className="flex items-center gap-2 text-gray-600 mb-6">
                <MapPin className="w-5 h-5" />
                <span className="text-lg">{selectedProject.location}</span>
              </div>
              
              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                {selectedProject.description}
              </p>
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Project Scope</h3>
                <p className="text-gray-700 leading-relaxed">{selectedProject.scope}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Services Provided</h3>
                <div className="flex flex-wrap gap-3">
                  {(selectedProject.servicesProvided || selectedProject.services).map((service, idx) => (
                    <span
                      key={idx}
                      className="bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 px-4 py-2 rounded-lg font-medium"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
              
              {selectedProject.agencies && selectedProject.agencies.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Agency Participation</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.agencies.map((agency, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                        <Building2 className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-700 font-medium">{agency}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Link to={createPageUrl("Contact")}>
                <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                  Start a Project Like This
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-cyan-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Start Your Project?
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Let's discuss how we can bring the same level of excellence and compliance to your construction project.
            </p>
            
            <Link to={createPageUrl("Contact")}>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg">
                Get in Touch
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </ScrollFadeSection>
    </div>
  );
}