console.log("Starting server...");

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Use CORS to allow cross-origin frontend requests
app.use(cors());

// Parse JSON request bodies
app.use(bodyParser.json());

// In-memory storage for demo purposes
const messages = [];
const contacts = [];
const errorReports = [];

// Save contact form data
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  contacts.push({ name, email, message, time: new Date().toISOString() });
  console.log('Contact received:', { name, email, message });
  res.status(200).json({ message: 'Contact message saved' });
});

// Save reported errors
app.post('/api/report-error', (req, res) => {
  const { email, error } = req.body;
  if (!email || !error) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  errorReports.push({ email, error, time: new Date().toISOString() });
  console.log('Error reported:', { email, error });
  res.status(200).json({ message: 'Error report saved' });
});

// Save blockchain messages from frontend
app.post('/api/save-message', (req, res) => {
  const { sender, message } = req.body;
  if (!sender || !message) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  messages.unshift({ sender, message, time: new Date().toISOString() });
  console.log('Message saved:', { sender, message });
  res.status(200).json({ message: 'Message saved' });
});

// Get all saved blockchain messages
app.get('/api/get-messages', (req, res) => {
  res.json(messages);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
