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
import { getRoomStatuses, setRoomStatus, setupFloor3, RoomStatusUI } from "../api/adminRoomsApi";
import { getAIControlF3, setAIControlF3 } from "../api/floorApi";

// ==================== ROOM TYPES ====================
interface SpaceItem {
  id: string; // use roomCode as id (N1, ...)
  type: "Networking Space";
  zone: string; // display only; not from DB for now
  capacity: number;
  capacityLabel?: string;
  status: RoomStatusUI;
  user?: { name: string; email?: string; phone?: string; company?: string };
  booking?: { eventTitle?: string; package: string; startDate: string; endDate: string; paymentStatus: "Paid" | "Pending" | "Overdue" };
}

type ActivityColor = 'green' | 'orange' | 'red' | 'blue';
type ActivityItem = { color: ActivityColor; text: string; time: string };

export default function Floor3() {
  const [searchSpace, setSearchSpace] = useState("");
  const [selectedSpace, setSelectedSpace] = useState<SpaceItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  // Zone and Type filters removed per request and to fix blank page
  const [showFilters, setShowFilters] = useState(false);
  const [spaces, setSpaces] = useState<SpaceItem[]>([]);
  const [loading, setLoading] = useState(false);
  // AI state (Floor 3)
  const [aiActive, setAiActive] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const [aiPeopleCount, setAiPeopleCount] = useState(0);
  const [dynamicActivities, setDynamicActivities] = useState<ActivityItem[]>([]);
  const evtRef = useRef<EventSource | null>(null);
  const handleMarkAsVacant = () => toast.success('Marked as vacant');
  const handleCancelBooking = () => toast.success('Booking cancelled');

  // fetch & ensure seed
  useEffect(() => {
    let timer: any;
    const load = async () => {
      setLoading(true);
      try {
        await setupFloor3().catch(()=>{});
        const net = await getRoomStatuses('networking');
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
        setSpaces((net||[]).map(toSpace));
      } finally { setLoading(false); }
    };
    load();
    timer = setInterval(load, 5000);
    return () => clearInterval(timer);
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
          if (typeof data.peopleCount === 'number') {
            const now = data.peopleCount as number;
            setAiPeopleCount(now);
            if (!aiReady) setAiReady(true);
            const timeText = new Date().toLocaleTimeString();
            if (now === 0 && last > 0) {
              setDynamicActivities(prev => ([{ color: 'green' as ActivityColor, text: 'Floor 3 now empty', time: timeText }, ...prev].slice(0,30)));
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
    await setAIControlF3(next);
    setAiActive(next);
    if (!next) { setAiReady(false); setAiPeopleCount(0); setDynamicActivities([]); }
  };

  // Space Stats
  const totalSpaces = spaces.length;
  const occupiedSpaces = spaces.filter(s => s.status === "Occupied").length;
  const availableSpaces = spaces.filter(s => s.status === "Available").length;
  const maintenanceSpaces = spaces.filter(s => s.status === "Maintenance").length;
  const reservedSpaces = 0;

  // Filter Spaces
  const filteredSpaces = spaces.filter(space => {
    const matchesSearch = space.id.toLowerCase().includes(searchSpace.toLowerCase()) ||
                         space.zone.toLowerCase().includes(searchSpace.toLowerCase()) ||
                         space.type.toLowerCase().includes(searchSpace.toLowerCase());
    const matchesStatus = statusFilter === "all" || space.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSpaceClick = (space: SpaceItem) => {
    setSelectedSpace(space);
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
            <div className="w-[56px] h-[56px] bg-orange-50 rounded-[12px] flex items-center justify-center">
              <Clock className="w-7 h-7 text-orange-600" />
            </div>
            <div>
              <p className="text-[13px] text-gray-600 mb-1">Reserved</p>
              <p className="text-[28px] font-semibold text-[#021526]">{reservedSpaces}</p>
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
      <Sheet open={!!selectedSpace} onOpenChange={() => setSelectedSpace(null)}>
        <SheetContent className="w-[500px] rounded-l-[20px]">
          <SheetHeader>
            <SheetTitle className="text-[22px] font-semibold">
              {selectedSpace?.type} {selectedSpace?.id}
            </SheetTitle>
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

              {selectedSpace.user && (
                <>
                  <div>
                    <h4 className="text-[15px] font-semibold text-[#021526] mb-3">User Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-[14px] text-gray-700">{selectedSpace.user.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-[14px] text-gray-700">{selectedSpace.user.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-[14px] text-gray-700">{selectedSpace.user.phone}</span>
                      </div>
                      {selectedSpace.user.company && (
                        <div className="flex items-center gap-3">
                          <Building2 className="w-4 h-4 text-gray-500" />
                          <span className="text-[14px] text-gray-700">{selectedSpace.user.company}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedSpace.booking && (
                    <div>
                      <h4 className="text-[15px] font-semibold text-[#021526] mb-3">Booking Details</h4>
                      <div className="space-y-3">
                        {selectedSpace.booking.eventTitle && (
                          <div>
                            <span className="text-[13px] text-gray-600">Event Title</span>
                            <p className="text-[13px] font-medium text-[#021526] mt-1">{selectedSpace.booking.eventTitle}</p>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-[13px] text-gray-600">Package</span>
                          <span className="text-[13px] font-medium text-[#021526]">{selectedSpace.booking.package}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[13px] text-gray-600">Period</span>
                          <span className="text-[13px] font-medium text-[#021526]">
                            {selectedSpace.booking.startDate} - {selectedSpace.booking.endDate}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[13px] text-gray-600">Payment</span>
                          <Badge className={`${
                            selectedSpace.booking.paymentStatus === "Paid" ? "bg-green-100 text-green-700" :
                            selectedSpace.booking.paymentStatus === "Pending" ? "bg-orange-100 text-orange-700" :
                            "bg-red-100 text-red-700"
                          } border-0 text-[11px]`}>
                            {selectedSpace.booking.paymentStatus}
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

              {!selectedSpace.user && (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">This space is available for booking</p>
                  <Button className="bg-[#317752] hover:bg-[#2a6545] text-white rounded-[10px]">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Space
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

