const axios = require('axios');
const jwt = require('jsonwebtoken');

// Tạo token cho user test
const userId = 16; // user khoakhoa
const email = 'wingspet2025@gmail.com';

// Lấy JWT_SECRET từ config
const JWT_SECRET = process.env.JWT_SECRET || 'please_set_a_long_secret_in_env';
const token = jwt.sign(
  { userId: userId, email: email },
  JWT_SECRET,
  { expiresIn: '24h' }
);

async function testCreatePaymentWithToken() {
  try {
    console.log('Testing payment creation with token...');
    console.log('Using token for user:', userId, email);
    
    const paymentData = {
      userId: userId,
      amount: 50000,
      description: 'Test payment for seat booking',
      paymentMethodId: 'test-method-123'
    };
    
    console.log('Sending payment data:', paymentData);
    
    const response = await axios.post('http://localhost:5000/api/payments', paymentData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    // Kiểm tra database sau khi tạo payment
    const paymentsResponse = await axios.get('http://localhost:5000/api/payments', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('\nPayments in database:', paymentsResponse.data);
    
  } catch (error) {
    console.error('Error testing payment:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testCreatePaymentWithToken();