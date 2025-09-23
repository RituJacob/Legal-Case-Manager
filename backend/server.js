const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

require('./config/db');


const app = express();
const fileRoutes = require('./routes/fileRoutes');
const caseRoutes = require('./routes/caseRoutes');


app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/files', fileRoutes);
app.use('/api/cases', caseRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Export the app object for testing
if (require.main === module) {
    
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }


module.exports = app
