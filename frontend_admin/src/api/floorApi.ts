import api from '../utils/api';

// UI no longer supports 'Reserved' as a distinct state; backend 'Reserved' is mapped to 'Occupied' in the component
export type SeatStatusUI = 'Available' | 'Occupied' | 'Maintenance';
// API may still return 'Reserved' for historical data; keep a separate type for API payloads
export type SeatStatusAPI = 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';

export interface FixedDeskSeat {
  seatCode: string;
  zone: string;
  status: SeatStatusAPI;
  posX?: number | null;
  posY?: number | null;
  capacity?: number | null;
}

export async function listFixedDesks(): Promise<FixedDeskSeat[]> {
  const res = await api.get('/api/space/floor1/fixed-desks');
  return res.data as FixedDeskSeat[];
}

export async function setSeatStatus(seatCode: string, status: SeatStatusUI): Promise<{ seatCode: string; status: SeatStatusUI }>{
  const res = await api.post(`/api/space/floor1/fixed-desks/${encodeURIComponent(seatCode)}/status`, { status });
  return res.data as { seatCode: string; status: SeatStatusUI };
}

export async function getFloorAIStatus(): Promise<{ peopleCount: number; lastUpdate: string | null }>{
  const res = await api.get('/api/space/floor1/ai/status');
  return res.data as { peopleCount: number; lastUpdate: string | null };
}

export async function updateFloorAIStatus(payload: { peopleCount: number; cameraId?: string; modelVersion?: string; extra?: any }): Promise<{ id: number; detectedAt: string }>{
  const res = await api.post('/api/space/floor1/ai/status', payload);
  return res.data as { id: number; detectedAt: string };
}

export interface FixedDeskSeatDetail extends FixedDeskSeat {
  user?: { id: number; name: string | null; email: string | null; phone: string | null } | null;
  booking?: {
    id: number;
    package: string | null;
    startDate: string;
    endDate: string;
    paymentStatus: 'Paid' | 'Pending' | 'Overdue' | null;
    bookingReference?: string | null;
    phase?: string | null;
  } | null;
}

export async function getFixedDeskDetail(seatCode: string): Promise<FixedDeskSeatDetail> {
  const res = await api.get(`/api/space/floor1/fixed-desks/${encodeURIComponent(seatCode)}/detail`);
  return res.data as FixedDeskSeatDetail;
}

export async function getFixedDeskAvailability(seatCode: string): Promise<{ seatCode: string; available: boolean; reason?: string }>{
  const res = await api.get(`/api/space/floor1/fixed-desks/${encodeURIComponent(seatCode)}/availability`);
  return res.data as { seatCode: string; available: boolean; reason?: string };
}

export async function cancelFixedDeskBooking(seatCode: string, bookingId: number, reason?: string): Promise<{ success: boolean }> {
  const res = await api.post(`/api/space/floor1/fixed-desks/${encodeURIComponent(seatCode)}/cancel-booking`, { bookingId, reason });
  return res.data as { success: boolean };
}

// -------- Seats CRUD --------
export async function createSeat(payload: { seatCode: string; capacity: number; zoneId?: number }): Promise<{ seatCode: string; capacity: number; zoneId: number; status: string }> {
  const res = await api.post('/api/space/floor1/fixed-desks', payload);
  return res.data;
}

export async function updateSeat(seatCode: string, payload: { newSeatCode?: string; capacity?: number }): Promise<{ seatCode: string; capacity?: number }> {
  const res = await api.put(`/api/space/floor1/fixed-desks/${encodeURIComponent(seatCode)}`, payload);
  return res.data;
}

export async function deleteSeat(seatCode: string): Promise<{ deleted: boolean; seatCode: string }> {
  const res = await api.delete(`/api/space/floor1/fixed-desks/${encodeURIComponent(seatCode)}`);
  return res.data;
}

// AI control (Active/Pause)
export async function getAIControl(): Promise<{ active: boolean }> {
  const res = await api.get('/api/space/floor1/ai/control');
  return res.data as { active: boolean };
}

export async function setAIControl(active: boolean): Promise<{ active: boolean }>{
  const res = await api.post('/api/space/floor1/ai/control', { active });
  return res.data as { active: boolean };
}

// Hot Desk AI control (separate namespace)
export async function getAIControlHD(): Promise<{ active: boolean }> {
  const res = await api.get('/api/space/floor1/ai-hd/control');
  return res.data as { active: boolean };
}

export async function setAIControlHD(active: boolean): Promise<{ active: boolean }>{
  const res = await api.post('/api/space/floor1/ai-hd/control', { active });
  return res.data as { active: boolean };
}

// Hot Desk occupancy at a specific datetime
export async function getHotDeskOccupancy(atISO: string): Promise<{
  at: string,
  breakdown: { day: number; week: number; month: number; year: number },
  totals: { totalSeats: number; booked: number; available: number; occupancyRate: number }
}> {
  const res = await api.get('/api/space/floor1/hot-desk/occupancy', { params: { at: atISO } });
  return res.data as any;
}

// ---------- Floor 2 AI control ----------
export async function getAIControlF2(): Promise<{ active: boolean }>{
  const res = await api.get('/api/space/floor2/ai/control');
  return res.data as { active: boolean };
}

export async function setAIControlF2(active: boolean): Promise<{ active: boolean }>{
  const res = await api.post('/api/space/floor2/ai/control', { active });
  return res.data as { active: boolean };
}

// ---------- Floor 3 AI control ----------
export async function getAIControlF3(): Promise<{ active: boolean }>{
  const res = await api.get('/api/space/floor3/ai/control');
  return res.data as { active: boolean };
}

export async function setAIControlF3(active: boolean): Promise<{ active: boolean }>{
  const res = await api.post('/api/space/floor3/ai/control', { active });
  return res.data as { active: boolean };
}

// -------- Rooms CRUD Floor 2 --------
export async function listFloor2Rooms(): Promise<{ roomCode: string; zone: string; status: string; capacity: number | null }[]> {
  const res = await api.get('/api/space/floor2/rooms');
  return res.data;
}
export async function createFloor2Room(payload: { roomCode: string; capacity: number; zoneId?: number; roomType?: 'meeting_room'|'private_office' }) { const r = await api.post('/api/space/floor2/rooms', payload); return r.data; }
export async function updateFloor2Room(roomCode: string, payload: { newRoomCode?: string; capacity?: number }) { const r = await api.put(`/api/space/floor2/rooms/${encodeURIComponent(roomCode)}`, payload); return r.data; }
export async function deleteFloor2Room(roomCode: string) { const r = await api.delete(`/api/space/floor2/rooms/${encodeURIComponent(roomCode)}`); return r.data; }

// -------- Rooms CRUD Floor 3 --------
export async function listFloor3Rooms(): Promise<{ roomCode: string; zone: string; status: string; capacity: number | null }[]> {
  const res = await api.get('/api/space/floor3/rooms');
  return res.data;
}
export async function createFloor3Room(payload: { roomCode: string; capacity: number; zoneId?: number }) { const r = await api.post('/api/space/floor3/rooms', payload); return r.data; }
export async function updateFloor3Room(roomCode: string, payload: { newRoomCode?: string; capacity?: number }) { const r = await api.put(`/api/space/floor3/rooms/${encodeURIComponent(roomCode)}`, payload); return r.data; }
export async function deleteFloor3Room(roomCode: string) { const r = await api.delete(`/api/space/floor3/rooms/${encodeURIComponent(roomCode)}`); return r.data; }

// ================= Fixed Desk (Floor 1) video upload & seat zones =================
export async function uploadFloor1Video(file: File): Promise<{ ok: boolean; filename: string; url: string }> {
  const form = new FormData();
  form.append('video', file);
  const res = await api.post('/api/space/floor1/ai/upload-video', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  return res.data;
}

export interface SeatZoneItem { seatCode: string; polygon: [number, number][] }
export async function listSeatZonesFloor1(): Promise<SeatZoneItem[]> {
  const res = await api.get('/api/space/floor1/ai/seat-zones');
  return (res.data?.items || []) as SeatZoneItem[];
}

export async function saveSeatZoneFloor1(seatCode: string, polygon: [number, number][]): Promise<{ ok: boolean; seatCode: string; polygon: [number, number][]; removed?: boolean }> {
  const res = await api.post('/api/space/floor1/ai/seat-zones', { seatCode, polygon });
  return res.data;
}
