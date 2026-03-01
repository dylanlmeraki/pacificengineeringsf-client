import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminRoute from "../components/internal/AdminRoute";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Phone,
  Mail,
  Building2,
  TrendingUp,
  Loader2,
  Calendar,
  Tag,
  FileText,
  Sparkles,
  Clock,
  CheckCircle,
  Target,
  Copy,
  Send
 } from "lucide-react";
import ContactDetailModal from "../components/crm/ContactDetailModal";
import ClientSegmentation from "../components/crm/ClientSegmentation";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function ContactManager() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedContact, setSelectedContact] = useState(null);
  const [segmentedContacts, setSegmentedContacts] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analyzing, setAnalyzing] = useState(null);
  const [analysis, setAnalysis] = useState({});
  const navigate = useNavigate();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list('-updated_date', 500),
    initialData: []
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.Activity.list('-created_date', 100),
    initialData: []
  });

  const formSubmissions = contacts.filter(c => 
    c.lead_source === 'Website Form' || 
    c.lead_source === 'Consultation Request'
  );

  const consultationRequests = formSubmissions.filter(c => c.lead_source === 'Consultation Request');
  const contactFormSubmissions = formSubmissions.filter(c => c.lead_source === 'Website Form');

  // Projects for Opportunities analysis
  const { data: projects = [] } = useQuery({
    queryKey: ['projects-for-contacts-opps'],
    queryFn: async () => await base44.entities.Project.list('-created_date', 100),
    initialData: []
  });

  const handleSegmentSelect = (contacts) => {
    setSegmentedContacts(contacts);
  };

  const baseContacts = segmentedContacts || contacts;

  const analyzeSubmission = async (submission) => {
    setAnalyzing(submission.id);
    try {
      const res = await base44.functions.invoke('analyzeContactInquiry', { contact_id: submission.id });
      setAnalysis(prev => ({ ...prev, [submission.id]: res.data.analysis || res.data.fallback }));
    } finally {
      setAnalyzing(null);
    }
  };

  const findOpportunities = async (clientEmail) => {
    setAnalyzing(clientEmail);
    try {
      const res = await base44.functions.invoke('identifySalesOpportunities', { client_email: clientEmail });
      setAnalysis(prev => ({ ...prev, [clientEmail]: res.data.analysis || res.data.fallback }));
    } finally {
      setAnalyzing(null);
    }
  };
  const filteredContacts = baseContacts.filter(contact => {
    const matchesSearch = 
      contact.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || contact.contact_type === typeFilter;
    const matchesStatus = statusFilter === "all" || contact.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: contacts.length,
    leads: contacts.filter(c => c.contact_type === "Lead").length,
    prospects: contacts.filter(c => c.contact_type === "Prospect").length,
    clients: contacts.filter(c => c.contact_type === "Client").length
  };

  const statusColors = {
    "New": "bg-blue-100 text-blue-700",
    "Contacted": "bg-cyan-100 text-cyan-700",
    "Qualified": "bg-green-100 text-green-700",
    "Proposal Sent": "bg-purple-100 text-purple-700",
    "Active Client": "bg-emerald-100 text-emerald-700",
    "Inactive": "bg-gray-100 text-gray-700",
    "Lost": "bg-red-100 text-red-700",
    "Do Not Contact": "bg-orange-100 text-orange-700"
  };

  const typeColors = {
    "Lead": "bg-blue-500",
    "Prospect": "bg-cyan-500",
    "Client": "bg-green-500",
    "Partner": "bg-purple-500",
    "Vendor": "bg-orange-500"
  };

  const leadSourceIcons = {
    "Website Form": Mail,
    "Consultation Request": Calendar,
    "Referral": Users,
    "Phone Call": Phone
  };

  const handleNewContact = () => {
    setSelectedContact(null);
    setShowModal(true);
  };

  const handleEditContact = (contact) => {
    setSelectedContact(contact);
    setShowModal(true);
  };

  const generateProposalMutation = useMutation({
    mutationFn: async (submission) => {
      const { data } = await base44.functions.invoke('generateProposal', {
        formData: submission,
        formType: submission.lead_source
      });
      return data;
    },
    onSuccess: async (data, submission) => {
      const proposal = await base44.entities.Proposal.create({
        title: data.proposal.title,
        content_html: data.proposal.content_html,
        proposal_number: data.proposal.proposal_number,
        status: 'draft',
        recipient_emails: [submission.email],
        fields_data: {
          service_interest: data.proposal.service_interest,
          project_type: data.proposal.project_type,
          client_name: data.proposal.client_name,
          client_company: data.proposal.client_company,
          locations_summary: data.proposal.locations_summary
        }
      });

      navigate(createPageUrl("ProposalManager"));
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    }
  });

  const handleGenerateProposal = async (submission) => {
    setSelectedSubmission(submission);
    setIsGenerating(true);
    
    try {
      await generateProposalMutation.mutateAsync(submission);
    } catch (error) {
      console.error('Error generating proposal:', error);
      alert('Failed to generate proposal. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AdminRoute>
      
        <div className="py-6 max-w-7xl mx-auto">
          {/* Client Segmentation */}
          <ClientSegmentation 
            contacts={contacts} 
            onSegmentSelect={handleSegmentSelect}
          />

          {/* Header */}
          <div className="mb-8 mt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Manager</h1>
                <p className="text-gray-600">
                  {segmentedContacts ? `Viewing ${filteredContacts.length} segmented contacts` : `Manage ${contacts.length} leads, prospects, and clients`}
                </p>
              </div>
              <Button onClick={handleNewContact} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Contact
              </Button>
            </div>

            {/* Form Submissions Stats */}
            {formSubmissions.length > 0 && (
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Form Submissions</p>
                      <p className="text-2xl font-bold text-gray-900">{formSubmissions.length}</p>
                    </div>
                    <FileText className="w-8 h-8 text-cyan-600" />
                  </div>
                </Card>
                <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Consultation Requests</p>
                      <p className="text-2xl font-bold text-gray-900">{consultationRequests.length}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-purple-600" />
                  </div>
                </Card>
                <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Contact Forms</p>
                      <p className="text-2xl font-bold text-gray-900">{contactFormSubmissions.length}</p>
                    </div>
                    <Mail className="w-8 h-8 text-blue-600" />
                  </div>
                </Card>
              </div>
            )}

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Contacts</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </Card>
              <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Leads</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.leads}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-cyan-600" />
                </div>
              </Card>
              <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Prospects</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.prospects}</p>
                  </div>
                  <Building2 className="w-8 h-8 text-purple-600" />
                </div>
              </Card>
              <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-green-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active Clients</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.clients}</p>
                  </div>
                  <Building2 className="w-8 h-8 text-green-600" />
                </div>
              </Card>
            </div>

            {/* Filters */}
            <Card className="p-4 border-0 shadow-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search contacts in this tab..."
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Lead">Leads</SelectItem>
                    <SelectItem value="Prospect">Prospects</SelectItem>
                    <SelectItem value="Client">Clients</SelectItem>
                    <SelectItem value="Partner">Partners</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Contacted">Contacted</SelectItem>
                    <SelectItem value="Qualified">Qualified</SelectItem>
                    <SelectItem value="Active Client">Active Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>
          </div>

          {/* Tabs for Contacts and Form Submissions */}
          <Tabs defaultValue="contacts" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="contacts">
                <Users className="w-4 h-4 mr-2" />
                All Contacts ({contacts.length})
              </TabsTrigger>
              <TabsTrigger value="submissions">
                <FileText className="w-4 h-4 mr-2" />
                Form Submissions ({formSubmissions.length})
              </TabsTrigger>
              <TabsTrigger value="opportunities">
                <TrendingUp className="w-4 h-4 mr-2" />
                Opportunities
              </TabsTrigger>
            </TabsList>

            <TabsContent value="contacts">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : filteredContacts.length === 0 ? (
                <Card className="p-12 text-center border-0 shadow-xl">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Contacts Found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery || typeFilter !== "all" || statusFilter !== "all"
                      ? "Try adjusting your filters"
                      : "Get started by adding your first contact"}
                  </p>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredContacts.map((contact) => {
                    const contactActivities = activities.filter(a => a.contact_id === contact.id);
                    const LeadIcon = leadSourceIcons[contact.lead_source] || Tag;
                    
                    return (
                      <Card
                        key={contact.id}
                        className="p-6 border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                        onClick={() => handleEditContact(contact)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className={`w-12 h-12 rounded-full ${typeColors[contact.contact_type]} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                              {contact.contact_name?.[0] || "?"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-bold text-gray-900 truncate">
                                  {contact.contact_name}
                                </h3>
                                <Badge className={statusColors[contact.status]}>
                                  {contact.status}
                                </Badge>
                              </div>
                              {contact.company_name && (
                                <p className="text-gray-600 mb-2 flex items-center gap-2">
                                  <Building2 className="w-4 h-4" />
                                  {contact.company_name}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                {contact.email && (
                                  <div className="flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    {contact.email}
                                  </div>
                                )}
                                {contact.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="w-4 h-4" />
                                    {contact.phone}
                                  </div>
                                )}
                                {contact.lead_source && (
                                  <div className="flex items-center gap-1">
                                    <LeadIcon className="w-4 h-4" />
                                    {contact.lead_source}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="outline" className="font-semibold">
                              {contact.contact_type}
                            </Badge>
                            {contactActivities.length > 0 && (
                              <span className="text-xs text-gray-500">
                                {contactActivities.length} {contactActivities.length === 1 ? 'activity' : 'activities'}
                              </span>
                            )}
                          </div>
                        </div>
                        {contact.services_interested?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {contact.services_interested.slice(0, 3).map((service, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                            {contact.services_interested.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{contact.services_interested.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="submissions">
              <Tabs defaultValue="consultation" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="consultation">
                    <FileText className="w-4 h-4 mr-2" />
                    Consultation Requests ({consultationRequests.length})
                  </TabsTrigger>
                  <TabsTrigger value="contact">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Forms ({contactFormSubmissions.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="consultation">
                  {consultationRequests.length === 0 ? (
                    <Card className="p-12 text-center border-0 shadow-lg">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Consultation Requests</h3>
                      <p className="text-gray-600">Submissions will appear here</p>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {consultationRequests.map((submission) => (
                        <Card key={submission.id} className="p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
                          <div className="flex justify-between items-start gap-6">
                            <div className="flex-1 space-y-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900">{submission.contact_name}</h3>
                                  {submission.company_name && (
                                    <p className="text-gray-600 flex items-center gap-2 mt-1">
                                      <Building2 className="w-4 h-4" />
                                      {submission.company_name}
                                    </p>
                                  )}
                                </div>
                                <Badge className="bg-blue-100 text-blue-800">
                                  {submission.status || 'New'}
                                </Badge>
                              </div>

                              <div className="grid md:grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2 text-gray-700">
                                  <Mail className="w-4 h-4 text-blue-600" />
                                  {submission.email}
                                </div>
                                {submission.phone && (
                                  <div className="flex items-center gap-2 text-gray-700">
                                    <Phone className="w-4 h-4 text-blue-600" />
                                    {submission.phone}
                                  </div>
                                )}
                                <div className="flex items-center gap-2 text-gray-700">
                                  <Clock className="w-4 h-4 text-blue-600" />
                                  {format(new Date(submission.created_date), 'MMM d, yyyy h:mm a')}
                                </div>
                              </div>

                              {submission.services_interested && submission.services_interested.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium text-gray-700 mb-2">Services Interested:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {submission.services_interested.map((service, idx) => (
                                      <Badge key={idx} variant="outline" className="bg-gray-50">
                                        {service}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {submission.notes && (
                                <div>
                                  <p className="text-sm font-medium text-gray-700 mb-1">Project Details:</p>
                                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    {submission.notes}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col gap-3">
                              <div className="flex gap-2">
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleGenerateProposal(submission);
                                  }}
                                  disabled={isGenerating && selectedSubmission?.id === submission.id}
                                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white whitespace-nowrap"
                                >
                                  {isGenerating && selectedSubmission?.id === submission.id ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Generating...
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="w-4 h-4 mr-2" />
                                      Generate Proposal
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={(e) => { e.stopPropagation(); analyzeSubmission(submission); }}
                                  disabled={analyzing === submission.id}
                                >
                                  {analyzing === submission.id ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</>
                                  ) : (
                                    <><Sparkles className="w-4 h-4 mr-2" />Analyze</>
                                  )}
                                </Button>
                              </div>

                              {analysis[submission.id] && (
                                <div className="space-y-3 border-t border-gray-200 pt-3">
                                  <div className="grid md:grid-cols-3 gap-3">
                                    <Card className="p-3 bg-green-50 border-0">
                                      <div className="text-xs text-gray-700">Sentiment</div>
                                      <div className="font-semibold">{analysis[submission.id].sentiment?.type || 'N/A'}</div>
                                    </Card>
                                    <Card className="p-3 bg-red-50 border-0">
                                      <div className="text-xs text-gray-700">Urgency</div>
                                      <div className="font-semibold">{analysis[submission.id].urgency || 'N/A'}</div>
                                    </Card>
                                    <Card className="p-3 bg-blue-50 border-0">
                                      <div className="text-xs text-gray-700">Services</div>
                                      <div className="text-sm">{analysis[submission.id].recommended_services?.length || 0} recommended</div>
                                    </Card>
                                  </div>

                                  {analysis[submission.id].follow_up_email && (
                                    <Card className="p-3 bg-purple-50 border-2 border-purple-200">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="font-semibold flex items-center gap-2"><Send className="w-4 h-4"/>AI-Generated Follow-up</div>
                                        <Button size="sm" variant="outline" onClick={() => {
                                          const fe = analysis[submission.id].follow_up_email;
                                          navigator.clipboard.writeText(`Subject: ${fe.subject}\n\n${fe.body}`);
                                        }}>
                                          <Copy className="w-3 h-3 mr-1"/>Copy
                                        </Button>
                                      </div>
                                      <div className="text-sm"><span className="font-medium">Subject:</span> {analysis[submission.id].follow_up_email.subject}</div>
                                      <div className="text-sm whitespace-pre-wrap mt-1">{analysis[submission.id].follow_up_email.body}</div>
                                    </Card>
                                  )}

                                  {analysis[submission.id].next_steps?.length > 0 && (
                                    <div>
                                      <div className="font-semibold mb-1">Next Steps</div>
                                      <ul className="list-disc ml-5 text-sm space-y-1">
                                        {analysis[submission.id].next_steps.map((s, i) => <li key={i}>{s}</li>)}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="contact">
                  {contactFormSubmissions.length === 0 ? (
                    <Card className="p-12 text-center border-0 shadow-lg">
                      <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Contact Forms</h3>
                      <p className="text-gray-600">Submissions will appear here</p>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {contactFormSubmissions.map((submission) => (
                        <Card key={submission.id} className="p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
                          <div className="flex justify-between items-start gap-6">
                            <div className="flex-1 space-y-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900">{submission.contact_name}</h3>
                                  {submission.company_name && (
                                    <p className="text-gray-600 flex items-center gap-2 mt-1">
                                      <Building2 className="w-4 h-4" />
                                      {submission.company_name}
                                    </p>
                                  )}
                                </div>
                                <Badge className="bg-blue-100 text-blue-800">
                                  {submission.status || 'New'}
                                </Badge>
                              </div>

                              <div className="grid md:grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2 text-gray-700">
                                  <Mail className="w-4 h-4 text-blue-600" />
                                  {submission.email}
                                </div>
                                {submission.phone && (
                                  <div className="flex items-center gap-2 text-gray-700">
                                    <Phone className="w-4 h-4 text-blue-600" />
                                    {submission.phone}
                                  </div>
                                )}
                                <div className="flex items-center gap-2 text-gray-700">
                                  <Clock className="w-4 h-4 text-blue-600" />
                                  {format(new Date(submission.created_date), 'MMM d, yyyy h:mm a')}
                                </div>
                              </div>

                              {submission.services_interested && submission.services_interested.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium text-gray-700 mb-2">Services Interested:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {submission.services_interested.map((service, idx) => (
                                      <Badge key={idx} variant="outline" className="bg-gray-50">
                                        {service}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {submission.notes && (
                                <div>
                                  <p className="text-sm font-medium text-gray-700 mb-1">Project Details:</p>
                                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    {submission.notes}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col gap-3">
                              <div className="flex gap-2">
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleGenerateProposal(submission);
                                  }}
                                  disabled={isGenerating && selectedSubmission?.id === submission.id}
                                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white whitespace-nowrap"
                                >
                                  {isGenerating && selectedSubmission?.id === submission.id ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Generating...
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="w-4 h-4 mr-2" />
                                      Generate Proposal
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={(e) => { e.stopPropagation(); analyzeSubmission(submission); }}
                                  disabled={analyzing === submission.id}
                                >
                                  {analyzing === submission.id ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</>
                                  ) : (
                                    <><Sparkles className="w-4 h-4 mr-2" />Analyze</>
                                  )}
                                </Button>
                              </div>

                              {analysis[submission.id] && (
                                <div className="space-y-3 border-t border-gray-200 pt-3">
                                  <div className="grid md:grid-cols-3 gap-3">
                                    <Card className="p-3 bg-green-50 border-0">
                                      <div className="text-xs text-gray-700">Sentiment</div>
                                      <div className="font-semibold">{analysis[submission.id].sentiment?.type || 'N/A'}</div>
                                    </Card>
                                    <Card className="p-3 bg-red-50 border-0">
                                      <div className="text-xs text-gray-700">Urgency</div>
                                      <div className="font-semibold">{analysis[submission.id].urgency || 'N/A'}</div>
                                    </Card>
                                    <Card className="p-3 bg-blue-50 border-0">
                                      <div className="text-xs text-gray-700">Services</div>
                                      <div className="text-sm">{analysis[submission.id].recommended_services?.length || 0} recommended</div>
                                    </Card>
                                  </div>

                                  {analysis[submission.id].follow_up_email && (
                                    <Card className="p-3 bg-purple-50 border-2 border-purple-200">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="font-semibold flex items-center gap-2"><Send className="w-4 h-4"/>AI-Generated Follow-up</div>
                                        <Button size="sm" variant="outline" onClick={() => {
                                          const fe = analysis[submission.id].follow_up_email;
                                          navigator.clipboard.writeText(`Subject: ${fe.subject}\n\n${fe.body}`);
                                        }}>
                                          <Copy className="w-3 h-3 mr-1"/>Copy
                                        </Button>
                                      </div>
                                      <div className="text-sm"><span className="font-medium">Subject:</span> {analysis[submission.id].follow_up_email.subject}</div>
                                      <div className="text-sm whitespace-pre-wrap mt-1">{analysis[submission.id].follow_up_email.body}</div>
                                    </Card>
                                  )}

                                  {analysis[submission.id].next_steps?.length > 0 && (
                                    <div>
                                      <div className="font-semibold mb-1">Next Steps</div>
                                      <ul className="list-disc ml-5 text-sm space-y-1">
                                        {analysis[submission.id].next_steps.map((s, i) => <li key={i}>{s}</li>)}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Opportunities Tab */}
                <TabsContent value="opportunities">
                  <div className="space-y-4">
                    {projects.length === 0 ? (
                      <Card className="p-12 text-center border-0 shadow-lg">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects</h3>
                        <p className="text-gray-600">Projects will appear here for opportunity analysis</p>
                      </Card>
                    ) : (
                      Object.entries(
                        projects.reduce((acc, proj) => {
                          if (!acc[proj.client_email]) {
                            acc[proj.client_email] = { email: proj.client_email, name: proj.client_name, projects: [] };
                          }
                          acc[proj.client_email].projects.push(proj);
                          return acc;
                        }, {})
                      ).map(([email, client]) => (
                        <Card key={email} className="p-6 border-0 shadow-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">{client.name}</h3>
                              <p className="text-gray-600">{email}</p>
                            </div>
                            <Button onClick={() => findOpportunities(email)} disabled={analyzing === email} className="bg-gradient-to-r from-purple-600 to-blue-600">
                              {analyzing === email ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Analyzing...</>) : (<><Target className="w-4 h-4 mr-2"/>Find Opportunities</>)}
                            </Button>
                          </div>

                          {analysis[email] && (
                            <div className="space-y-3 border-t border-gray-200 pt-3">
                              {analysis[email].opportunities?.length > 0 && (
                                <div className="space-y-2">
                                  <div className="font-semibold">Identified Opportunities ({analysis[email].opportunities.length})</div>
                                  {analysis[email].opportunities.map((opp, idx) => (
                                    <Card key={idx} className={`p-3 ${opp.priority === 'high' ? 'bg-red-50 border-red-200' : opp.priority === 'medium' ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
                                      <div className="flex items-start justify-between mb-1">
                                        <div className="font-semibold">{opp.service}</div>
                                        <Badge className={opp.priority === 'high' ? 'bg-red-600' : opp.priority === 'medium' ? 'bg-yellow-600' : 'bg-green-600'}>{opp.priority} priority</Badge>
                                      </div>
                                      <div className="text-sm text-gray-700 mb-1">{opp.reasoning}</div>
                                      {opp.suggested_action && <div className="text-sm font-semibold">Action: {opp.suggested_action}</div>}
                                      {opp.estimated_value && <div className="text-sm text-gray-600">Est. Value: {opp.estimated_value}</div>}
                                    </Card>
                                  ))}
                                </div>
                              )}
                              {analysis[email].engagement_strategy && (
                                <Card className="p-3 bg-blue-50 border-blue-200">
                                  <div className="font-semibold mb-1">Engagement Strategy</div>
                                  <div className="text-sm text-gray-800">{analysis[email].engagement_strategy}</div>
                                </Card>
                              )}
                            </div>
                          )}
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </div>

        {showModal && (
          <ContactDetailModal
            contact={selectedContact}
            onClose={() => {
              setShowModal(false);
              setSelectedContact(null);
            }}
          />
        )}
      
    </AdminRoute>
  );
}