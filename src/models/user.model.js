import pkg from 'mongoose';
import { USER_ROLES, USER_STATUSES, SEX_TYPES } from '../enums/user.enums.js';

const { Schema: _Schema, model } = pkg;
const Schema = _Schema;

let user = new Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    title: String,
    image: String,
    biography: String,
    linkedIn: String,
    facebook: String,
    behance: String,
    dribbble: String,
    website: String,
    companyName: {
        type: String,
        default: null
    },
    age: Number,
    country: {name: String, code: String},
    companyLogo : String,
    sex: {
      type: String,
      enum: Object.values(SEX_TYPES)
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.AUTHOR
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUSES),
      default: USER_STATUSES.ACTIVE
    },
    createdAssessments: [{
      type: _Schema.Types.ObjectId,
      ref: 'assessments'
    }],
    assessmentsResults: [{
      type: _Schema.Types.ObjectId,
      ref: 'results'
    }],
    lastActivityAt: {
        type: Date,
        default: null,
    },
    lastLoginAt: {
        type: Date,
        default: null,
    },
    createdAt: Date,
    verifiedAt: Date,
    updatedAt: Date,
    deletedAt: Date,
  }
);

export default model("users", user);
