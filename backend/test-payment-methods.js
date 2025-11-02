const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testPaymentMethods() {
  try {
    console.log('🔐 Testing login...');
    
    // 1. Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      username: 'nhathuy',
      password: 'password123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // 2. Get payment types
    console.log('\n📋 Fetching payment types...');
    const typesResponse = await axios.get(`${API_BASE}/payment-methods/types`, { headers });
    console.log('✅ Payment types:', Object.keys(typesResponse.data.paymentTypes));
    
    // 3. Get existing payment methods
    console.log('\n💳 Fetching existing payment methods...');
    const methodsResponse = await axios.get(`${API_BASE}/payment-methods`, { headers });
    console.log('✅ Existing payment methods:', methodsResponse.data.paymentMethods?.length || 0);
    
    // 4. Add a new payment method
    console.log('\n➕ Adding new payment method...');
    const newPaymentMethod = {
      type: 'credit-card',
      cardHolderName: 'Test Card Holder',
      cardNumber: '4242424242424242',
      expiryMonth: 12,
      expiryYear: 2027,
      last4Digits: '4242',
      displayName: 'Test Visa Card'
    };
    
    const addResponse = await axios.post(`${API_BASE}/payment-methods`, newPaymentMethod, { headers });
    
    if (addResponse.data.success) {
      console.log('✅ Payment method added successfully');
      console.log('   ID:', addResponse.data.paymentMethod._id);
      console.log('   Display Name:', addResponse.data.paymentMethod.displayName);
    } else {
      console.log('❌ Failed to add payment method:', addResponse.data.message);
    }
    
    // 5. Get payment methods again to verify
    console.log('\n📋 Fetching payment methods after addition...');
    const updatedMethodsResponse = await axios.get(`${API_BASE}/payment-methods`, { headers });
    console.log('✅ Total payment methods:', updatedMethodsResponse.data.paymentMethods?.length || 0);
    
    updatedMethodsResponse.data.paymentMethods?.forEach((method, index) => {
      console.log(`   ${index + 1}. ${method.displayName} (${method.type}) - Default: ${method.isDefault}`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testPaymentMethods();
