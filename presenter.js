/* ════════════════════════════════════════════════════════════
   POINT BREAK — presenter.js
   Live control + projection system.
   Problem → Solution → Twist → Fix

   State lives in localStorage ("pointBreakPresenterState") so a
   refresh never loses the event. A second window opened with
   ?screen=public mirrors that state as a clean audience screen.
   ════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const PB = window.PB;
  const PROBLEMS = PB.problems;
  const KEY = 'pointBreakPresenterState';
  const PUBLIC = new URLSearchParams(location.search).get('screen') === 'public';
  const REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const STAGES = [
    { n: '01', label: 'THE PROBLEM',  btn: 'SHOW PROBLEM' },
    { n: '02', label: 'THE SOLUTION', btn: 'SHOW SOLUTION' },
    { n: '03', label: 'THE TWIST',    btn: 'REVEAL TWIST' },
    { n: '04', label: 'THE FIX',      btn: 'SHOW FIX' },
  ];

  const STATUS = {
    unassigned: { icon: '○', text: 'UNASSIGNED' },
    ready:      { icon: '●', text: 'READY' },
    onstage:    { icon: '▶', text: 'ON STAGE' },
    twist:      { icon: '⚡', text: 'TWIST' },
    fix:        { icon: '↻', text: 'FIX' },
    complete:   { icon: '✓', text: 'COMPLETE' },
  };

  /* ══════════════════════════════════════════
     UTILS
  ══════════════════════════════════════════ */
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const hl = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b class="hl">$1</b>');
  const pad2 = n => String(n).padStart(2, '0');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const byId = id => PROBLEMS.find(p => p.id === id);
  const idx = id => S.order.indexOf(id);                 // board position (0-based)
  const POS = PB.positions;
  const isBackup = id => idx(id) >= PB.primaryCount;
  const ordered = () => S.order.map(byId);

  /* ══════════════════════════════════════════
     STATE + PERSISTENCE
  ══════════════════════════════════════════ */
  const blank = () => ({
    v: 3,
    order: PB.order.slice(),   // problem ids by board position (editing a number swaps two slots)
    teams: {},   // id -> { num, name }
    stage: {},   // id -> 0..3
    sub: {},     // id -> step index inside THE PROBLEM
    done: {},    // id -> true
    scores: {},  // id -> { und, ini, ... }
    locks: {},   // id -> { locked, at, v: {} }  (recorded decision, frozen when locked)
    ps: false,   // full problem statement sidebar
    openId: null,
    timer: { preset: 10, remaining: 600, running: false, endAt: 0, visible: false },
  });

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        const b = blank();
        delete s.nums;                                // v3: numbers are now positions, not free text
        if (!s.v || s.v < 2) {                       // v2: Factory Fire (3) and Production Line (15) traded places
          ['teams', 'stage', 'sub', 'done', 'scores', 'locks'].forEach(m => {
            if (!s[m]) return;
            const a = s[m][3], c = s[m][15];
            delete s[m][3]; delete s[m][15];
            if (c !== undefined) s[m][3] = c;
            if (a !== undefined) s[m][15] = a;
          });
          if (s.openId === 3) s.openId = 15; else if (s.openId === 15) s.openId = 3;
          s.v = 2;
        }
        s.v = 3;
        const ok = Array.isArray(s.order) && s.order.length === PB.order.length && PB.order.every(id => s.order.includes(id));
        if (!ok) s.order = PB.order.slice();
        return { ...b, ...s, timer: { ...b.timer, ...(s.timer || {}) } };
      }
    } catch (e) { /* storage blocked or corrupt — fall back to a blank event */ }
    return blank();
  }

  let S = load();

  function save() {
    if (PUBLIC) return;
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ }
  }

  /* "Presenting device" switch: removes the KEY and SCORE panels entirely on this device. */
  const SECRET_KEY = 'pointBreakHideSecrets';
  const secretsHidden = () => { try { return localStorage.getItem(SECRET_KEY) === '1'; } catch (e) { return false; } };
  const isSecretTab = t => t === 'key' || t === 'score';
  function applySecretMode() {
    document.body.classList.toggle('hide-secrets', secretsHidden());
  }
  applySecretMode();

  const numOf = id => POS[S.order.indexOf(id)] || pad2(id);

  // Typing a number on a card moves it there and swaps with whoever held that number.
  function setPosition(id, raw) {
    let label = String(raw || '').trim().toUpperCase();
    if (/^\d$/.test(label)) label = '0' + label;
    const to = POS.indexOf(label), from = S.order.indexOf(id);
    if (to < 0 || to === from) return false;
    [S.order[from], S.order[to]] = [S.order[to], S.order[from]];
    save();
    return true;
  }
  const team = id => S.teams[id] || { num: '', name: '' };
  const assigned = id => !!(team(id).num || team(id).name);
  const stageOf = id => S.stage[id] ?? 0;
  const teamNumLabel = id => (team(id).num ? 'TEAM ' + team(id).num : '');

  function statusOf(id) {
    if (!assigned(id)) return 'unassigned';
    if (S.done[id]) return 'complete';
    return ['ready', 'onstage', 'twist', 'fix'][stageOf(id)];
  }

  function pill(id) {
    const st = statusOf(id), m = STATUS[st];
    return `<span class="pill st-${st}"><span class="pill-ico" aria-hidden="true">${m.icon}</span>${m.text}</span>`;
  }

  /* ══════════════════════════════════════════
     BLOCK RENDERERS (public visuals)
  ══════════════════════════════════════════ */
  const tone = t => (t ? ' tone-' + t : '');
  const was = (w, v) => (w !== undefined ? `<span class="was">${esc(w)}</span><span class="was-arr">→</span>${esc(v)}` : esc(v));

  const BLK = {
    stats: b => `<div class="b-stats n${b.items.length}">${b.items.map(i => `
      <div class="stat${i.hot ? ' hot' : ''}">
        <div class="stat-n">${was(i.was, i.n)}</div>
        <div class="stat-l">${esc(i.l)}</div>
      </div>`).join('')}</div>`,

    cards: b => `<div class="b-cardswrap">${b.title ? `<div class="b-title">${esc(b.title)}</div>` : ''}
      <div class="b-cards" style="--cols:${b.cols || b.items.length}">${b.items.map(i => `
        <div class="card${tone(i.tone)}">
          ${i.tag ? `<div class="card-tag">${esc(i.tag)}</div>` : ''}
          ${i.title ? `<div class="card-title">${esc(i.title)}</div>` : ''}
          ${i.lines && i.lines.length ? `<ul class="card-lines">${i.lines.map(l => `<li>${hl(l)}</li>`).join('')}</ul>` : ''}
          ${i.stat ? `<div class="card-stat"><b>${esc(i.stat)}</b><span>${esc(i.statLabel || '')}</span></div>` : ''}
        </div>`).join('')}</div></div>`,

    versus: b => {
      const side = (s, cls) => `<div class="vs-side ${cls}${tone(s.tone)}"><div class="vs-n">${esc(s.n)}</div><div class="vs-l">${esc(s.l)}</div>${s.sub ? `<div class="vs-sub">${esc(s.sub)}</div>` : ''}</div>`;
      return `<div class="b-versus">${side(b.left, 'l')}<div class="vs-mid">VS</div>${side(b.right, 'r')}</div>`;
    },

    hero: b => `<div class="b-hero${b.small ? ' sm' : ''}">
      <div class="hero-n">${esc(b.n)}</div>
      <div class="hero-l">${esc(b.l)}</div>
      ${b.sub ? `<div class="hero-sub">${esc(b.sub)}</div>` : ''}
      ${b.bar !== undefined ? `<div class="hero-bar"><i style="width:${b.bar}%"></i></div>` : ''}
    </div>`,

    flow: b => {
      const big = b.items.length <= 2 ? ' big' : '';
      return `<div class="b-flow${big}">${b.items.map((i, n) => `
        ${n ? '<div class="fl-arrow" aria-hidden="true">→</div>' : ''}
        <div class="fl-item${i.hot ? ' hot' : ''}">
          <div class="fl-k">${esc(i.k)}</div>
          ${i.v !== undefined ? `<div class="fl-v">${i.was !== undefined ? `<s>${esc(i.was)}</s>` : ''}${esc(i.v)}<small>${esc(i.u || '')}</small></div>` : ''}
          ${i.s ? `<div class="fl-s">${esc(i.s)}</div>` : ''}
        </div>`).join('')}</div>`;
    },

    bars: b => `<div class="b-bars">${b.title ? `<div class="b-title">${esc(b.title)}</div>` : ''}${b.items.map(i => `
      <div class="bar-row${tone(i.tone)}">
        <div class="bar-l">${esc(i.l)}</div>
        <div class="bar-track"><i style="width:${clamp((i.v / i.max) * 100, 0, 100)}%"></i></div>
        <div class="bar-v">${i.was !== undefined ? `<s>${esc(i.was)}</s> → ` : ''}${esc(i.v)}${esc(i.u || '')}</div>
        ${i.p !== undefined ? `<div class="bar-p"><span>${esc(i.pl || '')}</span><div class="bar-ptrack"><i style="width:${i.p}%"></i></div><b>${i.p}%</b></div>` : ''}
      </div>`).join('')}</div>`,

    chips: b => `<div class="b-chips">${b.title ? `<div class="b-title">${esc(b.title)}</div>` : ''}
      <div class="chips">${b.items.map(c => `<span class="chip">${esc(c)}</span>`).join('')}</div></div>`,

    note: b => `<div class="b-note${tone(b.tone)}">${esc(b.text)}</div>`,

    battery: b => `<div class="b-battery">
      <div class="bat"><div class="bat-body"><i style="width:${b.pct}%"></i><span>${b.pct}%</span></div><div class="bat-tip"></div></div>
      <div class="hero-l">${esc(b.l)}</div>
      ${b.sub ? `<div class="hero-sub">${esc(b.sub)}</div>` : ''}
    </div>`,

    table: b => `<div class="b-table">${tableHTML(b.table)}</div>`,

    split: b => `<div class="b-split" style="grid-template-columns:${b.ratio || '1fr 1fr'}">
      <div class="col">${renderBlocks(b.a)}</div><div class="col">${renderBlocks(b.b)}</div></div>`,
  };

  function renderBlocks(list) {
    return (list || []).map(b => (BLK[b.t] ? BLK[b.t](b) : '')).join('');
  }

  /* ══════════════════════════════════════════
     STAGE BODIES
  ══════════════════════════════════════════ */
  function askHTML(c, cls) {
    return `<div class="ask ${cls || ''}">
      <div class="ask-main">
        <div class="ask-lab">${esc(c.label || 'THE CHALLENGE')}</div>
        <div class="ask-lead">${esc(c.lead)}</div>
      </div>
      ${c.items && c.items.length ? `<ul class="ask-items">${c.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>` : ''}
    </div>`;
  }

  const stepsOf = p => PB.steps[p.id] || [];
  const stepCount = p => stepsOf(p).length + 1;          // + the challenge step
  const subOf = p => clamp(S.sub[p.id] ?? 0, 0, stepCount(p) - 1);

  const tableHTML = t => `<table class="t-table${t.hot ? ' hot' : ''}"><thead><tr>${t.head.map((h, k) => `<th${t.hotCols && t.hotCols.includes(k) ? ' class="hc"' : ''}>${esc(h)}</th>`).join('')}</tr></thead>
    <tbody>${t.rows.map((r, i) => `<tr${t.total && i === t.rows.length - 1 ? ' class="tot"' : ''}>${r.map((c, k) => `<td${t.hotCols && t.hotCols.includes(k) ? ' class="hc"' : ''}>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;

  const listHTML = s => (s.list ? `<ul class="t-list${s.twoCol ? ' two' : ''}${s.num ? ' num' : ''}">${s.list.map(i => `<li>${hl(i)}</li>`).join('')}</ul>` : '');

  function stepHTML(s) {
    return `
      <div class="t-k">${esc(s.k)}</div>
      ${s.lead ? `<h2 class="t-lead">${hl(s.lead)}</h2>` : ''}
      ${s.sub ? `<p class="t-sub">${hl(s.sub)}</p>` : ''}
      ${s.rows ? `<div class="t-rows${s.wide ? ' wide' : ''}">${s.rows.map(r => `<div class="t-row"><span class="t-rk">${esc(r.k)}</span><span class="t-rt">${hl(r.t)}</span></div>`).join('')}</div>` : ''}
      ${s.cols ? `<div class="t-cols n${s.cols.length}">${s.cols.map(c => `<div class="t-col"><div class="t-ctag">${esc(c.tag)}</div>${c.lines.map(l => `<div class="t-cl">${hl(l)}</div>`).join('')}</div>`).join('')}</div>` : ''}
      ${s.table ? tableHTML(s.table) : ''}
      ${s.viz ? `<div class="step-viz">${renderBlocks([s.viz])}</div>` : ''}
      ${s.listAfter ? '' : listHTML(s)}
      ${s.foot ? `<p class="t-foot">${hl(s.foot)}</p>` : ''}
      ${s.listAfter ? listHTML(s) : ''}`;
  }

  function challengeHTML(c) {
    return `
      <div class="t-k ch">THE CHALLENGE</div>
      <h2 class="t-lead">${hl(c.lead)}</h2>
      ${c.label ? `<p class="t-sub">${hl(c.label)}</p>` : ''}
      ${c.items && c.items.length ? `<ul class="t-list${c.items.length > 4 ? ' two' : ''}">${c.items.map(i => `<li>${hl(i)}</li>`).join('')}</ul>` : ''}
      ${c.foot ? `<p class="t-foot">${hl(c.foot)}</p>` : ''}`;
  }

  function bodyProblem(p) {
    const steps = stepsOf(p), n = subOf(p);
    return `<div class="stage-body s-problem"><div class="step">${n < steps.length ? stepHTML(steps[n]) : challengeHTML(p.problem.challenge)}</div></div>`;
  }

  /* ── lock-in: the team's recorded decision ── */
  const ensureLock = id => (S.locks[id] = S.locks[id] || { locked: false, v: {} });

  function lockLines(p) {
    const L = S.locks[p.id];
    if (!L || !L.locked) return null;
    const out = [];
    (PB.locks[p.id] || []).forEach(s => {
      const v = L.v[s.k], val = Array.isArray(v) ? v.join(' + ') : v;
      if (val) out.push({ l: s.label, v: val });
    });
    if (L.v.note) out.push({ l: 'In brief', v: L.v.note });
    return out;
  }

  const lockBar = (p, label) => {
    const ls = lockLines(p);
    if (!ls) return '';
    return `<div class="lockbar"><span class="lb-h">🔒 ${esc(label)}</span>${ls.map(x => `<span class="lb-i"><em>${esc(x.l)}</em>${esc(x.v)}</span>`).join('')}</div>`;
  };

  function bodySolution(p) {
    const t = team(p.id);
    const steps = stepsOf(p);
    const cols = steps.map(s => `<div class="sum-col cmp">${stepHTML(s)}</div>`)
      .concat(`<div class="sum-col cmp">${challengeHTML(p.problem.challenge)}</div>`);
    // wide content (side-by-side cards, tables) gets a wider column
    const weights = steps.map(s => (s.cols ? (s.tight ? '2.6fr' : '2fr') : s.table || s.rows || s.viz ? '1.25fr' : '1fr')).concat('1fr').join(' ');
    return `<div class="stage-body s-solution">
      <div class="sol-band">
        <div class="eyebrow">THE SOLUTION · EXPLAIN YOUR PLAN</div>
        <div class="sb-team">${t.num ? `<span class="sb-num">TEAM ${esc(t.num)}</span>` : ''}${t.name ? `<span class="sb-name">${esc(t.name)}</span>` : ''}${!t.num && !t.name ? '<span class="sb-name dim">YOUR TEAM</span>' : ''}</div>
      </div>
      <div class="sum-grid" style="--n:${cols.length};grid-template-columns:${weights}">${cols.join('')}</div>
      ${lockBar(p, 'LOCKED IN')}
    </div>`;
  }

  function bodyTwist(p) {
    const tw = p.twist;
    const len = (tw.quote || '').length;
    const factsHTML = tw.facts && tw.facts.length ? `<ul class="tw-facts">${tw.facts.map(f => `<li>${hl(f)}</li>`).join('')}</ul>` : '';
    const qs = len < 60 ? 4.6 : len < 100 ? 3.5 : len < 150 ? 2.9 : 2.4;
    const cols = tw.cols ? `<div class="t-cols n${tw.cols.length} tw-cols">${tw.cols.map(c => `<div class="t-col"><div class="t-ctag">${esc(c.tag)}</div>${c.lines.map(l => `<div class="t-cl">${hl(l)}</div>`).join('')}</div>`).join('')}</div>` : '';
    const cons = tw.unchanged ? `<p class="tw-unch">${hl(tw.unchanged)}</p>` : tw.constraints ? `<div class="tw-cons"><div class="b-title">${hl(tw.constraints.label)}</div><div class="chips">${tw.constraints.items.map(c => `<span class="chip">${esc(c)}</span>`).join('')}</div></div>` : '';
    const nc = tw.newChallenge;
    const strip = nc && !tw.unchanged
      ? `<div class="tw-new full"><div class="tn-h"><span>NEW CHALLENGE</span><b>${esc(nc.lead)}</b></div>
          ${nc.label ? `<p class="tn-l">${hl(nc.label)}</p>` : ''}
          ${nc.items ? `<ul class="t-list two tn-list">${nc.items.map(i => `<li>${hl(i)}</li>`).join('')}</ul>` : ''}
          ${nc.foot ? `<p class="tn-f">${hl(nc.foot)}</p>` : ''}</div>`
      : `<div class="tw-new"><span>NEW CHALLENGE</span><b>${esc(tw.challenge)}</b></div>`;
    return `<div class="stage-body s-twist${tw.compact ? ' compact' : ''}">
      <div class="tw">
        <div class="eyebrow tw-eye">⚡ THE TWIST ⚡</div>
        <div class="tw-lead">${hl(tw.lead)}</div>
        ${tw.quote ? `<div class="tw-quote" style="--qs:${qs}rem">“${hl(tw.quote)}”</div>` : ''}
        ${tw.factsLast ? '' : factsHTML}
        ${cols}
        ${tw.blocks && tw.blocks.length ? `<div class="blocks">${renderBlocks(tw.blocks)}</div>` : ''}
        ${tw.factsLast ? factsHTML : ''}
        ${cons}
        ${tw.options ? `<div class="b-chips"><div class="b-title">You may</div><div class="chips">${tw.options.map(c => `<span class="chip">${esc(c)}</span>`).join('')}</div></div>` : ''}
      </div>
      ${lockBar(p, 'THEIR ORIGINAL DECISION · LOCKED')}
      ${strip}
    </div>`;
  }

  function bodyFix(p) {
    const done = S.done[p.id], tw = p.twist, nc = tw.newChallenge;
    if (nc && tw.unchanged) {
      return `<div class="stage-body s-fix">
        <div class="fix fix-nc">
          <div class="eyebrow">THE FIX</div>
          <div class="fix-big sm">YOUR ORIGINAL PLAN IS NO LONGER ENOUGH.</div>
          <div class="nc-lead">${hl(nc.lead)}</div>
          ${nc.label ? `<p class="nc-lab">${hl(nc.label)}</p>` : ''}
          <ul class="t-list nc-list">${nc.items.map(i => `<li>${hl(i)}</li>`).join('')}</ul>
          ${nc.foot ? `<p class="nc-foot">${hl(nc.foot)}</p>` : ''}
        </div>
        ${lockBar(p, 'THEIR ORIGINAL DECISION · LOCKED')}
        ${done ? '<div class="stamp">✓ PROBLEM COMPLETE</div>' : ''}
      </div>`;
    }
    const head = tw.fixHead ? tw.fixHead.map(esc).join('<br>') : 'YOUR ORIGINAL PLAN<br>IS NO LONGER ENOUGH.';
    return `<div class="stage-body s-fix">
      <div class="fix">
        <div class="eyebrow">THE FIX</div>
        <div class="fix-big${tw.fixHead ? ' long' : ''}">${head}</div>
        <div class="fix-adapt">${tw.fixHead ? 'RECONSIDER.' : 'ADAPT.'}</div>
        <div class="fix-ask">${esc(tw.challenge)}</div>
        ${tw.fixNote ? `<p class="fix-note">${hl(tw.fixNote)}</p>` : ''}
      </div>
      ${lockBar(p, 'THEIR ORIGINAL DECISION · LOCKED')}
      <div class="recap"><span class="rc-lab">⚡ WHAT CHANGED</span><span class="rc-tx">${esc(tw.recap)}</span></div>
      ${done ? '<div class="stamp">✓ PROBLEM COMPLETE</div>' : ''}
    </div>`;
  }

  /* ── full problem statement sidebar (so nobody forgets part 1 by part 3) ── */
  function psHTML(p) {
    const s = stageOf(p.id), tw = p.twist;
    let h = `<div class="ps-h"><span>THE FULL PROBLEM</span><b>${esc(numOf(p.id))} · ${esc(p.title)}</b></div>`;
    stepsOf(p).forEach(st => { h += `<section class="ps-sec">${stepHTML(st)}</section>`; });
    h += `<section class="ps-sec">${challengeHTML(p.problem.challenge)}</section>`;
    const L = lockLines(p);
    if (L && s >= 1) h += `<section class="ps-sec ps-lock"><div class="t-k">🔒 THEIR LOCKED DECISION</div>${L.map(x => `<p class="t-sub"><b>${esc(x.l)}:</b> ${esc(x.v)}</p>`).join('')}</section>`;
    if (s >= 2) {
      h += `<section class="ps-sec ps-twist"><div class="t-k">⚡ THE TWIST</div><h2 class="t-lead">${hl(tw.lead)}</h2>
        ${tw.quote ? `<p class="t-sub">“${hl(tw.quote)}”</p>` : ''}
        ${(tw.facts || []).map(f => `<p class="t-sub">${hl(f)}</p>`).join('')}
        ${(tw.cols || []).map(c => `<p class="t-sub"><b>${esc(c.tag)}</b> — ${c.lines.map(hl).join(' ')}</p>`).join('')}
        ${tw.constraints ? `<p class="t-sub">${hl(tw.constraints.label)} ${tw.constraints.items.map(esc).join(' · ')}</p>` : ''}
        ${tw.newChallenge ? `<p class="t-sub"><b>New challenge:</b> ${hl(tw.newChallenge.lead)} ${hl(tw.newChallenge.label || '')}</p>${tw.newChallenge.items ? `<ul class="t-list">${tw.newChallenge.items.map(i => `<li>${hl(i)}</li>`).join('')}</ul>` : ''}${tw.newChallenge.foot ? `<p class="t-foot">${hl(tw.newChallenge.foot)}</p>` : ''}` : `<p class="t-sub"><b>New challenge:</b> ${esc(tw.challenge)}</p>`}
        ${tw.fixNote ? `<p class="t-sub">${hl(tw.fixNote)}</p>` : ''}</section>`;
    }
    return h;
  }

  function renderPs(p) {
    const on = !!S.ps && !!p && stageOf(p.id) !== 1;   // THE SOLUTION already shows the whole problem
    document.body.classList.toggle('ps-on', on);
    const el = $('psSide');
    el.hidden = !on;
    if (on) {
      const top = el.scrollTop;
      el.innerHTML = psHTML(p);
      // once the twist is out, show the newest part (twist + decision) at the bottom
      el.scrollTop = stageOf(p.id) >= 2 ? el.scrollHeight : top;
    } else el.innerHTML = '';
  }

  /* ══════════════════════════════════════════
     VIEW SWITCHING
  ══════════════════════════════════════════ */
  function showView() {
    const open = S.openId != null && byId(S.openId);
    $('boardView').hidden = !!open;
    $('stageView').hidden = !open;
    document.body.dataset.view = open ? 'stage' : 'board';
    if (!open) { document.body.classList.remove('ps-on'); $('psSide').hidden = true; }
  }

  /* ══════════════════════════════════════════
     BOARD
  ══════════════════════════════════════════ */
  function cardHTML(p) {
    const t = team(p.id), st = statusOf(p.id);
    const teamBlock = PUBLIC
      ? `<div class="pc-team ro"><div class="ro-num">${t.num ? 'TEAM ' + esc(t.num) : ''}</div><div class="ro-name">${esc(t.name) || '&nbsp;'}</div></div>`
      : `<div class="pc-team">
          <label class="f-num"><span>TEAM</span><input class="in-num" data-f="num" data-id="${p.id}" value="${esc(t.num)}" maxlength="3" inputmode="numeric" placeholder="00" aria-label="Team number for problem ${p.id}"></label>
          <input class="in-name" data-f="name" data-id="${p.id}" value="${esc(t.name)}" maxlength="28" placeholder="TEAM NAME" aria-label="Team name for problem ${p.id}">
        </div>`;
    const pnum = PUBLIC
      ? `<span class="pc-num">${esc(numOf(p.id))}</span>`
      : `<input class="in-pnum" data-f="pnum" data-id="${p.id}" value="${esc(numOf(p.id))}" maxlength="3" placeholder="00" aria-label="Problem number (editable)" title="Edit the problem number">`;
    return `<article class="pcard st-${st}" data-id="${p.id}">
      <div class="pc-top">${pnum}${isBackup(p.id) ? '<span class="pc-tag">BACKUP</span>' : ''}</div>
      <button class="pc-open" data-open="${p.id}" aria-label="Open problem ${esc(numOf(p.id))}: ${esc(p.title)}">
        <span class="pc-title">${esc(p.title)}</span>
      </button>
      ${teamBlock}
      <div class="pc-foot">${pill(p.id)}</div>
    </article>`;
  }

  function renderBoard() {
    const prim = ordered().slice(0, PB.primaryCount);
    const back = ordered().slice(PB.primaryCount);
    // Keep focus if an input is mid-edit (board re-render only happens on view change / reset)
    $('gridPrimary').innerHTML = prim.map(cardHTML).join('');
    $('gridBackup').innerHTML = back.map(cardHTML).join('');
    $('backupTitle').hidden = !back.length;
    const done = prim.filter(p => S.done[p.id]).length;
    $('bdCount').textContent = `${done} / ${prim.length} COMPLETE`;
  }

  function refreshCard(id) {
    const card = document.querySelector(`.pcard[data-id="${id}"]`);
    if (!card) return;
    const st = statusOf(id);
    card.className = `pcard st-${st}`;
    card.querySelector('.pc-foot .pill').outerHTML = pill(id);
  }

  /* ══════════════════════════════════════════
     LIVE PROBLEM VIEW
  ══════════════════════════════════════════ */
  const cur = () => (S.openId != null ? byId(S.openId) : null);

  function renderHeader(p) {
    const t = team(p.id);
    $('phNum').textContent = numOf(p.id);
    $('phTitle').textContent = p.title;
    $('phBadge').hidden = !isBackup(p.id);
    $('phTeam').innerHTML = (t.num || t.name)
      ? `${t.num ? `<span class="pt-num">TEAM ${esc(t.num)}</span>` : ''}${t.name ? `<span class="pt-name">${esc(t.name)}</span>` : ''}`
      : `<span class="pt-name dim no-fs">UNASSIGNED</span>`;
  }

  function renderProgress(p) {
    const s = stageOf(p.id), all = !!S.done[p.id] && s === 3;
    $('prog').innerHTML = STAGES.map((st, i) => {
      const state = all || i < s ? 'done' : i === s ? 'active' : 'todo';
      const ico = state === 'done' ? '✓' : state === 'active' ? (i === 2 ? '⚡' : '●') : '○';
      return `<button class="pg ${state}${i === 2 ? ' pg-tw' : ''}" data-s="${i}" tabindex="-1"${state === 'active' ? ' aria-current="step"' : ''}>
        <i class="pg-bar"></i><span class="pg-l"><span class="pg-ico" aria-hidden="true">${ico}</span>${st.n} ${st.label}</span></button>`;
    }).join('');
  }

  function renderMain(p, animate) {
    const s = stageOf(p.id);
    const html = [bodyProblem, bodySolution, bodyTwist, bodyFix][s](p);
    const main = $('pvMain');
    main.innerHTML = html;
    main.dataset.stage = s;
    if (s === 1) requestAnimationFrame(fitSolution);
    const total = stepCount(p);
    $('pfDots').innerHTML = s === 0 ? Array.from({ length: total }, (_, i) => `<i class="${i < subOf(p) ? 'done' : i === subOf(p) ? 'cur' : ''}"></i>`).join('') : '';
    if (animate !== false) {
      const b = main.firstElementChild;
      b.classList.add('enter');
    }
  }

  /* THE SOLUTION shows the whole problem: shrink it to fit instead of ever clipping it */
  function fitSolution() {
    const g = document.querySelector('.sum-grid');
    if (!g) return;
    let f = 1;
    g.style.zoom = 1;
    const over = () => [...g.children].some(c => c.scrollHeight > c.clientHeight + 2);
    while (over() && f > 0.55) { f -= 0.04; g.style.zoom = f.toFixed(2); }
  }
  window.addEventListener('resize', () => { if (S.openId != null && stageOf(S.openId) === 1) fitSolution(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (S.openId != null && stageOf(S.openId) === 1) fitSolution(); });

  function renderCtl(p) {
    const d = $('ctl');
    if (PUBLIC) { d.hidden = true; return; }
    d.hidden = false;
    const s = stageOf(p.id), done = !!S.done[p.id], i = idx(p.id);
    d.innerHTML = `
      <button class="dk" data-a="board" title="Problem board (H)" aria-label="Problem board">⌂</button>
      <span class="dk-sep"></span>
      <button class="dk" data-a="prev" title="Previous (←)" aria-label="Previous"${s <= 0 && subOf(p) <= 0 ? ' disabled' : ''}>‹</button>
      <span class="dk-cur">${STAGES[s].label}${s === 0 ? ` · ${subOf(p) + 1}/${stepCount(p)}` : ''}</span>
      <button class="dk" data-a="next" title="Next (→)" aria-label="Next"${s >= 3 ? ' disabled' : ''}>›</button>
      <button class="dk twist${s >= 2 ? ' on' : ''}" data-a="twist" title="Reveal the twist (or press →)">⚡ ${s >= 2 ? 'TWIST' : 'REVEAL TWIST'}</button>
      <button class="dk ${done ? '' : 'ok'}" data-a="complete">${done ? '↺ REOPEN' : '✓ COMPLETE'}</button>
      ${done && i < S.order.length - 1 ? '<button class="dk ok" data-a="nextTeam">NEXT TEAM ›</button>' : ''}
      <span class="dk-sep"></span>
      <button class="dk${S.ps ? ' on' : ''}" data-a="ps"${s === 1 ? ' disabled' : ''} title="${s === 1 ? 'The whole problem is already on this screen' : 'Show / hide the full problem (P)'}">☰ PROBLEM</button>
      <button class="dk priv${(S.locks[p.id] || {}).locked ? ' ok' : ''}" data-a="lock" title="Record & lock the team's decision (L)">${(S.locks[p.id] || {}).locked ? '🔒 LOCKED' : '🔒 LOCK IN'}</button>
      <button class="dk priv" data-a="key" title="Organizer key (K)">ORGANIZER</button>
      <button class="dk" data-a="fs" title="Fullscreen (F)" aria-label="Fullscreen">⛶</button>`;
    showDock();
  }

  /* dock fades away when idle so the projector stays clean */
  let dockTimer = null, cursorTimer = null;
  function showDock() {
    const d = $('ctl');
    if (PUBLIC) return;
    document.body.classList.add('show-cursor');                // fullscreen hides the pointer; bring it back while it moves
    clearTimeout(cursorTimer);
    cursorTimer = setTimeout(() => document.body.classList.remove('show-cursor'), 3200);
    if (S.openId == null) return;
    d.classList.add('show');
    clearTimeout(dockTimer);
    dockTimer = setTimeout(() => {
      if (!d.matches(':hover') && !d.contains(document.activeElement) && !drawerOpen) d.classList.remove('show');
    }, 3200);
  }
  ['mousemove', 'keydown', 'touchstart'].forEach(ev => document.addEventListener(ev, showDock, { passive: true }));

  function renderStage(animate) {
    const p = cur();
    if (!p) return;
    renderHeader(p);
    renderProgress(p);
    renderMain(p, animate);
    renderCtl(p);
    renderPs(p);
    if (drawerOpen) renderDrawer(true);
  }

  function renderAll() {
    showView();
    if (cur()) renderStage(false); else renderBoard();
    tickTimer();
  }

  /* ══════════════════════════════════════════
     NAVIGATION + STAGE CHANGES
  ══════════════════════════════════════════ */
  let fxBusy = false;

  function openProblem(id) {
    if (!byId(id)) return;
    S.openId = id;
    S.stage[id] = 0;                          // opening a card always starts at the first part of the problem
    S.sub[id] = 0;                            // (a recorded decision / lock-in is kept)
    save();
    showView();
    renderStage(true);
    closeDrawer();
  }

  function toBoard() {
    if (fxBusy) return;
    S.openId = null;
    save();
    closeDrawer();
    showView();
    renderBoard();
  }

  function stepTeam(d) {
    if (fxBusy) return;
    const i = idx(S.openId) + d;
    if (i < 0 || i >= S.order.length) return;
    openProblem(S.order[i]);
  }

  function applyStage(n) {
    const id = S.openId;
    S.stage[id] = n;
    S.done[id] = false;
    save();
    renderStage(true);
  }

  function setStage(n) {
    if (fxBusy || S.openId == null) return;
    n = clamp(n, 0, 3);
    const from = stageOf(S.openId);
    if (n === from) return;
    if (n === 2 && from < 2) { playTwist(() => applyStage(2)); return; }
    applyStage(n);
  }

  // → / ← walk through the problem steps first, then across stages
  function navNext() {
    const p = cur(); if (!p || fxBusy) return;
    const s = stageOf(p.id);
    if (s === 0 && subOf(p) < stepCount(p) - 1) { S.sub[p.id] = subOf(p) + 1; save(); renderStage(true); return; }
    setStage(s + 1);
  }

  function navPrev() {
    const p = cur(); if (!p || fxBusy) return;
    const s = stageOf(p.id);
    if (s === 0) { if (subOf(p) > 0) { S.sub[p.id] = subOf(p) - 1; save(); renderStage(true); } return; }
    if (s === 1) S.sub[p.id] = stepCount(p) - 1;
    setStage(s - 1);
  }

  function complete() {
    const id = S.openId;
    if (id == null || fxBusy) return;
    if (S.done[id]) {
      S.done[id] = false;
    } else {
      S.stage[id] = 3;
      S.done[id] = true;
    }
    save();
    renderStage(false);
  }

  /* ══════════════════════════════════════════
     TWIST TRANSITION  (≈2.6 s, skippable)
  ══════════════════════════════════════════ */
  let fxTimers = [], fxApply = null;

  function endFx() {
    fxTimers.forEach(clearTimeout);
    fxTimers = [];
    if (fxApply) { const f = fxApply; fxApply = null; f(); }
    const fx = $('twistFx');
    fx.className = 'twist-fx';
    fx.innerHTML = '';
    $('pvMain').classList.remove('glitch');
    fxBusy = false;
  }

  function playTwist(applyFn) {
    if (REDUCED) { applyFn(); return; }
    fxBusy = true;
    fxApply = applyFn;
    const fx = $('twistFx');
    fx.innerHTML = `<div class="fx-scan"></div><div class="fx-rgb"></div>
      <div class="fx-l1">THE ECLIPSE<br>CHANGES EVERYTHING.</div>
      <div class="fx-l2">⚡ THE TWIST ⚡</div>`;
    fx.className = 'twist-fx on';
    $('pvMain').classList.add('glitch');
    const at = (ms, fn) => fxTimers.push(setTimeout(fn, ms));
    at(320,  () => fx.classList.add('dark'));
    at(650,  () => fx.classList.add('l1'));
    at(1500, () => { fx.classList.remove('l1'); fx.classList.add('l2'); });
    at(2150, () => { const f = fxApply; fxApply = null; if (f) f(); fx.classList.add('out'); });
    at(2750, endFx);
  }

  /* ══════════════════════════════════════════
     FULLSCREEN
  ══════════════════════════════════════════ */
  function setFs(on) {
    if (PUBLIC) return;
    document.body.classList.toggle('fs', on);
    if (on) {
      const el = document.documentElement;
      if (!document.fullscreenElement && el.requestFullscreen) el.requestFullscreen().catch(() => { /* class-only fullscreen still works */ });
    } else if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }
  const toggleFs = () => setFs(!document.body.classList.contains('fs'));

  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && !PUBLIC) document.body.classList.remove('fs');
  });

  /* ══════════════════════════════════════════
     DRAWER  (organizer only)
  ══════════════════════════════════════════ */
  let drawerOpen = false, drawerTab = 'key';

  function toggleSecretHint() { openDrawer('team'); }   // K / J on a presenting device: just open the safe panel

  function openDrawer(tab) {
    if (PUBLIC) return;
    const board = S.openId == null;                         // on the problem board only TIMER and SETUP apply
    if (board) tab = tab === 'timer' ? 'timer' : 'setup';
    else if (secretsHidden() && isSecretTab(tab || drawerTab)) tab = 'timer';
    drawerOpen = true;
    if (tab) drawerTab = tab;
    $('drawer').classList.add('open');
    $('drawer').setAttribute('aria-hidden', 'false');
    renderDrawer(false);
  }

  function closeDrawer() {
    drawerOpen = false;
    const d = $('drawer');
    d.classList.remove('open');
    d.setAttribute('aria-hidden', 'true');
  }

  const list = (items, cls) => items && items.length ? `<ul class="dr-list ${cls || ''}">${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>` : '';

  function tabKey(p) {
    const o = p.organizer;
    return `
      <div class="dr-sec core"><div class="dr-h">CORE CONCEPT</div><div class="dr-core">${esc(o.core)}</div>
        <div class="dr-meta"><span>PRIMARY SKILL</span> ${esc(p.skill)} &nbsp;·&nbsp; <span>TWIST ATTACKS</span> ${esc(p.attacks)}</div></div>
      ${o.tests && o.tests.length ? `<div class="dr-sec"><div class="dr-h">WHAT THIS TESTS</div>${list(o.tests)}</div>` : ''}
      ${o.strong && o.strong.length ? `<div class="dr-sec"><div class="dr-h">STRONG SOLUTIONS</div>${list(o.strong)}</div>` : ''}
      ${o.reward && o.reward.length ? `<div class="dr-sec"><div class="dr-h">REWARD TEAMS THAT</div>${list(o.reward)}</div>` : ''}
      ${o.accept && o.accept.length ? `<div class="dr-sec acc"><div class="dr-h">✓ DO ACCEPT</div>${list(o.accept)}</div>` : ''}
      ${o.reject && o.reject.length ? `<div class="dr-sec rej"><div class="dr-h">✕ DO NOT ACCEPT / JUDGING BOUNDARIES</div>${list(o.reject)}</div>` : ''}
      ${o.calc && o.calc.length ? `<div class="dr-sec"><div class="dr-h">CALCULATIONS</div>${o.calc.map(c => `<div class="dr-calc"><b>${esc(c.h)}</b>${list(c.lines, 'mono')}</div>`).join('')}</div>` : ''}
      ${o.notes && o.notes.length ? `<div class="dr-sec"><div class="dr-h">IMPORTANT NOTES</div>${list(o.notes)}</div>` : ''}
      <div class="dr-sec foot"><div class="dr-h">MOST IMPORTANT JUDGING PRINCIPLE</div><p>${esc(PB.judging.principle)}</p></div>`;
  }

  function scoreTotal(id) {
    const sc = S.scores[id] || {};
    return PB.judging.categories.reduce((a, c) => a + (Number(sc[c.k]) || 0), 0);
  }

  function tabScore(p) {
    const sc = S.scores[p.id] || {};
    return `
      <div class="dr-sec">
        <div class="dr-h">LIVE SCORING · ${esc(teamNumLabel(p.id) || 'UNASSIGNED')} ${esc(team(p.id).name)}</div>
        <div class="score-note">Organizer-only. Never shown on the projector.</div>
        ${PB.judging.categories.map(c => `
          <div class="sc-row">
            <div class="sc-l">${esc(c.label)}</div>
            <button class="sc-b" data-sc="${c.k}" data-d="-1" aria-label="Decrease ${esc(c.label)}">−</button>
            <input class="sc-in" type="number" inputmode="numeric" min="0" max="${c.max}" step="1" data-k="${c.k}" value="${sc[c.k] ?? ''}" placeholder="0" aria-label="${esc(c.label)} out of ${c.max}">
            <button class="sc-b" data-sc="${c.k}" data-d="1" aria-label="Increase ${esc(c.label)}">+</button>
            <div class="sc-max">/ ${c.max}</div>
          </div>`).join('')}
        <div class="sc-total"><span>TOTAL</span><b id="scTotal">${scoreTotal(p.id)}</b><em>/ ${PB.judging.categories.reduce((a, c) => a + c.max, 0)}</em></div>
      </div>
      <div class="dr-sec foot"><div class="dr-h">ROUND FLOW</div>${list(PB.judging.flow)}</div>`;
  }

  function tabLock(p) {
    const specs = PB.locks[p.id] || [], L = ensureLock(p.id), dis = L.locked ? ' disabled' : '';
    const field = s => {
      const v = L.v[s.k];
      if (s.type === 'choice') return `<div class="lk-f"><div class="lk-l">${esc(s.label)}</div><div class="lk-opts">${s.options.map(o => `<button class="btn lk-o${v === o ? ' on' : ''}" data-lk="${s.k}" data-v="${esc(o)}"${dis}>${esc(o)}</button>`).join('')}</div></div>`;
      if (s.type === 'multi') return `<div class="lk-f"><div class="lk-l">${esc(s.label)}${s.max ? ` (pick ${s.max})` : ''}</div><div class="lk-opts">${s.options.map(o => `<button class="btn lk-o${(v || []).includes(o) ? ' on' : ''}" data-lkm="${s.k}" data-v="${esc(o)}"${dis}>${esc(o)}</button>`).join('')}</div></div>`;
      return `<label class="fld"><span>${esc(s.label)}</span><input class="lk-in" data-k="${s.k}" value="${esc(v || '')}"${dis}></label>`;
    };
    return `<div class="dr-sec">
      <div class="dr-h">RECORD THE TEAM’S DECISION · ${esc(teamNumLabel(p.id) || 'UNASSIGNED')} ${esc(team(p.id).name)}</div>
      <div class="score-note">Fill this in while they explain their plan, then lock it. Once locked it shows on screen during the twist and fix, and cannot be edited.</div>
      ${specs.map(field).join('')}
      <label class="fld"><span>THEIR SOLUTION IN BRIEF</span><textarea class="lk-in" data-k="note" rows="3"${dis}>${esc(L.v.note || '')}</textarea></label>
      ${L.locked
        ? `<div class="lk-state">🔒 LOCKED at ${new Date(L.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div><div class="dr-btns"><button class="btn danger" id="lkUnlock">UNLOCK…</button></div>`
        : `<div class="dr-btns"><button class="btn okbtn" id="lkLock">🔒 LOCK IN DECISION</button></div>`}
    </div>`;
  }

  function tabSetup() {
    return `
      <div class="dr-sec">
        <div class="dr-h">PRESENTING DEVICE</div>
        <label class="sw"><input type="checkbox" id="tgSecrets"${secretsHidden() ? ' checked' : ''}><i class="sw-t" aria-hidden="true"></i>
          <span><b>Hide KEY and SCORE on this device</b><em>Removes those panels (and the K / J shortcuts) so nothing private can show on the projector. Saved on this device only.</em></span></label>
      </div>
      <div class="dr-sec">
        <div class="dr-h">PRESENTING</div>
        <div class="dr-btns row">
          <button class="btn ghost" data-act="fs">⛶ FULLSCREEN</button>
          <button class="btn ghost" data-act="projector">⧉ PROJECTOR WINDOW</button>
          <button class="btn ghost" data-act="keys">? SHORTCUTS</button>
        </div>
        <div class="score-note">Shortcuts: K organizer · T timer · F fullscreen · H board · ? help.</div>
      </div>
      <div class="dr-sec">
        <div class="dr-h">DANGER</div>
        <button class="btn danger" id="btnResetEvent">RESET EVENT…</button>
      </div>`;
  }

  function tabTeam(p) {
    const t = team(p.id);
    return `
      <div class="dr-sec">
        <div class="dr-h">TEAM ASSIGNMENT · PROBLEM ${esc(numOf(p.id))}</div>
        <label class="fld"><span>PROBLEM NUMBER</span><input id="tmPnum" value="${esc(numOf(p.id))}" maxlength="3" placeholder="${pad2(p.id)}"></label>
        <div class="score-note">Type another problem’s number to swap places with it (valid numbers: ${POS.join(', ')}).</div>
        <label class="fld"><span>TEAM NUMBER</span><input id="tmNum" value="${esc(t.num)}" maxlength="3" inputmode="numeric" placeholder="04"></label>
        <label class="fld"><span>TEAM NAME</span><input id="tmName" value="${esc(t.name)}" maxlength="28" placeholder="THE DEBUGGERS"></label>
        <div class="score-note">Changes appear instantly on the live screen and the board.</div>
        <div class="dr-btns row">
          <button class="btn ghost" data-act="prevTeam">◀ PREV TEAM</button>
          <button class="btn ghost" data-act="nextTeam">NEXT TEAM ▶</button>
          <button class="btn ghost" data-act="projector">⧉ PROJECTOR WINDOW</button>
          <button class="btn ghost" data-act="keys">? SHORTCUTS</button>
        </div>
        <div class="dr-btns">
          <button class="btn ghost" id="tmClear">CLEAR ASSIGNMENT</button>
          <button class="btn ghost" id="tmRestart">↺ RESTART THIS PROBLEM (back to stage 01)</button>
        </div>
      </div>`;
  }

  function tabTimer() {
    const T = S.timer;
    return `
      <div class="dr-sec">
        <div class="dr-h">COUNTDOWN</div>
        <div class="tm-big" id="tmBig">--:--</div>
        <div class="dr-btns row">
          <button class="btn okbtn" data-t="start" id="tmStart">▶ START</button>
          <button class="btn" data-t="pause">❚❚ PAUSE</button>
          <button class="btn ghost" data-t="reset">↺ RESET</button>
        </div>
        <div class="dr-h" style="margin-top:1.2rem">PRESETS</div>
        <div class="dr-btns row">
          ${[1, 2, 3, 5, 10, 15].map(m => `<button class="btn ghost${T.preset === m ? ' on' : ''}" data-t="preset" data-m="${m}">${m} MIN</button>`).join('')}
        </div>
        <label class="fld inline"><span>CUSTOM (MINUTES)</span><input id="tmCustom" type="number" min="0.5" max="180" step="0.5" value="${T.preset}"><button class="btn" data-t="custom">SET</button></label>
        <div class="dr-h" style="margin-top:1.2rem">ON THE PROJECTOR</div>
        <button class="btn ${T.visible ? 'on' : 'ghost'}" data-t="vis" id="tmVis">${T.visible ? '● TIMER VISIBLE — CLICK TO HIDE' : '○ TIMER HIDDEN — CLICK TO SHOW'}</button>
        <div class="score-note">Starting the timer shows it automatically. It turns amber at 1:00 and red at 0:20.</div>
      </div>`;
  }

  function renderDrawer(keepScroll) {
    const p = cur();
    $('drawer').classList.toggle('board-mode', !p);
    if (!p) {                                               // organizer panel from the problem board
      if (drawerTab !== 'timer') drawerTab = 'setup';
      $('drTitle').textContent = 'PROBLEM BOARD';
      document.querySelectorAll('#drTabs button').forEach(b => {
        const on = b.dataset.tab === drawerTab;
        b.classList.toggle('on', on); b.setAttribute('aria-selected', on);
      });
      $('drBody').innerHTML = { timer: tabTimer, setup: tabSetup }[drawerTab]();
      tickTimer();
      return;
    }
    const body = $('drBody');
    const top = keepScroll ? body.scrollTop : 0;
    $('drTitle').textContent = `${numOf(p.id)} · ${p.title}`;
    document.querySelectorAll('#drTabs button').forEach(b => {
      const on = b.dataset.tab === drawerTab;
      b.classList.toggle('on', on);
      b.setAttribute('aria-selected', on);
    });
    if (secretsHidden() && isSecretTab(drawerTab)) drawerTab = 'timer';
    body.innerHTML = { key: tabKey, lock: tabLock, score: tabScore, team: tabTeam, timer: tabTimer, setup: tabSetup }[drawerTab](p);
    body.scrollTop = top;
    tickTimer();
  }

  /* ══════════════════════════════════════════
     TIMER
  ══════════════════════════════════════════ */
  const remaining = () => {
    const T = S.timer;
    return T.running ? Math.max(0, Math.round((T.endAt - Date.now()) / 1000)) : T.remaining;
  };
  const fmt = s => `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`;

  function timerCmd(cmd, m) {
    const T = S.timer;
    if (cmd === 'start') {
      if (T.running) return;
      if (T.remaining <= 0) T.remaining = Math.round(T.preset * 60);
      T.running = true; T.endAt = Date.now() + T.remaining * 1000; T.visible = true;
    } else if (cmd === 'pause') {
      if (T.running) { T.remaining = remaining(); T.running = false; }
    } else if (cmd === 'reset') {
      T.running = false; T.remaining = Math.round(T.preset * 60);
    } else if (cmd === 'preset' || cmd === 'custom') {
      const v = cmd === 'preset' ? Number(m) : Number($('tmCustom').value);
      if (!(v > 0)) return;
      T.preset = clamp(v, 0.5, 180); T.running = false; T.remaining = Math.round(T.preset * 60);
    } else if (cmd === 'vis') {
      T.visible = !T.visible;
    }
    save();
    if (drawerOpen && drawerTab === 'timer') renderDrawer(true);
    tickTimer();
  }

  function toggleTimerRun() {
    timerCmd(S.timer.running ? 'pause' : 'start');
  }

  function tickTimer() {
    const T = S.timer, r = remaining();
    if (T.running && r <= 0 && !PUBLIC) {
      T.running = false; T.remaining = 0; save();
      if (drawerOpen && drawerTab === 'timer') renderDrawer(true);
    }
    const state = r <= 0 ? 'up' : r <= 20 ? 'crit' : r <= 60 ? 'warn' : '';
    const html = T.visible
      ? `<div class="tchip ${state}${T.running ? ' run' : ''}" role="timer"><span aria-hidden="true">${r <= 0 ? '⏰' : '⏱'}</span><b>${fmt(r)}</b>${r <= 0 ? '<em>TIME</em>' : T.running ? '' : '<em>PAUSED</em>'}</div>`
      : '';
    document.querySelectorAll('.timer-slot').forEach(el => { if (el.dataset.h !== html) { el.innerHTML = html; el.dataset.h = html; } });
    const big = $('tmBig');
    if (big) { big.textContent = fmt(r); big.className = 'tm-big ' + state; }
    const st = $('tmStart');
    if (st) st.disabled = T.running;
  }
  setInterval(tickTimer, 250);

  /* ══════════════════════════════════════════
     MODALS
  ══════════════════════════════════════════ */
  const modalOpen = () => !$('modalReset').hidden || !$('modalKeys').hidden;

  function openModal(id) { $(id).hidden = false; const b = $(id).querySelector('.btn'); if (b) b.focus(); }
  function closeModals() { $('modalReset').hidden = true; $('modalKeys').hidden = true; }

  function resetEvent() {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    S = blank();
    closeModals();
    closeDrawer();
    renderAll();
  }

  /* ══════════════════════════════════════════
     EVENTS — board
  ══════════════════════════════════════════ */
  function onTeamInput(e) {
    const el = e.target;
    if (!el.dataset.f) return;
    const id = Number(el.dataset.id);
    if (el.dataset.f === 'pnum') { if (el.value !== el.value.toUpperCase()) el.value = el.value.toUpperCase(); return; }
    const t = (S.teams[id] = S.teams[id] || { num: '', name: '' });
    t[el.dataset.f] = el.dataset.f === 'num' ? el.value.replace(/\D/g, '').slice(0, 3) : el.value.toUpperCase();
    if (el.dataset.f === 'num' && el.value !== t.num) el.value = t.num;
    if (el.dataset.f === 'name' && el.value !== t.name) el.value = t.name;
    save();
    refreshCard(id);
  }

  function onTeamBlur(e) {
    const el = e.target;
    if (el.dataset.f === 'pnum') return;          // committed on 'change' (see below)
    if (el.dataset.f !== 'num') return;
    const id = Number(el.dataset.id);
    const t = S.teams[id];
    if (t && /^\d$/.test(t.num)) { t.num = '0' + t.num; el.value = t.num; save(); }
  }

  const grids = [$('gridPrimary'), $('gridBackup')];
  grids.forEach(g => {
    g.addEventListener('change', e => {
      const el = e.target;
      if (el.dataset.f !== 'pnum') return;
      const id = Number(el.dataset.id);
      if (setPosition(id, el.value)) { renderBoard(); const c = document.querySelector(`.pcard[data-id="${id}"] .in-pnum`); if (c) c.focus(); }
      else el.value = numOf(id);                 // not a valid slot — put the old number back
    });
    g.addEventListener('input', onTeamInput);
    g.addEventListener('focusout', onTeamBlur);
    g.addEventListener('click', e => {
      if (e.target.closest('input, label')) return;
      const card = e.target.closest('.pcard');
      if (card) openProblem(Number(card.dataset.id));
    });
  });

  $('btnReset').addEventListener('click', () => openModal('modalReset'));
  $('mrCancel').addEventListener('click', closeModals);
  $('mrOk').addEventListener('click', resetEvent);
  $('mkOk').addEventListener('click', closeModals);
  $('btnKeysBoard').addEventListener('click', () => openModal('modalKeys'));
  $('btnFsBoard').addEventListener('click', toggleFs);
  $('btnOrgBoard').addEventListener('click', () => openDrawer('setup'));
  $('btnProjector').addEventListener('click', openProjector);

  function openProjector() {
    const url = location.pathname.split('/').pop() + '?screen=public';
    window.open(url, 'pointBreakPublic', 'popup,width=1280,height=720');
  }

  /* ══════════════════════════════════════════
     EVENTS — control bar + drawer
  ══════════════════════════════════════════ */
  const ACTIONS = {
    board: toBoard,
    prevTeam: () => stepTeam(-1),
    nextTeam: () => stepTeam(1),
    prev: navPrev,
    next: navNext,
    s0: () => { const p = cur(); if (p) { S.sub[p.id] = 0; save(); } if (stageOf(S.openId) === 0) renderStage(true); else setStage(0); },
    s1: () => setStage(1),
    s3: () => setStage(3),
    twist: () => setStage(2),
    complete,
    ps: () => { S.ps = !S.ps; save(); renderStage(false); },
    lock: () => (drawerOpen && drawerTab === 'lock' ? closeDrawer() : openDrawer('lock')),
    key: () => { if (secretsHidden()) { toggleSecretHint(); return; } drawerOpen && drawerTab === 'key' ? closeDrawer() : openDrawer('key'); },
    score: () => { if (secretsHidden()) { toggleSecretHint(); return; } drawerOpen && drawerTab === 'score' ? closeDrawer() : openDrawer('score'); },
    timer: () => (drawerOpen && drawerTab === 'timer' ? closeDrawer() : openDrawer('timer')),
    team: () => (drawerOpen && drawerTab === 'team' ? closeDrawer() : openDrawer('team')),
    fs: toggleFs,
    keys: () => openModal('modalKeys'),
    projector: openProjector,
  };

  $('ctl').addEventListener('click', e => {
    const b = e.target.closest('[data-a]');
    if (b && !b.disabled && ACTIONS[b.dataset.a]) ACTIONS[b.dataset.a]();
  });

  $('prog').addEventListener('click', e => {
    if (PUBLIC || document.body.classList.contains('fs')) return;
    const b = e.target.closest('[data-s]');
    if (!b) return;
    const n = Number(b.dataset.s);
    if (n === 0) ACTIONS.s0(); else setStage(n);
  });

  $('drClose').addEventListener('click', closeDrawer);
  $('drTabs').addEventListener('click', e => {
    const b = e.target.closest('[data-tab]');
    if (!b) return;
    drawerTab = b.dataset.tab;
    renderDrawer(false);
  });

  $('drBody').addEventListener('input', e => {
    const p = cur();
    if (!p) return;
    const el = e.target;
    if (el.classList.contains('lk-in')) {
      const L = ensureLock(p.id);
      if (!L.locked) { L.v[el.dataset.k] = el.value; save(); }
      return;
    }
    if (el.classList.contains('sc-in')) {
      const c = PB.judging.categories.find(x => x.k === el.dataset.k);
      let v = el.value === '' ? '' : clamp(Math.round(Number(el.value)), 0, c.max);
      if (v !== '' && String(v) !== el.value) el.value = v;
      (S.scores[p.id] = S.scores[p.id] || {})[c.k] = v;
      save();
      $('scTotal').textContent = scoreTotal(p.id);
    } else if (el.id === 'tmPnum') {
      el.value = el.value.toUpperCase();
    } else if (el.id === 'tmNum' || el.id === 'tmName') {
      const t = (S.teams[p.id] = S.teams[p.id] || { num: '', name: '' });
      if (el.id === 'tmNum') { t.num = el.value.replace(/\D/g, '').slice(0, 3); el.value = t.num; }
      else { t.name = el.value.toUpperCase(); el.value = t.name; }
      save();
      renderHeader(p);
      if (stageOf(p.id) === 1) renderMain(p, false);
    }
  });

  $('drBody').addEventListener('change', e => {
    if (e.target.id === 'tgSecrets') {
      try { localStorage.setItem(SECRET_KEY, e.target.checked ? '1' : '0'); } catch (err) { /* ignore */ }
      applySecretMode();
      if (e.target.checked && isSecretTab(drawerTab)) drawerTab = 'timer';
      renderDrawer(false);
      return;
    }
    const p = cur();
    if (p && e.target.id === 'tmPnum') {
      if (!setPosition(p.id, e.target.value)) e.target.value = numOf(p.id);
      renderHeader(p); renderCtl(p); if (S.ps) renderPs(p);
      $('drTitle').textContent = `${numOf(p.id)} · ${p.title}`;
      e.target.value = numOf(p.id);
    }
  });

  $('drBody').addEventListener('focusout', e => {
    const p = cur();
    if (p && e.target.id === 'tmNum') {
      const t = S.teams[p.id];
      if (t && /^\d$/.test(t.num)) { t.num = '0' + t.num; e.target.value = t.num; save(); renderHeader(p); if (stageOf(p.id) === 1) renderMain(p, false); }
    }
  });

  $('drBody').addEventListener('click', e => {
    // buttons that work with or without an open problem (SETUP tab, board organizer)
    if (e.target.id === 'btnResetEvent') { openModal('modalReset'); return; }
    const gact = e.target.closest('[data-act]');
    if (gact && ACTIONS[gact.dataset.act]) { ACTIONS[gact.dataset.act](); return; }
    const tm0 = e.target.closest('[data-t]');
    if (tm0) { timerCmd(tm0.dataset.t, tm0.dataset.m); return; }
    const p = cur();
    if (!p) return;
    const sc = e.target.closest('[data-sc]');
    if (sc) {
      const c = PB.judging.categories.find(x => x.k === sc.dataset.sc);
      const sco = (S.scores[p.id] = S.scores[p.id] || {});
      sco[c.k] = clamp((Number(sco[c.k]) || 0) + Number(sc.dataset.d), 0, c.max);
      save();
      renderDrawer(true);
      return;
    }
    const lk = e.target.closest('[data-lk]'), lkm = e.target.closest('[data-lkm]');
    if (lk || lkm) {
      const L = ensureLock(p.id);
      if (L.locked) return;
      if (lk) L.v[lk.dataset.lk] = L.v[lk.dataset.lk] === lk.dataset.v ? '' : lk.dataset.v;
      else {
        const spec = (PB.locks[p.id] || []).find(s => s.k === lkm.dataset.lkm), arr = (L.v[spec.k] = L.v[spec.k] || []), v = lkm.dataset.v;
        if (arr.includes(v)) arr.splice(arr.indexOf(v), 1); else if (!spec.max || arr.length < spec.max) arr.push(v);
      }
      save(); renderDrawer(true);
      return;
    }
    if (e.target.id === 'lkLock') {
      const L = ensureLock(p.id); L.locked = true; L.at = Date.now();
      save(); renderStage(false); renderDrawer(true);
      return;
    }
    if (e.target.id === 'lkUnlock') {
      const b = e.target;
      if (!b.dataset.armed) {
        b.dataset.armed = '1'; b.textContent = 'CLICK AGAIN TO CONFIRM UNLOCK';
        setTimeout(() => { if (b.isConnected) { delete b.dataset.armed; b.textContent = 'UNLOCK…'; } }, 3500);
      } else {
        ensureLock(p.id).locked = false; save(); renderStage(false); renderDrawer(true);
      }
      return;
    }
    if (e.target.id === 'btnResetEvent') { openModal('modalReset'); return; }
    const act = e.target.closest('[data-act]');
    if (act && ACTIONS[act.dataset.act]) { ACTIONS[act.dataset.act](); return; }
    const tm = e.target.closest('[data-t]');
    if (tm) { timerCmd(tm.dataset.t, tm.dataset.m); return; }
    if (e.target.id === 'tmClear') {
      delete S.teams[p.id]; save(); renderHeader(p); renderCtl(p);
      if (stageOf(p.id) === 1) renderMain(p, false);
      renderDrawer(true);
    }
    if (e.target.id === 'tmRestart') {
      S.stage[p.id] = 0; S.sub[p.id] = 0; S.done[p.id] = false; save(); renderStage(true);
    }
  });

  /* ══════════════════════════════════════════
     KEYBOARD
  ══════════════════════════════════════════ */
  function closeTop() {
    if (fxBusy) { endFx(); return; }
    if (modalOpen()) { closeModals(); return; }
    if (drawerOpen) { closeDrawer(); return; }
    if (document.body.classList.contains('fs')) setFs(false);
  }

  document.addEventListener('keydown', e => {
    if (PUBLIC) return;
    const tg = e.target;
    const typing = tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.tagName === 'SELECT' || tg.isContentEditable);
    if (e.key === 'Escape') {
      if (typing) { tg.blur(); return; }
      closeTop();
      return;
    }
    if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
    if (modalOpen()) return;
    if (fxBusy) { e.preventDefault(); return; }

    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const inStage = S.openId != null;

    if (k === '?') { openModal('modalKeys'); return; }
    if (k === 'f') { toggleFs(); return; }
    if (k === 'h') { if (inStage) toBoard(); return; }
    if (!inStage) {                                  // problem board: organizer = timer + setup
      if (k === 'k' || k === 'j' || k === 'l') { drawerOpen && drawerTab === 'setup' ? closeDrawer() : openDrawer('setup'); }
      else if (k === 't') { drawerOpen && drawerTab === 'timer' ? closeDrawer() : openDrawer('timer'); }
      else if (k === ' ') { e.preventDefault(); toggleTimerRun(); }
      return;
    }

    if (k === 'ArrowRight') { e.preventDefault(); navNext(); }
    else if (k === 'ArrowLeft') { e.preventDefault(); navPrev(); }
    else if (k === 't') ACTIONS.timer();
    else if (k === ']' || k === 'PageDown') stepTeam(1);
    else if (k === '[' || k === 'PageUp') stepTeam(-1);
    else if (k === 'k') ACTIONS.key();
    else if (k === 'p') ACTIONS.ps();
    else if (k === 'l') ACTIONS.lock();
    else if (k === 'j') ACTIONS.score();
    else if (k === ' ') { e.preventDefault(); toggleTimerRun(); }
  });

  /* ══════════════════════════════════════════
     PUBLIC (PROJECTOR) WINDOW — mirrors saved state
  ══════════════════════════════════════════ */
  if (PUBLIC) {
    document.body.classList.add('fs', 'pub');
    window.addEventListener('storage', e => {
      if (e.key !== KEY) return;
      const old = S;
      S = load();
      const sameProblem = old.openId === S.openId && S.openId != null;
      const toTwist = sameProblem && (old.stage[S.openId] ?? 0) < 2 && (S.stage[S.openId] ?? 0) === 2;
      if (toTwist && !fxBusy) {
        // keep the old stage visible under the transition, then swap
        const next = S;
        S = old;
        playTwist(() => { S = next; renderAll(); });
      } else {
        renderAll();
      }
    });
  }

  /* ══════════════════════════════════════════
     INIT
  ══════════════════════════════════════════ */
  (function init() {
    const q = new URLSearchParams(location.search);
    if (!PUBLIC && q.has('open')) {            // deep link: ?open=4&stage=2
      const id = Number(q.get('open'));
      if (byId(id)) {
        S.openId = id;
        if (q.has('stage')) S.stage[id] = clamp(Number(q.get('stage')) || 0, 0, 3);
        if (q.has('sub')) S.sub[id] = Math.max(0, Number(q.get('sub')) || 0);
        if (q.get('fs') === '1') document.body.classList.add('fs');
      }
    }
    if (S.openId != null && !byId(S.openId)) S.openId = null;
    renderAll();
  })();

})();
