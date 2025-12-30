import { useState } from "react";
import { Search, Plus, Eye, Trash2, Edit, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface ServicePackage {
  id: string;
  name: string;
  price: number;
  unit: "Hour" | "Day" | "Week" | "Month";
  status: "Active" | "Paused";
  users: number;
  benefits: string[];
  description: string;
}

const initialPackages: ServicePackage[] = [
  {
    id: "1",
    name: "Hot Desk",
    price: 170000,
    unit: "Day",
    status: "Active",
    users: 35,
    description: "Flexible workspace for daily use",
    benefits: [
      "Check-in code",
      "High-speed Wi-Fi",
      "Free use of meeting rooms",
      "Document printing support",
      "Daily cleaning and maintenance service",
      "Complimentary drinks"
    ]
  },
  {
    id: "2",
    name: "Hot Desk",
    price: 700000,
    unit: "Week",
    status: "Active",
    users: 35,
    description: "Flexible workspace for weekly use",
    benefits: [
      "Check-in code",
      "High-speed Wi-Fi",
      "Free use of meeting rooms",
      "Document printing support",
      "Daily cleaning and maintenance service",
      "Complimentary drinks"
    ]
  },
  {
    id: "3",
    name: "Hot Desk",
    price: 2500000,
    unit: "Month",
    status: "Active",
    users: 35,
    description: "Flexible workspace for monthly use",
    benefits: [
      "Check-in code",
      "High-speed Wi-Fi",
      "Free use of meeting rooms",
      "Document printing support",
      "Daily cleaning and maintenance service",
      "Complimentary drinks"
    ]
  },
  {
    id: "4",
    name: "Fixed Desk",
    price: 170000,
    unit: "Day",
    status: "Active",
    users: 35,
    description: "Dedicated desk for daily use",
    benefits: [
      "Check-in code",
      "High-speed Wi-Fi"
    ]
  },
  {
    id: "5",
    name: "Fixed Desk",
    price: 700000,
    unit: "Week",
    status: "Active",
    users: 35,
    description: "Dedicated desk for weekly use",
    benefits: [
      "Check-in code",
      "High-speed Wi-Fi"
    ]
  },
  {
    id: "6",
    name: "Fixed Desk",
    price: 2500000,
    unit: "Month",
    status: "Active",
    users: 35,
    description: "Dedicated desk for monthly use",
    benefits: [
      "Check-in code",
      "High-speed Wi-Fi"
    ]
  }
];

export default function ServicePackagePage() {
  const [packages, setPackages] = useState<ServicePackage[]>(initialPackages);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
  const [formData, setFormData] = useState<Partial<ServicePackage>>({
    name: "",
    price: 0,
    unit: "Month",
    status: "Active",
    description: "",
    benefits: []
  });

  const activePackages = packages.filter(p => p.status === "Active").length;
  const pausedPackages = packages.filter(p => p.status === "Paused").length;
  const totalUsers = packages.reduce((sum, p) => sum + p.users, 0);

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.price.toString().includes(searchQuery)
  );

  const handleAddPackage = () => {
    const newPackage: ServicePackage = {
      id: Date.now().toString(),
      name: formData.name || "",
      price: formData.price || 0,
      unit: formData.unit || "Month",
      status: formData.status || "Active",
      users: 0,
      description: formData.description || "",
      benefits: formData.benefits || []
    };
    setPackages([...packages, newPackage]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditPackage = () => {
    if (!selectedPackage) return;
    setPackages(packages.map(pkg =>
      pkg.id === selectedPackage.id
        ? { ...pkg, ...formData }
        : pkg
    ));
    setIsEditModalOpen(false);
    setSelectedPackage(null);
    resetForm();
  };

  const handleTogglePause = (id: string) => {
    setPackages(packages.map(pkg =>
      pkg.id === id
        ? { ...pkg, status: pkg.status === "Active" ? "Paused" : "Active" }
        : pkg
    ));
  };

  const handleDeletePackage = (id: string) => {
    if (window.confirm("Are you sure you want to delete this package?")) {
      setPackages(packages.filter(pkg => pkg.id !== id));
    }
  };

  const openEditModal = (pkg: ServicePackage) => {
    setSelectedPackage(pkg);
    setFormData({
      name: pkg.name,
      price: pkg.price,
      unit: pkg.unit,
      status: pkg.status,
      description: pkg.description,
      benefits: pkg.benefits
    });
    setIsEditModalOpen(true);
  };

  const openViewModal = (pkg: ServicePackage) => {
    setSelectedPackage(pkg);
    setIsViewModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: 0,
      unit: "Month",
      status: "Active",
      description: "",
      benefits: []
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-full">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[24px] font-semibold text-[#021526] mb-1">Service Package Management</h1>
            <p className="text-[14px] text-gray-600">Create and manage coworking service packages</p>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#7ec99c] hover:bg-[#6ab889] text-[#021526] rounded-[12px] px-6 h-[44px] flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Add New Package
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-[600px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search Service Package"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-white rounded-[12px] border-gray-200 h-[48px] shadow-sm"
          />
        </div>
        <Button 
          variant="outline" 
          className="rounded-[12px] px-6 h-[48px] border-gray-300 bg-white shadow-sm"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filter
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-[56px] h-[56px] bg-blue-50 rounded-[12px] flex items-center justify-center">
              <svg className="w-7 h-7 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 8.5L12 4L3 8.5L12 13L21 8.5Z"/>
                <path d="M21 13L12 17.5L3 13" opacity="0.5"/>
              </svg>
            </div>
            <div>
              <p className="text-[13px] text-gray-600 mb-1">Total Packages</p>
              <p className="text-[28px] font-semibold text-[#021526]">{packages.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-[56px] h-[56px] bg-green-50 rounded-[12px] flex items-center justify-center">
              <svg className="w-7 h-7 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 8.5L12 4L3 8.5L12 13L21 8.5Z"/>
              </svg>
            </div>
            <div>
              <p className="text-[13px] text-gray-600 mb-1">Active</p>
              <p className="text-[28px] font-semibold text-[#021526]">{activePackages}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-[56px] h-[56px] bg-red-50 rounded-[12px] flex items-center justify-center">
              <svg className="w-7 h-7 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 8.5L12 4L3 8.5L12 13L21 8.5Z"/>
              </svg>
            </div>
            <div>
              <p className="text-[13px] text-gray-600 mb-1">Paused</p>
              <p className="text-[28px] font-semibold text-[#021526]">{pausedPackages}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-[56px] h-[56px] bg-purple-50 rounded-[12px] flex items-center justify-center">
              <svg className="w-7 h-7 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"/>
              </svg>
            </div>
            <div>
              <p className="text-[13px] text-gray-600 mb-1">Total Users</p>
              <p className="text-[28px] font-semibold text-[#021526]">{totalUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Package Cards */}
      <div className="grid grid-cols-3 gap-5">
        {filteredPackages.map((pkg) => (
          <div key={pkg.id} className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-[18px] font-semibold text-[#021526] mb-2">{pkg.name}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-medium ${
                    pkg.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {pkg.status}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[11px] font-medium">
                    {pkg.users} Users
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-[22px] font-semibold text-blue-600">
                {formatPrice(pkg.price)}<span className="text-[14px] text-gray-600 font-normal">/{pkg.unit.toLowerCase()}</span>
              </p>
            </div>

            <div className="mb-5">
              <p className="text-[13px] font-semibold text-[#021526] mb-2">Benefits:</p>
              <ul className="space-y-1">
                {pkg.benefits.map((benefit, index) => (
                  <li key={index} className="text-[12px] text-gray-700 flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditModal(pkg)}
                className="flex-1 rounded-[8px] border-gray-300 hover:bg-gray-50 h-[36px] text-[13px]"
              >
                <Edit className="w-3.5 h-3.5 mr-1.5" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTogglePause(pkg.id)}
                className={`flex-1 rounded-[8px] border-gray-300 h-[36px] text-[13px] ${
                  pkg.status === "Paused" ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                {pkg.status === "Active" ? "Paused" : "Paused"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openViewModal(pkg)}
                className="rounded-[8px] border-gray-300 hover:bg-gray-50 h-[36px] px-3"
              >
                <Eye className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeletePackage(pkg.id)}
                className="rounded-[8px] border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300 h-[36px] px-3"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Package Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-[500px] rounded-[16px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-[20px] font-semibold">Add New Service Package</DialogTitle>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name">Package Name</Label>
              <Input
                id="name"
                placeholder="Enter service package name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1.5 bg-gray-50 border-gray-200 rounded-[10px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (VND)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  value={formData.price || ""}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="mt-1.5 bg-gray-50 border-gray-200 rounded-[10px]"
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value: any) => setFormData({ ...formData, unit: value })}
                >
                  <SelectTrigger className="mt-1.5 bg-gray-50 border-gray-200 rounded-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hour">Hour</SelectItem>
                    <SelectItem value="Day">Day</SelectItem>
                    <SelectItem value="Week">Week</SelectItem>
                    <SelectItem value="Month">Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Short description of the service package"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1.5 bg-gray-50 border-gray-200 rounded-[10px] resize-none"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="benefits">Benefits (One Per Line)</Label>
              <Textarea
                id="benefits"
                placeholder="Enter each benefit on a separate line..."
                value={formData.benefits?.join("\n") || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  benefits: e.target.value.split("\n").filter(f => f.trim())
                })}
                className="mt-1.5 bg-gray-50 border-gray-200 rounded-[10px] resize-none"
                rows={5}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="mt-1.5 bg-gray-50 border-gray-200 rounded-[10px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 rounded-[10px] border-gray-300 h-[44px]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddPackage}
                className="flex-1 rounded-[10px] bg-[#317752] hover:bg-[#2a6545] text-white h-[44px]"
              >
                Add Package
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Package Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-[500px] rounded-[16px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-[20px] font-semibold">Edit Service Package</DialogTitle>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="edit-name">Package Name</Label>
              <Input
                id="edit-name"
                placeholder="Enter service package name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1.5 bg-gray-50 border-gray-200 rounded-[10px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-price">Price (VND)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  placeholder="0"
                  value={formData.price || ""}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="mt-1.5 bg-gray-50 border-gray-200 rounded-[10px]"
                />
              </div>
              <div>
                <Label htmlFor="edit-unit">Unit</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value: any) => setFormData({ ...formData, unit: value })}
                >
                  <SelectTrigger className="mt-1.5 bg-gray-50 border-gray-200 rounded-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hour">Hour</SelectItem>
                    <SelectItem value="Day">Day</SelectItem>
                    <SelectItem value="Week">Week</SelectItem>
                    <SelectItem value="Month">Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Short description of the service package"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1.5 bg-gray-50 border-gray-200 rounded-[10px] resize-none"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="edit-benefits">Benefits (One Per Line)</Label>
              <Textarea
                id="edit-benefits"
                placeholder="Enter each benefit on a separate line..."
                value={formData.benefits?.join("\n") || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  benefits: e.target.value.split("\n").filter(f => f.trim())
                })}
                className="mt-1.5 bg-gray-50 border-gray-200 rounded-[10px] resize-none"
                rows={5}
              />
            </div>

            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="mt-1.5 bg-gray-50 border-gray-200 rounded-[10px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 rounded-[10px] border-gray-300 h-[44px]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditPackage}
                className="flex-1 rounded-[10px] bg-[#317752] hover:bg-[#2a6545] text-white h-[44px]"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Package Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-[500px] rounded-[16px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-[20px] font-semibold">Package Details</DialogTitle>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogHeader>

          {selectedPackage && (
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-gray-600">Package Name</Label>
                <p className="mt-1 text-[16px] font-medium">{selectedPackage.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Price</Label>
                  <p className="mt-1 text-[16px] font-medium text-blue-600">{formatPrice(selectedPackage.price)}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Unit</Label>
                  <p className="mt-1 text-[16px] font-medium">{selectedPackage.unit}</p>
                </div>
              </div>

              <div>
                <Label className="text-gray-600">Description</Label>
                <p className="mt-1 text-[14px] text-gray-700">{selectedPackage.description}</p>
              </div>

              <div>
                <Label className="text-gray-600">Benefits</Label>
                <ul className="mt-2 space-y-1.5">
                  {selectedPackage.benefits.map((benefit, index) => (
                    <li key={index} className="text-[14px] text-gray-700 flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Status</Label>
                  <p className="mt-1">
                    <span className={`px-3 py-1.5 rounded-full text-[12px] font-medium inline-block ${
                      selectedPackage.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {selectedPackage.status}
                    </span>
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Users</Label>
                  <p className="mt-1 text-[16px] font-medium">{selectedPackage.users} users</p>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => setIsViewModalOpen(false)}
                  className="w-full rounded-[10px] bg-gray-100 hover:bg-gray-200 text-gray-800 h-[44px]"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
