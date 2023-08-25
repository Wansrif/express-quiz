/* -------------------------------- */
/* Token Model Documentation */
/* -------------------------------- */
/* The provided code defines a mongoose schema and model for the "Token" entity. The schema includes an "email" field for the associated email address, a "token" field for the token value, and a "createdAt" field for tracking the creation time. The token is set to expire after 30 minutes. The "Token" model represents tokens used in various authentication processes and can be used to store and retrieve token data. */

import mongoose from 'mongoose';

/* Create a schema */
const tokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
  },
  token: {
    type: String,
    required: true,
    expires: '30m',
  },
  createdAt: { type: Date, default: Date.now },
});

/* Create a model */
const Token = mongoose.model('Tokens', tokenSchema);

export default Token;
