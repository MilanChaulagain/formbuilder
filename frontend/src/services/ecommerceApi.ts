import axios from 'axios';
import { Product, Sale, DashboardConfig, SalesAnalytics } from '../types/ecommerce';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Product APIs
export const productApi = {
  getAllProducts: () => api.get<any>('/products/'),
  
  getProduct: (productId: number) => api.get<Product>(`/products/${productId}/`),
  
  createProduct: (data: Partial<Product>) => api.post<Product>('/products/', data),
  
  updateProduct: (productId: number, data: Partial<Product>) => 
    api.patch<Product>(`/products/${productId}/`, data),
  
  deleteProduct: (productId: number) => api.delete(`/products/${productId}/`),
  
  getProductsByType: (productType: string) => 
    api.get<Product[]>('/products/by_type/', { params: { type: productType } }),
  
  getSalesSummary: (productId: number) => 
    api.get(`/products/${productId}/sales_summary/`),
};

// Sales APIs
export const salesApi = {
  getAllSales: () => api.get<any>('/sales/'),
  
  getSale: (salesId: number) => api.get<Sale>(`/sales/${salesId}/`),
  
  createSale: (data: Partial<Sale>) => api.post<Sale>('/sales/', data),
  
  updateSale: (salesId: number, data: Partial<Sale>) => 
    api.patch<Sale>(`/sales/${salesId}/`, data),
  
  deleteSale: (salesId: number) => api.delete(`/sales/${salesId}/`),
  
  getSalesByProduct: (productId: number) => 
    api.get<Sale[]>('/sales/by_product/', { params: { product_id: productId } }),
  
  getAnalytics: () => api.get<SalesAnalytics>('/sales/analytics/'),
};

// Dashboard APIs
export const dashboardApi = {
  getAllDashboards: () => api.get<any>('/dashboards/'),
  
  getDashboard: (dashboardId: number) => api.get<DashboardConfig>(`/dashboards/${dashboardId}/`),
  
  createDashboard: (data: Partial<DashboardConfig>) => 
    api.post<DashboardConfig>('/dashboards/', data),
  
  updateDashboard: (dashboardId: number, data: Partial<DashboardConfig>) => 
    api.patch<DashboardConfig>(`/dashboards/${dashboardId}/`, data),
  
  deleteDashboard: (dashboardId: number) => api.delete(`/dashboards/${dashboardId}/`),
  
  getDashboardData: (dashboardId: number) => 
    api.get(`/dashboards/${dashboardId}/data/`),
};

export default api;
