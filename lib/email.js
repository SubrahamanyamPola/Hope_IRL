export async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "HOPE_IRL <no-reply@hope-irl.local>";

  // If no email provider configured, log and exit safely (no errors)
  if (!apiKey) {
    console.log("[email:mock]", { to, subject, from });
    return { ok: true, mocked: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ from, to, subject, html })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("[email:error]", res.status, data);
      return { ok: false, status: res.status, data };
    }
    return { ok: true, data };
  } catch (e) {
    console.error("[email:exception]", e);
    return { ok: false, error: "email_send_failed" };
  }
}
