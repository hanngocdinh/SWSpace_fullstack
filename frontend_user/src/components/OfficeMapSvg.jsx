import React from 'react';
import styled from 'styled-components';

// Tạo một bản đồ chỗ ngồi giả với khu vực văn phòng
const OfficeMapSvg = ({ seats, selectedSeatId, onSelectSeat }) => {
  // Hàm xác định màu sắc của chỗ ngồi dựa trên trạng thái
  const getSeatColor = (seat) => {
    if (seat.id === selectedSeatId) return '#45bf55'; // Màu xanh lá cho chỗ ngồi được chọn
    if (!seat.available) return '#f77'; // Màu đỏ cho chỗ ngồi đã bị chiếm
    if (seat.id.startsWith('B') && !seat.available) return '#3498db'; // Màu xanh dương cho chỗ ngồi đã được đặt trước
    return '#f5f5f5'; // Màu xám nhạt cho chỗ ngồi còn trống
  };

  const getSeatTextColor = (seat) => {
    if (seat.id === selectedSeatId) return '#ffffff';
    return '#333333';
  };

  // Vị trí của các chỗ ngồi trên bản đồ
  const seatPositions = {
    'A1': { x: 70, y: 100 },
    'A2': { x: 130, y: 100 },
    'A3': { x: 190, y: 100 },
    'A4': { x: 250, y: 100 },
    'B1': { x: 70, y: 180 },
    'B2': { x: 130, y: 180 },
    'B3': { x: 190, y: 180 },
    'B4': { x: 250, y: 180 },
    'C1': { x: 70, y: 260 },
    'C2': { x: 130, y: 260 },
    'C3': { x: 190, y: 260 },
    'C4': { x: 250, y: 260 },
    'D1': { x: 370, y: 100 },
    'D2': { x: 430, y: 100 },
    'D3': { x: 490, y: 100 },
    'D4': { x: 550, y: 100 },
    'E1': { x: 370, y: 180 },
    'E2': { x: 430, y: 180 },
    'E3': { x: 490, y: 180 },
    'E4': { x: 550, y: 180 },
  };

  return (
    <svg width="650" height="400" viewBox="0 0 650 400" style={{ background: '#fafafa', borderRadius: '8px' }}>
      {/* Vẽ tường và cửa */}
      <rect x="20" y="20" width="610" height="360" fill="#fff" stroke="#ccc" strokeWidth="2" />
      
      {/* Phòng họp */}
      <rect x="450" y="250" width="150" height="100" fill="#e9f5ff" stroke="#ccc" strokeWidth="1" />
      <text x="525" y="300" textAnchor="middle" fill="#666" fontSize="12">Meeting Room</text>
      
      {/* Khu vực nghỉ ngơi */}
      <rect x="40" y="320" width="150" height="40" fill="#f9f0ff" stroke="#ccc" strokeWidth="1" />
      <text x="115" y="345" textAnchor="middle" fill="#666" fontSize="12">Break Area</text>
      
      {/* Bàn tiếp tân */}
      <rect x="300" y="320" width="120" height="40" fill="#fff0e9" stroke="#ccc" strokeWidth="1" />
      <text x="360" y="345" textAnchor="middle" fill="#666" fontSize="12">Reception</text>
      
      {/* Cửa vào */}
      <rect x="340" y="360" width="40" height="10" fill="#ddd" stroke="#999" strokeWidth="1" />
      <text x="360" y="380" textAnchor="middle" fill="#666" fontSize="10">Entrance</text>
      
      {/* Vẽ các chỗ ngồi */}
      {seats.map((seat) => {
        const position = seatPositions[seat.name];
        if (!position) return null;
        
        return (
          <g key={seat.id} onClick={() => seat.available && onSelectSeat(seat)} style={{ cursor: seat.available ? 'pointer' : 'not-allowed' }}>
            <rect
              x={position.x - 25}
              y={position.y - 25}
              width="50"
              height="50"
              rx="5"
              fill={getSeatColor(seat)}
              stroke={seat.id === selectedSeatId ? '#333' : '#ddd'}
              strokeWidth={seat.id === selectedSeatId ? 2 : 1}
            />
            <text
              x={position.x}
              y={position.y + 5}
              textAnchor="middle"
              fill={getSeatTextColor(seat)}
              fontSize="14"
              fontWeight="bold"
            >
              {seat.name}
            </text>
          </g>
        );
      })}
      
      {/* Chú thích và hướng dẫn */}
      <text x="40" y="50" fill="#333" fontSize="14" fontWeight="bold">Floor 1 Seating Map</text>
      <text x="40" y="70" fill="#666" fontSize="12">Click on an available seat to select it</text>
      
      {/* Chú thích màu sắc */}
      <rect x="450" y="40" width="15" height="15" fill="#f5f5f5" stroke="#ddd" strokeWidth="1" />
      <text x="475" y="53" fill="#666" fontSize="12" textAnchor="start">Available</text>
      
      <rect x="450" y="65" width="15" height="15" fill="#f77" stroke="#ddd" strokeWidth="1" />
      <text x="475" y="78" fill="#666" fontSize="12" textAnchor="start">Occupied</text>
      
      <rect x="450" y="90" width="15" height="15" fill="#3498db" stroke="#ddd" strokeWidth="1" />
      <text x="475" y="103" fill="#666" fontSize="12" textAnchor="start">Reserved</text>
      
      <rect x="450" y="115" width="15" height="15" fill="#45bf55" stroke="#333" strokeWidth="1" />
      <text x="475" y="128" fill="#666" fontSize="12" textAnchor="start">Selected</text>
    </svg>
  );
};

export default OfficeMapSvg;