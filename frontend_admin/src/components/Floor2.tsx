import { useEffect, useRef, useState } from "react";
import { 
  Search, 
  Download, 
  Plus, 
  Edit,
  Video, 
  Users,
  User,
  Clock,
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
  Building2,
  DoorOpen,
  Calendar
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { toast } from "sonner";
import { getRoomStatuses, setRoomStatus, setupFloor2, RoomStatusUI, getRoomDetail, cancelRoomBooking } from "../api/adminRoomsApi";
import { getAIControlF2, setAIControlF2, createFloor2Room, updateFloor2Room, deleteFloor2Room } from "../api/floorApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Label } from "./ui/label";

// ==================== ROOM TYPES ====================
interface RoomItem {
  id: string; // use roomCode as id (M1, ...)
  type: "Meeting Room" | "Private Office";
  zone: string; // display only; not from DB for now
  capacity: number;
  capacityLabel?: string;
  status: RoomStatusUI;
}

interface RoomDetail {
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
}

type ActivityColor = 'green' | 'orange' | 'red' | 'blue';
type ActivityItem = { color: ActivityColor; text: string; time: string };

const naturalSort = (arr: RoomItem[]) => {
  const rx = /^([A-Za-z]+)(\d+)$/;
  return [...arr].sort((a, b) => {
    const ac = a.id;
    const bc = b.id;
    const am = rx.exec(ac);
    const bm = rx.exec(bc);
    if (am && bm && am[1] === bm[1]) return parseInt(am[2]) - parseInt(bm[2]);
    return ac.localeCompare(bc, undefined, { numeric: true, sensitivity: 'base' });
  });
};

const formatDateTime = (value?: string) => (
  value ? new Date(value).toLocaleString('vi-VN', { hour12: false }) : '—'
);

export default function Floor2() {
  const [searchRoom, setSearchRoom] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<RoomItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  // Zone filter removed per request
  const [showFilters, setShowFilters] = useState(false);
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [roomDetail, setRoomDetail] = useState<RoomDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  // AI state (Floor 2)
  const [aiActive, setAiActive] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const [aiPeopleCount, setAiPeopleCount] = useState(0);
  const [dynamicActivities, setDynamicActivities] = useState<ActivityItem[]>([]);
  const [boxes, setBoxes] = useState<{id:number;x1:number;y1:number;x2:number;y2:number}[]>([]);
  const [frame, setFrame] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const evtRef = useRef<EventSource | null>(null);
  // CRUD dialogs
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showEditRoom, setShowEditRoom] = useState(false);
  const [newRoomCode, setNewRoomCode] = useState("");
  const [newRoomType, setNewRoomType] = useState<'Meeting Room'|'Private Office'>('Meeting Room');
  const [newRoomCapacity, setNewRoomCapacity] = useState<number>(1);
  const [editRoomCode, setEditRoomCode] = useState("");
  const [editRoomCapacity, setEditRoomCapacity] = useState<number>(1);

  // fetch & optional seed (only once); then poll statuses without reseeding
  useEffect(() => {
    let pollTimer: any;
    const buildRooms = async () => {
      setLoading(true);
      try {
        const [mr, po] = await Promise.all([
          getRoomStatuses('meeting_room'),
          getRoomStatuses('private_office')
        ]);
        // Seed only if both empty
        if ((!mr || mr.length === 0) && (!po || po.length === 0)) {
          await setupFloor2().catch(()=>{});
          const seededMr = await getRoomStatuses('meeting_room');
          const seededPo = await getRoomStatuses('private_office');
          return buildState(seededMr, seededPo);
        }
        return buildState(mr, po);
      } finally { setLoading(false); }
    };
    const buildState = (mr?: any[], po?: any[]) => {
      const meeting = (mr||[]).map(r => ({ id: r.roomCode, type: 'Meeting Room', zone: 'Meeting Hub', capacity: r.capacity, status: r.status } as RoomItem));
      const privateOfc = (po||[]).map(r => ({ id: r.roomCode, type: 'Private Office', zone: 'Private Offices', capacity: r.capacity, status: r.status } as RoomItem));
      const merged = naturalSort([...meeting, ...privateOfc]);
      setRooms(merged);
      setSelectedRoom(prev => {
        if (!prev) return prev;
        return merged.find(r => r.id === prev.id) || prev;
      });
    };
    buildRooms();
    pollTimer = setInterval(async () => {
      try {
        const [mr, po] = await Promise.all([
          getRoomStatuses('meeting_room'),
          getRoomStatuses('private_office')
        ]);
        const meeting = (mr||[]).map(r => ({ id: r.roomCode, type: 'Meeting Room', zone: 'Meeting Hub', capacity: r.capacity, status: r.status } as RoomItem));
        const privateOfc = (po||[]).map(r => ({ id: r.roomCode, type: 'Private Office', zone: 'Private Offices', capacity: r.capacity, status: r.status } as RoomItem));
        const merged = naturalSort([...meeting, ...privateOfc]);
        setRooms(merged);
        setSelectedRoom(prev => {
          if (!prev) return prev;
          return merged.find(r => r.id === prev.id) || prev;
        });
      } catch {}
    }, 5000);
    return () => pollTimer && clearInterval(pollTimer);
  }, []);

  // Listen for global event to open add room form
  useEffect(() => {
    const handler = () => { setNewRoomCode(""); setNewRoomCapacity(1); setShowAddRoom(true); };
    window.addEventListener('open-add-room-form-floor2', handler);
    return () => window.removeEventListener('open-add-room-form-floor2', handler);
  }, []);

  // Sync AI control state on mount
  useEffect(() => {
    (async () => {
      try {
        const ctl = await getAIControlF2();
        setAiActive(!!ctl.active);
      } catch {}
    })();
  }, []);

  // Open SSE when active
  useEffect(() => {
    const BACKEND = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:5000';
    if (aiActive) {
      if (evtRef.current) { evtRef.current.close(); evtRef.current = null; }
      const es = new EventSource(`${BACKEND}/api/space/floor2/ai/stream`);
      let last = aiPeopleCount;
      es.addEventListener('ai.people', (ev: MessageEvent) => {
        try {
          const data = JSON.parse((ev as any).data || '{}');
          if (typeof data.peopleCount === 'number') {
            const now = data.peopleCount as number;
            setAiPeopleCount(now);
            if (!aiReady) setAiReady(true);
            const timeText = new Date().toLocaleTimeString();
            if (Array.isArray(data.boxes)) setBoxes(data.boxes as any);
            if (typeof data.frame === 'string') setFrame(data.frame);
            if (now === 0 && last > 0) {
              setDynamicActivities(prev => ([{ color: 'green', text: 'Floor 2 is now empty', time: timeText }, ...prev].slice(0,30)));
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
    await setAIControlF2(next);
    setAiActive(next);
    if (!next) { setAiReady(false); setAiPeopleCount(0); setDynamicActivities([]); setBoxes([]); setFrame(null); }
  };

  // Vẽ frame + boxes lên canvas
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    if (!frame) { ctx.clearRect(0,0,canvas.width,canvas.height); return; }
    const img = new Image();
    img.onload = () => {
      const maxH = 420; const scale = maxH / img.height; // mở rộng chiều cao camera
      canvas.width = img.width * scale; canvas.height = img.height * scale;
      ctx.drawImage(img,0,0,canvas.width,canvas.height);
      // Vẽ khung: dùng số thứ tự (index + 1) thay vì #id để rõ ràng theo yêu cầu
      boxes.forEach((b, i) => {
        const x = b.x1 * canvas.width; const y = b.y1 * canvas.height;
        const w = (b.x2 - b.x1) * canvas.width; const h = (b.y2 - b.y1) * canvas.height;
        ctx.strokeStyle = '#ff0055'; ctx.lineWidth = 2; ctx.strokeRect(x,y,w,h);
        const label = `${i+1}`; const pad=4; ctx.font='12px sans-serif';
        const tw=ctx.measureText(label).width;
        ctx.fillStyle = 'rgba(255,0,85,0.85)';
        ctx.fillRect(x, Math.max(0,y-16), tw+pad*2,16);
        ctx.fillStyle = '#fff';
        ctx.fillText(label, x+pad, Math.max(10,y-4));
      });
    };
    img.src = 'data:image/jpeg;base64,' + frame;
  }, [frame, boxes]);

  // Room Stats
  const totalRooms = rooms.length;
  const meetingRooms = rooms.filter(r => r.type === "Meeting Room").length;
  const privateOffices = rooms.filter(r => r.type === "Private Office").length;
  const occupiedRooms = rooms.filter(r => r.status === "Occupied").length;
  const availableRooms = rooms.filter(r => r.status === "Available").length;
  const maintenanceRooms = rooms.filter(r => r.status === "Maintenance").length;

  // Filter Rooms
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.id.toLowerCase().includes(searchRoom.toLowerCase()) ||
                         room.zone.toLowerCase().includes(searchRoom.toLowerCase()) ||
                         room.type.toLowerCase().includes(searchRoom.toLowerCase());
    const matchesStatus = statusFilter === "all" || room.status === statusFilter;
    const matchesType = typeFilter === "all" || room.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const loadRoomDetail = async (roomCode: string) => {
    setDetailLoading(true);
    try {
      const detail = await getRoomDetail(roomCode);
      setRoomDetail(detail);
      setSelectedRoom(prev => {
        if (!prev || prev.id !== roomCode) return prev;
        return {
          ...prev,
          status: detail.status,
          capacity: detail.capacity ?? prev.capacity,
          zone: detail.zone || prev.zone
        };
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Không thể tải thông tin phòng');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRoomClick = (room: RoomItem) => {
    setSelectedRoom(room);
    setRoomDetail(null);
    loadRoomDetail(room.id);
  };

  const handleCancelBooking = async () => {
    if (!selectedRoom || !roomDetail?.booking?.id) {
      toast.error('Chưa có booking nào để hủy');
      return;
    }
    const label = roomDetail.booking.bookingReference || selectedRoom.id;
    if (!window.confirm(`Hủy booking ${label}?`)) return;
    try {
      await cancelRoomBooking(selectedRoom.id, roomDetail.booking.id, 'Cancelled via Floor 2 admin panel');
      toast.success('Đã hủy booking');
      setRooms(prev => prev.map(r => r.id === selectedRoom.id ? { ...r, status: 'Available' } : r));
      setSelectedRoom(prev => prev ? { ...prev, status: 'Available' } : prev);
      await loadRoomDetail(selectedRoom.id);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Không thể hủy booking');
    }
  };

  const applyStatus = async (status: RoomStatusUI) => {
    if (!selectedRoom) return;
    try {
      await setRoomStatus(selectedRoom.id, status);
      toast.success(`Updated ${selectedRoom.id} → ${status}`);
      setRooms(prev => prev.map(r => r.id === selectedRoom.id ? { ...r, status } : r));
      setSelectedRoom(sr => sr ? { ...sr, status } : sr);
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const handleExportReport = () => {
    toast.success("Exporting report...");
  };

  return (
    <>
      {/* Stats Cards - Floor 2 */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-[56px] h-[56px] bg-gray-100 rounded-[12px] flex items-center justify-center">
              <svg className="w-7 h-7 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 11h2v2H7zm0 4h2v2H7zm4-4h2v2h-2zm0 4h2v2h-2zm4-4h2v2h-2zm0 4h2v2h-2z"/>
                <path d="M5 22h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2h-2V2h-2v2H9V2H7v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2zM19 8l.001 12H5V8h14z"/>
              </svg>
            </div>
            <div>
              <p className="text-[13px] text-gray-600 mb-1">Total Rooms</p>
              <p className="text-[28px] font-semibold text-[#021526]">{totalRooms}</p>
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
              <p className="text-[28px] font-semibold text-[#021526]">{availableRooms}</p>
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
              <p className="text-[28px] font-semibold text-[#021526]">{occupiedRooms}</p>
            </div>
          </div>
        </div>

        {/* Reserved removed as requested */}

        <div className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-[56px] h-[56px] bg-red-50 rounded-[12px] flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <p className="text-[13px] text-gray-600 mb-1">Maintenance</p>
              <p className="text-[28px] font-semibold text-[#021526]">{maintenanceRooms}</p>
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
              <span className="text-gray-700 font-medium">Floor 2 camera</span>
              <button
                type="button"
                onClick={toggleAIActive}
                className={`appearance-none inline-flex items-center justify-center gap-2 rounded-[8px] h-[34px] min-w-[112px] px-3 text-[13px] font-semibold tracking-wide shadow-sm focus:outline-none focus:ring-2 ${aiActive 
                  ? 'focus:ring-red-400/40' : 'focus:ring-green-400/40'}`}
                style={aiActive 
                  ? { backgroundColor: '#dc2626', color: '#ffffff', border: '1px solid #b91c1c' } 
                  : { backgroundColor: '#16a34a', color: '#ffffff', border: '1px solid #15803d' }}
                aria-label={aiActive ? 'Pause Floor 2 camera' : 'Activate Floor 2 camera'}
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
              <div key={`dyn-f2-${idx}`} className="flex items-start gap-3 pb-3 border-b border-gray-100">
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

      {/* Main Content - Room Map + Sidebar */}
      <div className="grid grid-cols-[1fr_360px] gap-6">
        {/* Room Map */}
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
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[12px] text-gray-600 mb-2 block">Type</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="h-[36px] rounded-[8px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Meeting Room">Meeting Room</SelectItem>
                      <SelectItem value="Private Office">Private Office</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                      placeholder="e.g., MR-201, PO-301"
                      value={searchRoom}
                      onChange={(e) => setSearchRoom(e.target.value)}
                      className="pl-9 h-[36px] rounded-[8px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Floor Plan */}
          <div className="relative bg-gray-50 rounded-[16px] overflow-hidden border-2 border-gray-200 aspect-[4/3]">
            <img
              src="/images/floor2.png"
              alt="Floor 2 Plan - Meeting Rooms & Private Offices"
              className="w-full h-full object-cover"
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

        {/* Room List Sidebar */}
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
          <h3 className="text-[18px] font-semibold text-[#021526] mb-5">Select Room</h3>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search room..."
              value={searchRoom}
              onChange={(e) => setSearchRoom(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 rounded-[10px] h-[42px]"
            />
          </div>

          {/* Room List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => handleRoomClick(room)}
                className="flex items-center justify-between p-4 rounded-[12px] border border-gray-200 hover:border-[#317752] hover:bg-gray-50 transition-all cursor-pointer"
              >
                <div>
                  <p className="text-[14px] font-semibold text-[#021526]">{room.id}</p>
                  <p className="text-[12px] text-gray-500">{room.type} • {room.zone}</p>
                  <p className="text-[11px] text-gray-400">Capacity: {room.capacityLabel ?? room.capacity}</p>
                </div>
                <Badge className={`${
                  room.status === "Available" ? "bg-gray-100 text-gray-700" :
                  room.status === "Occupied" ? "bg-blue-100 text-blue-700" :
                  "bg-red-100 text-red-700"
                } border-0`}>
                  {room.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Room Detail Sheet */}
      <Sheet open={!!selectedRoom} onOpenChange={(open) => {
        if (!open) {
          setSelectedRoom(null);
          setRoomDetail(null);
        }
      }}>
        <SheetContent className="w-[500px] rounded-l-[20px]">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle className="text-[22px] font-semibold">{selectedRoom?.type} {selectedRoom?.id}</SheetTitle>
              {selectedRoom && (
                <div className="flex gap-2">
                  <Button variant="outline" className="h-9 px-3 rounded-[8px] text-[13px]" onClick={() => { setEditRoomCode(selectedRoom.id); setEditRoomCapacity(selectedRoom.capacity); setShowEditRoom(true); }}>Edit</Button>
                  <Button variant="outline" className="h-9 px-3 rounded-[8px] border-red-300 text-red-600 hover:bg-red-50 text-[13px]" onClick={async () => {
                    if (!selectedRoom) return; if (!confirm(`Delete room ${selectedRoom.id}?`)) return;
                    try { await deleteFloor2Room(selectedRoom.id); toast.success('Room deleted'); setRooms(prev => prev.filter(r => r.id !== selectedRoom.id)); setSelectedRoom(null); } catch (e:any) { toast.error(e?.response?.data?.error || 'Delete failed'); }
                  }}>Delete</Button>
                </div>
              )}
            </div>
          </SheetHeader>

          {selectedRoom && (
            <div className="mt-6 space-y-6">
              <div className="bg-gray-50 rounded-[12px] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[14px] text-gray-600">Status</span>
                  <Badge className={`${
                    selectedRoom.status === "Available" ? "bg-gray-100 text-gray-700" :
                    selectedRoom.status === "Occupied" ? "bg-blue-100 text-blue-700" :
                    "bg-red-100 text-red-700"
                  } border-0`}>
                    {selectedRoom.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[14px] text-gray-600">Zone</span>
                  <span className="text-[14px] font-medium text-[#021526]">{selectedRoom.zone}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[14px] text-gray-600">Capacity</span>
                  <span className="text-[14px] font-medium text-[#021526]">{selectedRoom.capacity} people</span>
                </div>
              </div>
              {/* Status controls to mirror Floor 1 behavior */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  className={`w-full min-w-[120px] rounded-[10px] border-gray-300 ${selectedRoom.status==='Available' ? 'bg-gray-100 text-gray-700 border-gray-400 shadow-inner' : 'text-gray-700 hover:bg-gray-50'}`}
                  variant="outline"
                  onClick={() => applyStatus('Available')}
                >
                  Available
                </Button>
                <Button
                  className={`w-full min-w-[120px] rounded-[10px] border-blue-300 ${selectedRoom.status==='Occupied' ? 'bg-blue-100 text-blue-700 border-blue-400 shadow-inner' : 'text-blue-700 hover:bg-blue-50'}`}
                  variant="outline"
                  onClick={() => applyStatus('Occupied')}
                >
                  Occupied
                </Button>
                <Button
                  className={`w-full min-w-[120px] rounded-[10px] border-red-300 ${selectedRoom.status==='Maintenance' ? 'bg-red-100 text-red-700 border-red-400 shadow-inner' : 'text-red-700 hover:bg-red-50'}`}
                  variant="outline"
                  onClick={() => applyStatus('Maintenance')}
                >
                  Maintenance
                </Button>
              </div>

              {detailLoading && (
                <div className="text-sm text-gray-500 text-center py-6">Đang tải thông tin phòng...</div>
              )}

              {!detailLoading && (
                <div className="space-y-6">
                  {roomDetail?.user && (
                    <div>
                      <h4 className="text-[15px] font-semibold text-[#021526] mb-3">User Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-[14px] text-gray-700">{roomDetail.user?.name || '—'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-[14px] text-gray-700">{roomDetail.user?.email || '—'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-[14px] text-gray-700">{roomDetail.user?.phone || '—'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {roomDetail?.booking && (
                    <div>
                      <h4 className="text-[15px] font-semibold text-[#021526] mb-3">Booking Details</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-[13px] text-gray-600">
                          <span>Reference</span>
                          <span className="text-[13px] font-medium text-[#021526]">{roomDetail.booking.bookingReference || '—'}</span>
                        </div>
                        <div className="flex items-center justify-between text-[13px] text-gray-600">
                          <span>Package</span>
                          <span className="text-[13px] font-medium text-[#021526]">{roomDetail.booking.package || '—'}</span>
                        </div>
                        <div className="flex items-center justify-between text-[13px] text-gray-600">
                          <span>Start</span>
                          <span className="text-[13px] font-medium text-[#021526]">{formatDateTime(roomDetail.booking.startDate)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[13px] text-gray-600">
                          <span>End</span>
                          <span className="text-[13px] font-medium text-[#021526]">{formatDateTime(roomDetail.booking.endDate)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[13px] text-gray-600">
                          <span>Payment</span>
                          <Badge className={`${roomDetail.booking.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : roomDetail.booking.paymentStatus === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'} border-0 text-[11px]`}>
                            {roomDetail.booking.paymentStatus || 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {!roomDetail?.booking && !roomDetail?.user && (
                    <div className="text-center text-sm text-gray-500 py-6">Phòng đang sẵn sàng cho booking mới.</div>
                  )}

                  {roomDetail?.booking?.id && (
                    <div className="space-y-2">
                      <Button
                        className="w-full rounded-[10px] bg-[#317752] hover:bg-[#2a6545] text-white"
                        onClick={handleCancelBooking}
                      >
                        Cancel Booking
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
      {/* Add Room Dialog */}
      <Dialog open={showAddRoom} onOpenChange={setShowAddRoom}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[20px]">Add New Room</DialogTitle>
            <DialogDescription>Create a meeting room (prefix M) or private office (prefix P).</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-[13px] text-gray-600 mb-2 block">Type *</Label>
              <Select value={newRoomType} onValueChange={(v:any)=>setNewRoomType(v)}>
                <SelectTrigger className="h-[42px] rounded-[10px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Meeting Room">Meeting Room</SelectItem>
                  <SelectItem value="Private Office">Private Office</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[13px] text-gray-600 mb-2 block">Room Code *</Label>
              <Input value={newRoomCode} onChange={e => setNewRoomCode(e.target.value)} placeholder="M5" className="h-[42px] rounded-[10px]" />
            </div>
            <div>
              <Label className="text-[13px] text-gray-600 mb-2 block">Capacity *</Label>
              <Input type="number" min={1} value={newRoomCapacity} onChange={e => setNewRoomCapacity(parseInt(e.target.value)||1)} className="h-[42px] rounded-[10px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-[10px]" onClick={() => setShowAddRoom(false)}>Cancel</Button>
            <Button className="bg-[#317752] hover:bg-[#2a6545] text-white rounded-[10px]" onClick={async () => {
              if (!newRoomCode.trim()) { toast.error('Room code required'); return; }
              try {
                await createFloor2Room({ roomCode: newRoomCode.trim(), capacity: newRoomCapacity, roomType: newRoomType === 'Meeting Room' ? 'meeting_room' : 'private_office' } as any);
                toast.success('Room created');
                const type = newRoomType;
                setRooms(prev => {
                  const next = [...prev, { id: newRoomCode.trim(), type, zone: type === 'Meeting Room' ? 'Meeting Hub' : 'Private Offices', capacity: newRoomCapacity, status: 'Available' }];
                  return next.sort((a,b)=>a.id.localeCompare(b.id, undefined, {numeric:true,sensitivity:'base'}));
                });
                setShowAddRoom(false);
              } catch (e:any) { toast.error(e?.response?.data?.error || 'Create failed'); }
            }}>Create Room</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Edit Room Dialog */}
      <Dialog open={showEditRoom} onOpenChange={setShowEditRoom}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[20px]">Edit Room</DialogTitle>
            <DialogDescription>Rename room or change capacity.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-[13px] text-gray-600 mb-2 block">New Room Code</Label>
              <Input value={editRoomCode} onChange={e => setEditRoomCode(e.target.value)} className="h-[42px] rounded-[10px]" />
            </div>
            <div>
              <Label className="text-[13px] text-gray-600 mb-2 block">Capacity</Label>
              <Input type="number" min={1} value={editRoomCapacity} onChange={e => setEditRoomCapacity(parseInt(e.target.value)||1)} className="h-[42px] rounded-[10px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-[10px]" onClick={() => setShowEditRoom(false)}>Cancel</Button>
            <Button className="bg-[#317752] hover:bg-[#2a6545] text-white rounded-[10px]" onClick={async () => {
              if (!selectedRoom) return;
              try {
                await updateFloor2Room(selectedRoom.id, { newRoomCode: editRoomCode.trim() || undefined, capacity: editRoomCapacity });
                toast.success('Room updated');
                setRooms(prev => {
                  const next = prev.map(r => r.id === selectedRoom.id ? { ...r, id: editRoomCode.trim() || r.id, capacity: editRoomCapacity } : r);
                  return next.sort((a,b)=>a.id.localeCompare(b.id, undefined, {numeric:true,sensitivity:'base'}));
                });
                setSelectedRoom(prev => prev ? { ...prev, id: editRoomCode.trim() || prev.id, capacity: editRoomCapacity } : prev);
                setShowEditRoom(false);
              } catch (e:any) { toast.error(e?.response?.data?.error || 'Update failed'); }
            }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

