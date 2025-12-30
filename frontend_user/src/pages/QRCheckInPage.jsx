import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import QRScanner from '../components/QRScanner';
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

const ContentStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ScannerPanel = styled.div`
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
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
  const { loading } = useQR();
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth/login');
      return;
    }
  }, [currentUser, navigate]);

  const handleScanSuccess = (result) => {
    setAlertMessage({
      type: 'success',
      message: `Check-in successful! Welcome to ${result.booking?.spaceType}`
    });
    
    setTimeout(() => setAlertMessage(null), 5000);
  };

  const handleScanError = (error) => {
    setAlertMessage({
      type: 'error',
      message: `Check-in failed: ${error.message}`
    });
    
    // Clear alert after 5 seconds
    setTimeout(() => setAlertMessage(null), 5000);
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
            <PageTitle>QR Check-in System</PageTitle>
            <PageSubtitle>
              Scan QR codes to check-in/out and track your workspace attendance
            </PageSubtitle>
          </PageHeader>

          {alertMessage && (
            <AlertMessage type={alertMessage.type}>
              {alertMessage.message}
            </AlertMessage>
          )}

          <ContentStack>
            <ScannerPanel>
              <QRScanner 
                onScanSuccess={handleScanSuccess}
                onScanError={handleScanError}
              />
            </ScannerPanel>
          </ContentStack>
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
