import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });
  }
  return transporter;
}

// Envoie un email à l'entreprise pour notifier d'une nouvelle demande sur-mesure / contact
export async function sendInternalNotification({ subject, html, replyTo }) {
  const t = getTransporter();
  await t.sendMail({
    from: `"AzaRatti 1 of 1 — Site Web" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    replyTo,
    subject,
    html,
  });
}

// Envoie une réponse automatique de confirmation au client
export async function sendClientAutoReply({ to, name, lang }) {
  const messages = {
    fr: {
      subject: "AzaRatti 1 of 1 — Votre demande a bien été reçue",
      body: `Bonjour ${name},<br/><br/>Nous avons bien reçu votre demande. Notre équipe vous recontactera très prochainement pour discuter des détails de votre pièce sur mesure.<br/><br/>À très vite,<br/>L'équipe AzaRatti 1 of 1`,
    },
    en: {
      subject: "AzaRatti 1 of 1 — Your request has been received",
      body: `Hello ${name},<br/><br/>We have received your request. Our team will get back to you shortly to discuss the details of your bespoke piece.<br/><br/>Talk soon,<br/>The AzaRatti 1 of 1 Team`,
    },
    es: {
      subject: "AzaRatti 1 of 1 — Tu solicitud ha sido recibida",
      body: `Hola ${name},<br/><br/>Hemos recibido tu solicitud. Nuestro equipo se pondrá en contacto contigo pronto para discutir los detalles de tu pieza a medida.<br/><br/>Hasta pronto,<br/>El equipo de AzaRatti 1 of 1`,
    },
    de: {
      subject: "AzaRatti 1 of 1 — Deine Anfrage wurde empfangen",
      body: `Hallo ${name},<br/><br/>Wir haben deine Anfrage erhalten. Unser Team wird sich in Kürze bei dir melden, um die Details deines Maßstücks zu besprechen.<br/><br/>Bis bald,<br/>Das AzaRatti 1 of 1 Team`,
    },
  };
  const m = messages[lang] || messages.fr;
  const t = getTransporter();
  await t.sendMail({
    from: `"AzaRatti 1 of 1" <${process.env.EMAIL_USER}>`,
    to,
    subject: m.subject,
    html: m.body,
  });
}
