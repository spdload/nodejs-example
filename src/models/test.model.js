import pkg from 'mongoose';
import { TEST_STATUSES } from '../enums/test.enums.js';

const { Schema: _Schema, model } = pkg;
const Schema = _Schema;

let test = new Schema(
  {
    testName: String,
    testPurpose: String,
    time: Number,
    testDescription: String,
    isPremium: Boolean,
    jobRoles: Array,
    testCategory: Object,
    testSummary: String,
    language: Object,
    isShuffleAllAnswers: Boolean,
    isShuffleQuestions: Boolean,
    testDifficulty: String,
    queueId: Number,
    status: {
      type: String,
      enum: Object.values(TEST_STATUSES)
    },
    previousVersion: {
      type: _Schema.Types.ObjectId,
      ref: 'tests'
    },
    nextVersion: {
      type: _Schema.Types.ObjectId,
      ref: 'tests'
    },
    releaseNotes: String,
    version: {
      type: Number,
      default: 0
    },
    testAuthor: {
      type: _Schema.Types.ObjectId,
      ref: 'users'
    },
    questions: [{
      type: _Schema.Types.ObjectId,
      ref: 'questions'
    }],
    createdAt: Date,
    lastUpdated: Date,
  }
);

export default model("tests", test);
