import { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { ScrollArea } from '../../components/ui/scroll-area';
import type { ListMeta, RecentBooking } from './types';

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'long',
  year: 'numeric'
});

const rangeFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit'
});

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
});

type Props = {
  bookings: RecentBooking[];
  loading?: boolean;
  meta?: ListMeta | null;
  onPageChange?: (page: number) => void;
};

function buildPageNumbers(current: number, total: number) {
  if (total <= 5) return Array.from({ length: total }, (_, index) => index + 1);
  if (current <= 3) return [1, 2, 3, 4, 5];
  if (current >= total - 2) return [total - 4, total - 3, total - 2, total - 1, total];
  return [current - 2, current - 1, current, current + 1, current + 2];
}

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-emerald-100 text-emerald-700',
  success: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-600',
  failed: 'bg-red-100 text-red-600'
};

const getStatusClass = (status?: string | null) => {
  if (!status) return 'bg-gray-100 text-gray-600';
  return statusStyles[status.toLowerCase()] || 'bg-gray-100 text-gray-600';
};

export default function RecentBookingsPanel({ bookings, loading, meta, onPageChange }: Props) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (loading) {
      setIsTransitioning(true);
    } else {
      const timeout = setTimeout(() => setIsTransitioning(false), 220);
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  const page = meta?.page ?? 1;
  const totalPages = meta?.totalPages ?? 1;
  const totalItems = meta?.filteredTotal ?? bookings.length;
  const fallbackPageSize = bookings.length || 1;
  const pageSize = meta?.pageSize ?? fallbackPageSize;
  const rangeStart = totalItems ? (page - 1) * pageSize + 1 : 0;
  const rangeEnd = totalItems ? Math.min(rangeStart - 1 + bookings.length, totalItems) : 0;
  const rangeLabel = totalItems ? `Showing ${rangeStart}-${rangeEnd} of ${totalItems}` : 'No bookings to show yet';
  const noBookings = !bookings.length && !loading;

  return (
    <div className="mt-3">
      <div className="relative rounded-[22px] border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-2 border-b border-gray-100">
          <div>
            <h4 className="text-[14px] text-[#021526] font-semibold">Recent Bookings</h4>
            <p className="text-xs text-gray-500">Latest reservations from this user.</p>
          </div>
          <div className="text-xs text-gray-500 whitespace-nowrap">
            {totalItems} {totalItems === 1 ? 'booking' : 'bookings'} total
          </div>
        </div>
        <ScrollArea className="max-h-[200px] px-5 py-2.5">
          <div className={`space-y-2 pr-1.5 transition-opacity duration-300 ${loading ? 'opacity-40' : 'opacity-100'}`}>
            {noBookings ? (
              <div className="rounded-[14px] border border-dashed border-gray-200 py-6 text-center text-xs text-gray-500">
                No bookings for this user yet.
              </div>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-[16px] border border-gray-100 bg-gradient-to-r from-white to-[#f6fbf8] shadow-sm p-3"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div>
                      <p className="font-semibold text-[#317752] text-[13px]">#{booking.bookingCode}</p>
                      <p className="text-[11px] text-gray-500">{booking.duration || booking.serviceType || 'Custom package'}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase ${getStatusClass(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 text-[12px] text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#317752]" />
                      <span>
                        {booking.seatName || booking.seatCode || 'Flexible workspace'}
                        {booking.floor ? ` • Floor ${booking.floor}` : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#317752]" />
                      <span>{dateFormatter.format(new Date(booking.startTime))}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#317752]" />
                      <span>
                        {rangeFormatter.format(new Date(booking.startTime))} – {rangeFormatter.format(new Date(booking.endTime))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wide text-gray-400">Total</span>
                      <span className="text-[#021526] font-semibold text-[13px]">{currencyFormatter.format(booking.totalAmount || 0)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-2 text-[11px] text-gray-500">
          <span>{rangeLabel}</span>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 rounded-[8px] transition-all duration-200"
                disabled={page === 1 || loading}
                onClick={() => onPageChange?.(Math.max(page - 1, 1))}
              >
                Previous
              </Button>
              {buildPageNumbers(page, totalPages).map((pageNumber) => (
                <Button
                  key={pageNumber}
                  variant={page === pageNumber ? 'default' : 'outline'}
                  size="sm"
                  className={`h-8 w-8 rounded-[8px] transition-all duration-200 ${page === pageNumber ? 'bg-[#317752] hover:bg-[#2a6545] text-white' : ''}`}
                  onClick={() => onPageChange?.(pageNumber)}
                  disabled={loading}
                >
                  {pageNumber}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 rounded-[8px] transition-all duration-200"
                disabled={page === totalPages || loading}
                onClick={() => onPageChange?.(Math.min(page + 1, totalPages))}
              >
                Next
              </Button>
            </div>
          )}
        </div>
        {(loading || isTransitioning) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/65 backdrop-blur-[1px]">
            <div className="w-7 h-7 border-4 border-[#317752] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
