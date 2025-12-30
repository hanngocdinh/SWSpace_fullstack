import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  font-size: 0.95rem;
  color: #666;
  text-align: center;
  margin-bottom: 1.5rem;
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
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #45bf55;
    box-shadow: 0 0 0 2px rgba(69, 191, 85, 0.2);
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

const PasswordStrength = styled.div`
  font-size: 0.85rem;
  color: ${props => {
    if (props.strength === 'weak') return '#e74c3c';
    if (props.strength === 'medium') return '#f39c12';
    return '#27ae60';
  }};
  margin-top: -0.5rem;
`;

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');
  
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setError('Invalid token. Please check the link in your email.');
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const getPasswordStrength = (pwd) => {
    if (pwd.length === 0) return null;
    if (pwd.length < 6) return { strength: 'weak', text: 'Password must be at least 8 characters' };
    if (pwd.length < 8) return { strength: 'medium', text: 'Weak password' };
    return { strength: 'strong', text: 'Strong password' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!token) {
      setError('Invalid token. Please check the link in your email.');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    const result = await resetPassword(token, password);
    
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

  if (!token && !error) {
    return (
      <PageContainer>
        <Header />
        <MainContent>
          <FormContainer>
            <p>Loading...</p>
          </FormContainer>
        </MainContent>
        <Footer />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header />
      <MainContent>
        <FormContainer>
          <FormTitle>Reset Password</FormTitle>
          <FormSubtitle>
            Enter your new password
          </FormSubtitle>
          
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="password">New Password</Label>
              <Input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                  setSuccess('');
                }}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
              />
              {passwordStrength && (
                <PasswordStrength strength={passwordStrength.strength}>
                  {passwordStrength.text}
                </PasswordStrength>
              )}
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                  setSuccess('');
                }}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Re-enter password"
              />
            </FormGroup>
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}
            
            <SubmitButton type="submit" disabled={isLoading || !token || !!success}>
              {isLoading ? 'Processing...' : 'Reset Password'}
            </SubmitButton>
          </Form>
        </FormContainer>
      </MainContent>
      <Footer />
    </PageContainer>
  );
};

export default ResetPasswordPage;

