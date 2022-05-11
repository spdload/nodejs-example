import { questionResourceCollections } from './question.resource.js'
import { map } from 'modern-async';

export async function testResource(test) {
  return {
    id: test._id,
    testName: test.testName,
    testCategory: test.testCategory,
    testPurpose: test.testPurpose,
    testSummary: test.testSummary,
    testDescription: test.testDescription,
    language: test.language,
    jobRoles: test.jobRoles,
    testDifficulty: test.testDifficulty,
    totalQuestions: test.questions.length ?? null,
    isShuffleAllAnswers: test.isShuffleAllAnswers,
    isShuffleQuestions: test.isShuffleQuestions,
    lastUpdated: test.lastUpdated,
    releaseNotes: test.releaseNotes,
    previousVersion: test.previousVersion ?? null,
    version: test.version,
    nextVersion: test.nextVersion ?? null,
    testAuthor: test.testAuthor,
    queueId: test.queueId,
    status: test.status,
    createdAt: test.createdAt ?? null,
    questions: await questionResourceCollections(test.questions)
  };
};

export async function testResourceCollections(tests) {
  return await map(tests, async (test) => {
      return await testResource(test)
  });
};

export async function draftTestResource(test) {
  return {
    id: test._id,
    testName: test.testName ?? null,
    testCategory: test.testCategory ?? null,
    testPurpose: test.testPurpose ?? null,
    testSummary: test.testSummary ?? null,
    testDescription: test.testDescription ?? null,
    language: test.language ?? null,
    jobRoles: test.jobRoles ?? null,
    testDifficulty: test.testDifficulty ?? null,
    totalQuestions: test.questions ? test.questions.length : null,
    isShuffleAllAnswers: test.isShuffleAllAnswers ?? null,
    isShuffleQuestions: test.isShuffleQuestions ?? null,
    releaseNotes: test.releaseNotes ?? null,
    previousVersion: test.previousVersion ?? null,
    version: test.version ?? null,
    nextVersion: test.nextVersion ?? null,
    testAuthor: test.testAuthor ?? null,
    queueId: test.queueId ?? null,
    status: test.status,
    questions: test.questions ? await questionResourceCollections(test.questions) : null,
    createdAt: test.createdAt ?? null,
    lastUpdated: test.lastUpdated ?? null,
  };
};

export async function draftTestResourceCollections(tests) {
  return await map(tests, async (test) => {
      return await draftTestResource(test)
  });
};
