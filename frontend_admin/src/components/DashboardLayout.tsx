import { ReactNode, useState } from "react";
import { Search, HelpCircle, Bell, X, AlertCircle, CheckCircle, Info } from "lucide-react";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface DashboardLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export default function DashboardLayout({ children, showHeader = true }: DashboardLayoutProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

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
              <button className="w-[40px] h-[40px] rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                <HelpCircle className="w-5 h-5 text-gray-600" />
              </button>
              
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
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                            !notif.read ? "bg-blue-50/30" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 ${
                              notif.type === "alert" ? "bg-red-100" :
                              notif.type === "success" ? "bg-green-100" :
                              "bg-blue-100"
                            }`}>
                              {notif.type === "alert" && <AlertCircle className="w-4 h-4 text-red-600" />}
                              {notif.type === "success" && <CheckCircle className="w-4 h-4 text-green-600" />}
                              {notif.type === "info" && <Info className="w-4 h-4 text-blue-600" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className="text-[14px] font-semibold text-[#021526]">{notif.title}</p>
                                {!notif.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                                )}
                              </div>
                              <p className="text-[13px] text-gray-600 mb-2">{notif.message}</p>
                              <p className="text-[11px] text-gray-500">{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 border-t border-gray-200">
                      <Button
                        variant="ghost"
                        className="w-full text-[#317752] hover:text-[#2a6545] hover:bg-gray-50"
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

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "alert" | "success" | "info";
  time: string;
  read: boolean;
}

const notifications: Notification[] = [
  {
    id: "1",
    title: "Payment Overdue",
    message: "Seat FD-08 has overdue payment. Please follow up with user.",
    type: "alert",
    time: "5 mins ago",
    read: false
  },
  {
    id: "2",
    title: "AI Detection Alert",
    message: "Camera Entrance is offline. System running on 3/4 cameras.",
    type: "alert",
    time: "15 mins ago",
    read: false
  },
  {
    id: "3",
    title: "Service Package Expiring",
    message: "3 service packages will expire in the next 7 days.",
    type: "info",
    time: "1 hour ago",
    read: false
  },
  {
    id: "4",
    title: "Booking Completed",
    message: "New booking confirmed for FD-03 by Trần Thị B.",
    type: "success",
    time: "2 hours ago",
    read: true
  },
  {
    id: "5",
    title: "Maintenance Required",
    message: "Seat FD-07 marked for maintenance check.",
    type: "info",
    time: "3 hours ago",
    read: true
  },
];