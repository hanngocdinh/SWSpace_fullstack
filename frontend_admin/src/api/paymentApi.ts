const API_BASE = (import.meta.env?.VITE_API_URL || import.meta.env?.REACT_APP_API_URL || 'http://localhost:5000')
  .replace(/\/$/, '') + '/api';

export interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  userEmail?: string;
  userFullName?: string;
  serviceType?: string;
  seatName?: string;
  amount: string;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  status: 'created' | 'processing' | 'success' | 'failed' | 'expired';
  description?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  bookingReference?: string;
  username?: string;
}

export interface PaymentStats {
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  totalRevenue: number;
  successRate?: string;
  // Keep these for backward compatibility
  total_payments?: number;
  completed_payments?: number;
  pending_payments?: number;
  failed_payments?: number;
  total_revenue?: number;
}

export interface PaymentFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

// Get admin token from localStorage
const getAdminToken = () => {
  return localStorage.getItem('sw_token') || localStorage.getItem('adminToken') || localStorage.getItem('token');
};

// Get all payments with filters
export const getAllPayments = async (filters: PaymentFilters = {}): Promise<Payment[]> => {
  const token = getAdminToken();
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      queryParams.append(key, value.toString());
    }
  });
  
  const url = `${API_BASE}/payments/admin?${queryParams.toString()}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch payments: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.success ? data.data : (data.payments || []);
};

// Get payment by ID
export const getPaymentById = async (id: string): Promise<Payment> => {
  const token = getAdminToken();
  
  const response = await fetch(`${API_BASE}/payments/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch payment: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.payment;
};

// Update payment status (admin only)
export const updatePaymentStatus = async (
  id: string, 
  status: string, 
  notes?: string
): Promise<Payment> => {
  const token = getAdminToken();
  
  const response = await fetch(`${API_BASE}/payments/${id}/status`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, notes }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update payment status: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.payment;
};

// Get payment statistics (admin only)
export const getPaymentStats = async (): Promise<PaymentStats> => {
  const token = getAdminToken();
  
  const response = await fetch(`${API_BASE}/payments/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch payment stats: ${response.statusText}`);
  }
  
  const result = await response.json();
  const data = result.success ? result.data : result.stats;
  
  // Normalize the response to match our interface
  return {
    totalPayments: data.totalPayments || data.total_payments || 0,
    completedPayments: data.completedPayments || data.completed_payments || 0,
    pendingPayments: data.pendingPayments || data.pending_payments || 0,
    failedPayments: data.failedPayments || data.failed_payments || 0,
    totalRevenue: data.totalRevenue || data.total_revenue || 0,
    successRate: data.successRate,
    // Keep backward compatibility
    total_payments: data.totalPayments || data.total_payments || 0,
    completed_payments: data.completedPayments || data.completed_payments || 0,
    pending_payments: data.pendingPayments || data.pending_payments || 0,
    failed_payments: data.failedPayments || data.failed_payments || 0,
    total_revenue: data.totalRevenue || data.total_revenue || 0
  };
};

// Export payments data (admin only)
export const exportPayments = async (filters: PaymentFilters = {}): Promise<Blob> => {
  const token = getAdminToken();
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      queryParams.append(key, value.toString());
    }
  });
  
  const url = `${API_BASE}/payments/export?${queryParams.toString()}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to export payments: ${response.statusText}`);
  }
  
  return response.blob();
};