require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Chatbot responses
const chatResponses = {
  hello: "Hello! How can I assist you today? 😊",
  help: "I can help with:\n- Booking rides\n- Service info\n- Account issues\nWhat do you need?",
  payment: "We accept mobile money and credit cards. Which would you prefer?",
  default: "I'll connect you with a human agent. One moment please... ⏳"
};

// Chat API Endpoint
app.post('/api/chat', (req, res) => {
  try {
    const { message } = req.body;
    const cleanMsg = message.toLowerCase().trim();
    const response = chatResponses[cleanMsg] || chatResponses.default;
    
    // Simulate processing delay
    setTimeout(() => {
      res.json({
        success: true,
        response: response
      });
    }, 800);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Chat service unavailable. Please try again later."
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Add these after the chat endpoint
const users = [];
const contacts = [];

// Sign Up Endpoint
app.post('/api/register', (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Simple validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide all required fields"
      });
    }

    // Check if user exists
    const userExists = users.some(user => user.email === email);
    if (userExists) {
      return res.status(409).json({
        success: false,
        error: "User already exists"
      });
    }

    // Store user (in memory - for production use a database)
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password // In real app, hash passwords!
    };
    users.push(newUser);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Registration failed. Please try again."
    });
  }
});

// Contact Form Endpoint
app.post('/api/contact', (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "All fields are required"
      });
    }

    // Store contact (in memory - use database in production)
    const newContact = {
      id: contacts.length + 1,
      name,
      email,
      message,
      date: new Date().toISOString()
    };
    contacts.push(newContact);

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      contact: newContact
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to send message. Please try again."
    });
  }
});

// Add to top with other data stores
const rides = [];

// Fare calculation logic
const calculateFare = (distance, rideType) => {
  const baseFares = {
    standard: 5,
    express: 7,
    eco: 6
  };
  return (baseFares[rideType] * distance).toFixed(2);
};

// Ride Booking Endpoint
app.post('/api/book-ride', (req, res) => {
  try {
    const { userId, pickup, destination, rideType } = req.body;

    // Validation
    if (!pickup || !destination || !rideType) {
      return res.status(400).json({
        success: false,
        error: "All ride details are required"
      });
    }

    // Simulate distance calculation (replace with real API in production)
    const distance = Math.random() * 10 + 2; // Random distance between 2-12 km
    const fare = calculateFare(distance, rideType);

    // Create ride object
    const newRide = {
      id: rides.length + 1,
      userId,
      pickup,
      destination,
      rideType,
      distance: distance.toFixed(2),
      fare,
      status: "pending",
      timestamp: new Date().toISOString()
    };

    rides.push(newRide);

    res.status(201).json({
      success: true,
      message: "Ride booked successfully",
      ride: newRide
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to book ride. Please try again."
    });
  }
});

// Fare Estimation Endpoint
app.post('/api/estimate-fare', (req, res) => {
  try {
    const { pickup, destination, rideType } = req.body;
    
    if (!pickup || !destination || !rideType) {
      return res.status(400).json({
        success: false,
        error: "Required fields missing for fare estimation"
      });
    }

    // Simulate distance calculation
    const distance = Math.random() * 10 + 2;
    const fare = calculateFare(distance, rideType);

    res.json({
      success: true,
      estimation: {
        distance: distance.toFixed(2),
        fare
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Fare estimation failed"
    });
  }
});