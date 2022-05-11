import { Router } from 'express';
import { 
  getTests,
  getTestById,
  createTest,
  updateTestById,
  deleteTestById,
  updateVersion,
  getTestByAuthor,
  getDraftTestByAuthor
} from '../services/test.service.js';
import { checkRole } from '../middlewares/auth.middleware.js';
import { USER_ROLES } from '../enums/user.enums.js';
import {
  testResource,
  testResourceCollections,
  draftTestResource,
  draftTestResourceCollections
} from '../resources/test.resource.js';


const router = Router();

router.get('/', checkRole([
  USER_ROLES.EMPLOYER,
  USER_ROLES.ADMIN,
  USER_ROLES.AUTHOR
]), async function(req, res) {
  try {
    const data = await getTests(req.query);
    return res.status(200).send({
      tests: await testResourceCollections(data.tests),
      total: data.total,
      page: data.page
    });
  } catch (error) {
    console.error(error);
    return res.status(422).json({
      'message': "Cant get tests",
      error
    });
  }
});

router.get('/by-author', checkRole([
  USER_ROLES.ADMIN,
  USER_ROLES.AUTHOR
]), async function(req, res) {
  try {
    const data = await getTestByAuthor(req.user.id);
    return res.status(200).send(await draftTestResourceCollections(data.tests));
  } catch (error) {
    console.error(error);
    return res.status(422).json({
      'message': "Cant get tests for author",
      error
    });
  }
});

router.get('/draft/by-author', checkRole([
  USER_ROLES.ADMIN,
  USER_ROLES.AUTHOR
]), async function(req, res) {
  try {
    const data = await getDraftTestByAuthor(req.user.id);
    return res.status(200).send(await draftTestResourceCollections(data.tests));
  } catch (error) {
    console.error(error);
    return res.status(422).json({
      'message': "Cant get tests for author",
      error
    });
  }
});

//TODO access
router.get('/:testId', async function(req, res) {
  try {
    const testId = req.params.testId;
    const test = await getTestById(testId);
    return res.status(200).send(await testResource(test));
  } catch (error) {
    console.error(error);
    return res.status(422).json({
      'message': "Cant get test by id",
      error
    });
  }
});

router.post('/', checkRole([
  USER_ROLES.ADMIN,
  USER_ROLES.AUTHOR
]), async function(req, res) {
  try {
    const testData = req.body.data;
    testData.test.status = 'published';
    testData.testAuthor = req.user.id;
    const test = await createTest(testData);
    return res.status(200).send(await testResource(test));
  } catch (error) {
    console.error(error);
    return res.status(422).json({
      'message': "Cant create test",
      error
    });
  }
});

router.post('/draft', checkRole([
  USER_ROLES.ADMIN,
  USER_ROLES.AUTHOR
]), async function(req, res) {
  try {
    const testData = req.body.data;
    testData.testAuthor = req.user.id;
    testData.test.status = 'draft';
    const test = await createTest(testData);
    return res.status(200).send(await draftTestResource(test));
  } catch (error) {
    console.error(error);
    return res.status(422).json({
      'message': "Cant create draft test",
      error
    });
  }
});

router.put('/:testId', checkRole([
  USER_ROLES.ADMIN,
  USER_ROLES.AUTHOR
]), async function(req, res) {
  try {
    const testId = req.params.testId;
    const testData = req.body.data;
    const test = await updateTestById(testId, testData);
    if(!test) return res.status(400).json({message: `Test with id ${testId} not found`})
    return res.status(200).send(await testResource(test));
  } catch (error) {
    console.error(error);
    return res.status(422).json({
      'message': "Cant update test by id",
      error
    });
  }
});

router.post('/update-version/:testId', checkRole([
  USER_ROLES.EMPLOYER,
  USER_ROLES.ADMIN,
  USER_ROLES.AUTHOR
]), async function(req, res) {
  try {
    const testId = req.params.testId;
    const test = await updateVersion(req.body.data, testId);
    return res.status(200).send(await testResource(test));
  } catch (error) {
    console.error(error);
    return res.status(422).json({
      'message': "Cant update test version by id",
      error
    });
  }
});

router.delete('/:testId', checkRole([
  USER_ROLES.EMPLOYER,
  USER_ROLES.ADMIN,
  USER_ROLES.AUTHOR
]), async function(req, res) {
  try {
    const testId = req.params.testId;
    const test = await deleteTestById(testId);
    return res.status(200).send(await testResource(test));
  } catch (error) {
    console.error(error);
    return res.status(422).json({
      'message': "Cant delete test",
      error
    });
  }
});

export default router;
