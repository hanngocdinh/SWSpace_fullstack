import api from '../utils/api';

export type DashboardStats = {
  totalServicePackages: number;
  reservedSeats: number;
  totalUsers: number;
  monthlyRevenue: number;
};

export type RevenuePoint = {
  month: number;
  year: number;
  label: string;
  total: number;
  monthStart: string | null;
};

export type ServiceUsagePoint = {
  code: string;
  label: string;
  bookings: number;
  percentage: number;
};

export type RecentActivityItem = {
  id: number | string;
  bookingReference?: string | null;
  status: string;
  serviceType: string | null;
  serviceLabel: string;
  packageName: string;
  userName: string;
  userEmail: string;
  quantity: number;
  totalAmount: number;
  action: 'booking' | 'payment' | 'canceled' | 'deleted';
  actionLabel: string;
  occurredAt: string | null;
};

export type DashboardOverview = {
  stats: DashboardStats;
  revenueByMonth: RevenuePoint[];
  serviceUsage: ServiceUsagePoint[];
  recentActivity: RecentActivityItem[];
};

export type AdminNotification = {
  id: string;
  title: string;
  message: string;
  category: 'floor' | 'booking';
  severity: 'alert' | 'info' | 'success';
  createdAt: string | null;
  targetPage?: string;
  metadata?: Record<string, any> | null;
};

export async function fetchAdminDashboard(params?: { months?: number; activityLimit?: number }): Promise<DashboardOverview> {
  const res = await api.get('/api/admin/dashboard', { params });
  return (res.data?.data ?? res.data) as DashboardOverview;
}

export async function fetchAdminNotifications(params?: { limit?: number }): Promise<AdminNotification[]> {
  const res = await api.get('/api/admin/dashboard/notifications', { params });
  return (res.data?.data ?? res.data) as AdminNotification[];
}
