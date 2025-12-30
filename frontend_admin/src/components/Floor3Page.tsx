import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import Floor3 from "./Floor3";

export default function Floor3Page() {
  return (
    <div className="p-8 overflow-auto h-full">
      {/* Breadcrumb */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-[14px]">
          <span className="text-gray-500 hover:text-[#317752] cursor-pointer">Dashboard</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500 hover:text-[#317752] cursor-pointer">Space Management</span>
          <span className="text-gray-400">/</span>
          <span className="text-[#021526]">Floor 3</span>
        </div>
      </div>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-semibold text-[#021526] mb-2">Floor 3 – Networking Space</h1>
          <p className="text-[15px] text-gray-600">
            Event Hall, Conference Area, Open Networking Zone
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            className="bg-[#317752] hover:bg-[#2a6545] text-white rounded-[10px] px-4 h-[40px]"
            onClick={() => window.dispatchEvent(new Event('open-add-space-form-floor3'))}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Space
          </Button>
        </div>
      </div>

      {/* ==================== FLOOR 3 CONTENT ==================== */}
      <Floor3 />
    </div>
  );
}

