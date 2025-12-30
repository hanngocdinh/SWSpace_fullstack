import { useEffect, useRef, useState } from "react";
import {
  Search,
  Video,
  Users,
  CheckCircle,
  AlertCircle,
  Activity,
  Filter,
  Maximize,
  User,
  Mail,
  Phone,
  Building2,
  Calendar
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { toast } from "sonner";
import {
  getRoomStatuses,
  setRoomStatus,
  setupFloor3,
  RoomStatusUI,
  getRoomDetail,
  cancelRoomBooking
} from "../api/adminRoomsApi";
import {
  getAIControlF3,
  setAIControlF3,
  createFloor3Room,
  updateFloor3Room,
  deleteFloor3Room
} from "../api/floorApi";

type SpaceType = "Networking Space";

interface SpaceItem {
  id: string;
  type: SpaceType;
  zone: string;
  capacity: number;
  capacityLabel?: string;
  status: RoomStatusUI;
}

interface SpaceDetail {
  roomCode: string;
  status: RoomStatusUI;
  capacity: number;
  zone?: string;
  floor?: number;
  user?: {
    id?: number;
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
  } | null;
  booking?: {
    id: number;
    package?: string;
    startDate?: string;
    endDate?: string;
    paymentStatus?: string;
    bookingReference?: string;
    phase?: string;
  } | null;
}

type ActivityColor = "green" | "orange" | "red" | "blue";
type ActivityItem = { color: ActivityColor; text: string; time: string };

const naturalSort = (arr: SpaceItem[]) => {
  const rx = /^([A-Za-z]+)(\d+)$/;
  return [...arr].sort((a, b) => {
    const am = rx.exec(a.id);
    const bm = rx.exec(b.id);
    if (am && bm && am[1] === bm[1]) return parseInt(am[2]) - parseInt(bm[2]);
    return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: "base" });
  });
};

const formatDateTime = (value?: string) =>
  value ? new Date(value).toLocaleString("vi-VN", { hour12: false }) : "—";

export default function Floor3() {
  const [searchSpace, setSearchSpace] = useState("");
  const [selectedSpace, setSelectedSpace] = useState<SpaceItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [spaces, setSpaces] = useState<SpaceItem[]>([]);
  const [spaceDetail, setSpaceDetail] = useState<SpaceDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  // AI state (Floor 3)
  const [aiActive, setAiActive] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const [aiPeopleCount, setAiPeopleCount] = useState(0);
  const [dynamicActivities, setDynamicActivities] = useState<ActivityItem[]>([]);
  const [boxes, setBoxes] = useState<{ id: number; x1: number; y1: number; x2: number; y2: number }[]>([]);
  const [frame, setFrame] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const evtRef = useRef<EventSource | null>(null);
  // CRUD dialogs
  const [showAddSpace, setShowAddSpace] = useState(false);
  const [showEditSpace, setShowEditSpace] = useState(false);
  const [newSpaceCode, setNewSpaceCode] = useState("");
  const [newSpaceCapacity, setNewSpaceCapacity] = useState<number>(1);
  const [editSpaceCode, setEditSpaceCode] = useState("");
  const [editSpaceCapacity, setEditSpaceCapacity] = useState<number>(1);

  // fetch & ensure seed
  useEffect(() => {
    let poll: any;
    const build = async () => {
      setLoading(true);
      try {
        let net = await getRoomStatuses('networking');
        if (!net || net.length === 0) { await setupFloor3().catch(()=>{}); net = await getRoomStatuses('networking'); }
        const capMapNum: Record<string, number> = { N1: 28, N2: 32, N3: 60 };
        const capMapLabel: Record<string, string> = { N1: '28', N2: '32', N3: '60-70' };
        const toSpace = (r: { roomCode: string; status: RoomStatusUI; capacity: number; floor: number }): SpaceItem => {
          const code = r.roomCode;
            const capacityOverride = capMapNum[code] ?? r.capacity;
            return {
              id: code,
              type: 'Networking Space',
              zone: 'Networking Zone',
              capacity: typeof capacityOverride === 'number' ? capacityOverride : (r.capacity || 0),
              capacityLabel: capMapLabel[code],
              status: r.status
            };
        };
        const merged = naturalSort((net||[]).map(toSpace));
        setSpaces(merged);
        setSelectedSpace(prev => {
          if (!prev) return prev;
          return merged.find(r => r.id === prev.id) || prev;
        });
      } finally { setLoading(false); }
    };
    build();
    poll = setInterval(async () => {
      try {
        const net = await getRoomStatuses('networking');
        const capMapLabel: Record<string, string> = { N1: '28', N2: '32', N3: '60-70' };
        const merged = naturalSort((net||[]).map(r => ({ id: r.roomCode, type: 'Networking Space', zone: 'Networking Zone', capacity: r.capacity, capacityLabel: capMapLabel[r.roomCode], status: r.status })));
        setSpaces(merged);
        setSelectedSpace(prev => {
          if (!prev) return prev;
          return merged.find(r => r.id === prev.id) || prev;
        });
      } catch {}
    }, 5000);
    return () => poll && clearInterval(poll);
  }, []);

  // Listen for global event to open Add Space form
  useEffect(() => {
    const handler = () => { setNewSpaceCode(""); setNewSpaceCapacity(1); setShowAddSpace(true); };
    window.addEventListener('open-add-space-form-floor3', handler);
    return () => window.removeEventListener('open-add-space-form-floor3', handler);
  }, []);

  // Sync AI control state on mount
  useEffect(() => {
    (async () => {
      try {
        const ctl = await getAIControlF3();
        setAiActive(!!ctl.active);
      } catch {}
    })();
  }, []);

  // Open SSE when active
  useEffect(() => {
    const BACKEND = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:5000';
    if (aiActive) {
      if (evtRef.current) { evtRef.current.close(); evtRef.current = null; }
      const es = new EventSource(`${BACKEND}/api/space/floor3/ai/stream`);
      let last = aiPeopleCount;
      es.addEventListener('ai.people', (ev: MessageEvent) => {
        try {
          const data = JSON.parse((ev as any).data || '{}');
          if (Array.isArray(data.boxes)) setBoxes(data.boxes as any);
          if (typeof data.frame === 'string') setFrame(data.frame);
          if (typeof data.peopleCount === 'number') {
            const now = data.peopleCount as number;
            setAiPeopleCount(now);
            if (!aiReady) setAiReady(true);
            const timeText = new Date().toLocaleTimeString();
            if (now === 0 && last > 0) {
              setDynamicActivities(prev => ([{ color: 'green', text: 'Floor 3 is now empty', time: timeText }, ...prev].slice(0,30)));
            } else if (now !== last && now > 0) {
              setDynamicActivities(prev => ([{ color: 'blue', text: `People detected: ${now}`, time: timeText }, ...prev].slice(0,30)));
            }
            last = now;
          }
        } catch {}
      });
      es.addEventListener('ai.control', (ev: MessageEvent) => {
        try { const data = JSON.parse((ev as any).data || '{}'); setAiActive(!!data.active); if (!data.active) { setAiReady(false); setAiPeopleCount(0); setDynamicActivities([]); setBoxes([]); setFrame(null);} } catch {}
      });
      evtRef.current = es;
      return () => { es.close(); evtRef.current = null; };
    } else {
      if (evtRef.current) { evtRef.current.close(); evtRef.current = null; }
    }
  }, [aiActive]);

  const toggleAIActive = async () => {
    const next = !aiActive;
    await setAIControlF3(next);
    setAiActive(next);
    if (!next) { setAiReady(false); setAiPeopleCount(0); setDynamicActivities([]); setBoxes([]); setFrame(null); }
  };

  // Vẽ frame + boxes
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    if (!frame) { ctx.clearRect(0,0,canvas.width,canvas.height); return; }
    const img = new Image();
    img.onload = () => {
      const maxH = 420; const scale = maxH / img.height; // mở rộng chiều cao camera
      canvas.width = img.width * scale; canvas.height = img.height * scale;
      ctx.drawImage(img,0,0,canvas.width,canvas.height);
      // Dùng index + 1 để hiển thị số thứ tự mỗi người
      boxes.forEach((b,i) => {
        const x = b.x1 * canvas.width; const y = b.y1 * canvas.height;
        const w = (b.x2 - b.x1) * canvas.width; const h = (b.y2 - b.y1) * canvas.height;
        ctx.strokeStyle = '#ff9900'; ctx.lineWidth = 2; ctx.strokeRect(x,y,w,h);
        const label = `${i+1}`; const pad=4; ctx.font='12px sans-serif';
        const tw=ctx.measureText(label).width;
        ctx.fillStyle = 'rgba(255,153,0,0.85)';
        ctx.fillRect(x, Math.max(0,y-16), tw+pad*2,16);
        ctx.fillStyle = '#fff';
        ctx.fillText(label, x+pad, Math.max(10,y-4));
      });
    };
    img.src = 'data:image/jpeg;base64,' + frame;
  }, [frame, boxes]);

  // Space Stats
  const totalSpaces = spaces.length;
  const occupiedSpaces = spaces.filter(s => s.status === "Occupied").length;
  const availableSpaces = spaces.filter(s => s.status === "Available").length;
  const maintenanceSpaces = spaces.filter(s => s.status === "Maintenance").length;

  // Filter Spaces
  const filteredSpaces = spaces.filter(space => {
    const matchesSearch = space.id.toLowerCase().includes(searchSpace.toLowerCase()) ||
                         space.zone.toLowerCase().includes(searchSpace.toLowerCase()) ||
                         space.type.toLowerCase().includes(searchSpace.toLowerCase());
    const matchesStatus = statusFilter === "all" || space.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const loadSpaceDetail = async (roomCode: string) => {
    setDetailLoading(true);
    try {
      const detail = await getRoomDetail(roomCode);
      setSpaceDetail(detail);
      setSelectedSpace(prev => {
        if (!prev || prev.id !== roomCode) return prev;
        return {
          ...prev,
          status: detail.status,
          capacity: detail.capacity ?? prev.capacity
        };
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Không thể tải thông tin không gian');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSpaceClick = (space: SpaceItem) => {
    setSelectedSpace(space);
    setSpaceDetail(null);
    loadSpaceDetail(space.id);
  };

  const handleCancelSpaceBooking = async () => {
    if (!selectedSpace || !spaceDetail?.booking?.id) {
      toast.error('Chưa có booking để hủy');
      return;
    }
    const label = spaceDetail.booking.bookingReference || selectedSpace.id;
    if (!window.confirm(`Hủy booking ${label}?`)) return;
    try {
      await cancelRoomBooking(selectedSpace.id, spaceDetail.booking.id, 'Cancelled via Floor 3 admin panel');
      toast.success('Đã hủy booking');
      setSpaces(prev => prev.map(r => r.id === selectedSpace.id ? { ...r, status: 'Available' } : r));
      setSelectedSpace(prev => prev ? { ...prev, status: 'Available' } : prev);
      await loadSpaceDetail(selectedSpace.id);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Không thể hủy booking');
    }
  };

  const applyStatus = async (status: RoomStatusUI) => {
    if (!selectedSpace) return;
    try {
      await setRoomStatus(selectedSpace.id, status);
      toast.success(`Updated ${selectedSpace.id} → ${status}`);
      setSpaces(prev => prev.map(r => r.id === selectedSpace.id ? { ...r, status } : r));
      setSelectedSpace(sr => sr ? { ...sr, status } : sr);
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  return (
    <>
      {/* Stats Cards - Floor 3 */}
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
              <p className="text-[13px] text-gray-600 mb-1">Total Spaces</p>
              <p className="text-[28px] font-semibold text-[#021526]">{totalSpaces}</p>
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
              <p className="text-[28px] font-semibold text-[#021526]">{availableSpaces}</p>
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
              <p className="text-[28px] font-semibold text-[#021526]">{occupiedSpaces}</p>
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
              <p className="text-[28px] font-semibold text-[#021526]">{maintenanceSpaces}</p>
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

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 bg-gray-50 rounded-[12px] p-4 shadow-sm border border-gray-200 flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[13px] text-gray-600">Cameras Active</span>
                </div>
                <p className="text-[20px] font-semibold text-[#021526] leading-none">{aiActive && aiReady ? '1/1' : '0/1'}</p>
              </div>
              <div className="flex-1 bg-gray-50 rounded-[12px] p-4 shadow-sm border border-gray-200 flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-gray-600" />
                  <span className="text-[13px] text-gray-600">People counting</span>
                </div>
                <p className="text-[20px] font-semibold text-[#021526] leading-none">{(aiActive && aiReady) ? aiPeopleCount : '—'}</p>
              </div>
            </div>
            <div className="relative h-[420px] w-full rounded-[16px] overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800 border-[3px] border-[#317752] shadow-[0_0_0_1px_rgba(49,119,82,0.4),0_4px_16px_-2px_rgba(0,0,0,0.4)]">
              <canvas ref={canvasRef} style={{height:'100%',width:'100%'}} />
              {!aiActive && <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-[13px]">Camera paused</div>}
              {aiActive && aiReady && !frame && <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-[13px]">Đang chờ hình ảnh...</div>}
              <div className="pointer-events-none absolute inset-0 grid grid-cols-2 grid-rows-2">
                <div className="border-t border-l border-white/10" />
                <div className="border-t border-r border-white/10" />
                <div className="border-b border-l border-white/10" />
                <div className="border-b border-r border-white/10" />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-gray-700 font-medium">Floor 3 camera</span>
              <button
                type="button"
                onClick={toggleAIActive}
                className={`appearance-none inline-flex items-center justify-center gap-2 rounded-[8px] h-[34px] min-w-[112px] px-3 text-[13px] font-semibold tracking-wide shadow-sm focus:outline-none focus:ring-2 ${aiActive 
                  ? 'focus:ring-red-400/40' : 'focus:ring-green-400/40'}`}
                style={aiActive 
                  ? { backgroundColor: '#dc2626', color: '#ffffff', border: '1px solid #b91c1c' } 
                  : { backgroundColor: '#16a34a', color: '#ffffff', border: '1px solid #15803d' }}
                aria-label={aiActive ? 'Pause Floor 3 camera' : 'Activate Floor 3 camera'}
              >
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
              <div key={`dyn-f3-${idx}`} className="flex items-start gap-3 pb-3 border-b border-gray-100">
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

      {/* Main Content - Space Map + Sidebar */}
      <div className="grid grid-cols-[1fr_360px] gap-6">
        {/* Space Map */}
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
                      placeholder="e.g., EH-301, CA-401, ONZ-501"
                      value={searchSpace}
                      onChange={(e) => setSearchSpace(e.target.value)}
                      className="pl-9 h-[36px] rounded-[8px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Floor Plan */}
          <div className="relative bg-gray-50 rounded-[16px] overflow-hidden border-2 border-gray-200" style={{ aspectRatio: '4/3' }}>
            <img
              src="/images/floor3.png"
              alt="Floor 3 Plan - Networking Space"
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5"></div>
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

        {/* Space List Sidebar */}
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
          <h3 className="text-[18px] font-semibold text-[#021526] mb-5">Select Space</h3>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search space..."
              value={searchSpace}
              onChange={(e) => setSearchSpace(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 rounded-[10px] h-[42px]"
            />
          </div>

          {/* Space List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredSpaces.map((space) => (
              <div
                key={space.id}
                onClick={() => handleSpaceClick(space)}
                className="flex items-center justify-between p-4 rounded-[12px] border border-gray-200 hover:border-[#317752] hover:bg-gray-50 transition-all cursor-pointer"
              >
                <div>
                  <p className="text-[14px] font-semibold text-[#021526]">{space.id}</p>
                  <p className="text-[12px] text-gray-500">{space.type} • {space.zone}</p>
                  <p className="text-[11px] text-gray-400">Capacity: {space.capacityLabel ?? space.capacity}</p>
                </div>
                <Badge className={`${
                  space.status === "Available" ? "bg-gray-100 text-gray-700" :
                  space.status === "Occupied" ? "bg-blue-100 text-blue-700" :
                  "bg-red-100 text-red-700"
                } border-0`}>
                  {space.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Space Detail Sheet */}
      <Sheet open={!!selectedSpace} onOpenChange={(open) => {
        if (!open) {
          setSelectedSpace(null);
          setSpaceDetail(null);
        }
      }}>
        <SheetContent className="w-[500px] rounded-l-[20px]">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle className="text-[22px] font-semibold">{selectedSpace?.type} {selectedSpace?.id}</SheetTitle>
              {selectedSpace && (
                <div className="flex gap-2 mr-4">
                  <Button variant="outline" className="h-9 px-3 rounded-[8px] text-[13px]" onClick={() => { setEditSpaceCode(selectedSpace.id); setEditSpaceCapacity(selectedSpace.capacity); setShowEditSpace(true); }}>Edit</Button>
                  <Button variant="outline" className="h-9 px-3 rounded-[8px] border-red-300 text-red-600 hover:bg-red-50 text-[13px]" onClick={async () => {
                    if (!selectedSpace) return; if (!confirm(`Delete space ${selectedSpace.id}?`)) return;
                    try { await deleteFloor3Room(selectedSpace.id); toast.success('Space deleted'); setSpaces(prev => prev.filter(r => r.id !== selectedSpace.id)); setSelectedSpace(null); } catch (e:any) { toast.error(e?.response?.data?.error || 'Delete failed'); }
                  }}>Delete</Button>
                </div>
              )}
            </div>
          </SheetHeader>

          {selectedSpace && (
            <div className="mt-6 space-y-6">
              <div className="bg-gray-50 rounded-[12px] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[14px] text-gray-600">Status</span>
                  <Badge className={`${
                    selectedSpace.status === "Available" ? "bg-gray-100 text-gray-700" :
                    selectedSpace.status === "Occupied" ? "bg-blue-100 text-blue-700" :
                    "bg-red-100 text-red-700"
                  } border-0`}>
                    {selectedSpace.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[14px] text-gray-600">Zone</span>
                  <span className="text-[14px] font-medium text-[#021526]">{selectedSpace.zone}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[14px] text-gray-600">Capacity</span>
                  <span className="text-[14px] font-medium text-[#021526]">{selectedSpace.capacityLabel ?? selectedSpace.capacity} people</span>
                </div>
              </div>

              {/* Status controls to mirror Floor 1/2 behavior */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  className={`w-full min-w-[120px] rounded-[10px] border-gray-300 ${selectedSpace.status==='Available' ? 'bg-gray-100 text-gray-700 border-gray-400 shadow-inner' : 'text-gray-700 hover:bg-gray-50'}`}
                  variant="outline"
                  onClick={() => applyStatus('Available')}
                >
                  Available
                </Button>
                <Button
                  className={`w-full min-w-[120px] rounded-[10px] border-blue-300 ${selectedSpace.status==='Occupied' ? 'bg-blue-100 text-blue-700 border-blue-400 shadow-inner' : 'text-blue-700 hover:bg-blue-50'}`}
                  variant="outline"
                  onClick={() => applyStatus('Occupied')}
                >
                  Occupied
                </Button>
                <Button
                  className={`w-full min-w-[120px] rounded-[10px] border-red-300 ${selectedSpace.status==='Maintenance' ? 'bg-red-100 text-red-700 border-red-400 shadow-inner' : 'text-red-700 hover:bg-red-50'}`}
                  variant="outline"
                  onClick={() => applyStatus('Maintenance')}
                >
                  Maintenance
                </Button>
              </div>

              {detailLoading && (
                <div className="text-center text-sm text-gray-500 py-6">Đang tải thông tin...</div>
              )}

              {!detailLoading && (
                <div className="space-y-6">
                  {spaceDetail?.user && (
                    <div>
                      <h4 className="text-[15px] font-semibold text-[#021526] mb-3">User Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-[14px] text-gray-700">{spaceDetail.user?.name || '—'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-[14px] text-gray-700">{spaceDetail.user?.email || '—'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-[14px] text-gray-700">{spaceDetail.user?.phone || '—'}</span>
                        </div>
                        {spaceDetail.user?.company && (
                          <div className="flex items-center gap-3">
                            <Building2 className="w-4 h-4 text-gray-500" />
                            <span className="text-[14px] text-gray-700">{spaceDetail.user.company}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {spaceDetail?.booking && (
                    <div>
                      <h4 className="text-[15px] font-semibold text-[#021526] mb-3">Booking Details</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-[13px] text-gray-600">
                          <span>Reference</span>
                          <span className="text-[13px] font-medium text-[#021526]">{spaceDetail.booking.bookingReference || '—'}</span>
                        </div>
                        <div className="flex items-center justify-between text-[13px] text-gray-600">
                          <span>Package</span>
                          <span className="text-[13px] font-medium text-[#021526]">{spaceDetail.booking.package || '—'}</span>
                        </div>
                        <div className="flex items-center justify-between text-[13px] text-gray-600">
                          <span>Start</span>
                          <span className="text-[13px] font-medium text-[#021526]">{formatDateTime(spaceDetail.booking.startDate)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[13px] text-gray-600">
                          <span>End</span>
                          <span className="text-[13px] font-medium text-[#021526]">{formatDateTime(spaceDetail.booking.endDate)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[13px] text-gray-600">
                          <span>Payment</span>
                          <Badge className={`${spaceDetail.booking.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : spaceDetail.booking.paymentStatus === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'} border-0 text-[11px]`}>
                            {spaceDetail.booking.paymentStatus || 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {!spaceDetail?.booking && !spaceDetail?.user && (
                    <div className="text-center text-sm text-gray-500 py-6">Không gian đang sẵn sàng cho booking tiếp theo.</div>
                  )}

                  <div className="space-y-2 pt-4">
                    <Button
                      className="w-full bg-[#317752] hover:bg-[#2a6545] text-white rounded-[10px]"
                      onClick={() => applyStatus('Available')}
                    >
                      Mark as Vacant
                    </Button>
                    {spaceDetail?.booking?.id && (
                      <Button
                        variant="outline"
                        className="w-full rounded-[10px] border-red-300 text-red-600 hover:bg-red-50"
                        onClick={handleCancelSpaceBooking}
                      >
                        Cancel Booking
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Space Dialog */}
      <Dialog open={showAddSpace} onOpenChange={setShowAddSpace}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[20px]">Add New Space</DialogTitle>
            <DialogDescription>Create a new networking space.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-[13px] text-gray-600 mb-2 block">Space Code *</Label>
              <Input value={newSpaceCode} onChange={e => setNewSpaceCode(e.target.value)} placeholder="N4" className="h-[42px] rounded-[10px]" />
            </div>
            <div>
              <Label className="text-[13px] text-gray-600 mb-2 block">Capacity *</Label>
              <Input type="number" min={1} value={newSpaceCapacity} onChange={e => setNewSpaceCapacity(parseInt(e.target.value)||1)} className="h-[42px] rounded-[10px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-[10px]" onClick={() => setShowAddSpace(false)}>Cancel</Button>
            <Button className="bg-[#317752] hover:bg-[#2a6545] text-white rounded-[10px]" onClick={async () => {
              if (!newSpaceCode.trim()) { toast.error('Space code required'); return; }
              try {
                await createFloor3Room({ roomCode: newSpaceCode.trim(), capacity: newSpaceCapacity } as any);
                toast.success('Space created');
                setSpaces(prev => {
                  const next = [...prev, { id: newSpaceCode.trim(), type: 'Networking Space', zone: 'Networking Zone', capacity: newSpaceCapacity, status: 'Available' } as any];
                  return next.sort((a,b)=>a.id.localeCompare(b.id, undefined, {numeric:true,sensitivity:'base'}));
                });
                setShowAddSpace(false);
              } catch (e:any) { toast.error(e?.response?.data?.error || 'Create failed'); }
            }}>Create Space</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Space Dialog */}
      <Dialog open={showEditSpace} onOpenChange={setShowEditSpace}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[20px]">Edit Space</DialogTitle>
            <DialogDescription>Rename space or change capacity.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-[13px] text-gray-600 mb-2 block">New Space Code</Label>
              <Input value={editSpaceCode} onChange={e => setEditSpaceCode(e.target.value)} className="h-[42px] rounded-[10px]" />
            </div>
            <div>
              <Label className="text-[13px] text-gray-600 mb-2 block">Capacity</Label>
              <Input type="number" min={1} value={editSpaceCapacity} onChange={e => setEditSpaceCapacity(parseInt(e.target.value)||1)} className="h-[42px] rounded-[10px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-[10px]" onClick={() => setShowEditSpace(false)}>Cancel</Button>
            <Button className="bg-[#317752] hover:bg-[#2a6545] text-white rounded-[10px]" onClick={async () => {
              if (!selectedSpace) return;
              try {
                await updateFloor3Room(selectedSpace.id, { newRoomCode: editSpaceCode.trim() || undefined, capacity: editSpaceCapacity } as any);
                toast.success('Space updated');
                setSpaces(prev => {
                  const next = prev.map(r => r.id === selectedSpace.id ? { ...r, id: editSpaceCode.trim() || r.id, capacity: editSpaceCapacity } : r);
                  return next.sort((a,b)=>a.id.localeCompare(b.id, undefined, {numeric:true,sensitivity:'base'}));
                });
                setSelectedSpace(prev => prev ? { ...prev, id: editSpaceCode.trim() || prev.id, capacity: editSpaceCapacity } : prev);
                setShowEditSpace(false);
              } catch (e:any) { toast.error(e?.response?.data?.error || 'Update failed'); }
            }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

