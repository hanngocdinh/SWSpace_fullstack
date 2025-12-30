export const resolveBookingDurationLabel = (bookingState) => {
  if (!bookingState) return 'Not selected';

  const rawValue = bookingState.packageDuration ?? bookingState.selectedPackageId;
  if (rawValue === undefined || rawValue === null || rawValue === '') return 'Not selected';

  const preset = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly'
  };

  const normalize = (v) => String(v).trim().toLowerCase();
  const normalizedRaw = normalize(rawValue);

  if (preset[normalizedRaw]) return preset[normalizedRaw];

  const pkgs = Array.isArray(bookingState.packages) ? bookingState.packages : [];
  const matched = pkgs.find(p => String(p?.id) === String(rawValue))
    || (bookingState.selectedPackageId ? pkgs.find(p => String(p?.id) === String(bookingState.selectedPackageId)) : null);

  if (matched) {
    const unit = normalize(matched.unit_code || matched.unitCode || '');
    const unitLabel = {
      day: 'Daily',
      week: 'Weekly',
      month: 'Monthly',
      year: 'Yearly'
    };

    if (unit && unitLabel[unit]) return unitLabel[unit];

    return matched.name
      || matched.display_name
      || matched.package_name
      || matched.code
      || `Package #${matched.id}`;
  }

  return String(rawValue);
};
