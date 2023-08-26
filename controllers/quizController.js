import { Redis } from 'ioredis';
import { generateQuiz, getQuiz } from '../utils/scrambleQuiz.js';
import User from '../models/userModel.js';
import Quiz from '../models/quizModel.js';

const redis = new Redis();

const quizController = {
  getQuiz: async (req, res) => {
    try {
      await redis.set(`${req.user.username}-sentAt`, Date.now());

      const userId = req.user.userId;
      const quizIndices = await getQuiz(userId);

      if (!quizIndices) {
        const newQuizIndices = await generateQuiz(userId);

        return res.json({
          status: 'success',
          status_code: 201,
          message: 'Quiz generated',
          data: newQuizIndices,
        });
      }

      await User.findOneAndUpdate({ _id: userId }, { status: 'playing' });

      res.json({
        status: 'success',
        status_code: 201,
        message: 'Quiz generated',
        data: quizIndices,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
  answerQuiz: async (req, res) => {
    try {
      const { answer } = req.body;
      const redisQuiz = await getQuiz(req.user.userId);

      if (!redisQuiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }

      const correctOption = redisQuiz.correctOption;
      const quizId = await redis.get(`${req.user.username}-quizId`);
      const round = await redis.get(`${req.user.username}-round`);
      const questionId = await redis.get(`${req.user.username}-questionId`);
      const countQuestion = JSON.parse(questionId)?.length;

      const quiz = await Quiz.findOne({ _id: quizId });
      const roundScore = await quiz.score[`round-${round}`];

      if (answer.toLowerCase() !== correctOption.toLowerCase()) {
        // if user answer wrong, decrease score -5
        await quiz.updateOne({ $inc: { [`score.round-${round}`]: -5 } });

        await redis.del(`${req.user.username}-quiz`);
        await redis.del(`${req.user.username}-sentAt`);

        return res.json({
          status: 'success',
          status_code: 200,
          message: 'Wrong answer',
          data: {
            round,
            score: roundScore,
            quiz: `${countQuestion}/15`,
            correctOption,
          },
        });
      }

      const sentAt = parseInt(await redis.get(`${req.user.username}-sentAt`));
      const timeTaken = Date.now() - sentAt;
      let score = 0;

      if (timeTaken <= 10 * 1000) {
        score = 10;
      } else if (timeTaken <= 20 * 1000) {
        score = 9;
      } else if (timeTaken <= 30 * 1000) {
        score = 8;
      } else if (timeTaken <= 40 * 1000) {
        score = 7;
      } else if (timeTaken <= 50 * 1000) {
        score = 6;
      } else if (timeTaken <= 60 * 1000) {
        score = 5;
      }

      await quiz.updateOne({ $inc: { [`score.round-${round}`]: score } });

      // Clear Redis keys
      await redis.del(`${req.user.username}-quiz`);
      await redis.del(`${req.user.username}-sentAt`);

      return res.json({
        status: 'success',
        status_code: 200,
        message: 'Correct answer',
        data: {
          round,
          score: roundScore,
          quiz: `${countQuestion}/15`,
        },
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
};

export default quizController;
