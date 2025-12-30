const STORAGE_KEY = 'swspace_team_booking_recent_team';

const hasWindow = () => typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';

const safeISO = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toISOString();
};

const deriveTimeValue = (value) => {
  if (!value) return null;
  if (typeof value === 'string' && /^\d{2}:\d{2}/.test(value)) {
    return value.slice(0, 5);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const durationToText = (duration) => {
  if (!duration) return '';
  const unitMap = {
    hours: 'giờ',
    days: 'ngày',
    months: 'tháng',
    years: 'năm'
  };
  const value = duration.value ?? duration.amount;
  const unit = duration.unit ?? duration.type;
  if (!value || !unit) return '';
  return `${value} ${unitMap[unit] || unit}`;
};

export const normalizeTeamBooking = (booking = {}, extras = {}) => {
  const normalized = {
    id: booking.id || booking._id || extras.id || null,
    bookingReference: booking.bookingReference || booking.booking_reference || extras.bookingReference || null,
    serviceType: extras.serviceType || booking.serviceType || booking.service_type || extras.selectedService?.name || null,
    packageDuration: booking.packageDuration || booking.package_duration || extras.packageDuration || extras.selectedPackage?.duration?.unit || null,
    startDate: safeISO(booking.startDate || booking.start_time || extras.startDate),
    endDate: safeISO(booking.endDate || booking.end_time || extras.endDate || extras.startDate),
    startTime: deriveTimeValue(extras.startTime || booking.startTime || booking.start_time),
    endTime: deriveTimeValue(extras.endTime || booking.endTime || booking.end_time),
    seatName: booking.seatName || booking.seat_name || extras.selectedRoom?.name || null,
    seatCode: booking.seatCode || booking.seat_code || extras.selectedRoom?.roomNumber || null,
    floor: booking.floor || booking.floor_no || extras.selectedRoom?.floor || null,
    finalPrice: Number(booking.finalPrice || booking.final_price || extras.finalPrice || 0),
    status: booking.status || extras.status || 'pending',
    paymentStatus: booking.paymentStatus || booking.payment_status || extras.paymentStatus || 'pending',
    serviceInfo: extras.selectedService || null,
    packageInfo: extras.selectedPackage || null,
    roomInfo: extras.selectedRoom || null,
    customHours: extras.customHours || null,
    durationLabel: extras.selectedPackage?.name
      || durationToText(extras.selectedPackage?.duration)
      || durationToText({ value: 1, unit: booking.packageDuration })
      || extras.packageDuration
      || booking.packageDuration,
    paymentMethod: extras.paymentMethod || null,
    specialRequests: extras.specialRequests || booking.notes || null,
    storedAt: Date.now(),
    raw: booking
  };
  return normalized;
};

export const saveTeamBookingSnapshot = (snapshot) => {
  try {
    if (!hasWindow()) return;
    if (!snapshot) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return;
    }
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    console.warn('Không thể lưu team booking snapshot:', error);
  }
};

export const readTeamBookingSnapshot = () => {
  try {
    if (!hasWindow()) return null;
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('Không thể đọc team booking snapshot:', error);
    return null;
  }
};

export const clearTeamBookingSnapshot = () => {
  try {
    if (!hasWindow()) return;
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Không thể xoá team booking snapshot:', error);
  }
};
