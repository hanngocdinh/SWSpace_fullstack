import api from '../../utils/api';
import { ListMeta, ListResponse, ManagedUser, RecentBooking, UserRole, UserStatus } from './types';

export interface ListParams {
  role: UserRole;
  status?: 'all' | UserStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateUserPayload {
  fullName?: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  fullName?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  password?: string;
}

export async function fetchUsers(params: ListParams) {
  const { data } = await api.get<ListResponse>('/api/admin/users', {
    params: {
      role: params.role,
      status: params.status || 'all',
      q: params.search || '',
      page: params.page || 1,
      pageSize: params.pageSize || 10
    }
  });
  return data;
}

export async function createUser(payload: CreateUserPayload) {
  const { data } = await api.post<{ data: ManagedUser }>('/api/admin/users', payload);
  return data.data;
}

export async function updateUser(id: number, payload: UpdateUserPayload) {
  const { data } = await api.put<{ data: ManagedUser }>(`/api/admin/users/${id}`, payload);
  return data.data;
}

export async function updateStatus(id: number, status: UserStatus) {
  const { data } = await api.patch<{ data: ManagedUser }>(`/api/admin/users/${id}/status`, { status });
  return data.data;
}

export async function deleteUser(id: number) {
  await api.delete(`/api/admin/users/${id}`);
}

export async function fetchUserDetail(id: number) {
  const { data } = await api.get<{ data: ManagedUser }>(`/api/admin/users/${id}`);
  return data.data;
}

export async function fetchRecentBookings(id: number, params?: { page?: number; pageSize?: number }) {
  const { data } = await api.get<{ data: RecentBooking[]; meta: ListMeta }>(`/api/admin/users/${id}/recent-bookings`, {
    params: {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 5
    }
  });
  return data;
}
