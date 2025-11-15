import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import TeamBookingProgress from '../../components/TeamBookingProgress';
import { addDays, addHours, addMonths, addYears, startOfDay } from 'date-fns';

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
  margin-bottom: 0.5rem;
  
  span {
    color: #45bf55;
  }
`;

const BookingInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const InfoCard = styled.div`
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InfoLabel = styled.span`
  color: #7f8c8d;
  font-size: 0.9rem;
`;

const InfoValue = styled.span`
  color: #2c3e50;
  font-weight: 600;
`;

const ContentArea = styled.div`
  max-width: 960px;
  margin: 0 auto;
`;

const DateSection = styled.div`
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.3rem;
`;

const CalendarContainer = styled.div`
  margin-bottom: 2rem;
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

const Label = styled.label`
  font-size: 1rem;
  color: #333;
  font-weight: 500;
`;

const CustomDatePickerWrapper = styled.div`
  .react-datepicker-wrapper { width: 100%; }
  .react-datepicker { border-color: #ddd; font-family: inherit; }
  .react-datepicker__day--selected { background-color: #45bf55; }
  .react-datepicker__day--keyboard-selected { background-color: rgba(69,191,85,0.5); }
  .react-datepicker__day:hover { background-color: rgba(69,191,85,0.2); }
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

const TimeSection = styled.div`
  margin-top: 1rem;
`;

const TimeInputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const TimeLabel = styled.label`
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

// Removed old free-time inputs in favor of dropdown

const WarningMessage = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-weight: 500;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-weight: 500;
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-weight: 500;
`;

const DurationInfo = styled.div`
  background: #e8f5e8;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
`;

const DurationText = styled.p`
  margin: 0;
  color: #27ae60;
  font-weight: 600;
`;

const PriceInfo = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const PriceLabel = styled.div`
  color: #7f8c8d;
  font-size: 1rem;
  margin-bottom: 0.5rem;
`;

const FinalPrice = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #45bf55;
`;

const ContinueButton = styled.button`
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

const DateSelectionPage = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [now, setNow] = useState(new Date());
  const [validationMessage, setValidationMessage] = useState('');
  const [validationType, setValidationType] = useState(''); // 'warning', 'error', 'success'
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const { selectedService, selectedPackage, customHours } = location.state || {};

  useEffect(() => {
    if (!selectedService || !selectedPackage) {
      navigate('/team-booking');
      return;
    }
    
    validateDate();
  }, [selectedDate, selectedService, selectedPackage, navigate]);

  // Tick now every 30s to keep realtime windows fresh
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const validateDate = () => {
    // Chỉ hiển thị lỗi khi quá khứ; không hiển thị cảnh báo/thành công
    if (!selectedDate) {
      setValidationMessage('');
      setValidationType('');
      return;
    }
    const today = new Date();
    const bookingDate = new Date(selectedDate);
    if (bookingDate.getTime() < startOfDay(today).getTime()) {
      setValidationMessage('Không thể đặt ngày trong quá khứ');
      setValidationType('error');
    } else {
      setValidationMessage('');
      setValidationType('');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getDurationText = (duration) => {
    if (!duration) return '';
    let { value, unit } = duration;
    unit = normalizeUnit(unit);
    // Hiển thị 'Year' nếu gói đặc biệt 365 day được coi là year hiển thị
    if (unit === 'years' && Number(value) === 365) {
      return 'Year';
    }
    const unitMapEn = { hours: 'Hours', days: 'Days', months: 'Months', years: 'Years' };
    return `${value} ${unitMapEn[unit] || unit}`;
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

  // Derive advance rule by service name to avoid API inconsistencies
  const advanceRequiredLabel = selectedService?.name === 'Private Office' ? '1 week' : '1 day';
  // Min date by advance + 1 thêm ngày đệm theo yêu cầu
  // Meeting/Networking: 1 day -> chọn được từ 00:00 của ngày mốt (today + 2)
  // Private Office: 1 week -> chọn được từ 00:00 của ngày thứ 8 (today + 8)
  const minAdvanceDays = advanceRequiredLabel === '1 week' ? 7 : 1;
  // Logic chọn ngày tối thiểu:
  // Meeting Room / Networking Space (1 day advance):
  //   - Trước 18h: ngày +1 (hơn 1 ngày kể từ hiện tại, chấp nhận chọn ngày mai)
  //   - Từ 18h trở đi: ngày +2 (vì sau 18h phải lùi thêm 1 ngày)
  // Private Office (1 week advance):
  //   - Trước 18h: ngày +7
  //   - Từ 18h trở đi: ngày +8
  const minDate = useMemo(() => {
    const base = startOfDay(now);
    const h = now.getHours();
    let offset;
    if (minAdvanceDays === 1) {
      offset = h >= 18 ? 2 : 1;
    } else { // 1 week advance
      offset = h >= 18 ? 8 : 7;
    }
    return addDays(base, offset);
  }, [now, minAdvanceDays]);

  // Time slots 30m based on realtime window as spec
  const timeSlots = useMemo(() => {
    const hour = now.getHours();
    let startMin;
    if (hour < 6) startMin = 6 * 60;
    else if (hour < 12) startMin = 12 * 60;
    else if (hour < 18) startMin = 18 * 60;
    else startMin = 0; // midnight
    const endMin = (24 * 60) - 30;
    const slots = [];
    for (let m = startMin; m <= endMin; m += 30) {
      const hh = String(Math.floor(m / 60)).padStart(2, '0');
      const mm = String(m % 60).padStart(2, '0');
      slots.push(`${hh}:${mm}`);
    }
    return slots;
  }, [now]);

  // Nếu thời gian thực nhảy sang khung mới khiến lựa chọn cũ không còn trong danh sách slot hiện tại -> thông báo và chặn tiếp tục
  useEffect(() => {
    if (!selectedTime) return;
    if (!timeSlots.includes(selectedTime)) {
      setValidationType('error');
      setValidationMessage('Khung giờ đã thay đổi trong lúc bạn chọn. Vui lòng chọn lại thời gian.');
    } else if (validationType === 'error' && validationMessage.startsWith('Khung giờ')) {
      // Hết lỗi nếu người dùng chọn lại giờ hợp lệ
      setValidationType('');
      setValidationMessage('');
    }
  }, [timeSlots, selectedTime]);

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  // Chuẩn hoá unit từ gói dịch vụ: hỗ trợ các biến thể 'hour|hours|h', 'day|days|d', 'month|months|mo', 'year|years|y'
  const normalizeUnit = (u) => {
    const unit = (u || '').toString().trim().toLowerCase();
    if (['hour','hours','h'].includes(unit)) return 'hours';
    if (['day','days','d'].includes(unit)) return 'days';
    if (['week','weeks','w'].includes(unit)) return 'weeks';
    if (['month','months','mo'].includes(unit)) return 'months';
    if (['year','years','y'].includes(unit)) return 'years';
    return unit; // fallback: dùng như cũ
  };

  // Compute end datetime based on package duration
  const getEndDate = () => {
    if (!selectedDate || !selectedTime) return null;
    const [hh, mm] = selectedTime.split(':').map(Number);
    const start = new Date(selectedDate);
    start.setHours(hh || 0, mm || 0, 0, 0);
    let dur = selectedPackage?.isCustom && customHours 
      ? { value: customHours, unit: 'hours' } 
      : selectedPackage?.duration;
    if (!dur) return null;
    let unit = normalizeUnit(dur.unit);
    let valueNum = Number(dur.value || 0);
    // Case đặc biệt: dữ liệu lỗi '365 years' -> coi như 365 days
    if (unit === 'years' && valueNum === 365) {
      unit = 'days';
      valueNum = 365;
    }
    let end = new Date(start);
    switch (unit) {
      case 'hours':
        end = addHours(start, valueNum);
        // Trừ 1 phút với đơn vị giờ theo yêu cầu (ví dụ 3h từ 05:00 -> 07:59)
        end.setMinutes(end.getMinutes() - 1);
        break;
      case 'days':
        end = addDays(start, valueNum);
        break;
      case 'weeks':
        end = addDays(start, valueNum * 7);
        break;
      case 'months':
        end = addMonths(start, valueNum);
        break;
      case 'years':
        end = addYears(start, valueNum);
        break;
      default:
        break;
    }
    // Trừ 1 phút cho case theo ngày/tháng/năm để hiển thị inclusive
    if (['days','months','years','weeks'].includes(unit)) {
      end.setMinutes(end.getMinutes() - 1);
    }
    return end;
  };

  const endDateObj = getEndDate();

  const handleContinue = () => {
    if (validationType === 'error' || !selectedDate || !selectedTime) return;
    // Chặn nếu giờ đã chọn không còn hợp lệ theo khung giờ hiện tại
    if (!timeSlots.includes(selectedTime)) {
      setValidationType('error');
      setValidationMessage('Khung giờ đã thay đổi trong lúc bạn chọn. Vui lòng chọn lại thời gian.');
      return;
    }
    const [hh, mm] = selectedTime.split(':').map(Number);
    const start = new Date(selectedDate);
    start.setHours(hh || 0, mm || 0, 0, 0);
    const end = endDateObj || new Date(start);
    const startDateOnly = start.toISOString().split('T')[0];
    const endDateOnly = end.toISOString().split('T')[0];
    navigate('/team-booking/rooms', {
      state: {
        selectedService,
        selectedPackage,
        customHours,
        startDate: startDateOnly,
        endDate: endDateOnly,
        startTime: selectedTime,
        endTime: `${String(end.getHours()).padStart(2,'0')}:${String(end.getMinutes()).padStart(2,'0')}`
      }
    });
  };

  if (!selectedService || !selectedPackage) {
    return null;
  }

  return (
    <>
      <Header />
      <Container>
        <BackButton onClick={() => navigate('/team-booking/duration', { 
          state: { selectedService } 
        })}>
          ← Back to Packages
        </BackButton>

        <HeaderSection>
          <Title>Select Your <span>Date & Time</span></Title>
          <TeamBookingProgress />
          
          <BookingInfo>
            <InfoCard>
              <InfoLabel>Service:</InfoLabel>
              <InfoValue>{selectedService.name}</InfoValue>
            </InfoCard>
            <InfoCard>
              <InfoLabel>Package:</InfoLabel>
              <InfoValue>
                {selectedPackage.name}
                {customHours && ` (${customHours} hours)`}
              </InfoValue>
            </InfoCard>
            <InfoCard>
              <InfoLabel>Advance Required:</InfoLabel>
              <InfoValue>{advanceRequiredLabel}</InfoValue>
            </InfoCard>
          </BookingInfo>
        </HeaderSection>

      <ContentArea>
        <DateSection>
          <SectionTitle>Booking Date</SectionTitle>
          
          <DateRangeContainer>
            <DateCard>
              <h4>Start Date</h4>
              <div>
                <Label>Select Starting Date</Label>
                <CalendarContainer>
                  <CustomDatePickerWrapper>
                    <DatePicker
                      selected={selectedDate}
                      onChange={setSelectedDate}
                      dateFormat="MMMM d, yyyy"
                      minDate={minDate}
                      inline
                    />
                  </CustomDatePickerWrapper>
                </CalendarContainer>
              </div>
              <div>
                <Label>Select Time</Label>
                <TimeSection>
                  <TimeInputGroup>
                    <TimeSelect value={selectedTime || ''} onChange={(e) => setSelectedTime(e.target.value)}>
                      <option value="" disabled>Choose a time</option>
                      {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                    </TimeSelect>
                  </TimeInputGroup>
                </TimeSection>
              </div>
            </DateCard>

            <DateCard disabled={true}>
              <h4>End Date</h4>
              <div>
                <Label>End Date & Time (Calculated automatically)</Label>
                <div style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                  {endDateObj && selectedTime ? (
                    <div style={{ fontWeight: 500, color: '#45bf55' }}>
                      {formatDate(endDateObj)} lúc {`${String(endDateObj.getHours()).padStart(2,'0')}:${String(endDateObj.getMinutes()).padStart(2,'0')}`}
                    </div>
                  ) : (
                    <div style={{ color: '#999' }}>Please select a start date and time first</div>
                  )}
                </div>
              </div>
            </DateCard>
          </DateRangeContainer>

          {validationType === 'error' && validationMessage && (
            <ErrorMessage>{validationMessage}</ErrorMessage>
          )}

          {/* Thời lượng & Giá giữ nguyên ở dưới */}

          <DurationInfo>
            <DurationText>
              Duration: {selectedPackage.isCustom && customHours 
                ? `${customHours} hours` 
                : getDurationText({
                    value: selectedPackage?.duration?.value,
                    unit: normalizeUnit(selectedPackage?.duration?.unit)
                  })
              }
            </DurationText>
          </DurationInfo>

          <PriceInfo>
            <PriceLabel>Total Price</PriceLabel>
            <FinalPrice>{formatPrice(calculateFinalPrice())}</FinalPrice>
          </PriceInfo>

          <ContinueButton
            onClick={handleContinue}
            disabled={validationType === 'error' || !selectedDate || !selectedTime}
          >
            Continue to Room Selection
          </ContinueButton>
        </DateSection>
      </ContentArea>
    </Container>
    <Footer />
    </>
  );
};

export default DateSelectionPage;