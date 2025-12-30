import React, { useState, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage, Group } from 'react-konva';
import styled from 'styled-components';

const MapWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const FloorMap = ({ seats, selectedSeatId, onSelectSeat }) => {
  const [floorPlanImage, setFloorPlanImage] = useState(null);

  // Tải hình ảnh bản đồ
  useEffect(() => {
    const image = new window.Image();
    image.src = 'https://i.ibb.co/9vtDnDL/office-floor-plan.png'; // Thay bằng URL thực tế
    image.onload = () => {
      setFloorPlanImage(image);
    };
  }, []);

  // Kích thước bản đồ
  const stageWidth = 800;
  const stageHeight = 600;

  // Vị trí của các chỗ ngồi - thêm nhiều chỗ ngồi hơn để phù hợp với giao diện đã chia sẻ
  const seatPositions = {
    // Hàng A - Top row
    'A1': { x: 100, y: 100 },
    'A2': { x: 170, y: 100 },
    'A3': { x: 240, y: 100 },
    'A4': { x: 310, y: 100 },
    'A5': { x: 380, y: 100 },
    'A6': { x: 450, y: 100 },
    'A7': { x: 520, y: 100 },
    'A8': { x: 590, y: 100 },
    
    // Hàng B - Second row
    'B1': { x: 100, y: 170 },
    'B2': { x: 170, y: 170 },
    'B3': { x: 240, y: 170 },
    'B4': { x: 310, y: 170 },
    'B5': { x: 380, y: 170 },
    'B6': { x: 450, y: 170 },
    'B7': { x: 520, y: 170 },
    'B8': { x: 590, y: 170 },
    
    // Hàng C - Third row
    'C1': { x: 100, y: 280 },
    'C2': { x: 170, y: 280 },
    'C3': { x: 240, y: 280 },
    'C4': { x: 310, y: 280 },
    'C5': { x: 380, y: 280 },
    'C6': { x: 450, y: 280 },
    'C7': { x: 520, y: 280 },
    'C8': { x: 590, y: 280 },
    
    // Hàng D - Bottom row
    'D1': { x: 100, y: 350 },
    'D2': { x: 170, y: 350 },
    'D3': { x: 240, y: 350 },
    'D4': { x: 310, y: 350 },
    'D5': { x: 380, y: 350 },
    'D6': { x: 450, y: 350 },
    'D7': { x: 520, y: 350 },
    'D8': { x: 590, y: 350 },
  };

  // Định nghĩa màu sắc cho từng trạng thái ghế
  const getSeatColor = (seat) => {
    if (seat.id === selectedSeatId) return '#45bf55';
    if (!seat.available) return '#e74c3c';
    return '#f5f5f5';
  };

  const getSeatBorderColor = (seat) => {
    if (seat.id === selectedSeatId) return '#2e7d32';
    if (!seat.available) return '#c0392b';
    return '#bbb';
  };

  const getSeatTextColor = (seat) => {
    if (seat.id === selectedSeatId || !seat.available) return '#fff';
    return '#333';
  };

  return (
    <MapWrapper>
      <Stage width={stageWidth} height={stageHeight}>
        <Layer>
          {floorPlanImage && (
            <KonvaImage
              image={floorPlanImage}
              width={stageWidth}
              height={stageHeight}
              opacity={0.7}
            />
          )}
          
          {/* Hiển thị các chỗ ngồi */}
          {seats.map((seat) => {
            const position = seatPositions[seat.name];
            if (!position) return null;

            return (
              <Group 
                key={seat.id}
                x={position.x}
                y={position.y}
                onClick={() => seat.available && onSelectSeat(seat)}
                onTap={() => seat.available && onSelectSeat(seat)}
                cursor={seat.available ? 'pointer' : 'not-allowed'}
              >
                <Rect
                  width={60}
                  height={60}
                  fill={getSeatColor(seat)}
                  stroke={getSeatBorderColor(seat)}
                  strokeWidth={2}
                  cornerRadius={6}
                  shadowColor="rgba(0,0,0,0.3)"
                  shadowBlur={seat.id === selectedSeatId ? 8 : 0}
                  shadowOffset={{ x: 0, y: 3 }}
                  shadowOpacity={0.3}
                />
                <Text
                  text={seat.name}
                  width={60}
                  height={60}
                  align="center"
                  verticalAlign="middle"
                  fill={getSeatTextColor(seat)}
                  fontSize={16}
                  fontStyle="bold"
                />
              </Group>
            );
          })}
          
          {/* Khu vực tiện ích */}
          <Group x={650} y={100}>
            <Rect
              width={120}
              height={100}
              fill="#e3f2fd"
              stroke="#90caf9"
              strokeWidth={1}
              cornerRadius={5}
            />
            <Text
              text="Meeting Room"
              width={120}
              height={100}
              align="center"
              verticalAlign="middle"
              fill="#1976d2"
              fontSize={14}
            />
          </Group>
          
          <Group x={100} y={420}>
            <Rect
              width={120}
              height={60}
              fill="#f3e5f5"
              stroke="#ce93d8"
              strokeWidth={1}
              cornerRadius={5}
            />
            <Text
              text="Break Area"
              width={120}
              height={60}
              align="center"
              verticalAlign="middle"
              fill="#7b1fa2"
              fontSize={14}
            />
          </Group>
          
          <Group x={400} y={420}>
            <Rect
              width={150}
              height={60}
              fill="#fff3e0"
              stroke="#ffcc80"
              strokeWidth={1}
              cornerRadius={5}
            />
            <Text
              text="Reception"
              width={150}
              height={60}
              align="center"
              verticalAlign="middle"
              fill="#ef6c00"
              fontSize={14}
            />
          </Group>
          
          <Group x={350} y={480}>
            <Rect
              width={100}
              height={20}
              fill="#ddd"
              stroke="#bbb"
              strokeWidth={1}
            />
            <Text
              text="Entrance"
              width={100}
              height={20}
              align="center"
              verticalAlign="middle"
              fill="#555"
              fontSize={10}
            />
          </Group>
        </Layer>
      </Stage>
    </MapWrapper>
  );
};

export default FloorMap;