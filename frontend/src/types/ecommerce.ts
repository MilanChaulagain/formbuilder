export interface Product {
  product_id?: number;
  product_name: string;
  product_type: string;
  sellable: 'yes' | 'no';
  created_at?: string;
  image_path?: string;
  user?: number;
  user_username?: string;
  form_schema?: number;
  form_schema_details?: any;
  custom_fields?: Record<string, any>;
  total_sales?: number;
  sales_count?: number;
}

export interface Sale {
  sales_id?: number;
  product: number;
  product_name?: string;
  product_type?: string;
  sales_amount: number;
  sale_date?: string;
  quantity: number;
  customer_name?: string;
}

export interface DashboardConfig {
  dashboard_id?: number;
  product: number;
  product_name?: string;
  sales_table: string;
  user?: number;
  user_username?: string;
  created_at?: string;
  updated_at?: string;
  config?: Record<string, any>;
  product_details?: Product;
}

export interface SalesAnalytics {
  total_revenue: number;
  total_sales: number;
  total_quantity: number;
  average_sale: number;
  by_product: Array<{
    product__product_name: string;
    total: number;
    count: number;
  }>;
}
