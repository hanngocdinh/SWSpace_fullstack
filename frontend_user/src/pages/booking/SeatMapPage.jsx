import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useBooking } from '../../contexts/BookingContext';
import SeatMap from '../../components/SeatMap';
import SeatMapLegacy from '../../components/SeatMapLegacy';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  padding-top: 80px; /* Space for fixed header */
`;

const SectionContainer = styled.section`
  max-width: 1000px;
  margin: 0 auto;
  padding: 3rem 2rem;
`;

const BookingHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const BookingTitle = styled.h2`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
`;

const BookingSubtitle = styled.p`
  font-size: 1.2rem;
  color: #555;
`;

const StepsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 3rem;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background-color: #e0e0e0;
    z-index: 1;
    transform: translateY(-50%);
  }
`;

const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
`;

const StepCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.active ? '#45bf55' : '#e0e0e0'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const StepLabel = styled.div`
  font-size: 0.9rem;
  color: ${props => props.active ? '#333' : '#999'};
  text-align: center;
`;

const SeatMapContainer = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin: 2rem auto;
`;

const SeatSelectionInfo = styled.div`
  margin-bottom: 2rem;
`;

const InfoRow = styled.div`
  display: flex;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: #333;
`;

const InfoLabel = styled.div`
  font-weight: 500;
  width: 150px;
`;

const InfoValue = styled.div`
  flex: 1;
`;

const MapContainer = styled.div`
  margin: 2rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MapTitle = styled.h3`
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const FloorButtonsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const FloorButton = styled.button`
  padding: 0.5rem 1.5rem;
  background-color: ${props => props.active ? '#45bf55' : '#f5f5f5'};
  color: ${props => props.active ? 'white' : '#333'};
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background-color: ${props => props.active ? '#38a046' : '#e0e0e0'};
    transform: translateY(-2px);
  }
`;

const RefreshButton = styled.button`
  padding: 0.5rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background-color: #0056b3;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const ActionContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
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
`;

const SeatMapPage = () => {
  const { bookingState, selectSeat, fetchOccupiedSeats, forceRefreshOccupiedSeats, loading } = useBooking();
  const navigate = useNavigate();
  const [currentFloor, setCurrentFloor] = useState(1);
  
  // Redirect if previous steps are not completed
  if (!bookingState.serviceType || !bookingState.packageDuration || !bookingState.date) {
    navigate('/booking/service');
    return null;
  }

  // Load occupied seats when component mounts or booking state changes
  useEffect(() => {
    if (bookingState.serviceType && bookingState.date) {
      console.log('🔄 SeatMapPage: Fetching occupied seats for', bookingState.serviceType, bookingState.date);
      fetchOccupiedSeats(
        bookingState.serviceType,
        bookingState.date,
        bookingState.time,
        bookingState.endTime
      );
    }
  }, [bookingState.serviceType, bookingState.date, bookingState.time, bookingState.endTime, fetchOccupiedSeats]);
  
  // Force refresh occupied seats when component mounts
  useEffect(() => {
    if (bookingState.serviceType && bookingState.date) {
      console.log('🔄 SeatMapPage: Force refresh on mount');
      const timer = setTimeout(() => {
        fetchOccupiedSeats(
          bookingState.serviceType,
          bookingState.date,
          bookingState.time,
          bookingState.endTime
        );
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []); // Empty dependency to run only on mount
  
  // Map seat data based on the package type
  const getPackageTypeFromBookingState = () => {
    // Map packageDuration to packageType for backward compatibility
    if (bookingState.serviceType === 'hot-desk') {
      return 'hot-desk';
    } else {
      return 'fixed-desk';
    }
  };
  
  const packageType = getPackageTypeFromBookingState();
  const seatsForPackage = bookingState.seats[packageType] || [];
  
  // Divide seats by floor
  const floorSeats = {
    1: seatsForPackage.filter(seat => seat.name.startsWith('A') || seat.name.startsWith('B')),
    2: seatsForPackage.filter(seat => seat.name.startsWith('C') || seat.name.startsWith('D'))
  };
  
  const currentFloorSeats = floorSeats[currentFloor] || [];
  
  const handleSeatSelect = (seat) => {
    if (seat.available) {
      selectSeat(seat);
    }
  };
  
  const handleNextStep = () => {
    navigate('/booking/confirmation');
  };
  
  const handleBackStep = () => {
    navigate('/booking/date');
  };
  
  const handleFloorChange = (floor) => {
    setCurrentFloor(floor);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };

  return (
    <PageContainer>
      <Header />
      <MainContent>
        <SectionContainer>
          <BookingHeader>
            <BookingTitle>Select Your Seat</BookingTitle>
            <BookingSubtitle>Choose your preferred workspace location</BookingSubtitle>
          </BookingHeader>
          
          <StepsContainer>
            <Step>
              <StepCircle active={true}>1</StepCircle>
              <StepLabel active={true}>Service</StepLabel>
            </Step>
            <Step>
              <StepCircle active={true}>2</StepCircle>
              <StepLabel active={true}>Package</StepLabel>
            </Step>
            <Step>
              <StepCircle active={true}>3</StepCircle>
              <StepLabel active={true}>Date</StepLabel>
            </Step>
            <Step>
              <StepCircle active={true}>4</StepCircle>
              <StepLabel active={true}>Seat</StepLabel>
            </Step>
            <Step>
              <StepCircle active={false}>5</StepCircle>
              <StepLabel active={false}>Booking</StepLabel>
            </Step>
          </StepsContainer>
          
          <SeatMapContainer>
            <SeatSelectionInfo>
              <InfoRow>
                <InfoLabel>Service Type:</InfoLabel>
                <InfoValue>{bookingState.serviceType === 'freelancer' ? 'Freelancer' : 'Team'}</InfoValue>
              </InfoRow>
              
              <InfoRow>
                <InfoLabel>Package:</InfoLabel>
                <InfoValue>
                  {bookingState.packageType === 'hot-desk' ? 'Hot Desk' : 'Fixed Desk'}
                </InfoValue>
              </InfoRow>
              
              <InfoRow>
                <InfoLabel>Start Date:</InfoLabel>
                <InfoValue>{formatDate(bookingState.date)}</InfoValue>
              </InfoRow>
              
              <InfoRow>
                <InfoLabel>Start Time:</InfoLabel>
                <InfoValue>{bookingState.time || 'N/A'}</InfoValue>
              </InfoRow>
              
              <InfoRow>
                <InfoLabel>End Date:</InfoLabel>
                <InfoValue>{bookingState.endDate ? formatDate(bookingState.endDate) : 'N/A'}</InfoValue>
              </InfoRow>
              
              <InfoRow>
                <InfoLabel>End Time:</InfoLabel>
                <InfoValue>{bookingState.endTime || 'N/A'}</InfoValue>
              </InfoRow>
            </SeatSelectionInfo>
            
            <MapContainer>
              <MapTitle>Select a seat from the available options below</MapTitle>
              
              <FloorButtonsContainer>
                <FloorButton 
                  active={currentFloor === 1} 
                  onClick={() => handleFloorChange(1)}
                >
                  Floor 1
                </FloorButton>
                <FloorButton 
                  active={currentFloor === 2} 
                  onClick={() => handleFloorChange(2)}
                >
                  Floor 2
                </FloorButton>
                <RefreshButton 
                  onClick={forceRefreshOccupiedSeats}
                  disabled={loading}
                >
                  {loading ? 'Refreshing...' : 'Refresh Seats'}
                </RefreshButton>
              </FloorButtonsContainer>
              
              {/* Sử dụng SeatMapLegacy để hiển thị giống với thiết kế gốc */}
              <SeatMapLegacy
                seats={currentFloorSeats}
                onSelectSeat={handleSeatSelect}
                selectedSeatId={bookingState.selectedSeat?.id}
              />
            </MapContainer>
            
            <ActionContainer>
              <BackButton onClick={handleBackStep}>
                Back
              </BackButton>
              <NextButton 
                disabled={!bookingState.selectedSeat}
                onClick={handleNextStep}
              >
                Next Step
              </NextButton>
            </ActionContainer>
          </SeatMapContainer>
        </SectionContainer>
      </MainContent>
      <Footer />
    </PageContainer>
  );
};

export default SeatMapPage;