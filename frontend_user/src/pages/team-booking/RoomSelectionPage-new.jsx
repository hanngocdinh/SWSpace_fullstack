import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

const Container = styled.div`
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
`;

const BackButton = styled.button`
  position: absolute;
  top: 2rem;
  left: 2rem;
  padding: 0.8rem 1.5rem;
  background: white;
  border: 2px solid #45bf55;
  border-radius: 8px;
  color: #45bf55;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;

  &:hover {
    background: #45bf55;
    color: white;
    transform: translateY(-2px);
  }
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  padding-top: 4rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;

  span {
    color: #45bf55;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #7f8c8d;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const LoadingMessage = styled.div`
  text-align: center;
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-top: 3rem;
`;

const ErrorMessage = styled.div`
  background: #ff6b6b;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin: 2rem auto;
  max-width: 500px;
`;

const RoomSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rooms, setRooms] = useState([]);

  const selectedService = location.state?.selectedService;
  const selectedPackage = location.state?.selectedPackage;
  const selectedDate = location.state?.selectedDate;

  useEffect(() => {
    if (!selectedService || !selectedPackage || !selectedDate) {
      navigate('/team-booking');
      return;
    }
    fetchAvailableRooms();
  }, [selectedService, selectedPackage, selectedDate]);

  const fetchAvailableRooms = async () => {
    setLoading(true);
    setError('');
    
    try {
      const startDate = selectedDate.toISOString();
      let endDate = new Date(selectedDate);
      
      // Calculate end date based on package duration
      if (selectedPackage.duration.unit === 'hours') {
        endDate.setHours(endDate.getHours() + selectedPackage.duration.value);
      } else if (selectedPackage.duration.unit === 'days') {
        endDate.setDate(endDate.getDate() + selectedPackage.duration.value);
      } else if (selectedPackage.duration.unit === 'months') {
        endDate.setMonth(endDate.getMonth() + selectedPackage.duration.value);
      } else if (selectedPackage.duration.unit === 'years') {
        endDate.setFullYear(endDate.getFullYear() + selectedPackage.duration.value);
      }

      const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(
        `${base}/api/team/services/${encodeURIComponent(selectedService.name)}/rooms/available?startDate=${startDate}&endDate=${endDate.toISOString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch available rooms');
      }

      const data = await response.json();
      if (data.success) {
        setRooms(data.data);
      } else {
        setError(data.message || 'Failed to load available rooms');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError('Failed to load available rooms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSelect = (room) => {
    navigate('/team-booking/payment', {
      state: {
        selectedService,
        selectedPackage,
        selectedDate,
        selectedRoom: room
      }
    });
  };

  if (!selectedService || !selectedPackage || !selectedDate) {
    return (
      <>
        <Header />
        <Container>
          <ErrorMessage>Missing booking information. Please start over.</ErrorMessage>
        </Container>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <Container>
          <LoadingMessage>Loading available rooms...</LoadingMessage>
        </Container>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <Container>
          <ErrorMessage>{error}</ErrorMessage>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Container>
        <BackButton onClick={() => navigate(-1)}>
          ← Back to Date Selection
        </BackButton>
        
        <HeaderSection>
          <Title>Select Your <span>Room</span></Title>
          <Subtitle>
            Choose from available {selectedService.name} rooms for {selectedDate.toLocaleDateString()}
          </Subtitle>
        </HeaderSection>

        {rooms.length === 0 ? (
          <ErrorMessage>
            No rooms available for the selected date and time. Please choose a different date.
          </ErrorMessage>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
            {rooms.map((room) => (
              <div 
                key={room._id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => handleRoomSelect(room)}
              >
                <h3 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>{room.name}</h3>
                <p style={{ color: '#7f8c8d', fontSize: '0.9rem', marginBottom: '1rem' }}>Room {room.roomNumber} • Floor {room.floor}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ color: '#45bf55', fontWeight: '600' }}>Capacity: {room.capacity} people</span>
                  <span style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>{room.area}m²</span>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  {room.amenities.slice(0, 3).map((amenity, index) => (
                    <span key={index} style={{ 
                      display: 'inline-block', 
                      background: '#f8f9fa', 
                      padding: '0.25rem 0.5rem', 
                      margin: '0.25rem 0.25rem 0.25rem 0', 
                      borderRadius: '4px', 
                      fontSize: '0.8rem',
                      color: '#6c757d'
                    }}>
                      {amenity.name}
                    </span>
                  ))}
                </div>
                <button style={{
                  width: '100%',
                  padding: '0.8rem',
                  background: '#45bf55',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}>
                  Select This Room
                </button>
              </div>
            ))}
          </div>
        )}
      </Container>
      <Footer />
    </>
  );
};

export default RoomSelectionPage;