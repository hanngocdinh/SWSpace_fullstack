import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import BookingLayout from './BookingLayout';
import { useBooking } from '../../contexts/BookingContext';

const ServiceOptions = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    gap: 1.5rem;
  }
  
  @media (max-width: 480px) {
    gap: 1.2rem;
    justify-content: space-around;
  }
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
  
  @media (max-width: 768px) {
    width: 280px;
  }
  
  @media (max-width: 480px) {
    width: 100%;
    max-width: 320px;
  }
`;

const ServiceImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
`;

const ServiceContent = styled.div`
  padding: 1.5rem;
  
  @media (max-width: 480px) {
    padding: 1.25rem;
  }
`;

const ServiceTitle = styled.h3`
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 0.8rem;
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
    margin-bottom: 0.6rem;
  }
`;

const ServiceDescription = styled.p`
  font-size: 0.9rem;
  color: #555;
  line-height: 1.5;
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
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
  
  @media (max-width: 768px) {
    margin-top: 2.5rem;
  }
  
  @media (max-width: 480px) {
    margin-top: 2rem;
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
  
  @media (max-width: 768px) {
    padding: 0.7rem 1.8rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.7rem 1.5rem;
    font-size: 0.95rem;
    width: 100%;
    max-width: 200px;
  }
`;

const ValidationMessage = styled.div`
  color: #e74c3c;
  font-size: 0.9rem;
  text-align: center;
  margin-top: 1rem;
  min-height: 20px; /* Reserve space for validation message */
`;

const ServicePage = () => {
  const { bookingState, selectServiceType } = useBooking();
  const navigate = useNavigate();
  const [validationError, setValidationError] = useState('');
  
  const handleSelectService = (type) => {
    selectServiceType(type);
    setValidationError('');
  };
  
  const handleNextStep = () => {
    if (!bookingState.serviceType) {
      setValidationError('Please select a service type to continue.');
      return;
    }
    
    navigate('/booking/package-duration');
  };

  return (
    <BookingLayout
      title="Select Service Type"
      subtitle="Choose the type of workspace service you need"
    >
      <ServiceOptions>
        <ServiceCard 
          selected={bookingState.serviceType === 'hot-desk'}
          onClick={() => handleSelectService('hot-desk')}
        >
          <ServiceImage 
            src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1760443305/Screenshot_2025-10-14_190124_h1qx7f.png" 
            alt="Hot Desk" 
          />
          <ServiceContent>
            <ServiceTitle>Hot Desk</ServiceTitle>
            <ServiceDescription>
              A flexible workspace where you can sit anywhere in the common area.
              Perfect for digital nomads and flexible workers.
            </ServiceDescription>
          </ServiceContent>
          {bookingState.serviceType === 'hot-desk' && <SelectedMark>✓</SelectedMark>}
        </ServiceCard>
        
        <ServiceCard 
          selected={bookingState.serviceType === 'fixed-desk'}
          onClick={() => handleSelectService('fixed-desk')}
        >
          <ServiceImage 
            src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1759999994/Screenshot_2025-10-09_155300_kll7tl.png" 
            alt="Fixed Desk" 
          />
          <ServiceContent>
            <ServiceTitle>Fixed Desk</ServiceTitle>
            <ServiceDescription>
              A dedicated desk that's yours 24/7. Store your belongings and 
              pick up where you left off every day.
            </ServiceDescription>
          </ServiceContent>
          {bookingState.serviceType === 'fixed-desk' && <SelectedMark>✓</SelectedMark>}
        </ServiceCard>
      </ServiceOptions>
      
      <ValidationMessage>{validationError}</ValidationMessage>
      
      <ActionContainer>
        <NextButton 
          onClick={handleNextStep}
        >
          Next Step
        </NextButton>
      </ActionContainer>
    </BookingLayout>
  );
};

export default ServicePage;
