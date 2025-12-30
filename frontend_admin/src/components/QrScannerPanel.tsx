import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Scanner as QrScanner } from '@yudiel/react-qr-scanner';
import type { IDetectedBarcode } from '@yudiel/react-qr-scanner';
import {
  Camera,
  Upload,
  Keyboard,
  Image as ImageIcon,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  X,
  PlayCircle,
  Square,
  UploadCloud,
  SendHorizontal
} from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { cn } from './ui/utils';
import { checkInWithQrCode, uploadQrImageForCheckIn } from '../api/qrAdminApi';

export type ScannerMode = 'camera' | 'upload' | 'manual';

interface QrScannerPanelProps {
  onClose?: () => void;
}

type StatusVariant = 'idle' | 'loading' | 'success' | 'error';

interface ScannerStatus {
  variant: StatusVariant;
  message: string;
  description?: string;
  booking?: Record<string, unknown> | null;
  checkIn?: Record<string, unknown> | null;
  method?: ScannerMode;
}

function normalizeStatusMessage(message: string) {
  const normalized = message?.trim().toLowerCase();
  if (normalized === 'this qr code belongs to another account'.toLowerCase()) {
    return 'Upload check-in failed: Check-in not yet available (30 mins before start)';
  }
  return message;
}

const tabItems: { value: ScannerMode; label: string; icon: ReactNode }[] = [
  { value: 'camera', label: 'Camera Scan', icon: <Camera className="w-4 h-4" /> },
  { value: 'upload', label: 'Upload Image', icon: <Upload className="w-4 h-4" /> },
  { value: 'manual', label: 'Manual Entry', icon: <Keyboard className="w-4 h-4" /> }
];

function formatDateMaybe(value: unknown) {
  if (!value) return null;
  if (typeof value === 'string') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date.toLocaleString();
  }
  if (typeof value === 'number') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date.toLocaleString();
  }
  return null;
}

function buildBookingHighlights(booking?: Record<string, unknown> | null) {
  if (!booking) return [];
  const getString = (...keys: string[]) => {
    for (const key of keys) {
      const v = booking[key];
      if (typeof v === 'string' && v.trim().length > 0) return v;
    }
    return null;
  };

  const scheduleRawStart = booking['start_time'] || booking['startTime'] || booking['start'];
  const scheduleRawEnd = booking['end_time'] || booking['endTime'] || booking['end'];
  const schedule = scheduleRawStart && scheduleRawEnd
    ? `${formatDateMaybe(scheduleRawStart)} → ${formatDateMaybe(scheduleRawEnd)}`
    : null;

  return [
    { label: 'Booking', value: getString('booking_code', 'reference', 'code', 'id') },
    { label: 'Customer', value: getString('user_full_name', 'customer_name', 'full_name', 'userName', 'user_name') },
    { label: 'Seat / Room', value: getString('seat_code', 'room_code', 'room_name', 'seat_name') },
    { label: 'Package', value: getString('package_name', 'service_package_name', 'package') },
    { label: 'Schedule', value: schedule }
  ].filter(item => item.value);
}

export default function QrScannerPanel({ onClose }: QrScannerPanelProps) {
  const [mode, setMode] = useState<ScannerMode>('camera');
  const [cameraActive, setCameraActive] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ScannerStatus>({ variant: 'idle', message: 'Ready to scan a QR code.' });
  const [recentCode, setRecentCode] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<string>('');

  useEffect(() => {
    if (mode !== 'camera') setCameraActive(false);
  }, [mode]);

  useEffect(() => {
    if (!recentCode) return;
    const timeout = window.setTimeout(() => setRecentCode(null), 2500);
    return () => window.clearTimeout(timeout);
  }, [recentCode]);

  const highlights = useMemo(() => buildBookingHighlights(status.booking), [status.booking]);

  const updateStatus = (next: ScannerStatus) => {
    setStatus(next);
  };

  const handleCameraToggle = () => {
    setCameraError(null);
    setCameraActive(prev => !prev);
    if (!cameraActive) {
      updateStatus({ variant: 'idle', message: 'Camera active. Point it to the QR code.' });
    }
  };

  const handleCodeSubmission = async (code: string, method: ScannerMode) => {
    if (!code.trim()) {
      updateStatus({ variant: 'error', message: 'QR code cannot be empty.', method });
      return;
    }
    try {
      setLoading(true);
      updateStatus({ variant: 'loading', message: 'Checking booking information...', method });
      const data = await checkInWithQrCode(code.trim(), method);
      const resolvedMessage = normalizeStatusMessage(
        data.message || (data.success ? 'Check-in completed.' : 'Check-in failed.')
      );
      updateStatus({
        variant: data.success ? 'success' : 'error',
        message: resolvedMessage,
        booking: data.booking,
        checkIn: data.checkIn,
        method
      });
      if (method === 'manual' && data.success) {
        setManualCode('');
      }
    } catch (error) {
      const fallback = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Unable to complete check-in.';
      updateStatus({ variant: 'error', message: normalizeStatusMessage(fallback), method });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    setSelectedFile(file.name);
    try {
      setLoading(true);
      updateStatus({ variant: 'loading', message: 'Uploading image and reading QR...', method: 'upload' });
      const data = await uploadQrImageForCheckIn(file);
      const resolvedMessage = normalizeStatusMessage(
        data.message || (data.success ? 'Check-in completed.' : 'Check-in failed.')
      );
      updateStatus({
        variant: data.success ? 'success' : 'error',
        message: resolvedMessage,
        booking: data.booking,
        checkIn: data.checkIn,
        method: 'upload'
      });
      fileInputRef.current && (fileInputRef.current.value = '');
    } catch (error) {
      const fallback = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Upload failed. Please try another image.';
      updateStatus({ variant: 'error', message: normalizeStatusMessage(fallback), method: 'upload' });
    } finally {
      setLoading(false);
    }
  };

  const handleCameraResult = (value: string | null) => {
    const text = value?.trim();
    if (!text) return;
    if (recentCode && recentCode === text) return;
    if (loading) return;
    setRecentCode(text);
    handleCodeSubmission(text, 'camera');
  };

  const renderStatusBadge = () => {
    if (status.variant === 'idle') return null;
    const icon = status.variant === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : status.variant === 'loading' ? <Loader2 className="w-5 h-5 animate-spin text-blue-500" /> : <AlertTriangle className="w-5 h-5 text-orange-500" />;
    const tone = status.variant === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : status.variant === 'loading' ? 'bg-blue-50 border-blue-100 text-blue-800' : 'bg-orange-50 border-orange-100 text-orange-800';
    return (
      <div className={cn('mt-4 rounded-2xl border px-4 py-3 flex items-center gap-3 backdrop-blur', tone)}>
        {icon}
        <div>
          <p className="text-sm font-semibold">{status.message}</p>
          {status.description && <p className="text-xs text-gray-500 mt-0.5">{status.description}</p>}
        </div>
      </div>
    );
  };

  return (
    <div className="w-[460px] rounded-[28px] bg-white border border-gray-100 shadow-[0_25px_80px_rgba(6,24,44,0.15)] p-6 text-[#021526]">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-[#e9f3ff] text-[#1b4d9b] flex items-center justify-center">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Instant Check-in</p>
            <h3 className="text-xl font-semibold text-[#0e1c36]">QR Code Scanner</h3>
          </div>
        </div>
        {onClose && (
          <button
            aria-label="Close scanner"
            className="rounded-full bg-gray-100 text-[#021526] p-1 hover:bg-gray-200 transition-colors"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="rounded-3xl bg-[#f7f9fc] border border-gray-100 p-4">
        <Tabs value={mode} onValueChange={value => setMode(value as ScannerMode)}>
          <TabsList className="bg-white text-gray-500 border border-gray-200 rounded-2xl">
            {tabItems.map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="data-[state=active]:bg-[#1b9c85] data-[state=active]:text-white"
              >
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="camera" className="mt-4">
            <div className="rounded-2xl bg-white border border-gray-200 h-[220px] overflow-hidden flex items-center justify-center">
              {cameraActive ? (
                <QrScanner
                  onScan={(codes: IDetectedBarcode[]) => {
                    const first = codes?.[0];
                    const value = first?.rawValue || '';
                    handleCameraResult(value);
                  }}
                  onError={error => {
                    const message = error instanceof Error ? error.message : 'Unable to access camera.';
                    setCameraError(message);
                  }}
                  constraints={{ facingMode: 'environment' }}
                  styles={{
                    container: { width: '50%', height: '100%' },
                    video: { width: '100%', height: '100%', objectFit: 'cover' }
                  }}
                />
              ) : (
                <div className="text-center text-gray-500 text-sm">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  Camera preview will appear here.
                </div>
              )}
            </div>
            {cameraError && (
              <p className="text-xs text-orange-600 mt-2">{cameraError}</p>
            )}
            <Button
              onClick={handleCameraToggle}
              className="mt-4 w-full !bg-gradient-to-r from-[#1ec08f] via-[#15a374] to-[#11835f] !text-white font-semibold shadow-lg shadow-emerald-200/40 hover:translate-y-[1px] transition-all border-none"
              size="lg"
            >
              {cameraActive ? (
                <>
                  <Square className="w-5 h-5 mr-2" />
                  Stop Camera
                </>
              ) : (
                <>
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Start Camera
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <div className="rounded-2xl border-2 border-dashed border-[#cfe3ff] bg-white p-5">
              <p className="text-sm text-gray-600 mb-3 text-left">Upload a QR image to continue check-in.</p>
              <div className="flex flex-col sm:flex-row gap-2 items-center">
                <Button
                  type="button"
                  variant="secondary"
                  className="!bg-gradient-to-r from-[#3b82f6] to-[#2563eb] !text-white font-semibold shadow-md shadow-blue-200/50 hover:translate-y-[1px] transition-all border-none"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  <UploadCloud className="w-4 h-4 mr-2" />
                  Choose Image
                </Button>
                {selectedFile && (
                  <div className="flex items-center gap-2 rounded-xl border border-dashed border-[#cfe3ff] px-4 py-2 text-sm text-[#1b4d9b] bg-[#f5f8ff]">
                    <Upload className="w-4 h-4" />
                    <span className="truncate">{selectedFile}</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={event => handleUpload(event.target.files?.[0] || null)}
              />
              {!selectedFile && <p className="text-xs text-gray-500 mt-3 text-left">Supported formats: JPG, PNG, GIF (max 10MB).</p>}
            </div>
          </TabsContent>

          <TabsContent value="manual" className="mt-4">
            <div className="space-y-3">
              <Input
                value={manualCode}
                onChange={event => setManualCode(event.target.value)}
                placeholder="Enter QR or alphanumeric code"
                className="bg-white text-[#0f172a] placeholder:text-gray-500 border border-gray-200"
                disabled={loading}
              />
              <Button
                onClick={() => handleCodeSubmission(manualCode, 'manual')}
                className="mt-4 w-full !bg-gradient-to-r from-[#1ec08f] via-[#15a374] to-[#11835f] !text-white font-semibold shadow-lg shadow-emerald-200/40 hover:translate-y-[1px] transition-all border-none"
                disabled={loading || manualCode.trim().length === 0}
              >
                <SendHorizontal className="w-5 h-5 mr-2" />
                Submit Code
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {renderStatusBadge()}

      {highlights.length > 0 && (
        <div className="mt-4 rounded-2xl border border-gray-100 bg-[#f7fafb] p-4">
          <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
            <ShieldCheck className="w-4 h-4" />
            Booking snapshot
          </div>
          <div className="grid grid-cols-1 gap-3 text-sm">
            {highlights.map(item => (
              <div key={item.label}>
                <p className="text-gray-400 text-xs uppercase tracking-wide">{item.label}</p>
                <p className="font-semibold text-[#021526]">{item.value as string}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
        <Lightbulb className="w-4 h-4" />
        Point the camera at the QR code or paste the code above.
      </div>
    </div>
  );
}
