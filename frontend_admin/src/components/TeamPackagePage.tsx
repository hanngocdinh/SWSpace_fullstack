import { useEffect, useState } from "react";
import { Search, Plus, Eye, Trash2, Edit } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";

import {
  fetchPackages,
  createPackage,
  updatePackage,
  deletePackage,
  type ServicePackageUI,
  type UpsertPayload,
} from "../api/packageApi";

/* ----------------------- Helpers ----------------------- */

const TEAM_TYPES: ServicePackageUI["packageType"][] = [
  "Meeting Room",
  "Private Office",
  "Networking Space",
];

function toServiceCode(label: string): UpsertPayload["serviceCode"] {
  const s = label.toLowerCase();
  if (s.includes("meeting")) return "meeting_room";
  if (s.includes("private")) return "private_office";
  if (s.includes("network")) return "networking";
  throw new Error("Unknown service type: " + label);
}

type TeamUnit = "1 Hour" | "3 Hours" | "5 Hours" | "Day" | "3 Months" | "6 Months" | "1 Year";

function toUnitCodeTeam(unit: TeamUnit): UpsertPayload["unitCode"] {
  const u = unit.toLowerCase();
  if (u.includes("hour"))  return "hour";   // DB time_units
  if (u === "day") return "day";
  if (u.includes("month")) return "month";
  if (u.includes("year"))  return "year";
  throw new Error("Unknown unit: " + unit);
}

// 👉 tách bundleHours từ lựa chọn UI
function toBundleHours(unit: TeamUnit): number | null {
  if (unit === "1 Hour") return 1;
  if (unit === "3 Hours") return 3;
  if (unit === "5 Hours") return 5;
  return null;
}

// 👉 accessDays cho Private Office (3/6 months); 1 year không cần accessDays
function toAccessDaysTeam(pkgType: string, unit: TeamUnit): number | null {
  const lower = pkgType.toLowerCase();
  const isPrivate = lower.includes("private");
  if (isPrivate) {
    if (unit === "3 Months") return 90;
    if (unit === "6 Months") return 180;
    if (unit === "1 Year") return 365;
    return null;
  }
  // Networking Space: Day => 1 ngày
  if (lower.includes("network") && unit === "Day") return 1;
  return null;
}
// Tách features theo dòng, trả về undefined nếu rỗng
function splitFeatures(text?: string) {
  if (!text) return undefined;
  const arr = text.split("\n").map(s => s.trim()).filter(Boolean);
  return arr.length ? arr : undefined;
}

// 👉 hiển thị đơn vị đẹp: giờ đọc bundleHours, tháng đọc accessDays
function formatTeamUnit(pkg: ServicePackageUI): string {
  const base = String(pkg.unit || "").toLowerCase(); // 'hour' | 'month' | 'year' | ...
  if (base === "hour") {
    const h = pkg.bundleHours ?? 1;
    return `${h} ${h > 1 ? "hours" : "hour"}`;
  }
  if (base === "month") {
    const days = pkg.accessDays ?? 30;
    if (days >= 360) return "year";
    if (days >= 180) return "6 months";
    if (days >= 90)  return "3 months";
    return "month";
  }
  if (base === "year") return "year";
  if (base === "day")  return "day";
  if (base === "week") return "week";
  return base || "-";
}

function unitOptionsFor(type: ServicePackageUI["packageType"]): TeamUnit[] {
  if (type === "Private Office") return ["3 Months", "6 Months", "1 Year"];
    if (type === "Networking Space") return ["3 Hours", "Day"]; // chỉ hiển thị 3 Hours hoặc Day
  return ["1 Hour", "3 Hours", "5 Hours"];
}

/* ---------------------- Component ---------------------- */

export default function TeamPackagePage() {
  const [packages, setPackages] = useState<ServicePackageUI[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"All" | ServicePackageUI["packageType"]>("All");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [selectedPackage, setSelectedPackage] = useState<ServicePackageUI | null>(null);

  const [formData, setFormData] = useState<Partial<ServicePackageUI> & { unit?: TeamUnit }>({
    name: "",
    packageType: "Meeting Room",
    price: 0,
    discountPct: undefined,
    unit: "1 Hour",
    status: "Active",
    description: "",
    features: [],
  });
  const [featuresText, setFeaturesText] = useState("");

  async function reloadTeam() {
    try {
      const all = await fetchPackages();
      setPackages(all.filter(p => TEAM_TYPES.includes(p.packageType)));
      setError(null);
    } catch (e:any) {
      console.error('Failed to load team packages', e);
      setError(e?.message || 'Failed to load packages');
      setPackages([]);
    }
  }

  useEffect(() => {
    reloadTeam().catch(e => { console.error(e); setError(e?.message || String(e)); });
  }, []);

  const activePackages = packages.filter(p => p.status === "Active").length;
  const pausedPackages = packages.filter(p => p.status === "Paused").length;

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch =
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(pkg.price).includes(searchQuery);
    const matchesType = filterType === "All" || pkg.packageType === filterType;
    return matchesSearch && matchesType;
  });

  /* ------------------------ CRUD ------------------------ */

  const handleAddPackage = async () => {
    const nextPrice = Number(formData.price ?? 0);
    if (!Number.isFinite(nextPrice) || nextPrice < 0) {
      setError("Price must be greater than or equal to 0");
      return;
    }
    const pkgType = formData.packageType || "Meeting Room";
    const uiUnit = (formData.unit || (pkgType === "Private Office" ? "3 Months" : pkgType === "Networking Space" ? "3 Hours" : "1 Hour")) as TeamUnit;

    const payload: UpsertPayload = {
      serviceCode: toServiceCode(pkgType),
      unitCode: toUnitCodeTeam(uiUnit),
      name: formData.name || "",
      price: nextPrice,
      ...(formData.discountPct && formData.discountPct > 0 ? { discountPct: formData.discountPct } : {}),
      description: formData.description || "",
      accessDays: toAccessDaysTeam(pkgType, uiUnit),
      bundleHours: toBundleHours(uiUnit),        // 👈 GỬI bundleHours
      features: splitFeatures(featuresText),
      status: formData.status === "Active" ? "active" : "paused",
    };

    try {
      await createPackage(payload);
      await reloadTeam();
      resetForm();
      setIsAddModalOpen(false);
      setError(null);
    } catch (e:any) {
      console.error('Failed to create team package', e);
      setError(e?.response?.data?.error || e?.message || 'Failed to create package');
    }
  };

  const handleEditPackage = async () => {
    if (!selectedPackage) return;
    const pkgType = formData.packageType || selectedPackage.packageType;
      const uiUnit = (formData.unit ||
        (pkgType === "Private Office" ? ("3 Months" as TeamUnit) : pkgType === "Networking Space" ? ("3 Hours" as TeamUnit) : ("1 Hour" as TeamUnit))) as TeamUnit;

    const nextPrice = Number(formData.price ?? selectedPackage.price);
    if (!Number.isFinite(nextPrice) || nextPrice < 0) {
      setError("Price must be greater than or equal to 0");
      return;
    }

    const payload: UpsertPayload = {
      serviceCode: toServiceCode(pkgType),
      unitCode: toUnitCodeTeam(uiUnit),
      name: formData.name || selectedPackage.name,
      price: nextPrice,
      ...(((formData.discountPct ?? selectedPackage.discountPct) ?? 0) > 0 ? { discountPct: (formData.discountPct ?? selectedPackage.discountPct)! } : {}),
      description: formData.description || selectedPackage.description,
      accessDays: toAccessDaysTeam(pkgType, uiUnit),
      bundleHours: toBundleHours(uiUnit),        // 👈 GỬI bundleHours
      features: splitFeatures(featuresText),
      status: formData.status === "Active" ? "active" : "paused",
    };

    try {
      await updatePackage(Number(selectedPackage.id), payload);
      await reloadTeam();
      resetForm();
      setIsEditModalOpen(false);
      setError(null);
    } catch (e:any) {
      console.error('Failed to update team package', e);
      setError(e?.response?.data?.error || e?.message || 'Failed to update package');
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    await deletePackage(Number(id));
    await reloadTeam();
  };

  // Toggle giữ nguyên accessDays & bundleHours
  const handleToggleStatus = async (id: string) => {
    const pkg = packages.find(p => p.id === id);
    if (!pkg) return;

    const payload: UpsertPayload = {
      serviceCode: toServiceCode(pkg.packageType),
      unitCode: (String(pkg.unit || "").toLowerCase() as any),
      name: pkg.name,
      price: Number(pkg.price || 0),
      ...(pkg.discountPct && pkg.discountPct > 0 ? { discountPct: pkg.discountPct } : {}),
      description: pkg.description || "",
      accessDays: pkg.accessDays ?? null,         // 👈 GIỮ
      bundleHours: pkg.bundleHours ?? null,       // 👈 GIỮ
      features: pkg.features?.length ? pkg.features : undefined,
      status: pkg.status === "Active" ? "paused" : "active",
    };

    await updatePackage(Number(id), payload);
    await reloadTeam();
  };

  const openAddModal = () => {
    resetForm();
    setError(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (pkg: ServicePackageUI) => {
    setSelectedPackage(pkg);

    // map từ dữ liệu DB -> lựa chọn UI “TeamUnit”
    let defaultUnit: TeamUnit;
    const base = String(pkg.unit).toLowerCase();
    if (base === "hour") {
      defaultUnit = (pkg.bundleHours === 3 ? "3 Hours"
                    : pkg.bundleHours === 5 ? "5 Hours"
                    : "1 Hour");
    } else if (base === "day") {
      defaultUnit = "Day";
    } else if (base === "month") {
      const d = pkg.accessDays ?? 30;
      defaultUnit = d >= 180 ? "6 Months" : "3 Months";
    } else {
      defaultUnit = "1 Year";
    }

    setFormData({
      name: pkg.name,
      packageType: pkg.packageType,
      price: pkg.price,
      discountPct: (pkg.discountPct ?? 0) > 0 ? pkg.discountPct : undefined,
      unit: defaultUnit,
      status: pkg.status,
      description: pkg.description,
      features: pkg.features,
    });
    setFeaturesText((pkg.features ?? []).join("\n"));
    setIsEditModalOpen(true);
  };

  const openViewModal = (pkg: ServicePackageUI) => {
    setSelectedPackage(pkg);
    setIsViewModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      packageType: "Meeting Room",
      price: 0,
      discountPct: undefined,
      unit: "1 Hour",
      status: "Active",
      description: "",
      features: [],
    });
    setFeaturesText("");
    setSelectedPackage(null);
  };

  /* ------------------------- UI ------------------------- */
  const clampPct = (v:number) => Math.min(100, Math.max(0, v));
  const calcFinalPrice = (price:number, discountPct?: number|null) => {
    const pct = Number(discountPct ?? 0);
    if (!pct) return Math.round(price);
    return Math.round(price - (price * pct) / 100);
  };

  return (
    <div className="p-8 overflow-auto h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold text-[#021526] mb-2">Team Packages</h1>
        <p className="text-gray-600">
          Manage Meeting Room, Private Office, and Networking Space packages for teams
        </p>
      </div>

          {!isAddModalOpen && !isEditModalOpen && !isViewModalOpen && error && (
            <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700">
              <strong>Error:</strong> {error}
            </div>
          )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[14px] text-gray-600">Active Packages</span>
            <div className="w-10 h-10 bg-green-100 rounded-[10px] flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            </div>
          </div>
          <p className="text-[32px] font-semibold text-[#021526]">{activePackages}</p>
        </div>

        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[14px] text-gray-600">Paused Packages</span>
            <div className="w-10 h-10 bg-orange-100 rounded-[10px] flex items-center justify-center">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
            </div>
          </div>
          <p className="text-[32px] font-semibold text-[#021526]">{pausedPackages}</p>
        </div>
      </div>

      {/* Search + Actions */}
      <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-[400px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 rounded-[10px] h-[44px]"
              />
            </div>

            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-[200px] bg-gray-50 border-gray-200 rounded-[10px] h-[44px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="Meeting Room">Meeting Room</SelectItem>
                <SelectItem value="Private Office">Private Office</SelectItem>
                <SelectItem value="Networking Space">Networking Space</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={openAddModal} className="bg-[#317752] hover:bg-[#2a6545] text-white rounded-[10px] h-[44px] px-6">
            <Plus className="w-5 h-5 mr-2" />
            Add New Package
          </Button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-6">
        {filteredPackages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white rounded-[24px] p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow relative"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-[24px] font-semibold text-[#021526]">{pkg.packageType}</h3>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-4 py-1.5 rounded-full text-[13px] font-medium ${
                    pkg.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {pkg.status}
                </span>
              </div>
            </div>

            <div className="mb-6">
              {(pkg.discountPct ?? 0) > 0 ? (
                <div>
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <span className="line-through">đ{pkg.price.toLocaleString()}</span>
                    <span className="text-red-500 text-sm font-medium">-{pkg.discountPct}%</span>
                    <span className="text-gray-500">/ {formatTeamUnit(pkg)}</span>
                  </div>
                  <p className="text-[32px] font-semibold text-[#317752]">
                    đ{calcFinalPrice(pkg.price, pkg.discountPct).toLocaleString()}/{formatTeamUnit(pkg)}
                  </p>
                </div>
              ) : (
                <p className="text-[32px] font-semibold text-[#021526]">
                  đ{pkg.price.toLocaleString()}/{formatTeamUnit(pkg)}
                </p>
              )}
            </div>

            <div className="mb-6">
              <p className="text-[14px] font-medium text-[#021526] mb-3">Features:</p>
              <ul className="space-y-2">
                {(pkg.features ?? []).map((feature, i) => (
                  <li key={i} className="text-[13px] text-gray-700 flex items-start gap-2">
                    <span className="text-[#021526] mt-0.5">•</span>
                    <span className="flex-1">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditModal(pkg)}
                className="flex-1 rounded-[10px] border-gray-300 h-[38px]"
              >
                <Edit className="w-4 h-4 mr-1.5" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleStatus(pkg.id)}
                className={`flex-1 rounded-[10px] h-[38px] ${
                  pkg.status === "Active" ? "border-gray-300 text-gray-700" : "border-green-300 text-green-700"
                }`}
              >
                {pkg.status === "Active" ? "Paused" : "Active"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openViewModal(pkg)}
                className="rounded-[10px] border-gray-300 h-[38px] w-[38px] p-0"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeletePackage(pkg.id)}
                className="rounded-[10px] border-red-300 text-red-600 hover:bg-red-50 h-[38px] w-[38px] p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredPackages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No packages found</p>
        </div>
      )}

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-[500px] rounded-[16px]">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-semibold">Add New Team Package</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {error && (
              <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700">
                <strong>Error:</strong> {error}
              </div>
            )}
            <div>
              <Label>Package Type</Label>
              <Select
                value={formData.packageType}
                onValueChange={(value: any) =>
                  setFormData({
                    ...formData,
                    packageType: value,
                    unit: value === "Private Office" ? ("3 Months" as const)
                         : value === "Networking Space" ? ("3 Hours" as const)
                         : ("1 Hour" as const),
                  })
                }
              >
                <SelectTrigger className="mt-1.5 bg-gray-50 border-gray-200 rounded-[10px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Meeting Room">Meeting Room</SelectItem>
                  <SelectItem value="Private Office">Private Office</SelectItem>
                  <SelectItem value="Networking Space">Networking Space</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Package Name</Label>
              <Input
                placeholder="e.g., Meeting Room - 3 Hours"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1.5 bg-gray-50 border-gray-200 rounded-[10px]"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Price (VND)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="0"
                  value={formData.price ? String(formData.price) : ""}
                  onKeyDown={(e) => {
                    if (e.ctrlKey || e.metaKey || e.altKey) return;
                    if (e.key.length === 1 && !/^\d$/.test(e.key)) {
                      e.preventDefault();
                      setFormData({ ...formData, price: 0 });
                    }
                  }}
                  onPaste={(e) => {
                    const text = e.clipboardData.getData('text') ?? '';
                    const trimmed = text.trim();
                    if (trimmed && !/^\d+$/.test(trimmed)) {
                      e.preventDefault();
                      setFormData({ ...formData, price: 0 });
                    }
                  }}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "") {
                      setFormData({ ...formData, price: 0 });
                    } else {
                      if (!/^\d+$/.test(raw)) {
                        setFormData({ ...formData, price: 0 });
                        return;
                      }
                      const num = Number(raw);
                      setFormData({ ...formData, price: Number.isFinite(num) ? num : 0 });
                    }
                  }}
                  className="mt-1.5 bg-gray-50 border-gray-200 rounded-[10px]"
                />
              </div>
              <div>
                <Label>Discount (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="0"
                  value={formData.discountPct === 0 ? 0 : (formData.discountPct ?? "")}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "") {
                      // Người dùng xoá hết -> set về 0 thay vì undefined để không cần gõ số 0.
                      setFormData({ ...formData, discountPct: 0 });
                    } else {
                      const num = clampPct(Number(raw));
                      setFormData({ ...formData, discountPct: isNaN(num) ? 0 : num });
                    }
                  }}
                  className="mt-1.5 bg-gray-50 border-gray-200 rounded-[10px]"
                />
              </div>

              <div>
                <Label>Unit</Label>
                <Select
                  value={(formData.unit ||
                    (formData.packageType === "Private Office" ? "3 Months" :
                     formData.packageType === "Networking Space" ? "3 Hours" : "1 Hour")) as TeamUnit}
                  onValueChange={(value: TeamUnit) => setFormData({ ...formData, unit: value })}
                >
                  <SelectTrigger className="mt-1.5 bg-gray-50 border-gray-200 rounded-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptionsFor((formData.packageType || "Meeting Room") as ServicePackageUI["packageType"]).map(
                      (u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Describe the package..."
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1.5 bg-gray-50 border-gray-200 rounded-[10px] min-h-[80px]"
              />
            </div>

            <div>
              <Label>Features (one per line)</Label>
              <Textarea
                placeholder={"Projector and screen\nHigh-speed Wi-Fi\nConference phone"}
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                className="mt-1.5 bg-gray-50 border-gray-200 rounded-[10px] min-h-[120px]"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Status</Label>
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-gray-600">
                  {formData.status === "Active" ? "Active" : "Paused"}
                </span>
                <Switch
                  checked={formData.status === "Active"}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, status: checked ? "Active" : "Paused" })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="flex-1 rounded-[10px]">
              Cancel
            </Button>
            <Button onClick={handleAddPackage} className="flex-1 bg-[#317752] hover:bg-[#2a6545] text-white rounded-[10px]">
              Add Package
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-[500px] rounded-[16px]">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-semibold">Package Details</DialogTitle>
          </DialogHeader>

          {selectedPackage && (
            <div className="space-y-4 mt-4">
              <div className="bg-gray-50 rounded-[12px] p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[18px] font-semibold text-[#021526]">{selectedPackage.name}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-[12px] ${
                      selectedPackage.status === "Active" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {selectedPackage.status}
                  </span>
                </div>
                <span className="text-[13px] text-gray-600 bg-white px-2 py-1 rounded">
                  {selectedPackage.packageType}
                </span>
              </div>

              <div>
                <Label className="text-gray-600">Price</Label>
                {(selectedPackage.discountPct ?? 0) > 0 ? (
                  <div className="mt-1">
                    <div className="flex items-center gap-2 text-gray-500">
                      <span className="line-through">đ{selectedPackage.price.toLocaleString()}</span>
                      <span className="text-red-500 text-sm font-medium">-{selectedPackage.discountPct}%</span>
                      <span className="text-gray-500">/ {formatTeamUnit(selectedPackage)}</span>
                    </div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-[28px] font-semibold text-[#317752]">
                        {calcFinalPrice(selectedPackage.price, selectedPackage.discountPct).toLocaleString()}
                      </span>
                      <span className="text-[14px] text-gray-600">VND / {formatTeamUnit(selectedPackage)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-[28px] font-semibold text-[#317752]">
                      {selectedPackage.price.toLocaleString()}
                    </span>
                    <span className="text-[14px] text-gray-600">VND / {formatTeamUnit(selectedPackage)}</span>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-gray-600">Description</Label>
                <p className="mt-1 text-[14px] text-gray-700">{selectedPackage.description}</p>
              </div>

              <div>
                <Label className="text-gray-600">Features</Label>
                <ul className="mt-2 space-y-2">
                  {(selectedPackage.features ?? []).map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-[14px] text-gray-700">
                      <span className="text-[#317752] mt-1">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="mt-6">
            <Button
              onClick={() => setIsViewModalOpen(false)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-[10px]"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-[500px] rounded-[16px]">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-semibold">Edit Team Package</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label>Package Type</Label>
              <Select
                value={formData.packageType}
                onValueChange={(value: any) => setFormData({
                  ...formData,
                  packageType: value,
                  unit: value === "Private Office" ? "3 Months" : value === "Networking Space" ? "3 Hours" : "1 Hour",
                })}
              >
                <SelectTrigger className="mt-1.5 bg-gray-50 border-gray-200 rounded-[10px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Meeting Room">Meeting Room</SelectItem>
                  <SelectItem value="Private Office">Private Office</SelectItem>
                  <SelectItem value="Networking Space">Networking Space</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Package Name</Label>
              <Input
                placeholder="Enter service package name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1.5 bg-gray-50 border-gray-200 rounded-[10px]"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Price (VND)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="0"
                  value={formData.price ? String(formData.price) : ""}
                  onKeyDown={(e) => {
                    if (e.ctrlKey || e.metaKey || e.altKey) return;
                    if (e.key.length === 1 && !/^\d$/.test(e.key)) {
                      e.preventDefault();
                      setFormData({ ...formData, price: 0 });
                    }
                  }}
                  onPaste={(e) => {
                    const text = e.clipboardData.getData('text') ?? '';
                    const trimmed = text.trim();
                    if (trimmed && !/^\d+$/.test(trimmed)) {
                      e.preventDefault();
                      setFormData({ ...formData, price: 0 });
                    }
                  }}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "") {
                      setFormData({ ...formData, price: 0 });
                    } else {
                      if (!/^\d+$/.test(raw)) {
                        setFormData({ ...formData, price: 0 });
                        return;
                      }
                      const num = Number(raw);
                      setFormData({ ...formData, price: Number.isFinite(num) ? num : 0 });
                    }
                  }}
                  className="mt-1.5 bg-gray-50 border-gray-200 rounded-[10px]"
                />
              </div>
              <div>
                <Label>Discount (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="0"
                  value={formData.discountPct === 0 ? 0 : (formData.discountPct ?? "")}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "") {
                      setFormData({ ...formData, discountPct: 0 });
                    } else {
                      const num = clampPct(Number(raw));
                      setFormData({ ...formData, discountPct: isNaN(num) ? 0 : num });
                    }
                  }}
                  className="mt-1.5 bg-gray-50 border-gray-200 rounded-[10px]"
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Select
                  value={(formData.unit || (formData.packageType === "Private Office" ? "3 Months" : formData.packageType === "Networking Space" ? "3 Hours" : "1 Hour")) as TeamUnit}
                  onValueChange={(value: TeamUnit) => setFormData({ ...formData, unit: value })}
                >
                  <SelectTrigger className="mt-1.5 bg-gray-50 border-gray-200 rounded-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptionsFor((formData.packageType || "Meeting Room") as ServicePackageUI["packageType"]).map(u => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Describe the package..."
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1.5 bg-gray-50 border-gray-200 rounded-[10px] min-h-[80px]"
              />
            </div>

            <div>
              <Label>Features (one per line)</Label>
              <Textarea
                placeholder="Projector and screen&#10;High-speed Wi-Fi&#10;Conference phone"
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                className="mt-1.5 bg-gray-50 border-gray-200 rounded-[10px] min-h-[120px]"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Status</Label>
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-gray-600">
                  {formData.status === "Active" ? "Active" : "Paused"}
                </span>
                <Switch
                  checked={formData.status === "Active"}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, status: checked ? "Active" : "Paused" })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="flex-1 rounded-[10px]">
              Cancel
            </Button>
            <Button onClick={handleEditPackage} className="flex-1 bg-[#317752] hover:bg-[#2a6545] text-white rounded-[10px]">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
