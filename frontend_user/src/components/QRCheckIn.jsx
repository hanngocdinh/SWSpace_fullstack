import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './QRCheckIn.css';

const QRCheckIn = () => {
  const [manualCode, setManualCode] = useState('');
  const [checkInResult, setCheckInResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadFile, setUploadFile] = useState(null);

  const fileInputRef = useRef(null);
  const manualInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check URL parameters for booking reference
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const bookingRef = params.get('ref');
    if (bookingRef) {
      setManualCode(bookingRef);
    }
  }, [location.search]);

  // Handle manual check-in
  const handleManualCheckIn = async () => {
    if (!manualCode.trim()) {
      setError('Please enter a booking reference');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/qr/checkin/manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          bookingReference: manualCode.trim()
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setCheckInResult(data);
      } else {
        setError(data.message || 'Check-in failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadFile(file);
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('qrImage', file);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/qr/checkin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setCheckInResult(data);
      } else {
        setError(data.message || 'QR image processing failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadButtonClick = () => {
    if (!fileInputRef.current || loading) {
      return;
    }
    fileInputRef.current.value = '';
    fileInputRef.current.click();
  };

  const handleManualFocus = () => {
    if (!manualInputRef.current) {
      return;
    }
    manualInputRef.current.focus();
    manualInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="qr-checkin-page">
      <div className="page-header">
        <h1>QR Check-in</h1>
        <p>Check in with a saved QR image or your booking reference.</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button 
            onClick={() => setError('')}
            className="alert-close"
          >
            ×
          </button>
        </div>
      )}

      <div className="action-grid">
        <button 
          type="button"
          className="action-card"
          onClick={handleUploadButtonClick}
          disabled={loading}
        >
          <span className="action-icon" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12" />
              <path d="M7 8l5-5 5 5" />
              <path d="M5 15v4h14v-4" />
            </svg>
          </span>
          <span className="action-copy">
            <strong>Upload Image</strong>
            <small>Process a QR photo from your device</small>
          </span>
        </button>

        <button 
          type="button"
          className="action-card secondary"
          onClick={handleManualFocus}
        >
          <span className="action-icon" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
              <path d="M7 8h10" />
              <path d="M7 12h10" />
              <path d="M7 16h4" />
            </svg>
          </span>
          <span className="action-copy">
            <strong>Manual Entry</strong>
            <small>Type the booking reference instead</small>
          </span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="file-input-hidden"
        onChange={handleFileUpload}
        disabled={loading}
      />

      {uploadFile && (
        <div className="file-status">
          <span className="status-dot" />
          <span>{uploadFile.name}</span>
        </div>
      )}

      <div className="manual-card" id="manual-entry">
        <div className="manual-header">
          <h3>Manual Check-in</h3>
          <p>Paste or type the booking reference from your confirmation email.</p>
        </div>

        <div className="manual-input">
          <input
            ref={manualInputRef}
            type="text"
            placeholder="e.g., SWS-20241126-ABC123"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="booking-input"
            disabled={loading}
          />
          <button 
            onClick={handleManualCheckIn}
            className="btn-primary"
            disabled={loading || !manualCode.trim()}
          >
            {loading ? 'Processing...' : 'Check In'}
          </button>
        </div>

        <div className="manual-help">
          <small>If you cannot find the code, contact our staff with your booking email.</small>
        </div>
      </div>

      {checkInResult && (
        <div className="qr-result-container">
          <div className="checkin-success">
            <h3>Check-in Successful</h3>

            <div className="booking-details">
              <h4>Booking Details</h4>
              <div className="detail-row">
                <span>Reference:</span>
                <span>{checkInResult.booking.reference}</span>
              </div>
              <div className="detail-row">
                <span>Seat:</span>
                <span>{checkInResult.booking.seatName}</span>
              </div>
              <div className="detail-row">
                <span>Check-in Time:</span>
                <span>{new Date(checkInResult.checkInTime).toLocaleString()}</span>
              </div>
            </div>

            <div className="next-steps">
              <h4>Next Steps</h4>
              <ul>
                <li>Proceed to your assigned seat: <strong>{checkInResult.booking.seatName}</strong></li>
                <li>Enjoy your workspace.</li>
                <li>Contact our staff if you need assistance.</li>
              </ul>
            </div>

            <div className="action-buttons">
              <button 
                onClick={() => navigate('/bookings')}
                className="btn-primary"
              >
                View All Bookings
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="btn-secondary"
              >
                New Check-in
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCheckIn;