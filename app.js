/* ShlimpNote — everything you see. Plain JavaScript, no libraries.
   Her data lives in this browser's localStorage under KEY. */
"use strict";

const DEMO = /[?&]demo/.test(location.search); // ?demo shows made-up data, kept apart from hers
const KEY = DEMO ? "shlimpnote.demo" : "shlimpnote.v1";
const $ = (sel, root = document) => root.querySelector(sel);

/* ---------------- Dates ---------------- */
const pad = (n) => String(n).padStart(2, "0");
const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseDay = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const daysBetween = (a, b) => Math.round((parseDay(b) - parseDay(a)) / 86400000);
const fmtDay = (k, opts = { weekday: "short", day: "numeric", month: "short" }) =>
  parseDay(k).toLocaleDateString(undefined, opts);
const fmtTime = (t) => new Date(t).toLocaleString(undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

/* ---------------- Store ---------------- */
const blank = () => ({
  meds: [], medLog: {},
  cycle: { flow: {} },
  notes: [],
  lists: { chores: [], work: [] },
  goals: [],
  journal: {},
  requests: [],
  ui: {},
});
let S = load();
if (DEMO && !S.meds.length) S = demoData();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return Object.assign(blank(), JSON.parse(raw));
  } catch (e) { /* fall through to a fresh start */ }
  return blank();
}
let saveTimer = null;
function save(now = false) {
  clearTimeout(saveTimer);
  const write = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage full or blocked */ } };
  if (now) write(); else saveTimer = setTimeout(write, 250);
}
window.addEventListener("beforeunload", () => save(true));
window.addEventListener("pagehide", () => save(true));
// Ask the browser to never clear her data on its own.
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------------- Pages ---------------- */
const PAGES = [
  { id: "today", name: "Today", color: "var(--lavender)" },
  { id: "meds", name: "Meds", color: "var(--mint)" },
  { id: "cycle", name: "Cycle", color: "var(--peri)" },
  { id: "notes", name: "Notes", color: "var(--butter)" },
  { id: "chores", name: "Chores", color: "var(--peach)" },
  { id: "work", name: "Work", color: "var(--sky)" },
  { id: "goals", name: "Goals", color: "var(--lilac)" },
  { id: "journal", name: "Journal", color: "var(--blush)" },
];
const ASK = { id: "ask", name: "Ask for a change" };
let current = (location.search.match(/page=(\w+)/) || [])[1] || S.ui.page || "today";

function counts(id) {
  if (id === "meds") { const t = medsToday(); return t.total ? `${t.taken}/${t.total}` : ""; }
  if (id === "chores" || id === "work") { const n = S.lists[id].filter((i) => !i.done).length; return n || ""; }
  if (id === "notes") return S.notes.length || "";
  return "";
}

function drawNav() {
  $("#nav").innerHTML = PAGES.map((p) => `
    <button class="nav-item ${p.id === current ? "on" : ""}" data-go="${p.id}" style="--c:${p.color}">
      <span class="nav-dot" style="background:${p.color}"></span>${p.name}
      <span class="nav-count">${counts(p.id)}</span>
    </button>`).join("");
  $("#ask-btn").classList.toggle("on", current === "ask");
}

function go(id) {
  current = id;
  S.ui.page = id; save();
  drawNav();
  render(true);
  $("#main").scrollTop = 0;
}

function render(animate = false) {
  const page = PAGES.find((p) => p.id === current) || ASK;
  $("#page-title").textContent = page.id === "today" ? greeting() : page.name;
  $("#page-sub").textContent = page.id === "today" ? fmtDay(dayKey(), { weekday: "long", day: "numeric", month: "long" }) : "";
  const el = $("#page");
  document.documentElement.style.setProperty("--tone", page.color || "var(--lavender)");
  el.innerHTML = "";
  (VIEWS[page.id] || VIEWS.today)(el);
  if (animate) { el.classList.remove("page-in"); void el.offsetWidth; el.classList.add("page-in"); }
  growAll(el);
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

/* Re-draw the current page and the sidebar counts after a change. */
function refresh() { save(); drawNav(); const y = $("#main").scrollTop; render(); $("#main").scrollTop = y; }

/* ---------------- Little helpers ---------------- */
function h(html) { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; }

// Text boxes that grow with what's typed, so nothing hides off to the side.
function grow(t) { t.style.height = "auto"; t.style.height = t.scrollHeight + 2 + "px"; }
function growAll(root) { root.querySelectorAll("textarea.grow, textarea.body-in").forEach(grow); }
document.addEventListener("input", (e) => { if (e.target.matches("textarea.grow, textarea.body-in")) grow(e.target); });

// A box where Enter adds the text (Shift+Enter for a new line).
function addBox(placeholder, onAdd, btnText = "Add", boxId = placeholder) {
  const wrap = h(`<div class="row"><textarea class="grow" rows="1" placeholder="${esc(placeholder)}"></textarea><button class="btn">${btnText}</button></div>`);
  const t = $("textarea", wrap);
  const add = () => { const v = t.value.trim(); if (!v) { t.focus(); return; } onAdd(v); t.value = ""; grow(t); setTimeout(() => { const n = [...document.querySelectorAll("[data-box]")].find((x) => x.dataset.box === boxId); (n || t).focus(); }, 0); };
  t.dataset.box = boxId;
  t.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); add(); } });
  $("button", wrap).addEventListener("click", add);
  return wrap;
}

// Click some text to change it in place. Enter saves, Esc puts it back.
function editable(el, value, onSave, multi = true) {
  el.addEventListener("click", () => {
    if (el.querySelector("textarea")) return;
    const old = el.innerHTML;
    const t = h(`<textarea class="grow inline-edit" rows="1"></textarea>`);
    t.value = value;
    el.innerHTML = ""; el.appendChild(t); grow(t); t.focus();
    t.setSelectionRange(t.value.length, t.value.length);
    let done = false;
    const finish = (keep) => {
      if (done) return; done = true;
      const v = t.value.trim();
      if (keep && v && v !== value) onSave(v); else el.innerHTML = old;
    };
    t.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (!multi || !e.shiftKey)) { e.preventDefault(); finish(true); }
      if (e.key === "Escape") finish(false);
    });
    t.addEventListener("blur", () => finish(true));
  });
}

// Deleting never asks "are you sure?" — the item turns into an Undo line for a few seconds.
function removeWithUndo(rowEl, label, doRemove, doRestore) {
  doRemove(); save(); drawNav();
  const u = h(`<div class="undo">${esc(label)} removed <button>Undo</button></div>`);
  rowEl.replaceWith(u);
  const timer = setTimeout(() => { u.style.opacity = "0"; u.style.transition = "opacity .3s"; setTimeout(() => u.isConnected && refresh(), 300); }, 6000);
  $("button", u).addEventListener("click", () => { clearTimeout(timer); doRestore(); refresh(); });
}

/* ---------------- Checklist (Chores, Work) ---------------- */
const REPEATS = ["", "daily", "weekly"];
const REPEAT_WORD = { "": "Once", daily: "Every day", weekly: "Every week" };

// Repeating chores come back on their own once their day or week has passed.
function resetRepeats() {
  const today = dayKey();
  let changed = false;
  for (const it of S.lists.chores) {
    if (!it.done || !it.repeat || !it.doneOn) continue;
    const gap = daysBetween(it.doneOn, today);
    if ((it.repeat === "daily" && gap >= 1) || (it.repeat === "weekly" && gap >= 7)) { it.done = false; changed = true; }
  }
  if (changed) save();
}

function checklist(el, key, opts = {}) {
  const items = S.lists[key];
  el.appendChild(addBox(opts.placeholder || "Add something…", (v) => {
    items.unshift({ id: uid(), text: v, done: false, repeat: "" });
    refresh();
  }));
  const open = items.filter((i) => !i.done);
  const done = items.filter((i) => i.done);
  const list = h(`<div class="list" style="margin-top:12px"></div>`);
  if (!open.length) list.appendChild(h(`<div class="empty">${done.length ? "All done. Lovely." : "Nothing here yet."}</div>`));
  open.forEach((it) => list.appendChild(itemRow(items, it, opts)));
  el.appendChild(list);
  if (done.length) {
    const openFold = !!S.ui["fold_" + key];
    const f = h(`<button class="fold">${openFold ? "▾" : "▸"} Done (${done.length})</button>`);
    f.addEventListener("click", () => { S.ui["fold_" + key] = !openFold; refresh(); });
    el.appendChild(f);
    if (openFold) {
      const dl = h(`<div class="list"></div>`);
      done.forEach((it) => dl.appendChild(itemRow(items, it, opts)));
      el.appendChild(dl);
    }
  }
  dragSort(list, items);
}

function itemRow(items, it, opts) {
  const row = h(`
    <div class="item ${it.done ? "done" : ""}" data-id="${it.id}" ${it.done ? "" : 'draggable="true"'}>
      ${it.done || opts.plain ? "" : '<span class="grip" title="Drag to move">⠿</span>'}
      <button class="check ${it.done ? "on" : ""}" aria-label="Done"></button>
      <div class="text">${esc(it.text)}</div>
      <div class="tools">
        ${opts.repeat ? `<button class="chip ${it.repeat ? "on" : ""}" data-repeat title="Click to change">${REPEAT_WORD[it.repeat || ""]}</button>` : ""}
        <button class="x" title="Remove">×</button>
      </div>
    </div>`);
  if (opts.repeat && it.repeat) $(".tools", row).style.opacity = "1";
  $(".check", row).addEventListener("click", () => {
    it.done = !it.done;
    it.doneOn = it.done ? dayKey() : null;
    $(".check", row).classList.toggle("on", it.done);
    setTimeout(refresh, 420); // let the tick bounce before the row moves
  });
  editable($(".text", row), it.text, (v) => { it.text = v; refresh(); });
  const rep = $("[data-repeat]", row);
  if (rep) rep.addEventListener("click", () => { it.repeat = REPEATS[(REPEATS.indexOf(it.repeat || "") + 1) % 3]; refresh(); });
  $(".x", row).addEventListener("click", () => {
    const i = items.indexOf(it);
    removeWithUndo(row, `"${it.text.slice(0, 40)}"`, () => items.splice(i, 1), () => items.splice(i, 0, it));
  });
  return row;
}

// Drag a row by its grip to put things in her own order.
function dragSort(list, items) {
  let dragEl = null;
  list.addEventListener("dragstart", (e) => {
    dragEl = e.target.closest(".item"); if (!dragEl) return;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "");
    requestAnimationFrame(() => dragEl && dragEl.classList.add("dragging"));
  });
  list.addEventListener("dragover", (e) => {
    if (!dragEl) return;
    e.preventDefault();
    const over = e.target.closest(".item");
    if (!over || over === dragEl) return;
    const r = over.getBoundingClientRect();
    list.insertBefore(dragEl, e.clientY > r.top + r.height / 2 ? over.nextSibling : over);
  });
  list.addEventListener("dragend", () => {
    if (!dragEl) return;
    dragEl.classList.remove("dragging"); dragEl = null;
    const order = [...list.querySelectorAll(".item")].map((n) => n.dataset.id);
    const byId = Object.fromEntries(items.map((i) => [i.id, i]));
    const rest = items.filter((i) => !order.includes(i.id));
    items.splice(0, items.length, ...order.map((id) => byId[id]), ...rest);
    save();
  });
}

/* ---------------- Meds ---------------- */
const TIMES = ["Morning", "Midday", "Evening", "Bedtime"];
function medsToday(k = dayKey()) {
  const log = S.medLog[k] || {};
  let total = 0, taken = 0;
  for (const m of S.meds) for (const t of m.times) { total++; if (log[m.id + "|" + t]) taken++; }
  return { total, taken };
}
function toggleDose(m, t, k = dayKey()) {
  const log = (S.medLog[k] = S.medLog[k] || {});
  const id = m.id + "|" + t;
  if (log[id]) delete log[id]; else log[id] = Date.now();
}
function doseButton(m, t) {
  const on = !!(S.medLog[dayKey()] || {})[m.id + "|" + t];
  const b = h(`<button data-key="dose-${m.id}-${t}" class="dose ${on ? "on" : ""}"><span class="check ${on ? "on" : ""}"></span>${esc(t)}</button>`);
  b.addEventListener("click", () => {
    toggleDose(m, t);
    b.classList.toggle("on"); $(".check", b).classList.toggle("on");
    save(); drawNav();
  });
  return b;
}

/* ---------------- Cycle ---------------- */
function cycleInfo() {
  const days = Object.keys(S.cycle.flow).filter((k) => S.cycle.flow[k]).sort();
  const starts = days.filter((k) => !S.cycle.flow[dayKey(addDays(parseDay(k), -1))]);
  // Period lengths: run of marked days from each start.
  const lens = starts.map((s) => { let n = 0, d = parseDay(s); while (S.cycle.flow[dayKey(d)]) { n++; d = addDays(d, 1); } return n; });
  const gaps = [];
  for (let i = 1; i < starts.length; i++) { const g = daysBetween(starts[i - 1], starts[i]); if (g >= 15 && g <= 60) gaps.push(g); }
  const recent = (a) => a.slice(-6);
  const avg = (a, d) => (a.length ? Math.round(recent(a).reduce((x, y) => x + y, 0) / recent(a).length) : d);
  const cycleLen = avg(gaps, 28), periodLen = avg(lens, 5);
  const last = starts[starts.length - 1] || null;
  const today = dayKey();
  let next = null, dayOf = null;
  if (last) {
    dayOf = daysBetween(last, today) + 1;
    let n = addDays(parseDay(last), cycleLen);
    while (dayKey(n) <= today && daysBetween(last, dayKey(n)) < 400 && !S.cycle.flow[today]) n = addDays(n, cycleLen);
    next = dayKey(n);
  }
  return { starts, cycleLen, periodLen, last, next, dayOf, learned: gaps.length };
}
function predicted(info) {
  const set = new Set();
  if (!info.next) return set;
  for (let c = 0; c < 3; c++) {
    const s = addDays(parseDay(info.next), c * info.cycleLen);
    for (let i = 0; i < info.periodLen; i++) set.add(dayKey(addDays(s, i)));
  }
  return set;
}

/* ---------------- Views ---------------- */
const VIEWS = {};

VIEWS.today = (el) => {
  const grid = h(`<div class="grid"></div>`);
  // Meds
  const meds = h(`<div class="card" style="--tone:var(--mint)"><h2><span class="nav-dot" style="background:var(--mint)"></span>Meds today</h2></div>`);
  if (!S.meds.length) meds.appendChild(emptyLink("No meds added yet.", "Add one", "meds"));
  else {
    const rows = h(`<div class="stack"></div>`);
    for (const m of S.meds) {
      const r = h(`<div><div style="font-weight:600;margin-bottom:6px">${esc(m.name)} <span class="muted small">${esc(m.dose || "")}</span></div><div class="dose-row"></div></div>`);
      m.times.forEach((t) => $(".dose-row", r).appendChild(doseButton(m, t)));
      rows.appendChild(r);
    }
    meds.appendChild(rows);
  }
  grid.appendChild(meds);

  // Cycle
  const info = cycleInfo();
  const cyc = h(`<div class="card" style="--tone:var(--peri)"><h2><span class="nav-dot" style="background:var(--peri)"></span>Cycle</h2></div>`);
  if (!info.last) cyc.appendChild(emptyLink("Mark your period on the calendar to start tracking.", "Open calendar", "cycle"));
  else {
    const onPeriod = !!S.cycle.flow[dayKey()];
    const until = daysBetween(dayKey(), info.next);
    cyc.appendChild(h(`<div>
      <div class="big-num">${onPeriod ? "On your period" : until <= 0 ? "Due today" : until === 1 ? "Tomorrow" : `${until} days`}</div>
      <div class="muted">${onPeriod ? `Day ${info.dayOf}` : `until your next period · ${fmtDay(info.next)}`}</div>
    </div>`));
  }
  grid.appendChild(cyc);

  // Chores + Work
  for (const [key, name, color] of [["chores", "Chores", "var(--peach)"], ["work", "Work", "var(--sky)"]]) {
    resetRepeats();
    const open = S.lists[key].filter((i) => !i.done);
    const c = h(`<div class="card" style="--tone:${color}"><h2><span class="nav-dot" style="background:${color}"></span>${name}</h2></div>`);
    if (!open.length) c.appendChild(emptyLink("Nothing to do.", "Add something", key));
    else {
      const l = h(`<div class="list"></div>`);
      open.slice(0, 5).forEach((it) => l.appendChild(itemRow(S.lists[key], it, { plain: true })));
      c.appendChild(l);
      if (open.length > 5) c.appendChild(emptyLink(`and ${open.length - 5} more`, "See all", key));
    }
    grid.appendChild(c);
  }

  // Journal
  const j = S.journal[dayKey()];
  const jc = h(`<div class="card" style="--tone:var(--blush)"><h2><span class="nav-dot" style="background:var(--blush)"></span>Journal</h2></div>`);
  jc.appendChild(j && j.text
    ? emptyLink(j.text.slice(0, 120) + (j.text.length > 120 ? "…" : ""), "Keep writing", "journal")
    : emptyLink("How are you today?", "Write", "journal"));
  grid.appendChild(jc);

  // Goals
  const gc = h(`<div class="card" style="--tone:var(--lilac)"><h2><span class="nav-dot" style="background:var(--lilac)"></span>Goals</h2></div>`);
  if (!S.goals.length) gc.appendChild(emptyLink("No goals yet.", "Set one", "goals"));
  else {
    const st = h(`<div class="stack"></div>`);
    S.goals.slice(0, 4).forEach((g) => {
      const p = goalPct(g);
      st.appendChild(h(`<div><div class="row" style="justify-content:space-between"><span>${esc(g.title)}</span><span class="muted small">${p}%</span></div><div class="bar"><div style="width:${p}%"></div></div></div>`));
    });
    gc.appendChild(st);
  }
  grid.appendChild(gc);
  el.appendChild(grid);
};

function emptyLink(text, btn, page) {
  const d = h(`<div class="row" style="justify-content:space-between"><span class="muted">${esc(text)}</span><button class="link">${esc(btn)} ›</button></div>`);
  $("button", d).addEventListener("click", () => go(page));
  return d;
}

VIEWS.meds = (el) => {
  // Add a med: name, dose, and when she takes it.
  const pick = new Set(["Morning"]);
  const add = h(`<div class="card stack">
      <div class="row">
        <input class="field" data-name placeholder="Medicine name" style="flex:2">
        <input class="field" data-dose placeholder="Dose (e.g. 50 mg)" style="flex:1">
      </div>
      <div class="row"><span class="muted">When:</span><span class="row" data-times></span><button class="btn" style="margin-left:auto">Add</button></div>
    </div>`);
  TIMES.forEach((t) => {
    const c = h(`<button data-key="time-${t}" class="chip ${pick.has(t) ? "on" : ""}">${t}</button>`);
    c.addEventListener("click", () => { pick.has(t) ? pick.delete(t) : pick.add(t); c.classList.toggle("on"); });
    $("[data-times]", add).appendChild(c);
  });
  const doAdd = () => {
    const name = $("[data-name]", add).value.trim();
    if (!name) { $("[data-name]", add).focus(); return; }
    S.meds.push({ id: uid(), name, dose: $("[data-dose]", add).value.trim(), times: TIMES.filter((t) => pick.has(t)).length ? TIMES.filter((t) => pick.has(t)) : ["Morning"] });
    refresh();
  };
  $(".btn", add).addEventListener("click", doAdd);
  add.querySelectorAll("input").forEach((i) => i.addEventListener("keydown", (e) => { if (e.key === "Enter") doAdd(); }));
  el.appendChild(add);

  const list = h(`<div class="stack" style="margin-top:18px"></div>`);
  if (!S.meds.length) list.appendChild(h(`<div class="empty">Add a medicine above and it will show here and on Today, with a tick for each time you take it.</div>`));
  for (const m of S.meds) {
    const card = h(`<div class="card med">
        <div class="med-head"><span class="med-name">${esc(m.name)}</span><span class="med-dose">${esc(m.dose || "add dose")}</span><button class="x" title="Remove">×</button></div>
        <div class="dose-row"></div>
        <div class="row"><span class="muted small">Last 7 days</span><div class="week"></div></div>
      </div>`);
    m.times.forEach((t) => $(".dose-row", card).appendChild(doseButton(m, t)));
    for (let i = 6; i >= 0; i--) {
      const k = dayKey(addDays(new Date(), -i));
      const log = S.medLog[k] || {};
      const n = m.times.filter((t) => log[m.id + "|" + t]).length;
      $(".week", card).appendChild(h(`<span class="${n === m.times.length ? "full" : n ? "part" : ""}" title="${fmtDay(k)}">${parseDay(k).toLocaleDateString(undefined, { weekday: "narrow" })}</span>`));
    }
    editable($(".med-name", card), m.name, (v) => { m.name = v; refresh(); }, false);
    editable($(".med-dose", card), m.dose || "", (v) => { m.dose = v; refresh(); }, false);
    $(".x", card).addEventListener("click", () => {
      const i = S.meds.indexOf(m);
      removeWithUndo(card, m.name, () => S.meds.splice(i, 1), () => S.meds.splice(i, 0, m));
    });
    list.appendChild(card);
  }
  el.appendChild(list);
};

VIEWS.cycle = (el) => {
  const info = cycleInfo();
  const guess = predicted(info);
  const shown = S.ui.calMonth ? parseDay(S.ui.calMonth) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const wrap = h(`<div class="split cycle-split"></div>`);

  const cal = h(`<div class="card">
      <div class="cal-head"><button class="link" data-prev>‹</button><h2>${shown.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h2><button class="link" data-next>›</button></div>
      <div class="cal"></div>
      <div class="legend"><span><i style="background:var(--peri-light)"></i>Light</span><span><i style="background:var(--peri)"></i>Medium</span><span><i style="background:var(--peri-deep)"></i>Heavy</span><span><i style="border:1.5px dashed var(--peri-line)"></i>Expected</span></div>
      <div class="muted small" style="margin-top:8px">Click a day to mark it. Click again for heavier; a fourth click clears it.</div>
    </div>`);
  const grid = $(".cal", cal);
  const monday = (d) => (d.getDay() + 6) % 7;
  ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach((d) => grid.appendChild(h(`<div class="dow">${d}</div>`)));
  let d = addDays(shown, -monday(shown));
  const today = dayKey();
  for (let i = 0; i < 42; i++) {
    const k = dayKey(d);
    const f = S.cycle.flow[k] || 0;
    const cell = h(`<button data-key="day-${k}" class="day ${d.getMonth() !== shown.getMonth() ? "out" : ""} ${k === today ? "today" : ""} ${f ? "f" + f : ""} ${!f && guess.has(k) ? "guess" : ""}">${d.getDate()}</button>`);
    cell.addEventListener("click", () => {
      const v = ((S.cycle.flow[k] || 0) + 1) % 4;
      if (v) S.cycle.flow[k] = v; else delete S.cycle.flow[k];
      refresh();
    });
    grid.appendChild(cell);
    d = addDays(d, 1);
    if (i === 34 && d.getMonth() !== shown.getMonth()) break;
  }
  const move = (n) => { S.ui.calMonth = dayKey(new Date(shown.getFullYear(), shown.getMonth() + n, 1)); refresh(); };
  $("[data-prev]", cal).addEventListener("click", () => move(-1));
  $("[data-next]", cal).addEventListener("click", () => move(1));
  wrap.appendChild(cal);

  const side = h(`<div class="stack"></div>`);
  if (info.last) {
    const onPeriod = !!S.cycle.flow[today];
    const until = daysBetween(today, info.next);
    side.appendChild(h(`<div class="card"><div class="muted small">${onPeriod ? "Period" : "Next period"}</div><div class="big-num">${onPeriod ? "Day " + (daysBetween(info.starts.filter((s) => s <= today).pop(), today) + 1) : until <= 0 ? "Today" : until + (until === 1 ? " day" : " days")}</div><div class="muted">${onPeriod ? "" : fmtDay(info.next)}</div></div>`));
    side.appendChild(h(`<div class="card"><div class="muted small">Cycle day</div><div class="big-num">${info.dayOf}</div></div>`));
    side.appendChild(h(`<div class="card"><div class="muted small">Usual cycle</div><div class="big-num">${info.cycleLen} days</div><div class="muted small">${info.learned ? `from your last ${Math.min(info.learned, 6)} cycle${info.learned > 1 ? "s" : ""}` : "a guess until two periods are marked"}</div><div class="muted small" style="margin-top:6px">Period usually ${info.periodLen} days</div></div>`));
  } else {
    side.appendChild(h(`<div class="card muted">Mark the days of your last period and ShlimpNote will work out when the next one is due. It gets better the more you mark.</div>`));
  }
  wrap.appendChild(side);
  el.appendChild(wrap);
};

VIEWS.notes = (el) => {
  const q = S.ui.noteSearch || "";
  const wrap = h(`<div class="split"></div>`);
  const side = h(`<div class="stack">
      <div class="row"><button class="btn" data-new style="flex:1">New note</button></div>
      <input class="field" data-q placeholder="Search notes" value="${esc(q)}">
      <div class="side-list"></div>
    </div>`);
  const listEl = $(".side-list", side);
  const drawList = () => {
    const needle = ($("[data-q]", side).value || "").toLowerCase();
    const notes = [...S.notes].sort((a, b) => (b.pinned - a.pinned) || (b.updated - a.updated))
      .filter((n) => !needle || (n.title + " " + n.body).toLowerCase().includes(needle));
    listEl.innerHTML = "";
    if (!notes.length) listEl.appendChild(h(`<div class="empty">${S.notes.length ? "No notes match." : "No notes yet."}</div>`));
    notes.forEach((n) => {
      const r = h(`<button data-key="note-${n.id}" class="side-row ${n.id === S.ui.note ? "on" : ""}"><b>${n.pinned ? "📌 " : ""}${esc(n.title || "Untitled")}</b><span>${esc(n.body.split("\n")[0] || fmtTime(n.updated))}</span></button>`);
      r.addEventListener("click", () => { S.ui.note = n.id; refresh(); });
      listEl.appendChild(r);
    });
  };
  $("[data-q]", side).addEventListener("input", (e) => { S.ui.noteSearch = e.target.value; save(); drawList(); });
  $("[data-new]", side).addEventListener("click", () => {
    const n = { id: uid(), title: "", body: "", updated: Date.now(), pinned: false };
    S.notes.push(n); S.ui.note = n.id; refresh();
    setTimeout(() => $(".title-in") && $(".title-in").focus(), 0);
  });
  drawList();
  wrap.appendChild(side);

  const note = S.notes.find((n) => n.id === S.ui.note) || null;
  const ed = h(`<div class="card editor"></div>`);
  if (!note) ed.appendChild(h(`<div class="empty">Pick a note, or press New note.</div>`));
  else {
    ed.appendChild(h(`<div class="row" style="justify-content:space-between">
        <span class="saved">Saved</span>
        <span class="row"><button class="link" data-pin>${note.pinned ? "Unpin" : "Pin to top"}</button><button class="x" data-del title="Remove">×</button></span>
      </div>`));
    const title = h(`<input class="title-in" placeholder="Title">`); title.value = note.title;
    const body = h(`<textarea class="body-in" placeholder="Write anything…"></textarea>`); body.value = note.body;
    ed.appendChild(title); ed.appendChild(body);
    const changed = () => {
      note.title = title.value; note.body = body.value; note.updated = Date.now();
      save(); $(".saved", ed).textContent = "Saved"; drawList(); drawNav();
    };
    title.addEventListener("input", changed);
    title.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); body.focus(); } });
    body.addEventListener("input", changed);
    $("[data-pin]", ed).addEventListener("click", () => { note.pinned = !note.pinned; refresh(); });
    $("[data-del]", ed).addEventListener("click", () => {
      const i = S.notes.indexOf(note);
      S.ui.note = null;
      removeWithUndo(ed, `"${note.title || "Untitled"}"`, () => S.notes.splice(i, 1), () => { S.notes.splice(i, 0, note); S.ui.note = note.id; });
      drawList();
    });
  }
  wrap.appendChild(ed);
  el.appendChild(wrap);
};

VIEWS.chores = (el) => {
  resetRepeats();
  const c = h(`<div class="card"></div>`);
  checklist(c, "chores", { placeholder: "Add a chore…", repeat: true });
  el.appendChild(c);
  el.appendChild(h(`<div class="muted small" style="margin-top:10px">Hover a chore and click “Once” to make it come back every day or every week.</div>`));
};

VIEWS.work = (el) => {
  const c = h(`<div class="card"></div>`);
  checklist(c, "work", { placeholder: "Add a work task…" });
  el.appendChild(c);
};

function goalPct(g) { return g.steps.length ? Math.round((100 * g.steps.filter((s) => s.done).length) / g.steps.length) : 0; }

VIEWS.goals = (el) => {
  el.appendChild(addBox("A new goal…", (v) => { S.goals.unshift({ id: uid(), title: v, steps: [] }); refresh(); }, "Add goal"));
  const st = h(`<div class="stack" style="margin-top:18px"></div>`);
  if (!S.goals.length) st.appendChild(h(`<div class="empty">Add a goal, then break it into small steps. The bar fills as you tick them off.</div>`));
  for (const g of S.goals) {
    const p = goalPct(g);
    const card = h(`<div class="card stack">
        <div class="row"><span class="goal-title">${esc(g.title)}</span><span class="muted">${p}%</span><button class="x" title="Remove">×</button></div>
        <div class="bar"><div style="width:${p}%"></div></div>
        <div class="list"></div>
      </div>`);
    editable($(".goal-title", card), g.title, (v) => { g.title = v; refresh(); }, false);
    $(".x", card).addEventListener("click", () => {
      const i = S.goals.indexOf(g);
      removeWithUndo(card, `"${g.title}"`, () => S.goals.splice(i, 1), () => S.goals.splice(i, 0, g));
    });
    const l = $(".list", card);
    g.steps.forEach((s) => l.appendChild(itemRow(g.steps, s, {})));
    dragSort(l, g.steps);
    card.appendChild(addBox("Add a step…", (v) => { g.steps.push({ id: uid(), text: v, done: false }); refresh(); }, "Add", "step-" + g.id));
    st.appendChild(card);
  }
  el.appendChild(st);
};

const MOODS = [
  ["Great", "var(--mint)"], ["Good", "var(--sky)"], ["Okay", "var(--butter)"], ["Low", "var(--peach)"], ["Rough", "var(--rose)"],
];
VIEWS.journal = (el) => {
  const today = dayKey();
  const k = S.ui.jday || today;
  const wrap = h(`<div class="split"></div>`);
  const side = h(`<div class="side-list"></div>`);
  const keys = Object.keys(S.journal).filter((d) => (S.journal[d].text || "").trim() || S.journal[d].mood);
  if (!keys.includes(today)) keys.push(today);
  keys.sort().reverse().forEach((d) => {
    const e = S.journal[d] || {};
    const mood = MOODS.find((m) => m[0] === e.mood);
    const r = h(`<button data-key="jday-${d}" class="side-row ${d === k ? "on" : ""}"><b>${mood ? `<i style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${mood[1]};margin-right:6px"></i>` : ""}${d === today ? "Today" : fmtDay(d)}</b><span>${esc((e.text || "").split("\n")[0] || "Nothing written yet")}</span></button>`);
    r.addEventListener("click", () => { S.ui.jday = d; refresh(); });
    side.appendChild(r);
  });
  wrap.appendChild(side);

  const entry = S.journal[k] || { text: "", mood: "" };
  const ed = h(`<div class="card editor">
      <div class="row" style="justify-content:space-between"><b style="font-size:1.2rem">${fmtDay(k, { weekday: "long", day: "numeric", month: "long" })}</b><span class="saved"></span></div>
      <div class="moods"></div>
      <textarea class="body-in" placeholder="How was your day?"></textarea>
    </div>`);
  MOODS.forEach(([name, color]) => {
    const b = h(`<button data-key="mood-${name}" class="chip mood ${entry.mood === name ? "on" : ""}"><i style="background:${color}"></i>${name}</button>`);
    b.addEventListener("click", () => {
      entry.mood = entry.mood === name ? "" : name;
      S.journal[k] = entry;
      ed.querySelectorAll(".mood").forEach((x) => x.classList.toggle("on", x === b && !!entry.mood));
      save();
    });
    $(".moods", ed).appendChild(b);
  });
  const body = $(".body-in", ed);
  body.value = entry.text;
  body.addEventListener("input", () => { entry.text = body.value; S.journal[k] = entry; save(); $(".saved", ed).textContent = "Saved"; });
  wrap.appendChild(ed);
  el.appendChild(wrap);
  setTimeout(() => { if (k === today && !entry.text) body.focus(); }, 0);
};

/* ---------------- Ask for a change ----------------
   Her requests become issues in a private GitHub repo that only he (and Claude) can see.
   The repo and key come from config.js. Until a key is there, requests wait here and
   go out by themselves the next time the app is opened with one. */
const CFG = window.SHLIMP_CONFIG || {};
const reqKey = () => (CFG.key ? atob(CFG.key).split("").reverse().join("") : "");

async function sendRequests() {
  if (!CFG.repo || !reqKey() || !navigator.onLine) return;
  let changed = false;
  for (const r of S.requests.filter((r) => r.status === "waiting")) {
    try {
      const res = await fetch(`https://api.github.com/repos/${CFG.repo}/issues`, {
        method: "POST",
        headers: { Authorization: "Bearer " + reqKey(), Accept: "application/vnd.github+json" },
        body: JSON.stringify({
          title: r.text.replace(/\s+/g, " ").slice(0, 70) + (r.text.length > 70 ? "…" : ""),
          body: r.text + "\n\n— sent from ShlimpNote, " + new Date(r.at).toLocaleString(),
          labels: ["from-shlimpnote"],
        }),
      });
      if (res.ok) { const j = await res.json(); r.status = "sent"; r.issue = j.number; changed = true; }
    } catch (e) { break; }
  }
  // Has he finished any? A closed issue means done.
  for (const r of S.requests.filter((r) => r.status === "sent" && r.issue)) {
    try {
      const res = await fetch(`https://api.github.com/repos/${CFG.repo}/issues/${r.issue}`, { headers: { Authorization: "Bearer " + reqKey(), Accept: "application/vnd.github+json" } });
      if (res.ok) { const j = await res.json(); if (j.state === "closed") { r.status = "done"; changed = true; } }
    } catch (e) { break; }
  }
  if (changed) { save(); if (current === "ask") refresh(); }
}

VIEWS.ask = (el) => {
  const card = h(`<div class="card stack">
      <div>Something not working, or something you'd like ShlimpNote to do? Write it here and it goes straight to the person who makes it.</div>
      <textarea class="grow" rows="3" placeholder="e.g. Could the meds page remind me in the evening?"></textarea>
      <div class="row"><button class="btn">Send</button><span class="muted small" data-msg></span></div>
    </div>`);
  const t = $("textarea", card);
  $(".btn", card).addEventListener("click", () => {
    const v = t.value.trim();
    if (!v) { t.focus(); return; }
    S.requests.unshift({ id: uid(), text: v, at: Date.now(), status: "waiting" });
    refresh();
    sendRequests();
    const m = $("[data-msg]"); if (m) m.textContent = "Thank you — it's on its way.";
  });
  el.appendChild(card);

  if (S.requests.length) {
    const words = { waiting: "Waiting to send", sent: "Sent", done: "Done" };
    const past = h(`<div class="card" style="margin-top:18px"><h2>Your requests</h2><div></div></div>`);
    S.requests.forEach((r) => past.lastElementChild.appendChild(h(`<div class="req"><div><span class="tag ${r.status}">${words[r.status]}</span> <span class="muted small">${fmtTime(r.at)}</span></div><div style="white-space:pre-wrap">${esc(r.text)}</div></div>`)));
    el.appendChild(past);
  }
};

function demoData() {
  const d = blank(), k = (n) => dayKey(addDays(new Date(), n));
  d.meds = [{ id: "m1", name: "Vitamin D", dose: "1000 IU", times: ["Morning"] }, { id: "m2", name: "Sertraline", dose: "50 mg", times: ["Morning", "Evening"] }];
  d.medLog[k(0)] = { "m1|Morning": 1 };
  for (let i = 1; i < 6; i++) d.medLog[k(-i)] = { "m1|Morning": 1, "m2|Morning": 1, ...(i % 2 ? { "m2|Evening": 1 } : {}) };
  for (const s of [-60, -31, -3]) for (let i = 0; i < 5; i++) d.cycle.flow[k(s + i)] = i < 2 ? 3 - i : 1;
  d.lists.chores = [{ id: "c1", text: "Water the plants", repeat: "weekly" }, { id: "c2", text: "Laundry" }, { id: "c3", text: "Wipe the counters", repeat: "daily" }, { id: "c4", text: "Take the bins out", done: true, doneOn: k(0) }];
  d.lists.work = [{ id: "w1", text: "Reply to Sam about Thursday" }, { id: "w2", text: "Finish the monthly report\nCharts on page 3 still need labels" }];
  d.goals = [{ id: "g1", title: "Read 12 books this year", steps: [{ id: "s1", text: "Pick the first three", done: true }, { id: "s2", text: "Finish book one", done: true }, { id: "s3", text: "Join the library" }] }];
  d.notes = [{ id: "n1", title: "Gift ideas", body: "Candle from that shop on 5th\nThe blue scarf", updated: Date.now() - 4e6, pinned: true }, { id: "n2", title: "Recipes to try", body: "Lemon orzo\nMiso soup", updated: Date.now() - 9e7 }];
  d.ui.note = "n1";
  d.journal[k(-1)] = { text: "Quiet day. Went for a long walk.", mood: "Good" };
  return d;
}

/* ---------------- Start ---------------- */
document.addEventListener("click", (e) => { const b = e.target.closest("[data-go]"); if (b) go(b.dataset.go); });
resetRepeats();
drawNav();
render();
sendRequests();
window.addEventListener("online", sendRequests);
// Coming back to the app on a new day: refresh Today so ticks and chores are for the right day.
let lastDay = dayKey();
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && dayKey() !== lastDay) { lastDay = dayKey(); resetRepeats(); refresh(); }
});

// Keep the app up to date: the service worker always fetches the newest version from GitHub when online.
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

/* ---------------- Squish ----------------
   His ask (2026-11-10): clicking squeezes things, they bounce and jiggle, and clicking
   again never restarts the animation — every click just adds a push to a spring that is
   already moving, so repeated clicks blend smoothly. Soft rings ripple out from the click
   and give nearby things a little wobble as the ripple passes them. */
const Squish = (() => {
  const SEL = "button, .card, .item, .dose, .day, .brand img, .side-row, .bar";
  const NEAR = ".card, .item, .dose, .day, .nav-item, .chip, .check, .side-row, .btn, .link, .ask, .brand img";
  const springs = new Map(); // element -> its spring
  let raf = 0, last = 0;
  const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  // A way to find "the same" element again after a page redraw replaces it.
  function keyOf(el) {
    for (const a of ["id", "go", "key"]) if (el.dataset && el.dataset[a]) return `[data-${a}="${CSS.escape(el.dataset[a])}"]`;
    const anc = el.parentElement && el.parentElement.closest("[data-id],[data-go],[data-key]");
    return anc && el.classList[0] ? `${keyOf(anc)} .${el.classList[0]}` : null;
  }
  function spring(el) {
    let s = springs.get(el);
    if (!s) {
      const r = el.getBoundingClientRect();
      // Small things squish a lot, big cards just a little.
      const amp = Math.max(0.2, Math.min(1, 70 / Math.sqrt(Math.max(1, r.width * r.height))));
      s = { u: 1, uv: 0, ut: 1, j: 0, jv: 0, amp, key: keyOf(el), held: false };
      springs.set(el, s);
      el.classList.add("sq");
    }
    return s;
  }
  function run() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); } }
  function step(t) {
    const dt = Math.min(0.033, (t - last) / 1000); last = t;
    for (let [el, s] of [...springs]) {
      if (!el.isConnected) {               // redrawn: carry the wobble over to the new copy
        springs.delete(el);
        const n = s.key && document.querySelector(s.key);
        if (!n || springs.has(n)) continue;
        el = n; springs.set(n, s); n.classList.add("sq");
      }
      s.uv += (-420 * (s.u - s.ut) - 19 * s.uv) * dt; s.u += s.uv * dt;   // squeeze
      s.jv += (-300 * s.j - 8 * s.jv) * dt; s.j += s.jv * dt;              // jelly wobble
      s.j = Math.max(-1.3, Math.min(1.3, s.j));
      const w = 0.11 * s.j;
      el.style.transform = `scale(${(s.u * (1 + w)).toFixed(4)}, ${(s.u * (1 - w)).toFixed(4)})`;
      if (!s.held && Math.abs(s.u - 1) < 4e-4 && Math.abs(s.uv) < 4e-3 && Math.abs(s.j) < 1e-3 && Math.abs(s.jv) < 1e-2) {
        el.style.transform = ""; springs.delete(el);
      }
    }
    raf = springs.size ? requestAnimationFrame(step) : 0;
  }
  function push(el, power, hold) {
    const s = spring(el);
    s.jv = Math.max(-30, Math.min(30, s.jv + 9 * power * s.amp));
    if (hold) { s.held = true; s.ut = 1 - 0.1 * s.amp; } else s.uv -= 1.2 * power * s.amp;
    run();
  }
  function ringColour(el) {
    if (el.closest(".day")) return "rgba(156, 163, 234, .55)";
    if (el.closest(".dose")) return "rgba(124, 197, 162, .55)";
    const nav = el.closest(".nav-item"); if (nav) return getComputedStyle($(".nav-dot", nav)).backgroundColor;
    return "rgba(184, 156, 224, .55)";
  }
  function ripple(x, y, size, colour) {
    [[0, ""], [110, ""], [0, "fill"]].forEach(([delay, kind], i) => {
      const r = document.createElement("div");
      r.className = "ripple " + kind;
      const d = size + i * 70;
      r.style.cssText = `left:${x}px;top:${y}px;width:${d}px;height:${d}px;--ring:${colour};animation-delay:${delay}ms`;
      if (delay) r.style.opacity = "0", r.style.animationFillMode = "both";
      r.addEventListener("animationend", () => r.remove());
      document.body.appendChild(r);
    });
  }
  document.addEventListener("pointerdown", (e) => {
    if (calm() || e.button > 0) return;
    if (e.target.closest("input, textarea, .ripple")) return;
    const hit = e.target.closest(SEL) || e.target.closest(".nav-item, .ask");
    if (!hit) return;
    // The thing pressed squeezes; the things it sits inside wobble a little.
    const chain = [];
    for (let n = hit; n && chain.length < 3; n = n.parentElement && n.parentElement.closest(SEL)) chain.push(n);
    chain.forEach((n, i) => push(n, [1, 0.45, 0.2][i], i === 0));
    const r = hit.getBoundingClientRect();
    const size = Math.min(420, Math.max(r.width, r.height) + 110);
    ripple(e.clientX, e.clientY, size, ringColour(hit));
    // The ripple nudges what's around it as it passes.
    const R = size * 0.75 + 60;
    for (const n of document.querySelectorAll(NEAR)) {
      if (chain.includes(n) || n.contains(hit)) continue;
      const b = n.getBoundingClientRect();
      if (b.bottom < 0 || b.top > innerHeight || !b.width) continue;
      const dx = Math.max(b.left - e.clientX, 0, e.clientX - b.right), dy = Math.max(b.top - e.clientY, 0, e.clientY - b.bottom);
      const d = Math.hypot(dx, dy);
      if (d < R) setTimeout(() => n.isConnected && push(n, 0.5 * (1 - d / R), false), d * 1.7);
    }
  }, { passive: true });
  const release = () => {
    for (const s of springs.values()) if (s.held) { s.held = false; s.ut = 1; s.jv -= 6 * s.amp; }
    run();
  };
  document.addEventListener("pointerup", release);
  document.addEventListener("pointercancel", release);
  window.addEventListener("blur", release);
  return { push };
})();
