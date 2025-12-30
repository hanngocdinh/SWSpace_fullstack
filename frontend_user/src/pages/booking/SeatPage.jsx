import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../contexts/BookingContext';
import BookingLayout from './BookingLayout';
import { FaExpandAlt, FaCompressAlt, FaTh, FaMapMarkedAlt, FaCube } from 'react-icons/fa';
import ModernOfficeMap from '../../components/ModernOfficeMap';
import ThreeDViewer from '../../components/ThreeDViewer';
import FloatingTourButton from '../../components/FloatingTourButton';
import SketchfabEmbed from '../../components/SketchfabEmbed';
import TourSection from '../../components/TourSection';
import { resolveBookingDurationLabel } from '../../utils/bookingDuration';

const SeatTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
  }
`;

const SeatTitleText = styled.h3`
  font-size: 1.2rem;
  font-weight: 500;
  margin: 0;
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const FloorTag = styled.div`
  padding: 0.4rem 1rem;
  border-radius: 4px;
  background-color: #45bf55;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  
  @media (max-width: 480px) {
    padding: 0.3rem 0.8rem;
    font-size: 0.8rem;
  }
`;

const ViewControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ControlButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ControlButton = styled.button`
  padding: 0.4rem 1rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: ${props => props.active ? '#333' : '#fff'};
  color: ${props => props.active ? '#fff' : '#333'};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.active ? '#333' : '#f5f5f5'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (max-width: 480px) {
    padding: 0.3rem 0.8rem;
    font-size: 0.8rem;
  }
`;

const SeatSelectionInfo = styled.div`
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 1.25rem;
  }
`;

const InfoRow = styled.div`
  display: flex;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: #333;
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    margin-bottom: 0.4rem;
  }
`;

const InfoLabel = styled.div`
  font-weight: 500;
  width: 150px;
  
  @media (max-width: 480px) {
    width: 120px;
  }
`;

const InfoValue = styled.div`
  flex: 1;
`;

const SeatmapContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
`;

const SeatmapImage = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 1rem;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  transform: ${props => `scale(${props.zoomLevel/100})`};
  transform-origin: top center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
`;

const SeatLegend = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: center;
  
  @media (max-width: 768px) {
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    gap: 1rem;
    margin-bottom: 1.25rem;
  }
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const LegendColor = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background-color: ${props => props.color};
  
  @media (max-width: 480px) {
    width: 14px;
    height: 14px;
  }
`;

const SeatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 0.5rem;
  margin-top: 2rem;
  width: 100%;
  max-width: 600px;
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
    gap: 0.4rem;
    margin-top: 1.5rem;
  }
`;

const SeatItem = styled.div`
  aspect-ratio: 1;
  border-radius: 4px;
  cursor: ${props => props.available ? 'pointer' : 'default'};
  background-color: ${props => {
    if (props.selected) return '#45bf55';
    if (props.reserved) return '#3498db';
    if (props.occupied) return '#e74c3c';
    return '#f5f5f5';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.selected || props.reserved || props.occupied ? 'white' : '#333'};
  font-size: 0.9rem;
  font-weight: bold;
  opacity: ${props => props.available ? 1 : 0.8};
  transition: all 0.2s;
  border: 2px solid transparent;
  box-shadow: ${props => props.selected ? '0 3px 6px rgba(0,0,0,0.2)' : 'none'};
  
  &:hover {
    ${props => props.available && !props.selected && `
      transform: translateY(-3px);
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
      border-color: #45bf55;
    `}
  }
`;

const BookingSummary = styled.div`
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    margin-top: 1.5rem;
    padding-top: 0.8rem;
  }
  
  @media (max-width: 480px) {
    margin-top: 1.25rem;
    padding-top: 0.7rem;
  }
`;

const SummaryInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const SummaryLabel = styled.div`
  font-size: 0.8rem;
  color: #666;
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
  }
`;

const SummaryValue = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const TotalAmount = styled.div`
  font-size: 1rem;
  font-weight: 600;
`;

const ActionContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    margin-top: 1.5rem;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
    margin-top: 1.25rem;
  }
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
  
  @media (max-width: 768px) {
    padding: 0.7rem 1.8rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.7rem 1.5rem;
    font-size: 0.95rem;
    width: 100%;
    max-width: 200px;
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
  
  @media (max-width: 768px) {
    padding: 0.7rem 1.8rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.7rem 1.5rem;
    font-size: 0.95rem;
    width: 100%;
    max-width: 200px;
    order: -1; /* Make the Next button appear before the Back button on mobile */
  }
`;


const seatUnavailableMessage = 'This seat is not available for the selected time window.';

const serializeDateParam = (value) => {
  if (!value) return null;
  const dt = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString();
};

const buildSeatRangeQuery = ({ date, endDate, time, endTime }) => {
  const params = new URLSearchParams();
  const startIso = serializeDateParam(date);
  if (startIso) params.append('startDate', startIso);
  if (time) params.append('startTime', time);
  const endIso = serializeDateParam(endDate);
  if (endIso) params.append('endDate', endIso);
  if (endTime) params.append('endTime', endTime);
  const query = params.toString();
  return query ? '?' + query : '';
};

const getSeatNumber = (code = '') => {
  const match = code.match(/FD-?0*(\d+)/i);
  return match ? parseInt(match[1], 10) : Number.POSITIVE_INFINITY;
};

const SeatPage = () => {
  const { bookingState, selectSeat, fetchOccupiedSeats, forceRefreshOccupiedSeats } = useBooking();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('map');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [show3DView, setShow3DView] = useState(false);
  const [fdStatusMap, setFdStatusMap] = useState({});
  const [fdInfoMsg, setFdInfoMsg] = useState('');
  const [fdLoading, setFdLoading] = useState(false);
  const [fdSeatCodes, setFdSeatCodes] = useState([]);
  const [fdCapacityMap, setFdCapacityMap] = useState({});
  const apiBaseUrl = useMemo(() => process.env.REACT_APP_API_URL || 'http://localhost:5000', []);
  const seatRangeQuery = useMemo(() => buildSeatRangeQuery({
    date: bookingState.date,
    endDate: bookingState.endDate,
    time: bookingState.time,
    endTime: bookingState.endTime
  }), [bookingState.date, bookingState.endDate, bookingState.time, bookingState.endTime]);
  const selectedSeatCode = bookingState.selectedSeat?.id || bookingState.selectedSeat?.name || null;

  // Redirect if previous steps are not completed
  useEffect(() => {
    if (!bookingState.serviceType || !bookingState.packageDuration) {
      navigate('/booking/service');
      return;
    }
    if (bookingState.serviceType === 'hot-desk') {
      navigate('/booking/payment');
    }
  }, [bookingState.serviceType, bookingState.packageDuration, navigate]);

  // Lấy danh sách chỗ ngồi phù hợp với loại dịch vụ
  const getPackageTypeFromBookingState = () => {
    if (bookingState.serviceType === 'hot-desk') {
      return 'hot-desk';
    } else {
      return 'fixed-desk';
    }
  };

  const packageType = getPackageTypeFromBookingState();
  const seatsForPackage = bookingState.seats[packageType] || [];

  // Xử lý khi chọn chỗ ngồi
  const handleSeatSelect = (seat) => {
    if (seat.available) {
      selectSeat(seat);
    }
  };

  const fetchSeatStatuses = useCallback(async () => {
    if (bookingState.serviceType !== 'fixed-desk') return;
    setFdLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/space/floor1/fixed-desks${seatRangeQuery}`);
      if (!response.ok) {
        throw new Error('failed-to-load-seats');
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('invalid-seat-response');
      }
      const statusMap = {};
      const capacityMap = {};
      data.forEach((s) => {
        const ui = s.status === 'Reserved' ? 'Occupied' : s.status;
        statusMap[s.seatCode] = ui;
        capacityMap[s.seatCode] = s.capacity || 1;
      });
      setFdStatusMap(statusMap);
      setFdCapacityMap(capacityMap);
      const codes = data.map((s) => s.seatCode).sort((a, b) => {
        const na = getSeatNumber(a);
        const nb = getSeatNumber(b);
        if (na === nb) return a.localeCompare(b);
        return na - nb;
      });
      setFdSeatCodes(codes);
      if (selectedSeatCode && statusMap[selectedSeatCode] && statusMap[selectedSeatCode] !== 'Available') {
        setFdInfoMsg(seatUnavailableMessage);
      } else {
        setFdInfoMsg('');
      }
    } catch (error) {
      console.error('Unable to fetch seat statuses', error);
      setFdInfoMsg('Unable to load seat availability for the selected time range.');
    } finally {
      setFdLoading(false);
    }
  }, [apiBaseUrl, seatRangeQuery, bookingState.serviceType, selectedSeatCode]);

  // --- Fixed Desk realtime statuses (Floor 1) ---
  useEffect(() => {
    if (bookingState.serviceType !== 'fixed-desk') return;
    let timer;
    fetchSeatStatuses();
    timer = setInterval(fetchSeatStatuses, 5000);
    return () => timer && clearInterval(timer);
  }, [bookingState.serviceType, fetchSeatStatuses]);

  // Sync BookingContext occupied seats for other views
  useEffect(() => {
    if (bookingState.serviceType !== 'fixed-desk') return;
    if (!bookingState.date || typeof fetchOccupiedSeats !== 'function') return;
    fetchOccupiedSeats(
      bookingState.serviceType,
      bookingState.date,
      bookingState.time,
      bookingState.endTime,
      bookingState.endDate
    );
  }, [
    bookingState.serviceType,
    bookingState.date,
    bookingState.endDate,
    bookingState.time,
    bookingState.endTime,
    fetchOccupiedSeats
  ]);

  const handleSeatRefresh = useCallback(async () => {
    await fetchSeatStatuses();
    if (typeof forceRefreshOccupiedSeats === 'function') {
      await forceRefreshOccupiedSeats();
    }
  }, [fetchSeatStatuses, forceRefreshOccupiedSeats]);

  const handleFixedDeskSelect = (code) => {
    const status = fdStatusMap[code] || 'Available';
    if (status !== 'Available') {
      setFdInfoMsg(seatUnavailableMessage);
      return;
    }
    setFdInfoMsg('');
    selectSeat({ id: code, name: code, type: 'fixed-desk' });
  };

  const handleFixedDeskContinue = useCallback(async () => {
    if (!selectedSeatCode) return;
    try {
      const response = await fetch(`${apiBaseUrl}/api/space/floor1/fixed-desks/${encodeURIComponent(selectedSeatCode)}/availability${seatRangeQuery}`);
      const data = await response.json();
      if (!response.ok) throw new Error('availability-check-failed');
      if (!data?.available) {
        setFdInfoMsg(seatUnavailableMessage);
        await fetchSeatStatuses();
        if (typeof forceRefreshOccupiedSeats === 'function') {
          await forceRefreshOccupiedSeats();
        }
        return;
      }
    } catch (error) {
      console.error('Unable to verify availability', error);
      setFdInfoMsg('Unable to verify availability right now. Please try again in a moment.');
      return;
    }
    await fetchOccupiedSeats(
      bookingState.serviceType,
      bookingState.date,
      bookingState.time,
      bookingState.endTime,
      bookingState.endDate
    );
    navigate('/booking/payment');
  }, [
    selectedSeatCode,
    apiBaseUrl,
    seatRangeQuery,
    fetchSeatStatuses,
    forceRefreshOccupiedSeats,
    fetchOccupiedSeats,
    bookingState.serviceType,
    bookingState.date,
    bookingState.endDate,
    bookingState.time,
    bookingState.endTime,
    navigate
  ]);

  // Handle navigation
  const handleNextStep = () => {
    navigate('/booking/payment');
  };

  const handleBackStep = () => {
    navigate('/booking/date');
  };

// Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not selected';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  return (
    <BookingLayout
      title="Select Your Seat"
      subtitle="Choose your preferred workspace location"
    >
      {/* Fixed Desk new UX: Floor 1 map + FD-1..FD-21 buttons with realtime status */}
      {bookingState.serviceType === 'fixed-desk' ? (
        <>
          <SeatSelectionInfo>
            <InfoRow>
              <InfoLabel>Service:</InfoLabel>
              <InfoValue>Fixed Desk</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Duration:</InfoLabel>
              <InfoValue>
                {resolveBookingDurationLabel(bookingState)}
              </InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Start Date:</InfoLabel>
              <InfoValue>{bookingState.date ? formatDate(bookingState.date) : 'Not selected'}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Start Time:</InfoLabel>
              <InfoValue>{bookingState.time || 'Not selected'}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>End Date:</InfoLabel>
              <InfoValue>{bookingState.endDate ? formatDate(bookingState.endDate) : 'Not selected'}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>End Time:</InfoLabel>
              <InfoValue>{bookingState.endTime || 'Not selected'}</InfoValue>
            </InfoRow>
          </SeatSelectionInfo>

          <div style={{maxWidth:'1000px', margin:'0 auto'}}>
            <div style={{
              borderRadius:16, 
              overflow:'hidden', 
              boxShadow:'0 8px 32px rgba(2,21,38,0.12)', 
              background:'white',
              padding:'1rem'
            }}>
              <img
                src={`http://localhost:5174/images/floor1_user.png`}
                alt="Floor 1"
                style={{width:'100%', height:'auto', display:'block', borderRadius:'12px'}}
                onError={(e)=>{
                  const el = e.currentTarget;
                  const step = parseInt(el.dataset.fallback || '0', 10) + 1;
                  el.dataset.fallback = String(step);
                  if (step === 1) el.src = '/images/floor1_user.png';
                  else if (step === 2) el.src = `${apiBaseUrl}/images/floor1_user.png`;
                  else if (step === 3) el.src = '/images/floor1.png';
                  else if (step === 4) el.src = 'http://localhost:5174/images/floor1.png';
                  else el.src = '/images/utilities/meeting-room.jpg';
                }}
              />
            </div>
            {/* Legend */}
            <div style={{display:'flex', gap:'2rem', justifyContent:'center', marginTop:'1.25rem', flexWrap:'wrap'}}>
              <div style={{display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.95rem', color:'#495057'}}>
                <span style={{width:20, height:20, background:'#3498db', borderRadius:6}}></span>
                <span>Occupied</span>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.95rem', color:'#495057'}}>
                <span style={{width:20, height:20, background:'#d1d5db', borderRadius:6}}></span>
                <span>Available</span>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.95rem', color:'#495057'}}>
                <span style={{width:20, height:20, background:'#e74c3c', borderRadius:6}}></span>
                <span>Maintenance</span>
              </div>
            </div>
            <div style={{display:'flex', gap:'1rem', justifyContent:'center', marginTop:'1.5rem', flexWrap:'wrap'}}>
              {fdSeatCodes.map(code => {
                const st = fdStatusMap[code] || 'Available';
                const disabled = st !== 'Available';
                const isSelected = bookingState.selectedSeat && (bookingState.selectedSeat.id === code || bookingState.selectedSeat.name === code);
                return (
                  <button key={code}
                          onClick={()=>handleFixedDeskSelect(code)}
                          disabled={disabled}
                          style={{
                            minWidth:140, padding:'1rem 1.25rem', borderRadius:12, 
                            border: `2px solid ${isSelected? '#27ae60' : '#e5e7eb'}`,
                            background: isSelected? 'linear-gradient(180deg, rgba(39,174,96,0.08), rgba(39,174,96,0.04))' : 'white',
                            color: '#021526',
                            boxShadow: isSelected? '0 8px 24px rgba(39,174,96,0.25)' : '0 4px 12px rgba(2,21,38,0.08)',
                            cursor: disabled? 'not-allowed':'pointer', fontWeight:700, letterSpacing:'0.3px',
                            transition:'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: isSelected? 'translateY(-3px) scale(1.03)' : 'translateY(0)',
                            opacity: disabled? 0.6 : 1
                          }}
                          onMouseEnter={(e) => {
                            if (!disabled) {
                              e.currentTarget.style.transform = isSelected ? 'translateY(-3px) scale(1.03)' : 'translateY(-2px) scale(1.01)';
                              e.currentTarget.style.boxShadow = isSelected ? '0 12px 28px rgba(39,174,96,0.3)' : '0 6px 18px rgba(2,21,38,0.12)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!disabled) {
                              e.currentTarget.style.transform = isSelected ? 'translateY(-3px) scale(1.03)' : 'translateY(0)';
                              e.currentTarget.style.boxShadow = isSelected ? '0 8px 24px rgba(39,174,96,0.25)' : '0 4px 12px rgba(2,21,38,0.08)';
                            }
                          }}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'0.75rem'}}>
                      <span style={{fontSize:'1.125rem', fontWeight:700}}>{code}</span>
                      {disabled && (
                        <span style={{display:'inline-flex', alignItems:'center', gap:'0.4rem', fontSize:'0.75rem', fontWeight:600,
                                      color: st==='Maintenance'? '#c0392b':'#1f6feb',
                                      background: st==='Maintenance'? 'rgba(192,57,43,0.12)':'rgba(31,111,235,0.12)',
                                      padding:'0.3rem 0.6rem', borderRadius:999}}>
                          <span style={{width:7, height:7, borderRadius:999, background: st==='Maintenance'? '#e74c3c':'#3498db'}}></span>
                          {st === 'Reserved' ? 'Occupied' : st}
                        </span>
                      )}
                    </div>
                    <div style={{fontSize:'0.8125rem', opacity:0.65, marginTop:'0.5rem', fontWeight:500}}>Capacity: {fdCapacityMap[code] || 1}</div>
                  </button>
                );
              })}
            </div>
            <div style={{display:'flex', justifyContent:'center', marginTop:10}}>
              <button onClick={handleSeatRefresh} disabled={fdLoading} style={{
                padding:'10px 14px', borderRadius:10, border:'1px solid #e5e7eb', background:'#fff', cursor: fdLoading ? 'not-allowed':'pointer'
              }}>
                {fdLoading ? 'Refreshing...' : 'Refresh Seats'}
              </button>
            </div>
          </div>

          {fdInfoMsg && (
            <div style={{textAlign:'center', color:'#e74c3c', fontSize:'1rem', padding:'1rem 0'}}>{fdInfoMsg}</div>
          )}

          <ActionContainer>
            <BackButton onClick={() => navigate('/booking/date')}>
              Back
            </BackButton>
            <NextButton 
              disabled={!bookingState.selectedSeat || (fdStatusMap[bookingState.selectedSeat?.id || bookingState.selectedSeat?.name] && fdStatusMap[bookingState.selectedSeat?.id || bookingState.selectedSeat?.name] !== 'Available')}
              onClick={handleFixedDeskContinue}
            >
              {!bookingState.selectedSeat ? 'Select a Seat' : ((fdStatusMap[bookingState.selectedSeat?.id || bookingState.selectedSeat?.name] && fdStatusMap[bookingState.selectedSeat?.id || bookingState.selectedSeat?.name] !== 'Available') ? 'Seat Unavailable' : 'Next Step')}
            </NextButton>
          </ActionContainer>
        </>
  ) : (
  <>
  <SeatSelectionInfo>
        <InfoRow>
          <InfoLabel>Service:</InfoLabel>
          <InfoValue>{bookingState.serviceType === 'hot-desk' ? 'Hot Desk' : 'Fixed Desk'}</InfoValue>
        </InfoRow>
        
        <InfoRow>
          <InfoLabel>Duration:</InfoLabel>
          <InfoValue>
            {resolveBookingDurationLabel(bookingState)}
          </InfoValue>
        </InfoRow>
        
        <InfoRow>
          <InfoLabel>Start Date:</InfoLabel>
          <InfoValue>{bookingState.date ? formatDate(bookingState.date) : 'Not selected'}</InfoValue>
        </InfoRow>
        
        <InfoRow>
          <InfoLabel>Start Time:</InfoLabel>
          <InfoValue>{bookingState.time || 'Not selected'}</InfoValue>
        </InfoRow>
        
        <InfoRow>
          <InfoLabel>End Date:</InfoLabel>
          <InfoValue>{bookingState.endDate ? formatDate(bookingState.endDate) : 'Not selected'}</InfoValue>
        </InfoRow>
        
        <InfoRow>
          <InfoLabel>End Time:</InfoLabel>
          <InfoValue>{bookingState.endTime || 'Not selected'}</InfoValue>
        </InfoRow>
      </SeatSelectionInfo>
      
      <SeatmapContainer>
        <SeatTitle>
          <SeatTitleText>Select a seat from the available options</SeatTitleText>
          <FloorTag>Floor 1</FloorTag>
        </SeatTitle>
        
        <ViewControls>
          <ControlButtons>
            <ControlButton 
              active={viewMode === 'map'} 
              onClick={() => setViewMode('map')}
            >
              <FaMapMarkedAlt style={{ marginRight: '5px' }} />
              Map View
            </ControlButton>
            <ControlButton 
              active={viewMode === 'grid'} 
              onClick={() => setViewMode('grid')}
            >
              <FaTh style={{ marginRight: '5px' }} />
              Grid View
            </ControlButton>
            <ControlButton 
              onClick={() => setShow3DView(true)}
              style={{ background: '#4a90e2', color: 'white' }}
            >
              <FaCube style={{ marginRight: '5px' }} />
              3D Tour
            </ControlButton>
          </ControlButtons>
          
          {viewMode === 'map' && (
            <ControlButtons>
              <ControlButton 
                onClick={() => setZoomLevel(Math.max(80, zoomLevel - 10))}
                disabled={zoomLevel <= 80}
              >
                <FaCompressAlt style={{ marginRight: '5px' }} />
                Zoom Out
              </ControlButton>
              <ControlButton 
                onClick={() => setZoomLevel(100)}
              >
                Reset
              </ControlButton>
              <ControlButton 
                onClick={() => setZoomLevel(Math.min(130, zoomLevel + 10))}
                disabled={zoomLevel >= 130}
              >
                <FaExpandAlt style={{ marginRight: '5px' }} />
                Zoom In
              </ControlButton>
            </ControlButtons>
          )}
        </ViewControls>
        
        {viewMode === 'map' && (
          <SeatmapImage zoomLevel={zoomLevel}>
            <ModernOfficeMap 
              seats={seatsForPackage}
              selectedSeatId={bookingState.selectedSeat?.id}
              onSelectSeat={handleSeatSelect}
            />
          </SeatmapImage>
        )}
        
        {viewMode === 'grid' && (
          <>
            <SeatLegend>
              <LegendItem>
                <LegendColor color="#3498db" />
                <span>Occupied</span>
              </LegendItem>
              <LegendItem>
                <LegendColor color="#d1d5db" />
                <span>Available</span>
              </LegendItem>
              <LegendItem>
                <LegendColor color="#e74c3c" />
                <span>Maintenance</span>
              </LegendItem>
              <LegendItem>
                <LegendColor color="#45bf55" />
                <span>Selected</span>
              </LegendItem>
            </SeatLegend>
            
            <SeatsGrid>
              {seatsForPackage.map((seat) => (
                <SeatItem
                  key={seat.id}
                  available={seat.available}
                  occupied={!seat.available}
                  reserved={!seat.available && seat.id.includes('B')}
                  selected={bookingState.selectedSeat && bookingState.selectedSeat.id === seat.id}
                  onClick={() => handleSeatSelect(seat)}
                >
                  {seat.name}
                </SeatItem>
              ))}
            </SeatsGrid>
          </>
        )}
      </SeatmapContainer>
      
      {bookingState.selectedSeat && (
        <BookingSummary>
          <SummaryInfo>
            <SummaryLabel>SEAT SELECTED</SummaryLabel>
            <SummaryValue>{bookingState.selectedSeat.name}</SummaryValue>
          </SummaryInfo>
          <SummaryInfo>
            <SummaryLabel>LOCATION</SummaryLabel>
            <SummaryValue>Floor 1, {
              bookingState.selectedSeat.name.startsWith('A') || bookingState.selectedSeat.name.startsWith('B') 
                ? 'North Wing' 
                : 'South Wing'
            }</SummaryValue>
          </SummaryInfo>
        </BookingSummary>
      )}
      
      {/* Phần hiển thị tour 3D có thể mở rộng */}
      <TourSection>
        <SketchfabEmbed />
      </TourSection>
      
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
      
      {/* Modal hiển thị không gian 3D */}
      <ThreeDViewer isOpen={show3DView} onClose={() => setShow3DView(false)} />
      
      {/* Nút nổi để truy cập vào tour 3D từ mọi nơi trên trang */}
      <FloatingTourButton onClick={() => setShow3DView(true)} />
      </>
      )}
    </BookingLayout>
  );
};

export default SeatPage;