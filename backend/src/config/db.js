const mongoose = require('mongoose');

module.exports = async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is missing in .env');

  mongoose.set('strictQuery', true);

  // Updated connection options for MongoDB Driver 4.x+ (no deprecated options)
  const connectionOptions = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    retryWrites: true,
    retryReads: true,
    w: 'majority',
  };

  let lastError = null;

  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, connectionOptions);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Primary connection failed:', error.message);
    lastError = error;

    // Try with relaxed settings
    try {
      console.log('Trying with relaxed settings...');
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 60000,
        socketTimeoutMS: 60000,
        maxPoolSize: 5,
      });
      console.log('MongoDB connected with relaxed settings');
    } catch (relaxedError) {
      console.error('Relaxed connection also failed:', relaxedError.message);
      throw lastError;
    }
  }

  // Connection event handlers
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected. Attempting to reconnect...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
  });

  mongoose.connection.on('connected', () => {
    console.log('MongoDB connection established');
  });

  mongoose.connection.on('close', () => {
    console.log('MongoDB connection closed');
  });

  console.log('MongoDB connection pool ready');
};
