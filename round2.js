/* ════════════════════════════════════════════════════════════
   POINT BREAK — ROUND 02 · THE BREAK — round2.js
   CASE → INFORMATION → DECISION → THE BREAK → INVESTIGATE → ADAPT → REALITY

   State lives in localStorage ("pointBreakRound2State"). A second window
   opened with ?screen=public is the clean projector screen: it mirrors the
   saved state and contains no controls and no answers — the truth data is
   only ever rendered when the organizer has deliberately revealed it.
   ════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const D = window.R2;
  const PROBS = D.problems;
  const KEY = 'pointBreakRound2State';
  const PUBLIC = new URLSearchParams(location.search).get('screen') === 'public';
  const REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const PH = [
    { k: 'case',        label: 'CASE' },
    { k: 'info',        label: 'INFORMATION' },
    { k: 'decision',    label: 'DECISION' },
    { k: 'break',       label: 'THE BREAK' },
    { k: 'investigate', label: 'INVESTIGATE' },
    { k: 'adapt',       label: 'ADAPT' },
    { k: 'reality',     label: 'REALITY' },
  ];

  // never colour alone: every status has an icon AND a word
  const ST = {
    unknown:    { icon: '◌', text: 'UNKNOWN' },
    valid:      { icon: '✓', text: 'VALID' },
    invalid:    { icon: '✕', text: 'INVALID' },
    irrelevant: { icon: '⌀', text: 'IRRELEVANT' },
    unreliable: { icon: '⚠', text: 'UNRELIABLE' },
  };

  /* ══════════════════════════════════════════
     UTILS
  ══════════════════════════════════════════ */
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const hl = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b class="hl">$1</b>');
  const pad2 = n => String(n).padStart(2, '0');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ══════════════════════════════════════════
     STATE
  ══════════════════════════════════════════ */
  const blank = () => ({
    v: 2,
    order: PROBS.map(p => p.id),   // problem ids by board position (editing a number swaps two cards)
    names: {},                      // problem id -> team name
    pv: Object.fromEntries(PROBS.map(p => [p.id, p.dataVersion || 1])),   // content version per problem (see load())
    openId: null,                   // null = problem board
    prob: PROBS[0].id,
    sess: {},      // problem id -> session
    reality: {},   // problemId -> typed overrides of the real outcome
    edits: {},     // problemId -> { statementIndex: { truth, why, src } } set live by the organizer
    timer: { preset: 10, remaining: 600, running: false, endAt: 0, visible: false },
  });

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw), b = blank();
        if (!s.v || s.v < 2) {                           // v1 had team slots + dropdowns: "team:problem" sessions
          const ns = {};
          Object.keys(s.sess || {}).forEach(k => { const m = /^(\d+):(\d+)$/.exec(k); if (m && !ns[m[2]]) ns[m[2]] = s.sess[k]; });
          s.sess = ns;
          s.names = {};
          delete s.teams; delete s.team;
          s.v = 2;
        }
        // a problem whose content was replaced (dataVersion) must not inherit the old problem's progress or typed key
        s.pv = s.pv || {};
        PROBS.forEach(p => {
          const v = p.dataVersion || 1;
          if ((s.pv[p.id] || 1) !== v) { if (s.sess) delete s.sess[p.id]; if (s.edits) delete s.edits[p.id]; if (s.reality) delete s.reality[p.id]; }
          s.pv[p.id] = v;
        });
        const ok = Array.isArray(s.order) && s.order.length === PROBS.length && PROBS.every(p => s.order.includes(p.id));
        if (!ok) {
          const keep = (Array.isArray(s.order) ? s.order : []).filter(id => PROBS.some(p => p.id === id));
          s.order = keep.concat(PROBS.map(p => p.id).filter(id => !keep.includes(id)));
        }
        return { ...b, ...s, names: s.names || {}, timer: { ...b.timer, ...(s.timer || {}) } };
      }
    } catch (e) { /* storage unavailable — start blank */ }
    return blank();
  }

  let S = load();

  function save() {
    if (PUBLIC) return;
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ }
  }

  const skey = () => String(S.prob);
  function sess() {
    const k = skey();
    if (!S.sess[k]) {
      S.sess[k] = { phase: 0, broken: false, initDone: false, adaptDone: false, used: {}, rev: {}, armed: null, picks: [], result: null, orig: '', adapted: '', notes: '', scores: {}, reality: false };
    }
    return S.sess[k];
  }
  /* "Presenting device" switch: removes KEY (answers), NOTES (typed outcome) and SCORE on this device. */
  const SECRET_KEY = 'pointBreakHideSecrets';
  const secretsHidden = () => { try { return localStorage.getItem(SECRET_KEY) === '1'; } catch (e) { return false; } };
  const isSecretTab = t => t === 'key' || t === 'text' || t === 'score';
  const applySecretMode = () => document.body.classList.toggle('hide-secrets', secretsHidden());
  applySecretMode();

  const prob = () => PROBS.find(p => p.id === S.prob) || PROBS[0];
  const POS = PROBS.map((_, i) => pad2(i + 1));
  const numOf = id => POS[S.order.indexOf(id)] || pad2(id);
  const teamName = id => S.names[id == null ? S.prob : id] || '';
  const isAssigned = id => !!teamName(id);

  // typing a number on a card moves it there and swaps with whoever held that number
  function setPosition(id, raw) {
    let label = String(raw || '').trim();
    if (/^\d$/.test(label)) label = '0' + label;
    const to = POS.indexOf(label), from = S.order.indexOf(id);
    if (to < 0 || to === from) return false;
    [S.order[from], S.order[to]] = [S.order[to], S.order[from]];
    save();
    return true;
  }

  function boardStatus(id) {
    const s = S.sess[id];
    if (!isAssigned(id)) return 'unassigned';
    if (!s || (s.phase === 0 && !s.broken && !s.initDone)) return 'ready';
    if (s.reality) return 'complete';
    return ['onstage', 'onstage', 'onstage', 'brk', 'inv', 'adapt', 'real'][s.phase] || 'onstage';
  }
  const STATUS = {
    unassigned: ['○', 'UNASSIGNED'], ready: ['●', 'READY'], onstage: ['▶', 'ON STAGE'], brk: ['⚠', 'THE BREAK'],
    inv: ['⌕', 'INVESTIGATE'], adapt: ['↻', 'ADAPT'], real: ['◉', 'REALITY'], complete: ['✓', 'COMPLETE'],
  };
  const statusOf = i => (sess().rev[i] && sess().rev[i].status) || 'unknown';
  // a statement as the organizer has it: file data, overridden by anything typed live in the KEY panel
  const stm = (i, p) => { p = p || prob(); const e = ((S.edits || {})[p.id] || {})[i] || {}; const b = p.statements[i]; return { ...b, truth: e.truth || b.truth || null, why: e.why != null ? e.why : (b.why || ''), src: e.src || b.src || '' }; };
  const realityOf = p => ({ ...p.reality, ...(S.reality[p.id] || {}) });
  const lifeLeft = () => D.lifelines.filter(l => !sess().used[l.k]).length;

  /* ══════════════════════════════════════════
     RENDER — pieces
  ══════════════════════════════════════════ */
  function evCard(i, opts = {}) {
    const p = prob(), s = sess(), st = statusOf(i), r = s.rev[i] || {};
    const sel = s.picks.includes(i);
    return `<div class="ev st-${st}${sel ? ' sel' : ''}${opts.pick ? ' pickable' : ''}" data-i="${i}"${opts.pick ? ' tabindex="0" role="button"' : ''}>
      <div class="ev-h"><span class="ev-n">EVIDENCE ${pad2(i + 1)}</span><span class="ev-st"><i aria-hidden="true">${ST[st].icon}</i>${ST[st].text}</span></div>
      <p class="ev-t">${esc(p.statements[i].t)}</p>
      ${r.src ? `<div class="ev-src"><em>SOURCE</em>${esc(stm(i, p).src)}</div>` : ''}
      ${sel ? '<div class="ev-sel">● SELECTED</div>' : ''}
    </div>`;
  }

  const lifeTokens = () => `<div class="lf-rail" aria-label="Lifelines">
      <div class="lf-count"><b>${lifeLeft()}</b><span>/ 3<br>LIFELINES<br>LEFT</span></div>
      ${D.lifelines.map(l => {
        const used = !!sess().used[l.k], armed = sess().armed === l.k;
        return `<div class="lf${used ? ' used' : ''}${armed ? ' armed' : ''}"><b>${l.name}</b><span>${used ? '✕ USED' : armed ? '● IN USE' : '○ AVAILABLE'}</span></div>`;
      }).join('')}
    </div>`;

  function mini(showStatus) {
    const p = prob();
    return `<aside class="mini" aria-label="The information">
      <div class="mini-h">THE INFORMATION</div>
      <ol>${p.statements.map((x, i) => {
        const st = statusOf(i);
        return `<li class="st-${st}"><b>${pad2(i + 1)}</b><span>${esc(x.t)}</span>${showStatus && st !== 'unknown' ? `<em><i aria-hidden="true">${ST[st].icon}</i>${ST[st].text}</em>` : ''}</li>`;
      }).join('')}</ol>
    </aside>`;
  }

  /* ══════════════════════════════════════════
     RENDER — phases
  ══════════════════════════════════════════ */
  function phCase(p) {
    return `<div class="rs case">
      <div class="cs-l">
        <div class="kick">PROBLEM ${numOf(p.id)} · ${esc(p.category)}</div>
        <h1 class="cs-title${p.title.length > 26 ? ' long' : ''}">${esc(p.title)}</h1>
        <div class="cs-sc">${p.scenario.map(t => `<p>${hl(t)}</p>`).join('')}</div>
      </div>
      <div class="cs-r"><div class="kc-grid">${p.constraints.map(c => `<div class="kc${c.hot ? ' hot' : ''}"><b>${esc(c.v)}</b><span>${esc(c.l)}</span></div>`).join('')}</div>
        ${p.situation ? `<div class="cs-sitbox"><p class="cs-sit">${esc(p.situationLabel || 'Current situation')}</p><ul class="cs-list">${p.situation.map(t => `<li>${hl(t)}</li>`).join('')}</ul></div>` : ''}</div>
    </div>`;
  }

  function phInfo(p) {
    return `<div class="rs info">
      <div class="in-top"><div class="kick">PROBLEM ${numOf(p.id)} · THE INFORMATION</div><h2>Eight pieces of information are available to your team.</h2></div>
      <div class="ev-grid${p.statements.some(s => s.t.length > 110) ? ' long' : ''}">${p.statements.map((_, i) => evCard(i)).join('')}</div>
    </div>`;
  }

  function phDecision(p) {
    const c = p.challenge, s = sess();
    return `<div class="rs decision${(c.produce || c.items.length > 6) ? ' dense' : ''}">
      <div class="dc-l">
        <div class="kick">PROBLEM ${numOf(p.id)} · ${esc(p.title)}</div>
        <h1 class="dc-big">MAKE YOUR<br>DECISION</h1>
        <p class="dc-lead">${hl(c.lead)}</p>
        ${c.label ? `<p class="dc-lab">${hl(c.label)}</p>` : ''}
        <ul class="dc-list${c.items.length > 4 ? ' two' : ''}">${c.items.map(i => `<li>${hl(i)}</li>`).join('')}</ul>
        ${c.emph ? `<p class="dc-emph">${hl(c.emph)}</p>` : ''}
        ${c.produce ? `<p class="dc-lab">${hl(c.produceLabel || '')}</p><ul class="dc-list prod">${c.produce.map(i => `<li>${hl(i)}</li>`).join('')}</ul>` : ''}
        ${c.foot ? `<p class="dc-foot">${hl(c.foot)}</p>` : ''}
        ${s.initDone ? '<div class="done-stamp">✓ INITIAL SOLUTION PRESENTED</div>' : ''}
      </div>
      ${mini(false)}
    </div>`;
  }

  function phBreak(p) {
    const bk = (p && p.brk) || null;
    return `<div class="rs brk">
      <div class="bk-eye">⚠ ALERT</div>
      <h1 class="bk-title">THE BREAK</h1>
      ${bk ? `<p class="bk-line l1">${hl(bk.l1)}</p><p class="bk-line l2">${hl(bk.l2)}</p><p class="bk-line l3">${hl(bk.l3)}</p>` : `<p class="bk-line l1">Not all information can be trusted.</p>
      <p class="bk-line l2">Some statements may be <b>VALID</b>, <b>INVALID</b>, or <b>IRRELEVANT</b>.</p>
      <p class="bk-line l3">Your original solution may be based on information that isn’t reliable.</p>`}
      <div class="bk-lf">${D.lifelines.map(l => `<div class="lf"><b>${l.name}</b></div>`).join('')}</div>
      <div class="bk-count">3 LIFELINES AVAILABLE</div>
    </div>`;
  }

  function phInvestigate(p) {
    const s = sess();
    const L = s.armed ? D.lifelines.find(l => l.k === s.armed) : null;
    const banner = L
      ? `<div class="arm"><b>${L.name} IN USE</b><span>Select ${L.need === 1 ? 'one statement' : 'two statements'} · ${s.picks.length} / ${L.need} selected</span></div>`
      : s.result
        ? `<div class="res ${s.result.kind}"><b>${esc(s.result.head)}</b>${s.result.body ? `<span>${esc(s.result.body)}</span>` : ''}</div>`
        : `<div class="arm idle"><b>INVESTIGATE</b><span>Decide which information you can rely on. Use your lifelines wisely.</span></div>`;
    return `<div class="rs inv">
      <div class="inv-top">${lifeTokens()}${banner}</div>
      <div class="ev-grid${p.statements.some(s => s.t.length > 110) ? ' long' : ''}">${p.statements.map((_, i) => evCard(i, { pick: !PUBLIC && !!s.armed })).join('')}</div>
    </div>`;
  }

  function phAdapt() {
    const s = sess();
    return `<div class="rs adapt">
      <div class="ad-main">
        <div class="kick">THE RECONSIDERATION</div>
        <h1 class="ad-big">RECONSIDER</h1>
        <p class="ad-sub">${prob().adapt ? hl(prob().adapt.lead) + ' ' : ''}Your information changed. <b>Should your decision change too?</b></p>
        <div class="ad-vs">
          <div class="ad-col"><h3>ORIGINAL DECISION</h3><div class="ad-txt">${s.orig ? esc(s.orig) : '<i>—</i>'}</div></div>
          <div class="ad-mid">VS</div>
          <div class="ad-col now"><h3>ADAPTED DECISION</h3><div class="ad-txt">${s.adapted ? esc(s.adapted) : '<i>—</i>'}</div></div>
        </div>
        ${(() => { const ad = prob().adapt;
          if (!ad) return '<div class="ad-q"><div><b>WHAT CHANGED?</b></div><div><b>WHY?</b></div><div><b>WHAT DO YOU DO NOW?</b></div></div>';
          return `<div class="ad-q two">${ad.prompts.map((q, n) => `<div><i>${n + 1}</i><b>${esc(q)}</b></div>`).join('')}</div>
            ${ad.must ? `<div class="ad-must"><span>${hl(ad.mustLabel)}</span><ul>${ad.must.map(m => `<li>${hl(m)}</li>`).join('')}</ul></div>` : ''}
            <p class="ad-final">${ad.final ? `<b>${esc(ad.final)}</b> ` : ''}<span>${hl(ad.note)}</span></p>`; })()}
        ${s.adaptDone ? '<div class="done-stamp">✓ ADAPTATION PRESENTED</div>' : ''}
      </div>
      ${mini(true)}
    </div>`;
  }

  function phReality(p) {
    const s = sess(), r = realityOf(p);
    const col = (h, t) => `<div class="rl-col"><h3>${h}</h3><div class="rl-txt">${t ? esc(t) : '<i>Not recorded yet.</i>'}</div></div>`;
    return `<div class="rs reality${s.reality ? ' shown' : ''}">
      <div class="kick">PROBLEM ${numOf(p.id)} · ${esc(p.title)}</div>
      <h1 class="rl-big">WHAT ACTUALLY<br>HAPPENED?</h1>
      ${s.reality
        ? `<div class="rl-cols">${col('ACTUAL SITUATION', r.situation)}${col('ACTUAL DECISION', r.decision)}${col('ACTUAL OUTCOME', r.outcome)}</div>
           ${r.reflection ? `<p class="rl-ref"><em>REFLECT</em>${esc(r.reflection)}</p>` : ''}`
        : '<div class="rl-wait">…</div>'}
    </div>`;
  }

  /* ══════════════════════════════════════════
     RENDER — frame
  ══════════════════════════════════════════ */
  function renderHeader() {
    const p = prob(), s = sess();
    $('hdCtx').innerHTML = `${teamName(p.id) ? `<b>${esc(teamName(p.id))}</b>` : ''}<span>${numOf(p.id)} · ${esc(p.title)}</span>`;
    $('hdPhase').innerHTML = `<span>PHASE ${pad2(s.phase + 1)} / 07</span><b>${PH[s.phase].label}</b>`;
  }

  function renderPhases() {
    const s = sess();
    $('phases').innerHTML = PH.map((x, i) => {
      const st = i < s.phase ? 'done' : i === s.phase ? 'active' : 'todo';
      const ico = st === 'done' ? '✓' : st === 'active' ? '●' : '○';
      return `<button class="pg ${st}${i === 3 ? ' pg-brk' : ''}" data-p="${i}" tabindex="-1"${st === 'active' ? ' aria-current="step"' : ''}>
        <i class="pg-bar"></i><span class="pg-l"><span aria-hidden="true">${ico}</span>${pad2(i + 1)} ${x.label}</span></button>`;
    }).join('');
  }

  function renderStage(animate) {
    const p = prob(), s = sess();
    const html = [phCase, phInfo, phDecision, phBreak, phInvestigate, phAdapt, phReality][s.phase](p);
    const el = $('stage');
    el.innerHTML = `<div class="stage-in${animate ? ' enter' : ''}">${html}</div>`;
    el.dataset.phase = PH[s.phase].k;
    requestAnimationFrame(fitStage);
  }

  // Projector safety net: shrink a screen only if its REAL content cannot fit.
  // Measures the natural height of the content (unaffected by the slide-in
  // animation's transform) so a phase change can never leave it too small.
  function fitStage() {
    const st = $('stage'), inn = st.firstElementChild;
    if (!st || !inn) return;
    const cs = getComputedStyle(st);
    const avail = st.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    inn.style.zoom = 1;
    inn.style.height = 'auto';                       // natural content height
    let z = 1;
    while (inn.getBoundingClientRect().height > avail + 2 && z > 0.72) { z -= 0.03; inn.style.zoom = z.toFixed(2); }
    inn.style.height = '';                           // back to filling the stage
  }
  window.addEventListener('resize', () => requestAnimationFrame(fitStage));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => requestAnimationFrame(fitStage));

  function applyTheme() {
    const ph = sess().phase;
    document.body.classList.toggle('t-pre', ph < 3);
    document.body.classList.toggle('t-break', ph === 3);
    document.body.classList.toggle('t-post', ph > 3);
  }

  function cardHTML(p) {
    const st = boardStatus(p.id), [ico, txt] = STATUS[st];
    const team = PUBLIC
      ? `<div class="pc-team ro"><div class="ro-name">${esc(teamName(p.id)) || '&nbsp;'}</div></div>`
      : `<div class="pc-team"><input class="in-name" data-id="${p.id}" value="${esc(teamName(p.id))}" maxlength="28" placeholder="TEAM NAME" aria-label="Team name for problem ${numOf(p.id)}"></div>`;
    const num = PUBLIC
      ? `<span class="pc-num">${numOf(p.id)}</span>`
      : `<input class="in-pnum" data-id="${p.id}" value="${numOf(p.id)}" maxlength="2" aria-label="Problem number (editable)" title="Edit the problem number">`;
    return `<article class="pcard st-${st}" data-id="${p.id}">
      <div class="pc-top">${num}<span class="pc-cat">${esc(p.category)}</span></div>
      <button class="pc-open" data-open="${p.id}" aria-label="Open problem ${numOf(p.id)}: ${esc(p.title)}"><span class="pc-title">${esc(p.title)}</span></button>
      ${team}
      <div class="pc-foot"><span class="pill st-${st}"><span class="pill-ico" aria-hidden="true">${ico}</span>${txt}</span></div>
    </article>`;
  }

  function renderBoard() {
    $('grid').innerHTML = S.order.map(id => cardHTML(PROBS.find(p => p.id === id))).join('');
    const done = PROBS.filter(p => boardStatus(p.id) === 'complete').length;
    $('bdCount').textContent = `${done} / ${PROBS.length} COMPLETE`;
  }

  function showView() {
    const open = S.openId != null && PROBS.find(p => p.id === S.openId);
    $('boardView').hidden = !!open;
    $('app').hidden = !open;
    document.body.dataset.view = open ? 'stage' : 'board';
    if (!open) { document.body.classList.remove('t-break', 't-post'); document.body.classList.add('t-pre'); }
  }

  function renderAll(animate) {
    showView();
    if (S.openId == null) { renderBoard(); renderDock(); if (drawerOpen) renderDrawer(true); tickTimer(); return; }
    applyTheme();
    renderHeader();
    renderPhases();
    renderStage(!!animate);
    renderDock();
    if (drawerOpen) renderDrawer(true);
    tickTimer();
  }

  /* ══════════════════════════════════════════
     NAVIGATION
  ══════════════════════════════════════════ */
  let fxBusy = false;

  function applyPhase(n) {
    const s = sess();
    s.phase = n;
    if (n >= 3) s.broken = true;
    if (n !== 4) { s.armed = null; s.picks = []; }
    save();
    renderAll(true);
  }

  function setPhase(n) {
    if (fxBusy) return;
    n = clamp(n, 0, PH.length - 1);
    const s = sess();
    if (n === s.phase) return;
    if (n >= 3 && !s.broken && s.phase < 3) { playBreak(() => applyPhase(3)); return; }
    applyPhase(n);
  }

  const next = () => setPhase(sess().phase + 1);
  const prev = () => setPhase(sess().phase - 1);

  function openProblem(id) {
    if (fxBusy || !PROBS.find(p => p.id === id)) return;
    S.openId = id; S.prob = id;
    const s = sess();
    s.phase = 0; s.armed = null; s.picks = [];          // opening a card always starts at the first part
    save(); closeModals(); closeDrawer(); renderAll(true);
  }
  function toBoard() {
    if (fxBusy) return;
    S.openId = null; save(); closeModals(); closeDrawer(); renderAll(false);
  }
  function stepProblem(d) {
    if (fxBusy || S.openId == null) return;
    const i = S.order.indexOf(S.openId) + d;
    if (i < 0 || i >= S.order.length) return;
    openProblem(S.order[i]);
  }

  /* ══════════════════════════════════════════
     THE BREAK — cinematic transition (≈4 s, skippable)
  ══════════════════════════════════════════ */
  let fxTimers = [], fxApply = null;

  function endFx() {
    fxTimers.forEach(clearTimeout); fxTimers = [];
    if (fxApply) { const f = fxApply; fxApply = null; f(); }
    const fx = $('fx');
    fx.className = 'fx'; fx.innerHTML = '';
    $('stage').classList.remove('glitch');
    fxBusy = false;
  }

  function playBreak(applyFn) {
    if (REDUCED) { applyFn(); return; }
    fxBusy = true; fxApply = applyFn;
    const fx = $('fx');
    fx.innerHTML = `<div class="fx-scan"></div><div class="fx-rgb"></div>
      <div class="fx-warn">⚠ WARNING ⚠</div>
      <div class="fx-l1">THE BREAK</div>
      <div class="fx-l2">Not all information<br>can be trusted.</div>`;
    fx.className = 'fx on';
    $('stage').classList.add('glitch');
    const at = (ms, fn) => fxTimers.push(setTimeout(fn, ms));
    at(300,  () => fx.classList.add('dark'));
    at(650,  () => fx.classList.add('warn'));
    at(1250, () => { fx.classList.remove('warn'); fx.classList.add('l1'); });
    at(2550, () => { fx.classList.remove('l1'); fx.classList.add('l2'); });
    at(3700, () => { const f = fxApply; fxApply = null; if (f) f(); fx.classList.add('out'); });
    at(4400, endFx);
  }

  const triggerBreak = () => {
    const s = sess();
    if (fxBusy) return;
    if (s.phase >= 3) { toast('THE BREAK has already happened for this team.'); return; }
    playBreak(() => applyPhase(3));
  };

  /* ══════════════════════════════════════════
     LIFELINES
  ══════════════════════════════════════════ */
  const life = k => D.lifelines.find(l => l.k === k);

  function arm(k) {
    const s = sess();
    if (s.phase < 3) { toast('Lifelines open after THE BREAK.'); return; }
    if (s.used[k]) { toast(life(k).name + ' has already been used.'); return; }
    if (s.phase !== 4) { s.phase = 4; s.broken = true; }
    s.armed = k; s.picks = []; s.result = null;
    save(); closeModals(); closeDrawer(); renderAll(false);
    toast(`${life(k).name}: click ${life(k).need === 1 ? 'a statement' : 'two statements'}, then press ENTER to confirm.`);
  }

  function cancelArm() {
    const s = sess();
    if (!s.armed) return;
    s.armed = null; s.picks = [];
    save(); renderAll(false);
  }

  function pick(i) {
    const s = sess();
    if (!s.armed) return;
    const L = life(s.armed);
    if ((s.armed === 'verify' || s.armed === 'eliminate') && statusOf(i) !== 'unknown') { toast('That statement is already revealed.'); return; }
    if (s.armed === 'source' && s.rev[i] && s.rev[i].src) { toast('Its source is already revealed.'); return; }
    const at = s.picks.indexOf(i);
    if (at >= 0) s.picks.splice(at, 1);
    else if (L.need === 1) s.picks = [i];
    else if (s.picks.length < L.need) s.picks.push(i);
    else s.picks = [s.picks[1], i];
    save(); renderAll(false);
  }

  function confirmArm() {
    const s = sess(), p = prob();
    if (!s.armed) return;
    const L = life(s.armed);
    if (s.picks.length !== L.need) { toast(`Select ${L.need === 1 ? 'one statement' : 'two statements'} first.`); return; }
    const rv = i => (s.rev[i] = s.rev[i] || {});
    const need = s.armed === 'source' ? s.picks.filter(i => !stm(i, p).src) : s.picks.filter(i => !stm(i, p).truth);
    if (need.length) {
      toast(`Set ${s.armed === 'source' ? 'the source' : 'the truth'} of evidence ${need.map(i => pad2(i + 1)).join(' & ')} in the KEY panel first (K).`);
      return;                                              // nothing is spent
    }
    if (s.armed === 'verify') {
      const i = s.picks[0], t = stm(i, p).truth;
      rv(i).status = t;
      s.result = { kind: 'verify', head: `EVIDENCE ${pad2(i + 1)} · ${ST[t].text}`, body: stm(i, p).why };
    } else if (s.armed === 'eliminate') {
      const [a, b] = s.picks, tr = i => stm(i, p).truth;
      const bad = [a, b].find(i => tr(i) === 'invalid') ?? [a, b].find(i => tr(i) === 'irrelevant');
      if (bad === undefined) {
        s.result = { kind: 'eliminate', head: `BOTH EVIDENCE ${pad2(a + 1)} AND ${pad2(b + 1)} ARE RELIABLE`, body: 'Neither of them can be eliminated.' };
      } else {
        rv(bad).status = 'unreliable';
        s.result = { kind: 'eliminate', head: `EVIDENCE ${pad2(bad + 1)} IS UNRELIABLE`, body: `Eliminated from your picks: ${pad2(a + 1)} and ${pad2(b + 1)}.` };
      }
    } else {
      const i = s.picks[0];
      rv(i).src = true;
      s.result = { kind: 'source', head: `EVIDENCE ${pad2(i + 1)} · SOURCE CHECK`, body: stm(i, p).src };
    }
    s.used[s.armed] = true;
    s.armed = null; s.picks = [];
    save(); renderAll(false);
  }

  // organizer override: show / hide a statement’s classification without spending a lifeline
  function manualReveal(i) {
    const s = sess(), p = prob();
    s.rev[i] = s.rev[i] || {};
    if (!s.rev[i].status && !stm(i, p).truth) { toast('Set this statement’s truth first.'); return; }
    s.rev[i].status = s.rev[i].status ? undefined : stm(i, p).truth;
    save(); renderAll(false);
  }

  function resetInvestigation() {
    const s = sess();
    s.used = {}; s.rev = {}; s.armed = null; s.picks = []; s.result = null;
    save(); renderAll(false);
  }

  /* ══════════════════════════════════════════
     DOCK  (auto-hides so the projector stays clean)
  ══════════════════════════════════════════ */
  function renderDock() {
    const d = $('dock');
    if (PUBLIC || S.openId == null) { d.hidden = true; return; }
    d.hidden = false;
    const s = sess(), ph = s.phase;
    let primary = '';
    if (s.armed) primary = `<button class="dk ok" data-a="confirm">✓ CONFIRM ${life(s.armed).name} <kbd>↵</kbd></button><button class="dk" data-a="cancel">CANCEL</button>`;
    else if (ph < 3) primary = `<button class="dk brk" data-a="break" title="Trigger THE BREAK (B)">⚠ TRIGGER THE BREAK <kbd>B</kbd></button>`;
    else if (ph === 3 || ph === 4) primary = `<button class="dk lf-b" data-a="life" title="Open lifelines (L)">LIFELINES · ${lifeLeft()} LEFT <kbd>L</kbd></button>`;
    else if (ph === 6 && !s.reality) primary = `<button class="dk brk" data-a="reveal" title="Reveal reality (R)">REVEAL REALITY <kbd>R</kbd></button>`;
    let mark = '';
    if (ph === 2) mark = `<button class="dk ${s.initDone ? 'on' : ''}" data-a="init">${s.initDone ? '✓ INITIAL SOLUTION PRESENTED' : '○ MARK INITIAL SOLUTION PRESENTED'}</button>`;
    if (ph === 5) mark = `<button class="dk ${s.adaptDone ? 'on' : ''}" data-a="adapt">${s.adaptDone ? '✓ ADAPTATION PRESENTED' : '○ MARK ADAPTATION PRESENTED'}</button>`;
    d.innerHTML = `
      <button class="dk" data-a="board" title="Problem board (H)" aria-label="Problem board">⌂</button>
      <span class="dk-sep"></span>
      <button class="dk" data-a="prev" title="Previous phase (←)" aria-label="Previous phase"${ph <= 0 ? ' disabled' : ''}>‹</button>
      <span class="dk-cur">${PH[ph].label}</span>
      <button class="dk" data-a="next" title="Next phase (→)" aria-label="Next phase"${ph >= 6 ? ' disabled' : ''}>›</button>
      <span class="dk-sep"></span>
      ${primary}${mark}
      <span class="dk-sep"></span>
      <button class="dk priv" data-a="key" title="Organizer panel (K)">🔒 ORGANIZER</button>
      <button class="dk" data-a="fs" title="Fullscreen (F)" aria-label="Fullscreen">⛶</button>`;
    showDock();
  }

  let dockTimer = null, cursorTimer = null;
  function showDock() {
    const d = $('dock');
    if (PUBLIC) return;
    document.body.classList.add('show-cursor');
    clearTimeout(cursorTimer);
    cursorTimer = setTimeout(() => document.body.classList.remove('show-cursor'), 3200);
    if (S.openId == null) return;
    d.classList.add('show');
    clearTimeout(dockTimer);
    dockTimer = setTimeout(() => {
      if (!d.matches(':hover') && !d.contains(document.activeElement) && !drawerOpen && !sess().armed) d.classList.remove('show');
    }, 3400);
  }
  ['mousemove', 'keydown', 'touchstart'].forEach(ev => document.addEventListener(ev, showDock, { passive: true }));

  /* ══════════════════════════════════════════
     FULLSCREEN / PRESENTATION MODE
  ══════════════════════════════════════════ */
  function setFs(on) {
    if (PUBLIC) return;
    document.body.classList.toggle('fs', on);
    if (on) {
      const el = document.documentElement;
      if (!document.fullscreenElement && el.requestFullscreen) el.requestFullscreen().catch(() => {});
    } else if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    requestAnimationFrame(fitStage);
  }
  const toggleFs = () => setFs(!document.body.classList.contains('fs'));
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && !PUBLIC) { document.body.classList.remove('fs'); requestAnimationFrame(fitStage); }
  });

  /* ══════════════════════════════════════════
     DRAWER (organizer only)
  ══════════════════════════════════════════ */
  let drawerOpen = false, drawerTab = 'key';

  function openDrawer(tab) {
    if (PUBLIC) return;
    if (S.openId == null) tab = tab === 'timer' ? 'timer' : 'setup';     // on the board only TIMER and SETUP apply
    else if (secretsHidden() && isSecretTab(tab || drawerTab)) tab = 'timer';
    drawerOpen = true;
    if (tab) drawerTab = tab;
    $('drawer').classList.add('open');
    $('drawer').setAttribute('aria-hidden', 'false');
    renderDrawer(false);
  }
  function closeDrawer() {
    drawerOpen = false;
    $('drawer').classList.remove('open');
    $('drawer').setAttribute('aria-hidden', 'true');
  }

  const list = items => `<ul class="dr-list">${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`;

  function tabKey() {
    const p = prob(), s = sess();
    const cnt = t => p.statements.map((x, i) => (stm(i, p).truth === t ? pad2(i + 1) : null)).filter(Boolean).join(' · ') || '—';
    const unset = p.statements.filter((_, i) => !stm(i, p).truth).length;
    return `
      <div class="dr-sec core"><div class="dr-h">${numOf(p.id)} · ${esc(p.category)}</div><div class="dr-core">${esc(p.title)}</div>
        <div class="dr-meta">VALID <b>${cnt('valid')}</b><br>INVALID <b>${cnt('invalid')}</b><br>IRRELEVANT <b>${cnt('irrelevant')}</b>${unset ? `<br><span class="warn">NOT SET <b>${unset} of 8</b> — set them below before using lifelines</span>` : ''}</div></div>
      <div class="dr-sec"><div class="dr-h">ORGANIZER NOTES</div>${list(p.organizer.notes)}</div>
      <div class="dr-sec"><div class="dr-h">THE EVIDENCE — TRUTH · EXPLANATION · SOURCE</div>
        ${p.statements.map((x0, i) => { const x = stm(i, p), t = x.truth;
          return `
          <div class="kv t-${t || 'unset'}">
            <div class="kv-h"><b>${pad2(i + 1)}</b><span class="kv-t">${t ? `<i aria-hidden="true">${ST[t].icon}</i>${ST[t].text}` : 'NOT SET'}</span>
              <button class="btn ghost sm" data-rv="${i}"${s.phase < 3 || !t ? ' disabled' : ''}>${s.rev[i] && s.rev[i].status ? 'HIDE FROM SCREEN' : 'SHOW ON SCREEN'}</button></div>
            <p class="kv-s">${esc(x.t)}</p>
            ${p.editable ? `<div class="kv-set">${['valid', 'invalid', 'irrelevant'].map(v => `<button class="btn sm ${t === v ? 'on' : 'ghost'}" data-set="truth" data-i="${i}" data-v="${v}">${ST[v].text}</button>`).join('')}</div>
            ${p.srcOptions ? `<div class="kv-set src">${p.srcOptions.map(o => `<button class="btn sm ${x.src === o ? 'on' : 'ghost'}" data-set="src" data-i="${i}" data-v="${esc(o)}">${esc(o)}</button>`).join('')}</div>` : ''}
            <input class="why-in" data-i="${i}" value="${esc(x.why)}" placeholder="Explanation shown when this is verified">`
            : `<p class="kv-w"><em>WHY</em>${esc(x.why)}</p><p class="kv-w"><em>SOURCE</em>${esc(x.src)}</p>`}
          </div>`; }).join('')}
      </div>
      <div class="dr-sec foot"><div class="dr-h">JUDGING GUIDANCE</div>${list(D.judging.guidance)}</div>`;
  }

  function tabLife() {
    const s = sess();
    return `<div class="dr-sec"><div class="dr-h">LIFELINES · ${lifeLeft()} OF 3 LEFT</div>
      <div class="score-note">Each can be used once per team. Pick a lifeline, click the statement(s) on the main screen, then press ENTER.</div>
      ${D.lifelines.map(l => `<div class="ll-row${s.used[l.k] ? ' used' : ''}"><div><b>${l.name}</b><p>${esc(l.blurb)}</p></div>
        <button class="btn ${s.used[l.k] ? 'ghost' : 'okbtn'}" data-arm="${l.k}"${s.used[l.k] ? ' disabled' : ''}>${s.used[l.k] ? '✕ USED' : 'USE'}</button></div>`).join('')}
      ${s.armed ? `<div class="dr-btns row"><button class="btn okbtn" data-a="confirm">✓ CONFIRM ${life(s.armed).name}</button><button class="btn ghost" data-a="cancel">CANCEL</button></div>` : ''}
      <div class="dr-btns"><button class="btn danger" id="btnResetInv">RESET THIS TEAM’S INVESTIGATION…</button></div></div>`;
  }

  function tabText() {
    const p = prob(), s = sess(), r = realityOf(p);
    const ta = (id, label, v, rows = 3) => `<label class="fld"><span>${label}</span><textarea class="tx-in" data-f="${id}" rows="${rows}">${esc(v || '')}</textarea></label>`;
    return `<div class="dr-sec"><div class="dr-h">THIS TEAM · ${esc(teamName(S.prob) || 'UNASSIGNED')}</div>
        <div class="score-note">Type a short summary while they speak. These appear side by side on the ADAPT screen.</div>
        ${ta('orig', 'ORIGINAL DECISION', s.orig)}${ta('adapted', 'ADAPTED DECISION', s.adapted)}${ta('notes', 'PRIVATE NOTES', s.notes)}</div>
      <div class="dr-sec"><div class="dr-h">WHAT ACTUALLY HAPPENED · ${numOf(p.id)} (same for every team)</div>
        <div class="score-note">Not invented — type what really happened. Saved in this browser; also editable in round2-data.js. Shown only when you press REVEAL REALITY.</div>
        ${ta('r.situation', 'ACTUAL SITUATION', r.situation, 3)}${ta('r.decision', 'ACTUAL DECISION', r.decision, 3)}${ta('r.outcome', 'ACTUAL OUTCOME', r.outcome, 3)}${ta('r.reflection', 'REFLECTION PROMPT (optional)', r.reflection, 2)}</div>`;
  }

  const scoreTotal = () => D.judging.categories.reduce((a, c) => a + (Number(sess().scores[c.k]) || 0), 0);

  function tabScore() {
    const s = sess();
    return `<div class="dr-sec"><div class="dr-h">JUDGING · ${esc(teamName(S.prob) || 'UNASSIGNED')} · ${numOf(S.prob)}</div>
      <div class="score-note">Organizer-only. Never shown on the projector.</div>
      ${D.judging.categories.map(c => `<div class="sc-row"><div class="sc-l">${esc(c.label)}</div>
        <button class="sc-b" data-sc="${c.k}" data-d="-1" aria-label="Decrease ${esc(c.label)}">−</button>
        <input class="sc-in" type="number" min="0" max="${c.max}" step="1" data-k="${c.k}" value="${s.scores[c.k] ?? ''}" placeholder="0" aria-label="${esc(c.label)} out of ${c.max}">
        <button class="sc-b" data-sc="${c.k}" data-d="1" aria-label="Increase ${esc(c.label)}">+</button>
        <div class="sc-max">/ ${c.max}</div></div>`).join('')}
      <div class="sc-total"><span>TOTAL</span><b id="scTotal">${scoreTotal()}</b><em>/ 100</em></div></div>`;
  }

  function tabTimer() {
    const T = S.timer;
    return `<div class="dr-sec"><div class="dr-h">COUNTDOWN</div>
      <div class="tm-big" id="tmBig">--:--</div>
      <div class="dr-btns row"><button class="btn okbtn" data-t="start" id="tmStart">▶ START</button><button class="btn" data-t="pause">❚❚ PAUSE</button><button class="btn ghost" data-t="reset">↺ RESET</button></div>
      <div class="dr-btns row"><button class="btn ghost" data-t="add" data-m="-60">− 1 MIN</button><button class="btn ghost" data-t="add" data-m="60">+ 1 MIN</button></div>
      <div class="dr-h" style="margin-top:1.2rem">PRESETS</div>
      <div class="dr-btns row">${[3, 5, 10, 15, 20].map(m => `<button class="btn ghost${T.preset === m ? ' on' : ''}" data-t="preset" data-m="${m}">${m} MIN</button>`).join('')}</div>
      <label class="fld inline"><span>CUSTOM (MIN)</span><input id="tmCustom" type="number" min="0.5" max="180" step="0.5" value="${T.preset}"><button class="btn" data-t="custom">SET</button></label>
      <div class="dr-h" style="margin-top:1.2rem">ON THE PROJECTOR</div>
      <button class="btn ${T.visible ? 'on' : 'ghost'}" data-t="vis">${T.visible ? '● TIMER VISIBLE — CLICK TO HIDE' : '○ TIMER HIDDEN — CLICK TO SHOW'}</button>
      <div class="score-note">Starting shows it automatically. Amber at 1:00, red at 0:20.</div></div>`;
  }

  function tabSetup() {
    return `<div class="dr-sec"><div class="dr-h">PRESENTING DEVICE</div>
        <label class="sw"><input type="checkbox" id="tgSecrets"${secretsHidden() ? ' checked' : ''}><i class="sw-t" aria-hidden="true"></i>
          <span><b>Hide KEY, NOTES and SCORE on this device</b><em>Removes the answers, the typed real-world outcome and the scores (and the K shortcut) so nothing private can show on the projector. Saved on this device only.</em></span></label></div>
      ${S.openId == null ? '' : `<div class="dr-sec"><div class="dr-h">THIS PROBLEM</div>
        <label class="fld"><span>PROBLEM NUMBER</span><input id="tmPnum" value="${numOf(S.prob)}" maxlength="2"></label>
        <div class="score-note">Type another problem’s number to swap places with it (${POS.join(', ')}).</div>
        <label class="fld"><span>TEAM NAME</span><input class="tn-in" data-id="${S.prob}" value="${esc(teamName(S.prob))}" maxlength="28" placeholder="TEAM NAME"></label>
        <div class="dr-btns row"><button class="btn ghost" data-a="prevTeam">◀ PREV PROBLEM</button><button class="btn ghost" data-a="nextTeam">NEXT PROBLEM ▶</button><button class="btn ghost" data-a="board">⌂ BOARD</button></div></div>`}
      <div class="dr-sec"><div class="dr-h">PRESENTING</div>
        <div class="dr-btns row"><button class="btn ghost" data-a="projector">⧉ OPEN PROJECTOR WINDOW</button><button class="btn ghost" data-a="fs">⛶ FULLSCREEN</button><button class="btn ghost" data-a="keys">? SHORTCUTS</button></div>
        <div class="score-note">The projector window shows only what the team should see and follows everything you do here.</div>
        <div class="dr-btns row"><a class="btn ghost" href="presenter.html">ROUND 1 PRESENTER</a><a class="btn ghost" href="index.html">EVENT PAGE</a></div></div>
      <div class="dr-sec"><div class="dr-h">DANGER</div><button class="btn danger" id="btnResetAll">RESET ALL OF ROUND 2…</button></div>`;
  }

  function renderDrawer(keepScroll) {
    const body = $('drBody'), top = keepScroll ? body.scrollTop : 0;
    const active = document.activeElement;
    const keepFocus = keepScroll && active && active.closest && active.closest('#drBody') && /INPUT|TEXTAREA/.test(active.tagName);
    if (keepFocus && (drawerTab === 'text' || drawerTab === 'setup' || drawerTab === 'score')) return;   // never rebuild under a cursor
    const board = S.openId == null;
    $('drawer').classList.toggle('board-mode', board);
    if (board && drawerTab !== 'timer') drawerTab = 'setup';
    $('drTitle').textContent = board ? 'PROBLEM BOARD' : `${teamName(S.prob) ? teamName(S.prob) + ' · ' : ''}${numOf(S.prob)} ${prob().title}`;
    document.querySelectorAll('#drTabs button').forEach(b => {
      const on = b.dataset.tab === drawerTab;
      b.classList.toggle('on', on); b.setAttribute('aria-selected', on);
    });
    if (!board && secretsHidden() && isSecretTab(drawerTab)) drawerTab = 'timer';
    body.innerHTML = { key: tabKey, life: tabLife, text: tabText, score: tabScore, timer: tabTimer, setup: tabSetup }[drawerTab]();
    body.scrollTop = top;
    tickTimer();
  }

  /* ══════════════════════════════════════════
     TIMER
  ══════════════════════════════════════════ */
  const remaining = () => (S.timer.running ? Math.max(0, Math.round((S.timer.endAt - Date.now()) / 1000)) : S.timer.remaining);
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
    } else if (cmd === 'add') {
      const d = Number(m);
      if (T.running) T.endAt += d * 1000; else T.remaining = Math.max(0, T.remaining + d);
      T.visible = true;
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
  const toggleTimer = () => timerCmd(S.timer.running ? 'pause' : 'start');

  function tickTimer() {
    const T = S.timer, r = remaining();
    if (T.running && r <= 0 && !PUBLIC) { T.running = false; T.remaining = 0; save(); if (drawerOpen && drawerTab === 'timer') renderDrawer(true); }
    const state = r <= 0 ? 'up' : r <= 20 ? 'crit' : r <= 60 ? 'warn' : '';
    const html = T.visible
      ? `<div class="tchip ${state}" role="timer"><span aria-hidden="true">${r <= 0 ? '⏰' : '⏱'}</span><b>${fmt(r)}</b>${r <= 0 ? '<em>TIME</em>' : T.running ? '' : '<em>PAUSED</em>'}</div>` : '';
    document.querySelectorAll('.timer-slot').forEach(el => { if (el.dataset.h !== html) { el.innerHTML = html; el.dataset.h = html; } });
    const big = $('tmBig');
    if (big) { big.textContent = fmt(r); big.className = 'tm-big ' + state; }
    const st = $('tmStart'); if (st) st.disabled = T.running;
  }
  setInterval(tickTimer, 250);

  /* ══════════════════════════════════════════
     TOAST + MODALS
  ══════════════════════════════════════════ */
  let toastT = null;
  function toast(msg) {
    if (PUBLIC) return;
    const t = $('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 3600);
  }

  const modalOpen = () => !$('modalLife').hidden || !$('modalKeys').hidden || !$('modalReset').hidden;
  function openModal(id) { $(id).hidden = false; const b = $(id).querySelector('.btn'); if (b) b.focus(); }
  function closeModals() { ['modalLife', 'modalKeys', 'modalReset'].forEach(id => { $(id).hidden = true; }); }

  function openLifeModal() {
    const s = sess();
    if (s.phase < 3) { toast('Lifelines open after THE BREAK.'); return; }
    $('llGrid').innerHTML = D.lifelines.map((l, n) => `<button class="ll-tile${s.used[l.k] ? ' used' : ''}" data-arm="${l.k}"${s.used[l.k] ? ' disabled' : ''}>
        <i>${n + 1}</i><b>${l.name}</b><span>${esc(l.blurb)}</span><em>${s.used[l.k] ? '✕ USED' : '○ AVAILABLE'}</em></button>`).join('');
    openModal('modalLife');
  }

  function resetAll() {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    S = blank();
    closeModals(); closeDrawer();
    renderAll(true);
  }

  function openProjector() {
    window.open(location.pathname.split('/').pop() + '?screen=public', 'pointBreakRound2Public', 'popup,width=1280,height=720');
  }

  /* ══════════════════════════════════════════
     ACTIONS + EVENTS
  ══════════════════════════════════════════ */
  const ACTIONS = {
    prev, next,
    break: triggerBreak,
    life: openLifeModal,
    confirm: confirmArm,
    cancel: cancelArm,
    reveal: () => {
      const s = sess();
      if (s.phase !== 6) { setPhase(6); return; }
      s.reality = true; save(); renderAll(true);
    },
    init:  () => { const s = sess(); s.initDone = !s.initDone; save(); renderAll(false); },
    adapt: () => { const s = sess(); s.adaptDone = !s.adaptDone; save(); renderAll(false); },
    key: () => { const t = S.openId == null ? 'setup' : 'key'; drawerOpen && drawerTab === t ? closeDrawer() : openDrawer(t); },
    fs: toggleFs,
    keys: () => openModal('modalKeys'),
    projector: openProjector,
    prevTeam: () => stepProblem(-1),
    nextTeam: () => stepProblem(1),
    board: toBoard,
  };

  $('dock').addEventListener('click', e => {
    const b = e.target.closest('[data-a]');
    if (b && !b.disabled && ACTIONS[b.dataset.a]) ACTIONS[b.dataset.a]();
  });

  $('phases').addEventListener('click', e => {
    if (PUBLIC || document.body.classList.contains('fs')) return;
    const b = e.target.closest('[data-p]');
    if (b) setPhase(Number(b.dataset.p));
  });

  $('stage').addEventListener('click', e => {
    const c = e.target.closest('.ev.pickable');
    if (c) pick(Number(c.dataset.i));
  });
  $('stage').addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('pickable')) {
      e.preventDefault(); e.stopPropagation(); pick(Number(e.target.dataset.i));
    }
  });

  // ── problem board ──
  $('grid').addEventListener('click', e => {
    if (e.target.closest('input')) return;
    const card = e.target.closest('.pcard');
    if (card) openProblem(Number(card.dataset.id));
  });
  $('grid').addEventListener('input', e => {
    const el = e.target;
    if (el.classList.contains('in-name')) {
      S.names[Number(el.dataset.id)] = el.value.toUpperCase();
      el.value = el.value.toUpperCase();
      save();
      const card = el.closest('.pcard'), id = Number(el.dataset.id), st = boardStatus(id);
      card.className = `pcard st-${st}`;
      card.querySelector('.pill').outerHTML = `<span class="pill st-${st}"><span class="pill-ico" aria-hidden="true">${STATUS[st][0]}</span>${STATUS[st][1]}</span>`;
    } else if (el.classList.contains('in-pnum')) { /* committed on change */ }
  });
  $('grid').addEventListener('change', e => {
    const el = e.target;
    if (!el.classList.contains('in-pnum')) return;
    const id = Number(el.dataset.id);
    if (setPosition(id, el.value)) { renderBoard(); const c = document.querySelector(`.pcard[data-id="${id}"] .in-pnum`); if (c) c.focus(); }
    else el.value = numOf(id);
  });
  $('btnOrgBoard').addEventListener('click', () => openDrawer('setup'));
  $('btnFsBoard').addEventListener('click', toggleFs);
  $('btnKeysBoard').addEventListener('click', () => openModal('modalKeys'));
  $('btnResetBoard').addEventListener('click', () => openModal('modalReset'));
  $('btnProjBoard').addEventListener('click', openProjector);

  $('drClose').addEventListener('click', closeDrawer);
  $('drTabs').addEventListener('click', e => {
    const b = e.target.closest('[data-tab]');
    if (b) { drawerTab = b.dataset.tab; renderDrawer(false); }
  });

  $('drBody').addEventListener('change', e => {
    if (e.target.id !== 'tgSecrets') return;
    try { localStorage.setItem(SECRET_KEY, e.target.checked ? '1' : '0'); } catch (err) { /* ignore */ }
    applySecretMode();
    if (e.target.checked && isSecretTab(drawerTab)) drawerTab = 'timer';
    renderDrawer(false);
  });

  $('drBody').addEventListener('change', e => {
    if (e.target.id !== 'tmPnum') return;
    if (!setPosition(S.prob, e.target.value)) e.target.value = numOf(S.prob);
    renderAll(false); e.target.value = numOf(S.prob);
  });

  $('drBody').addEventListener('input', e => {
    const el = e.target, s = sess(), p = prob();
    if (el.classList.contains('why-in')) {
      const pid = S.prob, i = Number(el.dataset.i);
      ((S.edits[pid] = S.edits[pid] || {})[i] = S.edits[pid][i] || {}).why = el.value; save(); return;
    }
    if (el.classList.contains('tx-in')) {
      const f = el.dataset.f;
      if (f.startsWith('r.')) {
        const k = f.slice(2);
        S.reality[p.id] = { ...(S.reality[p.id] || {}), [k]: el.value };
      } else s[f] = el.value;
      save();
      if (f === 'orig' || f === 'adapted' || f.startsWith('r.')) renderStage(false);
    } else if (el.classList.contains('sc-in')) {
      const c = D.judging.categories.find(x => x.k === el.dataset.k);
      const v = el.value === '' ? '' : clamp(Math.round(Number(el.value)), 0, c.max);
      if (v !== '' && String(v) !== el.value) el.value = v;
      s.scores[c.k] = v; save(); $('scTotal').textContent = scoreTotal();
    } else if (el.classList.contains('tn-in')) {
      S.names[Number(el.dataset.id)] = el.value.toUpperCase();
      el.value = el.value.toUpperCase();
      save(); renderHeader();
    }
  });

  $('drBody').addEventListener('click', e => {
    const t = e.target;
    if (S.openId == null) {                               // board organizer: only TIMER / SETUP controls
      const tm0 = t.closest('[data-t]'); if (tm0) { timerCmd(tm0.dataset.t, tm0.dataset.m); return; }
      const a0 = t.closest('[data-a]'); if (a0 && ACTIONS[a0.dataset.a]) { ACTIONS[a0.dataset.a](); return; }
      if (t.id === 'btnResetAll') openModal('modalReset');
      return;
    }
    const sc = t.closest('[data-sc]');
    if (sc) {
      const c = D.judging.categories.find(x => x.k === sc.dataset.sc), s = sess();
      s.scores[c.k] = clamp((Number(s.scores[c.k]) || 0) + Number(sc.dataset.d), 0, c.max);
      save(); renderDrawer(true); return;
    }
    const tm = t.closest('[data-t]'); if (tm) { timerCmd(tm.dataset.t, tm.dataset.m); return; }
    const ar = t.closest('[data-arm]'); if (ar && !ar.disabled) { arm(ar.dataset.arm); return; }
    const st = t.closest('[data-set]');
    if (st) {
      const pid = S.prob, i = Number(st.dataset.i), k = st.dataset.set, v = st.dataset.v;
      const ed = ((S.edits[pid] = S.edits[pid] || {})[i] = S.edits[pid][i] || {});
      ed[k] = ed[k] === v ? '' : v;
      // a changed truth must not leave a stale revealed status on the projector
      const rv0 = sess().rev[i]; if (k === 'truth' && rv0 && rv0.status && rv0.status !== 'unreliable') rv0.status = ed.truth || undefined;
      save(); renderAll(false); return;
    }
    const rv = t.closest('[data-rv]'); if (rv && !rv.disabled) { manualReveal(Number(rv.dataset.rv)); return; }
    const ac = t.closest('[data-a]'); if (ac && ACTIONS[ac.dataset.a]) { ACTIONS[ac.dataset.a](); return; }
    if (t.id === 'btnResetAll') { openModal('modalReset'); return; }
    if (t.id === 'btnResetInv') {
      if (!t.dataset.armed) {
        t.dataset.armed = '1'; t.textContent = 'CLICK AGAIN TO CONFIRM';
        setTimeout(() => { if (t.isConnected) { delete t.dataset.armed; t.textContent = 'RESET THIS TEAM’S INVESTIGATION…'; } }, 3500);
      } else resetInvestigation();
    }
  });

  $('llGrid').addEventListener('click', e => {
    const b = e.target.closest('[data-arm]');
    if (b && !b.disabled) arm(b.dataset.arm);
  });
  $('mlClose').addEventListener('click', closeModals);
  $('mkOk').addEventListener('click', closeModals);
  $('mrCancel').addEventListener('click', closeModals);
  $('mrOk').addEventListener('click', resetAll);

  /* ══════════════════════════════════════════
     KEYBOARD
  ══════════════════════════════════════════ */
  function closeTop() {
    if (fxBusy) { endFx(); return; }
    if (modalOpen()) { closeModals(); return; }
    if (sess().armed) { cancelArm(); return; }
    if (drawerOpen) { closeDrawer(); return; }
    if (document.body.classList.contains('fs')) setFs(false);
  }

  document.addEventListener('keydown', e => {
    if (PUBLIC) return;
    const tg = e.target;
    const typing = tg && (/^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName) || tg.isContentEditable);
    if (e.key === 'Escape') { if (typing) { tg.blur(); return; } closeTop(); return; }
    if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
    if (modalOpen()) return;
    if (fxBusy) { e.preventDefault(); return; }
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k === '?') { openModal('modalKeys'); return; }
    if (S.openId == null) {                             // problem board: organizer = timer + setup
      if (k === 'f') toggleFs();
      else if (k === 'k' || k === 'j' || k === 'l') { drawerOpen && drawerTab === 'setup' ? closeDrawer() : openDrawer('setup'); }
      else if (k === 't') { drawerOpen && drawerTab === 'timer' ? closeDrawer() : openDrawer('timer'); }
      else if (k === ' ') { e.preventDefault(); toggleTimer(); }
      return;
    }
    if (k === 'h') { toBoard(); return; }
    if (k === 'ArrowRight') { e.preventDefault(); next(); }
    else if (k === 'ArrowLeft') { e.preventDefault(); prev(); }
    else if (k === ' ') { e.preventDefault(); toggleTimer(); }
    else if (k === 'b') triggerBreak();
    else if (k === 't') (drawerOpen && drawerTab === 'timer' ? closeDrawer() : openDrawer('timer'));
    else if (k === 'l') openLifeModal();
    else if (k === 'Enter') { if (sess().armed) { e.preventDefault(); confirmArm(); } }
    else if (k === 'r') ACTIONS.reveal();
    else if (k === 'f') toggleFs();
    else if (k === 'k') ACTIONS.key();
    else if (k === ']') stepProblem(1);
    else if (k === '[') stepProblem(-1);
  });

  /* ══════════════════════════════════════════
     PROJECTOR WINDOW — mirrors saved state
  ══════════════════════════════════════════ */
  if (PUBLIC) {
    document.body.classList.add('fs', 'pub');
    window.addEventListener('storage', e => {
      if (e.key !== KEY) return;
      const old = S, oldKey = skey(), oldPhase = (old.sess[oldKey] || {}).phase || 0;
      S = load();
      const nowPhase = sess().phase;
      if (S.openId != null && skey() === oldKey && oldPhase < 3 && nowPhase === 3 && !fxBusy) {
        const nextS = S; S = old;                     // keep the old screen under the effect
        playBreak(() => { S = nextS; renderAll(true); });
      } else renderAll(skey() !== oldKey || oldPhase !== nowPhase);
    });
  }

  /* ══════════════════════════════════════════
     INIT
  ══════════════════════════════════════════ */
  renderAll(false);

})();
