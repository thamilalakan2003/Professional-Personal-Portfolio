// netlify/functions/verify-otp.js
//
// Checks the code the visitor typed against Twilio Verify's record for
// that phone number. Twilio stores and expires the code server-side —
// this function never sees or stores the code itself, it just asks
// Twilio "was this code correct for this number?".

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let phone, code;
  try {
    ({ phone, code } = JSON.parse(event.body || "{}"));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body" }) };
  }

  const ALLOWED_PHONE = process.env.ALLOWED_PHONE;
  if (!phone || !code || !ALLOWED_PHONE || phone !== ALLOWED_PHONE) {
    return { statusCode: 403, body: JSON.stringify({ error: "This number is not authorised to edit this site." }) };
  }

  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SID } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SID) {
    return { statusCode: 500, body: JSON.stringify({ error: "SMS is not configured yet (missing Twilio environment variables)." }) };
  }

  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");

  try {
    const res = await fetch(
      `https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SID}/VerificationCheck`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({ To: phone, Code: code })
      }
    );
    const data = await res.json();
    if (!res.ok) {
      return { statusCode: res.status, body: JSON.stringify({ error: data.message || "Verification failed." }) };
    }
    const approved = data.status === "approved";
    return { statusCode: approved ? 200 : 401, body: JSON.stringify({ approved }) };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: "Could not reach Twilio: " + err.message }) };
  }
}
