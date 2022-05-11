import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {userProfileResource} from "../resources/user.resource.js";
import moment from "moment";
import User from '../models/user.model.js';

const JWT_SECRET = process.env.JWT_SECRET;

export async function login(user, password) {
    try {
        const login = await comparePass(password, user.password);

        if (!login) throw new Error('Wrong password');

        return userInfo(user);

    } catch (error) {
        throw new Error('Logginning failed', error)
    }
};

export async function userInfo(user) {
    return {
        token: await generateToken(user),
        user: await userProfileResource(user)
    }
}

export async function hashPassword(password) {
    try {
        // const salt = await bcrypt.genSalt(6);
        // const hash = await bcrypt.hash(password);
        return await bcrypt.hash(password, 10);
    } catch (error) {
        throw new Error('Hashing failed', error)
    }
};

export async function comparePass(password, hash) {
    try {
        return await bcrypt.compare(password, hash);
    } catch (error) {
        throw new Error('Comparing failed', error)
    }
};

export async function generateToken(user) {
    return jwt.sign({
        id: user._id,
        name: user.name,
        lastName: user.lastName,
        middleName: user.middleName,
        role: user.role,
        status: user.status,
        device: user.device
    }, JWT_SECRET, {expiresIn: '2h'});
};

export async function verifyEmail(user, hash) {
    try {
        if (!await bcrypt.compare(user.email, hash)) {
            return false
        }
        await user.updateOne({verifiedAt: moment()});
        return true
    } catch (error) {
        throw new Error(error)
    }
}

export async function resetPassword(email, newPassword, hash) {
    try {

        if (!await bcrypt.compare(email, hash)) {
            return false
        }
        await User.findOneAndUpdate({'email': email}, {
            'password': await hashPassword(newPassword),
        })

        return true;
    } catch (error) {
        throw new Error(error)
    }
}
