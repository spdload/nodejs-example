import { Router } from 'express';
import { 
  getQuestions,
  getQuestionById,
  createQuestions,
  updateQuestionById,
  deleteQuestionById
} from '../services/question.service.js';
import { checkRole } from '../middlewares/auth.middleware.js';
import { USER_ROLES } from '../enums/user.enums.js';


const router = Router();

//TODO access
router.get('/', async function(req, res) {
  try {
    const questions = await getQuestions(req.query);
    return res.status(200).send(questions);
  } catch (error) {
    console.error(error);
    return res.status(422).json({
      'message': "Cant get questions",
      error
    });
  }
});

//TODO access
router.get('/:questionId', async function(req, res) {
  try {
    const questionId = req.params.questionId;
    const question = await getQuestionById(questionId);
    return res.status(200).send(question);
  } catch (error) {
    console.error(error);
    return res.status(422).json({
      'message': "Cant get question by id",
      error
    });
  }
});

router.post('/', async function(req, res) {
  try {
    const questionData = req.body.data;
    questionData.author = req.user.id;
    const question = await createQuestions(questionData);
    return res.status(200).send(question);
  } catch (error) {
    console.error(error);
    return res.status(422).json({
      'message': "Cant create question",
      error
    });
  }
});

router.put('/:questionId', checkRole([
  USER_ROLES.EMPLOYER,
  USER_ROLES.ADMIN,
  USER_ROLES.AUTHOR
]), async function(req, res) {
  try {
    const questionId = req.params.questionId;
    const questionData = req.body.data;
    const question = await updateQuestionById(questionId, questionData);
    return res.status(200).send(question);
  } catch (error) {
    console.error(error);
    return res.status(422).json({
      'message': "Cant update question by id",
      error
    });
  }
});

router.delete('/:questionId', checkRole([
  USER_ROLES.EMPLOYER,
  USER_ROLES.ADMIN,
  USER_ROLES.AUTHOR
]), async function(req, res) {
  try {
    const questionId = req.params.questionId;
    const question = await deleteQuestionById(questionId);
    return res.status(200).send(question);
  } catch (error) {
    console.error(error);
    return res.status(422).json({
      'message': "Cant delete question",
      error
    });
  }
});

export default router;
