/* animations.js – Confetti + Particles + Floating Balls */

// ── Particles ──────────────────────────────────────────────────
function initParticles() {
  const container = document.getElementById('particles');
  const count = 40;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${1 + Math.random() * 3}px;
      height: ${1 + Math.random() * 3}px;
      animation-duration: ${6 + Math.random() * 12}s;
      animation-delay: ${Math.random() * 10}s;
      opacity: ${0.2 + Math.random() * 0.4};
    `;
    container.appendChild(p);
  }
}

// ── Floating Footballs ─────────────────────────────────────────
function initFloatingBalls() {
  const container = document.getElementById('floating-balls');
  const count = 8;
  for (let i = 0; i < count; i++) {
    const b = document.createElement('div');
    b.className = 'floating-ball';
    b.textContent = '⚽';
    b.style.cssText = `
      left: ${Math.random() * 100}%;
      font-size: ${1.5 + Math.random() * 2.5}rem;
      animation-duration: ${15 + Math.random() * 20}s;
      animation-delay: ${Math.random() * 15}s;
    `;
    container.appendChild(b);
  }
}

// ── Confetti ───────────────────────────────────────────────────
function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#FFD700','#00E5FF','#4CAF50','#FF5252','#FFFFFF','#B8860B'];
  const pieces = [];
  const total = 120;

  for (let i = 0; i < total; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 200,
      w: 6 + Math.random() * 8,
      h: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: -2 + Math.random() * 4,
      vy: 2 + Math.random() * 4,
      angle: Math.random() * Math.PI * 2,
      spin: (-0.1 + Math.random() * 0.2),
      alpha: 1
    });
  }

  let frame;
  let startTime = null;
  const duration = 4000; // ms

  function draw(ts) {
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pieces.forEach(p => {
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.08;   // gravity
      p.angle += p.spin;
      p.alpha = Math.max(0, 1 - elapsed / duration);

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    if (elapsed < duration) {
      frame = requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  frame = requestAnimationFrame(draw);

  window.addEventListener('resize', () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }, { once: true });
}

// Boot
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initFloatingBalls();
});
