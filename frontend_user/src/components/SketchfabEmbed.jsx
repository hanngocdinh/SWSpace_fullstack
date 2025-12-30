import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const ThreeDEmbedContainer = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const SketchfabEmbed = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Dynamically create and insert iframe
    if (containerRef.current) {
      const iframe = document.createElement('iframe');
      iframe.title = "KM 02 Caffee & Working Space";
      iframe.frameBorder = "0";
      iframe.allowFullScreen = true;
      iframe.allow = "autoplay; fullscreen; xr-spatial-tracking";
      iframe.setAttribute('xr-spatial-tracking', '');
      iframe.setAttribute('execution-while-out-of-viewport', '');
      iframe.setAttribute('execution-while-not-rendered', '');
      iframe.setAttribute('web-share', '');
      iframe.src = "https://sketchfab.com/models/f14a1ba601d74432905ad2e9844c4fe7/embed";
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      
      // Clear container and append iframe
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(iframe);
    }
  }, []);

  return (
    <ThreeDEmbedContainer ref={containerRef}>
      {/* Iframe will be injected here */}
    </ThreeDEmbedContainer>
  );
};

export default SketchfabEmbed;