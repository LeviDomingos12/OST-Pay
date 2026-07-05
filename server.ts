import express from "express";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDocs, getDoc, setDoc } from "firebase/firestore";

// Load environment variables
dotenv.config();

// Firebase Configuration for Server-side Expiry checking
const firebaseConfig = {
  apiKey: "AIzaSyCNP7EgQtepB0MUZHwx_TfezXQlUadO0l0",
  authDomain: "gen-lang-client-0548484633.firebaseapp.com",
  projectId: "gen-lang-client-0548484633",
  storageBucket: "gen-lang-client-0548484633.firebasestorage.app",
  messagingSenderId: "17051297331",
  appId: "1:17051297331:web:cc39fa3e3a3cc442f8a546"
};

const DB_ID = "ai-studio-ostpay-1a4c794b-652b-4618-b65b-6d0491074a7e";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, DB_ID);

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

// ==============================================================
// AUTOMATED EXPIRY NOTIFICATION SYSTEM (RUNS ONCE DAILY AT MIDNIGHT)
// ==============================================================

const decryptSmtpPassword = (obfuscated: string) => {
  if (!obfuscated) return "";
  try {
    const decoded = Buffer.from(obfuscated, 'base64').toString('utf-8');
    if (decoded.startsWith("OST-SECURE-SMTP-PASS:")) {
      return decoded.substring("OST-SECURE-SMTP-PASS:".length);
    }
    return obfuscated;
  } catch (e) {
    return obfuscated;
  }
};

const getExpiryStatus = (expiryDateStr?: string) => {
  if (!expiryDateStr) return { nearing: false, expired: false, daysLeft: 0 };
  const expiry = new Date(expiryDateStr);
  const now = new Date();
  
  // Set times to midnight for precise day calculation
  expiry.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { nearing: false, expired: true, daysLeft: diffDays };
  } else if (diffDays <= 30) {
    return { nearing: true, expired: false, daysLeft: diffDays };
  }
  return { nearing: false, expired: false, daysLeft: diffDays };
};

async function sendServerExpiryEmail(member: any, daysLeft: number, smtpConfig: any) {
  try {
    const subject = daysLeft < 0 
      ? `⚠️ Renovação Necessária: O seu Crachá Oficial OST Expirou (ID: ${member.id})`
      : `⏳ Aviso de Expiração: O seu Crachá Oficial OST expira em ${daysLeft} dias (ID: ${member.id})`;

    const appUrl = process.env.APP_URL || "https://ais-dev-rsralhx2t6knllq4fb673j-94713566817.europe-west2.run.app";

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; color: #1e293b; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #f59e0b; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 18px; letter-spacing: 1px; font-weight: bold;">ALERTA DE SEGURANÇA & VALIDADE</h1>
          <p style="color: #fef3c7; margin: 4px 0 0 0; font-size: 11px; font-weight: bold;">ORGANIZAÇÃO SOCIAL DO TRABALHO</p>
        </div>
        <div style="padding: 24px;">
          <p style="font-size: 15px; margin-top: 0;">Olá <strong>${member.name}</strong>,</p>
          
          ${daysLeft < 0 ? `
            <p style="color: #dc2626; font-weight: bold; font-size: 16px;">O seu crachá oficial de filiação expirou a ${member.expiryDate}.</p>
            <p>Para manter o seu estatuto de membro <strong>Ativo</strong> e garantir que o seu crachá seja validado com sucesso nos postos de controlo, é necessário efetuar a renovação da sua quota anual de filiação.</p>
          ` : `
            <p style="color: #d97706; font-weight: bold; font-size: 16px;">O seu crachá de membro expira em <strong>${daysLeft} dias</strong> (Data de validade: <strong>${member.expiryDate}</strong>).</p>
            <p>Recomendamos que efetue o pagamento da sua quota anual com antecedência para garantir o acesso ininterrupto aos serviços, eventos e validações em tempo real da OST.</p>
          `}
          
          <div style="background-color: #fffbeb; border: 1px solid #fef3c7; padding: 16px; border-radius: 12px; margin: 24px 0;">
            <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 13px; color: #92400e; border-bottom: 1px solid #fef3c7; padding-bottom: 6px;">RESUMO DA SUA CONTA</h3>
            <table style="width: 100%; text-align: left; font-size: 12px; border-collapse: collapse;">
              <tr>
                <td style="padding: 4px 0; color: #78350f; font-weight: bold; width: 40%;">ID de Membro:</td>
                <td style="padding: 4px 0; font-family: monospace; font-weight: bold;">${member.id}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #78350f; font-weight: bold;">Estado Atual:</td>
                <td style="padding: 4px 0;"><span style="background-color: ${daysLeft < 0 ? '#fee2e2; color: #991b1b' : '#fef3c7; color: #92400e'}; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: bold;">${daysLeft < 0 ? 'EXPIRADO' : 'EXPIRA BREVEMENTE'}</span></td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #78350f; font-weight: bold;">Data de Validade:</td>
                <td style="padding: 4px 0; font-weight: bold;">${member.expiryDate}</td>
              </tr>
            </table>
          </div>
          
          <p>Pode regularizar a sua situação de forma imediata acedendo ao seu <strong>Portal do Membro</strong> na secção de Pagamentos Online.</p>
          
          <div style="text-align: center; margin: 24px 0;">
            <a href="${appUrl}" style="background-color: #1e3a8a; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block; font-size: 13px;">Aceder ao Portal do Membro</a>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 11px; color: #64748b; margin-bottom: 0;">Se já efetuou o pagamento e enviou o comprovativo recentemente, por favor ignore este e-mail. A administração da OST está a processar a sua ativação.</p>
        </div>
        <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
          Organização Social do Trabalho • Moçambique<br />
          Apoio ao Membro: suporte@ost-mocambique.org
        </div>
      </div>
    `;

    let transporter;
    let senderAddress = process.env.SMTP_FROM || `"Organização Social do Trabalho" <no-reply@ost-mocambique.org>`;

    if (smtpConfig && smtpConfig.host && smtpConfig.user && smtpConfig.password) {
      const port = smtpConfig.port ? parseInt(smtpConfig.port, 10) : 587;
      transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: port,
        secure: smtpConfig.secure !== undefined ? smtpConfig.secure : (port === 465),
        auth: {
          user: smtpConfig.user,
          pass: smtpConfig.password,
        },
      });
      if (smtpConfig.senderEmail) {
        senderAddress = smtpConfig.senderName 
          ? `"${smtpConfig.senderName}" <${smtpConfig.senderEmail}>`
          : smtpConfig.senderEmail;
      }
    } else {
      transporter = await getMailTransporter();
    }

    const mailOptions = {
      from: senderAddress,
      to: member.email,
      subject,
      text: daysLeft < 0 
        ? `Olá ${member.name}, o seu crachá OST expirou a ${member.expiryDate}. Por favor aceda ao Portal para regularizar.`
        : `Olá ${member.name}, o seu crachá OST expira em ${daysLeft} dias (${member.expiryDate}). Por favor regularize o pagamento.`,
      html: htmlBody
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    console.error(`[Expiry Job] Error sending email notification to ${member.email}:`, error);
    return { success: false, error: error.message };
  }
}

async function runAutomatedExpiryNotifications() {
  console.log("[Expiry Job] Starting automated member expiry check...");
  try {
    // 1. Get SMTP Config from settings
    const smtpDocRef = doc(db, "settings", "smtp");
    const smtpSnap = await getDoc(smtpDocRef);
    let smtpConfig: any = null;
    if (smtpSnap.exists()) {
      smtpConfig = smtpSnap.data();
      if (smtpConfig && smtpConfig.password) {
        smtpConfig.password = decryptSmtpPassword(smtpConfig.password);
      }
    }

    // 2. Get members
    const membersSnap = await getDocs(collection(db, "members"));
    const membersList: any[] = [];
    membersSnap.forEach((docSnap) => {
      membersList.push(docSnap.data());
    });

    console.log(`[Expiry Job] Loaded ${membersList.length} members from Firestore.`);

    let notifiedCount = 0;
    let errorsCount = 0;

    for (const member of membersList) {
      if (member.paymentStatus !== "Ativo" && member.paymentStatus !== "Bloqueado") continue;
      
      const expiryStatus = getExpiryStatus(member.expiryDate);
      if (!expiryStatus.nearing && !expiryStatus.expired) continue;

      // Prevent spamming: only send if never sent, or if sent more than 7 days ago
      if (member.lastExpiryNotificationSent) {
        const lastSent = new Date(member.lastExpiryNotificationSent);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        if (lastSent >= sevenDaysAgo) {
          console.log(`[Expiry Job] Notification skipped for ${member.name} (notified recently).`);
          continue;
        }
      }

      console.log(`[Expiry Job] Member ${member.name} (ID: ${member.id}) is eligible for expiry alert (Days left: ${expiryStatus.daysLeft}).`);

      // Send Email notification
      const emailResult = await sendServerExpiryEmail(member, expiryStatus.daysLeft, smtpConfig);
      if (emailResult.success) {
        notifiedCount++;
        // Update member lastExpiryNotificationSent state in Firestore
        const memberDocRef = doc(db, "members", member.id);
        const updatedSentTime = new Date().toISOString();
        await setDoc(memberDocRef, { lastExpiryNotificationSent: updatedSentTime }, { merge: true });
        console.log(`[Expiry Job] Updated lastExpiryNotificationSent for ${member.name} in Firestore.`);
        
        // Save audit log to logs collection
        const logId = "log-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
        const logDocRef = doc(db, "logs", logId);
        await setDoc(logDocRef, {
          id: logId,
          operator: "Sistema",
          action: `Notificação de expiração automática enviada por e-mail para ${member.name} (${member.email})`,
          timestamp: updatedSentTime,
          type: "info"
        });
      } else {
        errorsCount++;
        console.error(`[Expiry Job] Failed to send email to ${member.name}:`, emailResult.error);
      }
    }

    console.log(`[Expiry Job] Completed expiry notifications. Sent: ${notifiedCount}, Failed: ${errorsCount}`);
    return { success: true, sent: notifiedCount, failed: errorsCount };
  } catch (err: any) {
    console.error("[Expiry Job] Critical error in automated expiry check:", err);
    return { success: false, error: err.message };
  }
}

function startDailyScheduler() {
  const setupNextRun = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setDate(now.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);

    const delay = midnight.getTime() - now.getTime();
    console.log(`[Expiry Job] Daily scheduler set to run in ${Math.round(delay / 1000 / 60)} minutes (at midnight local time).`);

    setTimeout(async () => {
      await runAutomatedExpiryNotifications();
      setupNextRun(); // Reschedule for next midnight
    }, delay);
  };

  setupNextRun();
}

// Manual administrator trigger for checking / testing the expiry jobs
app.post("/api/admin/run-expiry-check", async (req, res) => {
  const { secretKey } = req.body;
  const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || "OST_ADMIN_2026";

  if (!secretKey || secretKey !== ADMIN_SECRET_KEY) {
    return res.status(401).json({ success: false, error: "Chave Secreta de Administração incorreta ou ausente." });
  }

  const result = await runAutomatedExpiryNotifications();
  res.json(result);
});

setupFrontend().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Server successfully listening at http://0.0.0.0:${PORT}`);
    startDailyScheduler();
  });
});
