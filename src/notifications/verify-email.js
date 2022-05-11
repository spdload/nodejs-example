import hbs from 'nodemailer-express-handlebars';
import {transporter, handlebarOptions} from './nodemailer-base-config.js';
import bcrypt from "bcryptjs";

export async function sendVerifyEmail(user) {
    try {
        const url = `${process.env.FRONTEND_APP_URL}/`
            + `${process.env.FRONTEND_EMAIL_VERIFICATION_ROUTE}/`
            + `?id=${user._id}`
            + `&hash=${await bcrypt.hash(user.email, 5)}`;

        transporter.use('compile', hbs(handlebarOptions))

        const mailOptions = {
            port: process.env.MAIL_PORT,
            from: process.env.MAIL_USERNAME,
            to: user.email,
            subject: 'Verify Email',
            template: 'email-verification',
            context: {
                name: user.firstName,
                url: url,
            }
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new Error(error)
    }
};


