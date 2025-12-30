import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import BookingLayout from './BookingLayout';
import { useBooking } from '../../contexts/BookingContext';

const DurationOptions = styled.div`
  margin-top: 2rem;
  gap: 2.2rem;
  display: ${props => (props.twobytwo ? 'grid' : 'flex')};
  ${props => props.twobytwo
    ? `
      grid-template-columns: repeat(2, minmax(300px, 1fr));
      justify-content: center;
      justify-items: center;
      align-items: stretch;
      grid-auto-rows: 1fr;
      max-width: 860px;
      margin-left: auto;
      margin-right: auto;
      padding: 0 0.5rem;
    `
    : `justify-content: center; flex-wrap: wrap;`}

  @media (max-width: 992px) {
    gap: 2rem;
    ${props => props.twobytwo ? 'max-width: 780px;' : ''}
  }
  @media (max-width: 768px) {
    gap: 1.7rem;
  }
  
  @media (max-width: 480px) {
    gap: 1.25rem;
    justify-content: space-around;
    display: flex; /* Mobile: xếp dọc */
    flex-direction: column;
    align-items: center;
    padding: 0 0.75rem;
  }
`;

const DurationCard = styled.div`
  width: ${props => props.$twobytwo ? '100%' : '260px'};
  max-width: ${props => props.$twobytwo ? '400px' : 'none'};
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.28s, box-shadow 0.28s;
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: ${props => props.$twobytwo ? '400px' : '340px'};
  
  ${props => props.selected && `
    border: 2px solid #45bf55;
    transform: translateY(-6px);
    box-shadow: 0 10px 18px rgba(0, 0, 0, 0.12);
  `}
  
  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 10px 18px rgba(0, 0, 0, 0.12);
  }
  
  @media (max-width: 768px) {
    width: ${props => props.$twobytwo ? '100%' : '230px'};
    min-height: ${props => props.$twobytwo ? '380px' : '320px'};
  }
  
  @media (max-width: 480px) {
    width: 100%;
    max-width: 360px;
    min-height: unset;
  }
`;

const DurationHeader = styled.div`
  padding: 1.25rem 1.3rem 1.1rem;
  background: linear-gradient(135deg, #f9fafb 0%, #f2f4f6 100%);
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
  min-height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DurationTitle = styled.h3`
  font-size: 1.4rem;
  letter-spacing: 0.5px;
  color: #222;
  margin: 0;
  font-weight: 600;
  
  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const DurationContent = styled.div`
  padding: 1.65rem 1.55rem 1.6rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  
  @media (max-width: 480px) {
    padding: 1.35rem 1.25rem 1.3rem;
  }
`;

const DurationPrice = styled.div`
  text-align: center;
  margin-bottom: 1.1rem;
`;

const OriginalPrice = styled.div`
  font-size: 1rem;
  color: #777;
  text-decoration: ${props => props.hasDiscount ? 'line-through' : 'none'};
  margin-bottom: 0.25rem;
`;

const DiscountedPrice = styled.div`
  font-size: 1.55rem;
  font-weight: 600;
  color: #45bf55;
  
  @media (max-width: 480px) {
    font-size: 1.4rem;
  }
`;

const DurationFeatures = styled.ul`
  padding-left: 1.2rem;
  margin: 1.1rem 0 0;
  min-height: 120px; /* More space for features để nội dung không bị dồn */
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  
  @media (max-width: 768px) {
    min-height: 110px;
  }
  @media (max-width: 480px) {
    padding-left: 1rem;
    margin: 1rem 0 0;
    min-height: 88px;
    gap: 0.5rem;
  }
`;

const Feature = styled.li`
  margin: 0;
  font-size: 0.95rem;
  color: #555;
  line-height: 1.35;
  
  @media (max-width: 480px) {
    font-size: 0.88rem;
  }
`;

const DiscountLabel = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  background-color: #e74c3c;
  color: white;
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  font-weight: bold;
  border-bottom-left-radius: 8px;
`;

const SelectedMark = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #45bf55;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
`;

const ValidationMessage = styled.div`
  color: #e74c3c;
  font-size: 0.9rem;
  text-align: center;
  margin-top: 1rem;
  min-height: 20px; /* Reserve space for validation message */
`;

const ActionContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 3rem;
  
  @media (max-width: 768px) {
    margin-top: 2.5rem;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
    margin-top: 2rem;
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

const PackageDurationPage = () => {
  const { bookingState, selectPackageDuration, ensurePackagesLoaded } = useBooking();
  const navigate = useNavigate();
  const [validationError, setValidationError] = useState('');
  
  // Redirect if service type is not selected
  useEffect(() => {
    if (!bookingState.serviceType) {
      navigate('/booking/service');
    }
  }, [bookingState.serviceType, navigate]);

  // Đảm bảo packages được tải khi vào trang này
  useEffect(() => {
    if (!bookingState.packagesLoaded) {
      ensurePackagesLoaded && ensurePackagesLoaded();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Map unit_code -> label hiển thị
  const unitLabel = (unitCode) => {
    switch (unitCode) {
      case 'day': return 'Daily';
      case 'week': return 'Weekly';
      case 'month': return 'Monthly';
      case 'year': return 'Yearly';
      default: return unitCode;
    }
  };

  // Chuyển packages thực từ context -> durationOptions động
  const durationOptions = useMemo(() => {
    const svcCode = bookingState.serviceType === 'hot-desk' ? 'hot_desk' : 'fixed_desk';
    const order = { day: 1, week: 2, month: 3, year: 4 };
    const pkgs = (bookingState.packages || [])
      .filter(p => p.service_code === svcCode)
      .sort((a, b) => (order[a.unit_code] || 99) - (order[b.unit_code] || 99));
    return pkgs.map(p => ({
      id: String(p.id),
      title: unitLabel(p.unit_code),
      basePrice: Number(p.price),
      discountPct: Number(p.discount_pct || 0),
      discountedPrice: p.final_price !== undefined ? Number(p.final_price) : Math.round(Number(p.price) - (Number(p.price) * Number(p.discount_pct || 0) / 100)),
      raw: p,
      features: (() => {
        if (p.features) {
          try { const arr = Array.isArray(p.features) ? p.features : JSON.parse(p.features); return arr || []; } catch { return []; }
        }
        return [];
      })()
    }));
  }, [bookingState.packages, bookingState.serviceType]);
  
  const handleSelectDuration = (durationId) => {
    selectPackageDuration(durationId);
    setValidationError('');
  };
  
  const handleNextStep = () => {
    if (!bookingState.packageDuration) {
      setValidationError('Please select a duration package to continue.');
      return;
    }
    
    navigate('/booking/date');
  };
  
  const handleBackStep = () => {
    navigate('/booking/service');
  };

  // Format tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const isTwoByTwo = (bookingState.serviceType === 'hot-desk' || bookingState.serviceType === 'fixed-desk') && durationOptions.length === 4;

  return (
    <BookingLayout
      title="Select Your Package Duration"
      subtitle="Choose how long you would like to use the workspace"
    >
      {!bookingState.packagesLoaded && (
        <div style={{ textAlign: 'center', marginTop: '0.5rem', color: '#666' }}>Loading packages…</div>
      )}
      {bookingState.packagesLoaded && durationOptions.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>No packages available for this service.</div>
    )}
  <DurationOptions twobytwo={isTwoByTwo}>
        {durationOptions.map((duration) => {
          const hasDiscount = duration.discountPct > 0;
          const discountedPrice = duration.discountedPrice;
          return (
            <DurationCard
              $twobytwo={isTwoByTwo}
              key={duration.id}
              selected={String(bookingState.packageDuration) === String(duration.id)}
              onClick={() => handleSelectDuration(duration.id)}
            >
              {hasDiscount && (
                <DiscountLabel>Save {duration.discountPct}%</DiscountLabel>
              )}
              
              {String(bookingState.packageDuration) === String(duration.id) && <SelectedMark>✓</SelectedMark>}
              
              <DurationHeader>
                <DurationTitle>{duration.title}</DurationTitle>
              </DurationHeader>
              
              <DurationContent>
                <DurationPrice>
                  {hasDiscount && (
                    <OriginalPrice hasDiscount={true}>
                      {formatCurrency(duration.basePrice)}
                    </OriginalPrice>
                  )}
                  <DiscountedPrice>{formatCurrency(discountedPrice)}</DiscountedPrice>
                </DurationPrice>
                
                <DurationFeatures>
                  {duration.features.map((feature, index) => (
                    <Feature key={index}>{feature}</Feature>
                  ))}
                </DurationFeatures>
              </DurationContent>
            </DurationCard>
          );
        })}
      </DurationOptions>
      
      <ValidationMessage>{validationError}</ValidationMessage>
      
      <ActionContainer>
        <BackButton onClick={handleBackStep}>
          Back
        </BackButton>
        <NextButton onClick={handleNextStep}>
          Next Step
        </NextButton>
      </ActionContainer>
    </BookingLayout>
  );
};

export default PackageDurationPage;