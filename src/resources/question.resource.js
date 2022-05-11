import { map } from 'modern-async';
import { answerResourceCollections } from './answer.resource.js';

export async function questionResource(question) {
  return {
    id: question._id,
    questionText: question.questionText,
    isShuffleAnswers: question.isShuffleAnswers,
    queueId: question.queueId,
    questionType: question.questionType,
    answers: await answerResourceCollections(question.answers),
  }
}

export async function questionResourceCollections(questions) {
  return await map(questions, async (question) => {
      return questionResource(question)
  });
};
