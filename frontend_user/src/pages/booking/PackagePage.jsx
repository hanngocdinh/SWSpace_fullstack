import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import BookingLayout from './BookingLayout';
import { useBooking } from '../../contexts/BookingContext';

const PackageOptions = styled.div`
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

const PackageCard = styled.div`
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

const PackageImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
`;

const PackageContent = styled.div`
  padding: 1.5rem;
  
  @media (max-width: 480px) {
    padding: 1.25rem;
  }
`;

const PackageTitle = styled.h3`
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 0.8rem;
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
    margin-bottom: 0.6rem;
  }
`;

const PackageDescription = styled.p`
  font-size: 0.9rem;
  color: #555;
  line-height: 1.5;
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const PackagePrice = styled.p`
  font-size: 1rem;
  color: #333;
  font-weight: 500;
  margin-top: 1rem;
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
    margin-top: 0.8rem;
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

const ValidationMessage = styled.div`
  color: #e74c3c;
  font-size: 0.9rem;
  text-align: center;
  margin-top: 1rem;
  min-height: 20px; /* Reserve space for validation message */
`;

const ActionContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 3rem;
  
  @media (max-width: 768px) {
    margin-top: 2.5rem;
  }
  
  @media (max-width: 480px) {
    margin-top: 2rem;
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
  }
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
    order: -1; /* Make the Next button appear before the Back button on mobile */
  }
`;

const PackagePage = () => {
  const { bookingState, selectPackageType } = useBooking();
  const navigate = useNavigate();
  const [validationError, setValidationError] = useState('');
  
  // Redirect if service type is not selected
  useEffect(() => {
    if (!bookingState.serviceType) {
      navigate('/booking/service');
    }
  }, [bookingState.serviceType, navigate]);
  
  const handleSelectPackage = (type) => {
    selectPackageType(type);
    setValidationError('');
  };
  
  const handleNextStep = () => {
    if (!bookingState.packageType) {
      setValidationError('Please select a package type to continue.');
      return;
    }
    
    navigate('/booking/date');
  };
  
  const handleBackStep = () => {
    navigate('/booking/service');
  };

  return (
    <BookingLayout
      title="Select Your Package"
      subtitle="Choose the workspace package that suits your needs"
    >
      <PackageOptions>
        <PackageCard 
          selected={bookingState.packageType === 'hot-desk'}
          onClick={() => handleSelectPackage('hot-desk')}
        >
          <PackageImage 
            src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1760443305/Screenshot_2025-10-14_190124_h1qx7f.png" 
            alt="Hot Desk" 
          />
          <PackageContent>
            <PackageTitle>Hot Desk</PackageTitle>
            <PackageDescription>
              An ideal space for those who love innovation every day. You can
              access the workspace at any time and explore many different
              creative areas.
            </PackageDescription>
            <PackagePrice>About 2.350.000 VND / Member / Month</PackagePrice>
          </PackageContent>
          {bookingState.packageType === 'hot-desk' && <SelectedMark>✓</SelectedMark>}
        </PackageCard>
        
        <PackageCard 
          selected={bookingState.packageType === 'fixed-desk'}
          onClick={() => handleSelectPackage('fixed-desk')}
        >
          <PackageImage 
            src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1760000073/Screenshot_2025-10-09_155422_wqdemf.png" 
            alt="Fixed Desk" 
          />
          <PackageContent>
            <PackageTitle>Fixed Desk</PackageTitle>
            <PackageDescription>
              A creative, modern open space where you have a separate fixed seat - 
              ensuring stability while still being part of a vibrant, young 
              business community.
            </PackageDescription>
            <PackagePrice>About 2.950.000 VND / Member / Month</PackagePrice>
          </PackageContent>
          {bookingState.packageType === 'fixed-desk' && <SelectedMark>✓</SelectedMark>}
        </PackageCard>
      </PackageOptions>
      
      <ValidationMessage>{validationError}</ValidationMessage>
      
      <ActionContainer>
        <BackButton onClick={handleBackStep}>
          Back
        </BackButton>
        <NextButton onClick={handleNextStep}>
          Next Step
        </NextButton>
      </ActionContainer>
    </BookingLayout>
  );
};

export default PackagePage;
