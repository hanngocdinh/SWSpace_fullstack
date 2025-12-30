import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Maximize2, 
  CreditCard, 
  FileText, 
  Settings, 
  HelpCircle,
  ChevronDown,
  LogOut
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

export default function Sidebar({ currentPage, onNavigate, onLogout }: SidebarProps) {
  const [isSpaceManagementExpanded, setIsSpaceManagementExpanded] = useState(false);
  const [isServicePackageExpanded, setIsServicePackageExpanded] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "user-management", label: "User Management", icon: Users },
    { id: "service-package", label: "Service Package", icon: Package, hasSubmenu: true },
    { id: "space-management", label: "Space Management", icon: Maximize2, hasSubmenu: true },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "report", label: "Report", icon: FileText },
  ];

  const servicePackageSubItems = [
    { id: "service-freelance", label: "Freelance" },
    { id: "service-team", label: "Team" },
  ];

  const spaceManagementSubItems = [
    { id: "floor-1", label: "Floor 1" },
    { id: "floor-2", label: "Floor 2" },
    { id: "floor-3", label: "Floor 3" },
  ];

  const bottomItems = [
    { id: "settings", label: "Settings", icon: Settings },
    { id: "help-center", label: "Help center", icon: HelpCircle },
  ];

  const handleSpaceManagementClick = () => {
    setIsSpaceManagementExpanded(!isSpaceManagementExpanded);
  };

  const handleServicePackageClick = () => {
    setIsServicePackageExpanded(!isServicePackageExpanded);
  };

  return (
    <div className="bg-[#317752] h-full w-[256px] flex flex-col relative shrink-0">
      {/* Logo */}
      <div className="px-[28px] py-[36px]">
        <div className="bg-white rounded-[20px] px-4 py-6 text-center">
          <p className="text-[20px]">
            <span className="text-[#317752] font-semibold">SW</span>
            <span className="text-[#021526] font-semibold">Space</span>
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          if (item.hasSubmenu) {
            // Service Package submenu
            if (item.id === "service-package") {
              const isServicePackageActive = currentPage.startsWith("service-");
              return (
                <div key={item.id}>
                  <button
                    onClick={handleServicePackageClick}
                    className={`flex items-center justify-between w-full px-6 py-3 rounded-lg transition-colors text-left ${
                      isServicePackageActive || isServicePackageExpanded
                        ? "bg-[rgba(255,255,255,0.15)]" 
                        : "hover:bg-[rgba(255,255,255,0.08)]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-white shrink-0" />
                      <span className="text-white text-[15px]">{item.label}</span>
                    </div>
                    <ChevronDown 
                      className={`w-4 h-4 text-white transition-transform ${
                        isServicePackageExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  
                  {/* Service Package Submenu */}
                  {isServicePackageExpanded && (
                    <div className="mt-1 space-y-1">
                      {servicePackageSubItems.map((subItem) => {
                        const isSubActive = currentPage === subItem.id;
                        return (
                          <button
                            key={subItem.id}
                            onClick={() => onNavigate(subItem.id)}
                            className={`flex items-center w-full pl-[52px] pr-6 py-2.5 rounded-lg transition-colors text-left ${
                              isSubActive
                                ? "bg-[rgba(255,255,255,0.2)]"
                                : "hover:bg-[rgba(255,255,255,0.1)]"
                            }`}
                          >
                            <span className="text-white text-[14px]">{subItem.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            
            // Space Management submenu
            return (
              <div key={item.id}>
                <button
                  onClick={handleSpaceManagementClick}
                  className={`flex items-center justify-between w-full px-6 py-3 rounded-lg transition-colors text-left ${
                    isActive || isSpaceManagementExpanded
                      ? "bg-[rgba(255,255,255,0.15)]" 
                      : "hover:bg-[rgba(255,255,255,0.08)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-white shrink-0" />
                    <span className="text-white text-[15px]">{item.label}</span>
                  </div>
                  <ChevronDown 
                    className={`w-4 h-4 text-white transition-transform ${
                      isSpaceManagementExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>
                
                {/* Space Management Submenu */}
                {isSpaceManagementExpanded && (
                  <div className="mt-1 space-y-1">
                    {spaceManagementSubItems.map((subItem) => {
                      const isSubActive = currentPage === subItem.id;
                      return (
                        <button
                          key={subItem.id}
                          onClick={() => onNavigate(subItem.id)}
                          className={`flex items-center w-full pl-[52px] pr-6 py-2.5 rounded-lg transition-colors text-left ${
                            isSubActive
                              ? "bg-[rgba(255,255,255,0.2)]"
                              : "hover:bg-[rgba(255,255,255,0.1)]"
                          }`}
                        >
                          <span className="text-white text-[14px]">{subItem.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-lg transition-colors text-left ${
                isActive 
                  ? "bg-[rgba(255,255,255,0.15)]" 
                  : "hover:bg-[rgba(255,255,255,0.08)]"
              }`}
            >
              <Icon className="w-5 h-5 text-white shrink-0" />
              <span className="text-white text-[15px]">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="mt-auto flex flex-col gap-1 px-4 pb-8">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-lg transition-colors text-left ${
                isActive 
                  ? "bg-[rgba(255,255,255,0.15)]" 
                  : "hover:bg-[rgba(255,255,255,0.08)]"
              }`}
            >
              <Icon className="w-5 h-5 text-white shrink-0" />
              <span className="text-white text-[15px]">{item.label}</span>
            </button>
          );
        })}

        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-6 py-3 rounded-lg transition-colors text-left hover:bg-[rgba(255,255,255,0.08)] mt-2"
          >
            <LogOut className="w-5 h-5 text-white shrink-0" />
            <span className="text-white text-[15px]">Log out</span>
          </button>
        )}
      </div>
    </div>
  );
}