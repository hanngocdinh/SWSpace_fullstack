#!/bin/bash

# Script to fix styled-components props warnings by converting to transient props

echo "🔧 Fixing styled-components props..."

# Fix PackageDurationPage - hasDiscount prop
sed -i 's/props\.hasDiscount/props.$hasDiscount/g' /home/dtu/Huy/code_khoa/frontend_user/src/pages/booking/PackageDurationPage.jsx
sed -i 's/hasDiscount={/\$hasDiscount={/g' /home/dtu/Huy/code_khoa/frontend_user/src/pages/booking/PackageDurationPage.jsx

# Fix BookingLayout - active props
sed -i 's/props\.active/props.$active/g' /home/dtu/Huy/code_khoa/frontend_user/src/pages/booking/BookingLayout.jsx
sed -i 's/active={/\$active={/g' /home/dtu/Huy/code_khoa/frontend_user/src/pages/booking/BookingLayout.jsx

# Fix ServiceSelectionPage - active props
sed -i 's/props\.active/props.$active/g' /home/dtu/Huy/code_khoa/frontend_user/src/pages/booking/ServiceSelectionPage.jsx
sed -i 's/active={/\$active={/g' /home/dtu/Huy/code_khoa/frontend_user/src/pages/booking/ServiceSelectionPage.jsx

# Fix SeatPage - active and twobytwo props
sed -i 's/props\.active/props.$active/g' /home/dtu/Huy/code_khoa/frontend_user/src/pages/booking/SeatPage.jsx
sed -i 's/props\.twobytwo/props.$twobytwo/g' /home/dtu/Huy/code_khoa/frontend_user/src/pages/booking/SeatPage.jsx
sed -i 's/active={/\$active={/g' /home/dtu/Huy/code_khoa/frontend_user/src/pages/booking/SeatPage.jsx
sed -i 's/twobytwo={/\$twobytwo={/g' /home/dtu/Huy/code_khoa/frontend_user/src/pages/booking/SeatPage.jsx

# Fix PackageSelectionPage - active props  
sed -i 's/props\.active/props.$active/g' /home/dtu/Huy/code_khoa/frontend_user/src/pages/booking/PackageSelectionPage.jsx
sed -i 's/active={/\$active={/g' /home/dtu/Huy/code_khoa/frontend_user/src/pages/booking/PackageSelectionPage.jsx

echo "✅ Fixed styled-components props warnings!"
echo "🔄 Please restart your frontend to see the changes"