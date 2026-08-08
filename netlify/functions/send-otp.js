// netlify/functions/send-otp.js
//
// Sends a real SMS one-time code via Twilio Verify.
// Runs server-side only — this is the whole point: Twilio's secret
// credentials and your allowed phone number live here, in Netlify's
// environment variables, and are never shipped to the browser.
//
// Required Netlify environment variables (set in Site settings →
// Environment variables, never committed to source):
//   ALLOWED_PHONE        e.g. "+94771234567"  (the ONE number allowed to edit)
//   TWILIO_ACCOUNT_SID   from console.twilio.com
//   TWILIO_AUTH_TOKEN    from console.twilio.com
//   TWILIO_VERIFY_SID    the "Service SID" of a Verify Service you create
//                         at console.twilio.com/us1/develop/verify/services

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let phone;
  try {
    ({ phone } = JSON.parse(event.body || "{}"));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body" }) };
  }

  const ALLOWED_PHONE = process.env.ALLOWED_PHONE;
  if (!phone || !ALLOWED_PHONE || phone !== ALLOWED_PHONE) {
    // Deliberately vague — don't confirm/deny whether a number "exists".
    return { statusCode: 403, body: JSON.stringify({ error: "This number is not authorised to edit this site." }) };
  }

  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SID } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SID) {
    return { statusCode: 500, body: JSON.stringify({ error: "SMS is not configured yet (missing Twilio environment variables)." }) };
  }

  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");

  try {
    const res = await fetch(
      `https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SID}/Verifications`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({ To: phone, Channel: "sms" })
      }
    );
    const data = await res.json();
    if (!res.ok) {
      return { statusCode: res.status, body: JSON.stringify({ error: data.message || "Twilio could not send the code." }) };
    }
    return { statusCode: 200, body: JSON.stringify({ status: data.status }) };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: "Could not reach Twilio: " + err.message }) };
  }
}
