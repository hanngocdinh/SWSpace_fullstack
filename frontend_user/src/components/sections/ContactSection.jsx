import React from 'react';
import styled from 'styled-components';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const ContactContainer = styled.section`
  padding: 5rem 2rem;
  background-color: #ffffff;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 1rem;
  color: #333;
`;

const SectionSubtitle = styled.p`
  text-align: center;
  max-width: 700px;
  margin: 0 auto 3rem;
  color: #555;
`;

const ContactWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const ContactForm = styled.form`
  padding: 2rem;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #45bf55;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  min-height: 150px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #45bf55;
  }
`;

const SubmitButton = styled.button`
  background-color: #45bf55;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #38a046;
    transform: translateY(-3px);
  }
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 2rem;
  
  svg {
    font-size: 1.5rem;
    color: #45bf55;
    margin-right: 1rem;
    margin-top: 0.25rem;
  }
`;

const ContactItemContent = styled.div`
  h4 {
    margin-bottom: 0.5rem;
    font-size: 1.2rem;
    color: #333;
  }
  
  p {
    color: #555;
    line-height: 1.6;
  }
`;

const ContactSection = () => {
  return (
    <ContactContainer id="contact">
      <SectionTitle>Contact Us</SectionTitle>
      <SectionSubtitle>Get in touch with us for more information or to book your space</SectionSubtitle>
      
      <ContactWrapper>
        <ContactForm>
          <FormGroup>
            <Label htmlFor="name">Your Name</Label>
            <Input type="text" id="name" placeholder="Enter your name" />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="email">Your Email</Label>
            <Input type="email" id="email" placeholder="Enter your email" />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="subject">Subject</Label>
            <Input type="text" id="subject" placeholder="Enter subject" />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="message">Message</Label>
            <TextArea id="message" placeholder="Enter your message"></TextArea>
          </FormGroup>
          
          <SubmitButton type="submit">Send Message</SubmitButton>
        </ContactForm>
        
        <ContactInfo>
          <ContactItem>
            <FaMapMarkerAlt />
            <ContactItemContent>
              <h4>Address</h4>
              <p>550 Nguyen Van Kinh, D1st, District 7, Ho Chi Minh City</p>
            </ContactItemContent>
          </ContactItem>
          
          <ContactItem>
            <FaPhone />
            <ContactItemContent>
              <h4>Phone</h4>
              <p>0915555456</p>
            </ContactItemContent>
          </ContactItem>
          
          <ContactItem>
            <FaEnvelope />
            <ContactItemContent>
              <h4>Email</h4>
              <p>info@swspace.com.vn</p>
            </ContactItemContent>
          </ContactItem>
        </ContactInfo>
      </ContactWrapper>
    </ContactContainer>
  );
};

export default ContactSection;