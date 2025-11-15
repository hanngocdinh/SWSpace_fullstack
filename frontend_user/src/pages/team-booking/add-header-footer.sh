#!/bin/bash

# Script to add Header and Footer to all team-booking pages

files=(
  "DateSelectionPage"
  "RoomSelectionPage"
  "TeamBookingConfirmationPage"
)

for file in "${files[@]}"; do
  echo "Processing $file.jsx..."
  
  # Add imports
  sed -i "s/import styled from 'styled-components';/import styled from 'styled-components';\nimport Header from '..\/..\/components\/layout\/Header';\nimport Footer from '..\/..\/components\/layout\/Footer';/" "$file.jsx"
  
  # Wrap return statement
  sed -i 's/return (/return (\n    <>\n      <Header \/>/g' "$file.jsx"
  sed -i 's/<\/Container>/<\/Container>\n    <Footer \/>\n    <\/>/g' "$file.jsx"
  
  # Rename Header styled component
  sed -i 's/const Header = styled/const HeaderSection = styled/g' "$file.jsx"
  sed -i 's/<Header>/<HeaderSection>/g' "$file.jsx"
  sed -i 's/<\/Header>/<\/HeaderSection>/g' "$file.jsx"
  
  echo "Completed $file.jsx"
done

echo "All files processed!"