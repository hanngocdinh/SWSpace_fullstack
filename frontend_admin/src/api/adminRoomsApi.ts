import api from '../utils/api';

export type RoomStatusUI = 'Available' | 'Occupied' | 'Maintenance';

export async function getRoomStatuses(serviceType: 'meeting_room' | 'private_office' | 'networking'){
  const res = await api.get(`/api/admin/team-rooms/status`, { params: { serviceType } });
  return res.data?.data as Array<{ roomCode: string; status: RoomStatusUI; capacity: number; floor: number }>;
}

export async function getRoomDetail(roomCode: string, params?: Record<string, string | number | undefined>){
  const res = await api.get(`/api/admin/team-rooms/${encodeURIComponent(roomCode)}/detail`, {
    params
  });
  return res.data as {
    roomCode: string;
    status: RoomStatusUI;
    capacity: number;
    zone?: string;
    floor?: number;
    user?: { id?: number; name?: string; email?: string; phone?: string } | null;
    booking?: {
      id: number;
      package?: string;
      startDate?: string;
      endDate?: string;
      paymentStatus?: string;
      bookingReference?: string;
      phase?: string;
    } | null;
  };
}

export async function cancelRoomBooking(roomCode: string, bookingId: number, reason?: string){
  const res = await api.post(`/api/admin/team-rooms/${encodeURIComponent(roomCode)}/cancel-booking`, {
    bookingId,
    reason
  });
  return res.data;
}

export async function setRoomStatus(roomCode: string, status: RoomStatusUI){
  const res = await api.post(`/api/admin/team-rooms/${encodeURIComponent(roomCode)}/status`, { status });
  return res.data;
}

export async function setupFloor2(){
  const res = await api.post(`/api/admin/team-rooms/setup/floor2`, {});
  return res.data;
}

export async function setupFloor3(){
  const res = await api.post(`/api/admin/team-rooms/setup/floor3`, {});
  return res.data;
}
