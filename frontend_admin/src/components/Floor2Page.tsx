import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import Floor2 from "./Floor2";

export default function Floor2Page() {
  return (
    <div className="p-8 overflow-auto h-full">
      {/* Breadcrumb */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-[14px]">
          <span className="text-gray-500 hover:text-[#317752] cursor-pointer">Dashboard</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500 hover:text-[#317752] cursor-pointer">Space Management</span>
          <span className="text-gray-400">/</span>
          <span className="text-[#021526]">Floor 2</span>
        </div>
      </div>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-semibold text-[#021526] mb-2">Floor 2 – Meeting Rooms & Private Offices</h1>
          <p className="text-[15px] text-gray-600">
            Meeting Rooms And Private Offices
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            className="bg-[#317752] hover:bg-[#2a6545] text-white rounded-[10px] px-4 h-[40px]"
            onClick={() => { window.dispatchEvent(new Event('open-add-room-form-floor2')); }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Room
          </Button>
        </div>
      </div>

      {/* ==================== FLOOR 2 CONTENT ==================== */}
      <Floor2 />
    </div>
  );
}

