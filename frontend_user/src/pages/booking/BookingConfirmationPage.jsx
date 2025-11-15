import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaEnvelope, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import BookingLayout from './BookingLayout';
import { useBooking } from '../../contexts/BookingContext';
import { useAuth } from '../../contexts/AuthContext';
import QRGenerator from '../../components/QRGenerator';

const ConfirmationContainer = styled.div`
  background-color: #fff;
  margin: 1rem 0;
`;

const SuccessMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1rem 0 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e0e0e0;
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 1.25rem;
    padding-bottom: 1.25rem;
  }
`;

const CheckIcon = styled(FaCheckCircle)`
  color: #45bf55;
  font-size: 4rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 3.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 3rem;
    margin-bottom: 0.75rem;
  }
`;

const SuccessTitle = styled.h3`
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.4rem;
  }
`;

const SuccessText = styled.p`
  font-size: 1.1rem;
  color: #555;
  text-align: center;
  max-width: 500px;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 0 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

const EmailNotification = styled.div`
  background: linear-gradient(135deg, #e8f5e8, #f0f8f0);
  border: 2px solid #45bf55;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 2rem 0;
  text-align: center;
  box-shadow: 0 4px 12px rgba(69, 191, 85, 0.15);
  
  @media (max-width: 768px) {
    padding: 1.25rem;
    margin: 1.5rem 0;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
    margin: 1.25rem 0;
  }
`;

const EmailIcon = styled.div`
  font-size: 2.5rem;
  color: #45bf55;
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  
  @media (max-width: 480px) {
    font-size: 2rem;
    margin-bottom: 0.75rem;
  }
`;

const EmailTitle = styled.h4`
  color: #2d5a2d;
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const EmailText = styled.p`
  color: #4a6b4a;
  font-size: 1rem;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const BookingReference = styled.div`
  background-color: #fff;
  border: 2px dashed #45bf55;
  border-radius: 8px;
  padding: 1rem;
  margin: 1.5rem 0;
  text-align: center;
  
  @media (max-width: 480px) {
    padding: 0.8rem;
    margin: 1.25rem 0;
  }
`;

const ReferenceLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ReferenceNumber = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #45bf55;
  letter-spacing: 1px;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;

const NextSteps = styled.div`
  background-color: #fff8dc;
  border: 1px solid #f4d03f;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 2rem 0;
  
  @media (max-width: 480px) {
    padding: 1.25rem;
    margin: 1.5rem 0;
  }
`;

const NextStepsTitle = styled.h4`
  color: #8b6914;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const NextStepsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NextStepItem = styled.li`
  color: #8b6914;
  padding: 0.5rem 0;
  font-size: 0.95rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  
  &::before {
    content: "✓";
    color: #45bf55;
    font-weight: bold;
    margin-top: 0.1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const ContactInfo = styled.div`
  background-color: #f0f8ff;
  border: 1px solid #b3d9ff;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 2rem 0;
  
  @media (max-width: 480px) {
    padding: 1.25rem;
    margin: 1.5rem 0;
  }
`;

const ContactTitle = styled.h4`
  color: #1e5aa8;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const ContactDetail = styled.p`
  color: #2c5aa0;
  margin: 0.5rem 0;
  font-size: 0.95rem;
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
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

const ImportantNote = styled.div`
  background-color: #f8f9fa;
  border-left: 4px solid #45bf55;
  padding: 1rem;
  margin: 1.5rem 0;
  font-size: 0.9rem;
  color: #333;
  
  @media (max-width: 768px) {
    padding: 0.9rem;
    margin: 1.25rem 0;
  }
  
  @media (max-width: 480px) {
    padding: 0.8rem;
    margin: 1rem 0;
    font-size: 0.85rem;
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

const ConfirmButton = styled.button`
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
  
  @media (max-width: 768px) {
    padding: 0.7rem 1.8rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.7rem 1.5rem;
    font-size: 0.95rem;
    width: 100%;
    max-width: 200px;
    order: -1; /* Make the Confirm button appear before the Back button on mobile */
  }
`;

const BookingConfirmationPage = () => {
  const { bookingState, resetBooking, forceRefreshOccupiedSeats } = useBooking();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [emailSent, setEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Redirect if previous steps are not completed
  React.useEffect(() => {
    if (!bookingState.serviceType || !bookingState.packageDuration || !bookingState.date || !bookingState.selectedSeat || !bookingState.paymentMethod) {
      navigate('/booking/service');
    }
  }, [bookingState, navigate]);
  
  const handleDone = async () => {
    // Force refresh occupied seats one more time before going home
    console.log('🏠 Done button clicked, final refresh before going home...');
    try {
      await forceRefreshOccupiedSeats();
    } catch (error) {
      console.log('⚠️ Could not refresh seats on done, but continuing...');
    }
    
    resetBooking();
    navigate('/');
  };
  
  const handleBackStep = () => {
    navigate('/booking/payment');
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <BookingLayout
      title="Booking Confirmation"
      subtitle="Review and confirm your workspace reservation"
    >
      <ConfirmationContainer>
        {!bookingState.bookingComplete ? (
          <>
            <BookingSummary>
              <SummaryTitle>Booking Details</SummaryTitle>
              
              <SummaryRow>
                <SummaryLabel>Customer:</SummaryLabel>
                <SummaryValue>{currentUser?.fullName || 'Not Available'}</SummaryValue>
              </SummaryRow>
              
              <SummaryRow>
                <SummaryLabel>Service:</SummaryLabel>
                <SummaryValue>{bookingState.serviceType === 'hot-desk' ? 'Hot Desk' : 'Fixed Desk'}</SummaryValue>
              </SummaryRow>
              
              <SummaryRow>
                <SummaryLabel>Duration:</SummaryLabel>
                <SummaryValue>
                  {bookingState.packageDuration === 'daily' && 'Daily'}
                  {bookingState.packageDuration === 'weekly' && 'Weekly'}
                  {bookingState.packageDuration === 'monthly' && 'Monthly'}
                  {bookingState.packageDuration === 'yearly' && 'Yearly'}
                </SummaryValue>
              </SummaryRow>
              
              <SummaryRow>
                <SummaryLabel>Price:</SummaryLabel>
                <SummaryValue>
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    minimumFractionDigits: 0
                  }).format(bookingState.paymentDetails.finalAmount)}
                </SummaryValue>
              </SummaryRow>
              
              <SummaryRow>
                <SummaryLabel>Payment Method:</SummaryLabel>
                <SummaryValue>
                  {bookingState.paymentMethod === 'credit-card' && 'Credit/Debit Card'}
                  {bookingState.paymentMethod === 'bank-transfer' && 'Bank Transfer'}
                  {bookingState.paymentMethod === 'momo' && 'MoMo'}
                </SummaryValue>
              </SummaryRow>
              
              <SummaryRow>
                <SummaryLabel>Date & Time:</SummaryLabel>
                <SummaryValue>{formatDate(bookingState.date)}</SummaryValue>
              </SummaryRow>
              
              <SummaryRow>
                <SummaryLabel>Seat:</SummaryLabel>
                <SummaryValue>{bookingState.selectedSeat?.name || 'Not selected'}</SummaryValue>
              </SummaryRow>
            </BookingSummary>
            
            <ImportantNote>
              <strong>Important:</strong> By confirming this booking, you agree to our terms and conditions.
              You will receive an email confirmation with your booking details shortly after completion.
            </ImportantNote>
            
            <ActionContainer>
              <BackButton onClick={handleBackStep}>
                Back to Payment
              </BackButton>
              <ConfirmButton onClick={handleDone}>
                Done
              </ConfirmButton>
            </ActionContainer>
          </>
        ) : (
          <>
            <SuccessMessage>
              <CheckIcon />
              <SuccessTitle>Booking Successful!</SuccessTitle>
              <SuccessText>
                Your workspace has been successfully reserved and is ready for use.
              </SuccessText>
            </SuccessMessage>

            {/* Email Confirmation Notification */}
            <EmailNotification>
              <EmailIcon>
                <FaEnvelope />
              </EmailIcon>
              <EmailTitle>Confirmation Email Sent!</EmailTitle>
              <EmailText>
                A detailed booking confirmation has been sent to <strong>{currentUser?.email}</strong>
                <br />
                Please check your inbox (and spam folder) for the confirmation email with all your booking details.
              </EmailText>
            </EmailNotification>

            {/* Booking Reference */}
            {bookingState.bookingReference && (
              <BookingReference>
                <ReferenceLabel>Your Booking Reference</ReferenceLabel>
                <ReferenceNumber>{bookingState.bookingReference}</ReferenceNumber>
              </BookingReference>
            )}

            {/* Next Steps */}
            <NextSteps>
              <NextStepsTitle>
                <FaCheckCircle />
                What's Next?
              </NextStepsTitle>
              <NextStepsList>
                <NextStepItem>Arrive 10 minutes before your scheduled time</NextStepItem>
                <NextStepItem>Bring a valid ID for check-in verification</NextStepItem>
                <NextStepItem>Show your booking reference or confirmation email at reception</NextStepItem>
                <NextStepItem>Enjoy your productive workspace experience!</NextStepItem>
              </NextStepsList>
            </NextSteps>

            {/* QR Code Generator */}
            {bookingState.confirmedBooking && (
              <QRGenerator 
                booking={bookingState.confirmedBooking}
                onQRGenerated={(qrData) => {
                  console.log('🎯 QR Generated for booking:', qrData);
                }}
              />
            )}

            {/* Contact Information */}
            <ContactInfo>
              <ContactTitle>Need Help or Have Questions?</ContactTitle>
              <ContactDetail><strong>📍 Address:</strong> 03 Quang Trung, Da Nang City</ContactDetail>
              <ContactDetail><strong>📞 Phone:</strong> 0905965494</ContactDetail>
              <ContactDetail><strong>📧 Email:</strong> info@swspace.com.vn</ContactDetail>
              <ContactDetail><strong>🕒 Operating Hours:</strong> Monday - Sunday, 24/7</ContactDetail>
            </ContactInfo>

            <ActionContainer>
              <ConfirmButton onClick={handleDone}>
                Return to Homepage
              </ConfirmButton>
            </ActionContainer>
          </>
        )}
      </ConfirmationContainer>
    </BookingLayout>
  );
};

export default BookingConfirmationPage;