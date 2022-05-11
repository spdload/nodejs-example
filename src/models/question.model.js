import pkg from 'mongoose';
import { QUESTION_TYPES } from '../enums/question.enums.js';

const { Schema: _Schema, model } = pkg;
const Schema = _Schema;

let question = new Schema(
  {
    questionText: String,
    pureText: String,
    html: String,
    purpose: String,
    duration: Number,
    isShuffleAnswers: Boolean,
    queueId: Number,
    questionType: Object,
    fileUrl: String,
    author: {
      type: _Schema.Types.ObjectId,
      ref: 'users'
    },
    answers: [{
      type: _Schema.Types.ObjectId,
      ref: 'answers'
    }],
    createdAt: Date,
    updatedAt: Date
  }
);

export default model("questions", question);
