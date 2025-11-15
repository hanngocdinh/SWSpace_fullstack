import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';

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
  margin-bottom: 2rem;
  color: #333;
  text-align: center;
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ServiceCard = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 2rem;

  img {
    width: 100%;
    height: 260px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 1.5rem;
  }

  h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: #333;
  }

  p {
    color: #555;
    margin-bottom: 1rem;
  }
`;

const ViewDetailButton = styled.a`
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
  transition: all 0.3s ease;

  &:hover {
    background-color: #e0e0e0;
  }

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

const SingleServiceCard = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 2rem;
  max-width: 500px;

  img {
    width: 100%;
    height: 260px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 1.5rem;
  }

  h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: #333;
  }

  p {
    color: #555;
    margin-bottom: 1rem;
  }
`;

const WelcomeSection = styled.div`
  text-align: center;
  margin: 4rem 0;
`;

const WelcomeTitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #333;

  span {
    color: #45bf55;
  }
`;

const OptionsText = styled.p`
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: #333;
`;

const OptionsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

const OptionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.primary ? "#45bf55" : "#f5f5f5"};
  color: ${props => props.primary ? "white" : "#333"};
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .arrow-icon {
    margin-left: 0.5rem;
  }
`;

const ServicePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { selectServiceType } = useBooking();
  
  const handleServiceTypeSelection = (type) => {
    if (isAuthenticated()) {
      // Nếu đã đăng nhập, chuyển đến trang booking với loại dịch vụ đã chọn
      selectServiceType(type);
      navigate('/booking/package');
    } else {
      // Nếu chưa đăng nhập, chuyển đến trang đăng nhập với redirect path
      navigate('/login', { state: { from: '/booking/service' } });
    }
  };
  
  return (
    <PageContainer>
      <Header />
      <MainContent>
        <SectionContainer>
          <SectionTitle>Workspace solutions</SectionTitle>
          
          <ServicesGrid>
            <ServiceCard>
              <img 
                src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1759999994/Screenshot_2025-10-09_155300_kll7tl.png" 
                alt="Private Office" 
              />
              <h3>Private Office</h3>
              <p>About 3.400.000 VNĐ / Member / Month</p>
              <ViewDetailButton as={Link} to="/service/private-office">
                View detail <span className="arrow-icon">→</span>
              </ViewDetailButton>
            </ServiceCard>
            
            <ServiceCard>
              <img 
                src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1760000073/Screenshot_2025-10-09_155422_wqdemf.png" 
                alt="Fixed Desk" 
              />
              <h3>Fixed Desk</h3>
              <p>About 2.950.000 VNĐ / Member / Month</p>
              <ViewDetailButton as={Link} to="/service/fixed-desk">
                View detail <span className="arrow-icon">→</span>
              </ViewDetailButton>
            </ServiceCard>
            
            <ServiceCard>
              <img 
                src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1760000123/Screenshot_2025-10-09_155509_cmdlgg.png" 
                alt="Hot Desk" 
              />
              <h3>Hot Desk</h3>
              <p>About 2.350.000 VNĐ / Member / Month</p>
              <ViewDetailButton as={Link} to="/service/hot-desk">
                View detail <span className="arrow-icon">→</span>
              </ViewDetailButton>
            </ServiceCard>
            
            <ServiceCard>
              <img 
                src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1760000185/Screenshot_2025-10-09_155610_izpoax.png" 
                alt="Meeting Room" 
              />
              <h3>Meeting Room</h3>
              <p>About 200.000 vnđ / hours</p>
              <ViewDetailButton as={Link} to="/service/meeting-room">
                View detail <span className="arrow-icon">→</span>
              </ViewDetailButton>
            </ServiceCard>
          </ServicesGrid>
          
          <SingleServiceCard>
            <img 
              src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1760000266/Screenshot_2025-10-09_155732_dzzhgv.png" 
              alt="Networking Space" 
            />
            <h3>Networking Space</h3>
            <p>About 3.000.000 VNĐ / 3 hours</p>
            <ViewDetailButton as={Link} to="/service/networking-space">
              View detail <span className="arrow-icon">→</span>
            </ViewDetailButton>
          </SingleServiceCard>
          
          <WelcomeSection>
            <WelcomeTitle>Welcome to <span>SW</span>Space</WelcomeTitle>
            <OptionsText>Let choose the option</OptionsText>
            <OptionsContainer>
              <OptionButton onClick={() => handleServiceTypeSelection('freelancer')} primary>YOU ARE A FREELANCER</OptionButton>
              <OptionButton onClick={() => handleServiceTypeSelection('team')}>YOU ARE A TEAM</OptionButton>
            </OptionsContainer>
          </WelcomeSection>
          
        </SectionContainer>
      </MainContent>
      <Footer />
    </PageContainer>
  );
};

export default ServicePage;