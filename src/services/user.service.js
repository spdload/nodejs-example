import User from '../models/user.model.js';
import {hashPassword} from '../services/auth.service.js';
import moment from 'moment';

import {sendVerifyEmail} from '../notifications/verify-email.js';
import {USER_ROLES, USER_STATUSES} from "../enums/user.enums.js";
import {sendInviteAssessment} from "../notifications/invite-assessment-email.js";
import {sendInviteToAuthor} from "../notifications/invite-author-email.js";

export async function getUsers(params = {}) {
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
      data.users = await User.find({ $and: [ { $or: [
        {firstName: new RegExp(search, 'i') },
        {lastName: new RegExp(search, 'i')},
        {email: new RegExp(search, 'i')},
      ] } ] }).sort(sortBy).limit(perPage).skip(skip);
    } else {
      data.users = await User.find(params).sort(sortBy).limit(perPage).skip(skip);
      data.users.count = await User.find(params).sort(sortBy).skip(skip).count();
    }
    data.currentPage = (perPage + skip) / perPage;
    data.totalPages = Math.ceil(data.users.count / perPage);

  } catch (error) {
    throw new Error(error)
  }
  return data;
}

export async function getUserById(id) {
  try {
    const user = await User.findById(id);
    return user;
  } catch (error) {
    throw new Error(error)
  }
}

export async function createUser(data) {
    try {
        const newData = {...data};
        const hasPassword = await hashPassword(data.password);
        newData.password = hasPassword;
        const user = await User.create({
          createdAt: moment(),
          verifiedAt: null,
          ...newData,
        });

        await sendVerifyEmail(user);

        return user;
    } catch (error) {
        throw new Error(error)
    }
}

export async function updateUserById(id, data) {
  try {
    const updatedAt = moment();
    const user = await User.findByIdAndUpdate(id,
      { $set: { updatedAt, ...data }},
      { new: true }
    );
    return user;
  } catch (error) {
    throw new Error(error)
  }
}

export async function updateLoginDate(user) {
  try {
    await user.updateOne({'lastLoginAt': moment()});
  } catch (error) {
    throw new Error(error)
  }
}

export async function deleteUserById(id) {
  try {
    // soft delete
    const deletedAt = moment();
    const user = await User.findByIdAndUpdate(id,
      { $set: { deletedAt, status: 'deleted' }},
      { new: true }
    );
    return user;
  } catch (error) {
    throw new Error(error)
  }
}

export async function createOrInviteCandidate(data)
{
  try {
    let user = await User.findOne({'email': data.email})
    if (user){
      await sendInviteAssessment(user);
      return user;
    }
    user = await User.create({createdAt: moment(), verifiedAt: null, role: USER_ROLES.CANDIDATE, ...data});
    await sendInviteAssessment(user);

    return user;
  } catch (error) {
    throw new Error(error)
  }
}

export async function createEmployee(data) {
  try {
    return await User.create({
      createdAt: moment(),
      role: USER_ROLES.EMPLOYER,
      status: USER_STATUSES.NEW,
      ...data
    });
  } catch (error) {
    throw new Error(error)
  }
}
export async function createAuthor(data)
{
  try {
    const newData = {...data};
    const password = Math.random().toString(36).substr(2, 8)
    const hasPassword = await hashPassword(password);
    newData.password = hasPassword;
    const user = await User.create({createdAt: moment(), verifiedAt: null, role: USER_ROLES.AUTHOR, ...data});

    await sendInviteToAuthor(user, password)
    await sendVerifyEmail(user);

    return user;
  } catch (error) {
    throw new Error(error)
  }
}