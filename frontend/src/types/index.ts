// Type definitions for the form builder application

export type FieldType = 'text' | 'textarea' | 'dropdown' | 'radio' | 'checkbox' | 'number' | 'email' | 'date' | 'relation';

export interface LanguageLabels {
  [languageCode: string]: string;
}

export interface FieldOption {
  id: string;
  label: LanguageLabels;
}

export interface FormField {
  id: string;
  type: FieldType;
  labels: LanguageLabels;
  descriptions?: LanguageLabels;
  required: boolean;
  options?: FieldOption[];  // For dropdown/radio/checkbox
  // For relation fields
  targetFormSlug?: string;
  displayField?: string;
}

export interface LanguageConfig {
  primary: string;
  optional: string[];
}

export interface FormRelationship {
  field_id: string;
  target_form_slug: string;
  display_field: string;
}

export interface FormSchema {
  id?: number;
  title: string;
  slug?: string;
  description?: string;
  language_config: LanguageConfig;
  fields_structure: FormField[];
  relationships: FormRelationship[];
  created_by?: number;
  created_by_username?: string;
  created_at?: string;
  updated_at?: string;
  submission_count?: number;
}

export interface FormSubmissionData {
  [fieldId: string]: any;
}

export interface FormSubmission {
  id: number;
  form_schema: number;
  form_title?: string;
  form_slug?: string;
  data: FormSubmissionData;
  submitted_at: string;
  submitted_by?: number;
  ip_address?: string;
}

export interface DashboardFilter {
  fieldId: string;
  value: string;
}
