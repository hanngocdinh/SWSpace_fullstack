#!/usr/bin/env node
/**
 * Clear core booking-related collections (Bookings, QRCodes, CheckIns).
 * Unified version migrated from legacy backend_user. Uses MONGODB_URI.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const QRCode = require('../models/QRCode');
const CheckIn = require('../models/CheckIn');

throw new Error('Deprecated Mongo script removed. Use PostgreSQL maintenance scripts instead.');
