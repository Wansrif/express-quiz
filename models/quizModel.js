import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    questionId: {
      type: Object,
      default: {},
    },
    answer: {
      type: Object,
      default: {},
    },
    score: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true, versionKey: false }
);

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
