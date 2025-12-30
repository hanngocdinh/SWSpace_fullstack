#!/usr/bin/env node
// Migrated payment methods test to unified backend
const axios = require('axios');
const API_BASE = process.env.API_BASE || 'http://localhost:5000/api';
const USERNAME = process.env.TEST_USERNAME || 'nhathuy';
const PASSWORD = process.env.TEST_PASSWORD || 'password123';

async function run() {
  try {
    console.log('🔐 Login...');
    const login = await axios.post(`${API_BASE}/auth/login`, { username: USERNAME, password: PASSWORD });
    if (!login.data.success) throw new Error('Login failed');
    const token = login.data.token;

    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    console.log('\n📋 Fetching payment types...');
    const types = await axios.get(`${API_BASE}/payment-methods/types`, { headers });
    console.log('✅ Payment types:', Object.keys(types.data.paymentTypes));

    console.log('\n💳 Fetching existing payment methods...');
    const methods = await axios.get(`${API_BASE}/payment-methods`, { headers });
    console.log('✅ Existing payment methods:', methods.data.paymentMethods?.length || 0);

    console.log('\n➕ Adding new payment method...');
    const newMethod = { type: 'credit-card', cardHolderName: 'Test Card Holder', cardNumber: '4242424242424242', expiryMonth: 12, expiryYear: 2027, last4Digits: '4242', displayName: 'Test Visa Card' };
    const added = await axios.post(`${API_BASE}/payment-methods`, newMethod, { headers });
    if (added.data.success) {
      console.log('✅ Added:', added.data.paymentMethod._id, added.data.paymentMethod.displayName);
    } else {
      console.log('❌ Failed to add payment method:', added.data.message);
    }

    console.log('\n📋 Fetching payment methods after addition...');
    const updated = await axios.get(`${API_BASE}/payment-methods`, { headers });
    console.log('✅ Total payment methods:', updated.data.paymentMethods?.length || 0);
    updated.data.paymentMethods?.forEach((m, i) => console.log(`   ${i+1}. ${m.displayName} (${m.type}) - Default: ${m.isDefault}`));
  } catch (e) {
    console.error('❌ Test failed:', e.response?.data || e.message);
    process.exitCode = 1;
  }
}

if (require.main === module) run();
module.exports = run;
