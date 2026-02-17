require('dotenv').config();
const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Garante que a pasta de uploads exista
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

app.use(express.static('public'));

/**
 * Função de Limpeza Inteligente
 * Apaga arquivos da pasta uploads que foram criados há mais de 60 dias.
 */
const limparArquivosAntigos = () => {
    const pastaUploads = './uploads';
    const sessentaDiasEmMs = 60 * 24 * 60 * 60 * 1000;
    const agora = Date.now();

    fs.readdir(pastaUploads, (err, files) => {
        if (err) return console.error("Erro ao ler pasta para limpeza:", err);

        files.forEach(file => {
            const filePath = path.join(pastaUploads, file);
            fs.stat(filePath, (err, stats) => {
                if (err) return console.error("Erro ao verificar arquivo:", err);

                // Se o arquivo for mais antigo que 60 dias, deleta
                if (agora - stats.mtimeMs > sessentaDiasEmMs) {
                    fs.unlink(filePath, (err) => {
                        if (err) console.error("Erro ao deletar arquivo antigo:", err);
                        else console.log(`Arquivo antigo removido: ${file}`);
                    });
                }
            });
        });
    });
};

app.post('/send-email', upload.array('pdfs', 2), async (req, res) => {
    try {
        const dataAtual = new Date();
        
        // 1. Assunto: 202602 - Boleto e Comprovante
        const ano = dataAtual.getFullYear();
        const mesNum = String(dataAtual.getMonth() + 1).padStart(2, '0');
        const assuntoDinamico = `${ano}${mesNum} - Boleto e Comprovante`;

        // 2. Corpo: fevereiro/26
        const mesesPorExtenso = [
            "janeiro", "fevereiro", "março", "abril", "maio", "junho",
            "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
        ];
        const mesExtenso = mesesPorExtenso[dataAtual.getMonth()];
        const anoCurto = String(ano).slice(-2);
        
        const corpoEmail = `Seguem anexos arquivos com o boleto e o comprovante de pagamento do condomínio com vencimento em ${mesExtenso}/${anoCurto}.\n\nAtt.\nCristhiano Mello`;

        // 3. Configuração do E-mail
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
            subject: assuntoDinamico,
            text: corpoEmail,
            attachments: req.files.map(file => ({
                filename: file.originalname,
                path: file.path
            }))
        };

        // 4. Envio
        await transporter.sendMail(mailOptions);

        // 5. Executa a limpeza de arquivos com mais de 2 meses
        limparArquivosAntigos();

        res.status(200).json({ message: 'Sucesso' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro no envio.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Rodando em http://localhost:${PORT}`));