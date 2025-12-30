const axios = require('axios');

async function testCreatePaymentDirect() {
  try {
    console.log('Testing payment creation without auth...');
    
    // Test direct route without authentication first
    const testData = {
      userId: 16,
      amount: 50000,
      description: 'Test payment for seat booking',
      paymentMethodId: 1 // Use integer for method_id
    };
    
    console.log('Testing payment creation endpoint...');
    const response = await axios.post('http://localhost:5000/test-payment', testData);
    
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testCreatePaymentDirect();