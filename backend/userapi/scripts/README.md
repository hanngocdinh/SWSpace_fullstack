Utility scripts migrated from backend_user for testing and maintenance.

How to run (Windows PowerShell):
- Run from this folder unless noted. Make sure backend is running on http://localhost:5000.

Scripts:
- test-booking-api.js: Login, create a booking, query occupied seats.
- test-payment-methods.js: Login, list/create payment methods.
- test-qr-email.js: Login, create booking, expect QR email.
- clear-bookings.js: Login and cancel all active bookings for a user.

Note: These scripts target the unified backend on port 5000 and use the same JWT auth.
