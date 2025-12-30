import React, { createContext, useState, useContext, useCallback, useRef } from 'react';

// Tạo context
export const BookingContext = createContext();

const RECENT_BOOKING_STORAGE_KEY = 'swspace_recent_booking_v1';

// Data mẫu cho seat map
const sampleSeats = {
  "hot-desk": [
    { id: "A1", name: "A1", available: true, type: "hot-desk" },
    { id: "A2", name: "A2", available: false, type: "hot-desk" },
    { id: "A3", name: "A3", available: true, type: "hot-desk" },
    { id: "A4", name: "A4", available: true, type: "hot-desk" },
    { id: "A5", name: "A5", available: true, type: "hot-desk" },
    { id: "A6", name: "A6", available: false, type: "hot-desk" },
    { id: "A7", name: "A7", available: true, type: "hot-desk" },
    { id: "A8", name: "A8", available: true, type: "hot-desk" },
    { id: "B1", name: "B1", available: false, type: "hot-desk" },
    { id: "B2", name: "B2", available: true, type: "hot-desk" },
    { id: "B3", name: "B3", available: false, type: "hot-desk" },
    { id: "B4", name: "B4", available: true, type: "hot-desk" },
    { id: "B5", name: "B5", available: true, type: "hot-desk" },
    { id: "B6", name: "B6", available: false, type: "hot-desk" },
    { id: "B7", name: "B7", available: true, type: "hot-desk" },
    { id: "B8", name: "B8", available: false, type: "hot-desk" },
    { id: "C1", name: "C1", available: true, type: "hot-desk" },
    { id: "C2", name: "C2", available: true, type: "hot-desk" },
    { id: "C3", name: "C3", available: false, type: "hot-desk" },
    { id: "C4", name: "C4", available: true, type: "hot-desk" },
    { id: "C5", name: "C5", available: false, type: "hot-desk" },
    { id: "C6", name: "C6", available: true, type: "hot-desk" },
    { id: "C7", name: "C7", available: true, type: "hot-desk" },
    { id: "C8", name: "C8", available: false, type: "hot-desk" },
    { id: "D1", name: "D1", available: true, type: "hot-desk" },
    { id: "D2", name: "D2", available: false, type: "hot-desk" },
    { id: "D3", name: "D3", available: true, type: "hot-desk" },
    { id: "D4", name: "D4", available: false, type: "hot-desk" },
    { id: "D5", name: "D5", available: true, type: "hot-desk" },
    { id: "D6", name: "D6", available: true, type: "hot-desk" },
    { id: "D7", name: "D7", available: false, type: "hot-desk" },
    { id: "D8", name: "D8", available: true, type: "hot-desk" }
  ],
  "fixed-desk": [
    { id: "A1-F", name: "A1", available: false, type: "fixed-desk" },
    { id: "A2-F", name: "A2", available: true, type: "fixed-desk" },
    { id: "A3-F", name: "A3", available: true, type: "fixed-desk" },
    { id: "A4-F", name: "A4", available: false, type: "fixed-desk" },
    { id: "A5-F", name: "A5", available: true, type: "fixed-desk" },
    { id: "A6-F", name: "A6", available: true, type: "fixed-desk" },
    { id: "A7-F", name: "A7", available: false, type: "fixed-desk" },
    { id: "A8-F", name: "A8", available: true, type: "fixed-desk" },
    { id: "B1-F", name: "B1", available: true, type: "fixed-desk" },
    { id: "B2-F", name: "B2", available: true, type: "fixed-desk" },
    { id: "B3-F", name: "B3", available: false, type: "fixed-desk" },
    { id: "B4-F", name: "B4", available: true, type: "fixed-desk" },
    { id: "B5-F", name: "B5", available: false, type: "fixed-desk" },
    { id: "B6-F", name: "B6", available: true, type: "fixed-desk" },
    { id: "B7-F", name: "B7", available: true, type: "fixed-desk" },
    { id: "B8-F", name: "B8", available: false, type: "fixed-desk" },
    { id: "C1-F", name: "C1", available: true, type: "fixed-desk" },
    { id: "C2-F", name: "C2", available: false, type: "fixed-desk" },
    { id: "C3-F", name: "C3", available: true, type: "fixed-desk" },
    { id: "C4-F", name: "C4", available: true, type: "fixed-desk" },
    { id: "C5-F", name: "C5", available: false, type: "fixed-desk" },
    { id: "C6-F", name: "C6", available: true, type: "fixed-desk" },
    { id: "C7-F", name: "C7", available: false, type: "fixed-desk" },
    { id: "C8-F", name: "C8", available: true, type: "fixed-desk" },
    { id: "D1-F", name: "D1", available: false, type: "fixed-desk" },
    { id: "D2-F", name: "D2", available: true, type: "fixed-desk" },
    { id: "D3-F", name: "D3", available: true, type: "fixed-desk" },
    { id: "D4-F", name: "D4", available: false, type: "fixed-desk" },
    { id: "D5-F", name: "D5", available: true, type: "fixed-desk" },
    { id: "D6-F", name: "D6", available: false, type: "fixed-desk" },
    { id: "D7-F", name: "D7", available: true, type: "fixed-desk" },
    { id: "D8-F", name: "D8", available: true, type: "fixed-desk" }
  ]
};

export const normalizeBookingResponse = (booking = {}) => ({
  id: booking.id || booking._id || null,
  bookingReference: booking.bookingReference || booking.booking_reference || null,
  serviceType: booking.serviceType || booking.service_type || null,
  packageDuration: booking.packageDuration || booking.package_duration || null,
  startDate: booking.startDate || booking.start_time || null,
  endDate: booking.endDate || booking.end_time || null,
  seatName: booking.seatName || booking.seat_name || null,
  seatCode: booking.seatCode || booking.seat_code || null,
  floor: booking.floor || booking.floor_no || null,
  finalPrice: booking.finalPrice || booking.final_price || null,
  status: booking.status || null,
  paymentStatus: booking.paymentStatus || booking.payment_status || null
});

const getSessionStorage = () => {
  if (typeof window === 'undefined' || !window.sessionStorage) return null;
  return window.sessionStorage;
};

const persistRecentBooking = (snapshot) => {
  try {
    const storage = getSessionStorage();
    if (!storage || !snapshot) return;
    storage.setItem(RECENT_BOOKING_STORAGE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    console.warn('Không thể lưu booking gần nhất:', error);
  }
};

const readRecentBooking = () => {
  try {
    const storage = getSessionStorage();
    if (!storage) return null;
    const raw = storage.getItem(RECENT_BOOKING_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('Không thể đọc booking gần nhất:', error);
    return null;
  }
};

const clearRecentBooking = () => {
  try {
    const storage = getSessionStorage();
    if (!storage) return;
    storage.removeItem(RECENT_BOOKING_STORAGE_KEY);
  } catch (error) {
    console.warn('Không thể xoá booking gần nhất:', error);
  }
};

// Helpers to normalize date/time payloads before hitting the API
const ensureDateValue = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toIsoStringSafe = (value) => {
  const date = ensureDateValue(value);
  return date ? date.toISOString() : null;
};

const padTime = (value) => String(value).padStart(2, '0');

const toTimeStringSafe = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    return `${padTime(value.getHours())}:${padTime(value.getMinutes())}`;
  }
  if (typeof value === 'string') {
    const [h = '0', m = '0'] = value.split(':');
    const hh = Number.parseInt(h, 10);
    const mm = Number.parseInt(m, 10);
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
    return `${padTime(Math.max(0, Math.min(23, hh)))}:${padTime(Math.max(0, Math.min(59, mm)))}`;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `${padTime(Math.max(0, Math.min(23, value)))}:00`;
  }
  return null;
};

const buildOccupiedSeatsUrl = ({ serviceType, date, startTime, endTime, endDate, cacheBust = false, probeStartOnly = false }) => {
  if (!serviceType) return null;
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const params = new URLSearchParams();
  params.set('serviceType', serviceType);

  const startIso = toIsoStringSafe(date);
  if (!startIso) return null;
  params.set('date', startIso);

  const normalizedStartTime = toTimeStringSafe(startTime);
  if (normalizedStartTime) params.set('startTime', normalizedStartTime);

  const normalizedEndTime = toTimeStringSafe(endTime);
  if (normalizedEndTime) params.set('endTime', normalizedEndTime);

  const endIso = toIsoStringSafe(endDate);
  if (endIso) params.set('endDate', endIso);

  if (probeStartOnly) params.set('probeStartOnly', 'true');
  if (cacheBust) params.set('t', Date.now().toString());

  return `${apiUrl}/api/bookings/seats/occupied?${params.toString()}`;
};

export const BookingProvider = ({ children }) => {
  // State quản lý các bước booking
  const [bookingState, setBookingState] = useState({
    // Bước 1: Chọn loại dịch vụ
    serviceType: null, // 'hot-desk' hoặc 'fixed-desk'
    
    // Bước 2: Chọn gói thời gian
    packageDuration: null, // 'daily', 'weekly', 'monthly', 'yearly'
    
    // Bước 3: Chọn ngày và giờ
    date: null,
    endDate: null, // Thêm ngày kết thúc dựa vào package duration
    time: null, // Thêm giờ bắt đầu riêng
    endTime: null, // Thêm giờ kết thúc riêng
    
    // Bước 4: Chọn vị trí chỗ ngồi
    selectedSeat: null,
    
    // Bước 5: Thanh toán
    paymentMethod: null, // 'credit-card', 'bank-transfer', 'momo', etc.
    bookingComplete: false,
    
    // Lưu trữ dữ liệu chỗ ngồi
    seats: sampleSeats,
    
    // Thông tin thanh toán
    paymentDetails: {
      totalAmount: 0,
      discount: 0,
      finalAmount: 0
    },
    // Danh sách packages lấy từ BE (hot_desk + fixed_desk)
    packages: [],         // raw list từ API (bao gồm final_price, discount_pct)
    packagesLoaded: false,
    selectedPackageId: null,  // id gói cụ thể (kết hợp với packageDuration trước đây)
    bookingReference: null,
    confirmedBooking: null,
    recentBookingId: null,
    lastPaymentMethod: null,
    lastPaymentLabel: null
  });

  // Lưu trữ bước hiện tại
  const [currentStep, setCurrentStep] = useState(1);

  // State để lưu trữ occupied seats
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [hotDeskSummary, setHotDeskSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const latestSeatsRequestRef = useRef(0);

  const applyBookingSnapshot = useCallback((snapshot) => {
    if (!snapshot || !snapshot.booking) return;
    const normalized = normalizeBookingResponse(snapshot.booking);
    setBookingState(prev => ({
      ...prev,
      confirmedBooking: normalized,
      bookingComplete: true,
      bookingReference: normalized.bookingReference,
      serviceType: prev.serviceType || normalized.serviceType,
      packageDuration: prev.packageDuration || normalized.packageDuration,
      date: prev.date || normalized.startDate,
      endDate: prev.endDate || normalized.endDate,
      selectedSeat: prev.selectedSeat || (normalized.seatName ? {
        id: normalized.seatCode || normalized.seatName,
        name: normalized.seatName
      } : prev.selectedSeat),
      paymentMethod: prev.paymentMethod || snapshot.paymentMeta?.methodCode || null,
      paymentDetails: normalized.finalPrice ? {
        totalAmount: normalized.finalPrice,
        discount: 0,
        finalAmount: normalized.finalPrice
      } : prev.paymentDetails,
      lastPaymentMethod: snapshot.paymentMeta?.methodCode || prev.lastPaymentMethod,
      lastPaymentLabel: snapshot.paymentMeta?.displayName || prev.lastPaymentLabel,
      recentBookingId: normalized.id
    }));
  }, [setBookingState]);

  const getStoredBookingSnapshot = useCallback(() => readRecentBooking(), []);
  const saveBookingSnapshot = useCallback((snapshot) => persistRecentBooking(snapshot), []);
  const clearStoredBookingSnapshot = useCallback(() => clearRecentBooking(), []);

  // Phương thức cập nhật service type (Bước 1)
  async function fetchPackagesIfNeeded() {
    if (bookingState.packagesLoaded) return;
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const resp = await fetch(`${apiUrl}/api/packages`);
      if (!resp.ok) throw new Error('Fetch packages failed');
      const data = await resp.json();
      // Chỉ lấy active + hot_desk/fixed_desk
      const filtered = data.filter(p => ['hot_desk','fixed_desk'].includes(p.service_code) && p.status === 'active');
      setBookingState(prev => ({ ...prev, packages: filtered, packagesLoaded: true }));
    } catch (e) {
      console.error('Lỗi tải packages:', e);
    }
  }

  const selectServiceType = async (type) => {
    // Tải packages nếu chưa có
    await fetchPackagesIfNeeded();
    setBookingState(prev => ({
      ...prev,
      serviceType: type,
      // reset các bước liên quan
      packageDuration: null,
      selectedPackageId: null,
      date: null,
      selectedSeat: null,
      paymentMethod: null,
      bookingComplete: false,
      // Giữ nguyên paymentDetails; sẽ cập nhật khi chọn gói cụ thể
    }));
    setCurrentStep(2);
  };

  // Phương thức cập nhật package duration (Bước 2)
  const selectPackageDuration = (packageId) => {
    // Ở phiên bản mới: packageId chính là ID gói trong bảng service_packages
    const pkg = bookingState.packages.find(p => String(p.id) === String(packageId));
    if (!pkg) {
      console.warn('Package không tìm thấy:', packageId);
      return;
    }
    const price = Number(pkg.price);
    const pct = Number(pkg.discount_pct || 0);
    const discountAmount = Math.round(price * pct / 100);
    const finalAmount = price - discountAmount;
    setBookingState(prev => ({
      ...prev,
      packageDuration: packageId, // giữ tên field cũ để không phá vỡ code khác
      selectedPackageId: packageId,
      date: null,
      selectedSeat: null,
      paymentMethod: null,
      bookingComplete: false,
      paymentDetails: {
        totalAmount: price,
        discount: discountAmount,
        finalAmount
      }
    }));
    setCurrentStep(3);
  };

  // Phương thức cập nhật ngày (Bước 3)
  const selectDate = (date, endDate, time, endTime) => {
    setBookingState({
      ...bookingState,
      date,
      endDate,
      time,
      endTime,
      // Reset các bước tiếp theo nếu thay đổi ngày
      selectedSeat: null,
      paymentMethod: null,
      bookingComplete: false
    });
    setCurrentStep(4); // Chuyển sang bước 4
  };

  // Phương thức cập nhật chỗ ngồi (Bước 4)
  const selectSeat = (seat) => {
    setBookingState({
      ...bookingState,
      selectedSeat: seat,
      paymentMethod: null,
      bookingComplete: false
    });
    setCurrentStep(5); // Chuyển sang bước 5 - Thanh toán
  };

  // Phương thức chọn phương thức thanh toán (Bước 5)
  const selectPaymentMethod = (method) => {
    setBookingState({
      ...bookingState,
      paymentMethod: method
    });
  };

  // Phương thức xác nhận thanh toán và hoàn tất đặt chỗ (Bước 5)
  const confirmBooking = async (paymentInfo = null) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('🔄 Creating booking...', bookingState);

      const isHotDesk = bookingState.serviceType === 'hot-desk';
      const fallbackSeat = isHotDesk
        ? {
            id: `HOTDESK-${Date.now().toString(36).toUpperCase()}`,
            name: 'Hot Desk Flex Access'
          }
        : null;
      const seatInfo = bookingState.selectedSeat || fallbackSeat;

      if (!seatInfo) {
        throw new Error('Seat information is required before confirming this booking.');
      }

      const bookingData = {
        serviceType: bookingState.serviceType,
        packageDuration: bookingState.packageDuration,
        startDate: bookingState.date,
        startTime: bookingState.time,
        seatId: seatInfo.id,
        seatName: seatInfo.name,
        floor: 1,
        specialRequests: 'Booking from frontend',
        paymentInfo: paymentInfo || {
          method: bookingState.paymentMethod || 'credit-card',
          status: 'completed'
        }
      };

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/bookings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Booking created successfully:', result.booking);
        const normalized = normalizeBookingResponse(result.booking);
        const paymentMeta = {
          methodCode: paymentInfo?.method === 'saved'
            ? paymentInfo.methodType
            : (paymentInfo?.method || bookingState.paymentMethod),
          displayName: paymentInfo?.displayName || paymentInfo?.methodType || paymentInfo?.method || bookingState.paymentMethod
        };
        const snapshot = {
          booking: normalized,
          paymentMeta,
          storedAt: Date.now()
        };

        applyBookingSnapshot(snapshot);
        saveBookingSnapshot(snapshot);

        // Refresh occupied seats after successful booking
        setTimeout(() => {
          fetchOccupiedSeats(
            bookingState.serviceType,
            bookingState.date,
            bookingState.time,
            bookingState.endTime,
            bookingState.endDate
          );
        }, 1000);

        return { success: true, booking: normalized };
      } else {
        console.error('❌ Booking failed:', result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('💥 Error creating booking:', error);
      return { success: false, message: error.message };
    }
  };

  // Phương thức reset lại quá trình booking
  const resetBooking = () => {
    clearStoredBookingSnapshot();
    setOccupiedSeats([]);
    setHotDeskSummary(null);
    setBookingState(prev => ({
      ...prev,
      serviceType: null,
      packageDuration: null,
      date: null,
      endDate: null,
      time: null,
      endTime: null,
      selectedSeat: null,
      paymentMethod: null,
      bookingComplete: false,
      bookingReference: null,
      confirmedBooking: null,
      recentBookingId: null,
      lastPaymentMethod: null,
      lastPaymentLabel: null,
      seats: sampleSeats,
      paymentDetails: {
        totalAmount: 0,
        discount: 0,
        finalAmount: 0
      }
    }));
    setCurrentStep(1);
  };

  // Kiểm tra xem có thể tiếp tục bước tiếp theo không
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!bookingState.serviceType;
      case 2:
        return !!bookingState.packageDuration;
      case 3:
        return !!bookingState.date;
      case 4:
        return !!bookingState.selectedSeat;
      case 5:
        return !!bookingState.paymentMethod; // Cần chọn phương thức thanh toán để xác nhận
      default:
        return false;
    }
  };

  // Phương thức lấy occupied seats từ API
  const fetchOccupiedSeats = useCallback(async (serviceType, date, startTime, endTime, endDate, options = {}) => {
    if (!serviceType || !date) return;

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      return;
    }

    const requestToken = ++latestSeatsRequestRef.current;
    if (!options.skipLoading) {
      setLoading(true);
    }

    try {
      const url = buildOccupiedSeatsUrl({
        serviceType,
        date,
        startTime,
        endTime,
        endDate,
        cacheBust: options.cacheBust,
        probeStartOnly: options.probeStartOnly
      });
      if (!url) {
        throw new Error('Unable to build occupied seats request');
      }

      console.log('🔍 Fetching occupied seats:', { serviceType, date, startTime, endTime, endDate, url });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 Occupied seats response:', data);

      if (requestToken !== latestSeatsRequestRef.current) {
        return; // Ignore stale response
      }

      setOccupiedSeats(Array.isArray(data.occupiedSeats) ? data.occupiedSeats : []);
      setHotDeskSummary(data.summary || null);
      setBookingState(prev => ({
        ...prev,
        lastUpdated: Date.now()
      }));
    } catch (error) {
      if (requestToken === latestSeatsRequestRef.current) {
        console.error('❌ Error fetching occupied seats:', error);
        setHotDeskSummary(null);
        console.log('⚠️ Using sample seat data due to API error');
      }
    } finally {
      if (!options.skipLoading && requestToken === latestSeatsRequestRef.current) {
        setLoading(false);
      }
    }
  }, [setBookingState]);

  // Phương thức kiểm tra xem seat có bị occupied không
  const isSeatOccupied = (seatId) => {
    return occupiedSeats.some(occupied => occupied.seatId === seatId);
  };

  // Force refresh occupied seats (clear cache and refetch)
  const forceRefreshOccupiedSeats = useCallback(async () => {
    if (!bookingState.serviceType || !bookingState.date) return;
    console.log('🔄 Force refreshing occupied seats...');
    await fetchOccupiedSeats(
      bookingState.serviceType,
      bookingState.date,
      bookingState.time,
      bookingState.endTime,
      bookingState.endDate,
      { cacheBust: true }
    );
  }, [
    bookingState.serviceType,
    bookingState.date,
    bookingState.time,
    bookingState.endTime,
    bookingState.endDate,
    fetchOccupiedSeats
  ]);

  // Giá trị cung cấp cho context
  const value = {
    bookingState,
    currentStep,
    setCurrentStep,
    selectServiceType,
    selectPackageDuration,
    // expose để trang Duration gọi đảm bảo đã load packages
    ensurePackagesLoaded: fetchPackagesIfNeeded,
    selectDate,
    selectSeat,
    selectPaymentMethod,
    confirmBooking,
    resetBooking,
    canProceed,
    occupiedSeats,
    occupiedSummary: hotDeskSummary,
    loading,
    fetchOccupiedSeats,
    forceRefreshOccupiedSeats,
    isSeatOccupied,
    getStoredBookingSnapshot,
    saveBookingSnapshot,
    hydrateBookingFromSnapshot: applyBookingSnapshot,
    clearStoredBookingSnapshot
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

// Hook tùy chỉnh để sử dụng BookingContext
export const useBooking = () => {
  return useContext(BookingContext);
};
