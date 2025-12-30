import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HeroSection from './components/sections/HeroSection';
import TestimonialSection from './components/sections/TestimonialSection';
import WhyChooseSection from './components/sections/WhyChooseSection';
import GallerySection from './components/sections/GallerySection';
import CustomerExperienceSection from './components/sections/CustomerExperienceSection';
import ContactSection from './components/sections/ContactSection';
import UtilityPage from './pages/UtilityPage';
import MainServicePage from './pages/ServicePage';
import PrivateOfficeDetailPage from './pages/PrivateOfficeDetailPage';
import FixedDeskDetailPage from './pages/FixedDeskDetailPage';
import HotDeskDetailPage from './pages/HotDeskDetailPage';
import MeetingRoomDetailPage from './pages/MeetingRoomDetailPage';
import NetworkingSpaceDetailPage from './pages/NetworkingSpaceDetailPage';
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ServicePage from './pages/booking/ServicePage';
import PackageDurationPage from './pages/booking/PackageDurationPage';
import DatePage from './pages/booking/DatePage';
import SeatPage from './pages/booking/SeatPage';
import PaymentPage from './pages/booking/PaymentPage';
import BookingConfirmationPage from './pages/booking/BookingConfirmationPage';
import ProfilePage from './pages/ProfilePage';
import BookingHistoryPage from './pages/BookingHistoryPage';
import PaymentMethodsPage from './pages/PaymentMethodsPage';
import DebugPage from './pages/DebugPage';
import FullBookingTestPage from './pages/FullBookingTestPage';

// Team Booking Pages
import TeamServicesPage from './pages/team-booking/TeamServicesPage';
import DurationSelectionPage from './pages/team-booking/DurationSelectionPage';
import DateSelectionPage from './pages/team-booking/DateSelectionPage';
import RoomSelectionPage from './pages/team-booking/RoomSelectionPage';
import TeamPaymentPage from './pages/team-booking/TeamPaymentPage';
import TeamBookingConfirmationPage from './pages/team-booking/TeamBookingConfirmationPage';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BookingProvider } from './contexts/BookingContext';
import { QRProvider } from './contexts/QRContext';
import QRCheckInPage from './pages/QRCheckInPage';

// HomePage component to consolidate the main landing page sections
const HomePage = () => {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <TestimonialSection />
        <WhyChooseSection />
        <GallerySection />
        <CustomerExperienceSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
};

// Protected Route: chỉ cho phép role=user
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <QRProvider>
        <BookingProvider>
          <Router>
            <div className="App">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/utility" element={<UtilityPage />} />
              <Route path="/service" element={<MainServicePage />} />
              <Route path="/service/private-office" element={<PrivateOfficeDetailPage />} />
              <Route path="/service/fixed-desk" element={<FixedDeskDetailPage />} />
              <Route path="/service/hot-desk" element={<HotDeskDetailPage />} />
              <Route path="/service/meeting-room" element={<MeetingRoomDetailPage />} />
              <Route path="/service/networking-space" element={<NetworkingSpaceDetailPage />} />
              
              {/* Auth routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              
              {/* Debug route - Protected */}
              <Route path="/debug" element={
                <ProtectedRoute>
                  <DebugPage />
                </ProtectedRoute>
              } />
              <Route path="/full-booking-test" element={<FullBookingTestPage />} />
              
              {/* User Profile routes - Protected */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/booking-history" element={
                <ProtectedRoute>
                  <BookingHistoryPage />
                </ProtectedRoute>
              } />
              <Route path="/payment-methods" element={
                <ProtectedRoute>
                  <PaymentMethodsPage />
                </ProtectedRoute>
              } />
              
              {/* Booking routes - Protected */}
              <Route path="/booking" element={<Navigate to="/booking/service" replace />} />
              <Route path="/booking/service" element={
                <ProtectedRoute>
                  <ServicePage />
                </ProtectedRoute>
              } />
              <Route path="/booking/package-duration" element={
                <ProtectedRoute>
                  <PackageDurationPage />
                </ProtectedRoute>
              } />
              <Route path="/booking/date" element={
                <ProtectedRoute>
                  <DatePage />
                </ProtectedRoute>
              } />
              <Route path="/booking/seat" element={
                <ProtectedRoute>
                  <SeatPage />
                </ProtectedRoute>
              } />
              <Route path="/booking/payment" element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              } />
              <Route path="/booking/confirmation" element={
                <ProtectedRoute>
                  <BookingConfirmationPage />
                </ProtectedRoute>
              } />
              
              {/* Team Booking routes - Protected */}
              <Route path="/team-booking" element={
                <ProtectedRoute>
                  <TeamServicesPage />
                </ProtectedRoute>
              } />
              <Route path="/team-booking/duration" element={
                <ProtectedRoute>
                  <DurationSelectionPage />
                </ProtectedRoute>
              } />
              <Route path="/team-booking/date" element={
                <ProtectedRoute>
                  <DateSelectionPage />
                </ProtectedRoute>
              } />
              <Route path="/team-booking/rooms" element={
                <ProtectedRoute>
                  <RoomSelectionPage />
                </ProtectedRoute>
              } />
              <Route path="/team-booking/payment" element={
                <ProtectedRoute>
                  <TeamPaymentPage />
                </ProtectedRoute>
              } />
              <Route path="/team-booking/confirmation" element={
                <ProtectedRoute>
                  <TeamBookingConfirmationPage />
                </ProtectedRoute>
              } />
              
              {/* QR Check-in Page - Protected */}
              <Route path="/qr-checkin" element={
                <ProtectedRoute>
                  <QRCheckInPage />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </BookingProvider>
      </QRProvider>
    </AuthProvider>
  );
}

export default App;
