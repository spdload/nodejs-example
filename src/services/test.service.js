import _ from 'lodash';
import Test from '../models/test.model.js';
import Question from '../models/question.model.js';
import moment from 'moment';
import {
  createQuestions,
  updateQuestions
} from './question.service.js';

export async function getTests(params = {}) {
  const data = {};

  const sortBy = params.sortBy;
  const search = params.search;
  const perPage = params.perPage ? parseInt(params.perPage, 10) : 10;
  const skip = params.skip ? parseInt(params.skip, 10) : 0;

  delete params.sortBy;
  delete params.search;
  delete params.perPage;
  delete params.skip;
  let tests;
  const populatedTests = [];
  try {
    if (search) {
      tests = await Test.find({ $and: [ 
        { status: { $ne: 'draft' } },
        { $or: [
          { testName: new RegExp(search, 'i') },
        ] }
    ] }).sort(sortBy).limit(perPage).skip(skip);
    } else {
      tests = await Test.find({...params, status: { $ne: 'draft' }}).sort(sortBy).limit(perPage).skip(skip);
    }
    for (let index = 0; index < tests.length; index++) {
      const element = tests[index];
      await element.populate('questions')
      await element.populate('questions.answers')
      await element.populate('testAuthor');
      populatedTests.push(element);
    }
    data.tests = populatedTests;
    data.page = (perPage + skip) / perPage;
    data.total = await Test.countDocuments();
    return data;
  } catch (error) {
    throw new Error(error)
  }
}

export async function getTestById(id) {
  try {
    const test = await Test.findById(id);
    await test.populate('questions');
    await test.populate('questions.answers');
    await test.populate('testAuthor');
    return test;
  } catch (error) {
    throw new Error(error)
  }
}

export async function getTestByAuthor(authorId) {
  try {
    const data = {};
    const tests = await Test.find({ testAuthor: authorId });
    const populatedTests = [];
    for (let index = 0; index < tests.length; index++) {
      const element = tests[index];
      await element.populate('questions')
      await element.populate('questions.answers')
      await element.populate('testAuthor');
      populatedTests.push(element);
    }
    data.tests = populatedTests;
    return data;
  } catch (error) {
    throw new Error(error)
  }
}

export async function getDraftTestByAuthor(authorId) {
  try {
    const data = {};
    const tests = await Test.find({ testAuthor: authorId, status: 'draft' });
    const populatedTests = [];
    for (let index = 0; index < tests.length; index++) {
      const element = tests[index];
      await element.populate('questions')
      await element.populate('questions.answers')
      await element.populate('testAuthor');
      populatedTests.push(element);
    }
    data.tests = populatedTests;
    return data;
  } catch (error) {
    throw new Error(error)
  }
}

export async function createTest(data) {
  try {
    const createdAt = moment();
    const testData = data.test;
    let questionsIds;
    if(testData.questions){
      const questions = await createQuestions(testData);
      const gruppedQuestions = _.groupBy(questions, '_id')
      questionsIds = Object.keys(gruppedQuestions)
    };
    delete testData.questions;
    const test = await Test.create({
      testAuthor: data.testAuthor,
      questions: questionsIds ?? null,
      createdAt,
      ...testData
    });
    await test.populate('questions');
    await test.populate('questions.answers');
    await test.populate('testAuthor');
    return test;
  } catch (error) {
    throw new Error(error)
  }
}

export async function updateTestById(id, data) {
  try {
    const updatedAt = moment();
    const testData = data.test;
    const questionsData = testData.questions;
    const questionIds = await updateQuestions(questionsData);

    delete testData.questions;
    delete testData.testAuthor;

    const test = await Test.findByIdAndUpdate(id,
      { $set: { updatedAt, questions: questionIds, ...testData }}, 
      { new: true }
    );
    await test.populate('questions');
    await test.populate('questions.answers');
    await test.populate('testAuthor');
    return test;
  } catch (error) {
    throw new Error(error)
  }
}

export async function deleteTestById(id) {
  try {
    const test = await Test.findByIdAndDelete(id);
    return test;
  } catch (error) {
    throw new Error(error)
  }
}

export async function updateVersion(data, id) {
  try {
    const createdAt = moment();
    const testData = data.test;
    const questions = await createQuestions(testData);
    const gruppedQuestions = _.groupBy(questions, '_id')
    delete testData.questions;
    const testVersion = testData.version;
    delete testData.version;
    const test = await Test.create({
      questions: Object.keys(gruppedQuestions),
      createdAt,
      previousVersion: id,
      version: testVersion + 1,
      ...testData
    });
    await test.populate('questions');
    await test.populate('questions.answers');
    await test.populate('testAuthor');
    await Test.findByIdAndUpdate(id,
      { $set: { nextVersion: test._id }}
    );
    return test;
  } catch (error) {
    throw new Error(error)
  }
}
