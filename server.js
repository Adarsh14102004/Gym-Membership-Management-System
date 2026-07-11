const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files from the existing frontend
app.use(express.static(__dirname));

// Routes
const authRoutes = require('./src/routes/authRoutes');
const memberRoutes = require('./src/routes/memberRoutes');
const planRoutes = require('./src/routes/planRoutes');
const attendanceRoutes = require('./src/routes/attendanceRoutes');
const contactRoutes = require('./src/routes/contactRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Basic route for homepage
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(port, () => {
    console.log(`FitZone backend running on http://localhost:${port}`);
});