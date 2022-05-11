import {Router} from 'express';
import {
    createUser,
    getUserById,
    getUsers,
    updateLoginDate,
    updateUserById
} from '../services/user.service.js';
import {login, userInfo, verifyEmail, resetPassword} from '../services/auth.service.js';
import User from '../models/user.model.js';
import {sendResentPasswordLink} from '../notifications/reset-password-email.js';

import {body, validationResult} from 'express-validator';
import {sendVerifyEmail} from "../notifications/verify-email.js";

const router = Router()

router.post('/login', async function (req, res) {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const { users: [user] } = await getUsers({ email: email });

        if (!user) return res.status(422).json({
            'message': 'These credentials do not match our records.'
        });
        const userInfo = await login(user, password);
        await updateLoginDate(user)

        return res.status(200).send(userInfo);
    } catch (error) {
        return res.status(403).json({
            'message': 'These credentials do not match our records.'
        });
    }
});

router.post('/register', [
    body('firstName').exists().withMessage('First name is require')
        .isLength({min: 2, max: 255})
        .withMessage('The first name should not have more than 255 characters'),
    body('lastName').exists().withMessage('Last name is require')
        .isLength({min: 2, max: 255})
        .withMessage('The last name should not have more than 255 characters'),
    body('email').exists().withMessage('Email is require')
        .isLength({max: 255}).withMessage('The email should not have more than 255 characters')
        .isEmail().withMessage('The email must be a valid email address.')
        .custom(value => {
            return User.findOne({email: value}).then(user => {
                if (user) {
                    return Promise.reject('E-mail already in use');
                }
            });
        }),
    body('password').exists().withMessage('Password is require')
        .isLength({max: 255}).withMessage('The password should not have more than 255 characters'),
    body('passwordConfirmation').exists().withMessage('Confirm Password is require')
        .isLength({max: 255}).withMessage('The confirm password should not have more than 255 characters')
        .custom(async (confirmPassword, {req}) => {
            const password = req.body.password
            if (password !== confirmPassword) {
                throw new Error('Passwords must be same')
            }
        }),
], async function (req, res) {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).json(errors.array());
        }

        const user = await createUser(req.body);
        return res.status(200).send(await userInfo(user));
    } catch (error) {
        return res.status(403).send(error);
    }
});

router.post('/email/verify', [
    body('id').exists().withMessage('Id is require'),
    body('hash').exists().withMessage('Hash is require'),
], async function (req, res) {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).json(errors.array());
        }

        const user = await getUserById(req.body.id)

        if (await verifyEmail(user, req.body.hash)) {
            return res.status(200).send({
                'message': "Email is verified"
            });
        }

        return res.status(422).send({
            'message': "Email is not verify"
        });

    } catch (error) {
        return res.status(403).send(error);
    }
});

router.post('/email/resend/:userId', async function (req, res) {
    try {
        const userId = req.params.userId;
        const user = await getUserById(userId);

        await sendVerifyEmail(user)

        return res.status(200).json({
            'message': "We have e-mailed your verification email link!",
        });

    } catch (error) {
        return res.status(422).json({
            'message': "Email verification is not sent, please try again later",
        });
    }
});

router.post('/password/email', [
    body('email').exists().withMessage('Email is require')
        .isLength({max: 255}).withMessage('The email should not have more than 255 characters')
        .isEmail().withMessage('The email must be a valid email address.')
], async function (req, res) {
    try {
        const email = req.body.email;
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).json(errors.array());
        }

        await sendResentPasswordLink(email)

        return res.status(200).json({
            'message': "We have e-mailed your password reset link!",
        });

    } catch (error) {
        return res.status(422).json({
            'message': "Password reset link is not sent, please try again later",
        });
    }
});

router.post('/password/reset', [
    body('email').exists().withMessage('Email is require')
        .isLength({max: 255}).withMessage('The email should not have more than 255 characters')
        .isEmail().withMessage('The email must be a valid email address.'),
    body('hash').exists().withMessage('Hash is require'),
    body('password').exists().withMessage('Password is require')
        .isLength({max: 255}).withMessage('The password should not have more than 255 characters'),
    body('passwordConfirmation').exists().withMessage('Confirm Password is require')
        .isLength({max: 255}).withMessage('The confirm password should not have more than 255 characters')
        .custom(async (confirmPassword, {req}) => {
            const password = req.body.password
            if (password !== confirmPassword) {
                throw new Error('Passwords must be same')
            }
        }),
], async function (req, res) {
    try {
        const email = req.body.email;
        const newPassword = req.body.password;
        const hash = req.body.hash;
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).json(errors.array());
        }

        if (await resetPassword(email, newPassword, hash)) {
            return res.status(200).json({
                'message': "Your password has been updated!",
            });
        }

        return res.status(200).json({
            'message': "Password is not updated",
        });

    } catch (error) {
        console.log(error)
        return res.status(422).json({
            'message': "Password is not updated",
        });
    }
});

export default router;
