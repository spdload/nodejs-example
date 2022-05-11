import hbs from 'nodemailer-express-handlebars';
import {transporter, handlebarOptions} from './nodemailer-base-config.js';

export async function sendInviteAssessment(user) {
    try {
        const url = `${process.env.FRONTEND_APP_URL}/`
            + `${process.env.FRONTEND_ASSESMENTS}`;

        transporter.use('compile', hbs(handlebarOptions))

        const mailOptions = {
            port: process.env.MAIL_PORT,
            from: process.env.MAIL_USERNAME,
            to: user.email,
            subject: 'Assessment Invite',
            template: 'email-invite-assessment',
            context: {
                name: user.firstName,
                url: url,
            }
        }
        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new Error(error)
    }
}


