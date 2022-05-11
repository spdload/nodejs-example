import nodemailer from "nodemailer";
import path from "path";

export const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    service: process.env.MAIL_SERVICE,
    port: process.env.MAIL_PORT,
    secure: true,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
    },
});

export const handlebarOptions = {
    viewEngine: {
        partialsDir: path.resolve('./views/emails/'),
        defaultLayout: false,
    },
    viewPath: path.resolve('./views/emails/'),
};