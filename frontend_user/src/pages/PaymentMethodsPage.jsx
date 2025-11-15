import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { 
  FaCreditCard, 
  FaUniversity, 
  FaMobileAlt, 
  FaPaypal, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaStar,
  FaTimes,
  FaCheck
} from 'react-icons/fa';

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
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
`;

const PageHeader = styled.div`
  background: white;
  border-radius: 10px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const PageTitle = styled.h1`
  color: #333;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const PageSubtitle = styled.p`
  color: #666;
  margin-bottom: 2rem;
`;

const AddButton = styled.button`
  background: #45bf55;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
  
  &:hover {
    background: #38a046;
    transform: translateY(-2px);
  }
`;

const PaymentMethodGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const PaymentMethodCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: ${props => props.isDefault ? '2px solid #45bf55' : '1px solid #e0e0e0'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const CardIcon = styled.div`
  font-size: 2rem;
  color: #45bf55;
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: none;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 0.5rem;
  cursor: pointer;
  color: #666;
  transition: all 0.3s;
  
  &:hover {
    background: #f5f5f5;
    color: #333;
  }
  
  &.default {
    background: #45bf55;
    color: white;
    border-color: #45bf55;
  }
  
  &.delete {
    &:hover {
      background: #dc3545;
      color: white;
      border-color: #dc3545;
    }
  }
`;

const CardTitle = styled.h3`
  color: #333;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CardDetails = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const DefaultBadge = styled.span`
  background: #45bf55;
  color: white;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  text-transform: uppercase;
  font-weight: 500;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 10px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const ModalTitle = styled.h2`
  color: #333;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #333;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #45bf55;
  }
`;

const Select = styled.select`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #45bf55;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const SubmitButton = styled.button`
  background: #45bf55;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 1rem;
  
  &:hover {
    background: #38a046;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
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
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const PaymentMethodsPage = () => {
  const { currentUser } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'credit-card',
    cardHolderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    phoneNumber: '',
    paypalEmail: '',
    displayName: ''
  });

  useEffect(() => {
    fetchPaymentMethods();
    fetchPaymentTypes();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔄 Fetching payment methods with token:', token ? 'Present' : 'Missing');
      
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/payment-methods`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Payment methods response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Payment methods data:', data);
        setPaymentMethods(data.paymentMethods || []);
      } else {
        const errorData = await response.json();
        console.error('❌ Payment methods fetch failed:', errorData);
      }
    } catch (error) {
      console.error('❌ Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔄 Fetching payment types with token:', token ? 'Present' : 'Missing');
      
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/payment-methods/types`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Payment types response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Payment types data:', data);
        setPaymentTypes(data.paymentTypes || {});
      } else {
        const errorData = await response.json();
        console.error('❌ Payment types fetch failed:', errorData);
      }
    } catch (error) {
      console.error('❌ Error fetching payment types:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('💳 Submitting payment method form...');
    console.log('📝 Form data:', formData);
    
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Using token:', token ? 'Present' : 'Missing');
      
      // Process form data based on payment type
      const submitData = { ...formData };
      
      if (formData.type.includes('card')) {
        submitData.last4Digits = formData.cardNumber.slice(-4);
      }
      
      console.log('📤 Submitting data:', submitData);

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/payment-methods`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      console.log('📡 Submit response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Payment method added successfully:', result);
        await fetchPaymentMethods();
        setModalOpen(false);
        resetForm();
        alert('Payment method added successfully!');
      } else {
        const error = await response.json();
        console.error('❌ Submit failed:', error);
        alert(error.message || 'Error adding payment method');
      }
    } catch (error) {
      console.error('❌ Error adding payment method:', error);
      alert('Error adding payment method: ' + error.message);
    }
  };

  const setAsDefault = async (paymentMethodId) => {
    try {
      const token = localStorage.getItem('token');
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/payment-methods/${paymentMethodId}/set-default`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchPaymentMethods();
      }
    } catch (error) {
      console.error('Error setting default payment method:', error);
    }
  };

  const deletePaymentMethod = async (paymentMethodId) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/payment-methods/${paymentMethodId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchPaymentMethods();
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'credit-card',
      cardHolderName: '',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      bankName: '',
      accountHolderName: '',
      accountNumber: '',
      phoneNumber: '',
      paypalEmail: '',
      displayName: ''
    });
  };

  const getIcon = (type) => {
    switch (type) {
      case 'credit-card':
      case 'debit-card':
        return <FaCreditCard />;
      case 'bank-transfer':
        return <FaUniversity />;
      case 'momo':
      case 'zalopay':
      case 'vnpay':
        return <FaMobileAlt />;
      case 'paypal':
        return <FaPaypal />;
      default:
        return <FaCreditCard />;
    }
  };

  const renderFormFields = () => {
    const selectedType = paymentTypes[formData.type];
    console.log('🔍 Selected payment type:', formData.type, selectedType);
    
    if (!selectedType) {
      console.log('⚠️ No payment type selected or not found');
      return null;
    }

    console.log('📋 Rendering fields:', selectedType.fields);
    
    return selectedType.fields.map(field => {
      switch (field) {
        case 'cardHolderName':
          return (
            <FormGroup key={field}>
              <Label>Card Holder Name</Label>
              <Input
                type="text"
                name="cardHolderName"
                value={formData.cardHolderName}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
          );
        case 'cardNumber':
          return (
            <FormGroup key={field}>
              <Label>Card Number</Label>
              <Input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                placeholder="**** **** **** ****"
                required
              />
            </FormGroup>
          );
        case 'expiryMonth':
        case 'expiryYear':
          return field === 'expiryMonth' ? (
            <FormRow key="expiry">
              <FormGroup>
                <Label>Expiry Month</Label>
                <Select
                  name="expiryMonth"
                  value={formData.expiryMonth}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Month</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {String(i + 1).padStart(2, '0')}
                    </option>
                  ))}
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Expiry Year</Label>
                <Select
                  name="expiryYear"
                  value={formData.expiryYear}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Year</option>
                  {[...Array(10)].map((_, i) => {
                    const year = new Date().getFullYear() + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </Select>
              </FormGroup>
            </FormRow>
          ) : null;
        case 'bankName':
          return (
            <FormGroup key={field}>
              <Label>Bank Name</Label>
              <Input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
          );
        case 'accountHolderName':
          return (
            <FormGroup key={field}>
              <Label>Account Holder Name</Label>
              <Input
                type="text"
                name="accountHolderName"
                value={formData.accountHolderName}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
          );
        case 'accountNumber':
          return (
            <FormGroup key={field}>
              <Label>Account Number</Label>
              <Input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
          );
        case 'phoneNumber':
          return (
            <FormGroup key={field}>
              <Label>Phone Number</Label>
              <Input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
          );
        case 'paypalEmail':
          return (
            <FormGroup key={field}>
              <Label>PayPal Email</Label>
              <Input
                type="email"
                name="paypalEmail"
                value={formData.paypalEmail}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
          );
        default:
          return null;
      }
    });
  };

  if (!currentUser) {
    return (
      <PageContainer>
        <Header />
        <MainContent>
          <Container>
            <div>Please login to manage your payment methods.</div>
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
          <PageHeader>
            <PageTitle>
              <FaCreditCard />
              Payment Methods
            </PageTitle>
            <PageSubtitle>
              Manage your payment methods for quick and secure booking payments.
            </PageSubtitle>
            <AddButton onClick={() => setModalOpen(true)}>
              <FaPlus />
              Add Payment Method
            </AddButton>
          </PageHeader>

          {loading ? (
            <LoadingContainer>Loading your payment methods...</LoadingContainer>
          ) : paymentMethods.length === 0 ? (
            <EmptyState>
              <FaCreditCard size={48} color="#ccc" />
              <h3>No payment methods added</h3>
              <p>Add your first payment method to make booking easier.</p>
            </EmptyState>
          ) : (
            <PaymentMethodGrid>
              {paymentMethods.map(method => (
                <PaymentMethodCard key={method._id} isDefault={method.isDefault}>
                  <CardHeader>
                    <CardIcon>{getIcon(method.type)}</CardIcon>
                    <CardActions>
                      {!method.isDefault && (
                        <ActionButton
                          onClick={() => setAsDefault(method._id)}
                          title="Set as default"
                        >
                          <FaStar />
                        </ActionButton>
                      )}
                      <ActionButton
                        className="delete"
                        onClick={() => deletePaymentMethod(method._id)}
                        title="Delete payment method"
                      >
                        <FaTrash />
                      </ActionButton>
                    </CardActions>
                  </CardHeader>
                  
                  <CardTitle>
                    {method.displayName}
                    {method.isDefault && <DefaultBadge>Default</DefaultBadge>}
                  </CardTitle>
                  
                  <CardDetails>
                    Type: {paymentTypes[method.type]?.label || method.type}
                  </CardDetails>
                </PaymentMethodCard>
              ))}
            </PaymentMethodGrid>
          )}

          <Modal isOpen={modalOpen}>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>Add Payment Method</ModalTitle>
                <CloseButton onClick={() => setModalOpen(false)}>
                  <FaTimes />
                </CloseButton>
              </ModalHeader>

              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label>Payment Type</Label>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    {Object.entries(paymentTypes).map(([key, type]) => (
                      <option key={key} value={key}>
                        {type.label}
                      </option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Display Name (Optional)</Label>
                  <Input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    placeholder="e.g., My Visa Card, Work Bank Account"
                  />
                </FormGroup>

                {renderFormFields()}

                <SubmitButton type="submit">
                  Add Payment Method
                </SubmitButton>
              </Form>
            </ModalContent>
          </Modal>
        </Container>
      </MainContent>
      <Footer />
    </PageContainer>
  );
};

export default PaymentMethodsPage;
