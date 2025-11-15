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
  booking?: { id: number; package: string | null; startDate: string; endDate: string; paymentStatus: 'Paid' | 'Pending' | 'Overdue' | null } | null;
}

export async function getFixedDeskDetail(seatCode: string): Promise<FixedDeskSeatDetail> {
  const res = await api.get(`/api/space/floor1/fixed-desks/${encodeURIComponent(seatCode)}/detail`);
  return res.data as FixedDeskSeatDetail;
}

export async function getFixedDeskAvailability(seatCode: string): Promise<{ seatCode: string; available: boolean; reason?: string }>{
  const res = await api.get(`/api/space/floor1/fixed-desks/${encodeURIComponent(seatCode)}/availability`);
  return res.data as { seatCode: string; available: boolean; reason?: string };
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
