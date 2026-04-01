const mongoose = require('mongoose');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI, {
    tls: true,
    // Allow invalid certificates only in development (e.g. self-signed local certs).
    // In production this must be false to ensure TLS chain validation.
    tlsAllowInvalidCertificates: process.env.NODE_ENV !== 'production',

    // How long the driver waits to find an available server before throwing.
    serverSelectionTimeoutMS: 10000,

    // How long a single socket may be idle in the connection pool.
    socketTimeoutMS: 45000,

    // Keep-alive so long-idle Atlas connections are not silently dropped.
    heartbeatFrequencyMS: 10000,
  });
  // Log only that the connection succeeded, not the host, to avoid leaking
  // infrastructure details (Atlas cluster name, region) in log aggregators.
  console.log('MongoDB connected successfully');
};

module.exports = connectDB;
