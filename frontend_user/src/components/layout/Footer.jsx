import React from 'react';
import styled from 'styled-components';
import { FaEnvelope, FaPhone } from 'react-icons/fa';

const FooterContainer = styled.footer`
  background-color: #f5f5f5;
  padding: 3rem 0;
  color: #333;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  padding: 0 2rem;

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const LogoSection = styled(FooterSection)`
  h2 {
    margin-bottom: 1rem;
  }

  p {
    margin-bottom: 1rem;
    line-height: 1.6;
  }
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;

  .sw {
    color: #45bf55;
  }

  .space {
    color: #333;
  }
`;

const ContactInfo = styled.div`
  margin-top: 1rem;
  
  p {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
    
    svg {
      margin-right: 0.5rem;
      color: #45bf55;
    }
  }
`;

const LinkSection = styled(FooterSection)`
  h4 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
    color: #333;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    margin-bottom: 0.5rem;
  }

  a {
    text-decoration: none;
    color: #333;
    transition: color 0.3s ease;

    &:hover {
      color: #45bf55;
    }
  }
`;

const PromotionSection = styled(FooterSection)`
  h4 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }

  p {
    margin-bottom: 1rem;
    line-height: 1.6;
  }
`;

const CopyrightSection = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem 0;
  text-align: center;
  border-top: 1px solid #ddd;
  margin-top: 2rem;
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <LogoSection>
          <Logo>
            <span className="sw">SW</span>
            <span className="space">Space</span>
          </Logo>
          <p>03 Quang Trung<br /> Da Nang City</p>
          <ContactInfo>
            <p>
              <FaEnvelope />
              info@swspace.com.vn
            </p>
            <p>
              <FaPhone />
              0905965494
            </p>
          </ContactInfo>
        </LogoSection>

        <LinkSection>
          <h4>ACCESS</h4>
          <ul>
            <li><a href="#our-space">Our Space</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#community">Community</a></li>
            <li><a href="#utility">Utility</a></li>
            <li><a href="#service">Service</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </LinkSection>

        <LinkSection>
          <h4>SERVICES</h4>
          <ul>
            <li><a href="#hot-desk">Hot Desk</a></li>
            <li><a href="#fixed-desk">Fixed Desk</a></li>
            <li><a href="#private-office">Private Office</a></li>
            <li><a href="#meeting-room">Meeting Room</a></li>
            <li><a href="#networking-space">Networking Space</a></li>
          </ul>
        </LinkSection>

        <PromotionSection>
          <h4>PROMOTION</h4>
          <p>Book for 12 months and get up to 2 additional months free.</p>
        </PromotionSection>
      </FooterContent>
      
      <CopyrightSection>
        <p>©SWSpace 2025</p>
      </CopyrightSection>
    </FooterContainer>
  );
};

export default Footer;