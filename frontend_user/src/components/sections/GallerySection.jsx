import React from 'react';
import styled from 'styled-components';
import { FaPlayCircle } from 'react-icons/fa';

const GalleryContainer = styled.section`
  padding: 5rem 2rem;
  background-color: #f5f5f5;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 3rem;
  color: #333;
`;

const GalleryGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 200px;
  gap: 0.5rem;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 180px;
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
    grid-auto-rows: 200px;
  }
`;

const GalleryItem = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  grid-column: ${props => props.columnSpan || 'span 1'};
  grid-row: ${props => props.rowSpan || 'span 1'};
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
  
  &:hover .overlay {
    opacity: 1;
  }
`;

const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  svg {
    font-size: 3rem;
    color: white;
  }
`;

const CategoryLabel = styled.div`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  color: #333;
`;

const GallerySection = () => {
  const galleryItems = [
    { 
      id: 1, 
      image: 'https://res.cloudinary.com/dvwp5td6y/image/upload/v1759938828/Screenshot_2025-10-06_155923_stitgn.png', 
      label: 'Bar Area', 
      columnSpan: 'span 2', 
      rowSpan: 'span 1' 
    },
    { 
      id: 2, 
      image: 'https://res.cloudinary.com/dvwp5td6y/image/upload/v1759938852/Screenshot_2025-10-06_160126_wzwcba.png', 
      label: 'Meeting Area'
    },
    { 
      id: 3, 
      image: 'https://res.cloudinary.com/dvwp5td6y/image/upload/v1759938873/Screenshot_2025-10-06_152131_cirzjp.png', 
      label: 'Corridor'
    },
    { 
      id: 4, 
      image: 'https://res.cloudinary.com/dvwp5td6y/image/upload/v1759938894/Screenshot_2025-10-06_160036_rbyzkl.png', 
      label: 'Working Space'
    },
    { 
      id: 5, 
      image: 'https://res.cloudinary.com/dvwp5td6y/image/upload/v1759938946/Screenshot_2025-10-06_160054_gq9mks.png', 
      label: 'Break Area'
    },
    { 
      id: 6, 
      image: 'https://res.cloudinary.com/dvwp5td6y/image/upload/v1759938966/Screenshot_2025-10-06_160157_wuimzj.png', 
      label: 'Hallway'
    },
    { 
      id: 7, 
      image: 'https://res.cloudinary.com/dvwp5td6y/image/upload/v1759938983/Screenshot_2025-10-06_160226_ixyo0i.png', 
      label: 'Catering Dining', 
      columnSpan: 'span 2', 
      rowSpan: 'span 1' 
    }
  ];

  return (
    <GalleryContainer id="community">
      <SectionTitle>Some images of SWSpace</SectionTitle>
      <GalleryGrid>
        {galleryItems.map(item => (
          <GalleryItem key={item.id} columnSpan={item.columnSpan} rowSpan={item.rowSpan}>
            <img src={item.image} alt={`SWSpace - ${item.label}`} />
            <ImageOverlay className="overlay">
              <FaPlayCircle />
            </ImageOverlay>
            <CategoryLabel>{item.label}</CategoryLabel>
          </GalleryItem>
        ))}
      </GalleryGrid>
    </GalleryContainer>
  );
};

export default GallerySection;