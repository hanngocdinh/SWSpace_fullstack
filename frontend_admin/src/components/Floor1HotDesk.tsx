import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { 
  ChevronLeft, 
  ChevronRight,
  Users,
  Calendar as CalendarIcon,
  Video,
  TrendingUp,
  CheckCircle,
  Activity,
  Play,
  Pause
} from "lucide-react";
import { Badge } from "./ui/badge";
import { getAIControlHD, setAIControlHD, getHotDeskOccupancy } from "../api/floorApi";

/* --- Occupancy Types --- */
type OccBreakdown = { day: number; week: number; month: number; year: number };
type OccTotals = { totalSeats: number; booked: number; available: number; occupancyRate: number };

/* --- MAIN COMPONENT --- */
type ActivityColor = 'green' | 'orange' | 'red' | 'blue';
type ActivityItem = { color: ActivityColor; text: string; time: string };

export default function Floor1HotDesk() {
  // Live AI moved here for Hot Desk
  const [aiActive, setAiActive] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const [aiPeopleCount, setAiPeopleCount] = useState(0);
  const [dynamicActivities, setDynamicActivities] = useState<ActivityItem[]>([]);
  const evtRef = useRef<EventSource | null>(null);

  // Calendar/time + occupancy state
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedTime, setSelectedTime] = useState(() => dayjs().format('HH:mm'));
  const [occBreakdown, setOccBreakdown] = useState<OccBreakdown | null>(null);
  const [occTotals, setOccTotals] = useState<OccTotals | null>(null);
  const [occLoading, setOccLoading] = useState(false);
  const [occError, setOccError] = useState<string | null>(null);

  // Sync control on mount (Hot Desk only)
  useEffect(() => {
    (async () => {
      try {
        const ctl = await getAIControlHD();
        setAiActive(!!ctl.active);
      } catch {}
    })();
  }, []);

  // Open SSE when active
  useEffect(() => {
  const BACKEND = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:5000';
    if (aiActive) {
      if (evtRef.current) { evtRef.current.close(); evtRef.current = null; }
  const es = new EventSource(`${BACKEND}/api/space/floor1/ai-hd/stream`);
      let last = aiPeopleCount;
      es.addEventListener('ai.people', (ev: MessageEvent) => {
        try {
          const data = JSON.parse(ev.data || '{}');
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
              const color: ActivityColor = now > last ? 'blue' : 'orange';
              setDynamicActivities(prev => ([{ color, text: `People ${change}. Count: ${now}`, time: timeText }, ...prev].slice(0, 30)));
            }
            last = now;
          }
        } catch {}
      });
      es.addEventListener('ai.control', (ev: MessageEvent) => {
        try { const data = JSON.parse(ev.data || '{}'); setAiActive(!!data.active); if (!data.active) { setAiReady(false); setAiPeopleCount(0); setDynamicActivities([]);} } catch {}
      });
      evtRef.current = es;
      return () => { es.close(); evtRef.current = null; };
    } else {
      if (evtRef.current) { evtRef.current.close(); evtRef.current = null; }
    }
  }, [aiActive]);

  const toggleAIActive = async () => {
    const next = !aiActive;
  await setAIControlHD(next);
    setAiActive(next);
    if (!next) { setAiReady(false); setAiPeopleCount(0); setDynamicActivities([]); }
  };

  // Fetch occupancy whenever date/time changes
  useEffect(() => {
    const [hh, mm] = (selectedTime || '09:00').split(':').map((n: string) => parseInt(n, 10));
    const at = selectedDate.hour(hh || 0).minute(mm || 0).second(0).millisecond(0).toISOString();
    let cancelled = false;
    setOccLoading(true);
    getHotDeskOccupancy(at)
      .then((res) => {
        if (cancelled) return;
        setOccBreakdown(res.breakdown);
        setOccTotals(res.totals);
        setOccError(null);
      })
      .catch((e) => { if (!cancelled) setOccError('Failed to load'); })
      .finally(() => { if (!cancelled) setOccLoading(false); });
    return () => { cancelled = true; };
  }, [selectedDate, selectedTime]);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <main className="flex-1 overflow-y-auto p-8">
        {/* Calendar */}
        <div className="mb-8">
          <CalendarSection
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            selectedTime={selectedTime}
            onTimeChange={setSelectedTime}
          />
        </div>

        {/* Booking Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <BookingCard icon={<CalendarIcon size={18} className="text-blue-600" />} title="Daily Bookings" value={occBreakdown ? occBreakdown.day.toString() : (occLoading ? '…' : '—')} subtitle="Day Packages" bgColor="bg-blue-100" />
          <BookingCard icon={<CalendarIcon size={18} className="text-orange-600" />} title="Weekly Bookings" value={occBreakdown ? occBreakdown.week.toString() : (occLoading ? '…' : '—')} subtitle="Week Packages" bgColor="bg-orange-100" />
          <BookingCard icon={<CalendarIcon size={18} className="text-green-600" />} title="Monthly Bookings" value={occBreakdown ? occBreakdown.month.toString() : (occLoading ? '…' : '—')} subtitle="Month Packages" bgColor="bg-green-100" />
          <BookingCard icon={<CalendarIcon size={18} className="text-purple-600" />} title="Yearly Bookings" value={occBreakdown ? occBreakdown.year.toString() : (occLoading ? '…' : '—')} subtitle="Year Packages" bgColor="bg-purple-100" />
        </div>

        {/* Workspace Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Users size={28} />} title="Total Seats" value={occTotals ? occTotals.totalSeats.toString() : (occLoading ? '…' : '—')} subtitle="Total Hot Desk Seats" bgColor="bg-gray-200" />
          <StatCard icon={<CheckCircle size={28} />} title="Booked" value={occTotals ? occTotals.booked.toString() : (occLoading ? '…' : '—')} subtitle="Currently Booked" bgColor="bg-blue-200" />
          <StatCard icon={<TrendingUp size={28} />} title="Available" value={occTotals ? occTotals.available.toString() : (occLoading ? '…' : '—')} subtitle="Seats Available" bgColor="bg-green-100" />
          <StatCard icon={<TrendingUp size={28} />} title="Occupancy Rate" value={occTotals ? `${occTotals.occupancyRate}%` : (occLoading ? '…' : '—')} bgColor="bg-purple-100" hasChart />
        </div>

        {/* AI Occupancy Detection (moved from Fixed Desk) */}
        <div className="grid grid-cols-[1fr_400px] gap-6 mb-6">
          {/* Left: AI Card */}
          <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-[48px] h-[48px] bg-purple-50 rounded-[12px] flex items-center justify-center">
                  <Video className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-[18px] font-semibold text-[#021526]">AI Occupancy Detection-HD</h3>
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
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-gray-700 font-medium">Floor 1 camera</span>
                <button
                  type="button"
                  onClick={toggleAIActive}
                  className={`appearance-none inline-flex items-center justify-center gap-2 rounded-[8px] h-[34px] min-w-[112px] px-3 text-[13px] font-semibold tracking-wide shadow-sm focus:outline-none focus:ring-2 ${aiActive 
                    ? 'focus:ring-red-400/40' : 'focus:ring-green-400/40'}`}
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
          </div>

          {/* Right: Recent Activities */}
          <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[18px] font-semibold text-[#021526]">Recent Activities</h3>
              <button className="text-[#317752] text-[13px]">View All</button>
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
          </div>
        </div>
      </main>
    </div>
  );
}

/* --- Calendar Section --- */
type CalendarSectionProps = {
  selectedDate: dayjs.Dayjs;
  onDateChange: (d: dayjs.Dayjs) => void;
  selectedTime: string;
  onTimeChange: (t: string) => void;
};

function CalendarSection({ selectedDate, onDateChange, selectedTime, onTimeChange }: CalendarSectionProps) {
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  const startOfMonth = currentMonth.startOf("month");
  const startDay = startOfMonth.day(); // Chủ nhật = 0
  const prevMonthDays = startDay === 0 ? 6 : startDay - 1;
  const totalCells = 42; // 6 hàng x 7 cột
  const calendarDays = Array.from({ length: totalCells }, (_, i) =>
    startOfMonth.subtract(prevMonthDays, "day").add(i, "day")
  );

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">{currentMonth.format("MMMM YYYY")}</h2>
        <div className="flex items-center gap-3">
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => onTimeChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
          />
          <button
            onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentMonth(currentMonth.add(1, "month"))}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {calendarDays.map((day, index) => {
          const isCurrentMonth = day.month() === currentMonth.month();
          const isToday = day.isSame(dayjs(), "day");
          const isSelected = day.isSame(selectedDate, "day");

          return (
            <button
              key={index}
              onClick={() => onDateChange(day)}
              className={`
                w-full h-8 flex items-center justify-center text-sm border border-gray-200
                transition-colors
                ${!isCurrentMonth ? "text-gray-400 bg-gray-50" : "text-gray-800 hover:bg-gray-100"}
                ${isSelected ? "bg-green-600 text-white border-green-600 font-medium" : ""}
                ${isToday && !isSelected ? "border-green-600 text-green-700 font-medium" : ""}
              `}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                minHeight: '32px',
                width: '100%'
              }}
            >
              {day.date()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* --- Subcomponents --- */
function BookingCard({ icon, title, value, subtitle, bgColor }: any) {
  return (
    <div className="bg-white shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer" style={{ borderRadius: '10px' }}>
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 ${bgColor} flex items-center justify-center shadow-sm`} style={{ borderRadius: '10px' }}>
          {icon}
        </div>
        <h3 className="font-bold text-sm text-gray-800">{title}</h3>
      </div>
      <div className="text-center">
        <p className="text-4xl font-black text-gray-900 mb-2">{value}</p>
        <p className="text-sm text-gray-500 font-medium">{subtitle}</p>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, bgColor, hasChart = false, onClick }: any) {
  return (
    <div onClick={onClick} className={`bg-white shadow-md p-5 border border-gray-200 ${onClick ? 'hover:shadow-lg transition cursor-pointer' : ''}`} style={{ borderRadius: '10px' }}>
      <h3 className="font-bold mb-4">{title}</h3>
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-14 h-14 ${bgColor} flex items-center justify-center`} style={{ borderRadius: '10px' }}>
          {icon}
        </div>
        <p className="text-2xl font-black pt-2">{value}</p>
      </div>
      {subtitle && <p className="text-sm text-gray-600 text-center">{subtitle}</p>}
      {hasChart && (
        <div className="mt-4 h-8 bg-gradient-to-r from-purple-200 via-purple-300 to-purple-400 relative overflow-hidden" style={{ borderRadius: '10px' }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        </div>
      )}
    </div>
  );
}
