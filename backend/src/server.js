const path = require('path');
const NODE_ENV = process.env.NODE_ENV || 'development';

// In production (Render), environment variables are injected directly —
// no .env file is needed or used.
if (NODE_ENV !== 'production') {
  const envFile = '.env.development';
  const envPath = path.join(__dirname, '..', envFile);
  const fallbackPath = path.join(__dirname, '../.env');
  const fs = require('fs');
  require('dotenv').config({ path: fs.existsSync(envPath) ? envPath : fallbackPath });
  console.log(`[env] loaded ${fs.existsSync(envPath) ? envFile : '.env'}`);
}

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT} (${NODE_ENV})`));
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err.message);
    process.exit(1);
  });
