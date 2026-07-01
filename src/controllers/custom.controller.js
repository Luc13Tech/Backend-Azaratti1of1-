import CustomRequest from "../models/CustomRequest.js";
import { sendInternalNotification, sendClientAutoReply } from "../utils/sendEmail.js";

export async function createCustomRequest(req, res, next) {
  try {
    const { name, email, phone, size, color, fabric, instructions, relatedProductId, lang } = req.body;

    const request = await CustomRequest.create({
      user: req.user ? req.user.id : null,
      name,
      email,
      phone,
      size,
      color,
      fabric,
      instructions,
      relatedProductId,
    });

    try {
      await sendInternalNotification({
        subject: `Nouvelle demande sur-mesure — ${name}`,
        replyTo: email,
        html: `
          <h2>Nouvelle demande sur-mesure</h2>
          <p><strong>Nom :</strong> ${name}</p>
          <p><strong>Email :</strong> ${email}</p>
          <p><strong>Téléphone :</strong> ${phone || "—"}</p>
          <p><strong>Taille / mensurations :</strong> ${size || "—"}</p>
          <p><strong>Couleur souhaitée :</strong> ${color || "—"}</p>
          <p><strong>Tissu souhaité :</strong> ${fabric || "—"}</p>
          <p><strong>Pièce de référence :</strong> ${relatedProductId || "—"}</p>
          <p><strong>Instructions :</strong><br/>${instructions}</p>
        `,
      });
      await sendClientAutoReply({ to: email, name, lang: lang || "fr" });
      request.emailSent = true;
      await request.save();
    } catch (mailErr) {
      // La demande reste enregistrée même si l'envoi d'email échoue
      console.error("Erreur envoi email :", mailErr.message);
    }

    res.status(201).json({ request });
  } catch (err) {
    next(err);
  }
}
