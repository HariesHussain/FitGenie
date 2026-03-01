// services/emailService.ts
import emailjs from "@emailjs/browser";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export async function sendOtpEmail(toEmail: string, otp: string, userName?: string) {
  try {
    const payload = {
      to_email: toEmail,
      user_name: userName || "User",
      otp_code: otp,   // <-- Must match EmailJS template {{otp_code}}
    };

    const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID, payload, PUBLIC_KEY);
    console.log("EmailJS response:", result);

    return true;
  } catch (err) {
    console.error("EmailJS sendOtpEmail ERROR:", err);
    return false;
  }
}
