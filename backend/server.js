const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const path = require('path');


app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/cases', require('./routes/caseRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Start server only if run directly
if (require.main === module) {
  connectDB();
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;





