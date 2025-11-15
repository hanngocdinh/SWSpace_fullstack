import api from '../utils/api';

export type RoomStatusUI = 'Available' | 'Occupied' | 'Maintenance';

export async function getRoomStatuses(serviceType: 'meeting_room' | 'private_office' | 'networking'){
  const res = await api.get(`/api/admin/team-rooms/status`, { params: { serviceType } });
  return res.data?.data as Array<{ roomCode: string; status: RoomStatusUI; capacity: number; floor: number }>; 
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
