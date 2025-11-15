import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

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
  
  const { booking } = location.state || {};

  useEffect(() => {
    if (!booking) {
      navigate('/team-booking');
    }
  }, [booking, navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    return time;
  };

  const getDurationText = (duration) => {
    if (!duration) return '';
    const { value, unit } = duration;
    const unitMap = {
      hours: 'giờ',
      days: 'ngày', 
      months: 'tháng',
      years: 'năm'
    };
    return `${value} ${unitMap[unit]}`;
  };

  const handleViewBookings = () => {
    navigate('/booking-history');
  };

  const handleBookAnother = () => {
    navigate('/team-booking');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (!booking) {
    return null;
  }

  return (
    <>
      <Header />
      <Container>
        <ConfirmationCard>
          <SuccessIcon>✓</SuccessIcon>
          
          <Title>Booking <span>Confirmed!</span></Title>
          <Subtitle>
            Your team service booking has been successfully created. 
            We'll send you a confirmation email shortly.
          </Subtitle>

        <BookingReference>
          Booking Reference: {booking.bookingReference}
        </BookingReference>

        <BookingDetails>
          <DetailRow>
            <DetailLabel>Service</DetailLabel>
            <DetailValue>{booking.teamServiceId?.name || booking.serviceType}</DetailValue>
          </DetailRow>
          
          <DetailRow>
            <DetailLabel>Room</DetailLabel>
            <DetailValue>{booking.teamRoomId?.name}</DetailValue>
          </DetailRow>
          
          <DetailRow>
            <DetailLabel>Room Number</DetailLabel>
            <DetailValue>{booking.teamRoomId?.roomNumber}</DetailValue>
          </DetailRow>
          
          <DetailRow>
            <DetailLabel>Floor</DetailLabel>
            <DetailValue>{booking.teamRoomId?.floor}</DetailValue>
          </DetailRow>
          
          <DetailRow>
            <DetailLabel>Date</DetailLabel>
            <DetailValue>{formatDate(booking.startDate)}</DetailValue>
          </DetailRow>
          
          {booking.startTime && booking.endTime && (
            <DetailRow>
              <DetailLabel>Time</DetailLabel>
              <DetailValue>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</DetailValue>
            </DetailRow>
          )}
          
          <DetailRow>
            <DetailLabel>Duration</DetailLabel>
            <DetailValue>
              {booking.customDuration 
                ? `${booking.customDuration} hours`
                : getDurationText(booking.durationPackageId?.duration)
              }
            </DetailValue>
          </DetailRow>
          
          <DetailRow>
            <DetailLabel>Total Price</DetailLabel>
            <DetailValue>{formatPrice(booking.finalPrice)}</DetailValue>
          </DetailRow>
          
          <DetailRow>
            <DetailLabel>Status</DetailLabel>
            <DetailValue style={{ 
              color: booking.status === 'confirmed' ? '#27ae60' : '#f39c12',
              textTransform: 'capitalize'
            }}>
              {booking.status}
            </DetailValue>
          </DetailRow>
        </BookingDetails>

        <ImportantNotes>
          <NotesTitle>Important Information</NotesTitle>
          <NotesList>
            <li>Please arrive 15 minutes before your scheduled time</li>
            <li>Bring a valid ID for check-in verification</li>
            <li>You will receive a QR code for easy check-in via email</li>
            {booking.teamServiceId?.name === 'Private Office' && (
              <li>Your access will be activated from the start date of your booking</li>
            )}
            {booking.teamServiceId?.name === 'Meeting Room' && (
              <li>All AV equipment will be ready and tested before your arrival</li>
            )}
            {booking.teamServiceId?.name === 'Networking Space' && (
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