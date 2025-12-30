import React, { useState, useEffect } from 'react';

interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  userEmail?: string;
  userFullName?: string;
  amount: string;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  status: 'created' | 'processing' | 'success' | 'failed' | 'expired';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentStats {
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  totalRevenue: number;
}

const SimplePaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const getAdminToken = () => {
    return localStorage.getItem('sw_token') || localStorage.getItem('adminToken') || localStorage.getItem('token');
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAdminToken();

      const [paymentsResponse, statsResponse] = await Promise.all([
        fetch('http://localhost:5000/api/payments/admin', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch('http://localhost:5000/api/payments/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      ]);

      if (!paymentsResponse.ok || !statsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const paymentsData = await paymentsResponse.json();
      const statsData = await statsResponse.json();

      setPayments(paymentsData.success ? paymentsData.data : []);
      setStats(statsData.success ? statsData.data : null);
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (paymentId: string, newStatus: string) => {
    try {
      setUpdating(paymentId);
      const token = getAdminToken();

      const response = await fetch(`http://localhost:5000/api/payments/${paymentId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      await loadData(); // Reload data
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update payment status');
    } finally {
      setUpdating(null);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const value = typeof amount === 'string' ? parseInt(amount) : amount;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#10b981';
      case 'failed': return '#ef4444';
      case 'processing': return '#3b82f6';
      case 'created': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Loading payments...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>Payment Management</h1>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>Monitor and manage payment transactions</p>
        </div>
        <button
          onClick={loadData}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div style={{ 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fecaca', 
          padding: '1rem', 
          borderRadius: '6px', 
          marginBottom: '1rem',
          color: '#dc2626'
        }}>
          {error}
        </div>
      )}

      {stats && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem', 
          marginBottom: '1.5rem' 
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Total Payments</h3>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalPayments}</p>
          </div>
          
          <div style={{ 
            backgroundColor: 'white', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Total Revenue</h3>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 'bold' }}>{formatCurrency(stats.totalRevenue)}</p>
          </div>
          
          <div style={{ 
            backgroundColor: 'white', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Successful</h3>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats.completedPayments}</p>
          </div>
          
          <div style={{ 
            backgroundColor: 'white', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Pending</h3>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.pendingPayments}</p>
          </div>
          
          <div style={{ 
            backgroundColor: 'white', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Failed</h3>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>{stats.failedPayments}</p>
          </div>
        </div>
      )}

      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>Payment Transactions</h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: '#374151' }}>Transaction ID</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: '#374151' }}>User</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: '#374151' }}>Amount</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: '#374151' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: '#374151' }}>Created</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: '#374151' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                    No payments found
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '12px' }}>
                      {payment.transactionId}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div>
                        <div style={{ fontWeight: '500' }}>{payment.userFullName || 'N/A'}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{payment.userEmail || ''}</div>
                      </div>
                    </td>
                    <td style={{ padding: '12px', fontWeight: '500' }}>
                      {formatCurrency(payment.amount)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: `${getStatusColor(payment.status)}20`,
                        color: getStatusColor(payment.status)
                      }}>
                        {payment.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>
                      {formatDate(payment.createdAt)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            backgroundColor: 'white',
                            cursor: 'pointer'
                          }}
                        >
                          👁️ View
                        </button>
                        {payment.status === 'created' && (
                          <>
                            <button
                              onClick={() => updatePaymentStatus(payment.id, 'success')}
                              disabled={updating === payment.id}
                              style={{
                                padding: '4px 8px',
                                fontSize: '12px',
                                border: '1px solid #10b981',
                                borderRadius: '4px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                cursor: 'pointer',
                                opacity: updating === payment.id ? 0.5 : 1
                              }}
                            >
                              ✅ Success
                            </button>
                            <button
                              onClick={() => updatePaymentStatus(payment.id, 'failed')}
                              disabled={updating === payment.id}
                              style={{
                                padding: '4px 8px',
                                fontSize: '12px',
                                border: '1px solid #ef4444',
                                borderRadius: '4px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                cursor: 'pointer',
                                opacity: updating === payment.id ? 0.5 : 1
                              }}
                            >
                              ❌ Failed
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPayment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Payment Details</h3>
              <button
                onClick={() => setSelectedPayment(null)}
                style={{
                  padding: '8px',
                  border: 'none',
                  background: 'none',
                  fontSize: '20px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem', alignItems: 'center' }}>
                <strong>Transaction ID:</strong>
                <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{selectedPayment.transactionId}</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem', alignItems: 'center' }}>
                <strong>Amount:</strong>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }}>
                  {formatCurrency(selectedPayment.amount)}
                </span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem', alignItems: 'center' }}>
                <strong>Status:</strong>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  backgroundColor: `${getStatusColor(selectedPayment.status)}20`,
                  color: getStatusColor(selectedPayment.status),
                  display: 'inline-block'
                }}>
                  {selectedPayment.status.toUpperCase()}
                </span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem', alignItems: 'center' }}>
                <strong>User:</strong>
                <span>{selectedPayment.userFullName || 'N/A'}</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem', alignItems: 'center' }}>
                <strong>Payment Method:</strong>
                <span>{selectedPayment.paymentMethod || 'N/A'}</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem', alignItems: 'center' }}>
                <strong>Created:</strong>
                <span>{formatDate(selectedPayment.createdAt)}</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem', alignItems: 'center' }}>
                <strong>Updated:</strong>
                <span>{formatDate(selectedPayment.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimplePaymentManagement;