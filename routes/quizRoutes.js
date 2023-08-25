import express from 'express';
import authJwt from '../middlewares/authJwt.js';
import quizController from '../controllers/quizController.js';

const quizRouter = express.Router();
const { verifyToken } = authJwt;

quizRouter.get('/', verifyToken, quizController.getQuiz);
quizRouter.post('/', verifyToken, quizController.answerQuiz);

export default quizRouter;
