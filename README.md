# Sivanathan Thamilalakan — Personal Portfolio

Personal portfolio website built for the **System Analysis & Design (SAD)** module
assignment, BICT (Hons), University of Vavuniya, Sri Lanka.

**Live site:** EDIT — add your deployed URL here (GitHub Pages / Netlify / Vercel)
**SAD report:** see `/report` or the submitted PDF

## About

This is a static, mobile-responsive personal portfolio used for internship and job
applications. It covers Home, About, Education, Skills, Projects, Experience &
Activities, CV, and Contact, per the assignment brief.

## Tech stack

- HTML5, CSS3, vanilla JavaScript (no framework, no backend/database)
- Custom cursor + mouse-trail interaction (`js/script.js`)
- Deployed as a static site (GitHub Pages)

## Project structure

```
portfolio/
├── index.html          # all page sections
├── css/
│   └── style.css       # design tokens, layout, responsive rules
├── js/
│   └── script.js       # nav toggle, typing effect, scroll reveal, cursor trail
├── assets/
│   ├── cv/              # put your CV PDF here
│   └── projects/        # put project screenshots here
└── README.md
```

## Running locally

No build step is required.

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
# then just open index.html in a browser, or serve it:
python3 -m http.server 8000
# visit http://localhost:8000
```

## Deploying (GitHub Pages)

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Under **Source**, select the `main` branch and `/ (root)` folder.
4. Save — your site will be published at
   `https://your-username.github.io/your-repo/`.

## Owner edit mode (real SMS OTP login via Twilio + Netlify, in-page editing)

There's an "Owner Login" button in the footer that texts a real one-time
code to your one authorised phone number, then lets you edit page text
directly in the browser and save changes back to `index.html` on `main`.

Real SMS needs a secret API key, and secret keys can never live in
browser code — so this piece runs as a small **serverless function**
(free on Netlify, one of the assignment's approved hosts) instead of in
the static site itself. Your phone number and Twilio credentials live
only in Netlify's environment variables, never in your repo.

**Setup:**

1. **Create a Twilio account** at twilio.com (free trial includes credit).
   - In the console, create a **Verify Service** (Verify → Services →
     Create new). Copy its **Service SID** (starts with `VA…`).
   - Copy your **Account SID** and **Auth Token** from the console dashboard.
   - On a trial account, Twilio can only text numbers you've verified in
     the console (Phone Numbers → Verified Caller IDs) — verify your own
     number there first, or upgrade the account to remove that limit.
2. **Deploy this site on Netlify** (not GitHub Pages — Pages can't run
   serverless functions):
   - Push this repo to GitHub, then in Netlify: "Add new site → Import
     an existing project" and pick the repo. Netlify auto-detects
     `netlify.toml`.

3. Open `js/editor.js` and set `GITHUB_OWNER` / `GITHUB_REPO` to your
   own (used only for the Save-to-GitHub step, unrelated to SMS).
4. Redeploy. Click **Owner Login**, enter your number, and you should
   receive a real text.

**What's genuinely secure here, and what isn't:**

- ✅ Your phone number and Twilio secrets never appear in any file the
  browser downloads — they only exist inside Netlify's server-side
  environment, checked inside `netlify/functions/send-otp.js` and
  `verify-otp.js`.
- ✅ The 6-digit code is generated, stored and expired by Twilio itself
  (not by this code), so it can't be read out of your JavaScript.
- ⚠️ Twilio's trial tier is free credit, not free forever — check
  Twilio's current pricing before relying on this long-term.
- ⚠️ This still only gates *this one editing feature*. It's not a
  general authentication system, and the rest of the site is a normal
  public static page.

**Saving edits:** click any highlighted text to change it. **Save
changes** asks for a GitHub Personal Access Token (fine-grained,
*Contents: read and write* on this one repo only):
- With a token: commits `index.html` straight to `main` via the GitHub API.
- Without one: downloads the edited `index.html` for you to commit
  yourself — always works, no token needed.
- The token lives only in `sessionStorage` (cleared when the tab
  closes) and is never written to a file. Only paste it on a device you
  trust, and never commit a token into source code.
- Link destinations (project/contact URLs) aren't edited inline — use
  the small ✎ button next to each link in edit mode.

**If you'd rather skip all of this** (it's genuinely outside the
assignment's "no backend required" scope — treat it as an optional
extra, not a requirement), delete `js/editor.js`, `netlify/functions/`,
`netlify.toml`, the `#editorUI` div, and the two `<script>` tags for
`editor.js` from `index.html`, and deploy as a plain static site on
GitHub Pages instead.

## Before you submit

- [ ] Replace every `EDIT:` placeholder in `index.html` and `js/script.js`
      with your real content (About, Education, Skills, 3+ Projects,
      Experience, Contact links).
- [ ] Add your real CV PDF at `assets/cv/Sivanathan_Thamilalakan_CV.pdf`.
- [ ] Add real project screenshots to `assets/projects/`.
- [ ] Update the project Live Demo / GitHub links once each is real.
- [ ] Test on desktop and mobile widths, and in at least two browsers.
- [ ] Deploy and confirm the live link and repo link both work publicly.
- [ ] Add the portfolio link to your LinkedIn (Featured section) or post about it,
      and keep a screenshot for the "career-sharing evidence" deliverable.

## Credits / third-party content

EDIT: list here any template, icon set, font, image, or code snippet you used
that isn't your own original work, with a link — the assignment requires this.
This build uses no external libraries or fonts; everything is original
HTML/CSS/JS using system fonts.

## AI-use declaration

EDIT: state which parts of this project you used AI assistance for (e.g.
"used Claude to scaffold the initial HTML/CSS/JS structure and cursor
animation; all content was written, verified and is understood by the
author"), per the module's AI-use declaration requirement.
