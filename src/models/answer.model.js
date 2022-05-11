import pkg from 'mongoose';

const { Schema: _Schema, model } = pkg;
const Schema = _Schema;

let answer = new Schema(
  {
    text: String,
    queueId: Number,
    isCorrect: Boolean,
    createdAt: Date
  }
);

export default model("answers", answer);
