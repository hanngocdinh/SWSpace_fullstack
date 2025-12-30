import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useBooking } from '../../contexts/BookingContext';

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

const DateSelectionContainer = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin: 2rem auto;
  max-width: 600px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  font-size: 1rem;
  color: #333;
  font-weight: 500;
`;

const CustomDatePickerWrapper = styled.div`
  .react-datepicker-wrapper {
    width: 100%;
  }

  .react-datepicker__input-container input {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.3s;

    &:focus {
      outline: none;
      border-color: #45bf55;
      box-shadow: 0 0 0 2px rgba(69, 191, 85, 0.2);
    }
  }
  
  .react-datepicker {
    border-color: #ddd;
    font-family: inherit;
  }
  
  .react-datepicker__day--selected {
    background-color: #45bf55;
  }
  
  .react-datepicker__day--keyboard-selected {
    background-color: rgba(69, 191, 85, 0.5);
  }
  
  .react-datepicker__day:hover {
    background-color: rgba(69, 191, 85, 0.2);
  }
`;

const TimeOptionsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin: 1rem 0;
`;

const TimeOption = styled.div`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  
  ${props => props.selected && `
    background-color: #45bf55;
    color: white;
    border-color: #45bf55;
  `}
  
  &:hover {
    border-color: #45bf55;
    background-color: ${props => props.selected ? '#45bf55' : 'rgba(69, 191, 85, 0.1)'};
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

const DateSelectionPage = () => {
  const { bookingState, selectDate } = useBooking();
  const navigate = useNavigate();
  
  // Redirect if service type or package is not selected
  if (!bookingState.serviceType || !bookingState.packageType) {
    navigate('/booking/service');
    return null;
  }
  
  // State để lưu trữ ngày và giờ đã chọn
  const [selectedDate, setSelectedDate] = useState(
    bookingState.date ? new Date(bookingState.date) : null
  );
  const [selectedTime, setSelectedTime] = useState(() => {
    if (bookingState.time) return bookingState.time;
    if (bookingState.date) {
      const existing = new Date(bookingState.date);
      return `${String(existing.getHours()).padStart(2, '0')}:${String(existing.getMinutes()).padStart(2, '0')}`;
    }
    return null;
  });
  
  // Danh sách các khung giờ có sẵn
  const timeSlots = ['9:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  
  // Xử lý khi chọn ngày
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset selected time when date changes
  };
  
  // Xử lý khi chọn giờ
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };
  
  // Xử lý khi nhấn Next
  const handleNextStep = () => {
    if (selectedDate && selectedTime) {
      // Tạo date object với ngày và giờ đã chọn
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const dateTime = new Date(selectedDate);
      dateTime.setHours(hours, minutes, 0, 0);
      
      selectDate(new Date(dateTime), null, selectedTime, null);
      navigate('/booking/seat');
    }
  };
  
  // Xử lý khi nhấn Back
  const handleBackStep = () => {
    navigate('/booking/package');
  };

  // Giới hạn ngày cho date picker (chỉ cho phép chọn ngày từ ngày hiện tại trở đi)
  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 2); // Cho phép đặt chỗ tối đa 2 tháng trước

  return (
    <PageContainer>
      <Header />
      <MainContent>
        <SectionContainer>
          <BookingHeader>
            <BookingTitle>Select Date & Time</BookingTitle>
            <BookingSubtitle>Choose when you'd like to reserve your workspace</BookingSubtitle>
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
              <StepCircle active={false}>4</StepCircle>
              <StepLabel active={false}>Seat</StepLabel>
            </Step>
            <Step>
              <StepCircle active={false}>5</StepCircle>
              <StepLabel active={false}>Booking</StepLabel>
            </Step>
          </StepsContainer>
          
          <DateSelectionContainer>
            <FormGroup>
              <Label>Select Date</Label>
              <CustomDatePickerWrapper>
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  dateFormat="MMMM d, yyyy"
                  minDate={minDate}
                  maxDate={maxDate}
                  placeholderText="Select a date"
                  required
                  inline
                />
              </CustomDatePickerWrapper>
            </FormGroup>
            
            {selectedDate && (
              <FormGroup>
                <Label>Select Time</Label>
                <TimeOptionsContainer>
                  {timeSlots.map((time) => (
                    <TimeOption 
                      key={time} 
                      selected={selectedTime === time}
                      onClick={() => handleTimeSelect(time)}
                    >
                      {time}
                    </TimeOption>
                  ))}
                </TimeOptionsContainer>
              </FormGroup>
            )}
            
            <ActionContainer>
              <BackButton onClick={handleBackStep}>
                Back
              </BackButton>
              <NextButton 
                disabled={!selectedDate || !selectedTime}
                onClick={handleNextStep}
              >
                Next Step
              </NextButton>
            </ActionContainer>
          </DateSelectionContainer>
        </SectionContainer>
      </MainContent>
      <Footer />
    </PageContainer>
  );
};

export default DateSelectionPage;