import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import QRScanner from '../components/QRScanner';
import AttendanceDashboard from '../components/AttendanceDashboard';
import { useAuth } from '../contexts/AuthContext';
import { useQR } from '../contexts/QRContext';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem 0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 2rem;
  border-radius: 20px;
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
    animation: shimmer 6s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
    100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
  }
`;

const PageTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const PageSubtitle = styled.p`
  font-size: 1.3rem;
  opacity: 0.9;
  margin: 0;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  background: white;
  border-radius: 15px;
  padding: 0.5rem;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  max-width: 500px;
  margin: 0 auto 2rem auto;

  @media (max-width: 768px) {
    margin: 0 1rem 2rem 1rem;
  }
`;

const Tab = styled.button`
  flex: 1;
  background: ${props => props.active ? 'linear-gradient(45deg, #667eea, #764ba2)' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};
  border: none;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: ${props => props.active ? 'linear-gradient(45deg, #667eea, #764ba2)' : 'rgba(102, 126, 234, 0.1)'};
    color: ${props => props.active ? 'white' : '#333'};
  }

  @media (max-width: 480px) {
    padding: 0.8rem 1rem;
    font-size: 0.9rem;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 1024px) {
    grid-template-columns: ${props => props.activeTab === 'scanner' ? '1fr 1fr' : '1fr'};
  }
`;

const CheckInHistory = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  margin-top: 2rem;
`;

const HistoryTitle = styled.h3`
  font-size: 1.5rem;
  color: #333;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '📋';
    font-size: 1.8rem;
  }
`;

const HistoryItem = styled.div`
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1rem;
  margin: 1rem 0;
  border-left: 4px solid #667eea;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(5px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
`;

const HistoryDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
`;

const AlertMessage = styled.div`
  background: ${props => {
    if (props.type === 'success') return 'linear-gradient(45deg, #4CAF50, #66BB6A)';
    if (props.type === 'error') return 'linear-gradient(45deg, #F44336, #EF5350)';
    return 'linear-gradient(45deg, #2196F3, #42A5F5)';
  }};
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
`;

const LoadingSpinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const QRCheckInPage = () => {
  const { currentUser } = useAuth();
  const { loading, getAttendanceHistory, processCheckOut } = useQR();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('scanner');
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth/login');
      return;
    }
    
    loadRecentCheckIns();
  }, [currentUser, navigate]);

  const loadRecentCheckIns = async () => {
    try {
      const result = await getAttendanceHistory(5, 0);
      if (result.success) {
        setRecentCheckIns(result.checkIns);
      }
    } catch (error) {
      console.error('Failed to load recent check-ins:', error);
    }
  };

  const handleScanSuccess = (result) => {
    setAlertMessage({
      type: 'success',
      message: `🎉 Check-in successful! Welcome to ${result.booking?.spaceType}`
    });
    
    // Refresh attendance data
    loadRecentCheckIns();
    
    // Clear alert after 5 seconds
    setTimeout(() => setAlertMessage(null), 5000);
  };

  const handleScanError = (error) => {
    setAlertMessage({
      type: 'error',
      message: `❌ Check-in failed: ${error.message}`
    });
    
    // Clear alert after 5 seconds
    setTimeout(() => setAlertMessage(null), 5000);
  };

  const handleCheckOut = async (bookingId) => {
    try {
      const notes = prompt('Any additional notes for check-out? (Optional)');
      const rating = prompt('Rate your experience (1-5): (Optional)');
      
      const result = await processCheckOut(
        bookingId, 
        notes || '', 
        rating ? parseInt(rating) : null
      );
      
      if (result.success) {
        setAlertMessage({
          type: 'success',
          message: '🚪 Check-out successful! Thank you for using our space.'
        });
        loadRecentCheckIns();
        setTimeout(() => setAlertMessage(null), 5000);
      } else {
        setAlertMessage({
          type: 'error',
          message: `❌ Check-out failed: ${result.message}`
        });
        setTimeout(() => setAlertMessage(null), 5000);
      }
    } catch (error) {
      console.error('Check-out error:', error);
      setAlertMessage({
        type: 'error',
        message: '❌ Check-out failed. Please try again.'
      });
      setTimeout(() => setAlertMessage(null), 5000);
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'Active';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (!currentUser) {
    return null; // Will redirect to login
  }

  return (
    <PageContainer>
      <Header />
      
      <MainContent>
        <Container>
          <PageHeader>
            <PageTitle>🎯 QR Check-in System</PageTitle>
            <PageSubtitle>
              Scan QR codes to check-in/out and track your workspace attendance
            </PageSubtitle>
          </PageHeader>

          {alertMessage && (
            <AlertMessage type={alertMessage.type}>
              {alertMessage.message}
            </AlertMessage>
          )}

          <TabContainer>
            <Tab 
              active={activeTab === 'scanner'} 
              onClick={() => setActiveTab('scanner')}
            >
              📷 Scanner
            </Tab>
            <Tab 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Dashboard
            </Tab>
          </TabContainer>

          <ContentGrid activeTab={activeTab}>
            {activeTab === 'scanner' ? (
              <>
                <QRScanner 
                  onScanSuccess={handleScanSuccess}
                  onScanError={handleScanError}
                />
                
                {recentCheckIns.length > 0 && (
                  <CheckInHistory>
                    <HistoryTitle>Recent Activity</HistoryTitle>
                    {recentCheckIns.slice(0, 3).map((checkIn) => (
                      <HistoryItem key={checkIn._id}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          marginBottom: '0.5rem'
                        }}>
                          <strong>{checkIn.bookingId?.spaceType || 'Unknown Space'}</strong>
                          <span style={{
                            background: checkIn.checkOutTime ? '#607D8B' : '#4CAF50',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.8rem'
                          }}>
                            {checkIn.checkOutTime ? 'Completed' : 'Active'}
                          </span>
                        </div>
                        <HistoryDetails>
                          <div>📅 {formatDateTime(checkIn.checkInTime)}</div>
                          <div>⏱️ {formatDuration(checkIn.duration)}</div>
                          {checkIn.rating && (
                            <div>⭐ {checkIn.rating}/5</div>
                          )}
                        </HistoryDetails>
                        {!checkIn.checkOutTime && checkIn.bookingId && (
                          <button
                            onClick={() => handleCheckOut(checkIn.bookingId._id)}
                            style={{
                              background: '#F44336',
                              color: 'white',
                              border: 'none',
                              padding: '0.5rem 1rem',
                              borderRadius: '5px',
                              marginTop: '0.5rem',
                              cursor: 'pointer',
                              fontSize: '0.9rem'
                            }}
                          >
                            🚪 Check Out
                          </button>
                        )}
                      </HistoryItem>
                    ))}
                  </CheckInHistory>
                )}
              </>
            ) : (
              <AttendanceDashboard />
            )}
          </ContentGrid>
        </Container>
      </MainContent>

      <Footer />
      
      {loading && (
        <LoadingOverlay>
          <LoadingSpinner />
        </LoadingOverlay>
      )}
    </PageContainer>
  );
};

export default QRCheckInPage;
