import React from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';

const ProgressContainer = styled.div`
  max-width: 1100px;
  margin: 0 auto 2rem;
  padding: 2rem 2rem 0;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1.5rem 0;
  }
`;

const StepsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 20px;
    left: 10%;
    right: 10%;
    height: 2px;
    background-color: #e0e0e0;
    z-index: 1;
  }
  
  @media (max-width: 768px) {
    overflow-x: auto;
    padding-bottom: 1rem;
    justify-content: flex-start;
    
    &::before {
      left: 5%;
      right: 5%;
    }
  }
`;

const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  flex: 1;
  
  @media (max-width: 768px) {
    min-width: 80px;
    flex-shrink: 0;
    margin: 0 10px;
  }
`;

const StepCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.active ? '#45bf55' : props.completed ? '#27ae60' : '#e0e0e0'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-shadow: ${props => props.active ? '0 0 0 4px rgba(69, 191, 85, 0.2)' : 'none'};
`;

const StepLabel = styled.div`
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: ${props => props.active ? '#2c3e50' : '#95a5a6'};
  font-weight: ${props => props.active ? '600' : '400'};
  text-align: center;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

const TeamBookingProgress = () => {
  const location = useLocation();
  
  const getCurrentStep = () => {
    const path = location.pathname;
    if (path.includes('/team-booking/duration')) return 2;
    if (path.includes('/team-booking/date')) return 3;
    if (path.includes('/team-booking/room')) return 4;
    if (path.includes('/team-booking/payment')) return 5;
    return 1; // team-booking or default
  };
  
  const currentStep = getCurrentStep();
  
  const steps = [
    { number: 1, label: 'Service' },
    { number: 2, label: 'Duration' },
    { number: 3, label: 'Date' },
    { number: 4, label: 'Seat' },
    { number: 5, label: 'Payment' }
  ];
  
  return (
    <ProgressContainer>
      <StepsContainer>
        {steps.map((step) => (
          <Step key={step.number}>
            <StepCircle 
              active={currentStep === step.number} 
              completed={currentStep > step.number}
            >
              {step.number}
            </StepCircle>
            <StepLabel active={currentStep >= step.number}>
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </StepsContainer>
    </ProgressContainer>
  );
};

export default TeamBookingProgress;
