import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { FaArrowLeft } from 'react-icons/fa';

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
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
`;

const HeaderSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 4rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const HeaderContent = styled.div`
  h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: #333;
  }

  p.price {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    color: #555;
  }

  p.description {
    margin-bottom: 1.5rem;
    line-height: 1.6;
    color: #555;
  }
`;

const HeaderImage = styled.div`
  img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    object-fit: cover;
  }
`;

const FeatureSection = styled.div`
  margin: 4rem 0;
`;

const FeatureHeader = styled.div`
  h3 {
    font-size: 2rem;
    margin-bottom: 2rem;
    color: #333;
  }

  p {
    margin-bottom: 2rem;
    line-height: 1.6;
    color: #555;
    max-width: 80%;
  }

  @media (max-width: 768px) {
    p {
      max-width: 100%;
    }
  }
`;

const MeetingRooms = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin: 3rem 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MeetingRoomCard = styled.div`
  img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    object-fit: cover;
    margin-bottom: 1.5rem;
  }

  h4 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: #333;
  }

  p {
    font-size: 1.1rem;
    color: #555;
  }
`;

const LargeRoomSection = styled.div`
  margin: 4rem 0;
`;

const LargeRoomCard = styled.div`
  img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    object-fit: cover;
    margin-bottom: 1.5rem;
  }

  h4 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: #333;
  }

  p {
    font-size: 1.1rem;
    color: #555;
  }
`;

const AmenityImage = styled.div`
  width: 100%;
  margin: 4rem 0;
  
  img {
    width: 100%;
    height: auto;
    object-fit: cover;
  }
`;

const UtilitiesSection = styled.div`
  background-color: #f9f9f7;
  padding: 3rem;
  border-radius: 8px;
  margin: 4rem 0;
`;

const UtilitiesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  h3 {
    font-size: 1.8rem;
    color: #333;
  }
`;

const UtilitiesList = styled.div`
  display: flex;
  flex-direction: column;
`;

const UtilityItem = styled.div`
  padding: 1.5rem 0;
  border-top: 1px solid #e0e0e0;
  font-size: 1rem;
  color: #333;
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #45bf55;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  text-decoration: none;
  margin-top: 2rem;
  width: fit-content;
  transition: all 0.3s ease;

  &:hover {
    background-color: #38a046;
    transform: translateY(-2px);
  }

  svg {
    margin-right: 0.5rem;
  }
`;

const UtilityViewMore = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #333;
  border: none;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: none;
  width: fit-content;

  .arrow-icon {
    margin-left: 0.5rem;
    width: 20px;
    height: 20px;
    background-color: #ff7a00;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.8rem;
  }
`;

const MeetingRoomDetailPage = () => {
  return (
    <PageContainer>
      <Header />
      <MainContent>
        <SectionContainer>
          {/* Header Section */}
          <HeaderSection>
            <HeaderContent>
              <h2>Meeting Room</h2>
              <p className="price">About 300.000 VND / Hour</p>
              
              <p className="description">
                Equipped with current features, standard lighting, and soundproof design
              </p>
              
              <p className="description">
                Suitable for meetings of 4 to 20 people
              </p>
              
              <BackButton to="/service">
                <FaArrowLeft /> Back
              </BackButton>
            </HeaderContent>
            
            <HeaderImage>
              <img 
                src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1760001403/Screenshot_2025-10-09_161629_dj3e26.png" 
                alt="Meeting Room" 
              />
            </HeaderImage>
          </HeaderSection>
          
          {/* When you use the meeting room at SWSpace Section */}
          <FeatureSection>
            <FeatureHeader>
              <h3>When you use the meeting room at SWSpace</h3>
              <p>
                The design ensures soundproofing and absolute privacy, allowing you to confidently discuss key issues. In addition, the meeting room is fully equipped with standard devices such as a projector, television, and whiteboard, providing maximum support for presentations and effective group work.
              </p>
              <p>
                Meeting rooms of various sizes to accommodate all scales of your meetings.
              </p>
            </FeatureHeader>
            
            <MeetingRooms>
              <MeetingRoomCard>
                <img 
                  src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1760452165/Screenshot_2025-10-14_212908_wmtrpa.png" 
                  alt="Small Meeting Room" 
                />
                <h4>Meeting Room for 4 - 6 people</h4>
                <p>About 300.000 VND/ hour</p>
              </MeetingRoomCard>
              
              <MeetingRoomCard>
                <img 
                  src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1760000185/Screenshot_2025-10-09_155610_izpoax.png" 
                  alt="Medium Meeting Room" 
                />
                <h4>Meeting Room for 8 - 10 people</h4>
                <p>About 600.000 VND/ hour</p>
              </MeetingRoomCard>
            </MeetingRooms>
            
            <LargeRoomSection>
              <LargeRoomCard>
                <img 
                  src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1759943743/Screenshot_2025-10-09_001515_keypi0.png" 
                  alt="Large Meeting Room" 
                />
                <h4>Meeting Room for 15-20 people</h4>
                <p>About 1.000.000 VND/ hour</p>
              </LargeRoomCard>
            </LargeRoomSection>
          </FeatureSection>
          
          {/* Interior Image */}
          <AmenityImage>
            <img 
              src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1760452245/Screenshot_2025-10-14_213026_csuf9f.png" 
              alt="Meeting Room Interior" 
            />
          </AmenityImage>
          
          {/* Utilities Section */}
          <UtilitiesSection>
            <UtilitiesHeader>
              <h3>Utilities for customers</h3>
              <UtilityViewMore href="/utility">
                See more utilities <span className="arrow-icon">→</span>
              </UtilityViewMore>
            </UtilitiesHeader>
            
            <UtilitiesList>
              <UtilityItem>Check-in QR Code</UtilityItem>
              <UtilityItem>High-speed Wifi</UtilityItem>
              <UtilityItem>Use the meeting room for free</UtilityItem>
              <UtilityItem>Support document printing</UtilityItem>
              <UtilityItem>Daily cleaning and maintenance services</UtilityItem>
              <UtilityItem>Free drinks</UtilityItem>
            </UtilitiesList>
          </UtilitiesSection>
        </SectionContainer>
      </MainContent>
      <Footer />
    </PageContainer>
  );
};

export default MeetingRoomDetailPage;