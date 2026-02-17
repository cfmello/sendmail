require('dotenv').config(); // Carrega as variáveis do .env logo no topo
const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/send-email', upload.array('pdfs', 2), async (req, res) => {
    // Usando as variáveis de ambiente
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_TO,
        subject: 'Envio Mensal de Relatórios',
        text: 'Olá, seguem os arquivos PDF anexo conforme o padrão mensal.',
        attachments: req.files.map(file => ({
            filename: file.originalname,
            path: file.path
        }))
    };

    try {
        await transporter.sendMail(mailOptions);
        res.send('E-mail enviado com sucesso!');
    } catch (error) {
        res.status(500).send('Erro: ' + error.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));