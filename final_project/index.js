const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Using express-session for user session management
app.use(
  '/customer',
  session({ secret: 'fingerprint_customer', resave: true, saveUninitialized: true })
);

// Authentication middleware
app.use('/customer/auth/*', function auth(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1]; // Extract token from Authorization header
  if (!token) {
    return res.status(403).json({ message: 'Access Denied' });
  }

  // Verify token
  jwt.verify(token, 'your_secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid Token' });
    }
    req.user = user; // Attach user to the request
    next(); // Proceed to the next middleware or route handler
  });
});

const PORT = 3000;

// Routes
app.use('/customer', customer_routes); // Customer authentication routes
app.use('/', genl_routes); // General book routes

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
