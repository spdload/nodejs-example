import Question from '../models/question.model.js';
import Answer from '../models/answer.model.js';
import moment from 'moment';

export async function getQuestions(params = {}) {
  const data = {};

  const sortBy = params.sortBy;
  const search = params.search;
  const perPage = params.perPage ? parseInt(params.perPage, 10) : 10;
  const skip = params.skip ? parseInt(params.skip, 10) : 0;

  delete params.sortBy;
  delete params.search;
  delete params.perPage;
  delete params.skip;

  try {
    if (search) {
      data.questions = await Question.find({ $and: [ { $or: [
        { questionText: new RegExp(search, 'i') },
        { purpose: new RegExp(search, 'i') },
        { type: new RegExp(search, 'i') },
        { author: { firstName: new RegExp(search, 'i') }},
        { author: { lastName: new RegExp(search, 'i') }},
      ] } ] }).sort(sortBy).limit(perPage).skip(skip);
    } else {
      data.questions = await Question.find(params).sort(sortBy).limit(perPage).skip(skip);
    }
    data.page = (perPage + skip) / perPage;
    return data;
  } catch (error) {
    throw new Error(error)
  }
}

export async function getQuestionById(id) {
  try {
    const question = await Question.findById(id);
    await question.populate('answers');
    return question;
  } catch (error) {
    throw new Error(error)
  }
}

export async function createQuestions(data) {
  try {
    const createdAt = moment();
    const questions = data.questions;
    const mappedQuestions = [];
    for (let index = 0; index < questions.length; index++) {
      const question = questions[index];
      let answers = [];
      if (question.answers && question.answers.length > 0) {
        const createdAnswers = await Answer.insertMany(question.answers);
        createdAnswers.forEach(element => {
          answers.push(element._id);
        });
      };
      delete question.answers;
      mappedQuestions.push({ author: data.author, answers, createdAt, ...question });
    }
    const createdQuestions = await Question.insertMany(mappedQuestions);
    const populatedQuestions = [];
    for (let index = 0; index < createdQuestions.length; index++) {
      const element = createdQuestions[index];
      await element.populate('answers');
      populatedQuestions.push(element);
    }
    return populatedQuestions;
  } catch (error) {
    throw new Error(error)
  }
}

export async function updateQuestions(questions) {
  try {
    const questionsIds = [];
    const updatedAt = moment();
    for (let index = 0; index < questions.length; index++) {
      const question = questions[index];

      const answers = question.answers;
      const answersIds = [];
      for (let index = 0; index < answers.length; index++) {
        const answer = answers[index];
        if(answer.id) {
          await Answer.findByIdAndUpdate(
            answer.id,
            { $set: { updatedAt, ...answer }}
          );
          answersIds.push(answer.id)
        } else {
          const res = await Answer.create({createdAt: moment(), ...answer})
          answersIds.push(res._id)
        }
      }
      delete question.answers;
      if(question.id) {
        const res = await Question.findByIdAndUpdate(
          question.id,
          { $set: { updatedAt, answers: answersIds, ...question }},
          { new: true },
        )
        questionsIds.push(res._id);
      } else {
        const res = await Question.create(
          { updatedAt, answers: answersIds, ...question }
        )
        questionsIds.push(res._id);
      }
    }
    return questionsIds;
  } catch (error) {
    throw new Error(error)
  }
}

export async function updateQuestionById(id, data) {
  try {
    const updatedAt = moment();
    const question = await Question.findByIdAndUpdate(id,
      { $set: { updatedAt, ...data }}, 
      { new: true }
    );
    return question;
  } catch (error) {
    throw new Error(error)
  }
}

export async function deleteAnswerFromQuestion(questionId, answerIds) {
  try {
    const updatedAt = moment();
    Answer.deleteMany({_id: { $in:answerIds }});
    const question = await Question.findByIdAndUpdate(questionId,
      { $pull: { answers: answerIds }, $set: { updatedAt }}, 
      { new: true }
    );
    return question;
  } catch (error) {
    throw new Error(error)
  }
}

export async function deleteQuestionById(id) {
  try {
    const question = await Question.findByIdAndDelete(id); // TODO need to add deep delete
    return question;
  } catch (error) {
    throw new Error(error)
  }
}
