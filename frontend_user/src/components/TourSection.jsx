import React, { useState } from 'react';
import styled from 'styled-components';
import { FaCube, FaTimes } from 'react-icons/fa';

const TourSectionContainer = styled.div`
  margin: 2rem 0;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #eee;
`;

const TourSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const TourTitle = styled.h4`
  font-size: 1.2rem;
  font-weight: 500;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ToggleButton = styled.button`
  background-color: transparent;
  border: none;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  
  &:hover {
    color: #333;
  }
`;

const TourDescription = styled.p`
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const EmbedContainer = styled.div`
  height: ${props => props.isExpanded ? '400px' : '0'};
  overflow: hidden;
  transition: height 0.3s ease;
`;

const TourSection = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <TourSectionContainer>
      <TourSectionHeader>
        <TourTitle>
          <FaCube /> Xem không gian làm việc 3D
        </TourTitle>
        <ToggleButton onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? (
            <>
              <FaTimes /> Ẩn xem trước
            </>
          ) : (
            <>
              <FaCube /> Hiển thị xem trước
            </>
          )}
        </ToggleButton>
      </TourSectionHeader>
      
      <TourDescription>
        Khám phá không gian làm việc của chúng tôi trong chế độ xem 3D để có cái nhìn 
        tổng thể về môi trường làm việc trước khi đặt chỗ. Bạn có thể di chuyển, xoay và 
        phóng to để xem chi tiết từng khu vực.
      </TourDescription>
      
      <EmbedContainer isExpanded={isExpanded}>
        {children}
      </EmbedContainer>
    </TourSectionContainer>
  );
};

export default TourSection;