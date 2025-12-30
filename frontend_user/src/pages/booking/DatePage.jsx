import React, { useState, useEffect, useMemo } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import BookingLayout from './BookingLayout';
import { useBooking } from '../../contexts/BookingContext';
import { addDays, addWeeks } from 'date-fns';

const DateSelectionContainer = styled.div`
  background-color: #fff;
  margin: 2rem auto;
  max-width: 800px;
  
  @media (max-width: 768px) {
    margin: 1.5rem auto;
  }
  
  @media (max-width: 480px) {
    margin: 1rem auto;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 480px) {
    margin-bottom: 1.25rem;
  }
`;

const DateRangeContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const DateCard = styled.div`
  flex: 1;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #eee;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  background-color: ${props => props.disabled ? '#f9f9f9' : '#fff'};
  
  h4 {
    margin-top: 0;
    color: #333;
    margin-bottom: 1rem;
  }
`;

const HighlightedInfo = styled.div`
  background-color: #f0f8f0;
  border-radius: 6px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  p {
    margin: 0;
    color: #45bf55;
    font-weight: 500;
  }
`;

const SeatsBadge = styled.span`
  background: #e8f6ea;
  color: #2f9a3e;
  border: 1px solid #bfe6c6;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 600;
`;

const Label = styled.label`
  font-size: 1rem;
  color: #333;
  font-weight: 500;
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
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
    
    @media (max-width: 480px) {
      font-size: 0.9rem;
    }
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
  
  @media (max-width: 480px) {
    .react-datepicker {
      margin: 0 auto;
    }
    
    .react-datepicker__month-container {
      width: 100%;
    }
  }
`;

const TimeSelect = styled.select`
  width: 100%;
  padding: 0.8rem 0.9rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  background: #fff;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #45bf55;
    box-shadow: 0 0 0 2px rgba(69, 191, 85, 0.2);
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

const DatePage = () => {
  const { bookingState, selectDate, occupiedSeats = [], occupiedSummary, fetchOccupiedSeats } = useBooking();
  const navigate = useNavigate();
  
  // Redirect if service type or package duration is not selected
  useEffect(() => {
    if (!bookingState.serviceType || !bookingState.packageDuration) {
      navigate('/booking/service');
    }
  }, [bookingState.serviceType, bookingState.packageDuration, navigate]);
  
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
  const [now, setNow] = useState(new Date());
  const [validationMsg, setValidationMsg] = useState('');

  // Lấy gói đã chọn từ danh sách packages (ID được lưu trong packageDuration/selectedPackageId)
  const selectedPkg = useMemo(() => {
    const id = bookingState.selectedPackageId || bookingState.packageDuration;
    return (bookingState.packages || []).find(p => String(p.id) === String(id)) || null;
  }, [bookingState.selectedPackageId, bookingState.packageDuration, bookingState.packages]);
  
  // Tính toán ngày kết thúc dựa trên package duration
  const calculateEndDate = (startDate) => {
    if (!startDate) return null;
    
    const date = new Date(startDate);
    
    switch(selectedPkg?.unit_code) {
      case 'day':
        return addDays(date, 1);
      case 'week':
        return addDays(date, 7);
      case 'month':
        return addDays(date, 30); // Theo yêu cầu: Month = 30 ngày
      case 'year':
        return addDays(date, 365); // Theo yêu cầu: Year = 365 ngày
      default:
        return date;
    }
  };
  
  // Hiển thị thông tin về thời gian của gói
  const getDurationLabel = () => {
    switch(selectedPkg?.unit_code) {
      case 'day':
        return 'Usage duration: 1 day';
      case 'week':
        return 'Usage duration: 7 days';
      case 'month':
        return 'Usage duration: 30 days';
      case 'year':
        return 'Usage duration: 365 days';
      default:
        return '';
    }
  };
  
  // Tính ngày kết thúc dựa trên ngày bắt đầu đã chọn
  const endDate = useMemo(() => (
    selectedDate ? calculateEndDate(selectedDate) : null
  ), [selectedDate, selectedPkg]);

  // End datetime hiển thị = endDate tại cùng giờ với start, trừ 1 phút
  const getEndDateMinusOneMinute = useMemo(() => {
    if (!selectedDate || !selectedTime || !endDate) return null;
    const [sh, sm] = selectedTime.split(':').map(Number);
    const e = new Date(endDate);
    e.setHours(sh, sm, 0, 0);
    e.setMinutes(e.getMinutes() - 1);
    return e;
  }, [endDate, selectedDate, selectedTime]);
  
  // Danh sách khung giờ 24h (30 phút) nhưng nếu là ngày hôm nay thì chỉ hiện từ mốc half-hour kế tiếp
  const timeSlots = useMemo(() => {
    const endMinutes = (24 * 60) - 30; // 23:30
    let minStart = 0; // 00:00 default
    if (selectedDate) {
      const todayStr = new Date(now).toDateString();
      const selStr = new Date(selectedDate).toDateString();
      if (todayStr === selStr) {
        const cur = new Date(now);
        const curMin = cur.getHours() * 60 + cur.getMinutes();
        // Làm tròn lên half-hour kế tiếp (ví dụ 16:25 -> 16:30, 16:54 -> 17:00)
        const nextHalfHour = Math.ceil((curMin + 1) / 30) * 30;
        minStart = Math.min(nextHalfHour, endMinutes + 30); // nếu vượt quá cuối ngày thì danh sách rỗng
      }
    }
    const slots = [];
    for (let m = minStart; m <= endMinutes; m += 30) {
      const hh = Math.floor(m / 60).toString().padStart(2, '0');
      const mm = (m % 60).toString().padStart(2, '0');
      slots.push(`${hh}:${mm}`);
    }
    return slots;
  }, [selectedDate, now]);

  // Nếu đang chọn hôm nay và thời gian thực chuyển qua half-hour tiếp theo khiến slot đã chọn không còn hợp lệ
  useEffect(() => {
    if (!selectedDate || !selectedTime) return;
    const isToday = new Date(selectedDate).toDateString() === new Date(now).toDateString();
    if (isToday && !timeSlots.includes(selectedTime)) {
      setValidationMsg('Khung giờ đã thay đổi trong lúc bạn chọn. Vui lòng chọn lại thời gian.');
    } else if (validationMsg.startsWith('Khung giờ')) {
      setValidationMsg('');
    }
  }, [timeSlots, selectedDate, selectedTime, now]);
  
  // Xử lý khi chọn ngày
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset selected time when date changes
    setValidationMsg('');
  };
  
  // Xử lý khi chọn giờ
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setValidationMsg('');
  };
  
  // Format date to string
  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  const formatDateTime = (date, time) => {
    if (!date || !time) return '';
    return `${formatDate(date)} at ${time}`;
  };
  
  // Xử lý khi nhấn Next
  const handleNextStep = () => {
    if (selectedDate && selectedTime) {
      // Nếu slot không còn hợp lệ theo thời gian thực (đặc biệt là hôm nay)
      const isToday = new Date(selectedDate).toDateString() === new Date(now).toDateString();
      if (isToday && !timeSlots.includes(selectedTime)) {
        setValidationMsg('Khung giờ đã thay đổi trong lúc bạn chọn. Vui lòng chọn lại thời gian.');
        return;
      }
      // Validate thời gian không ở quá khứ (đặc biệt là hôm nay)
      const [hh, mm] = selectedTime.split(':').map(Number);
      const start = new Date(selectedDate);
      start.setHours(hh, mm, 0, 0);
      if (start <= now) {
        setValidationMsg('Thời gian đã qua. Vui lòng chọn lại thời gian mới.');
        return;
      }

      // Tạo date object với ngày và giờ đã chọn
      const dateTime = new Date(start);
      
      // Tạo end date với cùng giờ - trừ 1 phút
      const endDateTimeBase = calculateEndDate(dateTime);
      const endDateTime = new Date(endDateTimeBase);
      endDateTime.setMinutes(endDateTime.getMinutes() - 1);
      
      // Lưu thông tin ngày giờ bắt đầu và kết thúc
      const endTimeDisplay = `${String(endDateTime.getHours()).padStart(2, '0')}:${String(endDateTime.getMinutes()).padStart(2, '0')}`;
      const nextRoute = bookingState.serviceType === 'hot-desk' ? '/booking/payment' : '/booking/seat';

      flushSync(() => {
        selectDate(
          new Date(dateTime), 
          new Date(endDateTime),
          selectedTime,
          endTimeDisplay
        );
      });

      navigate(nextRoute);
    }
  };
  
  // Xử lý khi nhấn Back
  const handleBackStep = () => {
    navigate('/booking/package-duration');
  };

  // Giới hạn ngày cho date picker (chỉ cho phép chọn ngày từ ngày hiện tại trở đi)
  const minDate = new Date(now);
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 2); // Cho phép đặt chỗ tối đa 2 tháng trước

  // Cập nhật real-time mỗi 30 giây để chuyển ngày và cập nhật slot giờ
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  // Khi có ngày và giờ -> gọi lấy occupied seats (nếu có API). Không chặn nếu lỗi.
  useEffect(() => {
    if (!selectedDate || !selectedTime || !fetchOccupiedSeats) return;
    try {
      const [hh, mm] = selectedTime.split(':').map(Number);
      if (!Number.isFinite(hh) || !Number.isFinite(mm)) return;
      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(hh, mm, 0, 0);
      const queryEndDate = getEndDateMinusOneMinute ? new Date(getEndDateMinusOneMinute) : null;
      const endTimeStr = queryEndDate
        ? `${String(queryEndDate.getHours()).padStart(2, '0')}:${String(queryEndDate.getMinutes()).padStart(2, '0')}`
        : null;

      fetchOccupiedSeats(
        bookingState.serviceType,
        startDateTime,
        `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`,
        endTimeStr,
        queryEndDate,
        { probeStartOnly: true }
      );
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedTime, bookingState.serviceType, getEndDateMinusOneMinute]);

  // Tính seats left cho Hot Desk (mặc định capacity 110 - occupied)
  const HOT_DESK_CAPACITY = 110;
  const seatsLeft = useMemo(() => {
    if (bookingState.serviceType !== 'hot-desk') return null;
    if (occupiedSummary && typeof occupiedSummary.seatsLeft === 'number') {
      return occupiedSummary.seatsLeft;
    }
    const capacity = typeof occupiedSummary?.capacity === 'number'
      ? occupiedSummary.capacity
      : HOT_DESK_CAPACITY;
    const occupied = Array.isArray(occupiedSeats) ? occupiedSeats.length : 0;
    return Math.max(0, capacity - occupied);
  }, [bookingState.serviceType, occupiedSeats, occupiedSummary]);

  return (
    <BookingLayout
      title="Select Date & Time"
      subtitle="Choose when you'd like to reserve your workspace"
    >
      <DateSelectionContainer>
        <HighlightedInfo>
          <p>{getDurationLabel()}</p>
          {bookingState.serviceType === 'hot-desk' && (
            <SeatsBadge>{seatsLeft == null ? 'Checking seats...' : `${seatsLeft} seats left`}</SeatsBadge>
          )}
        </HighlightedInfo>
        
        <DateRangeContainer>
          <DateCard>
            <h4>Start Date</h4>
            <FormGroup>
              <Label>Select Starting Date</Label>
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
          </DateCard>
          
          <DateCard disabled={true}>
            <h4>End Date</h4>
            <FormGroup>
              <Label>End Date & Time (Calculated automatically)</Label>
              <div style={{ padding: "1rem", backgroundColor: "#f9f9f9", borderRadius: "4px" }}>
                {getEndDateMinusOneMinute && selectedTime ? (
                  <div style={{ fontWeight: "500", color: "#45bf55" }}>
                    {formatDate(getEndDateMinusOneMinute)} at {`${String(getEndDateMinusOneMinute.getHours()).padStart(2,'0')}:${String(getEndDateMinusOneMinute.getMinutes()).padStart(2,'0')}`}
                  </div>
                ) : (
                  <div style={{ color: "#999" }}>Please select a start date and time first</div>
                )}
              </div>
            </FormGroup>
          </DateCard>
        </DateRangeContainer>
        
        {selectedDate && (
          <FormGroup>
            <Label>Select Time</Label>
            <TimeSelect value={selectedTime || ''} onChange={(e) => handleTimeSelect(e.target.value)}>
              <option value="" disabled>Choose a time</option>
              {timeSlots.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </TimeSelect>
            {timeSlots.length === 0 && (
              <div style={{ color: '#999', marginTop: '0.5rem' }}>
                No available time slots today. Please select another date.
              </div>
            )}
          </FormGroup>
        )}
        
        {validationMsg && (
          <div style={{ color: '#e74c3c', textAlign: 'center', marginTop: '0.5rem' }}>{validationMsg}</div>
        )}
        
        <ActionContainer>
          <BackButton onClick={handleBackStep}>
            Back
          </BackButton>
          <NextButton 
            disabled={!selectedDate || !selectedTime || (bookingState.serviceType==='hot-desk' && seatsLeft === 0)}
            onClick={handleNextStep}
          >
            Next Step
          </NextButton>
        </ActionContainer>
      </DateSelectionContainer>
    </BookingLayout>
  );
};

export default DatePage;
