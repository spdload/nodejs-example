import hbs from 'nodemailer-express-handlebars';
import {transporter, handlebarOptions} from './nodemailer-base-config.js';
import bcrypt from "bcryptjs";

export async function sendResentPasswordLink(email) {
    try {

        const url = `${process.env.FRONTEND_APP_URL}/`
            + `${process.env.FRONTEND_PASSWORD_RESET_ROUTE}/`
            + `?email=${email}`
            + `&hash=${await bcrypt.hash(email, 5)}`;

        transporter.use('compile', hbs(handlebarOptions))

        const mailOptions = {
            port: process.env.MAIL_PORT,
            from: process.env.MAIL_USERNAME,
            to: email,
            subject: 'Reset Password',
            template: 'email-reset-password',
            context: {
                url: url,
            }
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(error)
        throw new Error(error)
    }
};



