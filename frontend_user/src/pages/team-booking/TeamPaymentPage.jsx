import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styled from 'styled-components';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import TeamBookingProgress from '../../components/TeamBookingProgress';
import { normalizeTeamBooking, saveTeamBookingSnapshot } from '../../utils/teamBookingStorage';

const Container = styled.div`
  min-height: 100vh;
  padding: 6rem 2rem 3rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
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

const Title = styled.h1`
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  
  span {
    color: #45bf55;
  }
`;

const ContentArea = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    max-width: 600px;
  }
`;

const BookingSummary = styled.div`
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  height: fit-content;
`;

const SummaryTitle = styled.h3`
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #ecf0f1;
  
  &:last-child {
    border-bottom: none;
    font-weight: bold;
    font-size: 1.1rem;
  }
`;

const SummaryLabel = styled.span`
  color: #7f8c8d;
`;

const SummaryValue = styled.span`
  color: #2c3e50;
  font-weight: 600;
`;


const PaymentSection = styled.div`
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const PaymentTitle = styled.h3`
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
`;

const PaymentMethodsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const PaymentMethodCard = styled.div`
  border: 2px solid ${props => props.selected ? '#45bf55' : '#ddd'};
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.selected ? '#f8fff8' : 'white'};
  
  &:hover {
    border-color: #45bf55;
    background: #f8fff8;
  }
`;

const PaymentMethodIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const PaymentMethodName = styled.div`
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
`;

const SpecialRequests = styled.div`
  margin-bottom: 2rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #45bf55;
  }
`;

const Label = styled.label`
  display: block;
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const TermsCheckbox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 2rem;
  
  input {
    margin-top: 0.25rem;
  }
  
  label {
    color: #7f8c8d;
    font-size: 0.9rem;
    line-height: 1.4;
    margin: 0;
  }
  
  a {
    color: #45bf55;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const BookButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #45bf55 0%, #38a046 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(69, 191, 85, 0.3);
  }
  
  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
  margin-right: 0.5rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const TeamPaymentPage = () => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('bank-transfer');
  const [specialRequests, setSpecialRequests] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  const {
    selectedService,
    selectedPackage,
    selectedRoom,
    customHours,
    startDate,
    endDate,
    displayStartDate,
    displayEndDate,
    startTime,
    endTime
  } = location.state || {};

  useEffect(() => {
    if (!selectedService || !selectedPackage || !selectedRoom) {
      navigate('/team-booking');
      return;
    }
    
    // Check authentication
    if (!currentUser || !localStorage.getItem('token')) {
      setError('Please login to continue with booking');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }
    
    console.log('✅ User authenticated:', currentUser);
  }, [selectedService, selectedPackage, selectedRoom, currentUser, navigate]);

  const paymentMethods = [
    { id: 'bank-transfer', name: 'Bank Transfer', icon: '🏦' },
    { id: 'cash', name: 'Cash Payment', icon: '💵' },
    { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
    { id: 'momo', name: 'MoMo', icon: '📱' }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(`${date}T00:00:00`).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDurationText = (duration) => {
    if (!duration) {
      return selectedPackage?.name || '';
    }
    const unitMap = {
      hours: 'giờ',
      hour: 'giờ',
      days: 'ngày', 
      day: 'ngày',
      months: 'tháng',
      month: 'tháng',
      years: 'năm',
      year: 'năm'
    };
    const value = duration.value ?? duration.amount ?? duration.quantity ?? duration.number ?? '';
    const rawUnit = duration.unit || duration.type || duration.label || '';
    if (value && unitMap[rawUnit]) {
      return `${value} ${unitMap[rawUnit]}`;
    }
    if (duration.label) return duration.label;
    if (value && rawUnit) return `${value} ${rawUnit}`;
    return selectedPackage?.name || '';
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

  const handleBooking = async () => {
    if (!acceptedTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    if (!currentUser) {
      setError('User not authenticated. Please login again.');
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Get fresh token
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please login again.');
        navigate('/login');
        return;
      }

      const bookingData = {
        serviceType: selectedService.name,
        teamServiceId: selectedService._id || selectedService.id || selectedService.serviceId,
        teamRoomId: selectedRoom._id || selectedRoom.id || selectedRoom.roomId,
        durationPackageId: selectedPackage._id || selectedPackage.id || selectedPackage.packageId,
        startDate,
        endDate,
        startTime,
        endTime,
        customHours: customHours || null,
        paymentMethod: selectedPaymentMethod,
        paymentInfo: {
          method: selectedPaymentMethod,
          description: `Payment for ${selectedService.name} booking (${selectedRoom.name})`,
          serviceCategory: 'team',
          serviceType: selectedService.name,
          roomCode: selectedRoom.roomNumber,
          packageName: selectedPackage.name
        },
        specialRequests
      };

      console.log('🔄 Creating booking with data:', bookingData);

  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const response = await fetch(`${base}/api/team/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        
        if (response.status === 401) {
          setError('Authentication failed. Please login again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Booking response:', data);

      if (data.success) {
        setSuccess('Booking created successfully!');

        const normalizedBooking = normalizeTeamBooking(data.data, {
          selectedService,
          selectedPackage,
          selectedRoom,
          customHours,
          startDate,
          endDate,
          displayStartDate,
          displayEndDate,
          startTime,
          endTime,
          paymentMethod: selectedPaymentMethod,
          specialRequests
        });

        saveTeamBookingSnapshot(normalizedBooking);
        const confirmationPath = normalizedBooking.id
          ? `/team-booking/confirmation?bookingId=${normalizedBooking.id}`
          : '/team-booking/confirmation';

        setTimeout(() => {
          navigate(confirmationPath, {
            state: { booking: normalizedBooking }
          });
        }, 1200);
      } else {
        setError(data.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedService || !selectedPackage || !selectedRoom) {
    return null;
  }

  return (
    <>
      <Header />
      <Container>
        <BackButton onClick={() => navigate('/team-booking/rooms', { 
          state: { selectedService, selectedPackage, customHours, startDate, endDate, startTime, endTime } 
        })}>
          ← Back to Room Selection
        </BackButton>
        
        <HeaderSection>
          <Title>Complete Your <span>Booking</span></Title>
          <TeamBookingProgress />
        </HeaderSection>

      <ContentArea>
        <PaymentSection>
          <PaymentTitle>Payment & Details</PaymentTitle>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}

          <div>
            <Label>Payment Method</Label>
            <PaymentMethodsGrid>
              {paymentMethods.map((method) => (
                <PaymentMethodCard
                  key={method.id}
                  selected={selectedPaymentMethod === method.id}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                >
                  <PaymentMethodIcon>{method.icon}</PaymentMethodIcon>
                  <PaymentMethodName>{method.name}</PaymentMethodName>
                </PaymentMethodCard>
              ))}
            </PaymentMethodsGrid>
          </div>

          <SpecialRequests>
            <Label>Special Requests (Optional)</Label>
            <TextArea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Any special requirements for your booking..."
            />
          </SpecialRequests>

          <TermsCheckbox>
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
            />
            <label>
              I agree to the <a href="/terms" target="_blank">Terms and Conditions</a> and 
              <a href="/privacy" target="_blank"> Privacy Policy</a>
            </label>
          </TermsCheckbox>

          <BookButton
            onClick={handleBooking}
            disabled={loading || !acceptedTerms}
          >
            {loading && <LoadingSpinner />}
            {loading ? 'Processing...' : `Confirm Booking - ${formatPrice(calculateFinalPrice())}`}
          </BookButton>
        </PaymentSection>

        <BookingSummary>
          <SummaryTitle>Booking Summary</SummaryTitle>

          <SummaryItem>
            <SummaryLabel>Service</SummaryLabel>
            <SummaryValue>{selectedService.name}</SummaryValue>
          </SummaryItem>

          <SummaryItem>
            <SummaryLabel>Package</SummaryLabel>
            <SummaryValue>
              {selectedPackage.name}
              {customHours && ` (${customHours} hours)`}
            </SummaryValue>
          </SummaryItem>

          <SummaryItem>
            <SummaryLabel>Room</SummaryLabel>
            <SummaryValue>{selectedRoom.name}</SummaryValue>
          </SummaryItem>

          <SummaryItem>
            <SummaryLabel>Room Number</SummaryLabel>
            <SummaryValue>{selectedRoom.roomNumber}</SummaryValue>
          </SummaryItem>

          <SummaryItem>
            <SummaryLabel>Floor</SummaryLabel>
            <SummaryValue>{selectedRoom.floor}</SummaryValue>
          </SummaryItem>

          <SummaryItem>
            <SummaryLabel>Capacity</SummaryLabel>
            <SummaryValue>{selectedRoom.capacity} people</SummaryValue>
          </SummaryItem>

          <SummaryItem>
            <SummaryLabel>Date</SummaryLabel>
            <SummaryValue>{formatDate(displayStartDate || startDate)}</SummaryValue>
          </SummaryItem>

          {(selectedService.name === 'Meeting Room' || selectedService.name === 'Networking Space') && (
            <SummaryItem>
              <SummaryLabel>Time</SummaryLabel>
              <SummaryValue>{startTime} - {endTime}</SummaryValue>
            </SummaryItem>
          )}

          <SummaryItem>
            <SummaryLabel>Duration</SummaryLabel>
            <SummaryValue>
              {selectedPackage.isCustom && customHours 
                ? `${customHours} hours` 
                : getDurationText(selectedPackage.duration)
              }
            </SummaryValue>
          </SummaryItem>

          <SummaryItem>
            <SummaryLabel>Total Price</SummaryLabel>
            <SummaryValue>{formatPrice(calculateFinalPrice())}</SummaryValue>
          </SummaryItem>
        </BookingSummary>
      </ContentArea>
    </Container>
    <Footer />
    </>
  );
};

export default TeamPaymentPage;