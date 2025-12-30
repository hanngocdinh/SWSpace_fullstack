import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import { Search, Camera, Bell, X, AlertCircle, Info } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import QrScannerPanel from "./QrScannerPanel";
import { AdminNotification, fetchAdminNotifications } from "../api/dashboardApi";

const MAX_NOTIFICATIONS = 15;
const NOTIFICATION_FETCH_LIMIT = MAX_NOTIFICATIONS * 2;
const RELATIVE_TIME_TICK_MS = 10000;

const normalizeNotifications = (items: AdminNotification[]) => {
  return [...items]
    .sort((a, b) => {
      const aTime = a?.createdAt ? dayjs(a.createdAt).valueOf() : 0;
      const bTime = b?.createdAt ? dayjs(b.createdAt).valueOf() : 0;
      return bTime - aTime;
    })
    .slice(0, MAX_NOTIFICATIONS);
};

const formatRelativeTimeLabel = (iso: string | null, nowMs: number) => {
  if (!iso) return "Just now";
  const timestamp = Date.parse(iso);
  if (!Number.isFinite(timestamp)) return "Just now";
  const diffMs = Math.max(0, nowMs - timestamp);
  if (diffMs < 60_000) return "Just now";
  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
};

interface DashboardLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  onNavigate?: (page: string) => void;
}

type NotificationView = AdminNotification & { read: boolean };

export default function DashboardLayout({ children, showHeader = true, onNavigate }: DashboardLayoutProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationView[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const readStateRef = useRef<Record<string, boolean>>({});
  const initializedRef = useRef(false);
  const [relativeClock, setRelativeClock] = useState(() => Date.now());

  const loadNotifications = useCallback(async () => {
    try {
      if (!initializedRef.current) setNotificationsLoading(true);
      const data = await fetchAdminNotifications({ limit: NOTIFICATION_FETCH_LIMIT });
      const normalized = normalizeNotifications(Array.isArray(data) ? data : []);
      setNotifications(normalized.map((item) => ({
        ...item,
        read: readStateRef.current[item.id] ?? false
      })));
      setNotificationsError(null);
    } catch (error) {
      console.error('dashboard.notifications.fetch', error);
      setNotificationsError('Unable to load notifications');
    } finally {
      initializedRef.current = true;
      setNotificationsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  useEffect(() => {
    const tick = setInterval(() => setRelativeClock(Date.now()), RELATIVE_TIME_TICK_MS);
    return () => clearInterval(tick);
  }, []);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const handleNotificationClick = (notification: NotificationView) => {
    readStateRef.current[notification.id] = true;
    setNotifications(prev => prev.map(item => item.id === notification.id ? { ...item, read: true } : item));
    if (notification.targetPage && onNavigate) {
      onNavigate(notification.targetPage);
    }
    setShowNotifications(false);
  };

  const formatTime = useCallback((value: string | null) => {
    return formatRelativeTimeLabel(value, relativeClock);
  }, [relativeClock]);

  return (
    <div className="flex-1 overflow-auto bg-[#f5f5f5]">
      {showHeader && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] text-gray-600 mb-1">Admin Dashboard</p>
              <h2 className="text-[18px] font-semibold text-[#021526]">Welcome Back, Admin!</h2>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative w-[400px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search Anything..."
                  className="pl-10 bg-gray-50 border-gray-200 rounded-[8px] h-[40px]"
                />
              </div>
              
              {/* Icons */}
              <Popover open={scannerOpen} onOpenChange={setScannerOpen}>
                <PopoverTrigger asChild>
                  <button
                    className="w-[40px] h-[40px] rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                    aria-label="Open QR scanner"
                  >
                    <Camera className="w-5 h-5 text-gray-600" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  sideOffset={12}
                  className="p-0 border-none shadow-none bg-transparent w-auto"
                >
                  <QrScannerPanel onClose={() => setScannerOpen(false)} />
                </PopoverContent>
              </Popover>
              
              <div className="relative">
                <button 
                  className="w-[40px] h-[40px] rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-semibold">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Panel */}
                {showNotifications && (
                  <div className="absolute right-0 top-[50px] w-[420px] bg-white rounded-[16px] shadow-2xl border border-gray-200 z-50">
                    <div className="p-5 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-[18px] font-semibold text-[#021526]">Notifications</h3>
                          <p className="text-[13px] text-gray-600">{unreadCount} unread messages</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowNotifications(false)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="max-h-[500px] overflow-y-auto">
                      {notificationsLoading && notifications.length === 0 && (
                        <div className="p-4 text-[13px] text-gray-500">Loading notifications...</div>
                      )}
                      {!notificationsLoading && notificationsError && (
                        <div className="p-4 text-[13px] text-red-500">{notificationsError}</div>
                      )}
                      {!notificationsLoading && !notificationsError && notifications.length === 0 && (
                        <div className="p-4 text-[13px] text-gray-500">You're all caught up.</div>
                      )}
                      {notifications.map((notif) => {
                        const styles = notif.category === 'floor'
                          ? { bg: 'bg-red-100/80', ring: 'ring-red-200/70', iconClass: 'text-red-600', Icon: AlertCircle }
                          : { bg: 'bg-blue-100/80', ring: 'ring-blue-200/70', iconClass: 'text-blue-600', Icon: Info };
                        const { Icon } = styles;
                        return (
                          <button
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                              !notif.read ? 'bg-blue-50/30' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${styles.bg} ring-1 ${styles.ring}`}>
                                <Icon className={`w-4 h-4 ${styles.iconClass}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <p className="text-[14px] font-semibold text-[#021526]">{notif.title}</p>
                                  {!notif.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                                  )}
                                </div>
                                <p className="text-[13px] text-gray-600 mb-2">{notif.message}</p>
                                <div className="flex items-center justify-between text-[11px] text-gray-500">
                                  <span className="uppercase tracking-wide text-[10px]">
                                    {notif.category === 'floor' ? 'Floor Activity' : 'Pending Booking'}
                                  </span>
                                  <span>{formatTime(notif.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="p-3 border-t border-gray-200">
                      <Button
                        variant="ghost"
                        className="w-full text-[#317752] hover:text-[#2a6545] hover:bg-gray-50"
                        onClick={() => {
                          setShowNotifications(false);
                          onNavigate?.('dashboard');
                        }}
                      >
                        View All Notifications
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* User Avatar */}
              <div className="w-[40px] h-[40px] rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <span className="text-white text-[14px] font-semibold">A</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
