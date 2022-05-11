import { map } from 'modern-async'

export async function answerResource(answer) {
  return {
    id: answer._id,
    queueId: answer.queueId,
    text: answer.text,
    isCorrect: answer.isCorrect,
  }
}

export async function answerResourceCollections(answers) {
  return await map(answers, async (answer) => {
      return answerResource(answer)
  });
};
