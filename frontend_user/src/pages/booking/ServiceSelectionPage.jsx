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
  margin-top: 3rem;
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

const ServiceSelectionPage = () => {
  const { bookingState, selectServiceType, currentStep, setCurrentStep } = useBooking();
  const navigate = useNavigate();
  
  const handleSelectService = (type) => {
    selectServiceType(type);
  };
  
  const handleNextStep = () => {
    navigate('/booking/package');
  };

  return (
    <PageContainer>
      <Header />
      <MainContent>
        <SectionContainer>
          <BookingHeader>
            <BookingTitle>Reserve Your Seat</BookingTitle>
            <BookingSubtitle>Select the type of service you need</BookingSubtitle>
          </BookingHeader>
          
          <StepsContainer>
            <Step>
              <StepCircle active={true}>1</StepCircle>
              <StepLabel active={true}>Service</StepLabel>
            </Step>
            <Step>
              <StepCircle active={false}>2</StepCircle>
              <StepLabel active={false}>Package</StepLabel>
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
              selected={bookingState.serviceType === 'freelancer'}
              onClick={() => handleSelectService('freelancer')}
            >
              <ServiceImage 
                src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1760443305/Screenshot_2025-10-14_190124_h1qx7f.png" 
                alt="Freelancer" 
              />
              <ServiceContent>
                <ServiceTitle>Freelancer</ServiceTitle>
                <ServiceDescription>
                  Perfect for individuals who need a flexible workspace.
                  Get access to our hot desk and fixed desk options.
                </ServiceDescription>
              </ServiceContent>
              {bookingState.serviceType === 'freelancer' && <SelectedMark>✓</SelectedMark>}
            </ServiceCard>
            
            <ServiceCard 
              selected={bookingState.serviceType === 'team'}
              onClick={() => handleSelectService('team')}
            >
              <ServiceImage 
                src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1759999994/Screenshot_2025-10-09_155300_kll7tl.png" 
                alt="Team" 
              />
              <ServiceContent>
                <ServiceTitle>Team</ServiceTitle>
                <ServiceDescription>
                  Designed for groups who need dedicated space.
                  Choose from our private offices and meeting rooms.
                </ServiceDescription>
              </ServiceContent>
              {bookingState.serviceType === 'team' && <SelectedMark>✓</SelectedMark>}
            </ServiceCard>
          </ServiceOptions>
          
          <ActionContainer>
            <NextButton 
              disabled={!bookingState.serviceType}
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

export default ServiceSelectionPage;