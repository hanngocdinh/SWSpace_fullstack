import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import TeamBookingProgress from '../../components/TeamBookingProgress';

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

const ServiceInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ServiceImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 10px;
  object-fit: cover;
`;

const ServiceName = styled.h2`
  color: #45bf55;
  font-size: 1.5rem;
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #7f8c8d;
  max-width: 600px;
  margin: 0 auto 2rem;
  line-height: 1.6;
`;

const PackagesGrid = styled.div`
  display: grid;
  gap: 2rem;
  max-width: ${props => props.$layout === 'two-centered' ? '780px' : '1100px'};
  margin: 0 auto;
  padding: 0 1rem;
  justify-content: center;
  grid-template-columns: ${props => {
    if (props.$layout === 'two-centered') return 'repeat(2, minmax(320px, 1fr))';
    if (props.$layout === 'three') return 'repeat(3, minmax(280px, 1fr))';
    if (props.$layout === 'two-by-two') return 'repeat(2, minmax(320px, 1fr))';
    return 'repeat(3, minmax(280px, 1fr))'; // default for 5+
  }};

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, minmax(260px, 1fr));
    max-width: ${props => props.$layout === 'two-centered' ? '640px' : '100%'};
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    max-width: 520px;
  }
`;

const PackageCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 3px solid transparent;
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }
`;

const PackageName = styled.h3`
  font-size: 1.3rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const Duration = styled.div`
  color: #7f8c8d;
  font-size: 1rem;
  margin-bottom: 1rem;
`;

const Price = styled.div`
  margin-bottom: 1rem;
`;

const OldPrice = styled.div`
  font-size: 1rem;
  color: #7f8c8d;
  text-decoration: line-through;
  margin-bottom: 0.25rem;
`;

const NewPrice = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #45bf55;
`;

const DiscountBadge = styled.div`
  background: #e74c3c;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 1rem;
  display: inline-block;
`;

const DiscountDescription = styled.p`
  color: #27ae60;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  font-weight: 500;
`;

const FeaturesContainer = styled.div`
  margin: 0.5rem 0 1rem;
`;

const FeaturesTitle = styled.div`
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FeatureItem = styled.li`
  color: #27ae60;
  margin-bottom: 0.35rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  
  &::before {
    content: '✓';
    font-weight: bold;
  }
`;

const CustomHoursSection = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
`;

const CustomHoursLabel = styled.label`
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const CustomHoursInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #45bf55;
  }
`;

const SelectButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #45bf55 0%, #38a046 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(69, 191, 85, 0.3);
  }
  
  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #45bf55;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: #e74c3c;
  font-size: 1.1rem;
  padding: 2rem;
`;

const DurationSelectionPage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customHours, setCustomHours] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  
  const selectedService = location.state?.selectedService;

  useEffect(() => {
    if (!selectedService) {
      navigate('/team-booking');
      return;
    }
    fetchPackages();
  }, [selectedService, navigate]);

  const fetchPackages = async () => {
    try {
      const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${base}/api/team/services/${encodeURIComponent(selectedService.name)}/packages`);
      if (!response.ok) {
        throw new Error('Bad status ' + response.status);
      }
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        let list = data.data;
        if (!list || list.length === 0) {
          // Fallback gói theo từng dịch vụ nếu DB chưa seed
          if (selectedService.name === 'Private Office') {
            list = [
              { _id: 'po-3m', serviceType: 'Private Office', name: '3 Months', duration: { value: 3, unit: 'months' }, price: 15000000, isCustom: false, pricePerUnit: null, discount: { percentage: 5, description: 'Save 5% for 3 months' } },
              { _id: 'po-6m', serviceType: 'Private Office', name: '6 Months', duration: { value: 6, unit: 'months' }, price: 28000000, isCustom: false, pricePerUnit: null, discount: { percentage: 10, description: 'Best value 6 months' } },
              { _id: 'po-12m', serviceType: 'Private Office', name: '12 Months', duration: { value: 12, unit: 'months' }, price: 52000000, isCustom: false, pricePerUnit: null, discount: { percentage: 15, description: 'Annual plan discount' } },
            ];
          } else if (selectedService.name === 'Meeting Room') {
            list = [
              { _id: 'mr-2h', serviceType: 'Meeting Room', name: '2 Hours', duration: { value: 2, unit: 'hours' }, price: 500000, isCustom: false, pricePerUnit: null, discount: { percentage: 0, description: '' } },
              { _id: 'mr-5h', serviceType: 'Meeting Room', name: '5 Hours', duration: { value: 5, unit: 'hours' }, price: 1100000, isCustom: false, pricePerUnit: null, discount: { percentage: 10, description: 'Save 10% for 5h' } },
              { _id: 'mr-custom', serviceType: 'Meeting Room', name: 'Custom Hours', duration: { value: 1, unit: 'hours' }, price: 0, isCustom: true, pricePerUnit: 250000, discount: { percentage: 0, description: 'Flexible hours' } },
            ];
          } else if (selectedService.name === 'Networking Space') {
            list = [
              { _id: 'ns-4h', serviceType: 'Networking Space', name: 'Half Day', duration: { value: 4, unit: 'hours' }, price: 1200000, isCustom: false, pricePerUnit: null, discount: { percentage: 0, description: '' } },
              { _id: 'ns-1d', serviceType: 'Networking Space', name: 'Full Day', duration: { value: 1, unit: 'days' }, price: 2200000, isCustom: false, pricePerUnit: null, discount: { percentage: 5, description: 'Full day promo' } },
              { _id: 'ns-custom', serviceType: 'Networking Space', name: 'Custom Hours', duration: { value: 1, unit: 'hours' }, price: 0, isCustom: true, pricePerUnit: 350000, discount: { percentage: 0, description: 'Flexible time' } },
            ];
          }
        }
        setPackages(list);
      } else {
        setError('Failed to load packages');
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      setError('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getDurationText = (duration = {}) => {
    let value = duration.value ?? 1;
    let unit = (duration.unit || '').toLowerCase();
    // Yêu cầu: hiển thị "Year" (EN) cho gói năm đặc biệt 365 ngày
    if ((unit === 'year' || unit === 'years') && value === 365) {
      return 'Year';
    }
    const unitMapEn = {
      hours: 'Hours',
      days: 'Days', 
      months: 'Months',
      years: 'Years'
    };
    const label = `${value} ${unitMapEn[unit] || unit}`.trim();
    return label;
  };

  // Chuẩn hoá thời lượng để sắp xếp theo thứ tự thời gian tăng dần
  const normalizeDurationHours = (pkg) => {
    if (!pkg || pkg.isCustom) return Number.MAX_SAFE_INTEGER; // gói custom để cuối
    const d = pkg.duration || {};
    const value = Number(d.value || 0);
    const unit = String(d.unit || '').toLowerCase();
    if (unit.startsWith('hour')) return value;
    if (unit.startsWith('day')) return value * 24;
    if (unit.startsWith('week')) return value * 7 * 24;
    if (unit.startsWith('month')) return value * 30 * 24;
    if (unit.startsWith('year')) return value * 365 * 24;
    return Number.MAX_SAFE_INTEGER;
  };

  const sortedPackages = [...packages].sort((a, b) => normalizeDurationHours(a) - normalizeDurationHours(b));

  // Chọn layout theo số lượng gói: 2 -> 2 cột căn giữa; 3 -> 1 hàng 3 cột; 4 -> 2x2; >=5 -> 3 cột responsive
  const layout = sortedPackages.length === 2
    ? 'two-centered'
    : (sortedPackages.length === 3
      ? 'three'
      : (sortedPackages.length === 4 ? 'two-by-two' : 'auto'));

  const handlePackageSelect = (pkg) => {
    const hours = pkg.isCustom ? customHours[pkg._id] : null;
    
    if (pkg.isCustom && (!hours || hours < 1)) {
      alert('Please enter valid number of hours');
      return;
    }

    navigate('/team-booking/date', {
      state: {
        selectedService,
        selectedPackage: pkg,
        customHours: hours
      }
    });
  };

  const handleCustomHoursChange = (packageId, value) => {
    setCustomHours(prev => ({
      ...prev,
      [packageId]: parseInt(value) || 0
    }));
  };

  const calculateCustomPrice = (pkg, hours) => {
    return pkg.pricePerUnit * (hours || 0);
  };

  if (!selectedService) {
    return null;
  }

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }

  return (
    <>
      <Header />
      <Container>
        <BackButton onClick={() => navigate('/team-booking')}>
          ← Back to Services
        </BackButton>

        <HeaderSection>
          <Title>Choose Your <span>Duration</span> Package</Title>
          <TeamBookingProgress />
          <Subtitle>
            Select the perfect duration package for your {selectedService.name} booking.
            {selectedService.name === 'Meeting Room' && ' Custom hours available for flexible scheduling.'}
          </Subtitle>
        </HeaderSection>

  <PackagesGrid $layout={layout}>
        {sortedPackages.map((pkg) => (
          <PackageCard 
            key={pkg._id}
            onClick={() => handlePackageSelect(pkg)}
          >
            <PackageName>{pkg.name}</PackageName>
            <Duration>{getDurationText(pkg.duration)}</Duration>
            
            {((pkg.discountPct ?? pkg.discount?.percentage ?? 0) > 0) && (
              <>
                <DiscountBadge>SAVE {pkg.discountPct ?? pkg.discount?.percentage}%</DiscountBadge>
                <DiscountDescription>{pkg.discount.description || ''}</DiscountDescription>
              </>
            )}
            
            <Price>
              {pkg.isCustom ? (
                (() => {
                  const hours = customHours[pkg._id] || 0;
                  const base = calculateCustomPrice(pkg, hours);
                  const pct = (pkg.discountPct ?? pkg.discount?.percentage ?? 0);
                  if (pct > 0 && hours > 0) {
                    const discounted = Math.round(base * (1 - pct / 100));
                    return (
                      <>
                        <OldPrice>{formatPrice(base)}</OldPrice>
                        <NewPrice>
                          {formatPrice(discounted)} <span style={{fontSize:'0.8rem', color:'#7f8c8d', fontWeight:'normal'}}> / {hours} Hours</span>
                        </NewPrice>
                      </>
                    );
                  }
                  return (
                    <NewPrice>
                      {formatPrice(base)} <span style={{fontSize:'0.8rem', color:'#7f8c8d', fontWeight:'normal'}}> / {hours} Hours</span>
                    </NewPrice>
                  );
                })()
              ) : (
                (() => {
                  const pct = (pkg.discountPct ?? pkg.discount?.percentage ?? 0);
                  if (pct > 0) {
                    const discounted = Math.round(pkg.price * (1 - pct / 100));
                    return (
                      <>
                        <OldPrice>{formatPrice(pkg.price)}</OldPrice>
                        <NewPrice>
                          {formatPrice(discounted)} <span style={{fontSize:'0.8rem', color:'#7f8c8d', fontWeight:'normal'}}> / {getDurationText(pkg.duration)}</span>
                        </NewPrice>
                      </>
                    );
                  }
                  return (
                    <NewPrice>
                      {formatPrice(pkg.price)} <span style={{fontSize:'0.8rem', color:'#7f8c8d', fontWeight:'normal'}}> / {getDurationText(pkg.duration)}</span>
                    </NewPrice>
                  );
                })()
              )}
            </Price>

            {/* Features: ưu tiên từ pkg.features, fallback selectedService.features (hiển thị dưới giá tiền theo yêu cầu) */}
            {((pkg.features && pkg.features.length) || (selectedService.features && selectedService.features.length)) && (
              <FeaturesContainer>
                <FeaturesTitle>Features:</FeaturesTitle>
                <FeaturesList>
                  {(pkg.features || selectedService.features || []).slice(0, 4).map((f, i) => (
                    <FeatureItem key={i}>{f}</FeatureItem>
                  ))}
                </FeaturesList>
              </FeaturesContainer>
            )}

            {pkg.isCustom && (
              <CustomHoursSection onClick={(e) => e.stopPropagation()}>
                <CustomHoursLabel>Number of Hours:</CustomHoursLabel>
                <CustomHoursInput
                  type="number"
                  min="1"
                  max="24"
                  value={customHours[pkg._id] || ''}
                  onChange={(e) => handleCustomHoursChange(pkg._id, e.target.value)}
                  placeholder="Enter hours (1-24)"
                />
              </CustomHoursSection>
            )}
            
            <SelectButton
              onClick={(e) => {
                e.stopPropagation();
                handlePackageSelect(pkg);
              }}
              disabled={pkg.isCustom && (!customHours[pkg._id] || customHours[pkg._id] < 1)}
            >
              Select This Package
            </SelectButton>
          </PackageCard>
        ))}
      </PackagesGrid>
    </Container>
    <Footer />
    </>
  );
};

export default DurationSelectionPage;