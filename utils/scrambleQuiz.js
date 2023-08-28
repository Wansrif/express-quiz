import fs from 'fs';
import { Redis } from 'ioredis';
import User from '../models/userModel.js';
import Quiz from '../models/quizModel.js';

const redis = new Redis();

const loadSoal = () => {
  const data = fs.readFileSync('./database/soal.json');
  return JSON.parse(data);
};

/* Bucket Quiz */
const bucketQuiz = [
  [1, 20, 21, 40, 41, 60, 61, 80, 81, 100, 101, 120, 121, 140, 141],
  [2, 19, 22, 39, 42, 59, 62, 79, 82, 99, 102, 119, 122, 139, 142],
  [3, 18, 23, 38, 43, 58, 63, 78, 83, 98, 103, 118, 123, 138, 143],
  [4, 17, 24, 37, 44, 57, 64, 77, 84, 97, 104, 117, 124, 137, 144],
  [5, 16, 25, 36, 45, 56, 65, 76, 85, 96, 105, 116, 125, 136, 145],
  [6, 15, 26, 35, 46, 55, 66, 75, 86, 95, 106, 115, 126, 135, 146],
  [7, 14, 27, 34, 47, 54, 67, 74, 87, 94, 107, 114, 127, 134, 147],
  [8, 13, 28, 33, 48, 53, 68, 73, 88, 93, 108, 113, 128, 133, 148],
  [9, 12, 29, 32, 49, 52, 69, 72, 89, 92, 109, 112, 129, 132, 149],
  [10, 11, 30, 31, 50, 51, 70, 71, 90, 91, 110, 111, 130, 131, 150],
];

const removeDuplicate = (arr1, arr2) => {
  const bucket = new Set(arr1);
  const bukcet2 = new Set(arr2);
  const filterBucket = [...bukcet2].filter((item) => !bucket.has(item));
  return filterBucket;
};

// get quiz from bucket quiz
export const generateQuiz = async (userId) => {
  const user = await User.findById(userId).select('username phone');
  const phone = user.phone;
  const soal = loadSoal();

  const round = await redis.get(`${user.username}-round`);
  const onGoingQuiz = await redis.get(`${user.username}-quiz`);
  const questionId = await redis.get(`${user.username}-questionId`);

  /* if round not 1 */
  if (round && parseInt(round) !== 1) {
    const getIndexBucket = (round + 1) % 10;
    const bucket = bucketQuiz[getIndexBucket];
    const random = Math.floor(Math.random() * bucket.length);

    const quiz = soal.quiz.find((q) => q.id === bucket[random]);

    const quizId = await redis.get(`${user.username}-quizId`);
    const findQuestionId = await Quiz.findOne({ _id: quizId }).select(`questionId`);
    if (!findQuestionId.questionId[`round-${round}`]) {
      await Quiz.updateOne(
        { _id: quizId },
        { $set: { [`questionId.round-${round}`]: [], [`score.round-${round}`]: 0 } }
      );
    }

    if (questionId) {
      const filterBucket = removeDuplicate(JSON.parse(questionId), bucket);

      if (filterBucket.length === 0) {
        await redis.set(`${user.username}-round`, parseInt(round) + 1);
        return await redis.del(`${user.username}-questionId`);
      }

      const random = Math.floor(Math.random() * filterBucket.length);
      const quizFilter = soal.quiz.find((q) => q.id === filterBucket[random]);

      const quizId = await redis.get(`${user.username}-quizId`);
      const findQuestionId = await Quiz.findOne({ _id: quizId }).select('questionId');
      const arr = [...Object.values(findQuestionId.questionId[`round-${round}`]), quizFilter.id];
      await Quiz.updateOne({ _id: quizId }, { $set: { [`questionId.round-${round}`]: arr } });

      await redis.set(`${user.username}-round`, round);
      await redis.set(`${user.username}-questionId`, JSON.stringify(arr));
      await redis.set(`${user.username}-quiz`, JSON.stringify(quizFilter));
      return quizFilter;
    }

    await Quiz.updateOne({ _id: quizId }, { $set: { [`questionId.round-${round}`]: [quiz.id] } });

    await redis.set(`${user.username}-round`, round);
    await redis.set(`${user.username}-quiz`, JSON.stringify(quiz));
    await redis.set(`${user.username}-questionId`, JSON.stringify([quiz.id]));

    return quiz;
  }

  /* if round is 1, generate quiz by last number phone */
  if (!round || !onGoingQuiz || parseInt(round) === 1) {
    const lastNumber = parseInt(phone.slice(-1));
    const bucket = bucketQuiz[lastNumber];
    const random = Math.floor(Math.random() * bucket.length);

    const quiz = soal.quiz.find((q) => q.id === bucket[random]);
    /* quiz cant be same as before */
    if (questionId) {
      const filterBucket = removeDuplicate(JSON.parse(questionId), bucket);

      if (filterBucket.length === 0) {
        await redis.set(`${user.username}-round`, 2);
        return await redis.del(`${user.username}-questionId`);
      }

      const random = Math.floor(Math.random() * filterBucket.length);
      const quizFilter = soal.quiz.find((q) => q.id === filterBucket[random]);

      const quizId = await redis.get(`${user.username}-quizId`);
      const findQuestionId = await Quiz.findOne({ _id: quizId }).select('questionId');
      const arr = [...Object.values(findQuestionId.questionId[`round-1`]), quizFilter.id];
      await Quiz.updateOne({ _id: quizId }, { $set: { [`questionId.round-${round}`]: arr } });

      await redis.set(`${user.username}-round`, 1);
      await redis.set(`${user.username}-questionId`, JSON.stringify(arr));
      await redis.set(`${user.username}-quiz`, JSON.stringify(quizFilter));
      return quizFilter;
    }

    const quizId = await Quiz.create({
      questionId: { [`round-${1}`]: [quiz.id] },
      score: { [`round-${1}`]: 0 },
    });

    await redis.set(`${user.username}-round`, 1);
    await redis.set(`${user.username}-quiz`, JSON.stringify(quiz));
    await redis.set(`${user.username}-quizId`, quizId._id);
    await redis.set(`${user.username}-questionId`, JSON.stringify([quiz.id]));

    return quiz;
  }
};

export const getQuiz = async (userId) => {
  const user = await User.findById(userId).select('username');
  const quiz = await redis.get(`${user.username}-quiz`);
  return JSON.parse(quiz);
};
