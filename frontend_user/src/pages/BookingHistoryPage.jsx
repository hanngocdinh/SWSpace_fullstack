import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { FaHistory, FaCalendar, FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaFilter, FaSearch, FaTrash, FaExclamationTriangle } from 'react-icons/fa';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  padding-top: 80px;
  background-color: #f8f9fa;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const PageHeader = styled.div`
  background: white;
  border-radius: 10px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const PageTitle = styled.h1`
  color: #333;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const FilterSelect = styled.select`
  padding: 0.7rem 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  background: white;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #45bf55;
  }
`;

const SearchInput = styled.input`
  padding: 0.7rem 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 0.9rem;
  flex: 1;
  min-width: 200px;
  
  &:focus {
    outline: none;
    border-color: #45bf55;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 250px;
`;

const BookingGrid = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const BookingCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
`;

const BookingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const BookingReference = styled.div`
  font-weight: 600;
  color: #45bf55;
  font-size: 1.2rem;
`;

const BookingStatus = styled.div`
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  background-color: ${props => {
    switch (props.status) {
      case 'paid': return '#d1ecf1';
      case 'pending': return '#fff3cd';
      case 'cancelled': return '#f8d7da';
      default: return '#e2e3e5';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'paid': return '#0c5460';
      case 'pending': return '#856404';
      case 'cancelled': return '#721c24';
      default: return '#383d41';
    }
  }};
`;

const BookingInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const InfoSection = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #45bf55;
`;

const InfoTitle = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InfoDetails = styled.div`
  color: #666;
  line-height: 1.5;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
`;

const DeleteButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.3s;
  font-size: 0.9rem;
  
  &:hover {
    background-color: #c82333;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.show ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 10px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
`;

const ModalTitle = styled.h3`
  color: #dc3545;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
`;

const ModalButton = styled.button`
  padding: 0.7rem 1.5rem;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
  
  &.confirm {
    background-color: #dc3545;
    color: white;
    
    &:hover {
      background-color: #c82333;
    }
  }
  
  &.cancel {
    background-color: #6c757d;
    color: white;
    
    &:hover {
      background-color: #5a6268;
    }
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
`;

const PaginationButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover:not(:disabled) {
    background: #45bf55;
    color: white;
    border-color: #45bf55;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.active {
    background: #45bf55;
    color: white;
    border-color: #45bf55;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  font-size: 1.1rem;
  color: #666;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const BookingHistoryPage = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, booking: null });
  const [deleting, setDeleting] = useState(false);
  const itemsPerPage = 5;

  const STATUS_LABELS = {
    pending: 'Pending',
    paid: 'Paid',
    cancelled: 'Cancelled'
  };

  const deriveBookingStatus = (booking) => {
    const normalizedStatus = (booking.status || '').toLowerCase();
    const normalizedPaymentStatus = (booking.paymentStatus || '').toLowerCase();

    if (['paid', 'awaiting_payment', 'confirmed', 'success', 'checked_in', 'checked_out'].includes(normalizedStatus)) {
      return 'paid';
    }

    if (['canceled', 'cancelled', 'failed', 'refunded'].includes(normalizedStatus)) {
      return 'cancelled';
    }

    if (['paid', 'success', 'processing', 'awaiting_payment', 'confirmed'].includes(normalizedPaymentStatus)) {
      return 'paid';
    }

    if (['canceled', 'cancelled', 'failed', 'refunded'].includes(normalizedPaymentStatus)) {
      return 'cancelled';
    }

    return 'pending';
  };

  const shouldAllowDelete = (booking) => ['pending', 'cancelled'].includes(deriveBookingStatus(booking));

  const getDisplayStatus = (booking) => STATUS_LABELS[deriveBookingStatus(booking)] || 'Pending';

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, statusFilter, searchTerm]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 BookingHistory: Token from localStorage:', token ? 'Found' : 'Not found');
      
      if (!token) {
        console.log('❌ BookingHistory: No token found, skipping fetch');
        setLoading(false);
        return;
      }

      console.log('📡 BookingHistory: Fetching bookings...');
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📋 BookingHistory: Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ BookingHistory: Bookings data received:', data);
        console.log('📊 BookingHistory: Number of bookings:', data.bookings?.length || 0);
        setBookings(data.bookings || []);
      } else {
        const errorText = await response.text();
        console.error('❌ BookingHistory: Error response:', response.status, errorText);
      }
    } catch (error) {
      console.error('💥 BookingHistory: Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => deriveBookingStatus(booking) === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const keyword = searchTerm.toLowerCase();
      filtered = filtered.filter(booking =>
        (booking.bookingReference || '').toLowerCase().includes(keyword) ||
        (booking.seatName || '').toLowerCase().includes(keyword)
      );
    }

    setFilteredBookings(filtered);
    setCurrentPage(1);
  };

  const handleDeleteBooking = async () => {
    if (!deleteModal.booking) return;
    
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/bookings/${deleteModal.booking.id || deleteModal.booking._id}/permanent`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        // Remove booking from state
        setBookings(prev => prev.filter(booking => (booking.id || booking._id) !== (deleteModal.booking.id || deleteModal.booking._id)));
        setDeleteModal({ show: false, booking: null });
        
        alert(`✅ Booking ${data.deletedBookingReference} deleted successfully!`);
      } else {
        alert(`❌ Failed to delete booking: ${data.message}`);
      }
    } catch (error) {
      console.error('Delete booking error:', error);
      alert('❌ Error deleting booking. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (booking) => {
    setDeleteModal({ show: true, booking });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, booking: null });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const parsed = new Date(dateString);
    if (Number.isNaN(parsed.getTime())) {
      return dateString;
    }
    return parsed.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (value) => {
    if (!value) return '--';
    if (typeof value === 'string' && value.includes(':') && value.length <= 8) {
      return value;
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || Number.isNaN(Number(amount))) {
      return '—';
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(Number(amount));
  };

  const getServiceTypeLabel = (serviceType) => {
    const labels = {
      'hot-desk': 'Hot Desk',
      'fixed-desk': 'Fixed Desk',
      'meeting-room': 'Meeting Room',
      'private-office': 'Private Office'
    };
    return labels[serviceType] || serviceType;
  };

  const getPackageDurationLabel = (duration) => {
    const labels = {
      'daily': 'Daily',
      'weekly': 'Weekly',
      'monthly': 'Monthly',
      'yearly': 'Yearly'
    };
    return labels[duration] || duration;
  };

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBookings = filteredBookings.slice(startIndex, endIndex);

  if (!currentUser) {
    return (
      <PageContainer>
        <Header />
        <MainContent>
          <Container>
            <div>Please login to view your booking history.</div>
          </Container>
        </MainContent>
        <Footer />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header />
      <MainContent>
        <Container>
          <PageHeader>
            <PageTitle>
              <FaHistory />
              Booking History
            </PageTitle>
            
            <FilterContainer>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaFilter />
                <FilterSelect
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
                </FilterSelect>
              </div>
              
              <SearchContainer>
                <FaSearch />
                <SearchInput
                  type="text"
                  placeholder="Search by booking reference or seat name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </SearchContainer>
            </FilterContainer>
          </PageHeader>

          {loading ? (
            <LoadingContainer>Loading your booking history...</LoadingContainer>
          ) : currentBookings.length === 0 ? (
            <EmptyState>
              <FaHistory size={48} color="#ccc" />
              <h3>No bookings found</h3>
              <p>
                {filteredBookings.length === 0 && bookings.length === 0
                  ? "You haven't made any bookings yet."
                  : "No bookings match your current filters."}
              </p>
            </EmptyState>
          ) : (
            <>
              <BookingGrid>
                {currentBookings.map(booking => (
                  <BookingCard key={booking.id || booking._id}>
                    <BookingHeader>
                      <BookingReference>#{booking.bookingReference}</BookingReference>
                      <BookingStatus status={deriveBookingStatus(booking)}>
                        {getDisplayStatus(booking)}
                      </BookingStatus>
                    </BookingHeader>
                    
                    <BookingInfo>
                      <InfoSection>
                        <InfoTitle>
                          <FaMapMarkerAlt />
                          Workspace Details
                        </InfoTitle>
                        <InfoDetails>
                          <div><strong>Type:</strong> {getServiceTypeLabel(booking.serviceType)}</div>
                          <div><strong>Seat:</strong> {booking.seatName}</div>
                          <div><strong>Floor:</strong> {booking.floor}</div>
                          <div><strong>Package:</strong> {getPackageDurationLabel(booking.packageDuration)}</div>
                        </InfoDetails>
                      </InfoSection>
                      
                      <InfoSection>
                        <InfoTitle>
                          <FaCalendar />
                          Date & Time
                        </InfoTitle>
                        <InfoDetails>
                          <div><strong>Start:</strong> {formatDate(booking.startDate)}</div>
                          <div><strong>End:</strong> {formatDate(booking.endDate)}</div>
                          <div><strong>Time:</strong> {formatTime(booking.startTime)} - {formatTime(booking.endTime)}</div>
                        </InfoDetails>
                      </InfoSection>
                      
                      <InfoSection>
                        <InfoTitle>
                          <FaMoneyBillWave />
                          Payment Information
                        </InfoTitle>
                        <InfoDetails>
                          <div><strong>Base Price:</strong> {formatCurrency(booking.basePrice)}</div>
                          {Number(booking.discountPercentage) > 0 && (
                            <div><strong>Discount:</strong> {booking.discountPercentage}%</div>
                          )}
                          <div><strong>Final Price:</strong> {formatCurrency(booking.finalPrice)}</div>
                          <div><strong>Payment:</strong> {getDisplayStatus(booking)}</div>
                        </InfoDetails>
                      </InfoSection>
                    </BookingInfo>

                    {/* Add Delete Button for pending/cancelled bookings */}
                    {shouldAllowDelete(booking) && (
                      <ActionButtons>
                        <DeleteButton
                          onClick={() => openDeleteModal(booking)}
                          disabled={deleting}
                          title="Permanently delete this booking"
                        >
                          <FaTrash />
                          Delete Booking
                        </DeleteButton>
                      </ActionButtons>
                    )}
                  </BookingCard>
                ))}
              </BookingGrid>

              {totalPages > 1 && (
                <PaginationContainer>
                  <PaginationButton
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </PaginationButton>
                  
                  {[...Array(totalPages)].map((_, index) => (
                    <PaginationButton
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={currentPage === index + 1 ? 'active' : ''}
                    >
                      {index + 1}
                    </PaginationButton>
                  ))}
                  
                  <PaginationButton
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </PaginationButton>
                </PaginationContainer>
              )}
            </>
          )}
        </Container>
      </MainContent>
      <Footer />

      {/* Delete Confirmation Modal */}
      <Modal show={deleteModal.show}>
        <ModalContent>
          <ModalTitle>
            <FaExclamationTriangle />
            Confirm Delete
          </ModalTitle>
          <p>
            Are you sure you want to permanently delete this booking?
            <br />
            <strong>#{deleteModal.booking?.bookingReference}</strong>
            <br />
            <small>Seat: {deleteModal.booking?.seatName}</small>
            <br />
            <br />
            <em>This action cannot be undone.</em>
          </p>
          <ModalButtons>
            <ModalButton
              className="confirm"
              onClick={handleDeleteBooking}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Permanently'}
            </ModalButton>
            <ModalButton
              className="cancel"
              onClick={closeDeleteModal}
              disabled={deleting}
            >
              Cancel
            </ModalButton>
          </ModalButtons>
        </ModalContent>
      </Modal>
    </PageContainer>
  );
};

export default BookingHistoryPage;
