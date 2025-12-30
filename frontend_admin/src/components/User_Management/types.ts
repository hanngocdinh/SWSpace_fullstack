export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'inactive';

export interface ManagedUser {
  id: number;
  email: string;
  username?: string;
  phone: string | null;
  fullName: string | null;
  role: UserRole;
  status: UserStatus;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string | null;
  totalBookings: number;
  totalPayments: number;
}

export interface SummaryCounts {
  total: number;
  active: number;
  inactive: number;
}

export interface ListMeta {
  page: number;
  pageSize: number;
  filteredTotal: number;
  totalPages: number;
}

export interface RecentBooking {
  id: number;
  bookingCode: string;
  seatName: string | null;
  seatCode: string | null;
  serviceType: string | null;
  floor: number | null;
  startTime: string;
  endTime: string;
  status: string;
  totalAmount: number;
  duration: string | null;
}

export interface ListResponse {
  data: ManagedUser[];
  summary: SummaryCounts;
  meta: ListMeta;
}
