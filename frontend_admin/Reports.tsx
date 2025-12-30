import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";

export default function ReportPage() {
  const [dateRange, setDateRange] = useState("thisMonth");
  const [reportType, setReportType] = useState("overview");
  const [showFilters, setShowFilters] = useState(false);

  // KPIs data from database schema
  const kpis = {
    totalRevenue: 342500000, // VND
    totalBookings: 1247,
    activeUsers: 89,
    occupancyRate: 73.5,
    revenueGrowth: 12.5,
    bookingsGrowth: 8.3,
  };

  // Revenue by service category (from payments JOIN bookings JOIN service_categories)
  const revenueByService = [
    { name: "Hot Desk", value: 125000000, bookings: 456, color: "#317752" },
    { name: "Fixed Desk", value: 98500000, bookings: 287, color: "#5DA07F" },
    { name: "Meeting Room", value: 67000000, bookings: 312, color: "#95A4FC" },
    { name: "Private Office", value: 52000000, bookings: 192, color: "#F5A962" },
  ];

  // Daily revenue trend (from v_revenue_daily view)
  const dailyRevenue = [
    { day: "Mon", revenue: 12500000 },
    { day: "Tue", revenue: 15200000 },
    { day: "Wed", revenue: 11800000 },
    { day: "Thu", revenue: 16700000 },
    { day: "Fri", revenue: 19500000 },
    { day: "Sat", revenue: 14300000 },
    { day: "Sun", revenue: 10200000 },
  ];

  // Booking status distribution (from bookings table)
  const bookingStatus = [
    { status: "Paid", count: 834, percentage: 66.9, color: "#4CAF50" },
    { status: "Pending", count: 156, percentage: 12.5, color: "#FFA726" },
    { status: "Reserved", count: 143, percentage: 11.5, color: "#29B6F6" },
    { status: "Cancelled", count: 114, percentage: 9.1, color: "#EF5350" },
  ];

  // Top performing packages (from service_packages JOIN bookings)
  const topPackages = [
    { name: "Hot Desk - Daily", bookings: 234, revenue: 46800000, growth: 15.2 },
    { name: "Fixed Desk - Monthly", bookings: 156, revenue: 62400000, growth: 8.7 },
    { name: "Meeting Room - Hourly", bookings: 198, revenue: 29700000, growth: 12.3 },
    { name: "Private Office - Weekly", bookings: 87, revenue: 34800000, growth: -3.5 },
  ];

  // Floor utilization (from v_utilization_daily)
  const floorUtilization = [
    { floor: "Floor 1", occupied: 71, total: 129, rate: 55.0 },
    { floor: "Floor 2", occupied: 25, total: 31, rate: 80.6 },
    { floor: "Floor 3", occupied: 20, total: 28, rate: 71.4 },
  ];

  // Payment methods distribution (from payment_methods JOIN payments)
  const paymentMethods = [
    { method: "VNPay", count: 567, amount: 142000000, percentage: 41.5 },
    { method: "Momo", count: 423, amount: 118500000, percentage: 34.6 },
    { method: "Banking", count: 257, amount: 82000000, percentage: 23.9 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const handleExport = (type: string) => {
    toast.success(`Exporting ${type} report...`);
  };

  const maxDailyRevenue = Math.max(...dailyRevenue.map((d) => d.revenue));

  return (
    <div className="p-8 overflow-auto h-full bg-[#F5F5F5]">
      {/* Breadcrumb */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-[14px]">
          <span className="text-gray-500 hover:text-[#317752] cursor-pointer">
            Dashboard
          </span>
          <span className="text-gray-400">/</span>
          <span className="text-[#317752]">Reports & Analytics</span>
        </div>
      </div>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[28px] text-[#021526] mb-2">
            Reports & Analytics
          </h1>
          <p className="text-[15px] text-gray-600">
            Comprehensive insights into your coworking space performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px] h-[40px] rounded-[10px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className={`rounded-[10px] px-4 h-[40px] border-gray-300 ${
              showFilters ? "bg-gray-100" : ""
            }`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button
            className="bg-[#317752] hover:bg-[#2a6545] text-white rounded-[10px] px-4 h-[40px]"
            onClick={() => handleExport("full")}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-[14px] text-[#021526] mb-4">Advanced Filters</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label className="text-[13px] text-gray-600 mb-2 block">
                Report Type
              </Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="h-[38px] rounded-[8px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="bookings">Bookings</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
                  <SelectItem value="utilization">Utilization</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[13px] text-gray-600 mb-2 block">
                Floor
              </Label>
              <Select defaultValue="all">
                <SelectTrigger className="h-[38px] rounded-[8px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Floors</SelectItem>
                  <SelectItem value="floor1">Floor 1</SelectItem>
                  <SelectItem value="floor2">Floor 2</SelectItem>
                  <SelectItem value="floor3">Floor 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[13px] text-gray-600 mb-2 block">
                Service Type
              </Label>
              <Select defaultValue="all">
                <SelectTrigger className="h-[38px] rounded-[8px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="hotdesk">Hot Desk</SelectItem>
                  <SelectItem value="fixeddesk">Fixed Desk</SelectItem>
                  <SelectItem value="meeting">Meeting Room</SelectItem>
                  <SelectItem value="office">Private Office</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full h-[38px] rounded-[8px]"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* Total Revenue */}
        <Card className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-green-50 rounded-[12px] flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <Badge
              className={`${
                kpis.revenueGrowth > 0
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              } border-0 text-[11px]`}
            >
              {kpis.revenueGrowth > 0 ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {Math.abs(kpis.revenueGrowth)}%
            </Badge>
          </div>
          <p className="text-[12px] text-gray-600 mb-1">Total Revenue</p>
          <p className="text-[24px] text-[#021526]">
            {formatCurrency(kpis.totalRevenue)}
          </p>
          <p className="text-[11px] text-gray-500 mt-1">This month</p>
        </Card>

        {/* Total Bookings */}
        <Card className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-blue-50 rounded-[12px] flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <Badge
              className={`${
                kpis.bookingsGrowth > 0
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              } border-0 text-[11px]`}
            >
              {kpis.bookingsGrowth > 0 ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {Math.abs(kpis.bookingsGrowth)}%
            </Badge>
          </div>
          <p className="text-[12px] text-gray-600 mb-1">Total Bookings</p>
          <p className="text-[24px] text-[#021526]">
            {formatNumber(kpis.totalBookings)}
          </p>
          <p className="text-[11px] text-gray-500 mt-1">This month</p>
        </Card>

        {/* Active Users */}
        <Card className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-purple-50 rounded-[12px] flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-[12px] text-gray-600 mb-1">Active Users</p>
          <p className="text-[24px] text-[#021526]">{kpis.activeUsers}</p>
          <p className="text-[11px] text-gray-500 mt-1">Currently active</p>
        </Card>

        {/* Occupancy Rate */}
        <Card className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-orange-50 rounded-[12px] flex items-center justify-center">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-[12px] text-gray-600 mb-1">Occupancy Rate</p>
          <p className="text-[24px] text-[#021526]">{kpis.occupancyRate}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-orange-500 h-2 rounded-full"
              style={{ width: `${kpis.occupancyRate}%` }}
            />
          </div>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Daily Revenue Trend */}
        <Card className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[16px] text-[#021526]">
              Daily Revenue Trend
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-[13px] text-[#317752]"
              onClick={() => handleExport("revenue")}
            >
              <Download className="w-3 h-3 mr-1" />
              Export
            </Button>
          </div>

          {/* Chart */}
          <div className="relative h-[240px] mb-4">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="absolute left-0 right-0 border-t border-gray-100"
                style={{ top: `${(i / 4) * 100}%` }}
              />
            ))}

            {/* Bars */}
            <div className="absolute inset-0 flex items-end justify-between px-2 gap-2">
              {dailyRevenue.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-[#317752] to-[#5DA07F] rounded-t-[6px] hover:opacity-80 transition-opacity cursor-pointer relative group"
                    style={{
                      height: `${(data.revenue / maxDailyRevenue) * 100}%`,
                      minHeight: "4px",
                    }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-gray-900 text-white text-[11px] px-2 py-1 rounded whitespace-nowrap">
                        {formatCurrency(data.revenue)}
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-600 mt-2">{data.day}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Revenue by Service */}
        <Card className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[16px] text-[#021526]">
              Revenue by Service
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-[13px] text-[#317752]"
            >
              <BarChart3 className="w-3 h-3 mr-1" />
              View Details
            </Button>
          </div>

          <div className="space-y-4">
            {revenueByService.map((service, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: service.color }}
                    />
                    <span className="text-[13px] text-gray-700">
                      {service.name}
                    </span>
                  </div>
                  <span className="text-[13px] text-[#021526]">
                    {formatCurrency(service.value)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${(service.value / revenueByService[0].value) * 100}%`,
                        backgroundColor: service.color,
                      }}
                    />
                  </div>
                  <span className="text-[11px] text-gray-500 w-[80px] text-right">
                    {service.bookings} bookings
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Booking Status Distribution */}
        <Card className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
          <h3 className="text-[16px] text-[#021526] mb-6">
            Booking Status
          </h3>

          {/* Donut Chart */}
          <div className="flex items-center gap-6">
            <div className="relative w-[120px] h-[120px] flex-shrink-0">
              <svg viewBox="0 0 120 120" className="transform -rotate-90 w-full h-full">
                {bookingStatus.map((status, index) => {
                  const offset = bookingStatus
                    .slice(0, index)
                    .reduce((sum, s) => sum + s.percentage, 0);
                  return (
                    <circle
                      key={index}
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke={status.color}
                      strokeWidth="20"
                      strokeDasharray={`${(status.percentage / 100) * 314} 314`}
                      strokeDashoffset={`${-(offset / 100) * 314}`}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-[22px] font-semibold text-[#021526]">
                    {kpis.totalBookings.toLocaleString('en-US')}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Total</p>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-2.5">
              {bookingStatus.map((status, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="text-[13px] text-[#021526]">
                      {status.status}
                    </span>
                  </div>
                  <span className="text-[13px] text-[#021526] font-medium">
                    {status.count.toLocaleString('en-US')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Floor Utilization */}
        <Card className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
          <h3 className="text-[16px] text-[#021526] mb-6">
            Floor Utilization
          </h3>

          <div className="space-y-5">
            {floorUtilization.map((floor, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] text-gray-700">
                    {floor.floor}
                  </span>
                  <span className="text-[13px] text-[#021526]">
                    {floor.occupied}/{floor.total}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        floor.rate >= 75
                          ? "bg-red-500"
                          : floor.rate >= 50
                          ? "bg-orange-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${floor.rate}%` }}
                    />
                  </div>
                  <span className="text-[12px] text-gray-600 w-[45px] text-right">
                    {floor.rate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Payment Methods */}
        <Card className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
          <h3 className="text-[16px] text-[#021526] mb-6">
            Payment Methods
          </h3>

          <div className="space-y-4">
            {paymentMethods.map((method, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-[12px] p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] text-[#021526]">
                    {method.method}
                  </span>
                  <Badge className="bg-purple-100 text-purple-700 border-0 text-[10px]">
                    {method.percentage}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-600">
                    {method.count} transactions
                  </span>
                  <span className="text-[12px] text-[#317752]">
                    {formatCurrency(method.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Performing Packages */}
      <Card className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[16px] text-[#021526]">
            Top Performing Packages
          </h3>
          <Button
            variant="link"
            className="text-[13px] text-[#317752] p-0 h-auto"
          >
            View All Packages
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {topPackages.map((pkg, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-[12px] p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-[13px] text-[#021526] line-clamp-2">
                  {pkg.name}
                </h4>
                <Badge
                  className={`${
                    pkg.growth > 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  } border-0 text-[10px]`}
                >
                  {pkg.growth > 0 ? "+" : ""}
                  {pkg.growth}%
                </Badge>
              </div>
              <p className="text-[18px] text-[#317752] mb-2">
                {formatCurrency(pkg.revenue)}
              </p>
              <p className="text-[11px] text-gray-600">
                {pkg.bookings} bookings
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
