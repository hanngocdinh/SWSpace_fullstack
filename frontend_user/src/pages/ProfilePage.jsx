import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { FaUser, FaCalendar, FaMapMarkerAlt, FaClock, FaMoneyBillWave } from 'react-icons/fa';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  padding-top: 80px;
  background-color: #f8f9fa;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const ProfileHeader = styled.div`
  background: white;
  border-radius: 10px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ProfileTitle = styled.h1`
  color: #333;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ProfileInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
`;

const InfoCard = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #45bf55;
`;

const InfoLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const InfoValue = styled.div`
  font-size: 1.1rem;
  font-weight: 500;
  color: #333;
`;

const SectionTitle = styled.h2`
  color: #333;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BookingHistorySection = styled.div`
  background: white;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const BookingCard = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const BookingHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1rem;
`;

const BookingReference = styled.div`
  font-weight: 600;
  color: #45bf55;
  font-size: 1.1rem;
`;

const BookingStatus = styled.div`
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  background-color: ${props => {
    switch (props.status) {
      case 'confirmed': return '#d4edda';
      case 'pending': return '#fff3cd';
      case 'cancelled': return '#f8d7da';
      default: return '#e2e3e5';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'confirmed': return '#155724';
      case 'pending': return '#856404';
      case 'cancelled': return '#721c24';
      default: return '#383d41';
    }
  }};
`;

const BookingDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const BookingDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  font-size: 1.1rem;
  color: #666;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Profile - Token from localStorage:', token ? 'Found' : 'Not found');
      
      if (!token) {
        console.log('❌ Profile - No token found, skipping fetch');
        return;
      }

      console.log('📡 Profile - Fetching bookings...');
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/bookings?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📋 Profile - Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Profile - Bookings data received:', data);
        setBookings(data.bookings || []);
      } else {
        const errorData = await response.json();
        console.error('❌ Profile - Error response:', errorData);
      }
    } catch (error) {
      console.error('💥 Profile - Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (!currentUser) {
    return (
      <PageContainer>
        <Header />
        <MainContent>
          <Container>
            <div>Please login to view your profile.</div>
          </Container>
        </MainContent>
        <Footer />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header />
      <MainContent>
        <Container>
          <ProfileHeader>
            <ProfileTitle>
              <FaUser />
              Profile Information
            </ProfileTitle>
            
            <ProfileInfo>
              <InfoCard>
                <InfoLabel>Full Name</InfoLabel>
                <InfoValue>{currentUser.fullName}</InfoValue>
              </InfoCard>
              
              <InfoCard>
                <InfoLabel>Email</InfoLabel>
                <InfoValue>{currentUser.email}</InfoValue>
              </InfoCard>
              
              <InfoCard>
                <InfoLabel>Username</InfoLabel>
                <InfoValue>{currentUser.username}</InfoValue>
              </InfoCard>
              
              <InfoCard>
                <InfoLabel>Member Since</InfoLabel>
                <InfoValue>{formatDate(currentUser.createdAt || new Date())}</InfoValue>
              </InfoCard>
            </ProfileInfo>
          </ProfileHeader>

          <BookingHistorySection>
            <SectionTitle>
              <FaCalendar />
              Recent Bookings
            </SectionTitle>
            
            {loading ? (
              <LoadingContainer>Loading your bookings...</LoadingContainer>
            ) : bookings.length === 0 ? (
              <EmptyState>
                <p>You haven't made any bookings yet.</p>
                <p>Start by booking your first workspace!</p>
              </EmptyState>
            ) : (
              bookings.slice(0, 5).map(booking => (
                <BookingCard key={booking._id}>
                  <BookingHeader>
                    <BookingReference>#{booking.bookingReference}</BookingReference>
                    <BookingStatus status={booking.status}>
                      {booking.status}
                    </BookingStatus>
                  </BookingHeader>
                  
                  <BookingDetails>
                    <BookingDetail>
                      <FaMapMarkerAlt />
                      <span>{booking.seatName} - Floor {booking.floor}</span>
                    </BookingDetail>
                    
                    <BookingDetail>
                      <FaCalendar />
                      <span>{formatDate(booking.startDate)}</span>
                    </BookingDetail>
                    
                    <BookingDetail>
                      <FaClock />
                      <span>{booking.startTime} - {booking.endTime}</span>
                    </BookingDetail>
                    
                    <BookingDetail>
                      <FaMoneyBillWave />
                      <span>{formatCurrency(booking.finalPrice)}</span>
                    </BookingDetail>
                  </BookingDetails>
                </BookingCard>
              ))
            )}
          </BookingHistorySection>
        </Container>
      </MainContent>
      <Footer />
    </PageContainer>
  );
};

export default ProfilePage;
