import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Ban,
  Calendar,
  CheckCircle,
  Download,
  Edit,
  Eye,
  Filter,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  Users
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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

import RecentBookingsPanel from "./RecentBookingsPanel";
import type { ListMeta, ManagedUser, RecentBooking, SummaryCounts } from "./types";
import {
  createUser,
  deleteUser,
  fetchRecentBookings,
  fetchUserDetail,
  fetchUsers,
  updateStatus,
  updateUser
} from "./userManagementApi";

type Props = { onSummaryChange?: (summary: SummaryCounts) => void };
type StatusFilter = "all" | "active" | "inactive";

interface UserFormValues {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric"
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0
});

const BOOKINGS_PAGE_SIZE = 2;
const MIN_PASSWORD_LENGTH = 8;

type DetailItemProps = {
  label: string;
  value: string;
  colSpan?: boolean;
  highlight?: boolean;
};

const DetailItem = ({ label, value, colSpan, highlight }: DetailItemProps) => (
  <div className={colSpan ? "col-span-2" : undefined}>
    <Label className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</Label>
    <p className={`${highlight ? "font-semibold text-[#317752]" : "text-[#021526]"}`} title={value}>
      {value}
    </p>
  </div>
);

export default function UserManage({ onSummaryChange }: Props) {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: 8, totalPages: 1, filteredTotal: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [detailUser, setDetailUser] = useState<ManagedUser | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [bookingsMeta, setBookingsMeta] = useState<ListMeta | null>(null);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewUserDialogOpen, setIsViewUserDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [submitting, setSubmitting] = useState(false);
  const itemsPerPage = 8;

  const form = useForm<UserFormValues>({
    defaultValues: { fullName: "", email: "", phone: "", password: "", confirmPassword: "" }
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchUsers({
        role: "user",
        status: statusFilter,
        search: searchQuery,
        page: currentPage,
        pageSize: itemsPerPage
      });
      setUsers(response.data);
      setMeta(response.meta);
      onSummaryChange?.(response.summary);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.error || "Unable to load users");
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, onSummaryChange, searchQuery, statusFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const formatDate = (iso?: string | null) => (iso ? dateFormatter.format(new Date(iso)) : "-");
  const formatCurrency = (value?: number | null) => currencyFormatter.format(value || 0);
  const getInitials = (name?: string | null) => {
    if (!name) return "US";
    const parts = name.trim().split(" ").filter(Boolean);
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
    if (values.password !== values.confirmPassword) {
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
          role: "user"
        });
        toast.success("User created successfully");
      } else if (selectedUser) {
        await updateUser(selectedUser.id, {
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          password: values.password || undefined
        });
        toast.success("User updated successfully");
      }
      setIsFormOpen(false);
      loadUsers();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Unable to save user");
    } finally {
      setSubmitting(false);
    }
  });

  const loadRecentBookings = useCallback(
    async (userId: number, page = 1) => {
      setBookingsLoading(true);
      try {
        const response = await fetchRecentBookings(userId, { page, pageSize: BOOKINGS_PAGE_SIZE });
        setRecentBookings(response.data);
        setBookingsMeta(response.meta);
      } catch (error: any) {
        setRecentBookings([]);
        setBookingsMeta(null);
        toast.error(error?.response?.data?.error || "Unable to load recent bookings");
      } finally {
        setBookingsLoading(false);
      }
    },
    []
  );

  const openDetails = async (user: ManagedUser) => {
    setSelectedUser(user);
    setDetailUser(null);
    setRecentBookings([]);
    setBookingsMeta(null);
    setIsViewUserDialogOpen(true);
    setDetailLoading(true);

    try {
      const detail = await fetchUserDetail(user.id);
      setDetailUser(detail);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Unable to load user details");
    } finally {
      setDetailLoading(false);
    }

    loadRecentBookings(user.id, 1);
  };

  const handleBookingPageChange = (page: number) => {
    if (!selectedUser || bookingsLoading) return;
    loadRecentBookings(selectedUser.id, page);
  };

  const handleToggleStatus = async (user: ManagedUser) => {
    const nextStatus = user.status === "active" ? "inactive" : "active";
    try {
      await updateStatus(user.id, nextStatus);
      toast.success(`User ${nextStatus === "active" ? "activated" : "deactivated"}`);
      loadUsers();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Unable to update status");
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await deleteUser(selectedUser.id);
      toast.success("User deleted successfully");
      setIsDeleteDialogOpen(false);
      loadUsers();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Unable to delete user");
    }
  };

  const paginationLabel = useMemo(() => {
    if (!users.length) return "";
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, meta.filteredTotal);
    return `Showing ${start} to ${end} of ${meta.filteredTotal} users`;
  }, [currentPage, itemsPerPage, meta.filteredTotal, users.length]);

  const handleExportUsers = () => toast.success("Preparing export...");

  return (
    <>
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-[10px] px-4 h-[40px] border-gray-300" onClick={handleExportUsers}>
            <Download className="w-4 h-4 mr-2" />
            Export Users
          </Button>
          <Button className="bg-[#317752] hover:bg-[#2a6545] text-white rounded-[10px] px-4 h-[40px]" onClick={openCreateForm}>
            <Plus className="w-4 h-4 mr-2" />
            Add New User
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
              onChange={(event) => {
                setSearchQuery(event.target.value);
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
            <p className="text-gray-500 text-[14px] mt-3">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-[14px]">No users found</p>
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
                    <TableHead className="text-[13px] text-center">Total Bookings</TableHead>
                    <TableHead className="text-[13px]">Total Payments</TableHead>
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
                            <AvatarFallback className="bg-[#317752] text-white text-[12px]">{getInitials(user.fullName)}</AvatarFallback>
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
                      <TableCell className="text-center">
                        <span className="text-[13px] text-[#021526] font-medium">{user.totalBookings}</span>
                      </TableCell>
                      <TableCell className="text-[13px]">{formatCurrency(user.totalPayments)}</TableCell>
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
                                Edit User
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
                                Delete User
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
                  {Array.from({ length: Math.min(5, meta.totalPages) }, (_, index) => {
                    let pageNumber;
                    if (meta.totalPages <= 5) pageNumber = index + 1;
                    else if (currentPage <= 3) pageNumber = index + 1;
                    else if (currentPage >= meta.totalPages - 2) pageNumber = meta.totalPages - 4 + index;
                    else pageNumber = currentPage - 2 + index;
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
            <DialogTitle className="text-[20px]">{formMode === "create" ? "Add New User" : "Edit User"}</DialogTitle>
            <DialogDescription>
              {formMode === "create" ? "Create a new user account with the details below" : "Update the user profile"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitForm} className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label className="text-[13px] text-gray-600 mb-2 block">Full Name</Label>
              <Input placeholder="Enter full name" className="h-[42px] rounded-[10px]" {...form.register("fullName")} />
            </div>
            <div>
              <Label className="text-[13px] text-gray-600 mb-2 block">Email *</Label>
              <Input
                type="email"
                placeholder="email@example.com"
                className="h-[42px] rounded-[10px]"
                {...form.register("email", { required: true })}
              />
            </div>
            <div>
              <Label className="text-[13px] text-gray-600 mb-2 block">Phone Number</Label>
              <Input placeholder="0901234567" className="h-[42px] rounded-[10px]" {...form.register("phone")} />
            </div>
            <div>
              <Label className="text-[13px] text-gray-600 mb-2 block">Password *</Label>
              <Input
                type="password"
                placeholder={formMode === "create" ? "Enter password" : "Leave blank to keep current"}
                className="h-[42px] rounded-[10px]"
                {...form.register("password", { required: formMode === "create" })}
              />
            </div>
            <div>
              <Label className="text-[13px] text-gray-600 mb-2 block">Confirm Password *</Label>
              <Input
                type="password"
                placeholder="Confirm password"
                className="h-[42px] rounded-[10px]"
                {...form.register("confirmPassword", { required: formMode === "create" })}
              />
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
                {submitting ? "Saving..." : formMode === "create" ? "Create User" : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewUserDialogOpen} onOpenChange={setIsViewUserDialogOpen}>
        <DialogContent className="max-w-[460px] w-full p-0 max-h-[60vh] overflow-hidden rounded-[52px] border border-gray-100 flex flex-col shadow-2xl">
          <DialogHeader className="px-6 pt-3 pb-2 border-b border-gray-100">
            <DialogTitle className="text-[18px]">User Details</DialogTitle>
            <DialogDescription className="text-[13px]">Complete information about the selected user</DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-2 pt-3 flex-1 overflow-y-auto">
            {detailLoading ? (
              <div className="py-10 text-center">
                <div className="inline-block w-8 h-8 border-4 border-[#317752] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : detailUser ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-11 h-11">
                    <AvatarFallback className="bg-[#317752] text-white text-[15px]">{getInitials(detailUser.fullName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-[15px] text-[#021526] font-semibold">{detailUser.fullName || detailUser.email}</h3>
                    <Badge className="bg-purple-100 text-purple-700 border-0 text-[10px]">User</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[12px]">
                  <DetailItem label="User ID" value={`#${detailUser.id}`} />
                  <div>
                    <Label className="text-[10px] text-gray-500 uppercase tracking-wide">Status</Label>
                    <Badge className={`${detailUser.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"} border-0 text-[9px]`}>
                      {detailUser.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <DetailItem label="Email" value={detailUser.email} colSpan />
                  <DetailItem label="Phone" value={detailUser.phone || "N/A"} />
                  <DetailItem label="Created" value={formatDate(detailUser.createdAt)} />
                  <DetailItem label="Updated" value={formatDate(detailUser.updatedAt)} />
                  <DetailItem label="Total Bookings" value={String(detailUser.totalBookings)} />
                  <DetailItem label="Total Payments" value={formatCurrency(detailUser.totalPayments)} highlight />
                </div>
                <RecentBookingsPanel
                  bookings={recentBookings}
                  loading={bookingsLoading}
                  meta={bookingsMeta}
                  onPageChange={handleBookingPageChange}
                />
              </div>
            ) : (
              <p className="text-center py-6 text-sm text-gray-500">User not found</p>
            )}
          </div>
          <DialogFooter className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex gap-3">
            <Button
              variant="outline"
              className="rounded-[14px] flex-1"
              onClick={() => setIsViewUserDialogOpen(false)}
            >
              Close
            </Button>
            {detailUser && (
              <Button
                className="bg-[#317752] hover:bg-[#2a6545] text-white rounded-[14px] flex-1"
                onClick={() => {
                  setIsViewUserDialogOpen(false);
                  openEditForm(detailUser);
                }}
              >
                Edit User
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete user</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The user
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
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


