const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const app = express();
const upload = multer({ dest: 'uploads/' }); // Pasta temporária para os PDFs

app.use(express.static('public')); // Serve a View (HTML)

app.post('/send-email', upload.array('pdfs', 2), async (req, res) => {
    const files = req.files;

    // Configuração do Transportador (Ex: Gmail)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'maguinho@gmail.com',
            pass: 'password' // Use Senhas de App do Google
        }
    });

    const mailOptions = {
        from: 'maguinho@gmail.com',
        to: 'cfm@jfpr.jus.br',
        subject: 'Envio Mensal de Relatórios',
        text: 'Olá, seguem os arquivos PDF anexo conforme o padrão mensal.',
        attachments: files.map(file => ({
            filename: file.originalname,
            path: file.path
        }))
    };

    try {
        await transporter.sendMail(mailOptions);
        res.send('E-mail enviado com sucesso!');
    } catch (error) {
        res.status(500).send('Erro ao enviar: ' + error.message);
    }
});

app.listen(3000, () => console.log('Servidor rodando em http://localhost:3000'));