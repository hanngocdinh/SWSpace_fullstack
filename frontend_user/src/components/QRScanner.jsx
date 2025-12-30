import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useQR } from '../contexts/QRContext';

const STATUS_STYLES = {
  success: { background: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.4)', color: '#15803d' },
  error: { background: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.4)', color: '#b91c1c' },
  warning: { background: 'rgba(251,191,36,0.18)', border: 'rgba(251,191,36,0.5)', color: '#b45309' },
  info: { background: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.4)', color: '#1d4ed8' }
};

const ScannerContainer = styled.div`
  background: #ffffff;
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 25px 60px rgba(15, 23, 42, 0.08);
`;

const ScannerHeader = styled.div`
  margin-bottom: 1.5rem;
`;

const ScannerTitle = styled.h3`
  margin: 0 0 0.35rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
`;

const ScannerDescription = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 1rem;
`;

const MethodSwitcher = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 2rem 0 1.25rem 0;
`;

const MethodButton = styled.button`
  flex: 1;
  min-width: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  padding: 0.85rem 1.25rem;
  border-radius: 999px;
  border: 1px solid ${props => props.$active ? '#4c6fff' : '#dfe6ff'};
  background: ${props => props.$active ? 'rgba(76,111,255,0.12)' : '#f8f9ff'};
  color: ${props => props.$active ? '#1f2a56' : '#4b5563'};
  font-weight: 600;
  cursor: pointer;
  transition: border 0.2s ease, background 0.2s ease, color 0.2s ease;
`;

const IconCircle = styled.span`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$active ? '#4c6fff' : '#e8edff'};
  color: white;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const StatusMessage = styled.div`
  margin-bottom: 1.5rem;
  padding: 0.9rem 1.1rem;
  border-radius: 12px;
  background: ${props => (STATUS_STYLES[props.type] || STATUS_STYLES.info).background};
  border: 1px solid ${props => (STATUS_STYLES[props.type] || STATUS_STYLES.info).border};
  color: ${props => (STATUS_STYLES[props.type] || STATUS_STYLES.info).color};
  font-weight: 500;
`;

const UploadSection = styled.div`
  border: 1px solid #e4e9f7;
  border-radius: 20px;
  padding: 1.75rem;
  background: #f9fafc;
`;

const UploadDropZone = styled.div`
  border: 1px dashed ${props => props.isDragOver ? '#0ea5e9' : '#cbd5f5'};
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  background: ${props => props.isDragOver ? 'rgba(14,165,233,0.08)' : '#ffffff'};
  transition: border 0.2s ease, background 0.2s ease;
  cursor: pointer;
`;

const UploadText = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
`;

const UploadHint = styled.div`
  font-size: 0.9rem;
  color: #6b7280;
  margin-top: 0.35rem;
`;

const PreviewImage = styled.div`
  margin-top: 1.5rem;
  text-align: center;

  img {
    max-width: 200px;
    max-height: 200px;
    border-radius: 14px;
    box-shadow: 0 15px 30px rgba(15, 23, 42, 0.15);
  }

  .filename {
    margin-top: 0.75rem;
    font-size: 0.9rem;
    color: #475569;
    word-break: break-all;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const PrimaryButton = styled.button`
  border: none;
  border-radius: 999px;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(120deg, #4c6fff, #5ac8fa);
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  border-radius: 999px;
  padding: 0.75rem 1.3rem;
  font-size: 0.95rem;
  font-weight: 600;
  border: 1px solid #cbd5f5;
  background: #ffffff;
  color: #475569;
  cursor: pointer;
  transition: border 0.2s ease, color 0.2s ease;

  &:hover {
    border-color: #94a3b8;
    color: #0f172a;
  }
`;

const ManualInputSection = styled.div`
  border: 1px solid #e4e9f7;
  border-radius: 20px;
  padding: 1.75rem;
  background: #fdfdff;
`;

const ManualInput = styled.input`
  width: 100%;
  padding: 0.9rem 1rem;
  border-radius: 12px;
  border: 1px solid #d0d7ec;
  background: #ffffff;
  font-size: 1rem;
  color: #0f172a;
  margin-bottom: 1rem;

  &::placeholder {
    color: #94a3b8;
  }

  &:focus {
    outline: none;
    border-color: #4c6fff;
    box-shadow: 0 0 0 3px rgba(76, 111, 255, 0.15);
  }
`;

const CheckInResult = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  border-radius: 18px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  color: #0f172a;

  h4 {
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
    font-weight: 700;
  }
`;

const ResultRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  color: #334155;

  span:last-child {
    font-weight: 600;
  }
`;

const ResultLabel = styled.span`
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
`;

const GuidanceNote = styled.p`
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #6b7280;
  text-align: center;
`;

const UploadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 16V4" />
    <path d="M7 9l5-5 5 5" />
    <path d="M4 20h16" />
  </svg>
);

const ManualIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="16" y1="2" x2="16" y2="6" />
  </svg>
);

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const { verifyQRCode, processCheckIn, getCurrentLocation } = useQR();
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('info');
  const [manualCode, setManualCode] = useState('');
  const [checkInResult, setCheckInResult] = useState(null);
  const [activeMethod, setActiveMethod] = useState('upload');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const getLocationFast = async () => {
    try {
      const locationPromise = getCurrentLocation();
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 1500));
      return await Promise.race([locationPromise, timeoutPromise]);
    } catch (error) {
      return null;
    }
  };

  const formatDateTime = (value) => {
    if (!value) {
      return 'N/A';
    }
    try {
      return new Date(value).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const handleMethodChange = (method) => {
    setActiveMethod(method);
    setStatusMessage('');
  };

  const handleManualSubmit = async () => {
    if (!manualCode.trim()) {
      setStatusMessage('Please enter a QR code');
      setStatusType('warning');
      return;
    }

    await processQRCode(manualCode.trim());
  };

  const processQRCode = async (qrCodeString) => {
    try {
      setStatusMessage('Verifying QR code...');
      setStatusType('info');

      const verifyResult = await verifyQRCode(qrCodeString);

      if (!verifyResult.success) {
        setStatusMessage(`QR code invalid: ${verifyResult.message}`);
        setStatusType('error');
        if (onScanError) onScanError(verifyResult);
        return;
      }

      setStatusMessage('QR verified! Completing check-in...');

      const location = await getLocationFast();
      const checkIn = await processCheckIn(qrCodeString, location);

      if (checkIn.success) {
        setCheckInResult(checkIn);
        setStatusMessage('Check-in successful. Welcome!');
        setStatusType('success');
        setManualCode('');
        setUploadedFile(null);
        setPreviewUrl('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        if (onScanSuccess) {
          onScanSuccess(checkIn);
        }
      } else {
        setStatusMessage(`Check-in failed: ${checkIn.message}`);
        setStatusType('error');
        if (onScanError) onScanError(checkIn);
      }
    } catch (error) {
      console.error('QR processing error:', error);
      setStatusMessage('Error processing QR code');
      setStatusType('error');
      if (onScanError) onScanError({ success: false, message: error.message });
    }
  };

  const handleFileSelect = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setStatusMessage('Please select a valid image file');
      setStatusType('error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setStatusMessage('File too large. Maximum size is 10MB.');
      setStatusType('error');
      return;
    }

    setUploadedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);

    setStatusMessage('Image ready. Click "Process QR Image" to continue.');
    setStatusType('success');
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const processUploadedImage = async () => {
    if (!uploadedFile) {
      setStatusMessage('No image selected');
      setStatusType('error');
      return;
    }

    try {
      setIsProcessing(true);
      setStatusMessage('Processing uploaded QR image...');
      setStatusType('info');

      const formData = new FormData();
      formData.append('qrImage', uploadedFile);

      const location = await getLocationFast();
      if (location) {
        formData.append('location', JSON.stringify(location));
      }

      const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(`${base}/api/qr/upload-checkin`, {
        method: 'POST',
        headers,
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setCheckInResult(result);
        setStatusMessage('Check-in successful from uploaded image.');
        setStatusType('success');
        setUploadedFile(null);
        setPreviewUrl('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        if (onScanSuccess) {
          onScanSuccess(result);
        }
      } else {
        setStatusMessage(`Upload check-in failed: ${result.message}`);
        setStatusType('error');
        if (onScanError) onScanError(result);
      }
    } catch (error) {
      console.error('Upload processing error:', error);
      setStatusMessage('Error processing uploaded image');
      setStatusType('error');
      if (onScanError) onScanError({ success: false, message: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const clearUpload = () => {
    setUploadedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setStatusMessage('');
  };

  return (
    <ScannerContainer>
      <ScannerHeader>
        <ScannerTitle>QR Code Scanner</ScannerTitle>
        <ScannerDescription>
          Use one of the options below to complete your check-in.
        </ScannerDescription>
      </ScannerHeader>

      <MethodSwitcher>
        <MethodButton
          type="button"
          $active={activeMethod === 'upload'}
          onClick={() => handleMethodChange('upload')}
        >
          <IconCircle $active={activeMethod === 'upload'}>
            <UploadIcon />
          </IconCircle>
          Upload Image
        </MethodButton>
        <MethodButton
          type="button"
          $active={activeMethod === 'manual'}
          onClick={() => handleMethodChange('manual')}
        >
          <IconCircle $active={activeMethod === 'manual'}>
            <ManualIcon />
          </IconCircle>
          Manual Entry
        </MethodButton>
      </MethodSwitcher>

      {statusMessage && (
        <StatusMessage type={statusType}>{statusMessage}</StatusMessage>
      )}

      {activeMethod === 'upload' && (
        <UploadSection>
          <HiddenFileInput
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />

          <UploadDropZone
            isDragOver={isDragOver}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                fileInputRef.current && fileInputRef.current.click();
              }
            }}
          >
            <UploadText>Drag and drop a QR image</UploadText>
            <UploadHint>PNG, JPG, JPEG up to 10MB</UploadHint>
          </UploadDropZone>

          {previewUrl && (
            <PreviewImage>
              <img src={previewUrl} alt="QR preview" />
              <div className="filename">{uploadedFile?.name}</div>
              <ButtonRow>
                <PrimaryButton
                  type="button"
                  onClick={processUploadedImage}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Process QR Image'}
                </PrimaryButton>
                <SecondaryButton type="button" onClick={clearUpload}>
                  Remove
                </SecondaryButton>
              </ButtonRow>
            </PreviewImage>
          )}
        </UploadSection>
      )}

      {activeMethod === 'manual' && (
        <ManualInputSection>
          <ManualInput
            type="text"
            placeholder="Enter QR code manually"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
          />
          <PrimaryButton
            type="button"
            onClick={handleManualSubmit}
            disabled={!manualCode.trim()}
          >
            Submit Code
          </PrimaryButton>
        </ManualInputSection>
      )}

      {checkInResult && (
        <CheckInResult>
          <h4>Check-in Successful</h4>
          {(() => {
            const booking = checkInResult.booking || {};
            const checkIn = checkInResult.checkIn || {};
            const seatName = booking.seatName || booking.seat_name;
            const serviceType = booking.serviceType || booking.spaceType || booking.service_type;
            const reference = booking.bookingReference || booking.booking_reference;
            const userName = checkIn.userId?.name || checkIn.user?.name;
            return (
              <>
                <ResultRow>
                  <ResultLabel>Package</ResultLabel>
                  <span>{serviceType || 'N/A'}</span>
                </ResultRow>
                <ResultRow>
                  <ResultLabel>Seat</ResultLabel>
                  <span>{seatName || 'N/A'}</span>
                </ResultRow>
                <ResultRow>
                  <ResultLabel>Reference</ResultLabel>
                  <span>{reference || 'N/A'}</span>
                </ResultRow>
                <ResultRow>
                  <ResultLabel>Check-in time</ResultLabel>
                  <span>{formatDateTime(checkIn.checkInTime || checkIn.check_in_at)}</span>
                </ResultRow>
                <ResultRow>
                  <ResultLabel>Session window</ResultLabel>
                  <span>
                    {`${formatDateTime(booking.startDate || booking.start_time)} - ${formatDateTime(booking.endDate || booking.end_time)}`}
                  </span>
                </ResultRow>
                {checkIn.location &&
                 typeof checkIn.location.latitude === 'number' &&
                 typeof checkIn.location.longitude === 'number' && (
                  <ResultRow>
                    <ResultLabel>Location</ResultLabel>
                    <span>
                      {`${checkIn.location.latitude.toFixed(4)}, ${checkIn.location.longitude.toFixed(4)}`}
                    </span>
                  </ResultRow>
                )}
              </>
            );
          })()}
        </CheckInResult>
      )}

      <GuidanceNote>
        Uploading from email or entering the booking code manually both work the same way.
      </GuidanceNote>
    </ScannerContainer>
  );
};

export default QRScanner;
