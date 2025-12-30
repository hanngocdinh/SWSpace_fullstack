import React from 'react';
import styled from 'styled-components';

const ExperienceContainer = styled.section`
  padding: 5rem 2rem;
  background-color: #f9f9f9;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 0.5rem;
  color: #333;
`;

const SectionSubtitle = styled.p`
  text-align: center;
  color: #555;
  margin-bottom: 4rem;
`;

const TestimonialsGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  gap: 2rem;
  
  @media (max-width: 992px) {
    flex-wrap: wrap;
  }
`;

const TestimonialCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 350px;
`;

const ProfileImageContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
`;

const ProfileImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
`;

const CustomerName = styled.h3`
  font-size: 1.3rem;
  text-align: center;
  margin-bottom: 0.5rem;
  color: #333;
`;

const CustomerTitle = styled.p`
  font-size: 1rem;
  text-align: center;
  color: #777;
  margin-bottom: 1.5rem;
`;

const TestimonialText = styled.p`
  color: #555;
  line-height: 1.6;
  text-align: left;
`;

const StatsSection = styled.div`
  max-width: 1200px;
  margin: 5rem auto 0;
  display: flex;
  justify-content: space-around;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 3rem;
    align-items: center;
  }
`;

const StatItem = styled.div`
  text-align: center;
  
  h3 {
    font-size: 3.5rem;
    color: #45bf55;
    margin-bottom: 0.5rem;
    font-weight: bold;
  }
  
  p {
    color: #333;
    font-size: 1.1rem;
  }
`;

const CustomerExperienceSection = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Mr. Tuan',
      title: 'Freelancer Marketing',
      image: 'https://res.cloudinary.com/dvwp5td6y/image/upload/v1759941782/Screenshot_2025-10-08_234242_orxkuc.png',
      text: 'The workspace at SWSpace is inspiring with modern design, without lighting, and full amenities enough, helping me focus and improve work performance compared to working in many coffee shops.'
    },
    {
      id: 2,
      name: 'Mrs. Linh',
      title: 'Founder Startup Technology',
      image: 'https://res.cloudinary.com/dvwp5td6y/image/upload/v1759942613/Screenshot_2025-10-08_235619_es0kpx.png',
      text: 'I enjoy working at SWSpace because of the open, creative space, friendly colleagues, and dynamic environment, which suits Gen Z. Coffee meets the needs of the friendly, creative communication, and connection.'
    },
    {
      id: 3,
      name: 'Mr. Binh',
      title: 'Brand Office Representative',
      image: 'https://res.cloudinary.com/dvwp5td6y/image/upload/v1759941878/Screenshot_2025-10-08_234421_bzipbv.png',
      text: "Coffee's customer service is attentive and responds to inquiries quickly. The location of Cofio is particularly convenient. Making me more time. I can confided and will continue to view Cofio as SWSpace for the long term."
    }
  ];

  const stats = [
    { value: '200+', label: 'Partnership backgrounds served in SWSpace' },
    { value: '99%', label: 'Customer feel satisfied with the space and service' },
    { value: '90%', label: 'Customer continuing booking at SWSpace' }
  ];

  return (
    <ExperienceContainer id="testimonials">
      <SectionTitle>Trust is built from</SectionTitle>
      <SectionSubtitle>customer experience</SectionSubtitle>
      
      <TestimonialsGrid>
        {testimonials.map(testimonial => (
          <TestimonialCard key={testimonial.id}>
            <ProfileImageContainer>
              <ProfileImage src={testimonial.image} alt={testimonial.name} />
            </ProfileImageContainer>
            <CustomerName>{testimonial.name}</CustomerName>
            <CustomerTitle>{testimonial.title}</CustomerTitle>
            <TestimonialText>{testimonial.text}</TestimonialText>
          </TestimonialCard>
        ))}
      </TestimonialsGrid>
      
      <StatsSection>
        {stats.map((stat, index) => (
          <StatItem key={index}>
            <h3>{stat.value}</h3>
            <p>{stat.label}</p>
          </StatItem>
        ))}
      </StatsSection>
    </ExperienceContainer>
  );
};

export default CustomerExperienceSection;