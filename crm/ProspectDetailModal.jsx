import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  X,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Tag,
  Calendar,
  TrendingUp,
  MessageSquare,
  PhoneCall,
  Video,
  FileText,
  Plus,
  Clock,
  CheckCircle,
  Target,
  DollarSign,
  Percent,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { calculateLeadScore } from "@/components/utils/calculateLeadScore";
import MeetingScheduler from "./MeetingScheduler";
import { startOutreachSequence } from "@/functions/startOutreachSequence";
import { suggestProspectActions } from "@/functions/suggestProspectActions";

export default function ProspectDetailModal({ prospect, onClose }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("details");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(prospect);
  const [showMeetingScheduler, setShowMeetingScheduler] = useState(false);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [enrollSeqId, setEnrollSeqId] = useState("");
  const [enrollDomain, setEnrollDomain] = useState("");
  const [enrollSplit, setEnrollSplit] = useState(50);
  const [enrollDynamic, setEnrollDynamic] = useState(false);
  const [aiRecLoading, setAiRecLoading] = useState(false);
  const [aiRec, setAiRec] = useState(null);

  // Load AI recommendation for this prospect
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setAiRecLoading(true);
        const { data } = await suggestProspectActions({ prospect_id: prospect.id });
        const rec = (data?.recommendations || []).find(r => r.prospect_id === prospect.id);
        if (mounted) setAiRec(rec || null);
      } finally {
        if (mounted) setAiRecLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [prospect.id]);
  
  // Fetch sequences for enrollment
  const { data: sequences = [] } = useQuery({
    queryKey: ['email-sequences'],
    queryFn: () => base44.entities.EmailSequence.list('-updated_date', 100),
    initialData: []
  });

  // Fetch interactions and outreach
  const { data: interactions = [] } = useQuery({
    queryKey: ['interactions', prospect.id],
    queryFn: () => base44.entities.Interaction.list('-interaction_date', 100).then(data => 
      data.filter(i => i.prospect_id === prospect.id)
    )
  });
  
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', prospect.id],
    queryFn: () => base44.entities.Task.list('-due_date', 100).then(data => 
      data.filter(t => t.prospect_id === prospect.id)
    )
  });
  
  const { data: outreach = [] } = useQuery({
    queryKey: ['outreach', prospect.id],
    queryFn: () => base44.entities.SalesOutreach.list('-sent_date', 100).then(data => 
      data.filter(o => o.prospect_id === prospect.id)
    )
  });

  // Calculate scores
  const scores = calculateLeadScore({ prospect: formData, interactions, outreach });

  // New interaction form
  const [newInteraction, setNewInteraction] = useState({
    interaction_type: "Note",
    content: "",
    outcome: "Neutral",
    sentiment: "Neutral"
  });

  // New task form
  const [newTask, setNewTask] = useState({
    task_type: "Follow-up Email",
    title: "",
    description: "",
    priority: "Medium",
    due_date: ""
  });

  const updateProspectMutation = useMutation({
    mutationFn: (data) => base44.entities.Prospect.update(prospect.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospects'] });
      setEditMode(false);
    }
  });

  const addInteractionMutation = useMutation({
    mutationFn: (data) => base44.entities.Interaction.create({
      ...data,
      prospect_id: prospect.id,
      prospect_name: prospect.contact_name,
      company_name: prospect.company_name,
      interaction_date: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
      setNewInteraction({ interaction_type: "Note", content: "", outcome: "Neutral", sentiment: "Neutral" });
    }
  });

  const addTaskMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create({
      ...data,
      prospect_id: prospect.id,
      prospect_name: prospect.contact_name,
      company_name: prospect.company_name,
      status: "Pending"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setNewTask({ task_type: "Follow-up Email", title: "", description: "", priority: "Medium", due_date: "" });
    }
  });

  const handleSave = () => {
    updateProspectMutation.mutate({
      ...formData,
      ...scores
    });
  };

  const interactionTypeIcons = {
    "Email Sent": Mail,
    "Email Received": Mail,
    "Call Outbound": PhoneCall,
    "Call Inbound": PhoneCall,
    "Meeting": Video,
    "Note": MessageSquare,
    "Proposal": FileText
  };

  const priorityColors = {
    "Urgent": "bg-red-100 text-red-700 border-red-300",
    "High": "bg-orange-100 text-orange-700 border-orange-300",
    "Medium": "bg-yellow-100 text-yellow-700 border-yellow-300",
    "Low": "bg-blue-100 text-blue-700 border-blue-300"
  };

  if (showMeetingScheduler) {
    return (
      <MeetingScheduler
        prospect={prospect}
        onClose={() => setShowMeetingScheduler(false)}
        onSuccess={() => {
          setShowMeetingScheduler(false);
          queryClient.invalidateQueries({ queryKey: ['interactions'] });
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">{prospect.contact_name}</h2>
              <p className="text-blue-100 text-lg">{prospect.contact_title} at {prospect.company_name}</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowMeetingScheduler(true)}
                className="bg-white/20 hover:bg-white/30 backdrop-blur text-white border-white/30"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Meeting
              </Button>
              <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          {/* Quick Enroll in Sequence */}
          <div className="mb-4 flex items-center gap-2">
            <Button variant="outline" className="bg-white/20 text-white border-white/30" onClick={()=>setEnrollOpen(!enrollOpen)}>
              {enrollOpen ? 'Close Enrollment' : 'Enroll in Sequence'}
            </Button>
          </div>
          {enrollOpen && (
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-4 grid md:grid-cols-6 gap-2">
              <Select value={enrollSeqId} onValueChange={setEnrollSeqId}>
                <SelectTrigger className="md:col-span-2 bg-white/90 text-gray-900"><SelectValue placeholder="Choose sequence" /></SelectTrigger>
                <SelectContent>
                  {sequences.map(s => (<SelectItem key={s.id} value={s.id}>{s.sequence_name}</SelectItem>))}
                </SelectContent>
              </Select>
              <Input className="md:col-span-2 bg-white/90" placeholder="Tracking domain" value={enrollDomain} onChange={e=>setEnrollDomain(e.target.value)} />
              <Input className="md:col-span-1 bg-white/90" type="number" placeholder="A%" value={enrollSplit} onChange={e=>setEnrollSplit(Number(e.target.value))} />
              <div className="md:col-span-1 flex items-center gap-2">
                <input type="checkbox" checked={enrollDynamic} onChange={e=>setEnrollDynamic(e.target.checked)} />
                <span className="text-white text-sm">Dynamic</span>
              </div>
              <div className="md:col-span-6 flex justify-end">
                <Button onClick={async ()=>{
                  const seq = sequences.find(s=>s.id===enrollSeqId);
                  if (!seq) return;
                  await startOutreachSequence({ sequence_id: enrollSeqId, prospect_ids: [prospect.id], tracking_domain: enrollDomain || seq.default_tracking_domain, ab_metric: seq.ab_metric || 'opens', ab_split_percent: enrollSplit, dynamic_delay_enabled: enrollDynamic });
                  setEnrollOpen(false);
                }}>Enroll</Button>
              </div>
            </div>
          )}

          {/* AI Prospect Recommendation */}
          <div className="mb-4 bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white/80 text-sm">AI Recommendation</div>
                {aiRecLoading ? (
                  <div className="text-white text-sm">Analyzing…</div>
                ) : aiRec ? (
                  <div className="text-white text-sm mt-1">
                    Suggested action: <span className="font-semibold">{aiRec.recommendation.action}</span>
                    {aiRec.recommendation.sequence_id && (
                      <> for sequence <span className="font-mono">{aiRec.recommendation.sequence_id}</span></>
                    )}
                    {aiRec.recommendation.reason && <div className="text-white/70 mt-1">{aiRec.recommendation.reason}</div>}
                  </div>
                ) : (
                  <div className="text-white text-sm">No recommendation at this time.</div>
                )}
              </div>
              <div className="flex gap-2">
                {aiRec?.recommendation?.action === 'enroll' && (
                  <Button variant="outline" className="bg-white/20 text-white border-white/30" onClick={async ()=>{
                    const seqId = aiRec.recommendation.sequence_id;
                    if (!seqId) return;
                    await startOutreachSequence({ sequence_id: seqId, prospect_ids: [prospect.id] });
                    setEnrollOpen(false);
                  }}>Enroll Now</Button>
                )}
                {aiRec?.recommendation?.action === 'pause' && (
                  <Button variant="outline" className="bg-white/20 text-white border-white/30" onClick={async ()=>{
                    const active = await base44.entities.OutreachSequenceRun.filter({ prospect_id: prospect.id, status: 'active' }, '-updated_date', 50);
                    for (const run of active) { await base44.entities.OutreachSequenceRun.update(run.id, { status: 'paused' }); }
                  }}>Pause Sequence</Button>
                )}
                {aiRec?.recommendation?.action === 'remove' && (
                  <Button variant="outline" className="bg-white/20 text-white border-white/30" onClick={async ()=>{
                    const active = await base44.entities.OutreachSequenceRun.filter({ prospect_id: prospect.id, status: 'active' }, '-updated_date', 50);
                    for (const run of active) { await base44.entities.OutreachSequenceRun.update(run.id, { status: 'completed' }); }
                  }}>Stop Automation</Button>
                )}
                <Button variant="ghost" onClick={async ()=>{
                  const { data } = await suggestProspectActions({ prospect_id: prospect.id });
                  const rec = (data?.recommendations || []).find(r => r.prospect_id === prospect.id);
                  setAiRec(rec || null);
                }}>Re-run</Button>
              </div>
            </div>
          </div>

          {/* Score Overview */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-3">
              <p className="text-blue-100 text-xs mb-1">Overall Score</p>
              <p className="text-3xl font-bold">{scores.prospect_score}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3">
              <p className="text-blue-100 text-xs mb-1">Fit Score</p>
              <p className="text-3xl font-bold">{scores.fit_score}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3">
              <p className="text-blue-100 text-xs mb-1">Engagement</p>
              <p className="text-3xl font-bold">{scores.engagement_score}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3">
              <p className="text-blue-100 text-xs mb-1">Segment</p>
              <p className="text-lg font-bold">{scores.segment}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-6">
            {["details", "interactions", "tasks"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(90vh - 280px)" }}>
          {/* DETAILS TAB */}
          {activeTab === "details" && (
            <div className="space-y-6">
              {!editMode ? (
                <>
                  <div className="flex justify-end">
                    <Button onClick={() => setEditMode(true)}>Edit Details</Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-6">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        Company Information
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div><span className="text-gray-600">Type:</span> <span className="font-medium">{prospect.company_type}</span></div>
                        <div><span className="text-gray-600">Location:</span> <span className="font-medium">{prospect.company_location}</span></div>
                        <div><span className="text-gray-600">Size:</span> <span className="font-medium">{prospect.company_size || "Unknown"}</span></div>
                        <div><span className="text-gray-600">Revenue:</span> <span className="font-medium">{prospect.annual_revenue || "Unknown"}</span></div>
                        {prospect.company_website && (
                          <div><span className="text-gray-600">Website:</span> <a href={prospect.company_website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{prospect.company_website}</a></div>
                        )}
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-cyan-600" />
                        Contact Information
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <a href={`mailto:${prospect.contact_email}`} className="text-blue-600 hover:underline">{prospect.contact_email}</a>
                        </div>
                        {prospect.contact_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <a href={`tel:${prospect.contact_phone}`} className="text-blue-600 hover:underline">{prospect.contact_phone}</a>
                          </div>
                        )}
                        {prospect.linkedin_url && (
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-gray-400" />
                            <a href={prospect.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">LinkedIn Profile</a>
                          </div>
                        )}
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        Deal Information
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div><span className="text-gray-600">Status:</span> <Badge>{prospect.status}</Badge></div>
                        <div><span className="text-gray-600">Deal Stage:</span> <span className="font-medium">{prospect.deal_stage || "Discovery"}</span></div>
                        <div><span className="text-gray-600">Deal Value:</span> <span className="font-medium">${prospect.deal_value?.toLocaleString() || "TBD"}</span></div>
                        <div><span className="text-gray-600">Win Probability:</span> <span className="font-medium">{scores.probability}%</span></div>
                        <div><span className="text-gray-600">Assigned To:</span> <span className="font-medium">{prospect.assigned_to || "Unassigned"}</span></div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Tag className="w-5 h-5 text-purple-600" />
                        Segmentation
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div><span className="text-gray-600">Segment:</span> <Badge className="ml-2">{scores.segment}</Badge></div>
                        <div><span className="text-gray-600">Lead Source:</span> <span className="font-medium">{prospect.lead_source}</span></div>
                        {prospect.tags && prospect.tags.length > 0 && (
                          <div>
                            <span className="text-gray-600">Tags:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {prospect.tags.map((tag, idx) => (
                                <Badge key={idx} variant="outline">{tag}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {prospect.services_interested && prospect.services_interested.length > 0 && (
                          <div>
                            <span className="text-gray-600">Interested In:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {prospect.services_interested.map((service, idx) => (
                                <Badge key={idx} className="bg-blue-100 text-blue-700">{service}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>

                  {prospect.notes && (
                    <Card className="p-6">
                      <h3 className="font-bold text-gray-900 mb-3">Notes</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{prospect.notes}</p>
                    </Card>
                  )}

                  {prospect.uploaded_documents && prospect.uploaded_documents.length > 0 && (
                    <Card className="p-6">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Uploaded Documents ({prospect.uploaded_documents.length})
                      </h3>
                      <div className="space-y-2">
                        {prospect.uploaded_documents.map((doc, idx) => (
                          <a
                            key={idx}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                          >
                            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            <span className="text-gray-900 font-medium">{doc.name}</span>
                          </a>
                        ))}
                      </div>
                    </Card>
                  )}
                </>
              ) : (
                <>
                  {/* Edit Form */}
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Contacted">Contacted</SelectItem>
                            <SelectItem value="Engaged">Engaged</SelectItem>
                            <SelectItem value="Qualified">Qualified</SelectItem>
                            <SelectItem value="Meeting Scheduled">Meeting Scheduled</SelectItem>
                            <SelectItem value="Proposal Sent">Proposal Sent</SelectItem>
                            <SelectItem value="Negotiation">Negotiation</SelectItem>
                            <SelectItem value="Won">Won</SelectItem>
                            <SelectItem value="Lost">Lost</SelectItem>
                            <SelectItem value="Nurture">Nurture</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deal Value</label>
                        <Input type="number" value={formData.deal_value || ""} onChange={(e) => setFormData({...formData, deal_value: parseFloat(e.target.value)})} placeholder="50000" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                        <Select value={formData.company_size} onValueChange={(value) => setFormData({...formData, company_size: value})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-10">1-10</SelectItem>
                            <SelectItem value="11-50">11-50</SelectItem>
                            <SelectItem value="51-200">51-200</SelectItem>
                            <SelectItem value="201-500">201-500</SelectItem>
                            <SelectItem value="500+">500+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Annual Revenue</label>
                        <Select value={formData.annual_revenue} onValueChange={(value) => setFormData({...formData, annual_revenue: value})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Under $1M">Under $1M</SelectItem>
                            <SelectItem value="$1M-$5M">$1M-$5M</SelectItem>
                            <SelectItem value="$5M-$10M">$5M-$10M</SelectItem>
                            <SelectItem value="$10M-$50M">$10M-$50M</SelectItem>
                            <SelectItem value="$50M+">$50M+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                        <Input value={formData.contact_phone || ""} onChange={(e) => setFormData({...formData, contact_phone: e.target.value})} placeholder="(415) 123-4567" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                        <Input value={formData.assigned_to || ""} onChange={(e) => setFormData({...formData, assigned_to: e.target.value})} placeholder="Dylan Lee" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <Textarea value={formData.notes || ""} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={4} />
                    </div>

                    <div className="flex gap-3 justify-end">
                      <Button variant="outline" onClick={() => {
                        setEditMode(false);
                        setFormData(prospect);
                      }}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={updateProspectMutation.isPending}>
                        {updateProspectMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* INTERACTIONS TAB */}
          {activeTab === "interactions" && (
            <div className="space-y-6">
              {/* Add Interaction */}
              <Card className="p-6 bg-blue-50 border-blue-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" />
                  Log New Interaction
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Select value={newInteraction.interaction_type} onValueChange={(value) => setNewInteraction({...newInteraction, interaction_type: value})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Email Sent">Email Sent</SelectItem>
                      <SelectItem value="Email Received">Email Received</SelectItem>
                      <SelectItem value="Call Outbound">Call Outbound</SelectItem>
                      <SelectItem value="Call Inbound">Call Inbound</SelectItem>
                      <SelectItem value="Meeting">Meeting</SelectItem>
                      <SelectItem value="Note">Note</SelectItem>
                      <SelectItem value="Demo">Demo</SelectItem>
                      <SelectItem value="Proposal">Proposal</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={newInteraction.outcome} onValueChange={(value) => setNewInteraction({...newInteraction, outcome: value})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Positive">Positive</SelectItem>
                      <SelectItem value="Neutral">Neutral</SelectItem>
                      <SelectItem value="Negative">Negative</SelectItem>
                      <SelectItem value="Follow-up Needed">Follow-up Needed</SelectItem>
                      <SelectItem value="Meeting Scheduled">Meeting Scheduled</SelectItem>
                      <SelectItem value="Proposal Requested">Proposal Requested</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Textarea 
                  className="mt-4" 
                  value={newInteraction.content} 
                  onChange={(e) => setNewInteraction({...newInteraction, content: e.target.value})} 
                  placeholder="What happened? What was discussed?" 
                  rows={3}
                />
                
                <Button 
                  className="mt-4" 
                  onClick={() => addInteractionMutation.mutate(newInteraction)}
                  disabled={!newInteraction.content || addInteractionMutation.isPending}
                >
                  {addInteractionMutation.isPending ? "Logging..." : "Log Interaction"}
                </Button>
              </Card>

              {/* Timeline */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-lg">Interaction History</h3>
                {interactions.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No interactions logged yet.</p>
                ) : (
                  interactions.map((interaction) => {
                    const Icon = interactionTypeIcons[interaction.interaction_type] || MessageSquare;
                    return (
                      <Card key={interaction.id} className="p-4 border-l-4 border-blue-500">
                        <div className="flex items-start gap-4">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <Icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">{interaction.interaction_type}</h4>
                              <span className="text-xs text-gray-500">
                                {new Date(interaction.interaction_date).toLocaleString()}
                              </span>
                            </div>
                            {interaction.subject && (
                              <p className="text-sm font-medium text-gray-700 mb-1">{interaction.subject}</p>
                            )}
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{interaction.content}</p>
                            <div className="flex gap-2 mt-3">
                              {interaction.outcome && (
                                <Badge variant="outline">{interaction.outcome}</Badge>
                              )}
                              {interaction.sentiment && interaction.sentiment !== "Neutral" && (
                                <Badge className={
                                  interaction.sentiment === "Very Positive" || interaction.sentiment === "Positive" 
                                    ? "bg-green-100 text-green-700" 
                                    : "bg-red-100 text-red-700"
                                }>
                                  {interaction.sentiment}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TASKS TAB */}
          {activeTab === "tasks" && (
            <div className="space-y-6">
              {/* Add Task */}
              <Card className="p-6 bg-green-50 border-green-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-600" />
                  Create New Task
                </h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Select value={newTask.task_type} onValueChange={(value) => setNewTask({...newTask, task_type: value})}>
                      <SelectTrigger><SelectValue placeholder="Task Type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Follow-up Email">Follow-up Email</SelectItem>
                        <SelectItem value="Follow-up Call">Follow-up Call</SelectItem>
                        <SelectItem value="Send Proposal">Send Proposal</SelectItem>
                        <SelectItem value="Schedule Meeting">Schedule Meeting</SelectItem>
                        <SelectItem value="Research">Research</SelectItem>
                        <SelectItem value="Demo">Demo</SelectItem>
                        <SelectItem value="Check-in">Check-in</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={newTask.priority} onValueChange={(value) => setNewTask({...newTask, priority: value})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Input 
                    value={newTask.title} 
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})} 
                    placeholder="Task title"
                  />
                  
                  <Textarea 
                    value={newTask.description} 
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})} 
                    placeholder="Task description" 
                    rows={2}
                  />

                  <Input 
                    type="datetime-local" 
                    value={newTask.due_date} 
                    onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                  />
                  
                  <Button 
                    onClick={() => addTaskMutation.mutate(newTask)}
                    disabled={!newTask.title || !newTask.due_date || addTaskMutation.isPending}
                  >
                    {addTaskMutation.isPending ? "Creating..." : "Create Task"}
                  </Button>
                </div>
              </Card>

              {/* Task List */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-lg">Tasks</h3>
                {tasks.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No tasks yet.</p>
                ) : (
                  tasks.map((task) => (
                    <Card key={task.id} className={`p-4 border-l-4 ${priorityColors[task.priority]}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{task.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        </div>
                        <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </div>
                        <Badge variant="outline">{task.status}</Badge>
                        {task.automated && <Badge className="bg-purple-100 text-purple-700">Auto-Created</Badge>}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}