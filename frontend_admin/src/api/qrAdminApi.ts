import api from '../utils/api';

export type QrMethod = 'camera' | 'manual' | 'upload';

export interface CheckInResponse {
  success: boolean;
  message: string;
  booking?: Record<string, unknown> | null;
  checkIn?: Record<string, unknown> | null;
  qrData?: Record<string, unknown> | null;
  alreadyCheckedIn?: boolean;
  activeCheckIn?: Record<string, unknown> | null;
  uploadInfo?: Record<string, unknown> | null;
}

export async function checkInWithQrCode(qrCode: string, method: QrMethod): Promise<CheckInResponse> {
  const { data } = await api.post('/api/qr/checkin', {
    qrCode,
    deviceInfo: {
      source: 'admin-portal',
      method,
      triggeredAt: new Date().toISOString()
    }
  });
  return data as CheckInResponse;
}

export async function uploadQrImageForCheckIn(file: File): Promise<CheckInResponse> {
  const formData = new FormData();
  formData.append('qrImage', file);
  const { data } = await api.post('/api/qr/upload-checkin', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data as CheckInResponse;
}
