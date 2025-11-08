import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // ⚙️ Create a password reset link (here we just mock one)
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?email=${encodeURIComponent(email)}`;

    // 📨 Transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "🔑 Password Reset - WanderWisely",
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <p>If you didn’t request this, please ignore this email.</p>
      `,
    });

    return NextResponse.json({ message: "Email sent successfully ✅" });
  } catch (err) {
    console.error("Error sending recovery email:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
