/* ═══════════════════════════════════════════════════════════
   DECADE CLOCK — script.js
   App state · Timeline engine · Ghost mode ·
   Mini-game (Future Simulation)
═══════════════════════════════════════════════════════════ */

'use strict';

// ─────────────────────────────────────────
// STATE
// ─────────────────────────────────────────
const state = {
  age:      22,
  sleep:    7,
  exercise: 3,
  screen:   5,
  work:     3,
  social:   5,
  learning: 2,
  diet:     5,
  stress:   6,
  ghostMode: false,
};

const optimalHabits = {
  sleep: 8, exercise: 6, screen: 2, work: 6,
  social: 10, learning: 10, diet: 9, stress: 2,
};

const sliderConfig = {
  sleep:    { min: 3,  max: 10 },
  exercise: { min: 0,  max: 7  },
  screen:   { min: 0,  max: 14 },
  work:     { min: 0,  max: 12 },
  social:   { min: 0,  max: 20 },
  learning: { min: 0,  max: 20 },
  diet:     { min: 1,  max: 10 },
  stress:   { min: 1,  max: 10 },
};

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────
const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
const norm  = (v, min, max) => (v - min) / (max - min);
const lerp  = (a, b, t) => a + (b - a) * t;

// ─────────────────────────────────────────
// SCORE ENGINE
// ─────────────────────────────────────────
function computeScores(s) {
  const sleepS    = clamp(norm(s.sleep,    3,  10) * 100);
  const exerciseS = clamp(norm(s.exercise, 0,   7) * 100);
  const screenP   = clamp(norm(s.screen,   0,  14) * 100);
  const workS     = clamp(norm(s.work,     0,  12) * 100);
  const socialS   = clamp(norm(s.social,   0,  20) * 100);
  const learningS = clamp(norm(s.learning, 0,  20) * 100);
  const dietS     = clamp(norm(s.diet,     1,  10) * 100);
  const stressP   = clamp(norm(s.stress,   1,  10) * 100);

  const health    = clamp(sleepS*0.3 + exerciseS*0.25 + dietS*0.2 - screenP*0.1 - stressP*0.15);
  const career    = clamp(workS*0.35 + learningS*0.3  + sleepS*0.15 - stressP*0.2);
  const happiness = clamp(socialS*0.3 + sleepS*0.2    + exerciseS*0.2 + dietS*0.15 - screenP*0.1 - stressP*0.05);
  const longevity = clamp(sleepS*0.25 + exerciseS*0.25 + dietS*0.2 - stressP*0.2 - screenP*0.1);
  const wealth    = clamp(workS*0.4  + learningS*0.35  - screenP*0.15 - stressP*0.1);
  const burnout   = clamp(stressP*0.4 + screenP*0.2   + workS*0.2 - sleepS*0.2);
  const focus     = clamp(sleepS*0.3  + learningS*0.25 - screenP*0.25 - stressP*0.2);
  const energy    = clamp(sleepS*0.35 + exerciseS*0.3  + dietS*0.2 - stressP*0.15);

  const trajectory = clamp(Math.round(
    (health + career + happiness + longevity*0.8 + wealth*0.8 + focus*0.7 + energy*0.9 - burnout*0.8) / 5.4
  ));

  return { health, career, happiness, longevity, wealth, burnout, focus, energy, trajectory };
}

function verdict(score) {
  if (score >= 85) return { text: '🚀 Exceptional trajectory. You\'re building a life others will study.', color: '#39ff82' };
  if (score >= 70) return { text: '✦ Strong path forward. Small refinements unlock elite outcomes.', color: '#f5c518' };
  if (score >= 55) return { text: '⚡ Solid foundation, but drift is already setting in.', color: '#f5c518' };
  if (score >= 40) return { text: '⚠️ You\'re running on borrowed time. Habits compound — so do their costs.', color: '#ff9f40' };
  return { text: '🔴 Current trajectory leads to a decade of regret. The change starts today.', color: '#ff4d6d' };
}

// ─────────────────────────────────────────
// TIMELINE GENERATOR
// ─────────────────────────────────────────
function generateTimeline(s, scores) {
  const events = [];
  const ages = [s.age, 25, 30, 35, 40, 50, 60]
    .filter((a, i, arr) => arr.indexOf(a) === i && a >= s.age).sort((a,b)=>a-b);

  const h  = scores.health    / 100;
  const c  = scores.career    / 100;
  const hap = scores.happiness / 100;
  const b  = scores.burnout   / 100;
  const w  = scores.wealth    / 100;
  const f  = scores.focus     / 100;

  const push = (age, type, title, desc, badge, ghostNote) =>
    events.push({ age, type, title, desc, badge, ghostNote });

  push(s.age, 'current',
    'You — Right Now',
    `Every slider you move compounds for ${60 - s.age} more years. This is Day 1.`,
    null, null);

  if (s.age < 25 && ages.includes(25)) {
    c > 0.6
      ? push(25, 'milestone', 'First career breakthrough',
          `${s.work}h/day of deep work is paying dividends. You're ahead of 80% of peers.`,
          'great', 'Ghost You reached this milestone 3 years later.')
      : push(25, 'warning', 'Career drift setting in',
          `Without focused output, opportunities flow to those who showed up consistently.`,
          'warn', 'Optimized You has clear direction here.');
  }

  if (s.age < 30 && ages.includes(30)) {
    if (scores.trajectory >= 70)
      push(30, 'milestone', 'Life compounding in your favor',
        `Fit, focused, financially growing. Your ${s.sleep}h sleep and ${s.exercise}x/week exercise are assets others can't buy.`,
        'great', 'Ghost You peaked here and stopped growing.');
    else if (scores.trajectory >= 45)
      push(30, 'neutral', 'The gap between you and your potential widens',
        `Fine — but fine isn't fulfilling. ${s.screen}h/day of screens quietly cost you 3 years of compounding skill.`,
        'info', 'Optimized You launched a side business at 29.');
    else
      push(30, 'warning', 'Burnout hits harder than expected',
        `Stress at ${s.stress}/10, only ${s.sleep}h sleep — your body is sending invoices you haven't opened yet.`,
        'warn', 'Optimized You never experienced this. Sleep + stress changes everything.');
  }

  if (s.age < 35 && ages.includes(35)) {
    const isWealthy = w > 0.6 && c > 0.55;
    push(35, isWealthy ? 'milestone' : 'neutral',
      isWealthy ? 'Financial independence within reach' : 'Money anxiety becomes background noise',
      isWealthy
        ? `${s.learning}h/week of learning + ${s.work}h deep work = building assets, not just income.`
        : `Low output means living reactively. The cost of each lost year of compounding becomes visible now.`,
      isWealthy ? 'great' : 'warn',
      isWealthy ? 'Ghost You is still catching up.' : 'Optimized You made this shift at 30.');
  }

  if (s.age < 40 && ages.includes(40)) {
    const healthy = h > 0.65;
    push(40, healthy ? 'milestone' : 'warning',
      healthy ? 'Your 40s feel like others\' 30s' : 'Body sends the first serious invoice',
      healthy
        ? `${s.exercise}x/week + ${s.diet}/10 diet quality are compounding in your biology. You are the exception.`
        : `Chronic stress (${s.stress}/10) and poor recovery have shaved an estimated 5–8 years off your health span.`,
      healthy ? 'great' : 'warn',
      healthy ? 'Ghost You is dealing with early metabolic issues.' : 'Still reversible — but the window is narrowing.');
  }

  if (s.age < 50 && ages.includes(50)) {
    const happy = hap > 0.6;
    push(50, happy ? 'milestone' : 'neutral',
      happy ? 'Relationships are your greatest asset' : 'Loneliness is the silent epidemic',
      happy
        ? `${s.social}h/week of real connection compounded into a network money can't buy.`
        : `Social investment of only ${s.social}h/week has a measurable health cost — equivalent to smoking, per research.`,
      happy ? 'great' : 'info',
      'Both timelines diverge sharply here based on social investment in your 20s–30s.');
  }

  push(60, scores.trajectory >= 65 ? 'milestone' : 'neutral',
    scores.trajectory >= 65 ? 'The life you designed, lived' : 'A life of what-ifs',
    scores.trajectory >= 65
      ? 'Cognitive sharpness, financial freedom, deep relationships. Built habit by habit, starting decades ago.'
      : 'Not a disaster — but a quiet disappointment. The version of you that could have been.',
    scores.trajectory >= 65 ? 'great' : null,
    scores.trajectory >= 65 ? 'Ghost You wishes they\'d started when you did.' : 'Optimized You is here. There\'s still time to join them.');

  return events;
}

// ─────────────────────────────────────────
// DOM UPDATE — MAIN APP
// ─────────────────────────────────────────
let scoreRaf = null, displayedScore = 0;

function animScore(target) {
  if (scoreRaf) cancelAnimationFrame(scoreRaf);
  const from = displayedScore, t0 = performance.now(), dur = 700;
  const tick = (now) => {
    const p = Math.min((now - t0) / dur, 1);
    displayedScore = Math.round(lerp(from, target, 1 - Math.pow(1 - p, 3)));
    document.getElementById('traj-num').textContent = displayedScore;
    document.getElementById('nav-score').textContent = displayedScore;
    if (p < 1) scoreRaf = requestAnimationFrame(tick);
  };
  scoreRaf = requestAnimationFrame(tick);
}

function updateSliders() {
  Object.keys(sliderConfig).forEach(key => {
    const cfg = sliderConfig[key];
    const pct = ((state[key] - cfg.min) / (cfg.max - cfg.min)) * 100;
    document.getElementById('hfill-' + key).style.width = pct + '%';
    document.getElementById('hval-'  + key).textContent = state[key];
  });
}

function updateImpacts(scores) {
  const items = {
    sleep:    { pos: scores.health > 60,    pos_t: '↑ Boosting health & focus', neg_t: `↓ Sleep debt accumulating` },
    exercise: { pos: scores.longevity > 55, pos_t: '↑ Adding healthy years',    neg_t: '↓ Sedentary risk rising' },
    screen:   { pos: state.screen < 4,      pos_t: '↑ Attention protected',     neg_t: `↓ Losing ${(state.screen * 365)|0} hrs/yr to scroll` },
    work:     { pos: scores.career > 60,    pos_t: '↑ Career compounding',      neg_t: '↓ Output below potential' },
    social:   { pos: scores.happiness > 60, pos_t: '↑ Relationship wealth',     neg_t: '↓ Isolation compounds slowly' },
    learning: { pos: state.learning > 5,    pos_t: '↑ Skills compounding fast', neg_t: '↓ Knowledge gap widening' },
    diet:     { pos: state.diet > 6,        pos_t: '↑ Cellular aging slowed',   neg_t: '↓ Inflammation rising' },
    stress:   { pos: state.stress < 5,      pos_t: '↑ Cortisol in check',       neg_t: '↓ Chronic stress shortens lifespan' },
  };
  Object.keys(items).forEach(key => {
    const el = document.getElementById('impact-' + key);
    const it = items[key];
    el.textContent = it.pos ? it.pos_t : it.neg_t;
    el.className   = 'habit-impact ' + (it.pos ? 'impact-pos' : 'impact-neg');
  });
}

function renderTimeline(events) {
  const tl = document.getElementById('timeline');
  tl.innerHTML = '';
  events.forEach((ev, i) => {
    const el = document.createElement('div');
    el.className = `tl-item ${ev.type || ''}`;
    el.innerHTML = `
      <div class="tl-age">${ev.age}</div>
      <div class="tl-node"></div>
      <div class="tl-content">
        <div class="tl-event-title">${ev.title}</div>
        <div class="tl-event-desc">${ev.desc}</div>
        ${ev.badge ? `<span class="tl-badge badge-${ev.badge}">${ev.badge==='great'?'● Thriving':ev.badge==='warn'?'⚠ Risk':'● Note'}</span>` : ''}
        ${ev.ghostNote ? `<div class="tl-ghost-note">👻 ${ev.ghostNote}</div>` : ''}
      </div>`;
    tl.appendChild(el);
    setTimeout(() => el.classList.add('visible'), 60 + i * 80);
  });
}

function renderMetrics(scores) {
  const defs = [
    { emoji:'❤️', label:'Health Score',   val:scores.health,    color:'#39ff82' },
    { emoji:'🚀', label:'Career Peak',     val:scores.career,    color:'#f5c518' },
    { emoji:'😊', label:'Happiness',       val:scores.happiness, color:'#c084fc' },
    { emoji:'🔥', label:'Burnout Risk',    val:scores.burnout,   color:'#ff4d6d' },
    { emoji:'⚡', label:'Energy',          val:scores.energy,    color:'#00e5ff' },
    { emoji:'🎯', label:'Focus',           val:scores.focus,     color:'#f5c518' },
    { emoji:'💰', label:'Wealth Path',     val:scores.wealth,    color:'#39ff82' },
    { emoji:'🕐', label:'Longevity',       val:scores.longevity, color:'#c084fc' },
  ];
  document.getElementById('metrics-grid').innerHTML = defs.map(m => `
    <div class="metric-card" style="--mc-color:${m.color}">
      <span class="metric-emoji">${m.emoji}</span>
      <div class="metric-label">${m.label}</div>
      <div class="metric-value">${Math.round(m.val)}<span style="font-size:12px;color:var(--muted)">/100</span></div>
    </div>`).join('');
}

function renderGhost() {
  const gPanel = document.getElementById('ghost-panel');
  const legG   = document.getElementById('leg-ghost');
  const tl     = document.getElementById('timeline');

  if (!state.ghostMode) {
    gPanel.classList.add('hidden');
    legG.classList.add('hidden');
    tl.classList.remove('ghost-active');
    return;
  }

  gPanel.classList.remove('hidden');
  legG.classList.remove('hidden');
  tl.classList.add('ghost-active');

  const cs = computeScores(state);
  const os = computeScores(optimalHabits);

  const rows = [
    { label:'Health @ 40',   now: cs.health,    opt: os.health,    hi: true  },
    { label:'Career Peak',   now: cs.career,    opt: os.career,    hi: true  },
    { label:'Happiness',     now: cs.happiness, opt: os.happiness, hi: true  },
    { label:'Burnout Risk',  now: cs.burnout,   opt: os.burnout,   hi: false },
    { label:'Longevity',     now: cs.longevity, opt: os.longevity, hi: true  },
    { label:'Wealth Path',   now: cs.wealth,    opt: os.wealth,    hi: true  },
  ];

  document.getElementById('ghost-grid').innerHTML = rows.map(r => {
    const diff   = Math.round(r.opt - r.now);
    const better = r.hi ? diff > 0 : diff < 0;
    const disp   = r.hi ? diff : -diff;
    return `
      <div class="ghost-compare-item">
        <div class="gci-label">${r.label}</div>
        <div class="gci-row"><span class="gci-key">You Now</span><span class="gci-val-now">${Math.round(r.now)}/100</span></div>
        <div class="gci-row">
          <span class="gci-key">Optimized</span>
          <span class="gci-val-ghost">
            ${Math.round(r.opt)}/100
            <span class="gci-delta ${better?'delta-pos':'delta-neg'}">${disp>0?'+':''}${disp}</span>
          </span>
        </div>
      </div>`;
  }).join('');
}

function update() {
  const scores = computeScores(state);

  // trajectory
  animScore(scores.trajectory);
  const pct = scores.trajectory + '%';
  document.getElementById('traj-fill').style.width = pct;
  document.getElementById('traj-glow').style.width = pct;
  const v = verdict(scores.trajectory);
  const verdEl = document.getElementById('traj-verdict');
  verdEl.textContent = v.text;
  verdEl.style.color = v.color;

  updateSliders();
  updateImpacts(scores);
  renderTimeline(generateTimeline(state, scores));
  renderMetrics(scores);
  renderGhost();

  // intro preview bar stays synced if visible
  updateIntroBar(scores.trajectory);
}

// ─────────────────────────────────────────
// INTRO PREVIEW BAR
// ─────────────────────────────────────────
function updateIntroBar(score) {
  const fill   = document.getElementById('ipb-fill');
  const glow   = document.getElementById('ipb-glow');
  const marker = document.getElementById('ipb-marker');
  const label  = document.getElementById('ipb-marker-label');
  if (!fill) return;
  fill.style.width   = score + '%';
  glow.style.width   = score + '%';
  marker.style.left  = score + '%';
  label.textContent  = score + '%';
}

// Boot the intro preview bar with default state score
(function initIntroBar() {
  const s = computeScores(state);
  // slight delay so CSS transitions fire after paint
  setTimeout(() => updateIntroBar(s.trajectory), 300);
})();

// ─────────────────────────────────────────
// SLIDER EVENTS
// ─────────────────────────────────────────
Object.keys(sliderConfig).forEach(key => {
  const input = document.getElementById('sl-' + key);
  if (!input) return;
  const valEl = document.getElementById('hval-' + key);
  const row   = input.closest('.habit-row');

  input.addEventListener('input', () => {
    state[key] = parseFloat(input.value);
    update();
    valEl.classList.add('popped');
    clearTimeout(valEl._pt);
    valEl._pt = setTimeout(() => valEl.classList.remove('popped'), 200);
    row.classList.add('pulse');
    clearTimeout(row._rt);
    row._rt = setTimeout(() => row.classList.remove('pulse'), 600);
  });
});

// Age stepper
document.getElementById('age-up').addEventListener('click',   () => { if (state.age < 45) { state.age++; syncAge(); update(); } });
document.getElementById('age-down').addEventListener('click', () => { if (state.age > 16) { state.age--; syncAge(); update(); } });
function syncAge() { document.getElementById('age-val').textContent = state.age; }

// Ghost toggle
document.getElementById('ghost-toggle').addEventListener('click', () => {
  state.ghostMode = !state.ghostMode;
  document.getElementById('ghost-toggle').classList.toggle('active', state.ghostMode);
  document.getElementById('ghost-badge').textContent = state.ghostMode ? 'ON' : 'OFF';
  update();
});

// Optimize
document.getElementById('optimize-btn').addEventListener('click', () => {
  Object.keys(optimalHabits).forEach((key, i) => {
    setTimeout(() => {
      const input = document.getElementById('sl-' + key);
      if (input) { input.value = optimalHabits[key]; state[key] = optimalHabits[key]; update(); }
    }, i * 70);
  });
});

// Reset
document.getElementById('reset-btn').addEventListener('click', () => {
  Object.assign(state, { sleep:7, exercise:3, screen:5, work:3, social:5, learning:2, diet:5, stress:6, age:22, ghostMode:false });
  Object.keys(sliderConfig).forEach(key => {
    const input = document.getElementById('sl-' + key);
    if (input) input.value = state[key];
  });
  document.getElementById('age-val').textContent = state.age;
  document.getElementById('ghost-toggle').classList.remove('active');
  document.getElementById('ghost-badge').textContent = 'OFF';
  update();
});

// Share
document.getElementById('share-btn').addEventListener('click', () => {
  const sc = computeScores(state);
  const txt = `My Decade Clock score: ${sc.trajectory}/100\nHealth: ${Math.round(sc.health)} · Career: ${Math.round(sc.career)} · Happiness: ${Math.round(sc.happiness)}\n${window.location.href}`;
  navigator.clipboard.writeText(txt).then(() => {
    const t = document.getElementById('share-toast');
    t.classList.remove('hidden');
    setTimeout(() => t.classList.add('hidden'), 2500);
  });
});

// ─────────────────────────────────────────
// INTRO → APP TRANSITION
// ─────────────────────────────────────────
document.getElementById('start-btn').addEventListener('click', () => {
  const intro = document.getElementById('intro-screen');
  const app   = document.getElementById('app');
  intro.classList.add('exit');
  setTimeout(() => {
    intro.style.display = 'none';
    app.classList.remove('hidden');
    update();
  }, 650);
});

// ═══════════════════════════════════════════════════════
//   MINI-GAME ENGINE — "Future Simulation"
// ═══════════════════════════════════════════════════════

const Game = (() => {

  // ── Canvas + context ──
  let canvas, ctx, W, H;

  // ── Game state ──
  let running      = false;
  let animId       = null;
  let lastTime     = 0;
  let elapsed      = 0;    // seconds survived
  let obsCount     = 0;
  let score        = 0;    // displayed as "years"

  // ── Player ──
  const player = {
    x: 0, y: 0,
    w: 32, h: 48,
    vx: 0,
    speed: 220,         // px/s, modified by exercise
    inputDelay: 0,      // ms lag from low sleep
    pendingDir: 0,      // delayed input buffer
    inputTimer: 0,
    color: '#f5c518',
    trail: [],          // trail particles
    lives: 3,
    invincible: 0,      // frames of invincibility after hit
  };

  // ── Obstacles ──
  let obstacles = [];
  let spawnTimer = 0;

  // ── Particles ──
  let particles = [];

  // ── Background stars ──
  let stars = [];

  // ── Habit-derived modifiers ──
  let mods = {};

  // ── Keys ──
  const keys = { left: false, right: false };

  // ─────────────────────────────────────
  // Compute game modifiers from habits
  // ─────────────────────────────────────
  function buildMods(s) {
    return {
      obstacleRate:   1 + (s.screen / 14) * 1.8,         // high screen → more obstacles
      playerSpeed:    220 + (s.exercise / 7) * 90,        // more exercise → faster
      inputLag:       s.sleep < 6 ? (6 - s.sleep) * 80 : 0,  // low sleep → delayed controls
      shakeIntensity: s.stress > 6 ? (s.stress - 6) * 1.5 : 0, // high stress → camera shake
      preview:        s.learning > 8,                     // high learning → obstacle preview
      baseSpeed:      1 + (s.stress / 10) * 0.5,          // stress accelerates obstacle speed
      extraLives:     Math.floor(s.diet / 4),              // good diet → extra lives
    };
  }

  // ─────────────────────────────────────
  // startGame
  // ─────────────────────────────────────
  function startGame(habitState) {
    canvas  = document.getElementById('game-canvas');
    ctx     = canvas.getContext('2d');
    W       = canvas.width;
    H       = canvas.height;

    mods    = buildMods(habitState);

    // Reset state
    running     = true;
    elapsed     = 0;
    obsCount    = 0;
    score       = 0;
    obstacles   = [];
    particles   = [];
    spawnTimer  = 0;
    lastTime    = performance.now();

    player.x         = W / 2;
    player.y         = H - 60;
    player.vx        = 0;
    player.speed     = mods.playerSpeed;
    player.inputDelay= mods.inputLag;
    player.pendingDir= 0;
    player.inputTimer= 0;
    player.trail     = [];
    player.lives     = 3 + mods.extraLives;
    player.invincible= 0;
    player.color     = '#f5c518';

    // Stars
    stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.2 + 0.2,
      opacity: Math.random() * 0.4 + 0.1,
      speed: Math.random() * 20 + 10,
    }));

    updateHUD();

    if (animId) cancelAnimationFrame(animId);
    animId = requestAnimationFrame(gameLoop);
  }

  // ─────────────────────────────────────
  // gameLoop
  // ─────────────────────────────────────
  function gameLoop(ts) {
    if (!running) return;
    const dt = Math.min((ts - lastTime) / 1000, 0.05); // cap at 50ms
    lastTime = ts;
    updateGame(dt);
    drawGame();
    animId = requestAnimationFrame(gameLoop);
  }

  // ─────────────────────────────────────
  // updateGame
  // ─────────────────────────────────────
  function updateGame(dt) {
    elapsed    += dt;
    score       = Math.round(elapsed * 0.5); // 1 "year" per 2 real seconds
    const speed = mods.baseSpeed + elapsed * 0.03; // ramp up over time

    // ── Input (with delay for low sleep) ──
    let dir = 0;
    if (keys.left)  dir = -1;
    if (keys.right) dir = 1;

    if (player.inputDelay > 0) {
      player.inputTimer += dt * 1000;
      if (dir !== 0) player.pendingDir = dir;
      if (player.inputTimer >= player.inputDelay) {
        dir = player.pendingDir;
        player.inputTimer = 0;
      } else {
        dir = 0; // wait for delay
      }
    }

    player.vx = dir * player.speed;
    player.x  = clamp(player.x + player.vx * dt, player.w / 2, W - player.w / 2);

    if (player.invincible > 0) player.invincible -= dt;

    // ── Trail ──
    player.trail.push({ x: player.x, y: player.y, alpha: 0.35 });
    if (player.trail.length > 12) player.trail.shift();
    player.trail.forEach(t => t.alpha *= 0.88);

    // ── Stars scroll ──
    stars.forEach(s => {
      s.y += s.speed * speed * dt;
      if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
    });

    // ── Spawn obstacles ──
    spawnTimer += dt;
    const spawnInterval = Math.max(0.35, 1.1 / (mods.obstacleRate * speed));
    if (spawnTimer >= spawnInterval) {
      spawnTimer = 0;
      spawnObstacle(speed);
    }

    // ── Update obstacles ──
    obstacles.forEach(ob => {
      ob.y += ob.vy * speed * dt;
      ob.x += ob.vx * dt;
      ob.rotation += ob.rotSpeed * dt;
      // bounce horizontally
      if (ob.x < ob.w/2 || ob.x > W - ob.w/2) ob.vx *= -1;
    });

    // ── Remove off-screen ──
    obstacles = obstacles.filter(ob => ob.y < H + 60);

    // ── Collision ──
    if (player.invincible <= 0) {
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const ob = obstacles[i];
        const dx = Math.abs(player.x - ob.x);
        const dy = Math.abs(player.y - ob.y);
        if (dx < (player.w/2 + ob.w/2)*0.75 && dy < (player.h/2 + ob.h/2)*0.7) {
          obstacles.splice(i, 1);
          obsCount++;
          player.lives--;
          player.invincible = 1.5;
          spawnParticles(player.x, player.y, '#ff4d6d', 16);
          shakeCanvas();
          updateHUD();
          if (player.lives <= 0) { endGame(); return; }
          break;
        }
      }
    }

    // ── Particles ──
    particles.forEach(p => {
      p.x   += p.vx * dt;
      p.y   += p.vy * dt;
      p.vy  += 180 * dt; // gravity
      p.life -= dt;
      p.alpha = p.life / p.maxLife;
    });
    particles = particles.filter(p => p.life > 0);

    // ── HUD ──
    updateHUD();

    // ── Stress shake (ongoing) ──
    if (mods.shakeIntensity > 0 && Math.random() < 0.04 * mods.shakeIntensity) {
      shakeCanvas();
    }
  }

  function spawnObstacle(speed) {
    const types = ['burnout','phone','debt','regret'];
    const type  = types[Math.floor(Math.random() * types.length)];
    const configs = {
      burnout: { w:28, h:28, color:'#ff4d6d', emoji:'🔥', vy:110 },
      phone:   { w:22, h:32, color:'#ff9900', emoji:'📱', vy:90  },
      debt:    { w:30, h:24, color:'#c084fc', emoji:'💸', vy:130 },
      regret:  { w:26, h:26, color:'#8888aa', emoji:'😔', vy:75  },
    };
    const cfg = configs[type];
    obstacles.push({
      x: cfg.w/2 + Math.random() * (W - cfg.w),
      y: mods.preview ? -80 : -40,   // preview shows earlier
      w: cfg.w, h: cfg.h,
      vx: (Math.random() - 0.5) * 60,
      vy: cfg.vy,
      color: cfg.color,
      emoji: cfg.emoji,
      type,
      rotation: 0,
      rotSpeed: (Math.random() - 0.5) * 3,
    });
  }

  function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd   = 80 + Math.random() * 160;
      particles.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 80,
        color,
        life: 0.5 + Math.random() * 0.4,
        maxLife: 0.5 + Math.random() * 0.4,
        r: 2 + Math.random() * 3,
        alpha: 1,
      });
    }
  }

  // ─────────────────────────────────────
  // drawGame
  // ─────────────────────────────────────
  function drawGame() {
    // Background
    ctx.fillStyle = '#05050f';
    ctx.fillRect(0, 0, W, H);

    // ── Stars ──
    stars.forEach(s => {
      ctx.globalAlpha = s.opacity;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // ── Road / ground line ──
    ctx.strokeStyle = 'rgba(245,197,24,0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 16]);
    ctx.beginPath();
    ctx.moveTo(W/2, 0); ctx.lineTo(W/2, H);
    ctx.stroke();
    ctx.setLineDash([]);

    // ── Timeline bar (left side) ──
    const pct = Math.min(elapsed / 60, 1);
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(8, 20, 6, H - 40);
    ctx.fillStyle = 'rgba(245,197,24,0.6)';
    ctx.fillRect(8, 20 + (H-40)*(1-pct), 6, (H-40)*pct);
    drawText('NOW', 18, H - 30, '#666', '8px', 'left');
    drawText('60', 18, 30, '#f5c518', '9px', 'left');

    // ── Year label ──
    const yearLabel = state.age + Math.round(elapsed * 0.5);
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#f5c518';
    ctx.font = 'bold 80px Syne, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AGE ' + yearLabel, W/2, H/2 + 30);
    ctx.restore();

    // ── Player preview indicator (learning buff) ──
    if (mods.preview) {
      obstacles.forEach(ob => {
        if (ob.y < 0) {
          ctx.globalAlpha = 0.3;
          ctx.strokeStyle = '#00e5ff';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 6]);
          ctx.beginPath();
          ctx.moveTo(ob.x, 0);
          ctx.lineTo(player.x, player.y - player.h/2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.globalAlpha = 1;
        }
      });
    }

    // ── Obstacles ──
    obstacles.forEach(ob => {
      ctx.save();
      ctx.translate(ob.x, ob.y);
      ctx.rotate(ob.rotation);
      // glow
      ctx.shadowColor  = ob.color;
      ctx.shadowBlur   = 14;
      ctx.fillStyle    = ob.color + '22';
      ctx.beginPath();
      ctx.arc(0, 0, ob.w/2 + 4, 0, Math.PI*2);
      ctx.fill();
      ctx.shadowBlur = 0;
      // emoji
      ctx.font = `${ob.w}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ob.emoji, 0, 0);
      ctx.restore();
    });

    // ── Player trail ──
    player.trail.forEach((t, i) => {
      ctx.globalAlpha = t.alpha * (i / player.trail.length);
      ctx.fillStyle   = player.color;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 6, 0, Math.PI*2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // ── Player ──
    const inv = player.invincible > 0 && Math.floor(player.invincible * 10) % 2 === 0;
    if (!inv) {
      ctx.save();
      ctx.shadowColor = player.color;
      ctx.shadowBlur  = 20;
      // body (capsule)
      ctx.fillStyle = player.color;
      ctx.beginPath();
      ctx.roundRect
        ? ctx.roundRect(player.x - player.w/2, player.y - player.h/2, player.w, player.h, 8)
        : ctx.rect(player.x - player.w/2, player.y - player.h/2, player.w, player.h);
      ctx.fill();
      ctx.shadowBlur = 0;
      // face emoji
      ctx.font = '20px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🧑', player.x, player.y);
      ctx.restore();
    }

    // ── Particles ──
    particles.forEach(p => {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // ── Lives ──
    for (let i = 0; i < player.lives; i++) {
      ctx.font = '14px serif';
      ctx.fillText('♥', W - 20 - i*18, 22);
    }
  }

  function drawText(txt, x, y, color, size, align) {
    ctx.font      = `${size} DM Sans, sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = align || 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(txt, x, y);
  }

  // ─────────────────────────────────────
  // Screen shake
  // ─────────────────────────────────────
  function shakeCanvas() {
    const wrap = document.getElementById('gm-canvas-wrap');
    wrap.classList.remove('shaking');
    void wrap.offsetWidth;
    wrap.classList.add('shaking');
  }

  // ─────────────────────────────────────
  // HUD update
  // ─────────────────────────────────────
  function updateHUD() {
    document.getElementById('gm-score').textContent       = score + ' yrs';
    document.getElementById('gm-obs-count').textContent   = obsCount;
    document.getElementById('gm-lives').textContent       = '♥'.repeat(Math.max(player.lives, 0));
    const spd = (mods.baseSpeed + elapsed * 0.03).toFixed(1);
    document.getElementById('gm-speed-display').textContent = spd + 'x';
  }

  // ─────────────────────────────────────
  // endGame — compare current vs optimal
  // ─────────────────────────────────────
  function endGame() {
    running = false;
    cancelAnimationFrame(animId);

    // Draw final frame with "GAME OVER" overlay
    drawGame();

    const yourScore = score;
    const optScore  = computeOptimalScore();

    // Build results
    const resultsEl  = document.getElementById('gm-results');
    const headerEl   = document.getElementById('gm-results-header');
    const yourScEl   = document.getElementById('gm-your-score');
    const yourVerdEl = document.getElementById('gm-your-verdict');
    const optScEl    = document.getElementById('gm-opt-score');
    const optVerdEl  = document.getElementById('gm-opt-verdict');
    const msgEl      = document.getElementById('gm-results-message');

    headerEl.textContent  = yourScore >= 25 ? '🏆 Survived!' : yourScore >= 15 ? '⚡ Not Bad.' : '💀 Game Over';
    yourScEl.textContent  = yourScore + ' yrs';
    optScEl.textContent   = optScore  + ' yrs';

    yourVerdEl.textContent = yourScore >= 25 ? 'Strong trajectory' : yourScore >= 15 ? 'Room to grow' : 'Habit debt caught up';
    optVerdEl.textContent  = 'Maximum survival';

    const diff = optScore - yourScore;
    msgEl.textContent = diff > 15
      ? `Optimized habits could earn you ${diff} more years of momentum. That gap is built — or destroyed — by daily choices like the ones you just set.`
      : diff > 5
      ? `You're ${diff} years behind your optimized self. Small habit shifts compound into a fundamentally different life.`
      : `You're close to your optimal self. A few tweaks — less screen time, more sleep — close the gap entirely.`;

    resultsEl.classList.remove('hidden');

    // Show game over on canvas overlay
    const overlayEl = document.getElementById('gm-overlay');
    document.getElementById('gm-overlay-title').textContent = yourScore >= 25 ? '🏆 You Survived!' : '💀 Life Caught Up';
    document.getElementById('gm-overlay-sub').textContent   = `You made it to ${yourScore} years. See results below.`;
    const startBtn = document.getElementById('gm-start-btn');
    startBtn.textContent = '▶ Play Again';
    overlayEl.classList.remove('hidden');
  }

  // Compute how long the optimal player would survive (approx)
  function computeOptimalScore() {
    const os = computeScores(optimalHabits);
    return Math.round(10 + os.trajectory * 0.45);
  }

  // ─────────────────────────────────────
  // Key events
  // ─────────────────────────────────────
  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft'  || e.key === 'a') keys.left  = true;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
  });
  window.addEventListener('keyup', e => {
    if (e.key === 'ArrowLeft'  || e.key === 'a') keys.left  = false;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
  });

  // Touch controls
  let touchStartX = null;
  window.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  window.addEventListener('touchmove',  e => {
    if (touchStartX === null) return;
    const dx = e.touches[0].clientX - touchStartX;
    keys.left  = dx < -10;
    keys.right = dx >  10;
  }, { passive: true });
  window.addEventListener('touchend', () => {
    keys.left = false; keys.right = false; touchStartX = null;
  });

  // ─────────────────────────────────────
  // Build modifier pill display
  // ─────────────────────────────────────
  function buildModifierPills(s) {
    const container = document.getElementById('gm-modifiers');
    const pills = [];

    if (s.exercise >= 5)  pills.push({ cls:'buff',    txt:`🏃 +${Math.round((s.exercise/7)*40)}% speed` });
    if (s.sleep < 6)      pills.push({ cls:'debuff',  txt:`😴 ${Math.round((6-s.sleep)*80)}ms input lag` });
    if (s.screen > 7)     pills.push({ cls:'debuff',  txt:`📱 +${Math.round((s.screen/14)*180)}% obstacles` });
    if (s.stress > 6)     pills.push({ cls:'debuff',  txt:`😤 Screen shake active` });
    if (s.learning > 8)   pills.push({ cls:'buff',    txt:`📚 Obstacle preview ON` });
    if (s.diet >= 7)      pills.push({ cls:'buff',    txt:`🥗 +${Math.floor(s.diet/4)} extra life` });
    if (pills.length === 0) pills.push({ cls:'neutral', txt:'Habits affecting difficulty...' });

    container.innerHTML = pills.map(p =>
      `<span class="gm-mod gm-mod-${p.cls}">${p.txt}</span>`
    ).join('');
  }

  // ─────────────────────────────────────
  // Public API
  // ─────────────────────────────────────
  return { startGame, buildModifierPills };

})();

// ─────────────────────────────────────────
// GAME MODAL WIRING
// ─────────────────────────────────────────
function openGameModal() {
  const modal = document.getElementById('game-modal');
  modal.classList.remove('hidden');

  // Show start overlay, hide results
  document.getElementById('gm-overlay').classList.remove('hidden');
  document.getElementById('gm-results').classList.add('hidden');
  document.getElementById('gm-overlay-title').textContent = '🎮 Future Simulation';
  document.getElementById('gm-overlay-sub').textContent   = 'Navigate through life\'s obstacles.\nYour habits shape the difficulty.';
  document.getElementById('gm-start-btn').textContent     = '▶ Start Game';

  // Build modifiers display
  Game.buildModifierPills(state);
}

function closeGameModal() {
  document.getElementById('game-modal').classList.add('hidden');
}

// Triggers
document.getElementById('open-game-btn').addEventListener('click',    openGameModal);
document.getElementById('game-banner-btn').addEventListener('click',  openGameModal);
document.getElementById('gm-close').addEventListener('click',         closeGameModal);
document.getElementById('game-modal-backdrop').addEventListener('click', closeGameModal);

// Start
document.getElementById('gm-start-btn').addEventListener('click', () => {
  document.getElementById('gm-overlay').classList.add('hidden');
  document.getElementById('gm-results').classList.add('hidden');
  Game.startGame(state);
});

// Restart
document.getElementById('gm-restart-btn').addEventListener('click', () => {
  document.getElementById('gm-results').classList.add('hidden');
  document.getElementById('gm-overlay').classList.remove('hidden');
  document.getElementById('gm-overlay-title').textContent = '🎮 Play Again';
  document.getElementById('gm-overlay-sub').textContent   = 'Your habits have been updated.\nDifficulty adjusted.';
  document.getElementById('gm-start-btn').textContent     = '▶ Start Again';
  Game.buildModifierPills(state);
});

// Optimize from within game modal
document.getElementById('gm-optimize-btn').addEventListener('click', () => {
  closeGameModal();
  Object.keys(optimalHabits).forEach((key, i) => {
    setTimeout(() => {
      const input = document.getElementById('sl-' + key);
      if (input) { input.value = optimalHabits[key]; state[key] = optimalHabits[key]; update(); }
    }, i * 70);
  });
});
