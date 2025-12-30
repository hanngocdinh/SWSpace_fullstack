import React from 'react';
import styled from 'styled-components';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

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

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #333;
`;

const FeaturesLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4rem;
`;

// Working 24/7 Section
const WorkingSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const WorkingImage = styled.img`
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
`;

const WorkingContent = styled.div`
  h3 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    color: #333;
  }

  p {
    color: #555;
    line-height: 1.6;
  }
`;

// Location Section
const LocationSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    flex-direction: column-reverse;
  }
`;

const LocationImage = styled.img`
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
`;

const LocationContent = styled.div`
  h3 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    color: #333;
  }

  p {
    color: #555;
    line-height: 1.6;
  }
`;

// Internet and Flexible Section
const DoubleFeatureSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  display: flex;
  flex-direction: column;

  img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: #333;
  }

  p {
    color: #555;
    line-height: 1.6;
  }
`;

// All-Inclusive Service Section
const ServiceSection = styled.div`
  h3 {
    font-size: 1.8rem;
    margin-bottom: 2rem;
    color: #333;
    text-align: center;
  }
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const ServiceCard = styled.div`
  display: flex;
  flex-direction: column;

  img {
    width: 100%;
    height: 180px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  h4 {
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
    color: #333;
  }

  p {
    color: #555;
    line-height: 1.5;
    font-size: 0.95rem;
  }
`;

// Professional Space Section
const ProfessionalSpaceSection = styled.div`
  h3 {
    font-size: 1.8rem;
    margin-bottom: 2rem;
    color: #333;
    text-align: center;
  }
`;

const SpacesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DiscussionArea = styled.div`
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  
  img {
    width: 100%;
    border-radius: 8px;
    margin-bottom: 1rem;
  }
  
  h4 {
    font-size: 1.3rem;
    color: #333;
  }
`;

const SpaceCard = styled.div`
  display: flex;
  flex-direction: column;

  img {
    width: 100%;
    height: 240px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  h4 {
    font-size: 1.3rem;
    color: #333;
    text-align: center;
  }
`;

// Community Section
const CommunitySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3rem;
  background-color: #f9f9f7;
  padding: 3rem;
  border-radius: 8px;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
`;

const CommunityContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  text-align: left;
  
  h3 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    color: #333;
  }
  
  p {
    color: #555;
    line-height: 1.7;
    margin-bottom: 1rem;
  }
`;

const CommunityImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  
  img {
    width: 100%;
    border-radius: 8px;
    height: 240px;
    object-fit: cover;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
    
    &:hover {
      transform: translateY(-5px);
    }
  }
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const UtilityPage = () => {
  return (
    <PageContainer>
      <Header />
      <MainContent>
        <SectionContainer>
          <SectionTitle>Customer utilities</SectionTitle>
          <FeaturesLayout>
            {/* Working 24/7 Section */}
            <WorkingSection>
              <WorkingImage 
                src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1759938995/Screenshot_2025-10-06_160257_bsw3j6.png" 
                alt="Working 24/7 at SWSpace" 
              />
              <WorkingContent>
                <h3>Working 24/7</h3>
                <p>
                  The space is always ready, with flexible access using a personal key card and 24/7 security. Perfect for late-night inspiration or early morning projects, working beyond regular office hours.
                </p>
              </WorkingContent>
            </WorkingSection>

            {/* Location Section */}
            <LocationSection>
              <LocationContent>
                <h3>Prime location – Convenient transportation</h3>
                <p>
                  Located in the center of Hai Chau District, right on Quang Trung Street, Da Nang City, SWSpace has a prime location, easily connected to government offices and the city's core areas.
                </p>
              </LocationContent>
              <LocationImage 
                src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1759943395/Screenshot_2025-10-07_192026_fokwli.png" 
                alt="Prime location of SWSpace" 
              />
            </LocationSection>

            {/* High-speed Internet and Flexible & cost-effective */}
            <DoubleFeatureSection>
              <FeatureCard>
                <img 
                  src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1759943438/Screenshot_2025-10-09_001010_gp1jxt.png" 
                  alt="High-speed Internet" 
                />
                <h3>High-speed Internet</h3>
                <p>
                  Equipped with dedicated high-speed fiber optic connections and an automatic switch-over backup system. No more worries about network lag during online meetings, team work, or calls with global partners.
                </p>
              </FeatureCard>
              <FeatureCard>
                <img 
                  src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1759943491/Screenshot_2025-10-09_001113_irbzga.png" 
                  alt="Flexible & cost-effective space" 
                />
                <h3>Flexible & cost-effective</h3>
                <p>
                  Flexible contracts according to needs (monthly, yearly). No need for initial investment in furniture and office equipment.
                </p>
              </FeatureCard>
            </DoubleFeatureSection>

            {/* All-inclusive service */}
            <ServiceSection>
              <h3>All-inclusive service</h3>
              <ServicesGrid>
                <ServiceCard>
                  <img 
                    src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1759943523/Screenshot_2025-10-07_192637_eahf2v.png" 
                    alt="Free drinks at SWSpace" 
                  />
                  <h4>Free drinks</h4>
                  <p>Coffee, tea, soft drinks...</p>
                </ServiceCard>
                <ServiceCard>
                  <img 
                    src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1759943561/Screenshot_2025-10-09_001228_sfzxxj.png" 
                    alt="Printing and copying services" 
                  />
                  <h4>Printing and convenient copying</h4>
                  <p>You just need to place the order on the computer, and all the documents will be ready in a few minutes.</p>
                </ServiceCard>
                <ServiceCard>
                  <img 
                    src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1759943614/Screenshot_2025-10-09_001323_bq51eh.png" 
                    alt="Professional receptionist" 
                  />
                  <h4>Professional receptionist</h4>
                  <p>Receiving guests, handling correspondence, scheduling meetings.</p>
                </ServiceCard>
              </ServicesGrid>
            </ServiceSection>

            {/* Professional space at SWSpace */}
            <ProfessionalSpaceSection>
              <h3>Professional space at SWSpace</h3>
              <SpacesGrid>
                <SpaceCard>
                  <img 
                    src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1759943692/Screenshot_2025-10-09_001429_ksy3w8.png" 
                    alt="Pantry Area at SWSpace" 
                  />
                  <h4>Pantry Area</h4>
                </SpaceCard>
                <SpaceCard>
                  <img 
                    src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1759943743/Screenshot_2025-10-09_001515_keypi0.png" 
                    alt="Meeting room at SWSpace" 
                  />
                  <h4>Meeting room</h4>
                </SpaceCard>
              </SpacesGrid>
              <DiscussionArea>
                <img 
                  src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1759943802/Screenshot_2025-10-09_001623_fdidri.png" 
                  alt="General discussion area" 
                />
                <h4>General discussion area</h4>
              </DiscussionArea>
            </ProfessionalSpaceSection>

            {/* Community Section */}
            <CommunitySection>
              <CommunityContent>
                <h3>A place where every connection begins and the community is nurtured</h3>
                <p>
                  At SWSpace, we not only create a workplace but also build a vibrant community of young entrepreneurs – a place where valuable connections naturally form through conversations, sharing, and collaborations.
                </p>
                <p>
                  Community events organized by SWSpace are special occasions for customers to be appreciated, connected, and to spread the spirit of creativity in a modern, open, and warm working environment.
                </p>
              </CommunityContent>
              <CommunityImagesGrid>
                <img 
                  src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1759943840/Screenshot_2025-10-09_001706_rrr4yu.png" 
                  alt="Community workspace" 
                />
                <img 
                  src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1759943887/Screenshot_2025-10-09_001749_e1cmxb.png" 
                  alt="Collaborative environment" 
                />
                <img 
                  src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1759943951/Screenshot_2025-10-09_001857_ppq1b9.png" 
                  alt="Community events" 
                />
              </CommunityImagesGrid>
            </CommunitySection>
          </FeaturesLayout>
        </SectionContainer>
      </MainContent>
      <Footer />
    </PageContainer>
  );
};

export default UtilityPage;