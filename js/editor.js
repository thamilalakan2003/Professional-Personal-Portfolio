/* =============================================================
   OWNER EDIT MODE — phone + OTP gate (real SMS via Twilio through
   a Netlify serverless function), inline editing, save to repo
   =============================================================

   HOW THE OTP WORKS NOW
   ----------------------
   Phone-based login sends a real SMS using Twilio Verify, called
   through two small serverless functions in netlify/functions/.
   Your phone number and Twilio credentials live only in Netlify's
   environment variables — never in this file, never in the
   browser. This file just calls:
     POST /.netlify/functions/send-otp    { phone }
     POST /.netlify/functions/verify-otp  { phone, code }

   This means:
   - This feature only works once the site is deployed on Netlify
     (or run locally with `netlify dev`) — plain GitHub Pages
     cannot run serverless functions, so send/verify calls will
     fail there. See the README for full setup steps, including
     creating a Twilio Verify Service and setting:
       ALLOWED_PHONE, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN,
       TWILIO_VERIFY_SID
     as Netlify environment variables.
   - Twilio is a paid service beyond its trial credit — check
     Twilio's current pricing before relying on this for real use.

   Saving changes (unchanged from before):
   - If you provide a GitHub Personal Access Token (fine-grained,
     "Contents: read and write" on this one repo) when you click
     Save, this script commits the updated index.html straight to
     `main` via the GitHub REST API.
   - The token is only kept in sessionStorage (cleared when you
     close the tab) — never written to any file.
   - If you skip the token, Save downloads the edited index.html
     instead so you can review and commit it yourself.
============================================================= */

(function () {
  const GITHUB_OWNER  = "your-username";  // EDIT: your GitHub username
  const GITHUB_REPO   = "your-repo";      // EDIT: your repository name
  const GITHUB_BRANCH = "main";
  const GITHUB_FILE_PATH = "index.html";
  const SESSION_FLAG = "portfolio_owner_unlocked";

  let editModeOn = false;

  //const root = document.getElementById("editorUI");

  root.innerHTML = `
    

    <div id="saveBar" class="editor-savebar" hidden>
      <span class="editor-savebar-label">Edit mode is on — click any text to change it.</span>
      <div class="editor-savebar-actions">
        <button id="discardBtn" class="btn btn-outline editor-btn-sm">Discard</button>
        <button id="saveBtn" class="btn btn-primary editor-btn-sm">Save changes</button>
      </div>
    </div>
  `;

  const loginOverlay = document.getElementById("loginOverlay");
  const phoneStep = document.getElementById("phoneStep");
  const otpStep = document.getElementById("otpStep");
  const phoneInput = document.getElementById("phoneInput");
  const otpInput = document.getElementById("otpInput");
  const phoneError = document.getElementById("phoneError");
  const otpError = document.getElementById("otpError");
  const otpNote = otpStep.querySelector(".editor-otp-note");
  const saveBar = document.getElementById("saveBar");
  const sendOtpBtn = document.getElementById("sendOtpBtn");
  const verifyOtpBtn = document.getElementById("verifyOtpBtn");

  let phoneForVerification = null;

  document.getElementById("loginClose").addEventListener("click", closeLogin);
  sendOtpBtn.addEventListener("click", sendOtp);
  verifyOtpBtn.addEventListener("click", verifyOtp);
  document.getElementById("discardBtn").addEventListener("click", () => location.reload());
  document.getElementById("saveBtn").addEventListener("click", saveChanges);

  function openLogin() {
    loginOverlay.hidden = false;
    phoneStep.hidden = false;
    otpStep.hidden = true;
    phoneError.hidden = true;
    phoneInput.value = "";
    phoneInput.focus();
  }
  function closeLogin() { loginOverlay.hidden = true; }

  function normalizePhone(v) {
    return v.replace(/[\s\-()]/g, "");
  }

  function setBusy(btn, busy, busyLabel, idleLabel) {
    btn.disabled = busy;
    btn.textContent = busy ? busyLabel : idleLabel;
  }

  async function sendOtp() {
    const entered = normalizePhone(phoneInput.value.trim());
    if (!entered) {
      phoneError.textContent = "Enter a phone number in international format, e.g. +94771234567.";
      phoneError.hidden = false;
      return;
    }
    phoneError.hidden = true;
    setBusy(sendOtpBtn, true, "Sending…", "Send SMS code");

    try {
      const res = await fetch("/.netlify/functions/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: entered })
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        phoneError.textContent = data.error || "This number is not authorised to edit this site.";
        phoneError.hidden = false;
        setBusy(sendOtpBtn, false, "", "Send SMS code");
        return;
      }

      phoneForVerification = entered;
      otpNote.innerHTML = `A 6-digit code was sent by SMS to <strong>${entered}</strong>.
        <br><span class="editor-otp-small">Didn't get it? Check the number is correct and that Twilio is configured (see README), then try again.</span>`;
      phoneStep.hidden = true;
      otpStep.hidden = false;
      otpInput.value = "";
      otpInput.focus();
    } catch (err) {
      phoneError.textContent = "Could not reach the login service. Is this site deployed on Netlify with SMS configured?";
      phoneError.hidden = false;
    } finally {
      setBusy(sendOtpBtn, false, "", "Send SMS code");
    }
  }

  async function verifyOtp() {
    const code = otpInput.value.trim();
    if (!code) return;
    otpError.hidden = true;
    setBusy(verifyOtpBtn, true, "Checking…", "Verify & Unlock");

    try {
      const res = await fetch("/.netlify/functions/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneForVerification, code })
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.approved) {
        otpError.textContent = data.error || "Incorrect or expired code, try again.";
        otpError.hidden = false;
        return;
      }

      sessionStorage.setItem(SESSION_FLAG, "1");
      closeLogin();
      unlockEditMode();
    } catch (err) {
      otpError.textContent = "Could not reach the login service.";
      otpError.hidden = false;
    } finally {
      setBusy(verifyOtpBtn, false, "", "Verify & Unlock");
    }
  }


  function unlockEditMode() {
    editModeOn = true;
    document.body.classList.add("owner-edit-mode");
    saveBar.hidden = false;

    // Make text content editable, excluding nav, buttons and structural wrappers.
    const editableSelector = "main h1, main h2, main h3, main p, main li, main span.chip, main span.fact-value, main span.contact-value, main span.exp-org";
    document.querySelectorAll(editableSelector).forEach(el => {
      el.setAttribute("contenteditable", "true");
      el.classList.add("is-editable");
    });

    // Add small pencil buttons to edit link destinations (hrefs), since
    // contenteditable only changes visible text, not the link target.
    document.querySelectorAll(".project-links a, .contact-card").forEach(a => {
      const pencil = document.createElement("button");
      pencil.type = "button";
      pencil.className = "editor-link-pencil";
      pencil.title = "Edit link URL";
      pencil.textContent = "✎";
      pencil.addEventListener("click", (e) => {
        e.preventDefault();
        const next = prompt("Set the URL for this link:", a.getAttribute("href") || "");
        if (next) a.setAttribute("href", next);
      });
      a.style.position = "relative";
      a.appendChild(pencil);
    });
  }

  // Resume edit mode automatically if this tab already unlocked it earlier.
  if (sessionStorage.getItem(SESSION_FLAG) === "1") {
    document.addEventListener("DOMContentLoaded", unlockEditMode);
  }

  

  function downloadHtml(html) {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "index.html";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function commitToGitHub(token, html) {
    const apiBase = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;
    const headers = {
      Authorization: "Bearer " + token,
      Accept: "application/vnd.github+json"
    };

    // 1. Get the current file's sha (required by the GitHub API to update a file).
    const getRes = await fetch(`${apiBase}?ref=${GITHUB_BRANCH}`, { headers });
    if (!getRes.ok) throw new Error("could not read current file (" + getRes.status + ")");
    const getData = await getRes.json();

    // 2. PUT the new content, base64-encoded, to the same path on `main`.
    const putRes = await fetch(apiBase, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Update portfolio content via in-page editor",
        content: btoa(unescape(encodeURIComponent(html))),
        sha: getData.sha,
        branch: GITHUB_BRANCH
      })
    });
    if (!putRes.ok) {
      const errBody = await putRes.json().catch(() => ({}));
      throw new Error(errBody.message || ("GitHub API error " + putRes.status));
    }
  }
})();
