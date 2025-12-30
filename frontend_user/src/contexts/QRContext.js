import React, { createContext, useState, useContext } from 'react';
import { useAuth } from './AuthContext';

const QRContext = createContext();

export const useQR = () => {
  const context = useContext(QRContext);
  if (!context) {
    throw new Error('useQR must be used within a QRProvider');
  }
  return context;
};

export const QRProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [qrCodes, setQrCodes] = useState({});
  const [checkInStatus, setCheckInStatus] = useState({});
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Generate QR code for booking
  const generateQRCode = async (bookingId) => {
    try {
      setLoading(true);
      console.log('🔄 Generating QR code for booking:', bookingId);

      const token = localStorage.getItem('token');
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const response = await fetch(`${base}/api/qr/generate/${bookingId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ QR code generated:', result.qrCode);
        
        // Store QR code data
        setQrCodes(prev => ({
          ...prev,
          [bookingId]: result
        }));

        return { success: true, qrData: result };
      } else {
        console.error('❌ Failed to generate QR:', result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('💥 QR generation error:', error);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get existing QR code for booking
  const getQRCode = async (bookingId) => {
    try {
      setLoading(true);
      console.log('🔍 Getting QR code for booking:', bookingId);

      // Check cache first
      if (qrCodes[bookingId] && qrCodes[bookingId].isValid) {
        return { success: true, qrData: qrCodes[bookingId] };
      }

      const token = localStorage.getItem('token');
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const response = await fetch(`${base}/api/qr/booking/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        setQrCodes(prev => ({
          ...prev,
          [bookingId]: result
        }));

        return { success: true, qrData: result };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('💥 Get QR error:', error);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Verify QR code
  const verifyQRCode = async (qrCodeString) => {
    try {
      console.log('🔍 Verifying QR code:', qrCodeString);

      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${base}/api/qr/verify`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ qrCode: qrCodeString })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('💥 QR verification error:', error);
      return { success: false, message: error.message };
    }
  };

  // Process check-in
  const processCheckIn = async (qrCodeString, location = null) => {
    try {
      console.log('✅ Processing check-in with QR:', qrCodeString);

      // Get device info
      const deviceInfo = {
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
      };

      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${base}/api/qr/checkin`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          qrCode: qrCodeString,
          deviceInfo,
          location
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update check-in status
        const bookingId = result.booking._id;
        setCheckInStatus(prev => ({
          ...prev,
          [bookingId]: {
            hasCheckIn: true,
            checkIn: result.checkIn,
            isActive: true
          }
        }));
      }

      return result;
    } catch (error) {
      console.error('💥 Check-in error:', error);
      return { success: false, message: error.message };
    }
  };

  // Process check-out
  const processCheckOut = async (bookingId, notes = '', rating = null) => {
    try {
      console.log('🚪 Processing check-out for booking:', bookingId);

      const token = localStorage.getItem('token');
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const response = await fetch(`${base}/api/qr/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId,
          notes,
          rating
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update check-in status
        setCheckInStatus(prev => ({
          ...prev,
          [bookingId]: {
            hasCheckIn: true,
            checkIn: result.checkIn,
            isActive: false
          }
        }));
      }

      return result;
    } catch (error) {
      console.error('💥 Check-out error:', error);
      return { success: false, message: error.message };
    }
  };

  // Get check-in status
  const getCheckInStatus = async (bookingId) => {
    try {
      console.log('📊 Getting check-in status for booking:', bookingId);

      const token = localStorage.getItem('token');
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const response = await fetch(`${base}/api/qr/status/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        setCheckInStatus(prev => ({
          ...prev,
          [bookingId]: result
        }));
      }

      return result;
    } catch (error) {
      console.error('💥 Get status error:', error);
      return { success: false, message: error.message };
    }
  };

  // Get attendance history
  const getAttendanceHistory = async (limit = 10, skip = 0) => {
    try {
      console.log('📈 Getting attendance history');

      const token = localStorage.getItem('token');
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const response = await fetch(`${base}/api/qr/attendance?limit=${limit}&skip=${skip}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        setAttendanceHistory(result.checkIns);
        return result;
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('💥 Get attendance error:', error);
      return { success: false, message: error.message };
    }
  };

  // Get user's current location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.warn('Location access denied:', error);
          resolve(null); // Don't fail check-in if location unavailable
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  };

  const value = {
    // State
    qrCodes,
    checkInStatus,
    attendanceHistory,
    loading,

    // Actions
    generateQRCode,
    getQRCode,
    verifyQRCode,
    processCheckIn,
    processCheckOut,
    getCheckInStatus,
    getAttendanceHistory,
    getCurrentLocation,

    // Send QR via email after booking
    sendQREmail: async (bookingId, userEmail, userData) => {
      try {
        console.log('📧 Sending QR email for booking:', bookingId);

        const token = localStorage.getItem('token');
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const response = await fetch(`${base}/api/qr/email/${bookingId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userEmail,
            userData
          })
        });

        const result = await response.json();
        return result;
      } catch (error) {
        console.error('💥 Send QR email error:', error);
        return { success: false, message: error.message };
      }
    }
  };

  return (
    <QRContext.Provider value={value}>
      {children}
    </QRContext.Provider>
  );
};
