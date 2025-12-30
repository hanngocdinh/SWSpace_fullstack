import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const ServiceCard = styled.div`
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }
`;

const ServiceImageWrapper = styled.div`
  height: 250px;
  overflow: hidden;
  position: relative;
  background: #f0f0f0;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40%;
    background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 100%);
    pointer-events: none;
    z-index: 1;
  }
`;

const ServiceImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  ${ServiceCard}:hover & {
    transform: scale(1.05);
  }
`;

const ServiceContent = styled.div`
  padding: 1.5rem;
`;

const ServiceName = styled.h3`
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const ServiceDescription = styled.p`
  color: #7f8c8d;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin-bottom: 1.5rem;
`;

const FeatureItem = styled.li`
  color: #45bf55;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  
  &::before {
    content: '✓';
    margin-right: 0.5rem;
    font-weight: bold;
  }
`;

const ServiceInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  border-top: 1px solid #ecf0f1;
`;

const InfoItem = styled.div`
  text-align: center;
`;

const InfoLabel = styled.div`
  font-size: 0.8rem;
  color: #95a5a6;
  margin-bottom: 0.25rem;
`;

const InfoValue = styled.div`
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
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
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(69, 191, 85, 0.3);
  }
  
  &:active {
    transform: translateY(0);
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

const TeamServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${base}/api/team/services`);
      if (!response.ok) {
        throw new Error('Bad status ' + response.status);
      }
      const data = await response.json();
  if (data.success && Array.isArray(data.data)) {
        // Nếu không có dữ liệu seed, cung cấp fallback tĩnh 3 dịch vụ
  const list = data.data.length > 0 ? data.data : [
          {
            _id: 'fallback-private',
            name: 'Private Office',
            description: 'Dedicated private office space for teams that need privacy and focus.',
            image: '/images/utilities/meeting-room.jpg',
            features: ['Private space','Air conditioning','High-speed Wi-Fi','Printing access'],
            capacity: { min: 1, max: 43 },
            minimumBookingAdvance: '1 week'
          },
          {
            _id: 'fallback-meeting',
            name: 'Meeting Room',
            description: 'Professional meeting rooms equipped with modern facilities for team meetings.',
            image: '/images/utilities/meeting-room.jpg',
            features: ['Projector','Whiteboard','Air conditioning','High-speed Wi-Fi'],
            capacity: { min: 2, max: 14 },
            minimumBookingAdvance: '1 day'
          },
          {
            _id: 'fallback-networking',
            name: 'Networking Space',
            description: 'Open collaborative space perfect for networking events and team activities.',
            image: '/images/utilities/discussion-area.jpg',
            features: ['Open layout','Event setup','Sound system','Catering support'],
            capacity: { min: 20, max: 70 },
            minimumBookingAdvance: '1 day'
          }
        ];
        setServices(list);
      } else {
        setError('Failed to load services');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (service) => {
    // Navigate to duration selection page with service data
    const normalizedAdvance = service.name === 'Private Office' ? '1 week' : '1 day';
    const selectedService = { ...service, minimumBookingAdvance: normalizedAdvance };
    navigate(`/team-booking/duration`, {
      state: { selectedService }
    });
  };

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
        <HeaderSection>
          <Title>Choose Your <span>Team</span> Service</Title>
          <TeamBookingProgress />
          <Subtitle>
            Select from our premium spaces designed for teams and collaboration. 
            Each service offers unique features to meet your specific needs.
          </Subtitle>
        </HeaderSection>

      <ServicesGrid>
        {services.map((service) => {
          const adminBase = 'http://localhost:5174';
          const adminImageMap = {
            'Private Office': `${adminBase}/images/private_office.png`,
            'Meeting Room': `${adminBase}/images/meeting_room.png`,
            'Networking Space': `${adminBase}/images/networking_space.png`,
          };
          const fallbackImage = 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=800&q=60';
          const localFallback = (service.name === 'Private Office' || service.name === 'Meeting Room')
            ? '/images/utilities/meeting-room.jpg'
            : (service.name === 'Networking Space' ? '/images/utilities/discussion-area.jpg' : fallbackImage);
          const imageSrc = adminImageMap[service.name] || service.image || localFallback || fallbackImage;

          // Default descriptions & features to match the provided images
          const descMap = {
            'Meeting Room': 'Professional meeting rooms equipped with modern facilities for team meetings.',
            'Networking Space': 'Open collaborative space perfect for networking events and team activities.',
            'Private Office': 'Dedicated private office space for teams that need privacy and focus.'
          };
          const featuresMap = {
            'Meeting Room': ['Projector', 'Whiteboard', 'Air conditioning', 'High-speed Wi-Fi'],
            'Networking Space': ['Open layout', 'Event setup', 'Sound system', 'Catering support'],
            'Private Office': ['Private space', 'Air conditioning', 'High-speed Wi-Fi', 'Printing access']
          };
          const computedDescription = service.description && service.description.trim().length > 0
            ? service.description
            : descMap[service.name] || '';
          const computedFeatures = Array.isArray(service.features) && service.features.length > 0
            ? service.features
            : (featuresMap[service.name] || []);
          
          return (
          <ServiceCard key={service._id || service.id || service.code} onClick={() => handleServiceSelect(service)}>
            <ServiceImageWrapper>
              <ServiceImage 
                src={imageSrc}
                alt={service.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=800&q=60';
                }}
              />
            </ServiceImageWrapper>
            <ServiceContent>
              <ServiceName>{service.name}</ServiceName>
              <ServiceDescription>{computedDescription}</ServiceDescription>
              
              <FeaturesList>
                {computedFeatures.slice(0, 4).map((feature, index) => (
                  <FeatureItem key={index}>{feature}</FeatureItem>
                ))}
              </FeaturesList>
              
              <ServiceInfo>
                <InfoItem>
                  <InfoLabel>Capacity</InfoLabel>
                  <InfoValue>{
                    service && typeof service.capacity === 'object' && service.capacity !== null && (typeof service.capacity.min !== 'undefined' || typeof service.capacity.max !== 'undefined')
                      ? `${service.capacity.min ?? ''}${service.capacity.min && service.capacity.max ? '-' : ''}${service.capacity.max ?? ''} people`
                      : (typeof service.capacity === 'number' && service.capacity > 0 ? `${service.capacity} people` : service.name === 'Private Office' ? '1-43 people' : service.name === 'Meeting Room' ? '2-14 people' : service.name === 'Networking Space' ? '20-70 people' : 'N/A')
                  }</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Advance Booking</InfoLabel>
                  <InfoValue>{service.name === 'Private Office' ? '1 week' : '1 day'}</InfoValue>
                </InfoItem>
              </ServiceInfo>
              
              <SelectButton>
                Select {service.name}
              </SelectButton>
            </ServiceContent>
          </ServiceCard>
          );
        })}
      </ServicesGrid>
    </Container>
    <Footer />
    </>
  );
};

export default TeamServicesPage;