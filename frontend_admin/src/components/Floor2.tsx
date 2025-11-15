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
import { getRoomStatuses, setRoomStatus, setupFloor2, RoomStatusUI } from "../api/adminRoomsApi";
import { getAIControlF2, setAIControlF2 } from "../api/floorApi";

// ==================== ROOM TYPES ====================
interface RoomItem {
  id: string; // use roomCode as id (M1, ...)
  type: "Meeting Room" | "Private Office";
  zone: string; // display only; not from DB for now
  capacity: number;
  capacityLabel?: string;
  status: RoomStatusUI;
}

type ActivityColor = 'green' | 'orange' | 'red' | 'blue';
type ActivityItem = { color: ActivityColor; text: string; time: string };

export default function Floor2() {
  const [searchRoom, setSearchRoom] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<RoomItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  // Zone filter removed per request
  const [showFilters, setShowFilters] = useState(false);
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [loading, setLoading] = useState(false);
  // AI state (Floor 2)
  const [aiActive, setAiActive] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const [aiPeopleCount, setAiPeopleCount] = useState(0);
  const [dynamicActivities, setDynamicActivities] = useState<ActivityItem[]>([]);
  const evtRef = useRef<EventSource | null>(null);

  // fetch & ensure seed
  useEffect(() => {
    let timer;
    const load = async () => {
      setLoading(true);
      try {
        // ensure floor2 rooms exist (idempotent)
        await setupFloor2().catch(()=>{});
        const [mr, po] = await Promise.all([
          getRoomStatuses('meeting_room'),
          getRoomStatuses('private_office')
        ]);
        const capMapNum: Record<string, number> = { M1: 14, M2: 13, M3: 11, M4: 13, P1: 43 };
        const capMapLabel: Record<string, string> = { M1: '14', M2: '13', M3: '11', M4: '13', P1: '43' };
        const toRoom = (r: { roomCode: string; status: RoomStatusUI; capacity: number; floor: number }): RoomItem => {
          const code = r.roomCode;
          const capacityOverride = capMapNum[code] ?? r.capacity;
          return {
            id: code,
            type: code.startsWith('M') ? 'Meeting Room' : 'Private Office',
            zone: code.startsWith('M') ? 'Meeting Hub' : 'Private Offices',
            capacity: typeof capacityOverride === 'number' ? capacityOverride : (r.capacity || 0),
            capacityLabel: capMapLabel[code],
            status: r.status
          };
        };
        const removed = new Set(['MR-201','MR-202','PO-203']);
        setRooms([...(mr||[]).map(toRoom), ...(po||[]).map(toRoom)].filter(r => !removed.has(r.id)));
      } finally { setLoading(false); }
    };
    load();
    // poll every 5s for status refresh
    timer = setInterval(load, 5000);
    return () => clearInterval(timer);
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
            if (now === 0 && last > 0) {
              setDynamicActivities(prev => ([{ color: 'green' as ActivityColor, text: 'Floor 2 is now empty', time: timeText }, ...prev].slice(0,30)));
            } else if (last === 0 && now > 0) {
              setDynamicActivities(prev => ([{ color: 'blue' as ActivityColor, text: `People detected: ${now}`, time: timeText }, ...prev].slice(0,30)));
            } else if (now !== last) {
              const change = now > last ? 'arrived' : 'left';
              const color: ActivityColor = now > last ? 'blue' : 'orange';
              setDynamicActivities(prev => ([{ color, text: `People ${change}. Count: ${now}`, time: timeText }, ...prev].slice(0,30)));
            }
            last = now;
          }
        } catch {}
      });
      es.addEventListener('ai.control', (ev: MessageEvent) => {
        try { const data = JSON.parse((ev as any).data || '{}'); setAiActive(!!data.active); if (!data.active) { setAiReady(false); setAiPeopleCount(0); setDynamicActivities([]);} } catch {}
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
    if (!next) { setAiReady(false); setAiPeopleCount(0); setDynamicActivities([]); }
  };

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

  const handleRoomClick = (room: RoomItem) => {
    setSelectedRoom(room);
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

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-[12px] p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[12px] text-gray-600">Cameras Active</span>
              </div>
              <p className="text-[24px] font-semibold text-[#021526]">{aiActive && aiReady ? '1/1' : '0/1'}</p>
            </div>

            <div className="bg-gray-50 rounded-[12px] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-3 h-3 text-gray-600" />
                <span className="text-[12px] text-gray-600">People counting</span>
              </div>
              <p className="text-[24px] font-semibold text-[#021526]">{(aiActive && aiReady) ? aiPeopleCount : '—'}</p>
              <p className="text-[11px] text-gray-500">&nbsp;</p>
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
      <Sheet open={!!selectedRoom} onOpenChange={() => setSelectedRoom(null)}>
        <SheetContent className="w-[500px] rounded-l-[20px]">
          <SheetHeader>
            <SheetTitle className="text-[22px] font-semibold">
              {selectedRoom?.type} {selectedRoom?.id}
            </SheetTitle>
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
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

