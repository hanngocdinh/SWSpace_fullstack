import { useState } from "react";
import { 
  Download, 
  Plus, 
  Edit
} from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import Floor1FixedDesk from "./Floor1FixedDesk";
import Floor1HotDesk from "./Floor1HotDesk";

type DeskType = "fixed" | "hot";

export default function Floor1Page() {
  const [activeTab, setActiveTab] = useState<DeskType>("fixed");

  const handleExportReport = () => {
    toast.success("Exporting report...");
  };

  return (
    <div className="p-8 overflow-auto h-full">
      {/* Breadcrumb */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-[14px]">
          <span className="text-gray-500 hover:text-[#317752] cursor-pointer">Dashboard</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500 hover:text-[#317752] cursor-pointer">Space Management</span>
          <span className="text-gray-400">/</span>
          <span className="text-[#021526]">Floor 1</span>
          <span className="text-gray-400">/</span>
          <span className="text-[#317752]">{activeTab === "fixed" ? "Fixed Desk" : "Hot Desk"}</span>
        </div>
      </div>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-semibold text-[#021526] mb-2">Floor 1 – Main Workspace</h1>
          <p className="text-[15px] text-gray-600">
            {activeTab === "fixed" 
              ? "Fixed Desks With Numbered Seats" 
              : "Flexible Hot Desk With Shift-Based Booking"}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-[10px] px-4 h-[40px] border-gray-300"
            onClick={handleExportReport}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button
            className="bg-[#317752] hover:bg-[#2a6545] text-white rounded-[10px] px-4 h-[40px]"
            onClick={() => toast.success(activeTab === "fixed" ? "Opening add seat form..." : "Opening add booking form...")}
          >
            <Plus className="w-4 h-4 mr-2" />
            {activeTab === "fixed" ? "Add Seat" : "Add Booking"}
          </Button>
          <Button
            variant="outline"
            className="rounded-[10px] px-4 h-[40px] border-gray-300"
            onClick={() => toast.success("Opening layout editor...")}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Layout
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="bg-white inline-flex rounded-[16px] p-1.5 shadow-sm border border-gray-200">
          <button
            onClick={() => setActiveTab("fixed")}
            className={`px-8 py-2.5 rounded-[12px] transition-all ${
              activeTab === "fixed"
                ? "bg-[#317752] text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Fixed Desk
          </button>
          <button
            onClick={() => setActiveTab("hot")}
            className={`px-8 py-2.5 rounded-[12px] transition-all ${
              activeTab === "hot"
                ? "bg-[#317752] text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Hot Desk
          </button>
        </div>
      </div>

      {/* ==================== FIXED DESK VIEW ==================== */}
      {activeTab === "fixed" && <Floor1FixedDesk />}

      {/* ==================== HOT DESK VIEW ==================== */}
      {activeTab === "hot" && <Floor1HotDesk />}
    </div>
  );
}
