import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUserById,
  deleteUserById
} from '../services/user.service.js';
import {userProfileResource,userResourceCollections} from "../resources/user.resource.js";
import {body, validationResult} from "express-validator";
import {comparePass, hashPassword} from "../services/auth.service.js";
import {sendVerifyEmail} from "../notifications/verify-email.js";
import { checkRole } from '../middlewares/auth.middleware.js';
import { USER_ROLES } from '../enums/user.enums.js';


const router = Router();

router.get('/', checkRole([
  USER_ROLES.EMPLOYER,
  USER_ROLES.ADMIN
]), async function(req, res) {
  try {
    const data = await getUsers(req.query);
    return res.status(200).send({
      users: await userResourceCollections(data.users),
      currentPage: data.currentPage,
      totalPages: data.totalPages,
      count: data.count
    });
  } catch (error) {
    console.error(error);
    return res.status(422).json({
      message: "Cant get users",
      error
    });
  }
});

router.get('/:userId', async function(req, res) {
  if (
    req.user.role !== 'ADMIN' &&
    req.user.role !== 'EMPLOYER' &&
    req.user.id !== req.params.userId
  ) {
    return res.status(403).json({
      message: 'You dont have access'
    });
  }
  try {
    const userId = req.params.userId;
    const user = await getUserById(userId);
    return res.status(200).send(await userProfileResource(user));
  } catch (error) {
    console.error(error);
    return res.status(422).json({
      message: "Cant get user by ID",
      error
    });
  }
});

router.post('/', checkRole([
  USER_ROLES.EMPLOYER,
  USER_ROLES.ADMIN
]), async function(req, res) {
  try {
    const userData = req.body.data;
    const user = await createUser(userData);
    return res.status(200).send(await userProfileResource(user));
  } catch (error) {
    console.error(error);
    return res.status(422).json({
      message: "Cant create user",
      error
    });
  }
});

router.put('/:userId', 
[
  body('firstName')
      .optional()
      .isLength({max: 255}).withMessage('First Name should not have more than 255 characters'),
  body('lastName')
      .optional()
      .isLength({max: 255}).withMessage('Last Name should not have more than 255 characters'),
  body('companyName')
      .optional()
      .isLength({max: 255}).withMessage('company Name should not have more than 255 characters'),
  body('country')
      .optional()
      .isLength({max: 255}).withMessage('country should not have more than 255 characters'),
  body('email')
      .optional()
      .isLength({max: 255}).withMessage('Email should not have more than 255 characters')
      .isEmail().withMessage('The email must be a valid email address.'),
  body('confirmPassword')
      .optional()
      .isLength({max: 255}).withMessage('confirmPassword should not have more than 255 characters'),
  body('newPasswordConfirmation')
      .isLength({max: 255}).withMessage('The confirm password should not have more than 255 characters')
      .custom(async (newPasswordConfirmation, {req}) => {
        const newPassword = req.body.newPassword
        if (newPassword && newPassword !== newPasswordConfirmation) {
          throw new Error('New passwords must be same')
        }
      }),
], async function (req, res) {
  if (
    req.user.role !== 'ADMIN' &&
    req.user.role !== 'EMPLOYER' &&
    req.user.id !== req.params.userId
  ) {
    return res.status(403).json({
      message: 'You dont have access'
    });
  }
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json(errors.array());
    }

    const userId = req.params.userId;
    const userData = req.body;

    const user = await getUserById(userId);

    if (req.files && req.files.image) {
      const image = req.files.image;
      const filePath = './uploads/images/' + image.name;
      const fileUrl = '/uploads/images/' + image.name;
      await image.mv(filePath);
      await user.updateOne({image: fileUrl});
      return res.status(200).send(await userProfileResource(await getUserById(userId)));
    }
    if (req.files && req.files.companyLogo) {
      const companyLogo = req.files.companyLogo;
      const filePath = './uploads/images/' + companyLogo.name;
      const fileUrl = '/uploads/images/' + companyLogo.name;
      await companyLogo.mv(filePath);
      await user.updateOne({companyLogo: fileUrl});
      return res.status(200).send(await userProfileResource(await getUserById(userId)));
    }

    if (userData.newPassword && userData.confirmPassword ) {
      const confirmPassword = req.body.confirmPassword;
      const newPassword = req.body.newPassword;
      if (!await comparePass(confirmPassword, user.password)) {
        return res.status(422).json({
          message: 'Confirm Password is wrong',
        });
      }
      userData.password = await hashPassword(newPassword);
      await user.updateOne(userData);
      return res.status(200).send(await userProfileResource(await getUserById(userId)));
    }

    if (userData.email && userData.email !== user.email && await comparePass(req.body.confirmPassword, user.password)) {
      const email = userData.email;
      await user.updateOne({verifiedAt: null, email});
      await user.save();
      await sendVerifyEmail(await getUserById(user._id))

      return res.status(200).send(await userProfileResource(await getUserById(userId)));
    }
    ['newPassword', 'password', 'email', 'newPasswordConfirmation'].forEach(e => delete userData[e]);

    await user.updateOne(userData);
    return res.status(200).send(await userProfileResource(await getUserById(userId)));
  } catch (error) {
    console.error(error);
    return res.status(422).json({
      message: "Cant update user",
      error
    });
  }
});

router.delete('/:userId', async function(req, res) {
  if (
    req.user.role !== 'ADMIN' &&
    req.user.role !== 'EMPLOYER' &&
    req.user.id !== req.params.userId
  ) {
    return res.status(403).json({
      message: 'You dont have access'
    });
  }
  try {
    const userId = req.params.userId;
    const user = await deleteUserById(userId);
    return res.status(200).send(await userProfileResource(user));
  } catch (error) {
    console.error(error);
    return res.status(422).json({
      message: "Cant delete user",
      error
    });
  }
});


export default router;
