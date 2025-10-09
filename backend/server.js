const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const Database = require('./config/db');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cases', require('./routes/caseRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));
app.use('/api/notifications', require('./routes/notifications'));

// Start server only after DB connects
if (require.main === module) {
    (async () => {
        await Database.connect(); // Wait until MongoDB is connected

        const PORT = process.env.PORT || 5001;
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })();
}

module.exports = app;
