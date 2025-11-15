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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin: 4rem 0;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureImage = styled.div`
  img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    object-fit: cover;
  }

  @media (max-width: 768px) {
    order: ${props => props.imageFirst ? 0 : 1};
  }
`;

const FeatureContent = styled.div`
  h3 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    color: #333;
  }

  p {
    margin-bottom: 1rem;
    line-height: 1.6;
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

const FixedDeskDetailPage = () => {
  return (
    <PageContainer>
      <Header />
      <MainContent>
        <SectionContainer>
          {/* Header Section */}
          <HeaderSection>
            <HeaderContent>
              <h2>Fixed Desk</h2>
              <p className="price">About 2.950.000 VND / Member / Month</p>
              
              <p className="description">
                A creative, modern open space where you and your team will have
                a separate fixed seat - ensuring stability while still being part of a
                vibrant, young business community.
              </p>
              
              <p className="description">
                Suitable for individuals
              </p>
              
              <p className="description">
                Get 2 months free when signing a 12-month contract
              </p>
              
              <BackButton to="/service">
                <FaArrowLeft /> Back
              </BackButton>
            </HeaderContent>
            
            <HeaderImage>
              <img 
                src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1760000073/Screenshot_2025-10-09_155422_wqdemf.png" 
                alt="Fixed Desk" 
              />
            </HeaderImage>
          </HeaderSection>
          
          {/* When having a fixed seat Section */}
          <FeatureSection>
            <FeatureImage>
              <img 
                src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1760000123/Screenshot_2025-10-09_155509_cmdlgg.png" 
                alt="Fixed Desk Interior" 
              />
            </FeatureImage>
            
            <FeatureContent>
              <h3>When having a fixed seat</h3>
              <p>
                You will have a dedicated beautiful workspace, without
                having to worry about finding a seat every day or having
                someone else take your familiar space.
              </p>
              <p>
                Moreover, you can comfortably bring your personal belongings
                and computer and leave them at your seat safely, helping you
                save commuting time and create a personalized and efficient
                workspace.
              </p>
            </FeatureContent>
          </FeatureSection>
          
          {/* Flexible & Cost-saving Section */}
          <FeatureSection>
            <FeatureContent>
              <h3>Flexible & cost-saving</h3>
              <p>
                The fully serviced office at SWSpace Coworking is flexible
                with monthly or yearly contracts. You don't need to invest
                upfront in office furniture or equipment.
              </p>
              <p>
                Free use of common amenities such as meeting rooms
                and reception areas – a cost-effective and optimal
                solution for businesses.
              </p>
            </FeatureContent>
            
            <FeatureImage imageFirst={false}>
              <img 
                src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1760434831/Screenshot_2025-10-14_164016_pwiw7j.png" 
                alt="Flexible Office Space" 
              />
            </FeatureImage>
          </FeatureSection>
          
          {/* Amenities Image */}
          <AmenityImage>
            <img 
              src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1760434895/Screenshot_2025-10-14_164117_gafxnp.png" 
              alt="Office Amenities" 
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

export default FixedDeskDetailPage;