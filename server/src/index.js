const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const seedAdmin = require('./utils/seedAdmin');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;
const clientOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim()).filter(Boolean)
  : ['http://localhost:3000'];

app.use(
  cors({
    origin: clientOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Love server is ready to cuddle 💗' });
});

app.use('/api/love', require('./routes/loveRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.use((err, req, res, next) => {
  console.error('Unexpected error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong, but love prevails!',
  });
});

const startServer = async () => {
  await connectDB();
  await seedAdmin();
  app.listen(PORT, () => {
    console.log(`💘 Server listening on port ${PORT}`);
  });
};

startServer();

