import hbs from 'nodemailer-express-handlebars';
import {transporter, handlebarOptions} from './nodemailer-base-config.js';
import bcrypt from "bcryptjs";

export async function sendDeclineEmail(user) {
    try {
        transporter.use('compile', hbs(handlebarOptions))

        const mailOptions = {
            port: process.env.MAIL_PORT,
            from: process.env.MAIL_USERNAME,
            to: user.email,
            subject: 'Decline employee request',
            template: 'decline-employee-request',
            context: {
                name: user.firstName,
            }
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new Error(error)
    }
};


