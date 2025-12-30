import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
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
`;

const BookingHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const BookingTitle = styled.h2`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
`;

const BookingSubtitle = styled.p`
  font-size: 1.2rem;
  color: #555;
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
`;

const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
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
`;

const ServiceOptions = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
`;

const ServiceCard = styled.div`
  width: 300px;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  position: relative;
  
  ${props => props.selected && `
    border: 2px solid #45bf55;
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  `}
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const ServiceImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
`;

const ServiceContent = styled.div`
  padding: 1.5rem;
`;

const ServiceTitle = styled.h3`
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 0.8rem;
`;

const ServiceDescription = styled.p`
  font-size: 0.9rem;
  color: #555;
  line-height: 1.5;
`;

const ServicePrice = styled.p`
  font-size: 1rem;
  color: #333;
  font-weight: 500;
  margin-top: 1rem;
`;

const SelectedMark = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #45bf55;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
`;

const ActionContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 3rem;
`;

const BackButton = styled.button`
  background-color: #f5f5f5;
  color: #333;
  border: none;
  border-radius: 4px;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  
  &:hover {
    background-color: #e0e0e0;
    transform: translateY(-2px);
  }
`;

const NextButton = styled.button`
  background-color: #45bf55;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  
  &:hover {
    background-color: #38a046;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const PackageSelectionPage = () => {
  const { bookingState, selectPackageType, setCurrentStep } = useBooking();
  const navigate = useNavigate();
  
  // Redirect if service type is not selected
  if (!bookingState.serviceType) {
    navigate('/booking/service');
    return null;
  }
  
  const handleSelectPackage = (type) => {
    selectPackageType(type);
  };
  
  const handleNextStep = () => {
    navigate('/booking/date');
  };
  
  const handleBackStep = () => {
    navigate('/booking/service');
  };

  return (
    <PageContainer>
      <Header />
      <MainContent>
        <SectionContainer>
          <BookingHeader>
            <BookingTitle>Select Your Package</BookingTitle>
            <BookingSubtitle>Choose the workspace package that suits your needs</BookingSubtitle>
          </BookingHeader>
          
          <StepsContainer>
            <Step>
              <StepCircle active={true}>1</StepCircle>
              <StepLabel active={true}>Service</StepLabel>
            </Step>
            <Step>
              <StepCircle active={true}>2</StepCircle>
              <StepLabel active={true}>Package</StepLabel>
            </Step>
            <Step>
              <StepCircle active={false}>3</StepCircle>
              <StepLabel active={false}>Date</StepLabel>
            </Step>
            <Step>
              <StepCircle active={false}>4</StepCircle>
              <StepLabel active={false}>Seat</StepLabel>
            </Step>
            <Step>
              <StepCircle active={false}>5</StepCircle>
              <StepLabel active={false}>Booking</StepLabel>
            </Step>
          </StepsContainer>
          
          <ServiceOptions>
            <ServiceCard 
              selected={bookingState.packageType === 'hot-desk'}
              onClick={() => handleSelectPackage('hot-desk')}
            >
              <ServiceImage 
                src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1760443305/Screenshot_2025-10-14_190124_h1qx7f.png" 
                alt="Hot Desk" 
              />
              <ServiceContent>
                <ServiceTitle>Hot Desk</ServiceTitle>
                <ServiceDescription>
                  An ideal space for those who love innovation every day. You can
                  access the workspace at any time and explore many different
                  creative areas.
                </ServiceDescription>
                <ServicePrice>About 2.350.000 VND / Member / Month</ServicePrice>
              </ServiceContent>
              {bookingState.packageType === 'hot-desk' && <SelectedMark>✓</SelectedMark>}
            </ServiceCard>
            
            <ServiceCard 
              selected={bookingState.packageType === 'fixed-desk'}
              onClick={() => handleSelectPackage('fixed-desk')}
            >
              <ServiceImage 
                src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1760000073/Screenshot_2025-10-09_155422_wqdemf.png" 
                alt="Fixed Desk" 
              />
              <ServiceContent>
                <ServiceTitle>Fixed Desk</ServiceTitle>
                <ServiceDescription>
                  A creative, modern open space where you have a separate fixed seat - 
                  ensuring stability while still being part of a vibrant, young 
                  business community.
                </ServiceDescription>
                <ServicePrice>About 2.950.000 VND / Member / Month</ServicePrice>
              </ServiceContent>
              {bookingState.packageType === 'fixed-desk' && <SelectedMark>✓</SelectedMark>}
            </ServiceCard>
          </ServiceOptions>
          
          <ActionContainer>
            <BackButton onClick={handleBackStep}>
              Back
            </BackButton>
            <NextButton 
              disabled={!bookingState.packageType}
              onClick={handleNextStep}
            >
              Next Step
            </NextButton>
          </ActionContainer>
        </SectionContainer>
      </MainContent>
      <Footer />
    </PageContainer>
  );
};

export default PackageSelectionPage;