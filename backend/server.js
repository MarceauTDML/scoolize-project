const express = require("express");
const cors = require("cors");
require("dotenv").config();

const registerRoute = require("./routes/register");
const loginRoute = require("./routes/login");
const schoolsRoute = require("./routes/schools");
const adminRoute = require("./routes/admin");
const applicationsRoute = require('./routes/applications');
const favoritesRoute = require('./routes/favorites');
const newsRoute = require('./routes/news');
const reviewsRoute = require('./routes/reviews');
const profileRoute = require('./routes/profile');
const gradesRoute = require('./routes/grades');

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth/register", registerRoute);
app.use("/api/auth/login", loginRoute);
app.use("/api/schools", schoolsRoute);
app.use("/api/admin", adminRoute);
app.use('/api/applications', applicationsRoute);
app.use('/api/favorites', favoritesRoute);
app.use('/api/news', newsRoute);
app.use('/api/reviews', reviewsRoute);
app.use('/api/profile', profileRoute);
app.use('/api/grades', gradesRoute);

app.get("/", (req, res) => {
  res.send("API Scoolize en ligne");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
