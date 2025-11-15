import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import jsQR from 'jsqr';
import { useQR } from '../contexts/QRContext';

const ScannerContainer = styled.div`
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  border-radius: 20px;
  padding: 30px;
  color: white;
  box-shadow: 0 15px 35px rgba(30, 60, 114, 0.3);
  margin: 20px 0;
  text-align: center;
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
    animation: pulse 4s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
  }
`;

const ScannerTitle = styled.h3`
  margin: 0 0 20px 0;
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  z-index: 1;

  &::before {
    content: '📷';
    font-size: 28px;
  }
`;

const VideoWrapper = styled.div`
  position: relative;
  width: 300px;
  height: 300px;
  margin: 20px auto;
  border-radius: 15px;
  overflow: hidden;
  background: #000;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  z-index: 1;
`;

const VideoElement = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ScanOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px solid #00ff00;
  border-radius: 15px;
  background: rgba(0, 255, 0, 0.1);
  pointer-events: none;
  
  &::before, &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border: 3px solid #00ff00;
  }

  &::before {
    top: 10px;
    left: 10px;
    border-right: none;
    border-bottom: none;
  }

  &::after {
    bottom: 10px;
    right: 10px;
    border-left: none;
    border-top: none;
  }
`;

const ScanLine = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #00ff00, transparent);
  animation: ${props => props.isActive ? 'scanLine 1s linear infinite' : 'none'};
  box-shadow: 0 0 10px #00ff00;

  @keyframes scanLine {
    0% { top: 0; opacity: 1; }
    50% { opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }
`;

const ControlButtons = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  margin: 20px 0;
  position: relative;
  z-index: 1;
`;

const ActionButton = styled.button`
  background: ${props => {
    if (props.variant === 'start') return 'linear-gradient(45deg, #4CAF50, #66BB6A)';
    if (props.variant === 'stop') return 'linear-gradient(45deg, #F44336, #EF5350)';
    return 'linear-gradient(45deg, #2196F3, #42A5F5)';
  }};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatusMessage = styled.div`
  margin: 15px 0;
  padding: 15px;
  border-radius: 10px;
  background: ${props => {
    if (props.type === 'success') return 'rgba(76, 175, 80, 0.2)';
    if (props.type === 'error') return 'rgba(244, 67, 54, 0.2)';
    if (props.type === 'warning') return 'rgba(255, 152, 0, 0.2)';
    return 'rgba(33, 150, 243, 0.2)';
  }};
  border: 1px solid ${props => {
    if (props.type === 'success') return '#4CAF50';
    if (props.type === 'error') return '#F44336';
    if (props.type === 'warning') return '#FF9800';
    return '#2196F3';
  }};
  color: ${props => {
    if (props.type === 'success') return '#4CAF50';
    if (props.type === 'error') return '#F44336';
    if (props.type === 'warning') return '#FF9800';
    return '#2196F3';
  }};
  position: relative;
  z-index: 1;
`;

const ManualInputSection = styled.div`
  margin: 25px 0;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
`;

const UploadSection = styled.div`
  margin: 25px 0;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
`;

const UploadDropZone = styled.div`
  border: 2px dashed ${props => props.isDragOver ? '#4CAF50' : 'rgba(255, 255, 255, 0.3)'};
  border-radius: 10px;
  padding: 30px;
  text-align: center;
  background: ${props => props.isDragOver ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: #4CAF50;
    background: rgba(76, 175, 80, 0.1);
  }

  input[type="file"] {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }
`;

const UploadIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  color: ${props => props.isDragOver ? '#4CAF50' : 'rgba(255, 255, 255, 0.7)'};
  transition: all 0.3s ease;
`;

const UploadText = styled.div`
  color: ${props => props.isDragOver ? '#4CAF50' : 'rgba(255, 255, 255, 0.9)'};
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
  transition: all 0.3s ease;
`;

const UploadSubtext = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
`;

const PreviewImage = styled.div`
  margin: 20px 0;
  text-align: center;
  
  img {
    max-width: 200px;
    max-height: 200px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  }
  
  .filename {
    margin-top: 10px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
    word-break: break-all;
  }
`;

const ProcessButton = styled.button`
  background: linear-gradient(45deg, #4CAF50, #66BB6A);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const TabContainer = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 5px;
  margin: 20px 0;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Tab = styled.button`
  flex: 1;
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const ManualInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 16px;
  margin: 10px 0;
  backdrop-filter: blur(10px);

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  &:focus {
    outline: none;
    border-color: #2196F3;
    background: rgba(255, 255, 255, 0.15);
  }
`;

const CheckInResult = styled.div`
  margin: 20px 0;
  padding: 20px;
  background: rgba(76, 175, 80, 0.2);
  border: 2px solid #4CAF50;
  border-radius: 15px;
  color: #4CAF50;
  position: relative;
  z-index: 1;

  h4 {
    margin: 0 0 10px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .details {
    font-size: 14px;
    opacity: 0.9;
    margin: 5px 0;
  }
`;

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const { verifyQRCode, processCheckIn, getCurrentLocation } = useQR();
  const [isScanning, setIsScanning] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('info');
  const [manualCode, setManualCode] = useState('');
  const [checkInResult, setCheckInResult] = useState(null);
  const [stream, setStream] = useState(null);
  const [activeTab, setActiveTab] = useState('camera'); // camera, upload, manual
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const videoRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      setStatusMessage('Requesting camera access...');
      setStatusType('info');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsScanning(true);
        setStatusMessage('Camera ready! Point at QR code to scan');
        setStatusType('success');

        // Start scanning interval - scan more frequently for better detection
        scanIntervalRef.current = setInterval(scanFrame, 500); // 2 times per second
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setStatusMessage('Camera access denied. Please allow camera permission or use manual input.');
      setStatusType('error');
    }
  };

  const stopScanning = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
    setStatusMessage('');
  };

  const scanFrame = async () => {
    if (!videoRef.current || !isScanning) return;

    try {
      // Create canvas to capture frame
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      // Convert to image data for QR detection
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Use jsQR to detect QR codes
      const qrResult = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert"
      });
      
      if (qrResult && qrResult.data) {
        console.log('🎯 QR Code detected from camera:', qrResult.data);
        
        // Stop scanning immediately
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
        
        // Show detected message
        setStatusMessage('QR detected! Processing check-in automatically...');
        setStatusType('success');
        
        // Process the detected QR code automatically
        await processQRCode(qrResult.data);
      }
      
    } catch (error) {
      console.error('Frame scan error:', error);
    }
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

      // First verify the QR code
      const verifyResult = await verifyQRCode(qrCodeString);
      
      if (!verifyResult.success) {
        setStatusMessage(`QR code invalid: ${verifyResult.message}`);
        setStatusType('error');
        if (onScanError) onScanError(verifyResult);
        return;
      }

      setStatusMessage('QR verified! Processing check-in...');
      
      // Get current location if possible
      const location = await getCurrentLocation();
      
      // Process check-in
      const checkInResult = await processCheckIn(qrCodeString, location);
      
      if (checkInResult.success) {
        setCheckInResult(checkInResult);
        setStatusMessage('Check-in successful!');
        setStatusType('success');
        
        if (onScanSuccess) {
          onScanSuccess(checkInResult);
        }
        
        // Stop scanning after successful check-in
        stopScanning();
        setManualCode('');
        setUploadedFile(null);
        setPreviewUrl('');
      } else {
        setStatusMessage(`Check-in failed: ${checkInResult.message}`);
        setStatusType('error');
        if (onScanError) onScanError(checkInResult);
      }
    } catch (error) {
      console.error('QR processing error:', error);
      setStatusMessage('Error processing QR code');
      setStatusType('error');
      if (onScanError) onScanError({ success: false, message: error.message });
    }
  };

  // File upload handlers
  const handleFileSelect = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setStatusMessage('Please select a valid image file');
      setStatusType('error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setStatusMessage('File too large. Maximum size is 10MB.');
      setStatusType('error');
      return;
    }

    setUploadedFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);

    setStatusMessage('Image selected! Click "Process QR Image" to check-in.');
    setStatusType('success');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
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

      // Create form data
      const formData = new FormData();
      formData.append('qrImage', uploadedFile);
      
      // Get location if possible
      const location = await getCurrentLocation();
      if (location) {
        formData.append('location', JSON.stringify(location));
      }

      // Send to upload-checkin endpoint
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const response = await fetch(`${base}/api/qr/upload-checkin`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setCheckInResult(result);
        setStatusMessage('Check-in successful from uploaded image!');
        setStatusType('success');
        
        if (onScanSuccess) {
          onScanSuccess(result);
        }
        
        // Clear upload state
        setUploadedFile(null);
        setPreviewUrl('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
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
      <ScannerTitle>QR Code Scanner</ScannerTitle>

      {isScanning ? (
        <VideoWrapper>
          <VideoElement
            ref={videoRef}
            autoPlay
            playsInline
            muted
          />
          <ScanOverlay>
            <ScanLine isActive={isScanning} />
          </ScanOverlay>
        </VideoWrapper>
      ) : (
        <VideoWrapper>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            background: 'linear-gradient(45deg, #333, #555)',
            color: '#fff',
            fontSize: '18px'
          }}>
            📷 Camera Preview
          </div>
        </VideoWrapper>
      )}

      <TabContainer>
        <Tab 
          active={activeTab === 'camera'} 
          onClick={() => setActiveTab('camera')}
        >
          📷 Camera Scan
        </Tab>
        <Tab 
          active={activeTab === 'upload'} 
          onClick={() => setActiveTab('upload')}
        >
          📁 Upload Image
        </Tab>
        <Tab 
          active={activeTab === 'manual'} 
          onClick={() => setActiveTab('manual')}
        >
          📝 Manual Entry
        </Tab>
      </TabContainer>

      {activeTab === 'camera' && (
        <ControlButtons>
          {!isScanning ? (
            <ActionButton variant="start" onClick={startScanning}>
              📷 Start Camera
            </ActionButton>
          ) : (
            <ActionButton variant="stop" onClick={stopScanning}>
              ⏹️ Stop Scanning
            </ActionButton>
          )}
        </ControlButtons>
      )}

      {statusMessage && (
        <StatusMessage type={statusType}>
          {statusMessage}
        </StatusMessage>
      )}

      {activeTab === 'upload' && (
        <UploadSection>
          <h4 style={{ margin: '0 0 20px 0', color: 'white', textAlign: 'center' }}>
            📁 Upload QR Image
          </h4>
          
          <UploadDropZone
            isDragOver={isDragOver}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            
            <UploadIcon isDragOver={isDragOver}>
              {isDragOver ? '📤' : '📷'}
            </UploadIcon>
            
            <UploadText isDragOver={isDragOver}>
              {isDragOver ? 'Drop image here' : 'Click or drag QR image here'}
            </UploadText>
            
            <UploadSubtext>
              Supports: PNG, JPG, JPEG, GIF (Max 10MB)
            </UploadSubtext>
          </UploadDropZone>

          {previewUrl && (
            <PreviewImage>
              <img src={previewUrl} alt="QR Preview" />
              <div className="filename">{uploadedFile?.name}</div>
              <div style={{ marginTop: '10px' }}>
                <ProcessButton 
                  onClick={processUploadedImage}
                  disabled={isProcessing}
                >
                  {isProcessing ? '⏳ Processing...' : '🔍 Process QR Image'}
                </ProcessButton>
                <ActionButton variant="stop" onClick={clearUpload}>
                  🗑️ Clear
                </ActionButton>
              </div>
            </PreviewImage>
          )}
        </UploadSection>
      )}

      {activeTab === 'manual' && (
        <ManualInputSection>
          <h4 style={{ margin: '0 0 15px 0', color: 'white' }}>
            📝 Manual Entry
          </h4>
          <ManualInput
            type="text"
            placeholder="Enter QR code manually..."
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
          />
          <ActionButton 
            onClick={handleManualSubmit}
            disabled={!manualCode.trim()}
          >
            ✅ Submit Code
          </ActionButton>
        </ManualInputSection>
      )}

      {checkInResult && (
        <CheckInResult>
          <h4>
            🎉 Check-in Successful!
          </h4>
          <div className="details">
            📍 Space: {checkInResult.booking?.spaceType}
          </div>
          <div className="details">
            ⏰ Time: {new Date(checkInResult.checkIn?.checkInTime).toLocaleString()}
          </div>
          <div className="details">
            👤 User: {checkInResult.checkIn?.userId?.name || 'Unknown'}
          </div>
          {checkInResult.checkIn?.location && (
            <div className="details">
              🌍 Location: {checkInResult.checkIn.location.latitude.toFixed(4)}, {checkInResult.checkIn.location.longitude.toFixed(4)}
            </div>
          )}
        </CheckInResult>
      )}

      <div style={{ 
        fontSize: '14px', 
        opacity: '0.8', 
        marginTop: '20px',
        position: 'relative',
        zIndex: 1,
        textAlign: 'center'
      }}>
        💡 {
          activeTab === 'camera' ? 'Point camera at QR code to scan' :
          activeTab === 'upload' ? 'Upload QR image from email or gallery' :
          'Enter QR code manually if needed'
        }
      </div>
    </ScannerContainer>
  );
};

export default QRScanner;
