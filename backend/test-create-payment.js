const axios = require('axios');

async function testCreatePayment() {
  try {
    console.log('Testing payment creation...');
    
    const paymentData = {
      userId: 1, // Assuming user with ID 1 exists
      amount: 50000,
      description: 'Test payment for seat booking',
      paymentMethodId: 'test-method-123'
    };
    
    console.log('Sending payment data:', paymentData);
    
    const response = await axios.post('http://localhost:5000/api/payments', paymentData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    // Fetch all payments to verify it was created
    const paymentsResponse = await axios.get('http://localhost:5000/api/payments');
    console.log('\nAll payments in database:', paymentsResponse.data);
    
  } catch (error) {
    console.error('Error testing payment:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testCreatePayment();