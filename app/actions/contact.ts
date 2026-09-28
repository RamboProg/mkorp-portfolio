"use server";

import nodemailer from "nodemailer";

export type ContactState = { status: "idle" | "success" | "error"; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
}

function field(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function sendContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  // Honeypot: real users never see or fill this field.
  if (field(formData, "company")) return { status: "success", message: "Thanks! Your message is on its way." };

  const name = field(formData, "name").replace(/[\r\n]+/g, " ").slice(0, 100);
  const email = field(formData, "email").slice(0, 200);
  const message = field(formData, "message").slice(0, 5000);

  if (!name || !email || !message) return { status: "error", message: "Please fill in every field." };
  if (!EMAIL_RE.test(email)) return { status: "error", message: "That email address doesn't look right." };

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.error("Contact form: SMTP_HOST, SMTP_USER and SMTP_PASS must be set.");
    return { status: "error", message: "Email isn't configured yet. Please use the Email me button instead." };
  }

  const port = Number(SMTP_PORT ?? 465);
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const from = `"Mohamed Ismail" <${SMTP_USER}>`;
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

  try {
    await transporter.sendMail({
      from,
      to: CONTACT_TO || SMTP_USER,
      replyTo: { name, address: email },
      subject: `New portfolio message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `<p><strong>Name:</strong> ${safeName}<br><strong>Email:</strong> ${safeEmail}</p><p>${safeMessage}</p>`,
    });
  } catch (err) {
    console.error("Contact form: failed to forward message", err);
    return { status: "error", message: "Something went wrong sending your message. Please try again or email me directly." };
  }

  try {
    await transporter.sendMail({
      from,
      to: { name, address: email },
      subject: "Thanks for reaching out — message received",
      text: `Hi ${name},\n\nThanks for getting in touch. I've received your message and will get back to you soon.\n\nFor your records, here's what you sent:\n\n${message}\n\n— Mohamed Ismail`,
      html: `<p>Hi ${safeName},</p><p>Thanks for getting in touch. I've received your message and will get back to you soon.</p><p>For your records, here's what you sent:</p><blockquote style="margin:0;padding:12px 16px;border-left:3px solid #ed2020;background:#f6efe6">${safeMessage}</blockquote><p>— Mohamed Ismail</p>`,
    });
  } catch (err) {
    // The message already reached the inbox, so the visitor still gets a success state.
    console.error("Contact form: failed to send confirmation", err);
  }

  return { status: "success", message: "Thanks! Your message is on its way — check your inbox for a confirmation." };
}
