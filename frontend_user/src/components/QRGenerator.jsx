import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import QRCode from 'qrcode';
import { useQR } from '../contexts/QRContext';

const QRGeneratorContainer = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  color: white;
  box-shadow: 0 15px 35px rgba(102, 126, 234, 0.3);
  margin: 20px 0;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
    transform: rotate(45deg);
    animation: shimmer 3s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
    100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
  }
`;

const QRTitle = styled.h3`
  margin: 0 0 20px 0;
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  &::before {
    content: '📱';
    font-size: 28px;
  }
`;

const QRCodeWrapper = styled.div`
  background: white;
  border-radius: 15px;
  padding: 20px;
  margin: 20px auto;
  width: fit-content;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  position: relative;
  z-index: 1;
`;

const QRCanvas = styled.canvas`
  border-radius: 10px;
  width: 200px;
  height: 200px;
`;

const QRInfo = styled.div`
  margin-top: 20px;
  font-size: 14px;
  opacity: 0.9;
  position: relative;
  z-index: 1;
`;

const QRStatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.valid ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'};
  color: ${props => props.valid ? '#4CAF50' : '#F44336'};
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid ${props => props.valid ? '#4CAF50' : '#F44336'};
  font-weight: 500;
  margin: 10px 0;
  backdrop-filter: blur(10px);

  &::before {
    content: '${props => props.valid ? '✅' : '❌'}';
  }
`;

const GenerateButton = styled.button`
  background: linear-gradient(45deg, #FF6B6B, #FF8E8E);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin: 10px;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const QRDetails = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 15px;
  margin: 15px 0;
  text-align: left;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0;
  font-size: 14px;

  .label {
    font-weight: 500;
    opacity: 0.8;
  }

  .value {
    font-weight: 600;
    text-align: right;
  }
`;

const DownloadButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  margin: 5px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }
`;

const QRGenerator = ({ booking, onQRGenerated, autoSendEmail = true }) => {
  const { generateQRCode, getQRCode, loading, sendQREmail } = useQR();
  const [qrData, setQrData] = useState(null);
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    if (booking?._id) {
      loadExistingQR();
    }
  }, [booking]);

  useEffect(() => {
    // Auto send email when QR is generated and autoSendEmail is enabled
    if (qrData && autoSendEmail && !emailSent && booking?.customerEmail) {
      sendEmailWithQR();
    }
  }, [qrData, autoSendEmail, emailSent, booking]);

  const loadExistingQR = async () => {
    try {
      const result = await getQRCode(booking._id);
      if (result.success && result.qrData.qrCode) {
        setQrData(result.qrData);
        await generateQRImage(result.qrData.qrCode.qrString);
        if (onQRGenerated) {
          onQRGenerated(result.qrData);
        }
      }
    } catch (error) {
      console.error('Failed to load existing QR:', error);
    }
  };

  const handleGenerateQR = async () => {
    try {
      console.log('🔄 Generating QR for booking:', booking);
      const result = await generateQRCode(booking._id);
      
      if (result.success && result.qrData.qrCode) {
        setQrData(result.qrData);
        await generateQRImage(result.qrData.qrCode.qrString);
        if (onQRGenerated) {
          onQRGenerated(result.qrData);
        }
      } else {
        alert(`Failed to generate QR code: ${result.message}`);
      }
    } catch (error) {
      console.error('QR generation error:', error);
      alert('Error generating QR code');
    }
  };

  const generateQRImage = async (qrString) => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      await QRCode.toCanvas(canvas, qrString, {
        width: 200,
        margin: 2,
        color: {
          dark: '#2C3E50',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      // Also generate data URL for download
      const dataUrl = await QRCode.toDataURL(qrString, {
        width: 400,
        margin: 2
      });
      setQrImageUrl(dataUrl);
    } catch (error) {
      console.error('Failed to generate QR image:', error);
    }
  };

  const downloadQR = () => {
    if (!qrImageUrl) return;

    const link = document.createElement('a');
    link.download = `qr-code-${booking.spaceType}-${booking.date}.png`;
    link.href = qrImageUrl;
    link.click();
  };

  const copyQRString = () => {
    if (!qrData?.qrCode?.qrString) return;

    navigator.clipboard.writeText(qrData.qrCode.qrString).then(() => {
      alert('QR code copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  const sendEmailWithQR = async () => {
    try {
      setEmailStatus('Sending QR via email...');
      
      const result = await sendQREmail(
        booking._id,
        booking.customerEmail,
        {
          fullName: booking.customerName || 'Valued Customer'
        }
      );

      if (result.success) {
        setEmailSent(true);
        setEmailStatus(result.emailSent ? 'QR sent via email successfully!' : 'QR generated but email failed');
      } else {
        setEmailStatus('Failed to send email: ' + result.message);
      }
    } catch (error) {
      console.error('Email sending error:', error);
      setEmailStatus('Failed to send email');
    }
  };

  const resendEmail = () => {
    setEmailSent(false);
    setEmailStatus('');
    sendEmailWithQR();
  };

  const formatExpiryTime = (expiryTime) => {
    if (!expiryTime) return 'No expiry';
    const date = new Date(expiryTime);
    const now = new Date();
    const diffMs = date - now;
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    
    if (diffHours <= 0) return 'Expired';
    if (diffHours < 24) return `${diffHours} hours`;
    const diffDays = Math.ceil(diffHours / 24);
    return `${diffDays} days`;
  };

  if (!booking) {
    return (
      <QRGeneratorContainer>
        <QRTitle>QR Code Generator</QRTitle>
        <QRInfo>No booking information available</QRInfo>
      </QRGeneratorContainer>
    );
  }

  return (
    <QRGeneratorContainer>
      <QRTitle>Check-in QR Code</QRTitle>
      
      {qrData?.qrCode ? (
        <>
          <QRCodeWrapper>
            <canvas ref={canvasRef} />
          </QRCodeWrapper>

          <QRStatusBadge valid={qrData.isValid}>
            {qrData.isValid ? 'Active & Ready' : 'Invalid/Expired'}
          </QRStatusBadge>

          <QRDetails>
            <DetailRow>
              <span className="label">📍 Space:</span>
              <span className="value">{booking.spaceType}</span>
            </DetailRow>
            <DetailRow>
              <span className="label">📅 Date:</span>
              <span className="value">{new Date(booking.date).toLocaleDateString()}</span>
            </DetailRow>
            <DetailRow>
              <span className="label">⏰ Duration:</span>
              <span className="value">{booking.duration || 'Full day'}</span>
            </DetailRow>
            <DetailRow>
              <span className="label">🔒 Expires:</span>
              <span className="value">{formatExpiryTime(qrData.qrCode.expiryTime)}</span>
            </DetailRow>
            <DetailRow>
              <span className="label">📊 Usage:</span>
              <span className="value">{qrData.qrCode.usageCount}/{qrData.qrCode.maxUsage}</span>
            </DetailRow>
          </QRDetails>

          <div>
            <DownloadButton onClick={downloadQR}>
              📱 Download QR
            </DownloadButton>
            <DownloadButton onClick={copyQRString}>
              📋 Copy Code
            </DownloadButton>
          </div>

          {/* Email Status */}
          {emailStatus && (
            <div style={{
              background: emailSent ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.2)',
              border: `1px solid ${emailSent ? '#4CAF50' : '#FF9800'}`,
              color: emailSent ? '#4CAF50' : '#FF9800',
              padding: '10px 15px',
              borderRadius: '10px',
              margin: '15px 0',
              fontSize: '14px',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              {emailSent ? '�✅' : '📧⏳'} {emailStatus}
              {!emailSent && emailStatus.includes('Failed') && (
                <button 
                  onClick={resendEmail}
                  style={{
                    background: '#FF9800',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    marginLeft: '10px'
                  }}
                >
                  Retry
                </button>
              )}
            </div>
          )}

          <QRInfo>
            💡 QR code sent to your email • Show at check-in or scan with our app
          </QRInfo>
        </>
      ) : (
        <>
          <QRInfo>
            Generate a QR code for easy check-in to your booking
          </QRInfo>
          
          <GenerateButton 
            onClick={handleGenerateQR} 
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner />
                <span style={{ marginLeft: '10px' }}>Generating...</span>
              </>
            ) : (
              '🔧 Generate QR Code'
            )}
          </GenerateButton>
        </>
      )}
    </QRGeneratorContainer>
  );
};

export default QRGenerator;
