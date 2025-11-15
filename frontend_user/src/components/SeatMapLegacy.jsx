import React from 'react';
import styled from 'styled-components';
import { useBooking } from '../contexts/BookingContext';

const SeatMapContainer = styled.div`
  margin: 2rem auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 600px;
`;

const SeatGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin: 2rem 0;
`;

const Seat = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 1.1rem;
  cursor: ${props => props.available ? 'pointer' : 'not-allowed'};
  transition: all 0.2s ease;
  background-color: ${props => {
    if (props.selected) return '#45bf55';
    if (!props.available) return '#ff4444'; // Màu đỏ cho occupied seats
    if (props.reserved) return '#3498db';
    return '#f5f5f5';
  }};
  color: ${props => props.selected || !props.available ? 'white' : '#333'};
  border: 2px solid ${props => props.selected ? '#45bf55' : props.available ? '#ddd' : 'transparent'};
  box-shadow: ${props => props.selected ? '0 4px 8px rgba(0,0,0,0.1)' : 'none'};

  &:hover {
    transform: ${props => props.available ? 'translateY(-2px)' : 'none'};
    box-shadow: ${props => props.available ? '0 4px 8px rgba(0,0,0,0.1)' : 'none'};
    border-color: ${props => props.available && !props.selected ? '#45bf55' : props.selected ? '#45bf55' : 'transparent'};
  }
`;

const Legend = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #555;
`;

const LegendColor = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 3px;
  background-color: ${props => props.color};
  border: ${props => props.border ? `1px solid ${props.border}` : 'none'};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #666;
`;

const SeatMapLegacy = ({ seats, selectedSeatId, onSelectSeat }) => {
  const { loading, isSeatOccupied, occupiedSeats } = useBooking();
  
  // Debug info
  React.useEffect(() => {
    console.log('🗺️ SeatMapLegacy render:', {
      seatsCount: seats?.length || 0,
      occupiedSeatsCount: occupiedSeats?.length || 0,
      loading,
      selectedSeatId
    });
  }, [seats, occupiedSeats, loading, selectedSeatId]);

  if (loading) {
    return (
      <SeatMapContainer>
        <LoadingContainer>Loading seat availability...</LoadingContainer>
      </SeatMapContainer>
    );
  }

  return (
    <SeatMapContainer>
      <SeatGridContainer>
        {seats.map(seat => {
          const isOccupied = isSeatOccupied(seat.id);
          const seatAvailable = !isOccupied; // Only use API data, ignore sample data
          
          console.log(`💺 Seat ${seat.id}: occupied=${isOccupied}, available=${seatAvailable}`);
          
          return (
            <Seat
              key={seat.id}
              available={seatAvailable}
              selected={selectedSeatId === seat.id}
              reserved={false} // Remove reserved logic for now
              onClick={() => seatAvailable && onSelectSeat(seat)}
            >
              {seat.name}
            </Seat>
          );
        })}
      </SeatGridContainer>
      
      <Legend>
        <LegendItem>
          <LegendColor color="#f5f5f5" border="#ddd" />
          <span>Available</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#ff4444" />
          <span>Occupied</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#3498db" />
          <span>Reserved</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#45bf55" />
          <span>Selected</span>
        </LegendItem>
      </Legend>
    </SeatMapContainer>
  );
};

export default SeatMapLegacy;