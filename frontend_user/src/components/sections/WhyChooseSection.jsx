import React from 'react';
import styled from 'styled-components';
import { FaWifi, FaClock, FaMapMarkerAlt, FaUsers, FaDesktop, FaHeart } from 'react-icons/fa';

const WhyChooseContainer = styled.section`
  padding: 3rem 2rem;
  background-color: #ffffff;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 1rem;
  color: #333;
`;

const SectionDescription = styled.p`
  max-width: 800px;
  margin: 0 auto 2rem;
  text-align: center;
  color: #555;
  line-height: 1.6;
`;

const FeaturesLayout = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const LeftSide = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: repeat(3, auto);
  gap: 2rem;
`;

const RightSide = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: repeat(3, auto);
  gap: 0.5rem;
`;

const FeatureBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const IconBox = styled.div`
  margin-bottom: 0.5rem;
  
  svg {
    font-size: 2rem;
    color: #45bf55;
  }
`;

const FeatureTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: bold;
`;

const FeatureDescription = styled.p`
  color: #555;
  line-height: 1.4;
  font-size: 0.85rem;
`;

const ImageBox = styled.div`
  width: 100%;
  height: ${props => props.height || '150px'};
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
    
    &:hover {
      transform: scale(1.05);
    }
  }
`;

const WhyChooseSection = () => {
  return (
    <WhyChooseContainer id="about">
      <SectionTitle>Why Choose SWSpace?</SectionTitle>
      <SectionDescription>
        Working alone at home can be challenging. But what if we could transform the workspace to feel connected, friendly, and comfortable? That is what we strive to achieve at SWSpace. We aim to provide you with a place where you can focus and work efficiently, with a comfortable yet professional and connected atmosphere.
      </SectionDescription>
      
      <FeaturesLayout>
        <LeftSide>
          {/* High-Speed WiFi */}
          <FeatureBox>
            <IconBox>
              <FaWifi />
            </IconBox>
            <FeatureTitle>High-Speed WiFi</FeatureTitle>
            <FeatureDescription>
              Reliable 100Mbps internet connection, perfect for everything from video calls to large file uploads.
            </FeatureDescription>
          </FeatureBox>
          
          {/* Unlimited working hours */}
          <FeatureBox>
            <IconBox>
              <FaClock />
            </IconBox>
            <FeatureTitle>Unlimited working hours</FeatureTitle>
            <FeatureDescription>
              At SWSpace, you can start a new day at 5 a.m. or finish an idea at 2 a.m., all without incurring after-hours costs. We believe that passion and creativity should not be limited by the clock.
            </FeatureDescription>
          </FeatureBox>
          
          {/* Central location */}
          <FeatureBox>
            <IconBox>
              <FaMapMarkerAlt />
            </IconBox>
            <FeatureTitle>Central location, easy to connect in all directions</FeatureTitle>
            <FeatureDescription>
              SWSpace is located in a prime location, with convenient transportation and close to administrative offices, helping you save time on commuting, meeting partners, or handling business procedures quickly.
            </FeatureDescription>
          </FeatureBox>
          
          {/* Professional Community */}
          <FeatureBox>
            <IconBox>
              <FaUsers />
            </IconBox>
            <FeatureTitle>Professional Community</FeatureTitle>
            <FeatureDescription>
              Someone says ergonomic chairs? Non-wobbly tables? Acclaimed and non-circuited rooms? Open 24/7? Yep - we have it all. We care about your work, your back and your flexibility.
            </FeatureDescription>
          </FeatureBox>
          
          {/* Optimize time and costs */}
          <FeatureBox>
            <IconBox>
              <FaDesktop />
            </IconBox>
            <FeatureTitle>Optimize time and costs</FeatureTitle>
            <FeatureDescription>
              We understand that every moment of your time is valuable. Therefore, SWSpace offers comprehensive workspace solutions, helping you eliminate all concerns about office operations: electricity, water, internet, reception, cleaning, security, guest services... Everything is taken care of by SWSpace.
            </FeatureDescription>
          </FeatureBox>
          
          {/* Community of creativity */}
          <FeatureBox>
            <IconBox>
              <FaHeart />
            </IconBox>
            <FeatureTitle>Community of creativity and connecting values</FeatureTitle>
            <FeatureDescription>
              By joining SWSpace, you not only have a workspace, but you also have a community of dynamic young entrepreneurs, where networking sessions, sharing experiences, or simply a cup of coffee can open up a series of valuable collaboration opportunities.
            </FeatureDescription>
          </FeatureBox>
        </LeftSide>
        
        <RightSide>
          <ImageBox height="160px" style={{ gridColumn: '1 / 2', gridRow: '1 / 2' }}>
            <img src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1759938828/Screenshot_2025-10-06_155923_stitgn.png" alt="SWSpace Bar Area" />
          </ImageBox>
          
          <ImageBox height="160px" style={{ gridColumn: '2 / 3', gridRow: '1 / 2' }}>
            <img src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1759938852/Screenshot_2025-10-06_160126_wzwcba.png" alt="SWSpace Meeting" />
          </ImageBox>
          
          <ImageBox height="160px" style={{ gridColumn: '1 / 2', gridRow: '2 / 3' }}>
            <img src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1759938894/Screenshot_2025-10-06_160036_rbyzkl.png" alt="SWSpace Working Area" />
          </ImageBox>
          
          <ImageBox height="160px" style={{ gridColumn: '2 / 3', gridRow: '2 / 3' }}>
            <img src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1759938946/Screenshot_2025-10-06_160054_gq9mks.png" alt="SWSpace Break Room" />
          </ImageBox>
          
          <ImageBox height="160px" style={{ gridColumn: '1 / 2', gridRow: '3 / 4' }}>
            <img src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1759938873/Screenshot_2025-10-06_152131_cirzjp.png" alt="SWSpace Corridor" />
          </ImageBox>
          
          <ImageBox height="160px" style={{ gridColumn: '2 / 3', gridRow: '3 / 4' }}>
            <img src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1759938966/Screenshot_2025-10-06_160157_wuimzj.png" alt="SWSpace Hallway" />
          </ImageBox>
        </RightSide>
      </FeaturesLayout>
    </WhyChooseContainer>
  );
};

export default WhyChooseSection;