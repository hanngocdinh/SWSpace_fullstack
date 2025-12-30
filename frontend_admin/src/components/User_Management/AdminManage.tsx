import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Ban,
  CheckCircle,
  Mail,
  Phone,
  Calendar,
  Filter,
  Download,
  Users
} from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Card } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip";
import { toast } from "sonner";

import type { ManagedUser, SummaryCounts } from "./types";
import {
  createUser,
  deleteUser,
  fetchUserDetail,
  fetchUsers,
  updateStatus,
  updateUser
} from "./userManagementApi";

type Props = { onSummaryChange?: (summary: SummaryCounts) => void };

type StatusFilter = "all" | "active" | "inactive";

interface AdminFormValues {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const MIN_PASSWORD_LENGTH = 8;

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric"
});

export default function AdminManage({ onSummaryChange }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, pageSize: 8, totalPages: 1, filteredTotal: 0 });
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [detailUser, setDetailUser] = useState<ManagedUser | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewUserDialogOpen, setIsViewUserDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [submitting, setSubmitting] = useState(false);
  const itemsPerPage = 8;

  const form = useForm<AdminFormValues>({
    defaultValues: { fullName: "", email: "", phone: "", password: "", confirmPassword: "" }
  });

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchUsers({
        role: "admin",
        status: statusFilter,
        search: searchQuery,
        page: currentPage,
        pageSize: itemsPerPage
      });
      setUsers(response.data);
      setMeta(response.meta);
      onSummaryChange?.(response.summary);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Unable to load admins");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, currentPage, onSummaryChange]);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  const formatDate = (iso: string) => (iso ? dateFormatter.format(new Date(iso)) : "-");
  const getInitials = (name: string | null) => {
    if (!name) return "AD";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const openCreateForm = () => {
    setFormMode("create");
    setSelectedUser(null);
    form.reset({ fullName: "", email: "", phone: "", password: "", confirmPassword: "" });
    setIsFormOpen(true);
  };

  const openEditForm = (user: ManagedUser) => {
    setFormMode("edit");
    setSelectedUser(user);
    form.reset({
      fullName: user.fullName || "",
      email: user.email,
      phone: user.phone || "",
      password: "",
      confirmPassword: ""
    });
    setIsFormOpen(true);
  };

  const handleSubmitForm = form.handleSubmit(async (values) => {
    if (formMode === "create" && values.password !== values.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (formMode === "edit" && values.password && values.password !== values.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (formMode === "create" && (!values.password || values.password.length < MIN_PASSWORD_LENGTH)) {
      toast.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
      return;
    }
    if (formMode === "edit" && values.password && values.password.length < MIN_PASSWORD_LENGTH) {
      toast.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
      return;
    }
    setSubmitting(true);
    try {
      if (formMode === "create") {
        await createUser({
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          password: values.password,
          role: "admin"
        });
        toast.success("Admin created successfully");
      } else if (selectedUser) {
        await updateUser(selectedUser.id, {
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          password: values.password || undefined
        });
        toast.success("Admin updated successfully");
      }
      setIsFormOpen(false);
      loadAdmins();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Unable to save admin");
    } finally {
      setSubmitting(false);
    }
  });

  const openDetails = async (user: ManagedUser) => {
    setSelectedUser(user);
    setDetailUser(null);
    setIsViewUserDialogOpen(true);
    setDetailLoading(true);
    try {
      const detail = await fetchUserDetail(user.id);
      setDetailUser(detail);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Unable to load admin details");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleToggleStatus = async (user: ManagedUser) => {
    const next = user.status === "active" ? "inactive" : "active";
    try {
      await updateStatus(user.id, next);
      toast.success(`Admin ${next === "active" ? "activated" : "deactivated"}`);
      loadAdmins();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Unable to update status");
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await deleteUser(selectedUser.id);
      toast.success("Admin deleted successfully");
      setIsDeleteDialogOpen(false);
      loadAdmins();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Unable to delete admin");
    }
  };

  const paginationLabel = useMemo(() => {
    if (!users.length) return "";
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, meta.filteredTotal);
    return `Showing ${start} to ${end} of ${meta.filteredTotal} admins`;
  }, [currentPage, itemsPerPage, meta.filteredTotal, users.length]);

  const handleExportUsers = () => toast.success("Preparing export...");

  return (
    <>
      <div className="mb-6 flex items-start justify-between">
        <span className="sr-only">Admin table toolbar</span>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-[10px] px-4 h-[40px] border-gray-300" onClick={handleExportUsers}>
            <Download className="w-4 h-4 mr-2" />
            Export Admins
          </Button>
          <Button className="bg-[#317752] hover:bg-[#2a6545] text-white rounded-[10px] px-4 h-[40px]" onClick={openCreateForm}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Admin
          </Button>
        </div>
      </div>

      <Card className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, email or user ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 bg-gray-50 border-gray-200 rounded-[10px] h-[42px]"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value: StatusFilter) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[150px] h-[42px] rounded-[10px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className={`rounded-[10px] px-4 h-[42px] ${showFilters ? "bg-gray-100" : ""}`}
            onClick={() => setShowFilters((prev) => !prev)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="bg-gray-50 rounded-[12px] p-4 mb-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-[13px] text-gray-600 mb-2 block">Created From</Label>
                <Input type="date" className="h-[38px] rounded-[8px]" />
              </div>
              <div>
                <Label className="text-[13px] text-gray-600 mb-2 block">Created To</Label>
                <Input type="date" className="h-[38px] rounded-[8px]" />
              </div>
              <div className="flex items-end">
                <Button variant="outline" className="w-full h-[38px] rounded-[8px]">
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-[#317752] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-[14px] mt-3">Loading admins...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-[14px]">No admins found</p>
            <p className="text-gray-400 text-[12px] mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="rounded-[12px] border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-[13px] w-[80px]">User ID</TableHead>
                    <TableHead className="text-[13px]">Full Name</TableHead>
                    <TableHead className="text-[13px]">Contact</TableHead>
                    <TableHead className="text-[13px]">Created Date</TableHead>
                    <TableHead className="text-[13px]">Status</TableHead>
                    <TableHead className="text-[13px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className={`hover:bg-gray-50 ${user.status === "inactive" ? "opacity-60" : ""}`}>
                      <TableCell className="text-[13px]">#{user.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9">
                            <AvatarFallback className="bg-[#317752] text-white text-[12px]">
                              {getInitials(user.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[13px] text-[#021526]">{user.fullName || "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[12px] text-gray-600">
                            <Mail className="w-3 h-3" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-[12px] text-gray-600">
                              <Phone className="w-3 h-3" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-[13px] text-gray-600">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(user.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${user.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"} border-0 text-[11px]`}>
                          {user.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <TooltipProvider delayDuration={150}>
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors group"
                                  onClick={() => openDetails(user)}
                                >
                                  <Eye className="w-[18px] h-[18px] text-gray-500 group-hover:text-gray-700" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="bg-gray-900 text-white text-[11px] px-2 py-1">
                                View Details
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-blue-50 transition-colors group"
                                  onClick={() => openEditForm(user)}
                                >
                                  <Edit className="w-[18px] h-[18px] text-blue-500 group-hover:text-blue-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="bg-gray-900 text-white text-[11px] px-2 py-1">
                                Edit Admin
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`h-8 w-8 p-0 transition-colors group ${user.status === "active" ? "hover:bg-orange-50" : "hover:bg-green-50"}`}
                                  onClick={() => handleToggleStatus(user)}
                                >
                                  {user.status === "active" ? (
                                    <Ban className="w-[18px] h-[18px] text-orange-500 group-hover:text-orange-600" />
                                  ) : (
                                    <CheckCircle className="w-[18px] h-[18px] text-green-500 group-hover:text-green-600" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="bg-gray-900 text-white text-[11px] px-2 py-1">
                                {user.status === "active" ? "Deactivate" : "Activate"}
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-red-50 transition-colors group"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="w-[18px] h-[18px] text-red-500 group-hover:text-red-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="bg-gray-900 text-white text-[11px] px-2 py-1">
                                Delete Admin
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-[13px] text-gray-600">{paginationLabel}</p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 rounded-[8px]"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: Math.min(5, meta.totalPages) }, (_, idx) => {
                    let pageNumber;
                    if (meta.totalPages <= 5) pageNumber = idx + 1;
                    else if (currentPage <= 3) pageNumber = idx + 1;
                    else if (currentPage >= meta.totalPages - 2) pageNumber = meta.totalPages - 4 + idx;
                    else pageNumber = currentPage - 2 + idx;
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        className={`h-9 w-9 rounded-[8px] ${currentPage === pageNumber ? "bg-[#317752] hover:bg-[#2a6545] text-white" : ""}`}
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 rounded-[8px]"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, meta.totalPages))}
                    disabled={currentPage === meta.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[20px]">{formMode === "create" ? "Add New Admin" : "Edit Admin"}</DialogTitle>
            <DialogDescription>
              {formMode === "create" ? "Create a new admin account with the details below" : "Update the admin profile"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitForm} className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label className="text-[13px] text-gray-600 mb-2 block">Full Name</Label>
              <Input placeholder="Enter full name" {...form.register("fullName") } className="h-[42px] rounded-[10px]" />
            </div>
            <div>
              <Label className="text-[13px] text-gray-600 mb-2 block">Email *</Label>
              <Input type="email" placeholder="email@example.com" {...form.register("email", { required: true })} className="h-[42px] rounded-[10px]" />
            </div>
            <div>
              <Label className="text-[13px] text-gray-600 mb-2 block">Phone Number</Label>
              <Input placeholder="0901234567" {...form.register("phone") } className="h-[42px] rounded-[10px]" />
            </div>
            <div>
              <Label className="text-[13px] text-gray-600 mb-2 block">Password {formMode === "create" ? "*" : "(optional)"}</Label>
              <Input type="password" placeholder="Enter password" {...form.register("password", { required: formMode === "create" })} className="h-[42px] rounded-[10px]" />
            </div>
            <div>
              <Label className="text-[13px] text-gray-600 mb-2 block">Confirm Password {formMode === "create" ? "*" : ""}</Label>
              <Input type="password" placeholder="Confirm password" {...form.register("confirmPassword", { required: formMode === "create" })} className="h-[42px] rounded-[10px]" />
            </div>
            <div className="col-span-2 flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline" className="rounded-[10px]" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#317752] hover:bg-[#2a6545] text-white rounded-[10px]"
                disabled={submitting}
                onClick={() => handleSubmitForm()}
              >
                {submitting ? "Saving..." : formMode === "create" ? "Create Admin" : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewUserDialogOpen} onOpenChange={setIsViewUserDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[20px]">Admin Details</DialogTitle>
            <DialogDescription>Complete information about the selected admin</DialogDescription>
          </DialogHeader>
          {detailLoading ? (
            <div className="py-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-[#317752] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : detailUser ? (
            <div className="py-4">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-[#317752] text-white text-[20px]">{getInitials(detailUser.fullName)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-[18px] text-[#021526] mb-1">{detailUser.fullName || detailUser.email}</h3>
                  <Badge className="bg-purple-100 text-purple-700 border-0 text-[11px]">Admin</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-[12px] text-gray-500 mb-1 block">User ID</Label>
                  <p className="text-[14px] text-[#021526]">#{detailUser.id}</p>
                </div>
                <div>
                  <Label className="text-[12px] text-gray-500 mb-1 block">Status</Label>
                  <Badge className={`${detailUser.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"} border-0 text-[11px]`}>
                    {detailUser.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-[12px] text-gray-500 mb-1 block">Email</Label>
                  <p className="text-[14px] text-[#021526]">{detailUser.email}</p>
                </div>
                <div>
                  <Label className="text-[12px] text-gray-500 mb-1 block">Phone Number</Label>
                  <p className="text-[14px] text-[#021526]">{detailUser.phone || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-[12px] text-gray-500 mb-1 block">Created Date</Label>
                  <p className="text-[14px] text-[#021526]">{formatDate(detailUser.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-[12px] text-gray-500 mb-1 block">Last Updated</Label>
                  <p className="text-[14px] text-[#021526]">{formatDate(detailUser.updatedAt)}</p>
                </div>
                <div>
                  <Label className="text-[12px] text-gray-500 mb-1 block">Last Login</Label>
                  <p className="text-[14px] text-[#021526]">{detailUser.lastLogin ? formatDate(detailUser.lastLogin) : "Never"}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center py-6 text-sm text-gray-500">Admin not found</p>
          )}
          <DialogFooter>
            <Button variant="outline" className="rounded-[10px]" onClick={() => setIsViewUserDialogOpen(false)}>
              Close
            </Button>
            {detailUser && (
              <Button className="bg-[#317752] hover:bg-[#2a6545] text-white rounded-[10px]" onClick={() => {
                setIsViewUserDialogOpen(false);
                openEditForm(detailUser);
              }}>
                Edit Admin
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete admin</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The admin
              {selectedUser && ` "${selectedUser.fullName || selectedUser.email}"`} will lose access immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex w-full justify-end gap-3">
            <Button type="button" variant="outline" className="rounded-[10px]" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-[10px]"
              onClick={handleDelete}
              disabled={!selectedUser}
            >
              Delete Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


