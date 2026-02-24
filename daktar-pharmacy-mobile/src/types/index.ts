// Auth Types
export interface User {
  id: number;
  name?: string;
  email: string;
  phone?: string;
  role?: string;
  company_name?: string;
  photo?: string;
}

export interface Pharmacy {
  id: number;
  name: string;
  company_name: string;
  photo?: string;
  license_number: string;
  address: string;
  city: string;
  state: string;
  pin_code: string;
  phone: string;
  email: string;
  owner_name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

// Patient Types
export interface Patient {
  id: number;
  name: string;
  email?: string;
  phone: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  city?: string;
  state?: string;
  pin_code?: string;
  blood_group?: string;
  pharmacy_id?: number;
  created_at?: string;
  updated_at?: string;
}

// Inventory Types
export interface Medicine {
  id: number;
  name: string;
  dosage: string;
  manufacturer: string;
  batch_number: string;
  expiry_date: string;
  quantity_in_stock: number;
  cost_price: number;
  selling_price: number;
  pharmacy_id: number;
  created_at: string;
  updated_at: string;
}

// Orders Types
export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  discount?: number;
  status: 'pending' | 'completed' | 'cancelled';
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  medicine_id: number;
  medicine_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// Wallet Types
export interface Wallet {
  id: number;
  pharmacy_id: number;
  balance: number;
  total_deposits: number;
  total_withdrawals: number;
  created_at: string;
  updated_at: string;
}

// Ledger Types
export interface LedgerEntry {
  id: number;
  pharmacy_id: number;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  reference_type?: string;
  reference_id?: number;
  created_at: string;
}

// Sales Report Types
export interface SalesReport {
  total_sales: number;
  total_orders: number;
  total_items_sold: number;
  average_order_value: number;
  date_range: {
    start_date: string;
    end_date: string;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
