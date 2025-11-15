import React from 'react';
import styled from 'styled-components';

// Styled components cho bản đồ văn phòng
const MapContainer = styled.div`
  position: relative;
  width: 100%;
  background-color: #f8f8f8;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ddd;
`;

const OfficeLayout = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 65%; /* Tỷ lệ khung hình */
  background-color: #f0f0f0;
`;

const WorkArea = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 10px;
  padding: 20px;
`;

// Các khu vực khác trong văn phòng
const MeetingRoom = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 25%;
  height: 30%;
  background-color: #e1f5fe;
  border: 1px solid #b3e5fc;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  color: #0288d1;
  text-align: center;
`;

const BreakArea = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  width: 20%;
  height: 15%;
  background-color: #f8bbd0;
  border: 1px solid #f48fb1;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  color: #c2185b;
  text-align: center;
`;

const Reception = styled.div`
  position: absolute;
  bottom: 20px;
  left: calc(20% + 30px);
  width: 20%;
  height: 15%;
  background-color: #ffe0b2;
  border: 1px solid #ffcc80;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  color: #ef6c00;
  text-align: center;
`;

const Entrance = styled.div`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 15%;
  height: 5%;
  background-color: #ddd;
  border: 1px solid #bbb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: #555;
`;

// Component cho chỗ ngồi
const Seat = styled.div`
  background-color: ${props => {
    if (props.selected) return '#45bf55';
    if (props.reserved) return '#3498db';
    if (!props.available) return '#e74c3c';
    return '#f5f5f5';
  }};
  border: 2px solid ${props => {
    if (props.selected) return '#2e8b57';
    if (props.reserved) return '#2980b9';
    if (!props.available) return '#c0392b';
    return '#ddd';
  }};
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  color: ${props => props.selected || props.reserved || !props.available ? 'white' : '#555'};
  cursor: ${props => props.available ? 'pointer' : 'not-allowed'};
  transition: all 0.2s ease;
  box-shadow: ${props => props.selected ? '0 3px 6px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.1)'};
  
  &:hover {
    transform: ${props => props.available ? 'translateY(-2px)' : 'none'};
    box-shadow: ${props => props.available ? '0 4px 8px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.1)'};
  }
`;

// Thành phần chính
const ModernOfficeMap = ({ seats, selectedSeatId, onSelectSeat }) => {
  // Tìm chỗ ngồi được chọn
  const selectedSeat = seats.find(seat => seat.id === selectedSeatId);
  
  return (
    <MapContainer>
      <OfficeLayout>
        <WorkArea>
          {seats.map(seat => (
            <Seat
              key={seat.id}
              available={seat.available}
              selected={seat.id === selectedSeatId}
              reserved={!seat.available && seat.id.startsWith('B')}
              onClick={() => seat.available && onSelectSeat(seat)}
            >
              {seat.name}
            </Seat>
          ))}
        </WorkArea>
        
        <MeetingRoom>Meeting Room</MeetingRoom>
        <BreakArea>Break Area</BreakArea>
        <Reception>Reception</Reception>
        <Entrance>Entrance</Entrance>
      </OfficeLayout>
    </MapContainer>
  );
};

export default ModernOfficeMap;