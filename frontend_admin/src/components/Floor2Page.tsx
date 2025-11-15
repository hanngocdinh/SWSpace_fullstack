import { Download, Plus, Edit } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import Floor2 from "./Floor2";

export default function Floor2Page() {
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
            variant="outline"
            className="rounded-[10px] px-4 h-[40px] border-gray-300"
            onClick={handleExportReport}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button
            className="bg-[#317752] hover:bg-[#2a6545] text-white rounded-[10px] px-4 h-[40px]"
            onClick={() => toast.success("Opening add room form...")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Room
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

      {/* ==================== FLOOR 2 CONTENT ==================== */}
      <Floor2 />
    </div>
  );
}

