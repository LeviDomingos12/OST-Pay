import express from "express";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Increase request size limit to support sending base64-encoded PDF attachments
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Lazily initialize / obtain nodemailer transporter
async function getMailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    console.log(`[SMTP] Utilizing configured SMTP server: ${host}:${port}`);
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });
  } else {
    console.log("[SMTP] Missing custom credentials in process.env. Creating a dynamic Ethereal test SMTP account...");
    try {
      const testAccount = await nodemailer.createTestAccount();
      console.log(`[SMTP] Created Ethereal SMTP Test Account: ${testAccount.user}`);
      return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (err) {
      console.error("[SMTP] Failed to create Ethereal test SMTP account. Falling back to log-only transporter.", err);
      // Fallback log transport
      return {
        sendMail: async (options: any) => {
          console.log("================= SIMULATED SMTP SEND ==================");
          console.log(`To: ${options.to}`);
          console.log(`Subject: ${options.subject}`);
          console.log(`Has Attachment: ${!!options.attachments?.length}`);
          console.log("========================================================");
          return { messageId: "mock-id-" + Date.now(), testUrl: "https://ethereal.email" };
        }
      } as any;
    }
  }
}

// API Route: Send Email with attachment
app.post("/api/send-email", async (req, res) => {
  const { to, subject, html, text, attachment, smtpConfig } = req.body;

  if (!to) {
    return res.status(400).json({ success: false, error: "Destinatário ('to') em falta." });
  }

  try {
    let transporter;
    let senderAddress = process.env.SMTP_FROM || `"Organização Social do Trabalho" <no-reply@ost-mocambique.org>`;
    let isCustomSmtp = false;

    if (smtpConfig && smtpConfig.host && smtpConfig.user && smtpConfig.password) {
      const port = smtpConfig.port ? parseInt(smtpConfig.port, 10) : 587;
      console.log(`[SMTP] Dynamic Custom SMTP Config provided: ${smtpConfig.host}:${port} (${smtpConfig.user})`);
      transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: port,
        secure: smtpConfig.secure !== undefined ? smtpConfig.secure : (port === 465),
        auth: {
          user: smtpConfig.user,
          pass: smtpConfig.password,
        },
      });
      isCustomSmtp = true;
      if (smtpConfig.senderEmail) {
        senderAddress = smtpConfig.senderName 
          ? `"${smtpConfig.senderName}" <${smtpConfig.senderEmail}>`
          : smtpConfig.senderEmail;
      }
    } else {
      transporter = await getMailTransporter();
    }
    
    const mailOptions: any = {
      from: senderAddress,
      to,
      subject: subject || "Crachá e Recibo Oficial - OST Moçambique",
      text: text || "Olá,\n\nSegue em anexo o documento oficial em formato PDF.\n\nAtenciosamente,\nOrganização Social do Trabalho",
      html: html || undefined,
    };

    if (attachment && attachment.filename && attachment.content) {
      // Decode base64 content if it starts with data URI scheme
      let base64Content = attachment.content;
      if (base64Content.includes("base64,")) {
        base64Content = base64Content.split("base64,")[1];
      }
      
      mailOptions.attachments = [
        {
          filename: attachment.filename,
          content: Buffer.from(base64Content, "base64"),
          contentType: "application/pdf"
        }
      ];
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP] Email successfully sent to ${to}. Message ID: ${info.messageId}`);
    
    // Check if test account was used (Ethereal returns test inbox URL)
    const previewUrl = nodemailer.getTestMessageUrl(info);

    res.json({
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || null,
      usingTestAccount: !isCustomSmtp && !process.env.SMTP_HOST
    });
  } catch (error: any) {
    console.error("[SMTP] Error sending email:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Falha ao processar ou enviar e-mail." 
    });
  }
});

// ==========================================
// REAL & FUNCTIONAL ADMIN AUTHORIZATION API
// ==========================================

interface AdminRequest {
  email: string;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
}

const pendingAdminRequests = new Map<string, AdminRequest>();

// Clean up requests older than 15 minutes every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, req] of pendingAdminRequests.entries()) {
    if (now - req.createdAt > 15 * 60 * 1000) {
      pendingAdminRequests.delete(token);
    }
  }
}, 5 * 60 * 1000);

// 1. Request access (from requested device)
app.post("/api/admin/request-access", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: "Endereço de e-mail em falta." });
  }

  const token = "OST-AUTH-REQT-" + Math.floor(100000 + Math.random() * 900000);
  pendingAdminRequests.set(token, {
    email,
    status: "pending",
    createdAt: Date.now()
  });

  console.log(`[Admin Auth] Access request created for ${email}. Token: ${token}`);
  res.json({ success: true, token });
});

// 2. Fetch request info (from authorizing admin device)
app.get("/api/admin/request-info", (req, res) => {
  const { token } = req.query;
  if (!token || typeof token !== "string") {
    return res.status(400).json({ success: false, error: "Token inválido ou em falta." });
  }

  const request = pendingAdminRequests.get(token);
  if (!request) {
    return res.status(404).json({ success: false, error: "A solicitação de acesso não existe ou já expirou (limite de 15 min)." });
  }

  res.json({
    success: true,
    email: request.email,
    status: request.status,
    createdAt: request.createdAt
  });
});

// 3. Approve access request with master admin password (from authorizing admin device)
app.post("/api/admin/approve-request", (req, res) => {
  const { token, secretKey } = req.body;
  const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || "OST_ADMIN_2026";

  if (!token) {
    return res.status(400).json({ success: false, error: "Token em falta." });
  }

  if (!secretKey) {
    return res.status(400).json({ success: false, error: "Chave Secreta de Administração em falta." });
  }

  if (secretKey !== ADMIN_SECRET_KEY) {
    return res.status(401).json({ success: false, error: "Chave Secreta de Administração incorreta." });
  }

  const request = pendingAdminRequests.get(token);
  if (!request) {
    return res.status(404).json({ success: false, error: "A solicitação de acesso não existe ou já expirou." });
  }

  request.status = "approved";
  pendingAdminRequests.set(token, request);

  console.log(`[Admin Auth] Access request approved successfully for ${request.email} using Token ${token}`);
  res.json({ success: true, message: "Solicitação aprovada e autorizada com sucesso!" });
});

// 4. Instant verification of secret key (for quick direct login)
app.post("/api/admin/verify-secret", (req, res) => {
  const { secretKey } = req.body;
  const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || "OST_ADMIN_2026";

  if (!secretKey) {
    return res.status(400).json({ success: false, error: "Chave Secreta de Administração em falta." });
  }

  if (secretKey === ADMIN_SECRET_KEY) {
    console.log(`[Admin Auth] Direct secret key verification succeeded.`);
    res.json({ success: true, message: "Chave Secreta correta! Acesso de Administrador concedido." });
  } else {
    res.status(401).json({ success: false, error: "Chave Secreta de Administração incorreta." });
  }
});

// Configure Vite or Static Asset delivery
async function setupFrontend() {
  if (process.env.NODE_ENV !== "production") {
    console.log("[Server] Registering Vite development middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[Server] Serving production static assets from dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

setupFrontend().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Server successfully listening at http://0.0.0.0:${PORT}`);
  });
});
