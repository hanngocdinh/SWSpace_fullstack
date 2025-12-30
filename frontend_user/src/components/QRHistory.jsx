import React, { useState, useEffect } from 'react';
import './QRHistory.css';

const QRHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ limit: 20, offset: 0, total: 0 });

  // Fetch check-in history
  const fetchHistory = async (offset = 0) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/qr/history/list?limit=${pagination.limit}&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setHistory(data.history);
        setPagination(prev => ({ 
          ...prev, 
          offset: offset, 
          total: data.pagination.total 
        }));
      } else {
        setError(data.message || 'Failed to load check-in history');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchHistory();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (success) => {
    return success ? '#45bf55' : '#dc3545';
  };

  // Get method icon
  const getMethodIcon = (method) => {
    switch (method) {
      case 'scan': return '📱';
      case 'upload': return '📸';
      case 'manual': return '📝';
      default: return '❓';
    }
  };

  // Load more history
  const loadMore = () => {
    const newOffset = pagination.offset + pagination.limit;
    fetchHistory(newOffset);
  };

  // Refresh history
  const refreshHistory = () => {
    fetchHistory(0);
  };

  if (loading && history.length === 0) {
    return (
      <div className="qr-history-page">
        <div className="page-header">
          <h1>🕒 Check-in History</h1>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading check-in history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="qr-history-page">
      <div className="page-header">
        <h1>🕒 Check-in History</h1>
        <p>Your workspace check-in activity</p>
        <button 
          onClick={refreshHistory}
          className="btn-primary refresh-btn"
          disabled={loading}
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️ {error}</span>
          <button 
            onClick={() => setError('')}
            className="alert-close"
          >
            ×
          </button>
        </div>
      )}

      {history.length === 0 ? (
        <div className="no-history">
          <div className="no-history-icon">📭</div>
          <h3>No Check-in History</h3>
          <p>You haven't checked in to any workspace yet.</p>
          <p>Book a workspace and check-in to see your history here!</p>
        </div>
      ) : (
        <>
          <div className="history-stats">
            <div className="stat-card">
              <div className="stat-number">{history.filter(h => h.success).length}</div>
              <div className="stat-label">Successful Check-ins</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{history.filter(h => !h.success).length}</div>
              <div className="stat-label">Failed Attempts</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{history.length}</div>
              <div className="stat-label">Total Attempts</div>
            </div>
          </div>

          <div className="history-list">
            {history.map((item, index) => (
              <div key={index} className="history-item">
                <div className="history-header">
                  <div className="history-method">
                    <span className="method-icon">{getMethodIcon(item.check_in_method)}</span>
                    <span className="method-text">{item.check_in_method.charAt(0).toUpperCase() + item.check_in_method.slice(1)}</span>
                  </div>
                  <div 
                    className="history-status"
                    style={{ color: getStatusColor(item.success) }}
                  >
                    {item.success ? '✅ Success' : '❌ Failed'}
                  </div>
                </div>

                <div className="history-details">
                  <div className="detail-row">
                    <span className="detail-label">Booking:</span>
                    <span className="detail-value">{item.booking_reference}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Seat:</span>
                    <span className="detail-value">{item.seat_name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Attempt Time:</span>
                    <span className="detail-value">{formatDate(item.attempt_time)}</span>
                  </div>
                  {item.start_date && (
                    <div className="detail-row">
                      <span className="detail-label">Booking Date:</span>
                      <span className="detail-value">{formatDate(item.start_date)}</span>
                    </div>
                  )}
                  {item.error_message && (
                    <div className="detail-row">
                      <span className="detail-label">Error:</span>
                      <span className="detail-value error-text">{item.error_message}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {pagination.offset + history.length < pagination.total && (
            <div className="load-more-container">
              <button 
                onClick={loadMore}
                className="btn-secondary"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
              <p className="pagination-info">
                Showing {pagination.offset + 1}-{pagination.offset + history.length} of {pagination.total} records
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QRHistory;