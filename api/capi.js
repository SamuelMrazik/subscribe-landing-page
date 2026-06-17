const crypto = require("crypto");

const ALLOWED_EVENTS = new Set([
  "PageView",
  "ViewContent",
  "Lead",
  "CompleteRegistration",
]);

const PIXEL_ID = process.env.META_PIXEL_ID || "2411788459345520";
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const API_VERSION = "v21.0";

function hashValue(value) {
  return crypto
    .createHash("sha256")
    .update(value.trim().toLowerCase())
    .digest("hex");
}

function buildUserData({ email, clientUserAgent, fbp, fbc }) {
  const userData = {};

  if (email) {
    userData.em = [hashValue(email)];
  }
  if (clientUserAgent) {
    userData.client_user_agent = clientUserAgent;
  }
  if (fbp) {
    userData.fbp = fbp;
  }
  if (fbc) {
    userData.fbc = fbc;
  }

  return userData;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!ACCESS_TOKEN) {
    return res.status(500).json({
      error: "META_CAPI_ACCESS_TOKEN is not set",
      hint: "Add your token in .env.local locally or in Vercel Project Settings → Environment Variables",
    });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Invalid JSON body" });
    }
  }

  const { events, email, clientUserAgent, fbp, fbc } = body || {};

  if (!Array.isArray(events) || events.length === 0) {
    return res.status(400).json({ error: "events array is required" });
  }

  for (const event of events) {
    if (!ALLOWED_EVENTS.has(event.event_name)) {
      return res.status(400).json({
        error: `Event not allowed: ${event.event_name}`,
      });
    }
  }

  const sharedUserData = buildUserData({
    email,
    clientUserAgent,
    fbp,
    fbc,
  });

  const capiEvents = events.map((event) => ({
    event_name: event.event_name,
    event_time: event.event_time,
    event_id: event.event_id,
    event_source_url: event.event_source_url,
    action_source: "website",
    user_data: {
      ...sharedUserData,
      ...event.user_data,
    },
  }));

  const payload = { data: capiEvents };

  if (process.env.META_TEST_EVENT_CODE) {
    payload.test_event_code = process.env.META_TEST_EVENT_CODE;
  }

  const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to reach Meta Conversions API",
      details: error.message,
    });
  }
};
