const express = require('express');
const cors = require('cors');
require('dotenv').config();

const registerRoute = require('./routes/register');
const loginRoute = require('./routes/login');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth/register', registerRoute);
app.use('/api/auth/login', loginRoute);

app.get('/', (req, res) => {
    res.send('API Scoolize en ligne');
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});