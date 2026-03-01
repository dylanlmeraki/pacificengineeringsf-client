// Minimal entity type definitions to begin TS migration
// Extend as needed. Fields marked optional to avoid breaking current JS usage.

export interface Project {
  id: string;
  project_name: string;
  project_number?: string;
  client_email: string;
  client_name?: string;
  project_type: string;
  status: string;
  priority?: string;
  start_date?: string;
  estimated_completion?: string;
  location?: string;
  description?: string;
  budget?: number;
  assigned_team_members?: string[];
  notes?: string;
  created_date?: string;
  updated_date?: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  permissions?: string[];
  created_date?: string;
}

export interface Contact {
  id: string;
  contact_name?: string;
  company_name?: string;
  email?: string;
  phone?: string;
  contact_type?: string;
  status?: string;
  lead_source?: string;
  services_interested?: string[];
  message?: string;
}

export interface Proposal {
  id: string;
  title: string;
  proposal_number?: string;
  status?: string;
  project_id?: string;
  amount?: number;
  sent_date?: string;
  signed_date?: string;
  recipient_emails?: string[];
  created_date?: string;
}

export type ID = string;