import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '@/utils/api';

type PaymentStatus = 'created' | 'processing' | 'success' | 'failed' | 'expired';
type BookingStatus = 'pending' | 'paid' | 'cancelled';
type BookingStatusFilter = BookingStatus | 'all';

interface Payment {
  id: string;
  bookingId: string;
  bookingReference?: string;
  serviceType?: string;
  seatName?: string;
  floor?: number;
  userId: string;
  userEmail?: string;
  userFullName?: string;
  username?: string;
  amount: string | number;
  currency?: string;
  paymentMethod?: string;
  transactionId: string;
  status: PaymentStatus;
  description?: string;
  createdAt: string;
  updatedAt: string;
  startTime?: string | null;
  endTime?: string | null;
  bookingStatus?: string | null;
  bookingPaymentStatus?: string | null;
}

interface PaymentStats {
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  totalRevenue: number;
  totalBookings?: number;
  pendingBookings?: number;
  confirmedBookings?: number;
  paidBookings?: number;
  cancelledBookings?: number;
}

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  created: 'Pending',
  processing: 'Processing',
  success: 'Paid',
  failed: 'Cancelled',
  expired: 'Expired',
};

const PAYMENT_TO_BOOKING_STATUS: Record<PaymentStatus, BookingStatus> = {
  created: 'pending',
  processing: 'paid',
  success: 'paid',
  failed: 'cancelled',
  expired: 'cancelled',
};

const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  cancelled: 'Cancelled',
};

const BOOKING_STATUS_OPTIONS: { value: BookingStatusFilter; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'all', label: 'All' },
];

const BOOKING_STATUS_DB_MAP: Record<BookingStatusFilter, string | 'all'> = {
  pending: 'pending',
  paid: 'paid_or_awaiting',
  cancelled: 'canceled',
  all: 'all',
};

const PaymentManagementPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [bookingStatusFilter, setBookingStatusFilter] = useState<BookingStatusFilter>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const parsePayments = (payload: unknown): Payment[] => {
    if (Array.isArray(payload)) return payload as Payment[];
    if (payload && typeof payload === 'object') {
      const data = (payload as { data?: unknown }).data;
      return Array.isArray(data) ? (data as Payment[]) : [];
    }
    return [];
  };

  const parseStats = (payload: unknown): PaymentStats | null => {
    if (!payload || typeof payload !== 'object') return null;
    const statsData = (payload as { data?: unknown }).data ?? payload;
    const normalized = statsData as Partial<Record<keyof PaymentStats, number>>;
    return {
      totalPayments: normalized.totalPayments ?? 0,
      completedPayments: normalized.completedPayments ?? 0,
      pendingPayments: normalized.pendingPayments ?? 0,
      failedPayments: normalized.failedPayments ?? 0,
      totalRevenue: normalized.totalRevenue ?? 0,
      totalBookings: normalized.totalBookings ?? 0,
      pendingBookings: normalized.pendingBookings ?? 0,
      confirmedBookings: normalized.confirmedBookings ?? 0,
      paidBookings: normalized.paidBookings ?? 0,
      cancelledBookings: normalized.cancelledBookings ?? 0,
    };
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string> = {};
      const bookingStatusParam = BOOKING_STATUS_DB_MAP[bookingStatusFilter];
      if (bookingStatusParam && bookingStatusParam !== 'all') params.bookingStatus = bookingStatusParam;
      if (appliedSearch.trim()) params.search = appliedSearch.trim();

      const [paymentsResponse, statsResponse] = await Promise.all([
        api.get('/api/payments/admin', { params }),
        api.get('/api/payments/stats'),
      ]);

      setPayments(parsePayments(paymentsResponse.data));
      setStats(parseStats(statsResponse.data));
    } catch (err) {
      console.error('Error loading data', err);
      setError(err instanceof Error ? err.message : 'Unable to load payments');
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, bookingStatusFilter]);

  const updatePaymentStatus = async (paymentId: string, newStatus: PaymentStatus) => {
    try {
      setUpdating(paymentId);
      setError(null);

      await api.put(`/api/payments/${paymentId}/status`, { status: newStatus });
      await loadData();

      setSelectedPayment((prev) => (prev && prev.id === paymentId ? null : prev));
    } catch (err) {
      console.error('Error updating payment status', err);
      setError('Could not update payment status. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadData();
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const parsed = typeof amount === 'string' ? parseInt(amount, 10) : amount;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(Number.isFinite(parsed) ? parsed : 0);
  };

  const formatDate = (dateString: string) => {
    const timestamp = Date.parse(dateString);
    return Number.isNaN(timestamp)
      ? 'N/A'
      : new Date(timestamp).toLocaleString('vi-VN');
  };

  const formatDateOnly = (dateString: string) => {
    const timestamp = Date.parse(dateString);
    return Number.isNaN(timestamp)
      ? 'N/A'
      : new Date(timestamp).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'success':
        return '#10b981';
      case 'failed':
        return '#ef4444';
      case 'processing':
        return '#3b82f6';
      case 'created':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const normalizeBookingStatusValue = (value?: string | null): BookingStatus => {
    const normalized = (value || '').toLowerCase();
    if (['awaiting_payment', 'confirmed'].includes(normalized)) return 'paid';
    if (['paid', 'checked_in', 'checked_out'].includes(normalized)) return 'paid';
    if (['canceled', 'cancelled', 'failed', 'refunded'].includes(normalized)) return 'cancelled';
    return 'pending';
  };

  const resolveBookingStatusValue = (payment: Payment): BookingStatus => {
    if (payment.bookingStatus) return normalizeBookingStatusValue(payment.bookingStatus);
    return PAYMENT_TO_BOOKING_STATUS[payment.status] ?? 'pending';
  };

  const derivedPendingBookings = useMemo(
    () => payments.filter((payment) => resolveBookingStatusValue(payment) === 'pending').length,
    [payments]
  );

  const pendingTotal = stats?.pendingBookings ?? stats?.pendingPayments ?? derivedPendingBookings;
  const combinedPaidCount = (stats?.paidBookings ?? 0) + (stats?.confirmedBookings ?? 0);
  const paidDisplayValue = combinedPaidCount > 0 ? combinedPaidCount : (stats?.completedPayments ?? 0) ?? 0;
  const cancelledDisplayValue = stats?.cancelledBookings ?? stats?.failedPayments ?? 0;

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getBookingStatusLabel = (payment: Payment) => {
    const value = resolveBookingStatusValue(payment);
    return BOOKING_STATUS_LABELS[value] ?? value;
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setAppliedSearch(searchTerm);
    loadData();
  };

  const resetFilters = () => {
    setBookingStatusFilter('pending');
    setSearchTerm('');
    setAppliedSearch('');
    loadData();
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading && payments.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading payments…</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>Payment Management</h1>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Monitor payment attempts and mark successful ones to confirm bookings.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            backgroundColor: '#ffffff',
            cursor: 'pointer',
          }}
        >
          {isRefreshing ? '⏳ Refreshing…' : '🔄 Refresh'}
        </button>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
          }}
        >
          {error}
        </div>
      )}

      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
          }}
        >
          {[{
            label: 'Total Payments',
            value: stats.totalPayments.toString(),
          }, {
            label: 'Total Revenue',
            value: formatCurrency(stats.totalRevenue),
          }, {
            label: 'Pending',
            value: pendingTotal.toString(),
          }, {
            label: 'Paid',
            value: paidDisplayValue.toString(),
          }, {
            label: 'Cancelled',
            value: cancelledDisplayValue.toString(),
          }].map((card) => (
            <div
              key={card.label}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1rem',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}
            >
              <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>{card.label}</span>
              <strong style={{ fontSize: '1.5rem' }}>{card.value}</strong>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={handleSearchSubmit}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
        }}
      >
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by transaction ID or email"
          style={{
            flex: '1 1 220px',
            minWidth: '200px',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
          }}
        />
        <select
          value={bookingStatusFilter}
          onChange={(event) => setBookingStatusFilter(event.target.value as BookingStatusFilter)}
          style={{
            flex: '0 0 180px',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            backgroundColor: '#ffffff',
          }}
        >
          {BOOKING_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#111827',
            color: '#ffffff',
            cursor: 'pointer',
          }}
        >
          Apply
        </button>
        <button
          type="button"
          onClick={resetFilters}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            backgroundColor: '#ffffff',
            cursor: 'pointer',
          }}
        >
          Clear filter
        </button>
        <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>
          Pending bookings awaiting review: {pendingTotal}
        </span>
      </form>

      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        }}
      >
        <div
          style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Payment Transactions</h2>
          <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            {payments.length} record{payments.length === 1 ? '' : 's'}
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', textAlign: 'left' }}>
                {['Booking', 'Customer', 'Amount', 'Booking Status', 'Payment Status', 'Created', 'Actions'].map((header) => (
                  <th key={header} style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#6b7280' }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    No payment records found.
                  </td>
                </tr>
              )}

              {payments.map((payment) => {
                const bookingStatusValue = resolveBookingStatusValue(payment);
                const bookingLabel = getBookingStatusLabel(payment);
                const bookingColor = getBookingStatusColor(bookingStatusValue);
                const paymentColor = getStatusColor(payment.status);
                return (
                  <tr key={payment.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: 600 }}>{payment.bookingReference || payment.bookingId || '—'}</div>
                    <div style={{ color: '#6b7280' }}>{payment.serviceType || 'N/A'}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{payment.transactionId}</div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ fontWeight: 500 }}>{payment.userFullName || payment.username || 'N/A'}</div>
                    <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>{payment.userEmail || ''}</div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                    {formatCurrency(payment.amount)}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        backgroundColor: `${bookingColor}20`,
                        color: bookingColor,
                      }}
                    >
                      {bookingLabel.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        backgroundColor: `${paymentColor}20`,
                        color: paymentColor,
                      }}
                    >
                      {PAYMENT_STATUS_LABELS[payment.status] ?? payment.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
                    {formatDateOnly(payment.createdAt)}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        style={{
                          padding: '0.3rem 0.75rem',
                          borderRadius: '4px',
                          border: '1px solid #d1d5db',
                          backgroundColor: '#ffffff',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                        }}
                      >
                        View
                      </button>
                      {(payment.status === 'created' || payment.status === 'processing') && (
                        <>
                          <button
                            onClick={() => updatePaymentStatus(payment.id, 'success')}
                            disabled={updating === payment.id}
                            style={{
                              padding: '0.3rem 0.75rem',
                              borderRadius: '4px',
                              border: '1px solid #10b981',
                              backgroundColor: '#10b981',
                              color: '#ffffff',
                              cursor: updating === payment.id ? 'not-allowed' : 'pointer',
                              opacity: updating === payment.id ? 0.6 : 1,
                              fontSize: '0.8rem',
                            }}
                          >
                            Mark Paid
                          </button>
                          <button
                            onClick={() => updatePaymentStatus(payment.id, 'failed')}
                            disabled={updating === payment.id}
                            style={{
                              padding: '0.3rem 0.75rem',
                              borderRadius: '4px',
                              border: '1px solid #ef4444',
                              backgroundColor: '#ef4444',
                              color: '#ffffff',
                              cursor: updating === payment.id ? 'not-allowed' : 'pointer',
                              opacity: updating === payment.id ? 0.6 : 1,
                              fontSize: '0.8rem',
                            }}
                          >
                            Mark Cancelled
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPayment && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 1000,
          }}
          onClick={() => setSelectedPayment(null)}
        >
          <div
            style={{
              width: 'min(640px, 100%)',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e5e7eb',
              padding: '1.5rem',
            }}
            onClick={(evt) => evt.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Payment Details</h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                  Transaction ID: <span style={{ fontFamily: 'monospace' }}>{selectedPayment.transactionId}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                style={{
                  border: 'none',
                  background: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.75rem 0' }}>Payment Information</h4>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <div><strong>Amount:</strong> {formatCurrency(selectedPayment.amount)}</div>
                  <div><strong>Status:</strong> {selectedPayment.status.toUpperCase()}</div>
                  <div><strong>Method:</strong> {selectedPayment.paymentMethod || 'N/A'}</div>
                  <div><strong>Start time:</strong> {selectedPayment.startTime ? formatDate(selectedPayment.startTime) : '—'}</div>
                  <div><strong>End time:</strong> {selectedPayment.endTime ? formatDate(selectedPayment.endTime) : '—'}</div>
                </div>
              </div>

              <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.75rem 0' }}>Customer</h4>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <div><strong>Name:</strong> {selectedPayment.userFullName || 'N/A'}</div>
                  <div><strong>Email:</strong> {selectedPayment.userEmail || 'N/A'}</div>
                  <div><strong>User ID:</strong> {selectedPayment.userId || 'N/A'}</div>
                </div>
              </div>

              <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.75rem 0' }}>Booking</h4>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <div><strong>Booking ID:</strong> {selectedPayment.bookingId || 'N/A'}</div>
                  <div><strong>Booking Ref:</strong> {selectedPayment.bookingReference || 'N/A'}</div>
                  <div><strong>Seat / Floor:</strong> {selectedPayment.seatName || '—'} {selectedPayment.floor ? `(Tầng ${selectedPayment.floor})` : ''}</div>
                  <div><strong>Service:</strong> {selectedPayment.serviceType || 'General'}</div>
                  <div><strong>Booking Status:</strong> {getBookingStatusLabel(selectedPayment).toUpperCase()}</div>
                  <div><strong>Description:</strong> {selectedPayment.description || '—'}</div>
                </div>
              </div>

              {(selectedPayment.status === 'created' || selectedPayment.status === 'processing') && (
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => updatePaymentStatus(selectedPayment.id, 'success')}
                    disabled={updating === selectedPayment.id}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: `1px solid ${updating === selectedPayment.id ? '#9ca3af' : '#10b981'}`,
                      backgroundColor: updating === selectedPayment.id ? '#9ca3af' : '#10b981',
                      color: '#ffffff',
                      cursor: updating === selectedPayment.id ? 'not-allowed' : 'pointer',
                      opacity: updating === selectedPayment.id ? 0.85 : 1,
                    }}
                  >
                    Mark as Paid
                  </button>
                  <button
                    onClick={() => updatePaymentStatus(selectedPayment.id, 'failed')}
                    disabled={updating === selectedPayment.id}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: `1px solid ${updating === selectedPayment.id ? '#9ca3af' : '#ef4444'}`,
                      backgroundColor: updating === selectedPayment.id ? '#9ca3af' : '#ef4444',
                      color: '#ffffff',
                      cursor: updating === selectedPayment.id ? 'not-allowed' : 'pointer',
                      opacity: updating === selectedPayment.id ? 0.85 : 1,
                    }}
                  >
                    Mark as Cancelled
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagementPage;
