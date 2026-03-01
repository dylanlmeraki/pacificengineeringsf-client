/**
 * Drizzle ORM Schema for Pacific Engineering
 * 
 * REFERENCE FILE — Copy this to your Node.js backend project at:
 *   src/db/schema.ts
 * 
 * Prerequisites:
 *   pnpm add drizzle-orm pg
 *   pnpm add -D drizzle-kit @types/pg
 * 
 * Usage:
 *   npx drizzle-kit push    # Push schema to database
 *   npx drizzle-kit generate # Generate migration files
 */

import { pgTable, text, integer, boolean, timestamp, jsonb, real, uuid, varchar, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// Helper: common columns shared by ALL entity tables
// ============================================================================
const baseColumns = {
  id: uuid('id').defaultRandom().primaryKey(),
  created_date: timestamp('created_date', { withTimezone: true }).defaultNow().notNull(),
  updated_date: timestamp('updated_date', { withTimezone: true }).defaultNow().notNull(),
  created_by: varchar('created_by', { length: 255 }).notNull(),
};

// ============================================================================
// Auth tables (Lucia-compatible)
// ============================================================================

export const users = pgTable('users', {
  ...baseColumns,
  full_name: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  hashed_password: text('hashed_password'),
  role: varchar('role', { length: 50 }).default('user').notNull(),
  avatar_url: text('avatar_url'),
  phone: varchar('phone', { length: 50 }),
  department: varchar('department', { length: 100 }),
  title: varchar('title', { length: 100 }),
  email_verified: boolean('email_verified').default(false),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});

export const emailVerificationCodes = pgTable('email_verification_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 8 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});

// ============================================================================
// CRM Tables
// ============================================================================

export const prospects = pgTable('prospects', {
  ...baseColumns,
  company_name: varchar('company_name', { length: 255 }).notNull(),
  company_type: varchar('company_type', { length: 100 }),
  company_website: text('company_website'),
  company_location: varchar('company_location', { length: 255 }),
  company_address: text('company_address'),
  company_size: varchar('company_size', { length: 100 }),
  annual_revenue: varchar('annual_revenue', { length: 100 }),
  key_functions: text('key_functions'),
  contact_name: varchar('contact_name', { length: 255 }).notNull(),
  contact_title: varchar('contact_title', { length: 255 }),
  contact_email: varchar('contact_email', { length: 255 }),
  contact_phone: varchar('contact_phone', { length: 50 }),
  linkedin_url: text('linkedin_url'),
  uploaded_documents: jsonb('uploaded_documents'),
  prospect_score: real('prospect_score'),
  engagement_score: real('engagement_score').default(0),
  fit_score: real('fit_score').default(50),
  notes: text('notes'),
  status: varchar('status', { length: 50 }).default('New').notNull(),
  lead_source: varchar('lead_source', { length: 50 }).default('AI Research'),
  tags: jsonb('tags'),
  segment: varchar('segment', { length: 50 }),
  industry_focus: jsonb('industry_focus'),
  services_interested: jsonb('services_interested'),
  last_contact_date: timestamp('last_contact_date', { withTimezone: true }),
  next_follow_up: timestamp('next_follow_up', { withTimezone: true }),
  deal_value: real('deal_value'),
  deal_stage: varchar('deal_stage', { length: 50 }),
  probability: real('probability'),
  assigned_to: varchar('assigned_to', { length: 255 }),
  lost_reason: text('lost_reason'),
});

export const interactions = pgTable('interactions', {
  ...baseColumns,
  prospect_id: uuid('prospect_id').notNull().references(() => prospects.id, { onDelete: 'cascade' }),
  prospect_name: varchar('prospect_name', { length: 255 }),
  company_name: varchar('company_name', { length: 255 }),
  interaction_type: varchar('interaction_type', { length: 50 }).notNull(),
  interaction_date: timestamp('interaction_date', { withTimezone: true }).notNull(),
  subject: varchar('subject', { length: 500 }),
  content: text('content'),
  duration_minutes: integer('duration_minutes'),
  outcome: varchar('outcome', { length: 50 }),
  sentiment: varchar('sentiment', { length: 50 }),
  next_action: text('next_action'),
  automated: boolean('automated').default(false),
  engagement_points: real('engagement_points').default(0),
  attachments: jsonb('attachments'),
});

export const tasks = pgTable('tasks', {
  ...baseColumns,
  prospect_id: uuid('prospect_id').references(() => prospects.id, { onDelete: 'set null' }),
  prospect_name: varchar('prospect_name', { length: 255 }),
  company_name: varchar('company_name', { length: 255 }),
  task_type: varchar('task_type', { length: 50 }).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  priority: varchar('priority', { length: 20 }).default('Medium'),
  status: varchar('status', { length: 20 }).default('Pending'),
  due_date: timestamp('due_date', { withTimezone: true }).notNull(),
  reminder_date: timestamp('reminder_date', { withTimezone: true }),
  assigned_to: varchar('assigned_to', { length: 255 }),
  automated: boolean('automated').default(false),
  completed_date: timestamp('completed_date', { withTimezone: true }),
  notes: text('notes'),
});

// ============================================================================
// Project Tables
// ============================================================================

export const projects = pgTable('projects', {
  ...baseColumns,
  project_name: varchar('project_name', { length: 500 }).notNull(),
  project_number: varchar('project_number', { length: 100 }),
  client_email: varchar('client_email', { length: 255 }).notNull(),
  client_name: varchar('client_name', { length: 255 }),
  project_type: varchar('project_type', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).default('Planning').notNull(),
  priority: varchar('priority', { length: 20 }).default('Medium'),
  start_date: date('start_date'),
  estimated_completion: date('estimated_completion'),
  actual_completion: date('actual_completion'),
  location: text('location'),
  description: text('description'),
  progress_percentage: real('progress_percentage').default(0),
  assigned_team_members: jsonb('assigned_team_members'),
  budget: real('budget'),
  notes: text('notes'),
});

export const projectDocuments = pgTable('project_documents', {
  ...baseColumns,
  project_id: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  document_name: varchar('document_name', { length: 500 }).notNull(),
  document_type: varchar('document_type', { length: 50 }),
  file_url: text('file_url').notNull(),
  file_size: integer('file_size'),
  uploaded_by: varchar('uploaded_by', { length: 255 }),
  uploaded_by_name: varchar('uploaded_by_name', { length: 255 }),
  description: text('description'),
  version: varchar('version', { length: 20 }),
  status: varchar('status', { length: 50 }).default('Draft'),
});

export const projectMilestones = pgTable('project_milestones', {
  ...baseColumns,
  project_id: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  milestone_name: varchar('milestone_name', { length: 500 }).notNull(),
  description: text('description'),
  due_date: date('due_date'),
  amount: real('amount'),
  status: varchar('status', { length: 50 }).default('Pending Client Approval').notNull(),
  client_approval_date: timestamp('client_approval_date', { withTimezone: true }),
  client_comments: text('client_comments'),
  completion_percentage: real('completion_percentage').default(0),
  attachments: jsonb('attachments'),
});

export const changeOrders = pgTable('change_orders', {
  ...baseColumns,
  project_id: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  change_order_number: varchar('change_order_number', { length: 100 }),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description').notNull(),
  reason: text('reason'),
  cost_impact: real('cost_impact'),
  schedule_impact_days: integer('schedule_impact_days'),
  status: varchar('status', { length: 50 }).default('Pending Client Approval').notNull(),
  priority: varchar('priority', { length: 20 }).default('Medium'),
  client_approval_date: timestamp('client_approval_date', { withTimezone: true }),
  client_comments: text('client_comments'),
  proposed_by: varchar('proposed_by', { length: 255 }),
  proposed_by_name: varchar('proposed_by_name', { length: 255 }),
  attachments: jsonb('attachments'),
});

export const projectMessages = pgTable('project_messages', {
  ...baseColumns,
  project_id: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  sender_email: varchar('sender_email', { length: 255 }).notNull(),
  sender_name: varchar('sender_name', { length: 255 }),
  is_internal: boolean('is_internal').default(false),
  attachments: jsonb('attachments'),
  read_by: jsonb('read_by'),
});

// ============================================================================
// Proposals & Invoices
// ============================================================================

export const proposalTemplates = pgTable('proposal_templates', {
  ...baseColumns,
  template_name: varchar('template_name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  template_body: text('template_body').notNull(),
  fields_def: jsonb('fields_def'),
  category: varchar('category', { length: 50 }).default('General'),
  active: boolean('active').default(true),
});

export const proposals = pgTable('proposals', {
  ...baseColumns,
  project_id: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  template_id: uuid('template_id').references(() => proposalTemplates.id, { onDelete: 'set null' }),
  proposal_number: varchar('proposal_number', { length: 100 }),
  title: varchar('title', { length: 500 }).notNull(),
  content_html: text('content_html'),
  amount: real('amount'),
  status: varchar('status', { length: 50 }).default('draft'),
  sent_date: timestamp('sent_date', { withTimezone: true }),
  viewed_date: timestamp('viewed_date', { withTimezone: true }),
  signed_date: timestamp('signed_date', { withTimezone: true }),
  declined_date: timestamp('declined_date', { withTimezone: true }),
  declined_reason: text('declined_reason'),
  signature_data: jsonb('signature_data'),
  recipient_emails: jsonb('recipient_emails'),
  reminder_sent_count: integer('reminder_sent_count').default(0),
  last_reminder_date: timestamp('last_reminder_date', { withTimezone: true }),
  expiration_date: timestamp('expiration_date', { withTimezone: true }),
  esign_provider: varchar('esign_provider', { length: 50 }).default('none'),
  esign_provider_id: varchar('esign_provider_id', { length: 255 }),
  fields_data: jsonb('fields_data'),
});

export const invoices = pgTable('invoices', {
  ...baseColumns,
  project_id: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  invoice_number: varchar('invoice_number', { length: 100 }),
  issue_date: date('issue_date'),
  due_date: date('due_date'),
  paid_date: date('paid_date'),
  description: text('description'),
  line_items: jsonb('line_items'),
  subtotal: real('subtotal'),
  tax: real('tax'),
  total_amount: real('total_amount').notNull(),
  status: varchar('status', { length: 50 }).default('draft'),
  stripe_invoice_id: varchar('stripe_invoice_id', { length: 255 }),
  stripe_payment_intent_id: varchar('stripe_payment_intent_id', { length: 255 }),
});

// ============================================================================
// Workflows
// ============================================================================

export const workflows = pgTable('workflows', {
  ...baseColumns,
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  active: boolean('active').default(true),
  workflow_type: varchar('workflow_type', { length: 20 }).default('crm'),
  trigger_type: varchar('trigger_type', { length: 50 }).notNull(),
  trigger_config: jsonb('trigger_config'),
  steps: jsonb('steps').notNull(),
  execution_count: integer('execution_count').default(0),
  last_executed: timestamp('last_executed', { withTimezone: true }),
});

// ============================================================================
// Blog
// ============================================================================

export const blogPosts = pgTable('blog_posts', {
  ...baseColumns,
  title: varchar('title', { length: 500 }).notNull(),
  seo_optimized_title: varchar('seo_optimized_title', { length: 500 }),
  slug: varchar('slug', { length: 500 }).notNull().unique(),
  excerpt: text('excerpt'),
  meta_description: varchar('meta_description', { length: 300 }),
  content: text('content').notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  tags: jsonb('tags'),
  keywords: jsonb('keywords'),
  author: varchar('author', { length: 255 }).default('Pacific Engineering Team'),
  featured_image: text('featured_image'),
  read_time: varchar('read_time', { length: 20 }),
  published: boolean('published').default(false),
  published_date: date('published_date'),
  featured: boolean('featured').default(false),
});

// ============================================================================
// Settings
// ============================================================================

export const calendarSettings = pgTable('calendar_settings', {
  ...baseColumns,
  provider: varchar('provider', { length: 20 }).default('none').notNull(),
  google_calendar_id: varchar('google_calendar_id', { length: 255 }),
  google_refresh_token: text('google_refresh_token'),
  calendly_event_type_uri: text('calendly_event_type_uri'),
  default_meeting_duration: integer('default_meeting_duration').default(30),
  default_meeting_type: varchar('default_meeting_type', { length: 50 }).default('Discovery Call'),
  auto_create_interaction: boolean('auto_create_interaction').default(true),
  auto_create_task: boolean('auto_create_task').default(true),
  meeting_buffer_minutes: integer('meeting_buffer_minutes').default(15),
  timezone: varchar('timezone', { length: 50 }).default('America/Los_Angeles'),
});

export const emailSettings = pgTable('email_settings', {
  ...baseColumns,
  setting_name: varchar('setting_name', { length: 255 }).notNull(),
  recipient_emails: jsonb('recipient_emails').notNull(),
  form_type: varchar('form_type', { length: 50 }).notNull(),
  active: boolean('active').default(true),
});

export const icpSettings = pgTable('icp_settings', {
  ...baseColumns,
  profile_name: varchar('profile_name', { length: 255 }).notNull(),
  company_types: jsonb('company_types'),
  locations: jsonb('locations'),
  company_size_min: varchar('company_size_min', { length: 100 }),
  company_size_max: varchar('company_size_max', { length: 100 }),
  revenue_min: varchar('revenue_min', { length: 100 }),
  revenue_max: varchar('revenue_max', { length: 100 }),
  decision_maker_titles: jsonb('decision_maker_titles'),
  pain_points: jsonb('pain_points'),
  industries: jsonb('industries'),
  active: boolean('active').default(true),
});

// ============================================================================
// Audit & Notifications
// ============================================================================

export const auditLogs = pgTable('audit_logs', {
  ...baseColumns,
  actor_email: varchar('actor_email', { length: 255 }).notNull(),
  actor_name: varchar('actor_name', { length: 255 }),
  action: varchar('action', { length: 50 }).notNull(),
  resource_type: varchar('resource_type', { length: 100 }).notNull(),
  resource_id: uuid('resource_id'),
  resource_name: varchar('resource_name', { length: 500 }),
  details: text('details'),
  changes: jsonb('changes'),
  ip_address: varchar('ip_address', { length: 50 }),
  user_agent: text('user_agent'),
});

export const notifications = pgTable('notifications', {
  ...baseColumns,
  user_email: varchar('user_email', { length: 255 }).notNull(),
  type: varchar('type', { length: 20 }).default('info'),
  title: varchar('title', { length: 500 }).notNull(),
  message: text('message').notNull(),
  read: boolean('read').default(false),
  link: text('link'),
  metadata: jsonb('metadata'),
});

// ============================================================================
// Client Portal
// ============================================================================

export const clientInvites = pgTable('client_invites', {
  ...baseColumns,
  invite_token: text('invite_token').notNull().unique(),
  email: varchar('email', { length: 255 }).notNull(),
  company_name: varchar('company_name', { length: 255 }),
  invited_by_email: varchar('invited_by_email', { length: 255 }).notNull(),
  invited_by_name: varchar('invited_by_name', { length: 255 }),
  expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
  used: boolean('used').default(false),
  used_at: timestamp('used_at', { withTimezone: true }),
});

export const projectRequests = pgTable('project_requests', {
  ...baseColumns,
  client_email: varchar('client_email', { length: 255 }).notNull(),
  client_name: varchar('client_name', { length: 255 }),
  project_type: varchar('project_type', { length: 50 }).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  location: text('location'),
  budget_range: varchar('budget_range', { length: 100 }),
  timeline: varchar('timeline', { length: 100 }),
  status: varchar('status', { length: 20 }).default('pending'),
  assigned_to: varchar('assigned_to', { length: 255 }),
  notes: text('notes'),
});

// ============================================================================
// RFIs
// ============================================================================

export const rfis = pgTable('rfis', {
  ...baseColumns,
  project_id: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  rfi_number: varchar('rfi_number', { length: 100 }),
  subject: varchar('subject', { length: 500 }).notNull(),
  question: text('question').notNull(),
  answer: text('answer'),
  status: varchar('status', { length: 20 }).default('open'),
  priority: varchar('priority', { length: 20 }).default('medium'),
  due_date: date('due_date'),
  asked_by: varchar('asked_by', { length: 255 }),
  asked_by_name: varchar('asked_by_name', { length: 255 }),
  assigned_to: varchar('assigned_to', { length: 255 }),
  attachments: jsonb('attachments'),
});

// ============================================================================
// Sales Outreach
// ============================================================================

export const salesOutreach = pgTable('sales_outreach', {
  ...baseColumns,
  prospect_id: uuid('prospect_id').notNull().references(() => prospects.id, { onDelete: 'cascade' }),
  prospect_name: varchar('prospect_name', { length: 255 }),
  company_name: varchar('company_name', { length: 255 }),
  sequence_id: uuid('sequence_id'),
  run_id: uuid('run_id'),
  step_index: integer('step_index'),
  ab_variant: varchar('ab_variant', { length: 5 }),
  email_type: varchar('email_type', { length: 50 }),
  email_subject: varchar('email_subject', { length: 500 }),
  email_body: text('email_body'),
  email_template_used: varchar('email_template_used', { length: 255 }),
  sent_date: timestamp('sent_date', { withTimezone: true }),
  opened: boolean('opened').default(false),
  open_count: integer('open_count').default(0),
  clicked: boolean('clicked').default(false),
  click_count: integer('click_count').default(0),
  replied: boolean('replied').default(false),
  reply_date: timestamp('reply_date', { withTimezone: true }),
  reply_content: text('reply_content'),
  outcome: varchar('outcome', { length: 50 }).default('Sent'),
  notes: text('notes'),
  tracking_token: text('tracking_token'),
});

export const emailSequences = pgTable('email_sequences', {
  ...baseColumns,
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  steps: jsonb('steps').notNull(),
  active: boolean('active').default(true),
  prospect_count: integer('prospect_count').default(0),
});

// ============================================================================
// Scheduled Reports
// ============================================================================

export const scheduledReports = pgTable('scheduled_reports', {
  ...baseColumns,
  report_name: varchar('report_name', { length: 255 }).notNull(),
  report_type: varchar('report_type', { length: 50 }).notNull(),
  frequency: varchar('frequency', { length: 20 }).default('weekly'),
  day_of_week: integer('day_of_week'),
  day_of_month: integer('day_of_month'),
  time_of_day: varchar('time_of_day', { length: 10 }).default('09:00'),
  project_ids: jsonb('project_ids'),
  client_email: varchar('client_email', { length: 255 }),
  client_name: varchar('client_name', { length: 255 }),
  recipient_emails: jsonb('recipient_emails').notNull(),
  include_sections: jsonb('include_sections'),
  custom_intro: text('custom_intro'),
  active: boolean('active').default(true),
  last_generated_at: timestamp('last_generated_at', { withTimezone: true }),
  last_report_html: text('last_report_html'),
  generation_count: integer('generation_count').default(0),
});

// ============================================================================
// Custom Pages & Dashboard Config
// ============================================================================

export const customPages = pgTable('custom_pages', {
  ...baseColumns,
  page_name: varchar('page_name', { length: 255 }).notNull(),
  page_slug: varchar('page_slug', { length: 255 }).notNull(),
  page_type: varchar('page_type', { length: 20 }).default('landing'),
  page_config: jsonb('page_config'),
  is_published: boolean('is_published').default(false),
  description: text('description'),
});

export const dashboardConfigs = pgTable('dashboard_configs', {
  ...baseColumns,
  user_email: varchar('user_email', { length: 255 }).notNull(),
  layout: jsonb('layout'),
  widgets: jsonb('widgets'),
});