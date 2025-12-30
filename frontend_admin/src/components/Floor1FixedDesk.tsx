import { useCallback, useEffect, useRef, useState } from "react";
import { 
  Search, 
  Download, 
  Plus, 
  Edit,
  Video, 
  Users,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Filter,
  Maximize,
  Eye,
  Activity,
  AlertCircle,
  Play,
  Pause,
  Upload as UploadIcon,
  RefreshCcw
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { toast } from "sonner";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import dayjs from "dayjs";
import { listFixedDesks, setSeatStatus as apiSetSeatStatus, getFixedDeskDetail, getAIControl, setAIControl, createSeat, updateSeat, deleteSeat, uploadFloor1Video, listSeatZonesFloor1, saveSeatZoneFloor1, SeatZoneItem, cancelFixedDeskBooking } from "../api/floorApi";
import type { FixedDeskSeat, FixedDeskSeatDetail } from "../api/floorApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Label } from "./ui/label";
import { FLOOR1_SEAT_POSITIONS } from "../config/floor1SeatPositions";

// dayjs used for formatting activity timestamps (HH:mm:ss)

// ==================== FIXED DESK TYPES ====================
interface Seat {
  id: string;
  zone: string;
  status: "Available" | "Occupied" | "Maintenance";
  capacity?: number | null;
  posX?: number | null;
  posY?: number | null;
  user?: {
    name: string;
    email: string;
    phone: string;
  };
  booking?: {
    id?: number;
    package: string;
    startDate: string;
    endDate: string;
    paymentStatus: "Paid" | "Pending" | "Overdue";
    bookingReference?: string;
    phase?: string | null;
  };
}

interface AIStatus {
  cameraName: string;
  status: "online" | "offline";
  detectedPeople: number;
  lastUpdate: string;
}

// ==================== FIXED DESK DATA ====================
/* const fixedDeskSeats: Seat[] = [
  { 
    id: "FD-01", 
    zone: "Zone A", 
    status: "Occupied",
    user: { name: "Nguyễn Văn A", email: "nguyenvana@email.com", phone: "0901234567" },
    booking: { 
      package: "Monthly Premium", 
      startDate: "2025-10-01", 
      endDate: "2025-11-01",
      paymentStatus: "Paid"
    }
  },
  { id: "FD-02", zone: "Zone A", status: "Available" },
  { 
    id: "FD-03", 
    zone: "Zone A", 
    status: "Reserved",
    user: { name: "Trần Thị B", email: "tranthib@email.com", phone: "0912345678" },
    booking: { 
      package: "Daily Pass", 
      startDate: "2025-10-21", 
      endDate: "2025-10-21",
      paymentStatus: "Pending"
    }
  },
  { id: "FD-04", zone: "Zone A", status: "Available" },
  { 
    id: "FD-05", 
    zone: "Zone A", 
    status: "Occupied",
    user: { name: "Lê Văn C", email: "levanc@email.com", phone: "0923456789" },
    booking: { 
      package: "Weekly Pass", 
      startDate: "2025-10-15", 
      endDate: "2025-10-22",
      paymentStatus: "Paid"
    }
  },
  { id: "FD-06", zone: "Zone B", status: "Available" },
  { id: "FD-07", zone: "Zone B", status: "Maintenance" },
  { id: "FD-08", zone: "Zone B", status: "Occupied",
    user: { name: "Phạm Thị D", email: "phamthid@email.com", phone: "0934567890" },
    booking: { 
      package: "Monthly Standard", 
      startDate: "2025-10-01", 
      endDate: "2025-11-01",
      paymentStatus: "Overdue"
    }
  },
  { id: "FD-09", zone: "Zone B", status: "Available" },
  { id: "FD-10", zone: "Zone B", status: "Reserved",
    user: { name: "Hoàng Văn E", email: "hoangvane@email.com", phone: "0945678901" },
    booking: { 
      package: "Daily Pass", 
      startDate: "2025-10-21", 
      endDate: "2025-10-21",
      paymentStatus: "Paid"
    }
  },
  { id: "FD-11", zone: "Zone C", status: "Available" },
  { id: "FD-12", zone: "Zone C", status: "Occupied",
    user: { name: "Vũ Thị F", email: "vuthif@email.com", phone: "0956789012" },
    booking: { 
      package: "Monthly Premium", 
      startDate: "2025-10-10", 
      endDate: "2025-11-10",
      paymentStatus: "Paid"
    }
  },
  { id: "FD-13", zone: "Zone C", status: "Available" },
  { id: "FD-14", zone: "Zone C", status: "Available" },
  { id: "FD-15", zone: "Zone C", status: "Occupied",
    user: { name: "Đỗ Văn G", email: "dovang@email.com", phone: "0967890123" },
    booking: { 
      package: "Weekly Pass", 
      startDate: "2025-10-17", 
      endDate: "2025-10-24",
      paymentStatus: "Paid"
    }
  },
]; */

const aiCameras: AIStatus[] = [
  {
    cameraName: "Main Entrance Camera",
    status: "online",
    detectedPeople: 8,
    lastUpdate: "1 min ago"
  },
  {
    cameraName: "Workspace Area 1",
    status: "online",
    detectedPeople: 12,
    lastUpdate: "2 mins ago"
  },
  {
    cameraName: "Workspace Area 2",
    status: "online",
    detectedPeople: 15,
    lastUpdate: "1 min ago"
  },
  {
    cameraName: "Back Area",
    status: "offline",
    detectedPeople: 0,
    lastUpdate: "15 mins ago"
  }
];

export default function Floor1FixedDesk() {
  // Enable live AI for Fixed Desk with per-seat events
  const LIVE_AI = true;
  const [seats, setSeats] = useState<Seat[]>([]);
  const [searchSeat, setSearchSeat] = useState("");
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  // Zone filter removed per request
  const [showFilters, setShowFilters] = useState(false);
  const [aiPeopleCount, setAiPeopleCount] = useState<number>(0);
  const [aiActive, setAiActive] = useState<boolean>(false);
  const [aiReady, setAiReady] = useState<boolean>(false);
  const evtRef = useRef<EventSource | null>(null);
  const [boxes, setBoxes] = useState<{id?:number;x1:number;y1:number;x2:number;y2:number}[]>([]);
  const [frame, setFrame] = useState<string|null>(null);
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  // Video upload & seat zone editor
  const fileInputRef = useRef<HTMLInputElement|null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<string|null>(null); // backend /uploads url
  const [showZoneEditor, setShowZoneEditor] = useState(false);
  const [seatZones, setSeatZones] = useState<SeatZoneItem[]>([]);
  const [editingSeatCode, setEditingSeatCode] = useState<string>("");
  const editorCanvasRef = useRef<HTMLCanvasElement|null>(null);
  const editorImageRef = useRef<HTMLImageElement|null>(null);
  const [editorPoints, setEditorPoints] = useState<[number,number][]>([]);
  const [editorPreview, setEditorPreview] = useState<string|null>(null);
  const [editorPreviewStatus, setEditorPreviewStatus] = useState<'idle'|'loading'|'ready'|'ready-video'|'error'>('idle');
  const editorVideoRef = useRef<HTMLVideoElement|null>(null);
  const [isSavingZone, setIsSavingZone] = useState(false);
  // Tránh xung đột khi vừa cập nhật thủ công xong thì auto-refresh kéo dữ liệu cũ về
  const lastManualChangeRef = useRef<number>(0);
  // CRUD dialog state
  const [showAddSeat, setShowAddSeat] = useState(false);
  const [showEditSeat, setShowEditSeat] = useState(false);
  const [newSeatCode, setNewSeatCode] = useState("");
  const [newSeatCapacity, setNewSeatCapacity] = useState<number>(1);
  const [editSeatCode, setEditSeatCode] = useState("");
  const [editSeatCapacity, setEditSeatCapacity] = useState<number>(1);

  // Bỏ logic bắt buộc tiền tố FD: chỉ giữ nguyên mã người dùng nhập.
  const getSeatNumber = (id: string) => {
    const m = id.match(/FD-?0*(\d+)/i);
    return m ? parseInt(m[1], 10) : Number.POSITIVE_INFINITY; // mã tùy ý sẽ đẩy xuống cuối khi sort số
  };

  const mapSeatResponse = useCallback((items: FixedDeskSeat[]): Seat[] => (
    items.map(d => ({
      id: d.seatCode,
      zone: d.zone,
      status: (d.status === 'Reserved' ? 'Occupied' : d.status) as Seat["status"],
      posX: d.posX ?? null,
      posY: d.posY ?? null,
      capacity: (d as any).capacity ?? 1
    })).sort((a, b) => {
      const na = getSeatNumber(a.id);
      const nb = getSeatNumber(b.id);
      if (na === nb) return a.id.localeCompare(b.id);
      return na - nb;
    })
  ), []);

  const buildSeatFromDetail = useCallback((detail: FixedDeskSeatDetail, fallback?: Seat | null): Seat => ({
    id: detail.seatCode,
    zone: detail.zone,
    status: (detail.status === 'Reserved' ? 'Occupied' : detail.status) as Seat["status"],
    posX: detail.posX ?? fallback?.posX ?? null,
    posY: detail.posY ?? fallback?.posY ?? null,
    capacity: detail.capacity ?? fallback?.capacity ?? 1,
    user: detail.user ? {
      name: detail.user.name || '',
      email: detail.user.email || '',
      phone: detail.user.phone || ''
    } : undefined,
    booking: detail.booking ? {
      id: detail.booking.id,
      package: detail.booking.package || '',
      startDate: detail.booking.startDate,
      endDate: detail.booking.endDate,
      paymentStatus: (detail.booking.paymentStatus || 'Pending') as 'Paid' | 'Pending' | 'Overdue',
      bookingReference: detail.booking.bookingReference || undefined,
      phase: detail.booking.phase || undefined
    } : undefined
  }), []);

  const formatBookingDate = (value?: string) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '—');

  // Sync AI control on mount so toggle reflects current backend state
  useEffect(() => {
    (async () => {
      try {
        const ctl = await getAIControl();
        setAiActive(!!ctl.active);
      } catch { /* ignore */ }
      // restore uploaded video url from localStorage (persist across reloads)
      try {
        const v = localStorage.getItem('f1_fixed_video_url');
        if (v) setUploadedVideo(v);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await listFixedDesks();
        const mapped = mapSeatResponse(data);
        setSeats(mapped);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load seats');
      }
    })();
  }, [mapSeatResponse]);

  // Auto refresh seats định kỳ để đồng bộ với backend (chuẩn bị cho việc user đặt chỗ -> admin tự lên màu)
  useEffect(() => {
    const REFRESH_MS = 10000; // 10s là mức an toàn; có thể giảm xuống 3-5s khi backend sẵn sàng
    const timer = setInterval(async () => {
      if (Date.now() - (lastManualChangeRef.current || 0) < 2000) return;
      try {
        const data = await listFixedDesks();
        const mapped = mapSeatResponse(data);
        setSeats(mapped);
      } catch {}
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [mapSeatResponse]);

  // Global event from parent to open Add Seat form
  useEffect(() => {
    const handler = () => {
      setNewSeatCode("");
      setNewSeatCapacity(1);
      setShowAddSeat(true);
    };
    window.addEventListener('open-add-seat-form', handler);
    return () => window.removeEventListener('open-add-seat-form', handler);
  }, []);

  // Open SSE when AI is active
  useEffect(() => {
    if (!LIVE_AI) return;
    const BACKEND = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:5000';
    if (aiActive) {
      if (evtRef.current) {
        evtRef.current.close();
        evtRef.current = null;
      }
      const es = new EventSource(`${BACKEND}/api/space/floor1/ai/stream`, { withCredentials: false } as any);
      let last = aiPeopleCount;
      es.addEventListener('ai.people', (ev: MessageEvent) => {
        try {
          const data = JSON.parse(ev.data || '{}');
          // Nhận frame & boxes để hiển thị lên canvas chính
          if (data.frame) setFrame(data.frame as string);
          if (Array.isArray(data.boxes)) setBoxes(data.boxes as any);
          if (typeof data.peopleCount === 'number') {
            const now = data.peopleCount as number;
            setAiPeopleCount(now);
            if (!aiReady) setAiReady(true);
            const timeText = dayjs().format('HH:mm:ss');
            if (now === 0 && last > 0) {
              setDynamicActivities(prev => ([{ color: 'green' as const, text: 'Floor 1 is now empty', time: timeText }, ...prev].slice(0, 30)));
            } else if (last === 0 && now > 0) {
              setDynamicActivities(prev => ([{ color: 'blue' as const, text: `People detected: ${now}`, time: timeText }, ...prev].slice(0, 30)));
            } else if (now !== last) {
              const change = now > last ? 'arrived' : 'left';
              const color = now > last ? 'blue' as const : 'orange' as const;
              setDynamicActivities(prev => ([{ color, text: `People ${change}. Count: ${now}`, time: timeText }, ...prev].slice(0, 30)));
            }
            last = now;
          }
        } catch {}
      });
      // Listen for per-seat occupancy events
      es.addEventListener('ai.seat', (ev: MessageEvent) => {
        try {
          const data = JSON.parse(ev.data || '{}');
          const seatCode: string | undefined = data.seatCode;
          const occupied: boolean | undefined = data.occupied;
          if (seatCode && typeof occupied === 'boolean') {
            const timeText = dayjs().format('HH:mm:ss');
            const text = occupied ? `${seatCode} became occupied` : `${seatCode} available`;
            const color = occupied ? 'blue' as const : 'orange' as const;
            setDynamicActivities(prev => ([{ color, text, time: timeText }, ...prev].slice(0, 30)));
          }
        } catch {}
      });
      es.addEventListener('ai.control', (ev: MessageEvent) => {
        try {
          const data = JSON.parse(ev.data || '{}');
          const active = !!data.active;
          setAiActive(active);
          if (!active) {
            setDynamicActivities([]);
            setAiPeopleCount(0);
            setAiReady(false);
          }
        } catch {}
      });
      evtRef.current = es;
      return () => { es.close(); evtRef.current = null; };
    } else {
      if (evtRef.current) { evtRef.current.close(); evtRef.current = null; }
    }
  }, [aiActive]);

  // (Removed relative time updater since Last Detection is removed for Floor 1)

  // Fixed Desk Stats
  const totalSeats = seats.length;
  const occupiedSeats = seats.filter(s => s.status === "Occupied").length;
  const availableSeats = seats.filter(s => s.status === "Available").length;
  const maintenanceSeats = seats.filter(s => s.status === "Maintenance").length;
  // Derived UI values to avoid showing stale data when paused/booting
    // Vẽ frame + boxes lên canvas khi có frame mới
    useEffect(() => {
      if (!frame) return;
      const canvas = canvasRef.current; if (!canvas) return;
      const ctx = canvas.getContext('2d'); if (!ctx) return;
      const img = new Image();
      img.onload = () => {
        const maxH = 420; const scale = maxH / img.height;
        canvas.width = img.width * scale; canvas.height = img.height * scale;
        ctx.drawImage(img,0,0,canvas.width,canvas.height);
        boxes.forEach((b,i) => {
          const x = b.x1 * canvas.width; const y = b.y1 * canvas.height;
          const w = (b.x2 - b.x1) * canvas.width; const h = (b.y2 - b.y1) * canvas.height;
          ctx.strokeStyle = '#ff0055'; ctx.lineWidth = 2; ctx.strokeRect(x,y,w,h);
          const label = `${i+1}`; const pad=4; ctx.font='12px sans-serif';
          const tw=ctx.measureText(label).width;
          ctx.fillStyle='rgba(255,0,85,0.85)';
          ctx.fillRect(x, Math.max(0,y-16), tw+pad*2,16);
          ctx.fillStyle='#fff';
          ctx.fillText(label, x+pad, Math.max(10,y-4));
        });
      };
      img.src = 'data:image/jpeg;base64,' + frame;
    }, [frame, boxes]);

    // Upload handler
    const handleSelectVideo = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const res = await uploadFloor1Video(file);
        setUploadedVideo(res.url);
        try { localStorage.setItem('f1_fixed_video_url', res.url); } catch {}
        setAiReady(false);
        setAiPeopleCount(0);
        setDynamicActivities([]);
        if (aiActive) {
          setAiActive(false);
          toast.success('Video uploaded. AI paused; press Active to run the new video.');
        } else {
          toast.success('Video uploaded. Press Active to start.');
        }
      } catch (err:any) {
        toast.error(err?.response?.data?.error || 'Upload failed');
      }
    };

    // Mở editor zones
    const openZoneEditor = async () => {
      let items: SeatZoneItem[] = [];
      try {
        items = await listSeatZonesFloor1();
      } catch {
        items = [];
      }
      setSeatZones(items);
      const preferredSeat = (() => {
        if (editingSeatCode && seats.some(s => s.id === editingSeatCode)) return editingSeatCode;
        if (seats.length) return seats[0].id;
        if (items.length) return items[0].seatCode;
        return '';
      })();
      setEditingSeatCode(preferredSeat);
      if (preferredSeat) {
        const existing = items.find(z => z.seatCode === preferredSeat);
        setEditorPoints(existing ? (existing.polygon as any) : []);
      } else {
        setEditorPoints([]);
      }
      setShowZoneEditor(true);
    };

    const handleUndoPoint = useCallback(() => {
      setEditorPoints(prev => prev.slice(0, -1));
    }, []);

    const handleSaveZone = useCallback(async () => {
      const seatCode = editingSeatCode.trim();
      if (!seatCode) {
        toast.error('Select a seat first');
        return;
      }
      if (editorPoints.length > 0 && editorPoints.length < 3) {
        toast.error('Need at least 3 points');
        return;
      }
      try {
        setIsSavingZone(true);
        const result = await saveSeatZoneFloor1(seatCode, editorPoints as any);
        setSeatZones(prev => {
          const remaining = prev.filter(z => z.seatCode !== seatCode);
          const nextPolygon = (result?.polygon ?? editorPoints) as any;
          if (!nextPolygon?.length) return remaining;
          return [...remaining, { seatCode, polygon: nextPolygon }];
        });
        const removed = !editorPoints.length || result?.removed;
        toast.success(removed ? 'Seat zone cleared' : 'Seat zone saved');
      } catch (err: any) {
        toast.error(err?.response?.data?.error || 'Save failed');
      } finally {
        setIsSavingZone(false);
      }
    }, [editingSeatCode, editorPoints, setSeatZones]);

    // Click canvas thêm điểm polygon
    const handleEditorClick = (ev: any) => {
      const canvas = editorCanvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = (ev.clientX - rect.left) / rect.width;
      const y = (ev.clientY - rect.top) / rect.height;
      setEditorPoints(prev => [...prev, [x,y]]);
    };

    // Khi mở trình chỉnh sửa zone, lấy frame mới nhất hoặc chụp từ video để dùng làm nền
    useEffect(() => {
      if (!showZoneEditor) {
        setEditorPreview(null);
        setEditorPreviewStatus('idle');
        return;
      }
      if (frame) {
        setEditorPreview(`data:image/jpeg;base64,${frame}`);
        setEditorPreviewStatus('ready');
        return;
      }
      if (!uploadedVideo) {
        setEditorPreview(null);
        setEditorPreviewStatus('error');
        return;
      }

      let isActive = true;
      setEditorPreviewStatus('loading');

      const captureFromVideo = async () => {
        try {
          const cacheBustedUrl = uploadedVideo + (uploadedVideo.includes('?') ? '&' : '?') + 'snap=' + Date.now();
          const response = await fetch(cacheBustedUrl, {
            credentials: 'include',
            cache: 'no-store'
          });
          if (!response.ok) throw new Error('Unable to download uploaded video');
          const blob = await response.blob();
          if (!isActive) return;

          const still = await new Promise<string>((resolve, reject) => {
            const objectUrl = URL.createObjectURL(blob);
            const videoEl = document.createElement('video');
            videoEl.preload = 'auto';
            videoEl.muted = true;
            videoEl.playsInline = true;

            const cleanup = () => {
              videoEl.pause();
              videoEl.removeAttribute('src');
              try { videoEl.load(); } catch { /* ignore */ }
              URL.revokeObjectURL(objectUrl);
            };

            const drawFrame = () => {
              if (!isActive) {
                cleanup();
                reject(new Error('Seat zone dialog closed'));
                return;
              }
              const vw = videoEl.videoWidth || 0;
              const vh = videoEl.videoHeight || 0;
              if (!vw || !vh) {
                cleanup();
                reject(new Error('Video dimensions unavailable'));
                return;
              }
              const canvas = document.createElement('canvas');
              canvas.width = vw;
              canvas.height = vh;
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                cleanup();
                reject(new Error('Canvas not supported'));
                return;
              }
              ctx.drawImage(videoEl, 0, 0, vw, vh);
              const base64 = canvas.toDataURL('image/jpeg', 0.9);
              cleanup();
              resolve(base64);
            };

            videoEl.addEventListener('seeked', () => drawFrame(), { once: true });
            videoEl.addEventListener('loadedmetadata', () => {
              if (!isActive) {
                cleanup();
                reject(new Error('Seat zone dialog closed'));
                return;
              }
              try {
                const targetTime = Math.min(0.1, Math.max(0, (videoEl.duration || 0.1) - 0.1));
                videoEl.currentTime = targetTime;
              } catch {
                drawFrame();
              }
            }, { once: true });
            videoEl.onerror = () => {
              cleanup();
              reject(new Error('Video element failed to load'));
            };

            videoEl.src = objectUrl;
          });

          if (!isActive) return;
          setEditorPreview(still);
          setEditorPreviewStatus('ready');
        } catch (err) {
          console.warn('Seat zone preview capture failed', err);
          if (!isActive) return;
          setEditorPreview(null);
          setEditorPreviewStatus('ready-video');
        }
      };

      captureFromVideo();

      return () => {
        isActive = false;
      };
    }, [showZoneEditor, frame, uploadedVideo]);

    // Key shortcuts u=undo r=reset s=save q=quit
    useEffect(() => {
      if (!showZoneEditor) return;
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'u') {
          e.preventDefault();
          handleUndoPoint();
        } else if (e.key === 'r') {
          e.preventDefault();
          setEditorPoints([]);
        } else if (e.key === 'q') {
          e.preventDefault();
          setShowZoneEditor(false);
        } else if (e.key === 's') {
          e.preventDefault();
          handleSaveZone();
        }
      };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }, [showZoneEditor, handleUndoPoint, handleSaveZone]);

    useEffect(() => {
      if (!showZoneEditor) return;
      const onResize = () => setEditorPoints(prev => prev.slice());
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }, [showZoneEditor]);

    // Vẽ polygon đồ họa editor
    useEffect(() => {
      if (!showZoneEditor) return;
      const canvas = editorCanvasRef.current; if (!canvas) return;
      const ctx = canvas.getContext('2d'); if (!ctx) return;
      const img = editorImageRef.current;
      const vid = editorVideoRef.current;
      const baseW = img ? (img.clientWidth || img.naturalWidth) : (vid ? vid.clientWidth || vid.videoWidth : undefined);
      const baseH = img ? (img.clientHeight || img.naturalHeight) : (vid ? vid.clientHeight || vid.videoHeight : undefined);
      const targetW = baseW || (canvas.clientWidth || 1);
      const targetH = baseH || (canvas.clientHeight || 1);
      canvas.width = Math.max(1, targetW);
      canvas.height = Math.max(1, targetH);
      ctx.clearRect(0,0,canvas.width,canvas.height);
      if (editorPoints.length) {
        ctx.strokeStyle='#00ff88'; ctx.lineWidth=2; ctx.beginPath();
        editorPoints.forEach(([x,y],i)=>{ const px=x*canvas.width; const py=y*canvas.height; if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py); });
        ctx.closePath(); ctx.stroke();
        editorPoints.forEach(([x,y])=>{ const px=x*canvas.width; const py=y*canvas.height; ctx.fillStyle='#00ff88'; ctx.beginPath(); ctx.arc(px,py,4,0,Math.PI*2); ctx.fill(); });
      }
    }, [editorPoints, showZoneEditor, editorPreview]);
  const displayCameraActive = LIVE_AI && aiActive && aiReady ? '1/1' : '0/1';
  const displayPeopleText = (LIVE_AI && aiActive && aiReady) ? String(aiPeopleCount) : '—';


  // Filter Fixed Desk seats
  const filteredSeats = seats.filter(seat => {
    const matchesSearch = seat.id.toLowerCase().includes(searchSeat.toLowerCase()) ||
                         seat.zone.toLowerCase().includes(searchSeat.toLowerCase());
    const matchesStatus = statusFilter === "all" || seat.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a,b) => getSeatNumber(a.id) - getSeatNumber(b.id));

  // Dùng cấu hình toạ độ thay vì edge markers

  const handleSeatClick = async (seat: Seat) => {
    setSelectedSeat(seat);
    try {
      const detail = await getFixedDeskDetail(seat.id);
      setSelectedSeat(buildSeatFromDetail(detail, seat));
    } catch (e) {
      // Không bắt buộc có chi tiết; giữ nguyên seat cơ bản
    }
  };

  const applySeatStatus = async (status: Seat["status"]) => {
    if (!selectedSeat) return;
    try {
      // Nếu có seat trong DB thì gọi API; nếu không, chỉ cập nhật local để demo click
      const targetNum = getSeatNumber(selectedSeat.id);
      const exists = seats.some(s => getSeatNumber(s.id) === targetNum);
      if (exists) {
        await apiSetSeatStatus(selectedSeat.id, status);
      }
      lastManualChangeRef.current = Date.now();
      setSeats(prev => prev.map(s => (getSeatNumber(s.id) === targetNum ? { ...s, status } : s)));
      setSelectedSeat(s => (s ? { ...s, status } : s));
      toast.success(`Seat ${selectedSeat.id} updated to ${status}` + (exists ? '' : ' (local)'));
    } catch (e:any) {
      toast.error(e?.response?.data?.error || 'Failed to update seat');
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedSeat?.booking?.id) {
      toast.error('No active booking to cancel');
      return;
    }
    const label = selectedSeat.booking.bookingReference || selectedSeat.id;
    if (!window.confirm(`Cancel booking ${label}?`)) return;
    try {
      await cancelFixedDeskBooking(selectedSeat.id, selectedSeat.booking.id);
      toast.success('Booking cancelled');
      const detail = await getFixedDeskDetail(selectedSeat.id);
      const normalized = buildSeatFromDetail(detail, selectedSeat);
      setSelectedSeat(normalized);
      const refreshed = await listFixedDesks();
      setSeats(mapSeatResponse(refreshed));
      lastManualChangeRef.current = Date.now();
    } catch (err:any) {
      toast.error(err?.response?.data?.error || 'Failed to cancel booking');
    }
  };

  const handleExportReport = () => {
    toast.success("Exporting report...");
  };

  const toggleAIActive = async () => {
    const next = !aiActive;
    if (next && !uploadedVideo) {
      toast.error('Please upload a video before activating AI.');
      return;
    }
    try {
      const res = await setAIControl(next);
      const nowActive = !!res.active;
      setAiActive(nowActive);
      if (!nowActive) {
        setDynamicActivities([]);
        setAiPeopleCount(0);
      }
      toast.success(nowActive ? 'AI camera activated' : 'AI camera paused');
    } catch (err:any) {
      const msg = err?.response?.data?.error || 'Failed to toggle AI';
      toast.error(msg);
      if (msg && msg.toLowerCase().includes('upload a video')) {
        setUploadedVideo(null);
        try { localStorage.removeItem('f1_fixed_video_url'); } catch {}
      }
    }
  };

  const [dynamicActivities, setDynamicActivities] = useState<{ color: 'green'|'orange'|'red'|'blue'; text: string; time: string }[]>([]);


  return (
    <>
      {/* Stats Cards - Fixed Desk */}
  <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-[56px] h-[56px] bg-gray-100 rounded-[12px] flex items-center justify-center">
              <svg className="w-7 h-7 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 11h2v2H7zm0 4h2v2H7zm4-4h2v2h-2zm0 4h2v2h-2zm4-4h2v2h-2zm0 4h2v2h-2z"/>
                <path d="M5 22h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2h-2V2h-2v2H9V2H7v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2zM19 8l.001 12H5V8h14z"/>
              </svg>
            </div>
            <div>
              <p className="text-[13px] text-gray-600 mb-1">Total Seats</p>
              <p className="text-[28px] font-semibold text-[#021526]">{totalSeats}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-[56px] h-[56px] bg-green-50 rounded-[12px] flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <p className="text-[13px] text-gray-600 mb-1">Available</p>
              <p className="text-[28px] font-semibold text-[#021526]">{availableSeats}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-[56px] h-[56px] bg-blue-50 rounded-[12px] flex items-center justify-center">
              <Users className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <p className="text-[13px] text-gray-600 mb-1">Occupied</p>
              <p className="text-[28px] font-semibold text-[#021526]">{occupiedSeats}</p>
            </div>
          </div>
        </div>

        

        <div className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-[56px] h-[56px] bg-red-50 rounded-[12px] flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <p className="text-[13px] text-gray-600 mb-1">Maintenance</p>
              <p className="text-[28px] font-semibold text-[#021526]">{maintenanceSeats}</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Status & Activity Log Row */}
      <div className="grid grid-cols-[1fr_400px] gap-6 mb-6">
        {/* AI Status Panel */}
        <Card className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-[48px] h-[48px] bg-purple-50 rounded-[12px] flex items-center justify-center">
                <Video className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-[18px] font-semibold text-[#021526]">AI Occupancy Detection</h3>
                <p className="text-[13px] text-gray-600">Real-time monitoring status</p>
              </div>
            </div>
            <Badge className={`${aiActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'} border-0`}>{aiActive ? 'Active' : 'Paused'}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-[12px] p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[12px] text-gray-600">Cameras Active</span>
              </div>
              <p className="text-[24px] font-semibold text-[#021526]">{displayCameraActive}</p>
            </div>

            <div className="bg-gray-50 rounded-[12px] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-3 h-3 text-gray-600" />
                <span className="text-[12px] text-gray-600">People counting</span>
              </div>
              <p className="text-[24px] font-semibold text-[#021526]">{displayPeopleText}</p>
            </div>
          </div>

          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-gray-700 font-medium">Floor 1 camera</span>
              <div className="flex gap-2 flex-wrap">
                <Button
                  type="button"
                  onClick={() => { if (LIVE_AI) { toggleAIActive(); } }}
                  disabled={!LIVE_AI}
                  className={`rounded-[8px] h-[34px] px-3 text-[13px] font-semibold ${!LIVE_AI ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={aiActive 
                    ? { backgroundColor: '#dc2626', color: '#ffffff', border: '1px solid #b91c1c' } 
                    : { backgroundColor: '#16a34a', color: '#ffffff', border: '1px solid #15803d' }}
                >
                  {aiActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {aiActive ? 'Pause' : 'Active'}
                </Button>
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-[8px] h-[34px] px-3 text-[13px] font-semibold text-white hover:brightness-95"
                  style={{ backgroundColor: '#2563eb', border: '1px solid #1d4ed8' }}
                ><UploadIcon className="w-3.5 h-3.5 mr-1"/>Upload video</Button>
                <Button
                  type="button"
                  onClick={openZoneEditor}
                  className="rounded-[8px] h-[34px] px-3 text-[13px] font-semibold text-white hover:brightness-95"
                  style={{ backgroundColor: '#ccda2eff', border: '1px solid #b5c162ff' }}
                ><Edit className="w-3.5 h-3.5 mr-1"/>Edit seat zones</Button>
              </div>
            </div>
            {/* Canvas hiển thị AI YOLO frame */}
            <div className="relative h-[420px] w-full rounded-[16px] overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800 border-[3px] border-[#317752] shadow-[0_0_0_1px_rgba(49,119,82,0.4),0_4px_16px_-2px_rgba(0,0,0,0.4)]">
              <canvas ref={canvasRef} style={{height:'100%',width:'100%'}} />
              {!aiActive && <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-[13px]">Camera paused</div>}
              {aiActive && aiReady && !frame && <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-[13px]">Waiting for frames...</div>}
              <div className="pointer-events-none absolute inset-0 grid grid-cols-2 grid-rows-2">
                <div className="border-t border-l border-white/10" />
                <div className="border-t border-r border-white/10" />
                <div className="border-b border-l border-white/10" />
                <div className="border-b border-r border-white/10" />
              </div>
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="video/mp4" className="hidden" style={{display:'none'}} onChange={handleSelectVideo} />
        </Card>

        {/* Activity Log */}
        <Card className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[18px] font-semibold text-[#021526]">Recent Activities</h3>
            <Button variant="ghost" size="sm" className="text-[#317752] hover:text-[#2a6545] text-[13px]">
              View All
            </Button>
          </div>

          <div className="space-y-3 max-h-[280px] overflow-y-auto">
            {dynamicActivities.length === 0 && (
              <div className="text-[12px] text-gray-500">{aiActive ? 'No AI events yet.' : 'Camera paused'}</div>
            )}
            {dynamicActivities.map((a, idx) => (
              <div key={`dyn-${idx}`} className="flex items-start gap-3 pb-3 border-b border-gray-100">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${a.color==='green'?'bg-green-500':a.color==='blue'?'bg-blue-500':a.color==='orange'?'bg-orange-500':'bg-red-500'}`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-gray-800">{a.text}</p>
                  <p className="text-[11px] text-gray-500 mt-1">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Main Content - Seat Map + Sidebar */}
      <div className="grid grid-cols-[1fr_360px] gap-6">
        {/* Seat Map */}
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[22px] font-semibold text-[#021526]">Seat Map Layout</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className={`rounded-[10px] px-4 h-[36px] ${showFilters ? 'bg-gray-100' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button
                variant="outline"
                className="rounded-[10px] px-4 h-[36px] border-gray-300 bg-gray-50 hover:bg-gray-100"
              >
                <Maximize className="w-4 h-4 mr-2" />
                FullScreen
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-gray-50 rounded-[12px] p-4 mb-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] text-gray-600 mb-2 block">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-[36px] rounded-[8px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Occupied">Occupied</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[12px] text-gray-600 mb-2 block">Quick Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="e.g., FD-02"
                      value={searchSeat}
                      onChange={(e) => setSearchSeat(e.target.value)}
                      className="pl-9 h-[36px] rounded-[8px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Floor Plan */}
          <div className="relative bg-gray-50 rounded-[16px] overflow-hidden border-2 border-gray-200 aspect-[4/3]">
            {/* Cache-bust in dev to ensure newly added file shows without hard-refresh */}
            {(() => {
              const src = (import.meta as any).env && (import.meta as any).env.DEV
                ? `/images/floor1.png?t=${Date.now()}`
                : '/images/floor1.png';
              return (
                <ImageWithFallback
                  src={src}
                  alt="Floor 1 Seat Map"
                  className="w-full h-full object-cover"
                />
              );
            })()}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5"></div>
            {/* Markers theo cấu hình toạ độ; nhãn hiển thị số (không có tiền tố FD) */}
            <div className="absolute inset-0">
              {(() => {
                const keys = Object.keys(FLOOR1_SEAT_POSITIONS || {});
                const map = new Map<string, Seat>();
                seats.forEach(s => {
                  const m = s.id.match(/FD-?(\d+)/i);
                  const key = m ? `FD-${parseInt(m[1], 10)}` : s.id;
                  map.set(key, s);
                });
                return keys.map(key => {
                  const s = map.get(key);
                  const pos = (s?.posX != null && s?.posY != null)
                    ? { posX: s.posX!, posY: s.posY! }
                    : FLOOR1_SEAT_POSITIONS[key];
                  if (!pos) return null;
                  const status = s?.status ?? 'Available';
                  const color = status === 'Occupied' ? 'bg-blue-500' : status === 'Maintenance' ? 'bg-red-500' : 'bg-gray-400';
                  const numericLabel = key.match(/(\d+)/)?.[1] ?? key;
                  return (
                    <button
                      key={`pos-${s?.id ?? key}`}
                      className={`absolute w-5 h-5 rounded-[4px] text-[10px] font-semibold text-white border border-white/80 shadow-sm ${color} z-20 flex items-center justify-center`}
                      style={{ left: `${pos.posX}%`, top: `${pos.posY}%`, transform: 'translate(-50%, -50%)' }}
                      title={key}
                      onClick={() => handleSeatClick({ id: s?.id ?? key, zone: s?.zone ?? 'Floor 1', status, posX: pos.posX, posY: pos.posY, capacity: s?.capacity ?? 1 })}
                    >
                      {numericLabel}
                    </button>
                  );
                });
              })()}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mt-5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-400 rounded-[6px]"></div>
              <span className="text-[14px] text-gray-700">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-300 rounded-[6px]"></div>
              <span className="text-[14px] text-gray-700">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-400 rounded-[6px]"></div>
              <span className="text-[14px] text-gray-700">Maintenance</span>
            </div>
          </div>
        </div>

        {/* Seat List Sidebar */}
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
          <h3 className="text-[18px] font-semibold text-[#021526] mb-5">Select Seat</h3>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search seat..."
              value={searchSeat}
              onChange={(e) => setSearchSeat(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 rounded-[10px] h-[42px]"
            />
          </div>

          {/* Seat List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredSeats.map((seat) => (
              <div
                key={seat.id}
                onClick={() => handleSeatClick(seat)}
                className="flex items-center justify-between p-4 rounded-[12px] border border-gray-200 hover:border-[#317752] hover:bg-gray-50 transition-all cursor-pointer"
              >
                <div>
                  <p className="text-[14px] font-semibold text-[#021526]">{seat.id}</p>
                  <p className="text-[12px] text-gray-400">Capacity: {seat.capacity ?? 1}</p>
                </div>
                <Badge className={`${
                  seat.status === "Available" ? "bg-gray-100 text-gray-700" :
                  seat.status === "Occupied" ? "bg-blue-100 text-blue-700" :
                  "bg-red-100 text-red-700"
                } border-0`}>
                  {seat.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Seat Detail Sheet */}
      <Sheet open={!!selectedSeat} onOpenChange={() => setSelectedSeat(null)}>
  <SheetContent className="w-[540px] rounded-l-[20px] p-0">
          <SheetHeader className="p-5 pb-3 pr-12 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-[20px] font-semibold">Seat {selectedSeat?.id}</SheetTitle>
              {selectedSeat && (
                <div className="flex gap-2 mr-4">
                  <Button variant="outline" className="h-9 px-3 rounded-[8px] text-[13px]" onClick={() => {
                    setEditSeatCode(selectedSeat.id);
                    setEditSeatCapacity(selectedSeat.capacity ?? 1);
                    setShowEditSeat(true);
                  }}>Edit</Button>
                  <Button variant="outline" className="h-9 px-3 rounded-[8px] border-red-300 text-red-600 hover:bg-red-50 text-[13px]" onClick={async () => {
                    if (!selectedSeat) return;
                    if (!confirm(`Delete seat ${selectedSeat.id}?`)) return;
                    try {
                      await deleteSeat(selectedSeat.id);
                      toast.success('Seat deleted');
                      setSeats(prev => prev.filter(s => s.id !== selectedSeat.id));
                      setSelectedSeat(null);
                    } catch (e:any) {
                      toast.error(e?.response?.data?.error || 'Delete failed');
                    }
                  }}>Delete</Button>
                </div>
              )}
            </div>
          </SheetHeader>

          {selectedSeat && (
            <div className="px-5 pb-6 pt-5 space-y-6">
              <div className="bg-gray-50 rounded-[12px] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-gray-600">Current Status</span>
                  <Badge className={`${
                    selectedSeat.status === "Available" ? "bg-gray-100 text-gray-700" :
                    selectedSeat.status === "Occupied" ? "bg-blue-100 text-blue-700" :
                    "bg-red-100 text-red-700"
                  } border-0`}>
                    {selectedSeat.status}
                  </Badge>
                </div>
              </div>

              {/* Change Status – dùng ToggleGroup cho gọn, dễ bấm */}
              <div>
                <h4 className="text-[15px] font-semibold text-[#021526] mb-2">Change Status</h4>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    className={`w-full min-w-[120px] rounded-[10px] border-gray-300 ${selectedSeat.status==='Available' ? 'bg-gray-100 text-gray-800 border-gray-400 shadow-inner' : 'text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => applySeatStatus('Available')}
                  >
                    Available
                  </Button>
                  <Button
                    variant="outline"
                    className={`w-full min-w-[120px] rounded-[10px] border-blue-300 ${selectedSeat.status==='Occupied' ? 'bg-blue-100 text-blue-700 border-blue-400 shadow-inner' : 'text-blue-700 hover:bg-blue-50'}`}
                    onClick={() => applySeatStatus('Occupied')}
                  >
                    Occupied
                  </Button>
                  <Button
                    variant="outline"
                    className={`w-full min-w-[120px] rounded-[10px] border-red-300 ${selectedSeat.status==='Maintenance' ? 'bg-red-100 text-red-700 border-red-400 shadow-inner' : 'text-red-700 hover:bg-red-50'}`}
                    onClick={() => applySeatStatus('Maintenance')}
                  >
                    Maintenance
                  </Button>
                </div>
              </div>

              {selectedSeat.user && (
                <>
                  <div>
                    <h4 className="text-[15px] font-semibold text-[#021526] mb-3">User Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-[14px] text-gray-700">{selectedSeat.user.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-[14px] text-gray-700">{selectedSeat.user.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-[14px] text-gray-700">{selectedSeat.user.phone}</span>
                      </div>
                    </div>
                  </div>

                  {selectedSeat.booking && (
                    <>
                      <div>
                        <h4 className="text-[15px] font-semibold text-[#021526] mb-3">Booking Details</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-[13px] text-gray-600">Package</span>
                            <span className="text-[13px] font-medium text-[#021526]">{selectedSeat.booking.package}</span>
                          </div>
                          {selectedSeat.booking.bookingReference && (
                            <div className="flex justify-between">
                              <span className="text-[13px] text-gray-600">Reference</span>
                              <span className="text-[13px] font-medium text-[#021526]">{selectedSeat.booking.bookingReference}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-[13px] text-gray-600">Start Time</span>
                            <span className="text-[13px] font-medium text-[#021526]">{formatBookingDate(selectedSeat.booking.startDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[13px] text-gray-600">End Time</span>
                            <span className="text-[13px] font-medium text-[#021526]">{formatBookingDate(selectedSeat.booking.endDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[13px] text-gray-600">Payment</span>
                            <Badge className={`${
                              selectedSeat.booking.paymentStatus === "Paid" ? "bg-green-100 text-green-700" :
                              selectedSeat.booking.paymentStatus === "Pending" ? "bg-orange-100 text-orange-700" :
                              "bg-red-100 text-red-700"
                            } border-0 text-[11px]`}>
                              {selectedSeat.booking.paymentStatus}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4">
                        <Button
                          variant="outline"
                          className="w-full rounded-[10px] border-red-300 text-red-600 hover:bg-red-50"
                          onClick={handleCancelBooking}
                        >
                          Cancel Booking
                        </Button>
                      </div>
                    </>
                  )}
                </>
              )}

              {!selectedSeat.user && (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">This seat is available</p>
                  <Button className="mx-auto bg-[#317752] hover:bg-[#2a6545] text-white rounded-[10px] px-5">
                    Assign User
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
      {/* Add Seat Dialog */}
      <Dialog open={showAddSeat} onOpenChange={setShowAddSeat}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[20px]">Add New Seat</DialogTitle>
            <DialogDescription>Create a new fixed desk seat.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-[13px] text-gray-600 mb-2 block">Seat Code *</Label>
              <Input value={newSeatCode} onChange={e => setNewSeatCode(e.target.value)} placeholder="FD-22" className="h-[42px] rounded-[10px]" />
            </div>
            <div>
              <Label className="text-[13px] text-gray-600 mb-2 block">Capacity *</Label>
              <Input type="number" min={1} value={newSeatCapacity} onChange={e => setNewSeatCapacity(parseInt(e.target.value)||1)} className="h-[42px] rounded-[10px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-[10px]" onClick={() => setShowAddSeat(false)}>Cancel</Button>
            <Button className="bg-[#317752] hover:bg-[#2a6545] text-white rounded-[10px]" onClick={async () => {
              if (!newSeatCode.trim()) { toast.error('Seat code required'); return; }
              try {
                await createSeat({ seatCode: newSeatCode.trim(), capacity: newSeatCapacity });
                toast.success('Seat created');
                setShowAddSeat(false);
                const data = await listFixedDesks();
                const mapped = mapSeatResponse(data);
                setSeats(mapped);
              } catch (e:any) { toast.error(e?.response?.data?.error || 'Create failed'); }
            }}>Create Seat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Edit Seat Dialog */}
      <Dialog open={showEditSeat} onOpenChange={setShowEditSeat}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[20px]">Edit Seat</DialogTitle>
            <DialogDescription>Modify seat code or capacity.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-[13px] text-gray-600 mb-2 block">New Seat Code</Label>
              <Input value={editSeatCode} onChange={e => setEditSeatCode(e.target.value)} className="h-[42px] rounded-[10px]" />
            </div>
            <div>
              <Label className="text-[13px] text-gray-600 mb-2 block">Capacity</Label>
              <Input type="number" min={1} value={editSeatCapacity} onChange={e => setEditSeatCapacity(parseInt(e.target.value)||1)} className="h-[42px] rounded-[10px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-[10px]" onClick={() => setShowEditSeat(false)}>Cancel</Button>
            <Button className="bg-[#317752] hover:bg-[#2a6545] text-white rounded-[10px]" onClick={async () => {
              if (!selectedSeat) return;
              try {
                await updateSeat(selectedSeat.id, { newSeatCode: editSeatCode.trim() || undefined, capacity: editSeatCapacity });
                toast.success('Seat updated');
                setShowEditSeat(false);
                const data = await listFixedDesks();
                const mapped = mapSeatResponse(data);
                setSeats(mapped);
                setSelectedSeat(prev => prev ? { ...prev, id: editSeatCode.trim() || prev.id, capacity: editSeatCapacity } : prev);
              } catch (e:any) { toast.error(e?.response?.data?.error || 'Update failed'); }
            }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Seat Zone Editor Dialog */}
      {showZoneEditor && (
        <Dialog open={showZoneEditor} onOpenChange={setShowZoneEditor}>
          <DialogContent
            className="w-full max-w-none rounded-2xl border-0 p-6 sm:p-8"
            style={{ width: 'min(60vw, 1120px)', maxWidth: '1120px' }}
          >
            <DialogHeader>
              <DialogTitle className="text-[22px]">Edit Seat Zones (press s to save)</DialogTitle>
              <DialogDescription>Choose a seat from dropdown. Click video to draw polygon. Shortcuts: u=undo, r=reset, q=quit, s=save.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="text-[12px] text-gray-600 mb-1 block">Select Seat</label>
                  <Select
                    value={editingSeatCode || undefined}
                    onValueChange={(value) => {
                      setEditingSeatCode(value);
                      const zone = seatZones.find(z => z.seatCode === value);
                      setEditorPoints(zone ? (zone.polygon as any) : []);
                    }}
                  >
                    <SelectTrigger className="h-[48px] rounded-xl border-2 border-slate-200 px-4 text-[15px] font-medium shadow-sm">
                      <SelectValue placeholder="Choose seat" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      className="w-[320px] rounded-xl border border-slate-200 p-0 shadow-xl [&_[data-radix-select-viewport]]:p-0 [&_[data-slot=scroll-area]]:max-h-[260px]"
                    >
                      <div className="py-1">
                        {seats.length === 0 && (
                          <SelectItem value="__no-seat" disabled>
                            No seats available
                          </SelectItem>
                        )}
                        {seats.map(s => {
                          const z = seatZones.find(z => z.seatCode === s.id);
                          const hasZone = !!z;
                          return (
                            <SelectItem
                              key={`seat-${s.id}`}
                              value={s.id}
                              className="text-[13px] leading-tight py-1.5 pl-3 pr-6"
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="font-medium text-[#021526]">{s.id}</span>
                                <span
                                  className={`ml-3 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${hasZone ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}
                                >
                                  {hasZone ? 'Has zone' : 'No zone'}
                                </span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </div>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-shrink-0">
                  <Button
                    type="button"
                    onClick={() => setEditorPoints([])}
                    variant="ghost"
                    className="group flex h-[48px] min-w-[136px] items-center justify-center rounded-xl bg-gradient-to-r from-white via-slate-50 to-white px-6 text-[15px] font-semibold text-slate-600 shadow-[0_12px_28px_rgba(15,23,42,0.08)] ring-1 ring-slate-200 transition-all hover:-translate-y-0.5 hover:text-slate-800 hover:ring-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    <RefreshCcw className="mr-2 h-4 w-4 text-slate-500 transition-transform group-hover:-rotate-180" />
                    Reset
                  </Button>
                </div>
              </div>
              <div className="relative w-full">
                {editorPreviewStatus === 'ready' && editorPreview ? (
                  <div className="relative w-full flex items-center justify-center">
                    <img
                      ref={editorImageRef}
                      src={editorPreview}
                      alt="Seat zone reference frame"
                      className="w-full h-auto max-h-[760px] min-h-[460px] object-contain rounded-2xl shadow-2xl"
                      onLoad={() => setEditorPoints(prev => prev.slice())}
                    />
                    <canvas ref={editorCanvasRef} onClick={handleEditorClick} className="absolute inset-0 w-full h-full cursor-crosshair" />
                  </div>
                ) : editorPreviewStatus === 'ready-video' && uploadedVideo ? (
                  <div className="relative w-full flex items-center justify-center">
                    <video
                      ref={editorVideoRef}
                      src={uploadedVideo}
                      controls
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-auto max-h-[760px] min-h-[460px] object-contain rounded-2xl bg-black shadow-2xl"
                      onLoadedMetadata={() => setEditorPoints(prev => prev.slice())}
                    />
                    <canvas ref={editorCanvasRef} onClick={handleEditorClick} className="absolute inset-0 w-full h-full cursor-crosshair" />
                  </div>
                ) : uploadedVideo ? (
                  <div className="w-full h-[32rem] flex items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-gray-100 text-gray-500 text-base">
                    {editorPreviewStatus === 'loading' || editorPreviewStatus === 'idle'
                      ? 'Loading latest video frame...'
                      : 'Unable to load a preview frame. Please start the AI stream and try again.'}
                  </div>
                ) : (
                  <div className="w-full h-[32rem] flex items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-gray-100 text-gray-500 text-base">Please upload a video first</div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
