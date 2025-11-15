import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import TeamBookingProgress from '../../components/TeamBookingProgress';

const Container = styled.div`
  min-height: 100vh;
  padding: 6rem 2rem 3rem;
  background: #f8f9fa;
`;

const BookingFormContainer = styled.div`
  max-width: 1100px;
  margin: 1.5rem auto 0;
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  padding-top: 0;
`;

const BackButton = styled.button`
  position: absolute;
  top: 2rem;
  left: 2rem;
  background: white;
  border: 2px solid #45bf55;
  color: #45bf55;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background: #45bf55;
    color: white;
  }
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 2rem;
  font-weight: 700;
  text-align: center;
  
  span {
    color: #27ae60;
  }
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Title = styled.h2`
  font-size: 1.5rem;
  color: #021526;
  margin-bottom: 1rem;
  font-weight: 600;
  
  span {
    color: #27ae60;
  }
`;

const BookingInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid #e9ecef;
`;

const InfoCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
  font-size: 0.9rem;
`;

const InfoLabel = styled.span`
  color: #6c757d;
  font-size: 0.95rem;
  font-weight: 500;
  min-width: 120px;
`;

const InfoValue = styled.span`
  color: #021526;
  font-weight: 500;
  flex: 1;
  text-align: right;
`;

const RoomsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const RoomCard = styled.div`
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 3px solid transparent;
  
  ${props => props.selected && `
    border-color: #45bf55;
    transform: scale(1.02);
  `}
  
  &:hover {
    transform: translateY(-5px) ${props => props.selected ? 'scale(1.02)' : ''};
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }
`;

const RoomImage = styled.div`
  height: 200px;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  position: relative;
`;

const RoomContent = styled.div`
  padding: 1.5rem;
`;

const RoomHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const RoomName = styled.h3`
  font-size: 1.3rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
`;

const RoomNumber = styled.span`
  background: #45bf55;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
`;

const RoomDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const DetailItem = styled.div`
  text-align: center;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 8px;
`;

const DetailLabel = styled.div`
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-bottom: 0.25rem;
`;

const DetailValue = styled.div`
  font-weight: 600;
  color: #2c3e50;
`;

const FeaturesList = styled.div`
  margin-bottom: 1rem;
`;

const FeatureItem = styled.span`
  display: inline-block;
  background: #e8f5e8;
  color: #27ae60;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  margin: 0.25rem 0.25rem 0.25rem 0;
`;

const AmenitiesList = styled.div`
  margin-bottom: 1.5rem;
`;

const AmenityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-size: 0.9rem;
`;

const SelectButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: ${props => props.selected 
    ? 'linear-gradient(135deg, #27ae60 0%, #229954 100%)' 
    : 'linear-gradient(135deg, #45bf55 0%, #38a046 100%)'
  };
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(69, 191, 85, 0.3);
  }
`;

const ContinueSection = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e9ecef;
  text-align: center;
`;

const SelectedRoomInfo = styled.div`
  margin-bottom: 1rem;
  
  p {
    font-size: 0.9rem;
    color: #6c757d;
    margin-top: 0.25rem;
  }
`;

const SelectedRoomName = styled.h3`
  color: #27ae60;
  margin-bottom: 0.25rem;
  font-size: 1.1rem;
  font-weight: 600;
`;

const PriceInfo = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const PriceLabel = styled.div`
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
`;

const FinalPrice = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #27ae60;
`;

const ContinueButton = styled.button`
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(39, 174, 96, 0.4);
  }
  
  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #45bf55;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: #e74c3c;
  font-size: 1.1rem;
  padding: 2rem;
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: #7f8c8d;
  font-size: 1.1rem;
  padding: 3rem;
  background: white;
  border-radius: 15px;
  margin: 2rem auto;
  max-width: 600px;
`;

const MapContainer = styled.div`
  margin: 0 auto 1.5rem;
`;

const MapImageWrapper = styled.div`
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(2, 21, 38, 0.08);
  background: #f8f9fa;
  padding: 0.75rem;
  
  img {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 8px;
  }
`;

const LegendContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #495057;
  
  span:first-child {
    width: 20px;
    height: 20px;
    border-radius: 6px;
    display: inline-block;
  }
`;

const RoomButtonsGrid = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 1.25rem;
  flex-wrap: wrap;
`;

const RoomButton = styled.button`
  min-width: 140px;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  border: 2px solid ${props => props.selected ? '#27ae60' : '#e5e7eb'};
  background: ${props => props.selected ? 'linear-gradient(180deg, rgba(39,174,96,0.08), rgba(39,174,96,0.04))' : 'white'};
  color: #021526;
  box-shadow: ${props => props.selected ? '0 8px 24px rgba(39,174,96,0.25)' : '0 4px 12px rgba(2,21,38,0.08)'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-weight: 700;
  letter-spacing: 0.3px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform: ${props => props.selected ? 'translateY(-3px) scale(1.03)' : 'translateY(0)'};
  opacity: ${props => props.disabled ? 0.6 : 1};
  position: relative;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px) ${props => props.selected ? 'scale(1.03)' : 'scale(1.01)'};
    box-shadow: ${props => props.selected ? '0 12px 28px rgba(39,174,96,0.3)' : '0 6px 18px rgba(2,21,38,0.12)'};
    border-color: ${props => props.selected ? '#27ae60' : '#cbd5e0'};
  }
  
  &:active:not(:disabled) {
    transform: translateY(-1px) scale(0.98);
  }
`;

const RoomButtonContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  
  .room-code {
    font-size: 1.125rem;
    font-weight: 700;
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => props.status === 'Maintenance' ? '#c0392b' : '#1f6feb'};
  background: ${props => props.status === 'Maintenance' ? 'rgba(192,57,43,0.12)' : 'rgba(31,111,235,0.12)'};
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  
  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${props => props.status === 'Maintenance' ? '#e74c3c' : '#3498db'};
  }
`;

const RoomCapacity = styled.div`
  font-size: 0.8125rem;
  opacity: 0.65;
  margin-top: 0.5rem;
  font-weight: 500;
`;

const RoomSelectionPage = () => {
  const [rooms, setRooms] = useState([]);
  const [statusMap, setStatusMap] = useState({}); // { M1: 'Available' | 'Occupied' | 'Maintenance' }
  const [infoMsg, setInfoMsg] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const { selectedService, selectedPackage, customHours, startDate, endDate, startTime, endTime } = location.state || {};

  useEffect(() => {
    if (!selectedService || !selectedPackage) {
      navigate('/team-booking');
      return;
    }
    fetchAvailableRooms();
    // start polling statuses for meeting/private/networking
    let timer;
    if (selectedService?.name === 'Meeting Room' || selectedService?.name === 'Private Office' || selectedService?.name === 'Networking Space'){
      const fetchStatuses = async () => {
        try {
          const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
          const svc = selectedService.name === 'Meeting Room' ? 'meeting_room' : (selectedService.name === 'Private Office' ? 'private_office' : 'networking');
          const res = await fetch(`${base}/api/team/services/${svc}/rooms/status`);
          const data = await res.json();
          if (data?.success && Array.isArray(data.data)){
            const map = {};
            data.data.forEach(r => { map[r.roomCode] = r.status; });
            setStatusMap(map);
            // if current selection becomes unavailable -> block
            if (selectedRoom && map[selectedRoom.roomNumber] && map[selectedRoom.roomNumber] !== 'Available'){
              setInfoMsg('This room just became unavailable. Please choose another room.');
            } else {
              setInfoMsg('');
            }
          }
        } catch {}
      };
      fetchStatuses();
      timer = setInterval(fetchStatuses, 5000);
    }
    return () => timer && clearInterval(timer);
  }, [selectedService, selectedPackage, startDate, endDate, navigate]);

  const fetchAvailableRooms = async () => {
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        startTime,
        endTime
      });

      const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${base}/api/team/services/${encodeURIComponent(selectedService.name)}/rooms/available?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Bad status ' + response.status);
      }
      const data = await response.json();
      
      if (data.success) {
        const list = Array.isArray(data.data) ? data.data : [];
        if (list.length === 0) {
          // Fallback tĩnh nếu API trả success nhưng chưa có data seed
          const fallbackRooms = [
            {
              _id: 'fallback-po-101',
              name: 'Private Office 101',
              roomNumber: '101',
              floor: 3,
              capacity: 6,
              area: 28,
              features: ['Natural Light','Quiet Zone','Ergonomic Chairs'],
              amenities: [{ name: 'Printer' }, { name: 'Coffee Machine' }, { name: 'Locker' }],
              images: [selectedService.image]
            },
            {
              _id: 'fallback-po-102',
              name: 'Private Office 102',
              roomNumber: '102',
              floor: 3,
              capacity: 8,
              area: 32,
              features: ['High-speed WiFi','Conference Corner','Secure Storage'],
              amenities: [{ name: 'Scanner' }, { name: 'Water Dispenser' }, { name: 'Air Purifier' }],
              images: [selectedService.image]
            },
            {
              _id: 'fallback-mr-A',
              name: 'Meeting Room A',
              roomNumber: 'A',
              floor: 2,
              capacity: 12,
              area: 24,
              features: ['Projector','Whiteboard','Sound System'],
              amenities: [{ name: 'HDMI Cable' }, { name: 'Speaker' }, { name: 'Marker Set' }],
              images: [selectedService.image]
            },
            {
              _id: 'fallback-mr-B',
              name: 'Meeting Room B',
              roomNumber: 'B',
              floor: 2,
              capacity: 8,
              area: 18,
              features: ['Whiteboard','HD Display','Video Conferencing'],
              amenities: [{ name: 'Remote Control' }, { name: 'USB Hub' }, { name: 'Extension Cord' }],
              images: [selectedService.image]
            },
            {
              _id: 'fallback-ns-Zone1',
              name: 'Networking Zone 1',
              roomNumber: 'NZ-1',
              floor: 1,
              capacity: 30,
              area: 60,
              features: ['Open Layout','Event Ready','Flexible Seating'],
              amenities: [{ name: 'Stage' }, { name: 'PA System' }, { name: 'Catering Area' }],
              images: [selectedService.image]
            },
            {
              _id: 'fallback-ns-Zone2',
              name: 'Networking Zone 2',
              roomNumber: 'NZ-2',
              floor: 1,
              capacity: 40,
              area: 75,
              features: ['Open Layout','Workshop Setup','Ambient Lighting'],
              amenities: [{ name: 'Mobile Screen' }, { name: 'Sound System' }, { name: 'Coffee Bar' }],
              images: [selectedService.image]
            }
          ];
          const svcName = (selectedService.name || '').toLowerCase();
          const filtered = fallbackRooms.filter(r => {
            if (svcName.includes('private')) return r.name.toLowerCase().includes('private office');
            if (svcName.includes('meeting')) return r.name.toLowerCase().includes('meeting room');
            if (svcName.includes('network')) return r.name.toLowerCase().includes('networking');
            return true;
          });
          setRooms(filtered);
        } else {
          setRooms(list);
        }
      } else {
        setError('Failed to load available rooms');
      }
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      // Fallback tĩnh nếu DB chưa seed TeamRoom
      const fallbackRooms = [
        {
          _id: 'fallback-po-101',
          name: 'Private Office 101',
          roomNumber: '101',
          floor: 3,
          capacity: 6,
          area: 28,
          features: ['Natural Light','Quiet Zone','Ergonomic Chairs'],
          amenities: [{ name: 'Printer' }, { name: 'Coffee Machine' }, { name: 'Locker' }],
          images: [selectedService.image]
        },
        {
          _id: 'fallback-po-102',
          name: 'Private Office 102',
          roomNumber: '102',
          floor: 3,
          capacity: 8,
          area: 32,
          features: ['High-speed WiFi','Conference Corner','Secure Storage'],
          amenities: [{ name: 'Scanner' }, { name: 'Water Dispenser' }, { name: 'Air Purifier' }],
          images: [selectedService.image]
        },
        {
          _id: 'fallback-mr-A',
          name: 'Meeting Room A',
          roomNumber: 'A',
          floor: 2,
          capacity: 12,
          area: 24,
          features: ['Projector','Whiteboard','Sound System'],
          amenities: [{ name: 'HDMI Cable' }, { name: 'Speaker' }, { name: 'Marker Set' }],
          images: [selectedService.image]
        },
        {
          _id: 'fallback-mr-B',
          name: 'Meeting Room B',
          roomNumber: 'B',
          floor: 2,
          capacity: 8,
          area: 18,
          features: ['Whiteboard','HD Display','Video Conferencing'],
          amenities: [{ name: 'Remote Control' }, { name: 'USB Hub' }, { name: 'Extension Cord' }],
          images: [selectedService.image]
        },
        {
          _id: 'fallback-ns-Zone1',
          name: 'Networking Zone 1',
          roomNumber: 'NZ-1',
          floor: 1,
          capacity: 30,
          area: 60,
          features: ['Open Layout','Event Ready','Flexible Seating'],
          amenities: [{ name: 'Stage' }, { name: 'PA System' }, { name: 'Catering Area' }],
          images: [selectedService.image]
        },
        {
          _id: 'fallback-ns-Zone2',
          name: 'Networking Zone 2',
          roomNumber: 'NZ-2',
          floor: 1,
          capacity: 40,
          area: 75,
          features: ['Open Layout','Workshop Setup','Ambient Lighting'],
          amenities: [{ name: 'Mobile Screen' }, { name: 'Sound System' }, { name: 'Coffee Bar' }],
          images: [selectedService.image]
        }
      ];
      setRooms(fallbackRooms.filter(r => r.name.toLowerCase().includes(selectedService.name.split(' ')[0].toLowerCase()) || selectedService.name === 'Networking Space'));
      setError(null);
      setLoading(false);
      return;
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const calculateFinalPrice = () => {
    const pct = (selectedPackage.discountPct ?? selectedPackage.discount?.percentage ?? 0) || 0;
    if (selectedPackage.isCustom && customHours) {
      const base = (selectedPackage.pricePerUnit || 0) * customHours;
      return Math.round(base * (1 - pct / 100));
    }
    const base = selectedPackage.price || 0;
    return Math.round(base * (1 - pct / 100));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const handleRoomSelect = (room) => {
    // block selecting immediately if status says unavailable
    const st = statusMap?.[room.roomNumber];
    if (st && st !== 'Available'){
      setInfoMsg('This room is not available right now.');
      return;
    }
    setInfoMsg('');
    setSelectedRoom(room);
  };

  const handleContinue = async () => {
    if (!selectedRoom) return;

    // Final guard: re-check availability server-side to handle last-millisecond admin changes
    try {
      const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const svc = selectedService.name === 'Meeting Room' ? 'meeting_room' : (selectedService.name === 'Private Office' ? 'private_office' : 'networking');
      const params = new URLSearchParams({ startDate, endDate: endDate || startDate, startTime: startTime || '', endTime: endTime || '' });
      const res = await fetch(`${base}/api/team/services/${svc}/rooms/${encodeURIComponent(selectedRoom.roomNumber)}/availability?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error('availability-check-failed');
      if (!data.available){
        setInfoMsg('This room just became unavailable. Please choose another room.');
        return;
      }
    } catch (e){
      // If availability check failed unexpectedly, be safe and block with a friendly message
      setInfoMsg('Unable to verify availability right now. Please try again in a moment.');
      return;
    }

    navigate('/team-booking/payment', {
      state: {
        selectedService,
        selectedPackage,
        selectedRoom,
        customHours,
        startDate,
        endDate,
        startTime,
        endTime
      }
    });
  };

  if (!selectedService || !selectedPackage) {
    return null;
  }

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }

  return (
    <>
      <Header />
      <Container>
        <BackButton onClick={() => navigate('/team-booking/date', { 
          state: { selectedService, selectedPackage, customHours } 
        })}>
          ← Back to Date Selection
        </BackButton>
        
        <PageTitle>Select Your <span>Room</span></PageTitle>
        <TeamBookingProgress />
        
        <BookingFormContainer>
        <HeaderSection>
        
        <BookingInfo>
          <InfoCard>
            <InfoLabel>Service:</InfoLabel>
            <InfoValue>{selectedService.name}</InfoValue>
          </InfoCard>
          <InfoCard>
            <InfoLabel>Package:</InfoLabel>
            <InfoValue>{selectedPackage.name}</InfoValue>
          </InfoCard>
          <InfoCard>
            <InfoLabel>Date:</InfoLabel>
            <InfoValue>{formatDate(startDate)}</InfoValue>
          </InfoCard>
          <InfoCard>
            <InfoLabel>Time:</InfoLabel>
            <InfoValue>{startTime} - {endTime}</InfoValue>
          </InfoCard>
        </BookingInfo>
        </HeaderSection>

      {/* New layout for Meeting Room / Private Office with Floor 2 map; Networking Space with Floor 3 map */}
      {(selectedService.name === 'Meeting Room' || selectedService.name === 'Private Office') ? (
        <>
          <MapContainer>
            <MapImageWrapper>
              <img 
                src={'/images/floor2.png'} 
                alt="Floor 2"
                onError={(e)=>{
                  const el = e.currentTarget;
                  if (!el.dataset.fallback){ el.dataset.fallback = '1'; el.src = 'http://localhost:5174/images/floor2.png'; }
                  else { el.src='/images/utilities/meeting-room.jpg'; }
                }}
              />
            </MapImageWrapper>
            
            {/* Legend */}
            <LegendContainer>
              <LegendItem>
                <span style={{background:'#3498db'}}></span>
                <span>Occupied</span>
              </LegendItem>
              <LegendItem>
                <span style={{background:'#d1d5db'}}></span>
                <span>Available</span>
              </LegendItem>
              <LegendItem>
                <span style={{background:'#e74c3c'}}></span>
                <span>Maintenance</span>
              </LegendItem>
            </LegendContainer>
            
            <RoomButtonsGrid>
              {(selectedService.name === 'Meeting Room' ? ['M1','M2','M3','M4'] : ['P1']).map(code => {
                const disabled = statusMap[code] && statusMap[code] !== 'Available';
                const isSelected = selectedRoom?.roomNumber === code;
                const capMap = { M1: '14', M2: '13', M3: '11', M4: '13', P1: '43' };
                return (
                  <RoomButton 
                    key={code}
                    onClick={()=>{
                      const roomObj = rooms.find(r => r?.roomNumber === code || r?.name?.endsWith(code));
                      if (!roomObj) {
                        setInfoMsg('This room is not available for the selected time.');
                        return;
                      }
                      setInfoMsg('');
                      handleRoomSelect(roomObj);
                    }}
                    disabled={disabled}
                    selected={isSelected}
                  >
                    <RoomButtonContent>
                      <span className="room-code">{code}</span>
                      {disabled && (
                        <StatusBadge status={statusMap[code]}>
                          <span className="dot"></span>
                          {statusMap[code]}
                        </StatusBadge>
                      )}
                    </RoomButtonContent>
                    <RoomCapacity>Capacity: {capMap[code] || '—'}</RoomCapacity>
                  </RoomButton>
                );
              })}
            </RoomButtonsGrid>
          </MapContainer>

          {infoMsg && (
            <EmptyMessage style={{maxWidth:800}}>{infoMsg}</EmptyMessage>
          )}

          {selectedRoom && (
            <ContinueSection>
              <SelectedRoomInfo>
                <SelectedRoomName>Selected: {selectedRoom.name}</SelectedRoomName>
                <p>Room {selectedRoom.roomNumber} • Floor {selectedRoom.floor} • {selectedRoom.capacity} people</p>
              </SelectedRoomInfo>

              <PriceInfo>
                <PriceLabel>Total Price</PriceLabel>
                <FinalPrice>{formatPrice(calculateFinalPrice())}</FinalPrice>
              </PriceInfo>

              <ContinueButton onClick={handleContinue} disabled={statusMap[selectedRoom.roomNumber] && statusMap[selectedRoom.roomNumber] !== 'Available'}>
                {statusMap[selectedRoom.roomNumber] && statusMap[selectedRoom.roomNumber] !== 'Available' ? 'Room Unavailable' : 'Continue to Payment'}
              </ContinueButton>
            </ContinueSection>
          )}
        </>
      ) : selectedService.name === 'Networking Space' ? (
        <>
          <MapContainer>
            <MapImageWrapper>
              <img 
                src={'/images/floor3.png'} 
                alt="Floor 3"
                onError={(e)=>{
                  const el = e.currentTarget;
                  if (!el.dataset.fallback){ el.dataset.fallback = '1'; el.src = 'http://localhost:5174/images/floor3.png'; }
                  else { el.src='/images/utilities/discussion-area.jpg'; }
                }}
              />
            </MapImageWrapper>
            
            {/* Legend */}
            <LegendContainer>
              <LegendItem>
                <span style={{background:'#3498db'}}></span>
                <span>Occupied</span>
              </LegendItem>
              <LegendItem>
                <span style={{background:'#d1d5db'}}></span>
                <span>Available</span>
              </LegendItem>
              <LegendItem>
                <span style={{background:'#e74c3c'}}></span>
                <span>Maintenance</span>
              </LegendItem>
            </LegendContainer>
            
            <RoomButtonsGrid>
              {['N1','N2','N3'].map(code => {
                const disabled = statusMap[code] && statusMap[code] !== 'Available';
                const isSelected = selectedRoom?.roomNumber === code;
                const capMap = { N1: '28', N2: '32', N3: '60-70' };
                return (
                  <RoomButton 
                    key={code}
                    onClick={()=>{
                      const roomObj = rooms.find(r => r?.roomNumber === code || r?.name?.endsWith(code));
                      if (!roomObj) {
                        setInfoMsg('This space is not available for the selected time.');
                        return;
                      }
                      setInfoMsg('');
                      handleRoomSelect(roomObj);
                    }}
                    disabled={disabled}
                    selected={isSelected}
                  >
                    <RoomButtonContent>
                      <span className="room-code">{code}</span>
                      {disabled && (
                        <StatusBadge status={statusMap[code]}>
                          <span className="dot"></span>
                          {statusMap[code]}
                        </StatusBadge>
                      )}
                    </RoomButtonContent>
                    <RoomCapacity>Capacity: {capMap[code] || '—'}</RoomCapacity>
                  </RoomButton>
                );
              })}
            </RoomButtonsGrid>
          </MapContainer>

          {infoMsg && (
            <EmptyMessage style={{maxWidth:800}}>{infoMsg}</EmptyMessage>
          )}

          {selectedRoom && (
            <ContinueSection>
              <SelectedRoomInfo>
                <SelectedRoomName>Selected: {selectedRoom.name}</SelectedRoomName>
                <p>Space {selectedRoom.roomNumber} • Floor {selectedRoom.floor} • {selectedRoom.capacity} people</p>
              </SelectedRoomInfo>

              <PriceInfo>
                <PriceLabel>Total Price</PriceLabel>
                <FinalPrice>{formatPrice(calculateFinalPrice())}</FinalPrice>
              </PriceInfo>

              <ContinueButton onClick={handleContinue} disabled={statusMap[selectedRoom.roomNumber] && statusMap[selectedRoom.roomNumber] !== 'Available'}>
                {statusMap[selectedRoom.roomNumber] && statusMap[selectedRoom.roomNumber] !== 'Available' ? 'Space Unavailable' : 'Continue to Payment'}
              </ContinueButton>
            </ContinueSection>
          )}
        </>
      ) : rooms.length === 0 ? (
        <EmptyMessage>
          No rooms available for the selected date and time. Please try a different date or time slot.
        </EmptyMessage>
      ) : (
        <>
          <RoomsGrid>
            {rooms.map((room) => (
              <RoomCard 
                key={room._id || room.id || room.roomNumber} 
                selected={selectedRoom?._id === room._id}
                onClick={() => handleRoomSelect(room)}
              >
                <RoomImage image={
                  (room.images && room.images[0])
                  || (selectedService.image)
                  || (selectedService.name === 'Private Office' ? '/images/utilities/meeting-room.jpg'
                      : selectedService.name === 'Meeting Room' ? '/images/utilities/meeting-room.jpg'
                      : selectedService.name === 'Networking Space' ? '/images/utilities/discussion-area.jpg'
                      : 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=800&q=60')
                } />
                <RoomContent>
                  <RoomHeader>
                    <RoomName>{room.name}</RoomName>
                    <RoomNumber>{room.roomNumber}</RoomNumber>
                  </RoomHeader>
                  
                  <RoomDetails>
                    <DetailItem>
                      <DetailLabel>Floor</DetailLabel>
                      <DetailValue>{room.floor}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Capacity</DetailLabel>
                      <DetailValue>{room.capacity} people</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Area</DetailLabel>
                      <DetailValue>{room.area} m²</DetailValue>
                    </DetailItem>
                  </RoomDetails>

                  <FeaturesList>
                    {(room.features || []).map((feature, index) => (
                      <FeatureItem key={index}>{feature}</FeatureItem>
                    ))}
                  </FeaturesList>

                  <AmenitiesList>
                    {(room.amenities || []).slice(0, 3).map((amenity, index) => (
                      <AmenityItem key={index}>
                        <span>✓</span>
                        <span>{amenity.name}</span>
                      </AmenityItem>
                    ))}
                  </AmenitiesList>

                  <SelectButton 
                    selected={selectedRoom?._id === room._id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRoomSelect(room);
                    }}
                  >
                    {selectedRoom?._id === room._id ? 'Selected' : 'Select This Room'}
                  </SelectButton>
                </RoomContent>
              </RoomCard>
            ))}
          </RoomsGrid>

          {selectedRoom && (
            <ContinueSection>
              <SelectedRoomInfo>
                <SelectedRoomName>Selected: {selectedRoom.name}</SelectedRoomName>
                <p>Room {selectedRoom.roomNumber} • Floor {selectedRoom.floor} • {selectedRoom.capacity} people</p>
              </SelectedRoomInfo>

              <PriceInfo>
                <PriceLabel>Total Price</PriceLabel>
                <FinalPrice>{formatPrice(calculateFinalPrice())}</FinalPrice>
              </PriceInfo>

              <ContinueButton onClick={handleContinue}>
                Continue to Payment
              </ContinueButton>
            </ContinueSection>
          )}
        </>
      )}
      </BookingFormContainer>
    </Container>
    <Footer />
    </>
  );
};

export default RoomSelectionPage;