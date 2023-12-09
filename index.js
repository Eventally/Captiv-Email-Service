const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = 3000;

const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage: storage });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const emailUser = process.env.user;
const emailPass = process.env.pass;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailUser,
        pass: emailPass,
    },
});

app.post('/sendEmail', upload.array('attachments', 3), (req, res) => {
    const { to, subject, text } = req.body;
    const attachments = req.files.map(file => ({
        filename: file.originalname,
        content: file.buffer.toString('base64'),
    }));

    const emailOptions = {
        from: emailUser,
        to,
        subject,
        text,
        attachments,
    };

    transporter.sendMail(emailOptions, (error, info) => {
        res.setHeader('Content-Type', 'application/json');

        if (error) {
            console.error('Error sending email:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200).json({ message: 'Email sent successfully' });
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
