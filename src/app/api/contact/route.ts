import { NextResponse } from "next/server";

type Payload = { name?: string; email?: string; message?: string };

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  const body = (await req.json()) as Payload;

  const name = (body.name || "").toString().trim();
  const email = (body.email || "").toString().trim();
  const message = (body.message || "").toString().trim();

  if (!name || !email || !message) {
    return NextResponse.json({ ok: false, error: "Missing required fields." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: "Invalid email." }, { status: 400 });
  }
  if (message.length > 4000) {
    return NextResponse.json({ ok: false, error: "Message too long." }, { status: 400 });
  }

  // Replace this with: email provider (Resend/Postmark), CRM, Slack webhook, etc.
  console.log("Contact submission:", { name, email, message, at: new Date().toISOString() });

  return NextResponse.json({ ok: true });
}
