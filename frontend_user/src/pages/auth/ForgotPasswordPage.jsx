import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  padding-top: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f9f9f7;
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 450px;
  padding: 2.5rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin: 2rem 0;
`;

const FormTitle = styled.h2`
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 1rem;
  text-align: center;
`;

const FormSubtitle = styled.p`
  font-size: 0.9rem;
  color: #777; 
  text-align: center;
  margin-bottom: 2rem;
  line-height: 1.4; 
  padding: 0 10px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: #555;
`;

const Input = styled.input`
  padding: 0.85rem; 
  border: 1px solid #e1e1e1; 
  border-radius: 6px; 
  font-size: 1rem;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #45bf55;
    box-shadow: 0 0 0 3px rgba(69, 191, 85, 0.15); 
  }
`;

const SubmitButton = styled.button`
  background-color: #45bf55;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.8rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  margin-top: 0.5rem;

  &:hover {
    background-color: #38a046;
    transform: translateY(-2px);
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 1rem;
  text-align: center;
  background-color: #fee;
  padding: 0.8rem;
  border-radius: 4px;
  border: 1px solid #e74c3c;
`;

const SuccessMessage = styled.div`
  color: #27ae60;
  font-size: 0.9rem;
  margin-top: 1rem;
  text-align: center;
  background-color: #d5f4e6;
  padding: 0.8rem;
  border-radius: 4px;
  border: 1px solid #27ae60;
`;

const BackLink = styled.div`
  margin-top: 2rem;
  text-align: center;
  font-size: 0.9rem;
  color: #666;
  border-top: 1px solid #eee; 
  padding-top: 1.5rem;
`;

const Link = styled.span`
  color: #45bf55;
  cursor: pointer;
  font-weight: 500;
  margin-left: 0.5rem;

  &:hover {
    text-decoration: underline;
  }
`;

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    const result = await forgotPassword(email);
    
    if (result.success) {
      setSuccess(result.message);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else {
      setError(result.message);
    }
    
    setIsLoading(false);
  };

  return (
    <PageContainer>
      <Header />
      <MainContent>
        <FormContainer>
          <FormTitle>Forgot Password</FormTitle>
          <FormSubtitle>
            Enter your email address. We will send you password reset instructions.
          </FormSubtitle>
          
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                  setSuccess('');
                }}
                required
                autoComplete="email"
                placeholder="your.email@example.com"
              />
            </FormGroup>
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}
            
            <SubmitButton type="submit" disabled={isLoading || !!success}>
              {isLoading ? 'Sending...' : 'Send Reset Password Email'}
            </SubmitButton>
          </Form>
          
          <BackLink>
            Remember your password?
            <Link onClick={() => navigate('/login')}>Sign In</Link>
          </BackLink>
        </FormContainer>
      </MainContent>
      <Footer />
    </PageContainer>
  );
};

export default ForgotPasswordPage;

