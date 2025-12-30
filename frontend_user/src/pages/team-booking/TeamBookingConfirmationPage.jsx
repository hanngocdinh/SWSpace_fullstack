import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import {
  readTeamBookingSnapshot,
  saveTeamBookingSnapshot,
  clearTeamBookingSnapshot,
  normalizeTeamBooking
} from '../../utils/teamBookingStorage';

const Container = styled.div`
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ConfirmationCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  max-width: 600px;
  width: 100%;
  text-align: center;
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #45bf55 0%, #38a046 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  font-size: 2.5rem;
  color: white;
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
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const BookingDetails = styled.div`
  background: #f8f9fa;
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
  text-align: left;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #ecf0f1;
  
  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  color: #7f8c8d;
  font-weight: 500;
`;

const DetailValue = styled.span`
  color: #2c3e50;
  font-weight: 600;
`;

const BookingReference = styled.div`
  background: linear-gradient(135deg, #45bf55 0%, #38a046 100%);
  color: white;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  font-weight: 600;
  font-size: 1.1rem;
`;

const ImportantNotes = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
`;

const NotesTitle = styled.h4`
  color: #856404;
  margin-bottom: 1rem;
`;

const NotesList = styled.ul`
  color: #856404;
  margin: 0;
  padding-left: 1.5rem;
  
  li {
    margin-bottom: 0.5rem;
    line-height: 1.5;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, #45bf55 0%, #38a046 100%);
  color: white;
  border: none;
`;

const SecondaryButton = styled(Button)`
  background: white;
  color: #45bf55;
  border: 2px solid #45bf55;
  
  &:hover {
    background: #45bf55;
    color: white;
  }
`;

const TeamBookingConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const bookingIdFromQuery = searchParams.get('bookingId');
  const initialBooking = location.state?.booking || readTeamBookingSnapshot();
  const [booking, setBooking] = useState(initialBooking);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (location.state?.booking) {
      saveTeamBookingSnapshot(location.state.booking);
      setBooking(location.state.booking);
    }
  }, [location.state]);

  useEffect(() => {
    if (booking || bookingIdFromQuery) return;
    navigate('/team-booking');
  }, [booking, bookingIdFromQuery, navigate]);

  useEffect(() => {
    if (booking || !bookingIdFromQuery) return;

    let isCancelled = false;
    const fetchBooking = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Bạn cần đăng nhập để xem thông tin booking.');
        const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const response = await fetch(`${base}/api/team/bookings/${bookingIdFromQuery}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          const msg = response.status === 404
            ? 'Không tìm thấy booking này. Vui lòng kiểm tra lại.'
            : 'Không thể tải thông tin booking. Vui lòng thử lại sau.';
          throw new Error(msg);
        }
        const payload = await response.json();
        const normalized = normalizeTeamBooking(payload.data || payload.booking || {}, {});
        if (isCancelled) return;
        saveTeamBookingSnapshot(normalized);
        setBooking(normalized);
      } catch (err) {
        if (isCancelled) return;
        setError(err.message || 'Không thể tải thông tin booking.');
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchBooking();
    return () => {
      isCancelled = true;
    };
  }, [booking, bookingIdFromQuery]);

  const formatPrice = (price) => {
    if (price === undefined || price === null) return '—';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(Number(price));
  };

  const formatDate = (date) => {
    if (!date) return '—';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;
    return parsed.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const resolveDuration = () => {
    if (!booking) return '—';
    if (booking.customHours) return `${booking.customHours} hours`;
    const duration = booking.packageInfo?.duration;
    if (duration?.value && duration?.unit) {
      const unitMap = { hours: 'giờ', days: 'ngày', months: 'tháng', years: 'năm' };
      return `${duration.value} ${unitMap[duration.unit] || duration.unit}`;
    }
    if (booking.durationLabel) return booking.durationLabel;
    if (booking.packageDuration) return booking.packageDuration;
    return '—';
  };

  const handleViewBookings = () => {
    navigate('/booking-history');
  };

  const handleBookAnother = () => {
    clearTeamBookingSnapshot();
    navigate('/team-booking');
  };

  const handleGoHome = () => {
    clearTeamBookingSnapshot();
    navigate('/');
  };

  if (!booking && !loading) {
    return (
      <>
        <Header />
        <Container>
          <ConfirmationCard>
            <Title>Không tìm thấy booking</Title>
            <Subtitle>Vui lòng thử đặt lại hoặc kiểm tra danh sách booking của bạn.</Subtitle>
            <ButtonGroup>
              <PrimaryButton onClick={handleBookAnother}>Book Another Service</PrimaryButton>
              <SecondaryButton onClick={handleViewBookings}>View My Bookings</SecondaryButton>
            </ButtonGroup>
          </ConfirmationCard>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Container>
        <ConfirmationCard>
          <SuccessIcon>✓</SuccessIcon>
          
          <Title>Booking <span>Confirmed!</span></Title>
          <Subtitle>
            {loading ? 'Đang tải thông tin booking mới nhất...' : 'Your team service booking has been successfully created.'}
            <br />
            We'll send you a confirmation email shortly.
          </Subtitle>

          {error && (
            <ImportantNotes style={{ background: '#f8d7da', borderColor: '#f5c6cb', color: '#721c24' }}>
              {error}
            </ImportantNotes>
          )}

        <BookingReference>
          Booking Reference: {booking?.bookingReference || '—'}
        </BookingReference>

        <BookingDetails>
          <DetailRow>
            <DetailLabel>Service</DetailLabel>
            <DetailValue>{booking?.serviceInfo?.name || booking?.serviceType || 'Team Service'}</DetailValue>
          </DetailRow>
          
          <DetailRow>
            <DetailLabel>Room</DetailLabel>
            <DetailValue>{booking?.roomInfo?.name || booking?.seatName || '—'}</DetailValue>
          </DetailRow>
          
          <DetailRow>
            <DetailLabel>Room Number</DetailLabel>
            <DetailValue>{booking?.roomInfo?.roomNumber || booking?.seatCode || '—'}</DetailValue>
          </DetailRow>
          
          <DetailRow>
            <DetailLabel>Floor</DetailLabel>
            <DetailValue>{booking?.roomInfo?.floor || booking?.floor || '—'}</DetailValue>
          </DetailRow>
          
          <DetailRow>
            <DetailLabel>Date</DetailLabel>
            <DetailValue>{formatDate(booking?.startDate)}</DetailValue>
          </DetailRow>
          
          {(booking?.startTime || booking?.endTime) && (
            <DetailRow>
              <DetailLabel>Time</DetailLabel>
              <DetailValue>
                {booking?.startTime || '--'}
                {booking?.endTime ? ` - ${booking.endTime}` : ''}
              </DetailValue>
            </DetailRow>
          )}
          
          <DetailRow>
            <DetailLabel>Duration</DetailLabel>
            <DetailValue>{resolveDuration()}</DetailValue>
          </DetailRow>
          
          <DetailRow>
            <DetailLabel>Total Price</DetailLabel>
            <DetailValue>{formatPrice(booking?.finalPrice)}</DetailValue>
          </DetailRow>
          
          <DetailRow>
            <DetailLabel>Status</DetailLabel>
            <DetailValue style={{ 
              color: (booking?.status === 'confirmed' || booking?.status === 'paid') ? '#27ae60' : '#f39c12',
              textTransform: 'capitalize'
            }}>
              {booking?.status || 'pending'}
            </DetailValue>
          </DetailRow>
        </BookingDetails>

        <ImportantNotes>
          <NotesTitle>Important Information</NotesTitle>
          <NotesList>
            <li>Please arrive 15 minutes before your scheduled time</li>
            <li>Bring a valid ID for check-in verification</li>
            <li>You will receive a QR code for easy check-in via email</li>
            {booking?.serviceInfo?.name === 'Private Office' && (
              <li>Your access will be activated from the start date of your booking</li>
            )}
            {booking?.serviceInfo?.name === 'Meeting Room' && (
              <li>All AV equipment will be ready and tested before your arrival</li>
            )}
            {booking?.serviceInfo?.name === 'Networking Space' && (
              <li>Event setup and catering arrangements (if any) will be confirmed separately</li>
            )}
            <li>For any changes or cancellations, please contact us at least 24 hours in advance</li>
          </NotesList>
        </ImportantNotes>

        <ButtonGroup>
          <PrimaryButton onClick={handleViewBookings}>
            View My Bookings
          </PrimaryButton>
          <SecondaryButton onClick={handleBookAnother}>
            Book Another Service
          </SecondaryButton>
        </ButtonGroup>
        
        <div style={{ marginTop: '1rem' }}>
          <SecondaryButton onClick={handleGoHome}>
            Return to Home
          </SecondaryButton>
        </div>
      </ConfirmationCard>
    </Container>
    <Footer />
    </>
  );
};

export default TeamBookingConfirmationPage;