import React from 'react';
import styled from 'styled-components';

const TestimonialContainer = styled.section`
  padding: 5rem 2rem;
  background-color: #f9f9f9;
`;

const TestimonialContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 3rem;
  
  @media (max-width: 992px) {
    flex-direction: column;
  }
`;

const ImageContainer = styled.div`
  flex: 1;
  
  img {
    width: 100%;
    max-width: 500px;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 992px) {
    order: 2;
    display: flex;
    justify-content: center;
    
    img {
      max-width: 100%;
    }
  }
`;

const QuoteContainer = styled.div`
  flex: 1;
  padding: 2rem;
  position: relative;
  
  @media (max-width: 992px) {
    order: 1;
  }
`;

const QuoteIcon = styled.div`
  font-size: 4rem;
  color: #45bf55;
  opacity: 0.2;
  position: absolute;
  top: 0;
  left: 0;
`;

const QuoteText = styled.blockquote`
  font-size: 1.2rem;
  line-height: 1.8;
  margin: 2rem 0;
  color: #333;
  position: relative;
  z-index: 1;
`;

const AttributionMark = styled.div`
  width: 50px;
  height: 3px;
  background-color: #45bf55;
  margin-bottom: 1rem;
`;

const TestimonialSection = () => {
  return (
    <TestimonialContainer>
      <TestimonialContent>
        <ImageContainer>
          <img src="https://res.cloudinary.com/dvwp5td6y/image/upload/v1759938638/Screenshot_2025-10-06_115114_rmozyl.png" alt="People working at SWSpace" />
        </ImageContainer>
        <QuoteContainer>
          <QuoteIcon>❝</QuoteIcon>
          <QuoteText>
            After spending a few days at SWSpace I truly find that this is a great space to work, and I admit that it matches all of my expectations. Our whole team can all together in one table, like friends, and discuss ideas which can get us professionally. I especially love the things in that space, too. The food, the ambiance all are best designed and fully equipped for productive work. The best part is the sense of connection instead of just coming to an office, we feel that this environment bonds people together. Honestly, working here makes the job feel less stressful and a lot more enjoyable.
          </QuoteText>
          <AttributionMark />
        </QuoteContainer>
      </TestimonialContent>
    </TestimonialContainer>
  );
};

export default TestimonialSection;