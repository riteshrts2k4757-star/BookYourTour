const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./test');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

let isConnected = false;
const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    await mongoose.connect(DB);
    isConnected = true;
    console.log('DB connection successful!');
  } catch (err) {
    console.error('DB CONNECTION ERROR 💥:', err);
  }
};

const port = process.env.PORT || 3000;

// Local development
if (process.env.NODE_ENV !== 'production') {
  connectDB().then(() => {
    const server = app.listen(port, () => {
      console.log(`App running on port ${port}...`);
    });

    process.on('unhandledRejection', err => {
      console.log('UNHANDLED REJECTION! 💥 Shutting down...');
      console.log(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });
  });
}

// Vercel Serverless Exporter
module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
