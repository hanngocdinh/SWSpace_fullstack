#!/usr/bin/env node
/* Seed tổng hợp dữ liệu user domain (Users, TeamServices, DurationPackages, TeamRooms, PaymentMethods).
   Dùng MONGODB_URI từ .env. Chạy: node scripts/seed-all-data.js */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
throw new Error('Deprecated Mongo script removed. Use PostgreSQL seeders instead.');
const DurationPackage = require('../models/DurationPackage');
