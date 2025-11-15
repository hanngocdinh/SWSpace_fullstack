import React from 'react';
import styled from 'styled-components';
import { FaCube } from 'react-icons/fa';

const TourButtonContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
`;

const TourButton = styled.button`
  background-color: #45bf55;
  color: white;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    background-color: #38a046;
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const TourButtonText = styled.div`
  position: absolute;
  white-space: nowrap;
  right: 70px;
  background-color: rgba(0,0,0,0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.9rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${TourButtonContainer}:hover & {
    opacity: 1;
  }
`;

const FloatingTourButton = ({ onClick }) => {
  return (
    <TourButtonContainer>
      <TourButtonText>Xem không gian 3D</TourButtonText>
      <TourButton onClick={onClick}>
        <FaCube size={24} />
      </TourButton>
    </TourButtonContainer>
  );
};

export default FloatingTourButton;