import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FaCreditCard, FaUniversity, FaQrcode, FaCheckCircle, FaPlus, FaStar, FaMobileAlt, FaPaypal } from 'react-icons/fa';
import BookingLayout from './BookingLayout';
import { useBooking } from '../../contexts/BookingContext';
import { useAuth } from '../../contexts/AuthContext';
import { resolveBookingDurationLabel } from '../../utils/bookingDuration';

const PaymentContainer = styled.div`
  background-color: #fff;
  margin: 1rem 0;
`;

const BookingSummary = styled.div`
  margin: 2rem 0;
  
  @media (max-width: 768px) {
    margin: 1.5rem 0;
  }
  
  @media (max-width: 480px) {
    margin: 1.25rem 0;
  }
`;

const SummaryTitle = styled.h4`
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e0e0e0;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 1.25rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
`;

const SummaryRow = styled.div`
  display: flex;
  margin-bottom: 1rem;
  font-size: 1rem;
  color: #333;
  
  @media (max-width: 768px) {
    flex-direction: column;
    margin-bottom: 1.5rem;
  }
`;

const SummaryLabel = styled.div`
  font-weight: 500;
  width: 150px;
  
  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: 0.25rem;
  }
`;

const SummaryValue = styled.div`
  flex: 1;
`;

const PriceSummary = styled.div`
  margin-top: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  
  @media (max-width: 480px) {
    padding: 1rem;
    margin-top: 1.5rem;
  }
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 1rem;
  color: #333;
`;

const TotalRow = styled(PriceRow)`
  font-weight: bold;
  font-size: 1.2rem;
  border-top: 1px solid #ddd;
  margin-top: 1rem;
  padding-top: 1rem;
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const PaymentMethodTitle = styled.h4`
  font-size: 1.3rem;
  color: #333;
  margin: 2rem 0 1rem;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
    margin: 1.5rem 0 0.75rem;
  }
`;

const PaymentMethodsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
`;

const PaymentMethodCard = styled.div`
  border: 2px solid ${props => props.selected ? '#45bf55' : '#e0e0e0'};
  border-radius: 8px;
  padding: 1.5rem;
  flex: 1;
  min-width: 200px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  background-color: ${props => props.selected ? 'rgba(69, 191, 85, 0.1)' : 'white'};
  
  &:hover {
    border-color: #45bf55;
    transform: translateY(-2px);
  }
  
  @media (max-width: 480px) {
    padding: 1.25rem;
    min-width: auto;
  }
`;

const PaymentMethodIcon = styled.div`
  font-size: 1.8rem;
  margin-right: 1rem;
  color: #45bf55;
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const PaymentMethodInfo = styled.div``;

const PaymentMethodName = styled.div`
  font-weight: 500;
  font-size: 1rem;
  margin-bottom: 0.25rem;
`;

const PaymentMethodDescription = styled.div`
  font-size: 0.8rem;
  color: #666;
`;

const SavedPaymentMethodsSection = styled.div`
  margin: 2rem 0;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: ${props => props.hasSelection ? '2px solid #45bf55' : '1px solid #e0e0e0'};
`;

const SavedMethodsTitle = styled.h4`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SavedMethodCard = styled.div`
  background: white;
  border: 2px solid ${props => props.selected ? '#45bf55' : '#e0e0e0'};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  &:hover {
    border-color: #45bf55;
    transform: translateY(-1px);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SavedMethodInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SavedMethodIcon = styled.div`
  font-size: 1.5rem;
  color: #45bf55;
`;

const SavedMethodDetails = styled.div``;

const SavedMethodName = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 0.25rem;
`;

const SavedMethodType = styled.div`
  font-size: 0.85rem;
  color: #666;
`;

const DefaultBadge = styled.span`
  background: #45bf55;
  color: white;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  text-transform: uppercase;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const AddNewMethodButton = styled.button`
  background: white;
  border: 2px dashed #45bf55;
  border-radius: 8px;
  padding: 1rem;
  width: 100%;
  cursor: pointer;
  transition: all 0.3s;
  color: #45bf55;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  
  &:hover {
    background: rgba(69, 191, 85, 0.05);
    transform: translateY(-1px);
  }
`;

const PaymentSectionDivider = styled.div`
  display: flex;
  align-items: center;
  margin: 2rem 0;
  
  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e0e0e0;
  }
  
  span {
    padding: 0 1rem;
    color: #666;
    font-size: 0.9rem;
  }
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

const PayButton = styled.button`
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
    order: -1; /* Make the Pay button appear before the Back button on mobile */
  }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const LoadingIndicator = styled.span`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.5);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const ButtonContent = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
`;

// Phương thức thanh toán
const paymentMethods = [
  {
    id: 'credit-card',
    name: 'Credit/Debit Card',
    description: 'Pay securely with your card',
    icon: <FaCreditCard />
  },
  {
    id: 'bank-transfer',
    name: 'Bank Transfer',
    description: 'Pay via bank transfer',
    icon: <FaUniversity />
  },
  {
    id: 'momo',
    name: 'MoMo',
    description: 'Pay with MoMo e-wallet',
    icon: <FaQrcode />
  }
];

const PaymentPage = () => {
  const { bookingState, selectPaymentMethod, confirmBooking, forceRefreshOccupiedSeats } = useBooking();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [validationError, setValidationError] = useState('');
  const [savedPaymentMethods, setSavedPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSavedMethod, setSelectedSavedMethod] = useState(null);
  const [showQuickPayment, setShowQuickPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Redirect if previous steps are not completed
  useEffect(() => {
    if (!bookingState.serviceType || !bookingState.packageDuration || !bookingState.date) {
      navigate('/booking/service');
      return;
    }
    if (bookingState.serviceType !== 'hot-desk' && !bookingState.selectedSeat) {
      navigate('/booking/seat');
    }
  }, [bookingState, navigate]);

  // Fetch saved payment methods
  useEffect(() => {
    fetchSavedPaymentMethods();
  }, []);

  const fetchSavedPaymentMethods = async () => {
    try {
      const token = localStorage.getItem('token');
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/payment-methods`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔄 Fetched saved payment methods:', data.paymentMethods);
        setSavedPaymentMethods(data.paymentMethods || []);
        
        // Auto-select default payment method if available
        const defaultMethod = data.paymentMethods?.find(method => method.isDefault);
        if (defaultMethod) {
          setSelectedSavedMethod(defaultMethod);
          setShowQuickPayment(true);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching saved payment methods:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePaymentMethodSelect = (methodId) => {
    selectPaymentMethod(methodId);
    setValidationError('');
    setSelectedSavedMethod(null);
    setShowQuickPayment(false);
  };

  const handleSavedMethodSelect = (paymentMethod) => {
    setSelectedSavedMethod(paymentMethod);
    setShowQuickPayment(true);
    selectPaymentMethod(null); // Clear regular payment method selection
    setValidationError('');
  };

  const getPaymentMethodIcon = (type) => {
    switch (type) {
      case 'credit-card':
      case 'debit-card':
        return <FaCreditCard />;
      case 'bank-transfer':
        return <FaUniversity />;
      case 'momo':
      case 'zalopay':
      case 'vnpay':
        return <FaMobileAlt />;
      case 'paypal':
        return <FaPaypal />;
      default:
        return <FaCreditCard />;
    }
  };
  
  const handlePayment = async () => {
    if (isProcessing) return;
    if (!bookingState.paymentMethod && !selectedSavedMethod) {
      setValidationError('Please select a payment method to continue.');
      return;
    }
    
    console.log('💳 Processing payment...');
    setValidationError('');
    setIsProcessing(true);
    
    try {
      // Use saved payment method if selected
      const paymentInfo = selectedSavedMethod ? {
        method: 'saved',
        savedMethodId: selectedSavedMethod._id,
        methodType: selectedSavedMethod.type,
        displayName: selectedSavedMethod.displayName
      } : {
        method: bookingState.paymentMethod
      };

      console.log('💳 Payment info:', paymentInfo);
      
      const result = await confirmBooking(paymentInfo);
      
      if (result.success) {
        console.log('✅ Payment successful, booking created:', result.booking);
        
        // Optional refresh
        try { await forceRefreshOccupiedSeats(); } catch {}
        
        // Thông báo thành công và chuyển đến trang xác nhận
        alert('Payment successful! Your workspace has been reserved.');
        const confirmationPath = result.booking?.id
          ? `/booking/confirmation?bookingId=${result.booking.id}`
          : '/booking/confirmation';
        navigate(confirmationPath);
      } else {
        console.error('❌ Payment failed:', result.message);
        setValidationError(result.message || 'Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('💥 Payment error:', error);
      setValidationError('Payment processing error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleBackStep = () => {
    if (bookingState.serviceType === 'hot-desk') navigate('/booking/date');
    else navigate('/booking/seat');
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not selected';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('en-US', options);
  };
  
  // Format tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <BookingLayout
      title="Payment"
      subtitle="Complete your booking by selecting a payment method"
    >
      <PaymentContainer>
        <BookingSummary>
          <SummaryTitle>Booking Details</SummaryTitle>
          
          <SummaryRow>
            <SummaryLabel>Customer:</SummaryLabel>
            <SummaryValue>{currentUser?.fullName || 'Not Available'}</SummaryValue>
          </SummaryRow>
          
          <SummaryRow>
            <SummaryLabel>Service:</SummaryLabel>
            <SummaryValue>
              {bookingState.serviceType === 'hot-desk' ? 'Hot Desk' : 'Fixed Desk'}
            </SummaryValue>
          </SummaryRow>
          
          <SummaryRow>
            <SummaryLabel>Duration:</SummaryLabel>
            <SummaryValue>
              {resolveBookingDurationLabel(bookingState)}
            </SummaryValue>
          </SummaryRow>
          
          <SummaryRow>
            <SummaryLabel>Date & Time:</SummaryLabel>
            <SummaryValue>{formatDate(bookingState.date)}</SummaryValue>
          </SummaryRow>
          
          {bookingState.serviceType !== 'hot-desk' && (
            <SummaryRow>
              <SummaryLabel>Seat:</SummaryLabel>
              <SummaryValue>{bookingState.selectedSeat?.name || 'Not selected'}</SummaryValue>
            </SummaryRow>
          )}
          
          <PriceSummary>
            <PriceRow>
              <div>Base Price:</div>
              <div>{formatCurrency(bookingState.paymentDetails.totalAmount)}</div>
            </PriceRow>
            
            {bookingState.paymentDetails.discount > 0 && (
              <PriceRow>
                <div>Discount:</div>
                <div>- {formatCurrency(bookingState.paymentDetails.discount)}</div>
              </PriceRow>
            )}
            
            <TotalRow>
              <div>Total Amount:</div>
              <div>{formatCurrency(bookingState.paymentDetails.finalAmount)}</div>
            </TotalRow>
          </PriceSummary>
        </BookingSummary>
        
        {/* Saved Payment Methods Section */}
        {!loading && savedPaymentMethods.length > 0 && (
          <SavedPaymentMethodsSection hasSelection={showQuickPayment}>
            <SavedMethodsTitle>
              <FaCreditCard />
              Saved Payment Methods
            </SavedMethodsTitle>
            
            {savedPaymentMethods.map((method) => (
              <SavedMethodCard
                key={method._id}
                selected={selectedSavedMethod?._id === method._id}
                onClick={() => handleSavedMethodSelect(method)}
              >
                <SavedMethodInfo>
                  <SavedMethodIcon>
                    {getPaymentMethodIcon(method.type)}
                  </SavedMethodIcon>
                  <SavedMethodDetails>
                    <SavedMethodName>{method.displayName}</SavedMethodName>
                    <SavedMethodType>
                      {method.type.replace('-', ' ').toUpperCase()}
                    </SavedMethodType>
                  </SavedMethodDetails>
                </SavedMethodInfo>
                
                {method.isDefault && (
                  <DefaultBadge>
                    <FaStar size={10} />
                    Default
                  </DefaultBadge>
                )}
              </SavedMethodCard>
            ))}
            
            <AddNewMethodButton onClick={() => navigate('/payment-methods')}>
              <FaPlus />
              Add New Payment Method
            </AddNewMethodButton>
          </SavedPaymentMethodsSection>
        )}

        {/* Payment Method Divider */}
        {!loading && savedPaymentMethods.length > 0 && (
          <PaymentSectionDivider>
            <span>or choose a different payment method</span>
          </PaymentSectionDivider>
        )}

        <PaymentMethodTitle>
          {savedPaymentMethods.length > 0 ? 'Other Payment Options' : 'Select Payment Method'}
        </PaymentMethodTitle>
        <PaymentMethodsContainer>
          {paymentMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              selected={bookingState.paymentMethod === method.id && !showQuickPayment}
              onClick={() => handlePaymentMethodSelect(method.id)}
            >
              <PaymentMethodIcon>{method.icon}</PaymentMethodIcon>
              <PaymentMethodInfo>
                <PaymentMethodName>{method.name}</PaymentMethodName>
                <PaymentMethodDescription>{method.description}</PaymentMethodDescription>
              </PaymentMethodInfo>
            </PaymentMethodCard>
          ))}
        </PaymentMethodsContainer>
        
        {validationError && (
          <div style={{ color: '#e74c3c', textAlign: 'center', margin: '1rem 0' }}>
            {validationError}
          </div>
        )}
        
        <ActionContainer>
          <BackButton onClick={handleBackStep}>
            Back
          </BackButton>
          <PayButton 
            onClick={handlePayment}
            disabled={isProcessing || (!bookingState.paymentMethod && !selectedSavedMethod)}
          >
            {isProcessing ? (
              <ButtonContent>
                <LoadingIndicator />
                Processing...
              </ButtonContent>
            ) : (
              selectedSavedMethod ? `Pay with ${selectedSavedMethod.displayName}` : 'Complete Payment'
            )}
          </PayButton>
        </ActionContainer>
      </PaymentContainer>
    </BookingLayout>
  );
};

export default PaymentPage;