// =============================================================
// EDIT-ME: change ROLES to describe yourself; change CV date below.
// =============================================================
const ROLES = [
  "BICT (Hons) Undergraduate",
  "Aspiring Software Developer",
  "Problem Solver",
  "Open to Internships"
];

document.getElementById("year").textContent = new Date().getFullYear();

// EDIT: set your CV's real last-updated date
const cvDateEl = document.getElementById("cvDate");
if (cvDateEl) cvDateEl.textContent = "August 2026";

/* ============================================================
   1. MOBILE NAV TOGGLE
============================================================= */
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});
navLinks.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

/* ============================================================
   2. TERMINAL-STYLE TYPING EFFECT (hero role line)
============================================================= */
const typedEl = document.getElementById("typedRole");
let roleIndex = 0, charIndex = 0, deleting = false;

function typeLoop() {
  const current = ROLES[roleIndex];
  if (!deleting) {
    charIndex++;
    typedEl.textContent = current.slice(0, charIndex);
    if (charIndex === current.length) {
      deleting = true;
      setTimeout(typeLoop, 1400);
      return;
    }
  } else {
    charIndex--;
    typedEl.textContent = current.slice(0, charIndex);
    if (charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % ROLES.length;
    }
  }
  setTimeout(typeLoop, deleting ? 35 : 65);
}
typeLoop();

/* ============================================================
   3. SCROLL REVEAL — fade/slide sections & cards into view
============================================================= */
const revealTargets = document.querySelectorAll(
  ".section-title, .about-grid, .timeline-item, .skill-card, .project-card, .exp-item, .cv-box, .contact-card"
);
revealTargets.forEach(el => el.classList.add("reveal"));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealTargets.forEach(el => observer.observe(el));

/* ============================================================
   4. CUSTOM CURSOR + MOUSE-MOVE PARTICLE TRAIL
   - a small brass dot follows the mouse instantly
   - a ring trails behind with easing, growing on hover targets
   - a canvas draws short-lived "sparks" that spawn as the mouse
     moves, giving a subtle glowing trail effect
   Skipped entirely on touch devices (see CSS media query).
============================================================= */
const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

if (!isTouch) {
  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  const canvas = document.getElementById("trailCanvas");
  const ctx = canvas.getContext("2d");

  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let ringX = mouseX, ringY = mouseY;
  let lastSpawn = 0;
  const particles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + "px";
    dot.style.top = mouseY + "px";

    // spawn a spark every ~18px of movement, not every pixel
    const now = performance.now();
    if (now - lastSpawn > 18) {
      lastSpawn = now;
      particles.push({
        x: mouseX,
        y: mouseY,
        r: Math.random() * 2.2 + 1.2,
        life: 1,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6 - 0.2
      });
      if (particles.length > 120) particles.shift();
    }
  });

  // ring eases toward the cursor, and grows on hoverable elements
  const hoverables = document.querySelectorAll("a, button, .project-card, .skill-card, .contact-card, .chip");
  hoverables.forEach(el => {
    el.addEventListener("mouseenter", () => ring.classList.add("is-active"));
    el.addEventListener("mouseleave", () => ring.classList.remove("is-active"));
  });

  function animate() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.left = ringX + "px";
    ring.style.top = ringY + "px";

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.03;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(185, 139, 42, ${p.life * 0.55})`;
      ctx.fill();
    }
    requestAnimationFrame(animate);
  }
  animate();
}
