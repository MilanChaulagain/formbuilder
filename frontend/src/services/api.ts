import axios from 'axios';
import { FormSchema, FormSubmission } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Form Schema APIs
export const formApi = {
  // Get all forms for the current user
  getAllForms: () => api.get<FormSchema[]>('/forms/'),
  
  // Get a specific form by slug
  getFormBySlug: (slug: string) => api.get<FormSchema>(`/forms/${slug}/`),
  
  // Get public form (no auth needed)
  getPublicForm: (slug: string) => api.get<FormSchema>(`/forms/${slug}/public/`),
  
  // Create a new form
  createForm: (data: Partial<FormSchema>) => api.post<FormSchema>('/forms/', data),
  
  // Update a form
  updateForm: (slug: string, data: Partial<FormSchema>) => 
    api.patch<FormSchema>(`/forms/${slug}/`, data),
  
  // Delete a form
  deleteForm: (slug: string) => api.delete(`/forms/${slug}/`),
  
  // Get submissions for a form
  getFormSubmissions: (slug: string, filters?: any) => 
    api.get<FormSubmission[]>(`/forms/${slug}/submissions/`, { params: filters }),
  
  // Get related data for dropdown
  getRelatedData: (slug: string, targetSlug: string, displayField: string) =>
    api.get(`/forms/${slug}/related_data/`, {
      params: { target_slug: targetSlug, display_field: displayField }
    }),
};

// Submission APIs
export const submissionApi = {
  // Submit a form
  submitForm: (slug: string, data: any) => 
    api.post('/submissions/', { slug, data }),
  
  // Get all submissions (for form owner)
  getAllSubmissions: () => api.get<FormSubmission[]>('/submissions/'),
  
  // Get a specific submission
  getSubmission: (id: number) => api.get<FormSubmission>(`/submissions/${id}/`),
};

export default api;
