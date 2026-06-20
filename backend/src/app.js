// sets up express, middleware and routes
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/packages', require('./routes/package.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/upload', require('./routes/upload.routes'));

// catch errors thrown from controllers and send back a clean response
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Server error' });
});

module.exports = app;
