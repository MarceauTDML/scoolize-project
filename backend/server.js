const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

const registerRoutes = require('./routes/register');
const loginRoutes = require('./routes/login');
const userRoutes = require('./routes/users');
const schoolRoutes = require('./routes/schools');
const adminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/students');
const schoolManagementRoutes = require('./routes/schoolManagement');

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/register', registerRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/school-management', schoolManagementRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Serveur Scoolize démarré sur http://localhost:${PORT}`);
});