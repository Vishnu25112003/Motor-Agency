// src/lib/services.ts
import { apiClient } from './api';

// Auth APIs
export const authApi = {
  login: async (email: string, password: string, type: 'ADMIN' | 'MSME' | 'AGENCY') => {
    return apiClient.post('/api/auth/login', { email, password, type });
  },
};

// MSME APIs
export const msmeApi = {
  getMSMEs: () => apiClient.get('/api/msmes'),
  createMSME: (data: any) => apiClient.post('/api/msmes', data),
  getMSMEStats: () => apiClient.get('/api/msme/stats'),
  getMSMEJobs: () => apiClient.get('/api/msme/jobs'),
};

// Jobs APIs
export const jobsApi = {
  getJobs: () => apiClient.get('/api/jobs'),
  getJob: (id: string) => apiClient.get(`/api/jobs/${id}`),
  createJob: (data: any) => apiClient.post('/api/jobs', data),
  assignJob: (id: string, agencyId: string) => apiClient.put(`/api/jobs/${id}/assign`, { agencyId }),
  claimJob: (id: string) => apiClient.put(`/api/jobs/${id}/claim`),
  approveJob: (id: string, approved: boolean, notes?: string) => apiClient.put(`/api/jobs/${id}/approve`, { approve: approved, notes }),
  submitTestResult: (jobId: string, data: any) => apiClient.post(`/api/jobs/${jobId}/test-results`, data),
  getJobAudit: (jobId: string) => apiClient.get(`/api/jobs/${jobId}/audit`),
};

// Agencies APIs
export const agenciesApi = {
  getAgencies: () => apiClient.get('/api/agencies'),
  getAgency: (id: string) => apiClient.get(`/api/agencies/${id}`),
  createAgency: (data: any) => apiClient.post('/api/agencies', data),
  updateAgency: (id: string, data: any) => apiClient.put(`/api/agencies/${id}`, data),
  deleteAgency: (id: string) => apiClient.delete(`/api/agencies/${id}`),
  getAgencyStats: () => apiClient.get('/api/agency/stats'),
  getAgencyJobs: () => apiClient.get('/api/agency/jobs'),
  getAgencySubmissions: () => apiClient.get('/api/agency/submissions'),
};

// Products APIs
export const productsApi = {
  getProducts: () => apiClient.get('/api/products'),
  createProduct: (data: any) => apiClient.post('/api/products', data),
  updateProduct: (id: string, data: any) => apiClient.put(`/api/products/${id}`, data),
  deleteProduct: (id: string) => apiClient.delete(`/api/products/${id}`),
};

// Analytics APIs (Admin)
export const analyticsApi = {
  getAdminStats: () => apiClient.get('/api/admin/stats'),
  getAdminAnalytics: () => apiClient.get('/api/admin/analytics'),
};

// Files APIs
export const filesApi = {
  uploadFile: (file: File) => apiClient.upload('/api/files/upload', file),
};
