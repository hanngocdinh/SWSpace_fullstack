import { useEffect, useRef, useState } from "react";
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
  Pause
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
import { listFixedDesks, setSeatStatus as apiSetSeatStatus, getFixedDeskDetail, getAIControl, setAIControl } from "../api/floorApi";
import { FLOOR1_SEAT_POSITIONS } from "../config/floor1SeatPositions";

// dayjs used for formatting activity timestamps (HH:mm:ss)

// ==================== FIXED DESK TYPES ====================
interface Seat {
  id: string;
  zone: string;
  status: "Available" | "Occupied" | "Maintenance";
  posX?: number | null;
  posY?: number | null;
  user?: {
    name: string;
    email: string;
    phone: string;
  };
  booking?: {
    package: string;
    startDate: string;
    endDate: string;
    paymentStatus: "Paid" | "Pending" | "Overdue";
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
  // Tránh xung đột khi vừa cập nhật thủ công xong thì auto-refresh kéo dữ liệu cũ về
  const lastManualChangeRef = useRef<number>(0);

  // helper to extract FD number
  const getSeatNumber = (id: string) => {
    const m = id.match(/FD-?0*(\d+)/i);
    return m ? parseInt(m[1], 10) : Number.NaN;
  };

  // Sync AI control on mount so toggle reflects current backend state
  useEffect(() => {
    (async () => {
      try {
        const ctl = await getAIControl();
        setAiActive(!!ctl.active);
      } catch { /* ignore */ }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await listFixedDesks();
        const mapped = data
          .map(d => {
            const m = d.seatCode.match(/FD-?0*(\d+)/i);
            const num = m ? parseInt(m[1], 10) : Number.NaN;
            const id = Number.isNaN(num) ? d.seatCode : `FD-${num}`;
            return { id, zone: d.zone, status: (d.status === 'Reserved' ? 'Occupied' : d.status) as Seat["status"], posX: d.posX ?? null, posY: d.posY ?? null } as Seat;
          })
          // Chỉ lấy FD-1..FD-21
          .filter(s => {
            const n = getSeatNumber(s.id);
            return !Number.isNaN(n) && n >= 1 && n <= 21;
          })
          // Sắp xếp theo số ghế tăng dần
          .sort((a,b) => getSeatNumber(a.id) - getSeatNumber(b.id));
        setSeats(mapped);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load seats');
      }
      // (Removed initial fetch of last detection for Floor 1)
      // No AI control fetch on Fixed Desk
    })();
  }, []);

  // Auto refresh seats định kỳ để đồng bộ với backend (chuẩn bị cho việc user đặt chỗ -> admin tự lên màu)
  useEffect(() => {
    const REFRESH_MS = 10000; // 10s là mức an toàn; có thể giảm xuống 3-5s khi backend sẵn sàng
    const timer = setInterval(async () => {
      // Nếu vừa cập nhật thủ công < 2s thì bỏ qua lần refresh này để tránh giật trạng thái
      if (Date.now() - (lastManualChangeRef.current || 0) < 2000) return;
      try {
        const data = await listFixedDesks();
        const mapped = data
          .map(d => {
            const m = d.seatCode.match(/FD-?0*(\d+)/i);
            const num = m ? parseInt(m[1], 10) : Number.NaN;
            const id = Number.isNaN(num) ? d.seatCode : `FD-${num}`;
            return { id, zone: d.zone, status: (d.status === 'Reserved' ? 'Occupied' : d.status) as Seat["status"], posX: d.posX ?? null, posY: d.posY ?? null } as Seat;
          })
          .filter(s => {
            const n = getSeatNumber(s.id);
            return !Number.isNaN(n) && n >= 1 && n <= 21;
          })
          .sort((a,b) => getSeatNumber(a.id) - getSeatNumber(b.id));
        setSeats(mapped);
      } catch (e) {
        // im lặng để tránh spam toast trong nền
      }
    }, REFRESH_MS);
    return () => clearInterval(timer);
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
          if (typeof data.peopleCount === 'number') {
            const now = data.peopleCount as number;
            setAiPeopleCount(now);
            // Mark ready once we receive the first event
            if (!aiReady) {
              setAiReady(true);
            }
            // Update last detection only when the count CHANGES (arrived/left)
            // (Removed Last Detection feature for Floor 1)
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
            const text = occupied ? `${seatCode} became occupied` : `${seatCode} became vacant`;
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
      const n = getSeatNumber(detail.seatCode);
      const normId = Number.isNaN(n) ? detail.seatCode : `FD-${n}`;
      setSelectedSeat({
        id: normId,
        zone: detail.zone,
        status: (detail.status === 'Reserved' ? 'Occupied' : detail.status) as Seat["status"],
        posX: detail.posX ?? seat.posX ?? null,
        posY: detail.posY ?? seat.posY ?? null,
        user: detail.user ? {
          name: detail.user.name || '',
          email: detail.user.email || '',
          phone: detail.user.phone || ''
        } : undefined,
        booking: detail.booking ? {
          package: detail.booking.package || '',
          startDate: detail.booking.startDate,
          endDate: detail.booking.endDate,
          paymentStatus: (detail.booking.paymentStatus || 'Pending') as any
        } : undefined
      });
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

  const handleMarkAsVacant = () => applySeatStatus("Available");
  const handleCancelBooking = () => applySeatStatus("Available");

  const handleExportReport = () => {
    toast.success("Exporting report...");
  };

  const toggleAIActive = async () => {
    try {
      const next = !aiActive;
      await setAIControl(next);
      setAiActive(next);
      if (!next) {
        // Khi pause: dừng đếm, xoá activity, reset số liệu
        setDynamicActivities([]);
        setAiPeopleCount(0);
      }
      toast.success(next ? 'AI camera activated' : 'AI camera paused');
    } catch {
      toast.error('Failed to toggle AI');
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

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-gray-700 font-medium">Floor 1 camera</span>
              <button
                type="button"
                onClick={() => { if (LIVE_AI) { toggleAIActive(); } }}
                disabled={!LIVE_AI}
                className={`appearance-none inline-flex items-center justify-center gap-2 rounded-[8px] h-[34px] min-w-[112px] px-3 text-[13px] font-semibold tracking-wide shadow-sm focus:outline-none focus:ring-2 ${aiActive 
                  ? 'focus:ring-red-400/40' : 'focus:ring-green-400/40'} ${!LIVE_AI ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={aiActive 
                  ? { backgroundColor: '#dc2626', color: '#ffffff', border: '1px solid #b91c1c' } 
                  : { backgroundColor: '#16a34a', color: '#ffffff', border: '1px solid #15803d' }}
                aria-label={aiActive ? 'Pause Floor 1 camera' : 'Activate Floor 1 camera'}
              >
                {aiActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {aiActive ? 'Pause' : 'Active'}
              </button>
            </div>
          </div>
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
                      onClick={() => handleSeatClick({ id: s?.id ?? key, zone: s?.zone ?? 'Floor 1', status, posX: pos.posX, posY: pos.posY })}
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
                  <p className="text-[12px] text-gray-400">Capacity: 1</p>
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
          <SheetHeader className="p-5 pb-3 border-b border-gray-100">
            <SheetTitle className="text-[20px] font-semibold">
              Seat {selectedSeat?.id}
            </SheetTitle>
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
                    <div>
                      <h4 className="text-[15px] font-semibold text-[#021526] mb-3">Booking Details</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-[13px] text-gray-600">Package</span>
                          <span className="text-[13px] font-medium text-[#021526]">{selectedSeat.booking.package}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[13px] text-gray-600">Period</span>
                          <span className="text-[13px] font-medium text-[#021526]">
                            {selectedSeat.booking.startDate} - {selectedSeat.booking.endDate}
                          </span>
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
                  )}

                  <div className="space-y-2 pt-4">
                    <Button
                      className="w-full bg-[#317752] hover:bg-[#2a6545] text-white rounded-[10px]"
                      onClick={handleMarkAsVacant}
                    >
                      Mark as Vacant
                    </Button>
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
    </>
  );
}
