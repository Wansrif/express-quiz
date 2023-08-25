import express from 'express';
import cookieParser from 'cookie-parser';
import connectDB from './database/db.js';

import authRouter from './routes/authRoutes.js';
import quizRouter from './routes/quizRoutes.js';

const port = process.env.NODE_PORT || 3000;

const app = express();
connectDB();

/* Middlewares */
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* Routes */
app.get('/', (req, res) => {
  res.send('Hello World!');
});

/* Route handlers */
app.use('/api/auth', authRouter);
app.use('/api/quiz', quizRouter);

/* 404 Not Found handler */
app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status_code = 404;
  next(error);
});

/* Error handler */
app.use((error, req, res, next) => {
  res.status(error.status_code || 500);
  res.json({
    status: 'error',
    status_code: error.status_code || 500,
    message: error.message,
  });
});

/* Start the server */
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
