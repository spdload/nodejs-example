import hbs from 'nodemailer-express-handlebars';
import {transporter, handlebarOptions} from './nodemailer-base-config.js';

export async function sendConfirmEmail(user) {
    try {
        transporter.use('compile', hbs(handlebarOptions))

        const mailOptions = {
            port: process.env.MAIL_PORT,
            from: process.env.MAIL_USERNAME,
            to: user.email,
            subject: 'Confirm employee request',
            template: 'confirm-employee-request',
            context: {
                name: user.firstName,
            }
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new Error(error)
    }
};


