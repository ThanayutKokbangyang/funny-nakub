// Vercel Serverless Function: รับเหตุการณ์จากหน้าเว็บ แล้วส่งต่อเข้า Google Sheet
// ตั้งค่า Environment Variables ใน Vercel: SHEET_WEBHOOK_URL และ SHEET_SECRET

const ALLOWED = ["opened", "yes", "message"];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false });
  }
  const url = process.env.SHEET_WEBHOOK_URL;
  if (!url) {
    return res.status(500).json({ ok: false, error: "ยังไม่ได้ตั้ง SHEET_WEBHOOK_URL" });
  }

  let body = req.body || {};
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const event = String(body.event || "");
  if (!ALLOWED.includes(event)) {
    return res.status(400).json({ ok: false });
  }

  const payload = {
    secret: process.env.SHEET_SECRET || "",
    event,
    to: String(body.to || "").slice(0, 60),
    dodges: Math.max(0, Math.min(9999, Number(body.dodges) || 0)),
    message: event === "message" ? String(body.message || "").slice(0, 500) : "",
  };
  if (event === "message" && !payload.message.trim()) {
    return res.status(400).json({ ok: false });
  }

  try {
    // ส่งเป็น text/plain เพราะ Apps Script รับได้ง่ายสุด
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow",
    });
    return res.status(r.ok ? 200 : 502).json({ ok: r.ok });
  } catch (err) {
    return res.status(502).json({ ok: false });
  }
}
