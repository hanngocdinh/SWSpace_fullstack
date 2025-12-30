import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const DebugContainer = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  font-family: monospace;
`;

const Section = styled.div`
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  background: #45bf55;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 3px;
  cursor: pointer;
  margin-right: 1rem;
  margin-bottom: 1rem;
`;

const Output = styled.pre`
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 3px;
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
`;

const DebugPage = () => {
  const { currentUser } = useAuth();
  const [output, setOutput] = useState('');
  const [bookings, setBookings] = useState([]);

  const log = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setOutput(prev => `[${timestamp}] ${message}\n${prev}`);
  };

  const testAuth = () => {
    log('=== AUTH TEST ===');
    log(`Current user: ${JSON.stringify(currentUser, null, 2)}`);
    log(`Token from localStorage: ${localStorage.getItem('token') ? 'Found' : 'Not found'}`);
  };

  const testBookingsAPI = async () => {
    log('=== BOOKINGS API TEST ===');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        log('❌ No token found');
        return;
      }

      log('📡 Making API call...');
      const response = await fetch('/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      log(`📋 Response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        log(`✅ Success: ${JSON.stringify(data, null, 2)}`);
        setBookings(data.bookings || []);
      } else {
        const errorData = await response.json();
        log(`❌ Error: ${JSON.stringify(errorData, null, 2)}`);
      }
    } catch (error) {
      log(`💥 Exception: ${error.message}`);
    }
  };

  const testOccupiedSeats = async () => {
    log('=== OCCUPIED SEATS TEST ===');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        log('❌ No token found');
        return;
      }

      const url = '/api/bookings/seats/occupied?serviceType=hot-desk&date=2025-10-27';
      log(`📡 Making API call to: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      log(`📋 Response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        log(`✅ Success: ${JSON.stringify(data, null, 2)}`);
      } else {
        const errorData = await response.json();
        log(`❌ Error: ${JSON.stringify(errorData, null, 2)}`);
      }
    } catch (error) {
      log(`💥 Exception: ${error.message}`);
    }
  };

  const clearOutput = () => {
    setOutput('');
  };

  return (
    <DebugContainer>
      <Title>Debug Page</Title>
      
      <Section>
        <h3>Controls</h3>
        <Button onClick={testAuth}>Test Auth</Button>
        <Button onClick={testBookingsAPI}>Test Bookings API</Button>
        <Button onClick={testOccupiedSeats}>Test Occupied Seats</Button>
        <Button onClick={clearOutput}>Clear Output</Button>
      </Section>

      <Section>
        <h3>Current Bookings ({bookings.length})</h3>
        {bookings.length > 0 ? (
          bookings.map(booking => (
            <div key={booking._id} style={{ marginBottom: '1rem', padding: '1rem', background: '#f0f0f0' }}>
              <div><strong>Reference:</strong> {booking.bookingReference}</div>
              <div><strong>Seat:</strong> {booking.seatName}</div>
              <div><strong>Status:</strong> {booking.status}</div>
              <div><strong>Date:</strong> {new Date(booking.startDate).toLocaleDateString()}</div>
            </div>
          ))
        ) : (
          <p>No bookings found</p>
        )}
      </Section>

      <Section>
        <h3>Debug Output</h3>
        <Output>{output}</Output>
      </Section>
    </DebugContainer>
  );
};

export default DebugPage;
