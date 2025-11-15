import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const HeroContainer = styled.section`
  padding: 8rem 2rem 5rem;
  background: #ffffff;
  display: flex;
  align-items: center;
  min-height: 100vh;
  
  @media (max-width: 992px) {
    padding-top: 6rem;
    flex-direction: column;
  }
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  
  @media (max-width: 992px) {
    flex-direction: column;
  }
`;

const TextContent = styled.div`
  flex: 1;
  padding-right: 2rem;
  
  @media (max-width: 992px) {
    padding-right: 0;
    margin-bottom: 2rem;
    text-align: center;
  }
`;

const HeroTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  
  span {
    color: #45bf55;
  }
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  color: #555;
`;

const CTAContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: 992px) {
    justify-content: center;
  }
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const CTAButton = styled.button`
  display: inline-block;
  padding: 0.8rem 1.5rem;
  background-color: ${props => props.primary ? '#45bf55' : 'transparent'};
  color: ${props => props.primary ? 'white' : '#45bf55'};
  border: 2px solid #45bf55;
  border-radius: 5px;
  font-weight: bold;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background-color: ${props => props.primary ? '#38a046' : 'rgba(69, 191, 85, 0.1)'};
  }
`;

const ImageContainer = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const VideoFrame = styled.div`
  width: 100%;
  max-width: 560px;
  height: 315px;
  background-color: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  
  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
  
  .placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #000;
  }
  
  .play-button {
    width: 80px;
    height: 80px;
    background-color: rgba(69, 191, 85, 0.8);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
  
  .play-icon {
    width: 0;
    height: 0;
    border-top: 20px solid transparent;
    border-bottom: 20px solid transparent;
    border-left: 30px solid white;
    margin-left: 10px;
  }
`;

const HeroSection = () => {
  const navigate = useNavigate();

  const handleTeamClick = () => {
    navigate('/team-booking');
  };

  const handleFreelancerClick = () => {
    navigate('/booking');
  };

  return (
    <HeroContainer id="home">
      <HeroContent>
        <TextContent>
          <HeroTitle>Welcome to <span>SW</span>Space</HeroTitle>
          <HeroSubtitle>
            A Friendly & Inspiring Coworking Community.<br />
            At SWSpace, we believe that the right environment can spark creativity and growth. Here you'll find a place where you can work, where freelancers and teams come together, share ideas, and collaborate.
            <br /><br />
            Here, you'll find everything you need to focus, connect, and grow - with meeting rooms designed for real collaboration. Most importantly, you'll be surrounded by a vibrant community of like-minded professionals.
          </HeroSubtitle>
          <CTAContainer>
            <CTAButton primary onClick={handleFreelancerClick}>
              YOU ARE A FREELANCER
            </CTAButton>
            <CTAButton onClick={handleTeamClick}>
              YOU ARE A TEAM
            </CTAButton>
          </CTAContainer>
        </TextContent>
        <ImageContainer>
          <VideoFrame>
            <div className="placeholder">
              <div className="play-button">
                <div className="play-icon"></div>
              </div>
            </div>
          </VideoFrame>
        </ImageContainer>
      </HeroContent>
    </HeroContainer>
  );
};

export default HeroSection;