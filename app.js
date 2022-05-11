import express, { json, urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import { connectToDb } from './db.js';
import cors from 'cors';
import bodyParser from "body-parser";
import fileUpload  from 'express-fileupload';

const app = express();
const port = process.env.PORT || 3000

import { authenticateJWT, checkRole } from './src/middlewares/auth.middleware.js';
import { lastActivity } from './src/middlewares/activity.middleware.js';

import userRouter from './src/routes/users.js';
import authorRoute from './src/routes/authors.js';
import assessmentRouter from './src/routes/assessments.js';
import testRouter from './src/routes/tests.js';
import questionRouter from './src/routes/questions.js';
import authRouter from './src/routes/auth.js';
import countryRoute from './src/routes/countiries.js';
import employees from "./src/routes/employees.js";

app.use(cors())
app.use('/uploads', express.static('uploads'));
const urlencodedParser = bodyParser.urlencoded({extended: false})

//connect to db
connectToDb()

app.use(fileUpload({
  createParentPath: true
}));

app.use(json());
app.use(urlencoded({ extended: false }));
app.use(urlencodedParser)
app.use(cookieParser());

app.use('/users', authenticateJWT, lastActivity, userRouter);
app.use('/authors', authenticateJWT, lastActivity, authorRoute);
app.use('/assessments',authenticateJWT,lastActivity, assessmentRouter);
app.use('/tests', authenticateJWT, lastActivity, testRouter);
app.use('/countries', countryRoute);
app.use('/questions', authenticateJWT, lastActivity, questionRouter);
app.use('/employees', employees);
app.use('/auth', authRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`)
});

// health check
app.get('/', async function (req, res) {
  return res.status(200).send('Health Check!');
})
