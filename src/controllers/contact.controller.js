import ContactMessage from "../models/ContactMessage.js";
import { sendInternalNotification } from "../utils/sendEmail.js";

export async function createContactMessage(req, res, next) {
  try {
    const { name, email, subject, message } = req.body;
    const contact = await ContactMessage.create({ name, email, subject, message });

    try {
      await sendInternalNotification({
        subject: `Nouveau message de contact — ${subject || name}`,
        replyTo: email,
        html: `
          <h2>Nouveau message de contact</h2>
          <p><strong>Nom :</strong> ${name}</p>
          <p><strong>Email :</strong> ${email}</p>
          <p><strong>Sujet :</strong> ${subject || "—"}</p>
          <p><strong>Message :</strong><br/>${message}</p>
        `,
      });
    } catch (mailErr) {
      console.error("Erreur envoi email contact :", mailErr.message);
    }

    res.status(201).json({ contact });
  } catch (err) {
    next(err);
  }
}
