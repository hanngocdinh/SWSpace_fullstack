import React from 'react';
import { Stage, Layer, Rect, Text, Group, Image } from 'react-konva';
import styled from 'styled-components';

const MapContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 2rem 0;
`;

const Legend = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #555;
`;

const LegendBox = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background-color: ${props => props.color};
  border: ${props => props.border ? `1px solid ${props.border}` : 'none'};
`;

// Cấu trúc bản đồ văn phòng
const officeLayout = {
  width: 700,
  height: 400,
  padding: 20,
  seatSize: 40,
};

// Component hiển thị chỗ ngồi
const Seat = ({ x, y, id, status, onClick, selected }) => {
  // Định nghĩa màu sắc dựa trên trạng thái của chỗ ngồi
  const getColor = () => {
    if (selected) return '#45bf55';
    switch (status) {
      case 'available':
        return '#f5f5f5';
      case 'occupied':
        return '#e74c3c';
      case 'reserved':
        return '#3498db';
      default:
        return '#f5f5f5';
    }
  };

  const getBorderColor = () => {
    if (status === 'available') {
      return selected ? 'white' : '#45bf55';
    }
    return null;
  };

  const canClick = status === 'available';

  return (
    <Group
      x={x}
      y={y}
      onClick={canClick ? onClick : null}
      cursor={canClick ? 'pointer' : 'not-allowed'}
    >
      <Rect
        width={officeLayout.seatSize}
        height={officeLayout.seatSize}
        fill={getColor()}
        stroke={getBorderColor()}
        strokeWidth={2}
        cornerRadius={5}
        shadowColor="rgba(0,0,0,0.2)"
        shadowBlur={selected ? 10 : 0}
        shadowOffsetY={selected ? 5 : 0}
      />
      <Text
        text={id}
        width={officeLayout.seatSize}
        height={officeLayout.seatSize}
        align="center"
        verticalAlign="middle"
        fontSize={14}
        fontStyle="bold"
        fill={selected ? 'white' : '#333'}
      />
    </Group>
  );
};

// Component chính - Bản đồ chỗ ngồi
const SeatMap = ({ seats, onSelectSeat, selectedSeatId, floorMap }) => {
  // Tính toán vị trí các chỗ ngồi theo bố cục
  const getPositionForSeat = (index) => {
    const rowSize = 4; // Số chỗ ngồi mỗi hàng
    const row = Math.floor(index / rowSize);
    const col = index % rowSize;
    const spacing = officeLayout.seatSize + 20;
    
    return {
      x: officeLayout.padding + col * spacing,
      y: officeLayout.padding + row * spacing
    };
  };
  
  return (
    <MapContainer>
      <Stage width={officeLayout.width} height={officeLayout.height}>
        <Layer>
          {/* Nếu có hình ảnh bản đồ, hiển thị ở đây */}
          {floorMap && (
            <Image
              image={floorMap}
              width={officeLayout.width}
              height={officeLayout.height}
              opacity={0.3}
            />
          )}
          
          {/* Hiển thị các chỗ ngồi */}
          {seats.map((seat, index) => {
            const position = getPositionForSeat(index);
            return (
              <Seat
                key={seat.id}
                x={position.x}
                y={position.y}
                id={seat.name}
                status={seat.available ? 'available' : 'occupied'}
                selected={selectedSeatId === seat.id}
                onClick={() => onSelectSeat(seat)}
              />
            );
          })}
        </Layer>
      </Stage>
      
      <Legend>
        <LegendItem>
          <LegendBox color="#f5f5f5" border="#45bf55" />
          <span>Available</span>
        </LegendItem>
        <LegendItem>
          <LegendBox color="#e74c3c" />
          <span>Occupied</span>
        </LegendItem>
        <LegendItem>
          <LegendBox color="#3498db" />
          <span>Reserved</span>
        </LegendItem>
        <LegendItem>
          <LegendBox color="#45bf55" />
          <span>Selected</span>
        </LegendItem>
      </Legend>
    </MapContainer>
  );
};

export default SeatMap;