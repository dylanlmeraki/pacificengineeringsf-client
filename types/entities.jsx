/**
 * Central TypeScript Type Definitions for Pacific Engineering Internal Portal
 * 
 * These types define all data models used across the application.
 * Designed for portability: compatible with Base44 (current), Drizzle ORM + PostgreSQL (target).
 * 
 * Migration Target: Node.js / TypeScript / Express / Drizzle ORM / Lucia Auth
 * API Endpoint: https://api.pacificengineeringsf.com
 * File Storage: @vercel/blob
 * Email: Resend
 * Auth: Lucia (session-based, JWT in cookies)
 */

// ============================================================================
// Utility Types
// ============================================================================

/** ISO 8601 datetime string */
export type DateTime = string;

/** ISO date string (YYYY-MM-DD) */
export type DateString = string;

/** UUID or Base44 ID string */
export type EntityId = string;

/** Email address string */
export type Email = string;

/** File URL string (Base44 or @vercel/blob) */
export type FileUrl = string;

/** Base entity fields — present on every record in every entity */
export interface BaseEntity {
  id: EntityId;
  created_date: DateTime;
  updated_date: DateTime;
  created_by: Email;
}

/** Paginated response wrapper for future API use */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

/** Standard API error shape */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/** Result tuple type */
export type Result<T, E = ApiError> =
  | { success: true; data: T }
  | { success: false; error: E };

// ============================================================================
// User & Authentication
// ============================================================================

export type UserRole = 'admin' | 'user' | 'viewer';

export interface User extends BaseEntity {
  full_name: string;
  email: Email;
  role: UserRole;
  avatar_url?: FileUrl;
  phone?: string;
  department?: string;
  title?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

// ============================================================================
// CRM / Prospects
// ============================================================================

export type ProspectStatus =
  | 'New' | 'Researched' | 'Contacted' | 'Engaged' | 'Qualified'
  | 'Meeting Scheduled' | 'Proposal Sent' | 'Negotiation'
  | 'Won' | 'Lost' | 'Nurture';

export type LeadSource =
  | 'AI Research' | 'Referral' | 'Website' | 'Website Form'
  | 'LinkedIn' | 'Event' | 'Cold Call' | 'Web Crawl' | 'Other';

export type CompanyType =
  | 'General Contractor' | 'Owner/Developer' | 'Infrastructure'
  | 'Commercial' | 'Residential' | 'Mixed';

export type LeadSegment =
  | 'Hot Lead' | 'Warm Lead' | 'Cold Lead' | 'High Value'
  | 'Low Priority' | 'Key Account' | 'Quick Win' | 'Long Term';

export type IndustryFocus =
  | 'Commercial' | 'Residential' | 'Infrastructure' | 'Industrial'
  | 'Healthcare' | 'Education' | 'Municipal';

export type ServiceType =
  | 'SWPPP' | 'QSD/QSP' | 'Construction' | 'Inspections'
  | 'Testing' | 'Engineering' | 'SWPPP Services';

export type DealStage =
  | 'Discovery' | 'Qualification' | 'Proposal'
  | 'Negotiation' | 'Closed Won' | 'Closed Lost';

export interface Prospect extends BaseEntity {
  company_name: string;
  company_type?: CompanyType;
  company_website?: string;
  company_location?: string;
  company_address?: string;
  company_size?: string;
  annual_revenue?: string;
  key_functions?: string;
  contact_name: string;
  contact_title?: string;
  contact_email?: Email;
  contact_phone?: string;
  linkedin_url?: string;
  uploaded_documents?: Array<{ name: string; url: FileUrl }>;
  prospect_score?: number;
  engagement_score?: number;
  fit_score?: number;
  notes?: string;
  status: ProspectStatus;
  lead_source?: LeadSource;
  tags?: string[];
  segment?: LeadSegment;
  industry_focus?: IndustryFocus[];
  services_interested?: ServiceType[];
  last_contact_date?: DateTime;
  next_follow_up?: DateTime;
  deal_value?: number;
  deal_stage?: DealStage;
  probability?: number;
  assigned_to?: Email;
  lost_reason?: string;
}

// ============================================================================
// Interactions
// ============================================================================

export type InteractionType =
  | 'Email Sent' | 'Email Received' | 'Call Outbound' | 'Call Inbound'
  | 'Meeting' | 'Note' | 'LinkedIn Message' | 'Demo'
  | 'Proposal' | 'Contract' | 'Other';

export type InteractionOutcome =
  | 'Positive' | 'Neutral' | 'Negative' | 'Follow-up Needed'
  | 'Meeting Scheduled' | 'Proposal Requested' | 'Not Interested' | 'No Response';

export type Sentiment =
  | 'Very Positive' | 'Positive' | 'Neutral' | 'Negative' | 'Very Negative';

export interface Interaction extends BaseEntity {
  prospect_id: EntityId;
  prospect_name?: string;
  company_name?: string;
  interaction_type: InteractionType;
  interaction_date: DateTime;
  subject?: string;
  content?: string;
  duration_minutes?: number;
  outcome?: InteractionOutcome;
  sentiment?: Sentiment;
  next_action?: string;
  automated?: boolean;
  engagement_points?: number;
  attachments?: FileUrl[];
}

// ============================================================================
// Tasks
// ============================================================================

export type TaskType =
  | 'Follow-up Email' | 'Follow-up Call' | 'Send Proposal'
  | 'Schedule Meeting' | 'Research' | 'Demo'
  | 'Contract Review' | 'Check-in' | 'Other';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Task extends BaseEntity {
  prospect_id?: EntityId;
  prospect_name?: string;
  company_name?: string;
  task_type: TaskType;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: DateTime;
  reminder_date?: DateTime;
  assigned_to?: Email;
  automated?: boolean;
  completed_date?: DateTime;
  notes?: string;
}

// ============================================================================
// Projects
// ============================================================================

export type ProjectType =
  | 'SWPPP' | 'Construction' | 'Inspections' | 'Engineering'
  | 'Special Inspections' | 'Multiple Services';

export type ProjectStatus =
  | 'Planning' | 'In Progress' | 'On Hold' | 'Under Review'
  | 'Completed' | 'Closed';

export type ProjectPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Project extends BaseEntity {
  project_name: string;
  project_number?: string;
  client_email: Email;
  client_name: string;
  project_type: ProjectType;
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date?: DateString;
  estimated_completion?: DateString;
  actual_completion?: DateString;
  location?: string;
  description?: string;
  progress_percentage?: number;
  assigned_team_members?: Email[];
  budget?: number;
  notes?: string;
}

// ============================================================================
// Project Documents
// ============================================================================

export type DocumentType =
  | 'SWPPP Plan' | 'Inspection Report' | 'Test Results' | 'Engineering Drawing'
  | 'Photo' | 'Contract' | 'Invoice' | 'Permit' | 'Other';

export type DocumentStatus = 'Draft' | 'Under Review' | 'Approved' | 'Archived';

export interface ProjectDocument extends BaseEntity {
  project_id: EntityId;
  document_name: string;
  document_type: DocumentType;
  file_url: FileUrl;
  file_size?: number;
  uploaded_by?: Email;
  uploaded_by_name?: string;
  description?: string;
  version?: string;
  status: DocumentStatus;
}

// ============================================================================
// Project Milestones
// ============================================================================

export type MilestoneStatus =
  | 'Pending Client Approval' | 'Approved' | 'Rejected'
  | 'In Progress' | 'Completed';

export interface ProjectMilestone extends BaseEntity {
  project_id: EntityId;
  milestone_name: string;
  description?: string;
  due_date?: DateString;
  amount?: number;
  status: MilestoneStatus;
  client_approval_date?: DateTime;
  client_comments?: string;
  completion_percentage?: number;
  attachments?: FileUrl[];
}

// ============================================================================
// Change Orders
// ============================================================================

export type ChangeOrderStatus =
  | 'Pending Client Approval' | 'Approved' | 'Rejected'
  | 'In Progress' | 'Completed';

export interface ChangeOrder extends BaseEntity {
  project_id: EntityId;
  change_order_number?: string;
  title: string;
  description: string;
  reason?: string;
  cost_impact?: number;
  schedule_impact_days?: number;
  status: ChangeOrderStatus;
  priority: ProjectPriority;
  client_approval_date?: DateTime;
  client_comments?: string;
  proposed_by?: Email;
  proposed_by_name?: string;
  attachments?: FileUrl[];
}

// ============================================================================
// Project Messages
// ============================================================================

export interface ProjectMessage extends BaseEntity {
  project_id: EntityId;
  message: string;
  sender_email: Email;
  sender_name?: string;
  is_internal?: boolean;
  attachments?: FileUrl[];
  read_by?: Email[];
}

// ============================================================================
// Proposals
// ============================================================================

export type ProposalStatus =
  | 'draft' | 'sent' | 'viewed' | 'awaiting_signature'
  | 'signed' | 'declined' | 'expired';

export type TemplateCategory =
  | 'SWPPP' | 'Engineering' | 'Construction' | 'Inspection' | 'General';

export interface SignatureData {
  signer_name: string;
  signer_email: Email;
  signature_image?: string;
  ip_address?: string;
  signed_at: DateTime;
}

export interface Proposal extends BaseEntity {
  project_id?: EntityId;
  template_id?: EntityId;
  proposal_number?: string;
  title: string;
  content_html?: string;
  amount?: number;
  status: ProposalStatus;
  sent_date?: DateTime;
  viewed_date?: DateTime;
  signed_date?: DateTime;
  declined_date?: DateTime;
  declined_reason?: string;
  signature_data?: SignatureData;
  recipient_emails?: Email[];
  reminder_sent_count?: number;
  last_reminder_date?: DateTime;
  expiration_date?: DateTime;
  esign_provider?: 'docusign' | 'hellosign' | 'none';
  esign_provider_id?: string;
  fields_data?: Record<string, unknown>;
}

export interface ProposalTemplate extends BaseEntity {
  template_name: string;
  slug: string;
  description?: string;
  template_body: string;
  fields_def?: Array<{ name: string; label: string; type: string }>;
  category: TemplateCategory;
  active: boolean;
}

// ============================================================================
// Invoices
// ============================================================================

export type InvoiceStatus =
  | 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Invoice extends BaseEntity {
  project_id: EntityId;
  invoice_number?: string;
  issue_date?: DateString;
  due_date?: DateString;
  paid_date?: DateString;
  description?: string;
  line_items?: InvoiceLineItem[];
  subtotal?: number;
  tax?: number;
  total_amount: number;
  status: InvoiceStatus;
  stripe_invoice_id?: string;
  stripe_payment_intent_id?: string;
}

// ============================================================================
// Workflows & Automation
// ============================================================================

export type WorkflowType = 'crm' | 'project';

export type TriggerType =
  | 'status_change' | 'date_based' | 'score_threshold' | 'interaction_added'
  | 'task_completed' | 'milestone_completed' | 'document_approved'
  | 'invoice_overdue' | 'proposal_signed' | 'change_order_approved'
  | 'project_status_change' | 'project_created';

export type ActionType =
  | 'create_task' | 'send_email' | 'update_prospect' | 'wait_days'
  | 'create_interaction' | 'update_project' | 'send_notification'
  | 'generate_report' | 'create_milestone' | 'send_client_update'
  | 'assign_project_manager';

export interface WorkflowStep {
  action_type: ActionType;
  action_config: Record<string, unknown>;
}

export interface Workflow extends BaseEntity {
  name: string;
  description?: string;
  active: boolean;
  workflow_type: WorkflowType;
  trigger_type: TriggerType;
  trigger_config?: Record<string, unknown>;
  steps: WorkflowStep[];
  execution_count?: number;
  last_executed?: DateTime;
}

// ============================================================================
// Blog / Content
// ============================================================================

export type BlogCategory =
  | 'compliance' | 'best-practices' | 'regulations'
  | 'inspections' | 'engineering' | 'case-studies';

export interface BlogPost extends BaseEntity {
  title: string;
  seo_optimized_title?: string;
  slug: string;
  excerpt?: string;
  meta_description?: string;
  content: string;
  category: BlogCategory;
  tags?: string[];
  keywords?: string[];
  author?: string;
  featured_image?: FileUrl;
  read_time?: string;
  published: boolean;
  published_date?: DateString;
  featured?: boolean;
}

// ============================================================================
// Settings
// ============================================================================

export type CalendarProvider = 'google' | 'calendly' | 'none';

export interface CalendarSettings extends BaseEntity {
  provider: CalendarProvider;
  google_calendar_id?: string;
  google_refresh_token?: string;
  calendly_event_type_uri?: string;
  default_meeting_duration?: number;
  default_meeting_type?: string;
  auto_create_interaction?: boolean;
  auto_create_task?: boolean;
  meeting_buffer_minutes?: number;
  timezone?: string;
}

export interface EmailSettings extends BaseEntity {
  setting_name: string;
  recipient_emails: Email[];
  form_type: 'swppp_consultation' | 'contact_form' | 'general_inquiry';
  active: boolean;
}

export interface ICPSettings extends BaseEntity {
  profile_name: string;
  company_types?: string[];
  locations?: string[];
  company_size_min?: string;
  company_size_max?: string;
  revenue_min?: string;
  revenue_max?: string;
  decision_maker_titles?: string[];
  pain_points?: string[];
  industries?: string[];
  active: boolean;
}

// ============================================================================
// Audit & Logging
// ============================================================================

export type AuditAction =
  | 'user_created' | 'user_updated' | 'user_deleted' | 'role_changed'
  | 'prospect_created' | 'prospect_updated' | 'prospect_deleted'
  | 'blog_published' | 'blog_unpublished' | 'settings_changed'
  | 'project_created' | 'project_updated' | 'email_sent'
  | 'integration_triggered' | 'other';

export interface AuditLog extends BaseEntity {
  actor_email: Email;
  actor_name?: string;
  action: AuditAction;
  resource_type: string;
  resource_id?: EntityId;
  resource_name?: string;
  details?: string;
  changes?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}

// ============================================================================
// Notifications
// ============================================================================

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification extends BaseEntity {
  user_email: Email;
  type: NotificationType;
  title: string;
  message: string;
  read?: boolean;
  link?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Client Portal
// ============================================================================

export interface ClientInvite extends BaseEntity {
  invite_token: string;
  email: Email;
  company_name: string;
  invited_by_email: Email;
  invited_by_name?: string;
  expires_at: DateTime;
  used: boolean;
  used_at?: DateTime;
}

export interface ProjectRequest extends BaseEntity {
  client_email: Email;
  client_name?: string;
  project_type: ProjectType;
  title: string;
  description?: string;
  location?: string;
  budget_range?: string;
  timeline?: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  assigned_to?: Email;
  notes?: string;
}

// ============================================================================
// RFIs
// ============================================================================

export type RFIStatus = 'open' | 'answered' | 'closed' | 'overdue';
export type RFIPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface RFI extends BaseEntity {
  project_id: EntityId;
  rfi_number?: string;
  subject: string;
  question: string;
  answer?: string;
  status: RFIStatus;
  priority: RFIPriority;
  due_date?: DateString;
  asked_by?: Email;
  asked_by_name?: string;
  assigned_to?: Email;
  attachments?: FileUrl[];
}

// ============================================================================
// Sales Outreach & Email Sequences
// ============================================================================

export type OutreachOutcome =
  | 'Sent' | 'Opened' | 'Positive Reply' | 'Neutral Reply'
  | 'Not Interested' | 'Meeting Scheduled' | 'Bounced' | 'No Response';

export interface SalesOutreach extends BaseEntity {
  prospect_id: EntityId;
  prospect_name?: string;
  company_name?: string;
  sequence_id?: EntityId;
  run_id?: EntityId;
  step_index?: number;
  ab_variant?: 'A' | 'B';
  email_type?: string;
  email_subject?: string;
  email_body?: string;
  email_template_used?: string;
  sent_date?: DateTime;
  opened?: boolean;
  open_count?: number;
  clicked?: boolean;
  click_count?: number;
  replied?: boolean;
  reply_date?: DateTime;
  reply_content?: string;
  outcome?: OutreachOutcome;
  notes?: string;
  tracking_token?: string;
}

export interface EmailSequenceStep {
  subject: string;
  body: string;
  delay_days: number;
  ab_variant?: 'A' | 'B';
}

export interface EmailSequence extends BaseEntity {
  name: string;
  description?: string;
  steps: EmailSequenceStep[];
  active: boolean;
  prospect_count?: number;
}

// ============================================================================
// Scheduled Reports
// ============================================================================

export type ReportType =
  | 'project_progress' | 'budget_status' | 'communications_summary'
  | 'full_project_report' | 'client_portfolio';

export type ReportFrequency =
  | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'one_time';

export type ReportSection =
  | 'progress' | 'milestones' | 'budget' | 'change_orders'
  | 'documents' | 'messages' | 'invoices' | 'risks';

export interface ScheduledReport extends BaseEntity {
  report_name: string;
  report_type: ReportType;
  frequency: ReportFrequency;
  day_of_week?: number;
  day_of_month?: number;
  time_of_day?: string;
  project_ids?: EntityId[];
  client_email?: Email;
  client_name?: string;
  recipient_emails: Email[];
  include_sections: ReportSection[];
  custom_intro?: string;
  active: boolean;
  last_generated_at?: DateTime;
  last_report_html?: string;
  generation_count?: number;
}

// ============================================================================
// Custom Pages & Dashboard
// ============================================================================

export type CustomPageType = 'landing' | 'dashboard' | 'report';

export interface CustomPage extends BaseEntity {
  page_name: string;
  page_slug: string;
  page_type: CustomPageType;
  page_config: Record<string, unknown>;
  is_published: boolean;
  description?: string;
}

export interface DashboardConfig extends BaseEntity {
  user_email: Email;
  layout: Record<string, unknown>;
  widgets: Record<string, unknown>;
}

// ============================================================================
// Entity Name Registry — maps entity names to their TypeScript types.
// Use this for generic CRUD operations to maintain type safety.
// ============================================================================

export interface EntityTypeMap {
  User: User;
  Prospect: Prospect;
  Interaction: Interaction;
  Task: Task;
  Project: Project;
  ProjectDocument: ProjectDocument;
  ProjectMilestone: ProjectMilestone;
  ChangeOrder: ChangeOrder;
  ProjectMessage: ProjectMessage;
  Proposal: Proposal;
  ProposalTemplate: ProposalTemplate;
  Invoice: Invoice;
  Workflow: Workflow;
  BlogPost: BlogPost;
  CalendarSettings: CalendarSettings;
  EmailSettings: EmailSettings;
  ICPSettings: ICPSettings;
  AuditLog: AuditLog;
  Notification: Notification;
  ClientInvite: ClientInvite;
  ProjectRequest: ProjectRequest;
  RFI: RFI;
  SalesOutreach: SalesOutreach;
  EmailSequence: EmailSequence;
  ScheduledReport: ScheduledReport;
  CustomPage: CustomPage;
  DashboardConfig: DashboardConfig;
}

/** All entity names as a type */
export type EntityName = keyof EntityTypeMap;