import React from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useBooking } from '../../contexts/BookingContext';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  padding-top: 80px; /* Space for fixed header */
`;

const SectionContainer = styled.section`
  max-width: 1000px;
  margin: 0 auto;
  padding: 3rem 2rem;
  
  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 1.5rem 1rem;
  }
`;

const BookingHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }
`;

const BookingTitle = styled.h2`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const BookingSubtitle = styled.p`
  font-size: 1.2rem;
  color: #555;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const StepsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 3rem;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background-color: #e0e0e0;
    z-index: 1;
    transform: translateY(-50%);
  }
  
  @media (max-width: 768px) {
    overflow-x: auto;
    padding-bottom: 1.5rem;
    justify-content: flex-start;
    
    &::before {
      top: 35%;
    }
    
    /* Custom scrollbar for better UX */
    &::-webkit-scrollbar {
      height: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 10px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
      background: #aaa;
    }
  }
`;

const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  min-width: 80px; /* Ensure steps don't shrink too much on mobile */
  
  @media (max-width: 768px) {
    margin: 0 15px;
    flex-shrink: 0; /* Prevent shrinking on small screens */
    
    &:first-child {
      margin-left: 5px;
    }
    
    &:last-child {
      margin-right: 5px;
    }
  }
`;

const StepCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.active ? '#45bf55' : '#e0e0e0'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const StepLabel = styled.div`
  font-size: 0.9rem;
  color: ${props => props.active ? '#333' : '#999'};
  text-align: center;
  white-space: nowrap;
`;

const ContentContainer = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin: 2rem 0;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 1.25rem;
  }
`;

const BookingLayout = ({ children, title, subtitle }) => {
  const location = useLocation();
  const { currentStep, bookingState } = useBooking();
  const isHotDesk = bookingState?.serviceType === 'hot-desk';
  
  // Xác định bước hiện tại dựa vào đường dẫn
  const getCurrentStepFromPath = () => {
    const path = location.pathname;
    if (path.includes('/booking/service')) return 1;
    if (path.includes('/booking/package-duration')) return 2;
    if (path.includes('/booking/date')) return 3;
    if (isHotDesk) {
      if (path.includes('/booking/payment')) return 4;
      if (path.includes('/booking/confirmation')) return 4; // Hot Desk: không có bước 5
    } else {
      if (path.includes('/booking/seat')) return 4;
      if (path.includes('/booking/payment')) return 5;
      if (path.includes('/booking/confirmation')) return 5;
    }
    return currentStep; // Sử dụng giá trị từ context nếu không khớp với đường dẫn
  };
  
  const step = getCurrentStepFromPath();

  return (
    <PageContainer>
      <Header />
      <MainContent>
        <SectionContainer>
          <BookingHeader>
            <BookingTitle>{title || "Reserve Your Seat"}</BookingTitle>
            <BookingSubtitle>{subtitle || "Follow the steps to complete your booking"}</BookingSubtitle>
          </BookingHeader>
          
          <StepsContainer>
            <Step>
              <StepCircle active={step >= 1}>1</StepCircle>
              <StepLabel active={step >= 1}>Service</StepLabel>
            </Step>
            <Step>
              <StepCircle active={step >= 2}>2</StepCircle>
              <StepLabel active={step >= 2}>Duration</StepLabel>
            </Step>
            <Step>
              <StepCircle active={step >= 3}>3</StepCircle>
              <StepLabel active={step >= 3}>Date</StepLabel>
            </Step>
            {isHotDesk ? (
              <Step>
                <StepCircle active={step >= 4}>4</StepCircle>
                <StepLabel active={step >= 4}>Payment</StepLabel>
              </Step>
            ) : (
              <>
                <Step>
                  <StepCircle active={step >= 4}>4</StepCircle>
                  <StepLabel active={step >= 4}>Seat</StepLabel>
                </Step>
                <Step>
                  <StepCircle active={step >= 5}>5</StepCircle>
                  <StepLabel active={step >= 5}>Payment</StepLabel>
                </Step>
              </>
            )}
          </StepsContainer>
          
          <ContentContainer>
            {children}
          </ContentContainer>
        </SectionContainer>
      </MainContent>
      <Footer />
    </PageContainer>
  );
};

export default BookingLayout;
