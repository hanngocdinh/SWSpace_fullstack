import React, { useState, useEffect } from 'react';
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
  padding-top: 80px;
`;

const DebugContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
`;

const Section = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.3rem;
`;

const Button = styled.button`
  background-color: #45bf55;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.8rem 1.5rem;
  margin: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background-color: #38a046;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const LogArea = styled.pre`
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  max-height: 400px;
  overflow-y: auto;
  font-size: 0.85rem;
  margin-top: 1rem;
`;

const UserInfo = styled.div`
  background: #e3f2fd;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const FullBookingTestPage = () => {
  const [logs, setLogs] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  // Full booking flow test
  const testFullBookingFlow = async () => {
    setLoading(true);
    addLog('🚀 Starting full booking flow test...');
    
    try {
      // Step 1: Login
      addLog('👤 Step 1: Login...');
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const loginResponse = await fetch(`${base}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'nhathuy', password: 'password123' })
      });
      
      const loginData = await loginResponse.json();
      if (!loginData.success) {
        addLog(`❌ Login failed: ${loginData.message}`);
        return;
      }
      
      addLog('✅ Login successful');
      const token = loginData.token;
      
      // Step 2: Check current occupied seats BEFORE booking
      addLog('🔍 Step 2: Check occupied seats before booking...');
  const beforeResponse = await fetch(`${base}/api/bookings/seats/occupied?serviceType=hot-desk&date=2025-10-27`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const beforeData = await beforeResponse.json();
      addLog(`📊 Before booking: ${beforeData.count} occupied seats`);
      beforeData.occupiedSeats?.forEach(seat => {
        addLog(`  - ${seat.seatId} (${seat.bookingReference})`);
      });
      
      // Step 3: Create new booking for available seat
      addLog('📝 Step 3: Creating new booking...');
      const availableSeats = ['A1', 'A4', 'A5', 'A7', 'A8', 'B2', 'B4', 'B7'];
      const randomSeat = availableSeats[Math.floor(Math.random() * availableSeats.length)];
      
      const bookingData = {
        serviceType: 'hot-desk',
        packageDuration: 'daily',
        startDate: '2025-10-27',
        startTime: '09:00',
        seatId: randomSeat,
        seatName: randomSeat,
        floor: 1,
        specialRequests: 'Full booking flow test'
      };
      
      addLog(`🎯 Booking seat: ${randomSeat}`);
      
  const bookingResponse = await fetch(`${base}/api/bookings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });
      
      const bookingResult = await bookingResponse.json();
      if (!bookingResult.success) {
        addLog(`❌ Booking failed: ${bookingResult.message}`);
        return;
      }
      
      addLog('✅ Booking created successfully!');
      addLog(`  Reference: ${bookingResult.booking.bookingReference}`);
      addLog(`  Status: ${bookingResult.booking.status}`);
      
      // Step 4: Update booking to confirmed status
      addLog('🔄 Step 4: Updating booking status to confirmed...');
      
      // Use direct database update (simulating payment confirmation)
  const updateResponse = await fetch(`${base}/api/bookings/${bookingResult.booking.id}/confirm-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentMethod: 'credit-card',
          transactionId: 'TEST-' + Date.now()
        })
      });
      
      if (updateResponse.ok) {
        addLog('✅ Booking confirmed and paid');
      } else {
        addLog('⚠️ Could not confirm payment, but booking exists');
      }
      
      // Step 5: Check occupied seats AFTER booking
      addLog('🔍 Step 5: Check occupied seats after booking...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
  const afterResponse = await fetch(`${base}/api/bookings/seats/occupied?serviceType=hot-desk&date=2025-10-27`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const afterData = await afterResponse.json();
      addLog(`📊 After booking: ${afterData.count} occupied seats`);
      afterData.occupiedSeats?.forEach(seat => {
        addLog(`  - ${seat.seatId} (${seat.bookingReference})`);
      });
      
      const seatFound = afterData.occupiedSeats?.some(seat => seat.seatId === randomSeat);
      addLog(`🎯 Seat ${randomSeat} found in occupied list: ${seatFound ? '✅ YES' : '❌ NO'}`);
      
      // Step 6: Check booking history
      addLog('📋 Step 6: Check booking history...');
  const historyResponse = await fetch(`${base}/api/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const historyData = await historyResponse.json();
      addLog(`📚 Booking history: ${historyData.bookings?.length || 0} bookings`);
      historyData.bookings?.forEach((booking, index) => {
        addLog(`  ${index + 1}. ${booking.bookingReference} - ${booking.seatName} - ${booking.status}`);
      });
      
      addLog('🎉 Full booking flow test completed!');
      
    } catch (error) {
      addLog(`💥 Error in booking flow: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Check current user from localStorage
  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (user && token) {
      try {
        const userData = JSON.parse(user);
        setUserInfo({ user: userData, token });
        addLog(`📱 Found saved user: ${userData.username} (${userData.email})`);
      } catch (error) {
        addLog('❌ Error parsing saved user data');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else {
      addLog('ℹ️ No saved user found');
    }
  }, []);

  return (
    <PageContainer>
      <Header />
      <MainContent>
        <DebugContainer>
          <Title>Full Booking Flow Test</Title>
          
          {userInfo && (
            <UserInfo>
              <strong>Current User:</strong> {userInfo.user.username} ({userInfo.user.email})
            </UserInfo>
          )}

          <Section>
            <SectionTitle>Complete Booking Flow Test</SectionTitle>
            <p>This will test the entire booking process from login to seat map update:</p>
            <ol>
              <li>Login with nhathuy user</li>
              <li>Check current occupied seats</li>
              <li>Create new booking for available seat</li>
              <li>Confirm payment (if possible)</li>
              <li>Check occupied seats again (should include new seat)</li>
              <li>Verify booking appears in history</li>
            </ol>
            <Button onClick={testFullBookingFlow} disabled={loading}>
              {loading ? 'Testing...' : 'Run Full Booking Flow Test'}
            </Button>
          </Section>

          <Section>
            <SectionTitle>Test Logs</SectionTitle>
            <Button onClick={clearLogs}>Clear Logs</Button>
            <LogArea>
              {logs.length === 0 ? 'No logs yet...' : logs.join('\n')}
            </LogArea>
          </Section>
        </DebugContainer>
      </MainContent>
      <Footer />
    </PageContainer>
  );
};

export default FullBookingTestPage;
