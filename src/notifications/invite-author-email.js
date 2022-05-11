import hbs from 'nodemailer-express-handlebars';
import {transporter, handlebarOptions} from './nodemailer-base-config.js';

export async function sendInviteToAuthor(user, password) {
    try {
        transporter.use('compile', hbs(handlebarOptions))

        const mailOptions = {
            port: process.env.MAIL_PORT,
            from: process.env.MAIL_USERNAME,
            to: user.email,
            subject: 'Invite',
            template: 'email-author-admin',
            context: {
                name: user.firstName,
                email: user.email,
                password: password,
            }
        }
        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new Error(error)
    }
}


