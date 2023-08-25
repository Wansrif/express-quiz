/* ------------------------------ */
/* MongoDB Connection Configuration */
/* ------------------------------ */
/* The provided code configures the connection to a MongoDB database using Mongoose. It includes a function "connectDB" that establishes the connection and handles errors. */

import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

/* Function to establish MongoDB connection */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connection established successfully...');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  }
};

export default connectDB;
