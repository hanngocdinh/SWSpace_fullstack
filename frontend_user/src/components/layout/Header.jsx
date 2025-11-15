import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Link } from 'react-scroll';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaUser, FaSignOutAlt, FaHistory, FaCreditCard, FaQrcode } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const HeaderContainer = styled.header`
  background-color: #ffffff;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
`;

const NavContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;

  a {
    text-decoration: none;
    font-size: 1.5rem;
    font-weight: bold;
    color: #333;
  }

  span.sw {
    color: #45bf55;
  }

  span.space {
    color: #333;
  }
`;

const NavLinks = styled.nav`
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
    flex-direction: column;
    position: absolute;
    top: 60px;
    left: 0;
    width: 100%;
    background: white;
    padding: 1rem 0;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  }
`;

const NavItem = styled.div`
  margin: 0 1rem;
  cursor: pointer;
  color: #333;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    color: #45bf55;
  }

  @media (max-width: 768px) {
    margin: 0.5rem 0;
  }
`;

const BookButton = styled.a`
  background-color: #45bf55;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  margin-left: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background-color: #38a046;
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    margin: 1rem 0 0;
  }
`;

// Dropdown cho Book Your Seat
const BookWrapper = styled.div`
  position: relative;
`;

const BookDropdown = styled.div`
  position: absolute;
  top: calc(100% + 14px); /* nằm thấp hơn rõ ràng so với nút */
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  box-shadow: 0 10px 28px rgba(0,0,0,0.12);
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 0.75rem;
  display: ${(props) => (props.isOpen ? 'flex' : 'none')};
  flex-direction: column;
  width: 220px;
  gap: 0.5rem;
  z-index: 1001;
  /* Không sử dụng mũi tên để tạo cảm giác menu xổ xuống dạng native */
`;

const BookOption = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  color: #fff;
  border: none;
  outline: none;
  padding: 0.7rem 1rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s ease;
  background: ${(props) => (props.variant === 'team' ? 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)' : 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)')};
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(0,0,0,0.12);
  }

  &:active { transform: translateY(0); }
`;

const UserContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: 1rem;
  position: relative;
`;

const UserButton = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 5px;
  transition: all 0.3s;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const UserName = styled.span`
  font-weight: 500;
`;

const UserIcon = styled(FaUser)`
  color: #45bf55;
`;

const UserDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  padding: 0.5rem 0;
  min-width: 150px;
  display: ${props => props.isOpen ? 'block' : 'none'};
  z-index: 1001;
`;

const DropdownItem = styled.div`
  padding: 0.7rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.3s;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const MobileMenuIcon = styled.div`
  display: none;
  cursor: pointer;
  font-size: 1.5rem;

  @media (max-width: 768px) {
    display: block;
  }
`;

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [bookDropdownOpen, setBookDropdownOpen] = useState(false);
  const bookMenuRef = useRef(null);
  
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  // Yêu cầu: Trang login không hiển thị trạng thái đã đăng nhập để tránh cảm giác "tự động" đăng nhập khi quay lại.
  const suppressUserDisplay = location.pathname === '/login';
  const displayUser = currentUser && !suppressUserDisplay;
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };
  
  const handleBookSeat = () => {
    setBookDropdownOpen((prev) => !prev);
    setUserDropdownOpen(false);
  };

  const goToTarget = (path) => {
    setBookDropdownOpen(false);
    if (currentUser) {
      navigate(path);
    } else {
      navigate('/login', { state: { from: path } });
    }
  };

  const goFreelance = () => goToTarget('/booking/service');
  const goTeam = () => goToTarget('/team-booking');
  
  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const onClickOutside = (e) => {
      if (bookMenuRef.current && !bookMenuRef.current.contains(e.target)) {
        setBookDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Đóng dropdown khi chuyển route
  useEffect(() => {
    setBookDropdownOpen(false);
  }, [location.pathname]);

  return (
    <HeaderContainer style={{ backgroundColor: scrolled ? '#ffffff' : 'rgba(255, 255, 255, 0.95)' }}>
      <NavContainer>
        <Logo>
          <a href="/">
            <span className="sw">SW</span>
            <span className="space">Space</span>
          </a>
        </Logo>

        <MobileMenuIcon onClick={toggleMenu}>
          <FaBars />
        </MobileMenuIcon>

        <NavLinks isOpen={isOpen}>
          <NavItem>
            <Link to="home" smooth={true} duration={500} onClick={() => setIsOpen(false)}>
              Our Space
            </Link>
          </NavItem>
          <NavItem>
            <Link to="about" smooth={true} duration={500} onClick={() => setIsOpen(false)}>
              About
            </Link>
          </NavItem>
          <NavItem>
            <Link to="community" smooth={true} duration={500} onClick={() => setIsOpen(false)}>
              Community
            </Link>
          </NavItem>
          <NavItem>
            <RouterLink to="/utility" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setIsOpen(false)}>
              Utility
            </RouterLink>
          </NavItem>
          <NavItem>
            <RouterLink to="/service" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setIsOpen(false)}>
              Service
            </RouterLink>
          </NavItem>
          <NavItem>
            <Link to="contact" smooth={true} duration={500} onClick={() => setIsOpen(false)}>
              Contact
            </Link>
          </NavItem>
          <BookWrapper ref={bookMenuRef}>
            <BookButton onClick={handleBookSeat} role="button" aria-haspopup="true" aria-expanded={bookDropdownOpen}>
              Book Your Seat
            </BookButton>
            <BookDropdown isOpen={bookDropdownOpen}>
              <BookOption onClick={goFreelance} variant="freelance">Freelance</BookOption>
              <BookOption onClick={goTeam} variant="team">Team</BookOption>
            </BookDropdown>
          </BookWrapper>
          
          {displayUser ? (
            <UserContainer>
              <UserButton onClick={toggleUserDropdown}>
                <UserIcon />
                <UserName>{currentUser.fullName}</UserName>
              </UserButton>
              
              <UserDropdown isOpen={userDropdownOpen}>
                <DropdownItem onClick={() => { navigate('/profile'); setUserDropdownOpen(false); }}>
                  <FaUser />
                  <span>Profile</span>
                </DropdownItem>
                <DropdownItem onClick={() => { navigate('/booking-history'); setUserDropdownOpen(false); }}>
                  <FaHistory />
                  <span>Booking History</span>
                </DropdownItem>
                <DropdownItem onClick={() => { navigate('/payment-methods'); setUserDropdownOpen(false); }}>
                  <FaCreditCard />
                  <span>Payment Methods</span>
                </DropdownItem>
                <DropdownItem onClick={() => { navigate('/qr-checkin'); setUserDropdownOpen(false); }}>
                  <FaQrcode />
                  <span>QR Check-in</span>
                </DropdownItem>
                <DropdownItem onClick={handleLogout}>
                  <FaSignOutAlt />
                  <span>Sign Out</span>
                </DropdownItem>
              </UserDropdown>
            </UserContainer>
          ) : (
            <NavItem>
              <RouterLink 
                to="/login" 
                style={{ textDecoration: 'none', color: 'inherit' }}
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </RouterLink>
            </NavItem>
          )}
        </NavLinks>
      </NavContainer>
    </HeaderContainer>
  );
};

export default Header;