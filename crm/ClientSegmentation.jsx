import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Briefcase, TrendingUp, DollarSign, Filter } from "lucide-react";

export default function ClientSegmentation({ contacts = [], onSegmentSelect }) {
  const [selectedSegment, setSelectedSegment] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");

  // Categorize clients
  const segments = {
    hot_leads: contacts.filter(c => 
      c.contact_type === 'Lead' && 
      c.status === 'Qualified' && 
      c.last_contact_date &&
      (new Date() - new Date(c.last_contact_date)) / (1000 * 60 * 60 * 24) <= 7
    ),
    active_clients: contacts.filter(c => 
      c.contact_type === 'Client' && 
      c.converted_to_project
    ),
    inactive_clients: contacts.filter(c => 
      c.contact_type === 'Client' && 
      c.last_contact_date &&
      (new Date() - new Date(c.last_contact_date)) / (1000 * 60 * 60 * 24) > 90
    ),
    high_value: contacts.filter(c => 
      c.estimated_value && c.estimated_value >= 50000
    ),
    swppp_clients: contacts.filter(c => 
      c.services_interested?.includes('swppp')
    ),
    construction_clients: contacts.filter(c => 
      c.services_interested?.includes('construction')
    ),
    inspection_clients: contacts.filter(c => 
      c.services_interested?.includes('inspections-testing')
    ),
    multi_service: contacts.filter(c => 
      c.services_interested?.length > 1
    )
  };

  const getFilteredContacts = () => {
    let filtered = contacts;

    if (selectedSegment !== "all") {
      filtered = segments[selectedSegment] || [];
    }

    if (serviceFilter !== "all") {
      filtered = filtered.filter(c => 
        c.services_interested?.includes(serviceFilter)
      );
    }

    return filtered;
  };

  const handleSegmentClick = (segment) => {
    setSelectedSegment(segment);
    if (onSegmentSelect) {
      onSegmentSelect(getFilteredContacts());
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <Card 
          className={`p-4 cursor-pointer transition-all hover:shadow-lg ${selectedSegment === 'hot_leads' ? 'ring-2 ring-red-500' : ''}`}
          onClick={() => handleSegmentClick('hot_leads')}
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-red-500" />
            <Badge className="bg-red-100 text-red-700">{segments.hot_leads.length}</Badge>
          </div>
          <h3 className="font-bold text-gray-900">Hot Leads</h3>
          <p className="text-sm text-gray-600">Active in last 7 days</p>
        </Card>

        <Card 
          className={`p-4 cursor-pointer transition-all hover:shadow-lg ${selectedSegment === 'active_clients' ? 'ring-2 ring-green-500' : ''}`}
          onClick={() => handleSegmentClick('active_clients')}
        >
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-green-500" />
            <Badge className="bg-green-100 text-green-700">{segments.active_clients.length}</Badge>
          </div>
          <h3 className="font-bold text-gray-900">Active Clients</h3>
          <p className="text-sm text-gray-600">With projects</p>
        </Card>

        <Card 
          className={`p-4 cursor-pointer transition-all hover:shadow-lg ${selectedSegment === 'high_value' ? 'ring-2 ring-purple-500' : ''}`}
          onClick={() => handleSegmentClick('high_value')}
        >
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-purple-500" />
            <Badge className="bg-purple-100 text-purple-700">{segments.high_value.length}</Badge>
          </div>
          <h3 className="font-bold text-gray-900">High Value</h3>
          <p className="text-sm text-gray-600">$50K+ potential</p>
        </Card>

        <Card 
          className={`p-4 cursor-pointer transition-all hover:shadow-lg ${selectedSegment === 'multi_service' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => handleSegmentClick('multi_service')}
        >
          <div className="flex items-center justify-between mb-2">
            <Briefcase className="w-8 h-8 text-blue-500" />
            <Badge className="bg-blue-100 text-blue-700">{segments.multi_service.length}</Badge>
          </div>
          <h3 className="font-bold text-gray-900">Multi-Service</h3>
          <p className="text-sm text-gray-600">Multiple interests</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <div className="flex-1 flex gap-4">
            <Select value={selectedSegment} onValueChange={handleSegmentClick}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Segments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Contacts</SelectItem>
                <SelectItem value="hot_leads">Hot Leads</SelectItem>
                <SelectItem value="active_clients">Active Clients</SelectItem>
                <SelectItem value="inactive_clients">Inactive Clients</SelectItem>
                <SelectItem value="high_value">High Value</SelectItem>
                <SelectItem value="swppp_clients">SWPPP Clients</SelectItem>
                <SelectItem value="construction_clients">Construction Clients</SelectItem>
                <SelectItem value="inspection_clients">Inspection Clients</SelectItem>
                <SelectItem value="multi_service">Multi-Service</SelectItem>
              </SelectContent>
            </Select>

            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Services" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="swppp">SWPPP</SelectItem>
                <SelectItem value="construction">Construction</SelectItem>
                <SelectItem value="inspections-testing">Inspections & Testing</SelectItem>
                <SelectItem value="special-inspections">Special Inspections</SelectItem>
                <SelectItem value="structural-engineering">Engineering</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-gray-600">
            {getFilteredContacts().length} contacts
          </div>
        </div>
      </Card>
    </div>
  );
}