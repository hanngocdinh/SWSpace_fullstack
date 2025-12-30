import { useState } from "react";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Users, Shield, CheckCircle, Ban } from "lucide-react";

import AdminManage from "./AdminManage";
import UserManage from "./UserManage";
import type { SummaryCounts, UserRole } from "./types";

const emptySummary: SummaryCounts = { total: 0, active: 0, inactive: 0 };

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState<UserRole>("admin");
  const [adminSummary, setAdminSummary] = useState<SummaryCounts>(emptySummary);
  const [userSummary, setUserSummary] = useState<SummaryCounts>(emptySummary);

  const summary = activeTab === "admin" ? adminSummary : userSummary;
  const label = activeTab === "admin" ? "Admins" : "Users";

  return (
    <div className="p-8 overflow-auto h-full bg-[#F5F5F5]">
      <div className="mb-4">
        <div className="flex items-center gap-2 text-[14px]">
          <span className="text-gray-500 hover:text-[#317752] cursor-pointer">Dashboard</span>
          <span className="text-gray-400">/</span>
          <span className="text-[#317752]">User Management</span>
        </div>
      </div>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[28px] text-[#021526] mb-2">User Management</h1>
          <p className="text-[15px] text-gray-600">Manage all user accounts and permissions</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="bg-white inline-flex rounded-[12px] p-1 shadow-sm border border-gray-200">
          <button
            onClick={() => setActiveTab("admin")}
            className={`px-6 py-2.5 rounded-[10px] text-[14px] transition-all flex items-center gap-2 ${
              activeTab === "admin" ? "bg-[#317752] text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Shield className="w-4 h-4" />
            Admin
          </button>
          <button
            onClick={() => setActiveTab("user")}
            className={`px-6 py-2.5 rounded-[10px] text-[14px] transition-all flex items-center gap-2 ${
              activeTab === "user" ? "bg-[#317752] text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Users className="w-4 h-4" />
            User
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-[56px] h-[56px] bg-blue-50 rounded-[12px] flex items-center justify-center">
              {activeTab === "admin" ? (
                <Shield className="w-7 h-7 text-blue-600" />
              ) : (
                <Users className="w-7 h-7 text-blue-600" />
              )}
            </div>
            <div>
              <p className="text-[13px] text-gray-600 mb-1">Total {label}</p>
              <p className="text-[28px] text-[#021526]">{summary.total}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-[56px] h-[56px] bg-green-50 rounded-[12px] flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <p className="text-[13px] text-gray-600 mb-1">Active</p>
              <p className="text-[28px] text-[#021526]">{summary.active}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-[56px] h-[56px] bg-red-50 rounded-[12px] flex items-center justify-center">
              <Ban className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <p className="text-[13px] text-gray-600 mb-1">Inactive</p>
              <p className="text-[28px] text-[#021526]">{summary.inactive}</p>
            </div>
          </div>
        </Card>
      </div>

      {activeTab === "admin" ? (
        <AdminManage onSummaryChange={setAdminSummary} />
      ) : (
        <UserManage onSummaryChange={setUserSummary} />
      )}
    </div>
  );
}



