/* script.js – Leaderboard logic */

'use strict';

// ── State ──────────────────────────────────────────────────────
let allPlayers = [];
let filteredPlayers = [];
let maxPoints = 1;
let sortMode = 'points';

// ── DOM refs ───────────────────────────────────────────────────
const listEl       = document.getElementById('leaderboard-list');
const noResults    = document.getElementById('no-results');
const searchInput  = document.getElementById('search-input');
const sortSelect   = document.getElementById('sort-select');
const themeToggle  = document.getElementById('theme-toggle');
const loader       = document.getElementById('loader');
const lastUpdated  = document.getElementById('last-updated');
const currentDate  = document.getElementById('current-date');
const statPlayers  = document.getElementById('stat-players');
const statLeader   = document.getElementById('stat-leader');
const statHighest  = document.getElementById('stat-highest');
const statAvg      = document.getElementById('stat-avg');

// ── Helpers ────────────────────────────────────────────────────
function fmt(d) {
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function computeRanks(players) {
  // Competition ranking: equal points = same rank; next rank skips
  const sorted = [...players].sort((a, b) => b.points - a.points);
  let rank = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].points < sorted[i - 1].points) rank = i + 1;
    sorted[i].rank = rank;
  }
  return sorted;
}

function movementIcon(player, rankedList) {
  // prev_rank vs current rank
  const cur = player.rank;
  const prev = player.prev_rank;
  if (!prev) return { icon: '→', cls: 'move-same' };
  if (cur < prev) return { icon: `↑${prev - cur}`, cls: 'move-up' };
  if (cur > prev) return { icon: `↓${cur - prev}`, cls: 'move-down' };
  return { icon: '→', cls: 'move-same' };
}

function medalEmoji(rank) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
}

function rankClass(rank) {
  if (rank === 1) return 'rank-1';
  if (rank === 2) return 'rank-2';
  if (rank === 3) return 'rank-3';
  return 'rank-other';
}

// ── Render ─────────────────────────────────────────────────────
function render(players) {
  listEl.innerHTML = '';
  noResults.classList.toggle('hidden', players.length > 0);

  players.forEach((p, i) => {
    const rc   = rankClass(p.rank);
    const med  = medalEmoji(p.rank);
    const mv   = movementIcon(p, players);
    const pct  = Math.round((p.points / maxPoints) * 100);
    const delay = (i * 0.05).toFixed(2);

    const card = document.createElement('div');
    card.className = `player-card ${rc}`;
    card.style.animationDelay = `${delay}s`;

    card.innerHTML = `
      <div class="rank-badge" aria-label="Rank ${p.rank}">
        ${med
          ? `<span class="crown">👑</span>${med}`
          : `#${p.rank}`
        }
      </div>
      <div class="player-info">
        <div class="player-name">${p.name}</div>
        <div class="player-meta">
          <span class="player-flag">${p.country || ''}</span>
          <span class="player-movement ${mv.cls}">${mv.icon}</span>
        </div>
      </div>
      <div class="player-points">
        <div class="points-value">${p.points}</div>
        <div class="points-label">pts</div>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar-fill" data-pct="${pct}" style="width:0%"></div>
      </div>
    `;

    listEl.appendChild(card);

    // Animate progress bar after render
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const fill = card.querySelector('.progress-bar-fill');
        if (fill) fill.style.width = pct + '%';
      });
    });
  });
}

// ── Stats ──────────────────────────────────────────────────────
function updateStats(ranked) {
  statPlayers.textContent = ranked.length;
  const highest = ranked[0];
  statLeader.textContent  = highest ? highest.name.split(' ')[0] : '—';
  statHighest.textContent = highest ? highest.points + ' pts' : '—';
  const avg = ranked.reduce((s, p) => s + p.points, 0) / (ranked.length || 1);
  statAvg.textContent = ranked.length ? avg.toFixed(1) + ' pts' : '—';
}

// ── Apply filter + sort ────────────────────────────────────────
function applyView() {
  const q = searchInput.value.trim().toLowerCase();

  let list = allPlayers.filter(p =>
    p.name.toLowerCase().includes(q)
  );

  if (sortMode === 'alpha') {
    list = list.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    list = list.sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
    list = computeRanks(list);
  }

  filteredPlayers = list;
  render(filteredPlayers);
}

// ── Load data ──────────────────────────────────────────────────
async function loadData() {
  try {
    const res  = await fetch('data.json?_=' + Date.now());
    const data = await res.json();

    allPlayers = computeRanks(data);
    maxPoints  = Math.max(...allPlayers.map(p => p.points), 1);

    updateStats(allPlayers);
    applyView();
    lastUpdated.textContent = fmt(new Date());
  } catch (e) {
    console.error('Failed to load data.json:', e);
    listEl.innerHTML = `<p style="text-align:center;color:var(--text-muted);padding:2rem">⚠️ Could not load leaderboard data.</p>`;
  }
}

// ── Date display ───────────────────────────────────────────────
function updateDate() {
  currentDate.textContent = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

// ── Theme toggle ───────────────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem('theme') || 'dark';
  document.body.classList.toggle('light-mode', saved === 'light');
  themeToggle.textContent = saved === 'light' ? '🌙' : '☀️';
}

themeToggle.addEventListener('click', () => {
  const isLight = document.body.classList.toggle('light-mode');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  themeToggle.textContent = isLight ? '🌙' : '☀️';
});

// ── Events ─────────────────────────────────────────────────────
searchInput.addEventListener('input', applyView);

sortSelect.addEventListener('change', () => {
  sortMode = sortSelect.value;
  applyView();
});

// ── Boot ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  updateDate();

  await loadData();

  // Hide loader
  setTimeout(() => {
    loader.classList.add('hidden');
    // Confetti after reveal
    setTimeout(launchConfetti, 300);
  }, 800);

  // Auto-refresh every 30s
  setInterval(loadData, 30000);
});
