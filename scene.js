/* ShlimpNote's jungle (her ask, 2026-11-10): a canopy of big leaves and vines along the
   top, a jungle floor with glowing mushrooms along the bottom, and fluffy creatures.
   Drawn as SVG. The fur is made by a filter (#fur) that roughens each animal's outline
   and streaks it with strands; gradients give everything round, 3D shading.
   Nothing here can be clicked. The moving parts are animated in style.css. */
"use strict";
(() => {
  /* ---------- shared paint: gradients and filters ---------- */
  const fur = (id, a, b, c) => `
    <radialGradient id="${id}" cx=".36" cy=".3" r=".85">
      <stop offset="0" stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/>
    </radialGradient>`;
  const DEFS = `
    <defs>
      <filter id="fur" x="-25%" y="-25%" width="150%" height="150%">
        <feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="3" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" result="fuzzy"/>
        <feTurbulence type="fractalNoise" baseFrequency=".9 .16" numOctaves="2" seed="9" result="s"/>
        <feColorMatrix in="s" type="matrix" values="0 0 0 0 .25  0 0 0 0 .15  0 0 0 0 .3  0 0 0 -1.5 .8" result="strands"/>
        <feComposite in="strands" in2="fuzzy" operator="in" result="dark"/>
        <feTurbulence type="fractalNoise" baseFrequency="1 .18" numOctaves="1" seed="21" result="s2"/>
        <feColorMatrix in="s2" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -1.8 .95" result="shine"/>
        <feComposite in="shine" in2="fuzzy" operator="in" result="light"/>
        <feMerge><feMergeNode in="fuzzy"/><feMergeNode in="dark"/><feMergeNode in="light"/></feMerge>
      </filter>
      <filter id="moss" x="-10%" y="-40%" width="120%" height="180%">
        <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <filter id="soft"><feGaussianBlur stdDeviation="4"/></filter>
      <filter id="haze"><feGaussianBlur stdDeviation="2.5"/></filter>
      <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="lift" x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#2c4a3c" flood-opacity=".28"/>
      </filter>
      <radialGradient id="eye" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#5a4a78"/><stop offset=".6" stop-color="#2a2038"/><stop offset="1" stop-color="#150f1e"/></radialGradient>
      <radialGradient id="amber" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#ffd27a"/><stop offset="1" stop-color="#d98a2b"/></radialGradient>
      ${fur("f-peach", "#fff0de", "#f3c49b", "#c98a62")}
      ${fur("f-cream", "#fffaf2", "#f6e4cf", "#d7b99a")}
      ${fur("f-lav", "#f5ecff", "#d6c0f2", "#9f86cc")}
      ${fur("f-bunny", "#fff7fa", "#f4d2e2", "#cf9ab6")}
      ${fur("f-panda", "#ffd0a3", "#f0975d", "#b65f33")}
      ${fur("f-dark", "#8b6a5c", "#5e4038", "#3a2622")}
      ${fur("f-grey", "#f3f0f7", "#c9c0d6", "#8b7fa0")}
      ${fur("f-sloth", "#e9d9c2", "#c3a586", "#86684f")}
      ${fur("f-bird", "#fff6c9", "#f7d36f", "#d29a37")}
      ${fur("f-mint", "#e8fff4", "#a9e3c8", "#62b08f")}
      ${fur("f-white", "#ffffff", "#f1ecf7", "#cfc6dc")}
      ${fur("cap-teal", "#c4fff6", "#62cfc2", "#2d8f86")}
      ${fur("cap-pink", "#ffe0ef", "#f39cc4", "#b75a8c")}
      ${fur("cap-lav", "#efe4ff", "#b89cf0", "#7556c0")}
      ${fur("cap-peach", "#fff0e2", "#f7b07f", "#c66f45")}
      <linearGradient id="stem" x1="0" x2="1"><stop offset="0" stop-color="#d9c6b2"/><stop offset=".35" stop-color="#fff6ea"/><stop offset="1" stop-color="#b9a088"/></linearGradient>
      <linearGradient id="leaf1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9be3b9"/><stop offset=".5" stop-color="#5fbf8c"/><stop offset="1" stop-color="#2f8a66"/></linearGradient>
      <linearGradient id="leaf2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b5ecc9"/><stop offset=".55" stop-color="#78cfa0"/><stop offset="1" stop-color="#3f9d78"/></linearGradient>
      <linearGradient id="leaf3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a6e6d6"/><stop offset=".5" stop-color="#5bb8a6"/><stop offset="1" stop-color="#2d7f76"/></linearGradient>
      <linearGradient id="bark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b08a73"/><stop offset=".4" stop-color="#8a6656"/><stop offset="1" stop-color="#5a4038"/></linearGradient>
      <linearGradient id="vine" x1="0" x2="1"><stop offset="0" stop-color="#3f8f6a"/><stop offset=".5" stop-color="#8fd6ad"/><stop offset="1" stop-color="#2f7a5a"/></linearGradient>
      <radialGradient id="ground" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#8fd3ad"/><stop offset="1" stop-color="#4f9f80"/></radialGradient>
    </defs>`;

  /* ---------- little helpers ---------- */
  const eye = (x, y, r, iris = "url(#eye)") => `
    <circle cx="${x}" cy="${y}" r="${r}" fill="${iris}"/>
    ${iris !== "url(#eye)" ? `<circle cx="${x}" cy="${y}" r="${r * 0.55}" fill="#1d1628"/>` : ""}
    <circle cx="${x - r * 0.3}" cy="${y - r * 0.35}" r="${r * 0.36}" fill="#fff"/>
    <circle cx="${x + r * 0.35}" cy="${y + r * 0.3}" r="${r * 0.15}" fill="#fff" opacity=".85"/>`;
  const shadow = (x, rx, y = 2) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${rx * 0.22}" fill="#244234" opacity=".3" filter="url(#soft)"/>`;
  const blush = (x, y, s = 1) => `<ellipse cx="${x}" cy="${y}" rx="${4 * s}" ry="${2.3 * s}" fill="#f59bbb" opacity=".75"/>`;
  const at = (x, y, s, inner, cls = "", flip = false) =>
    `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})"><g class="${cls}">${inner}</g></g>`;

  /* ---------- creatures (each drawn with its feet at 0,0) ---------- */
  // Weasel: long fluffy body, tiny legs, big eyes, very long tail. Faces left.
  const weasel = (g = "f-peach", belly = "f-cream", walking = false) => `
    ${shadow(4, 46)}
    <g filter="url(#fur)">
      <path class="tail" d="M26 -16 C58 -10 82 -30 78 -58 C75 -76 54 -80 50 -64 C47 -52 62 -46 58 -34 C54 -24 40 -22 24 -24 Z" fill="url(#${g})"/>
    </g>
    ${[-22, -11, 14, 25].map((x, i) => `<g filter="url(#fur)"><rect class="${walking ? "leg " + (i % 3 ? "b" : "a") : ""}" x="${x}" y="-9" width="9" height="11" rx="4.5" fill="url(#${g})"/></g>`).join("")}
    <g class="${walking ? "bob" : ""}">
      <g filter="url(#fur)">
        <ellipse cx="2" cy="-18" rx="38" ry="16" fill="url(#${g})"/>
        <ellipse cx="-2" cy="-10" rx="25" ry="7" fill="url(#${belly})"/>
        <circle cx="-38" cy="-44" r="6.5" fill="url(#${g})"/><circle cx="-21" cy="-45" r="6.5" fill="url(#${g})"/>
        <circle cx="-30" cy="-30" r="18" fill="url(#${g})"/>
        <ellipse cx="-39" cy="-23" rx="10" ry="7" fill="url(#${belly})"/>
      </g>
      <circle cx="-38" cy="-44" r="3" fill="#f6a9c4"/><circle cx="-21" cy="-45" r="3" fill="#f6a9c4"/>
      <ellipse cx="-48" cy="-25" rx="3.2" ry="2.4" fill="#5a3a4a"/><ellipse cx="-49" cy="-26" rx="1.1" ry=".7" fill="#fff" opacity=".7"/>
      <g class="blink">${eye(-37, -33, 5.6)}${eye(-23, -33, 5.6)}</g>
      ${blush(-27, -23)}
    </g>`;

  // Bunny: a round puffball with long ears and a cotton tail. Faces right.
  const bunny = () => `
    ${shadow(0, 34)}
    <g class="hop">
      <g filter="url(#fur)">
        <circle cx="-28" cy="-22" r="10" fill="url(#f-white)"/>
        <ellipse cx="-2" cy="-24" rx="30" ry="25" fill="url(#f-bunny)"/>
        <ellipse class="ear l" cx="6" cy="-78" rx="7.5" ry="22" fill="url(#f-bunny)" transform="rotate(-14 6 -60)"/>
        <ellipse class="ear r" cx="22" cy="-76" rx="7.5" ry="22" fill="url(#f-bunny)" transform="rotate(16 22 -58)"/>
        <circle cx="14" cy="-46" r="20" fill="url(#f-bunny)"/>
        <ellipse cx="-8" cy="-3" rx="10" ry="5" fill="url(#f-white)"/><ellipse cx="14" cy="-3" rx="10" ry="5" fill="url(#f-white)"/>
      </g>
      <ellipse cx="6" cy="-78" rx="3.2" ry="15" fill="#f7a9c6" opacity=".8" transform="rotate(-14 6 -60)"/>
      <ellipse cx="22" cy="-76" rx="3.2" ry="15" fill="#f7a9c6" opacity=".8" transform="rotate(16 22 -58)"/>
      <g class="blink">${eye(8, -48, 5.4)}${eye(23, -48, 5.4)}</g>
      <path d="M14 -40 l-2.4 -2.6 h4.8 Z" fill="#e57fa4"/>
      <path d="M11 -37 Q14 -34.5 17 -37" stroke="#7b5068" stroke-width="1.3" fill="none" stroke-linecap="round"/>
      ${blush(3, -39)}${blush(28, -39)}
    </g>`;

  // Red panda: sits up, white face mask, long ringed tail curling round.
  const panda = () => `
    ${shadow(4, 38)}
    <g filter="url(#fur)">
      <path class="tail" d="M14 -10 C46 -6 62 -26 56 -50 C52 -64 40 -66 34 -60" stroke="url(#f-panda)" stroke-width="17" fill="none" stroke-linecap="round"/>
    </g>
    <path class="tail" d="M14 -10 C46 -6 62 -26 56 -50 C52 -64 40 -66 34 -60" stroke="#9a4f2c" stroke-width="13" fill="none" stroke-dasharray="7 12" opacity=".4" stroke-linecap="round"/>
    <g filter="url(#fur)">
      <ellipse cx="0" cy="-26" rx="24" ry="27" fill="url(#f-panda)"/>
      <ellipse cx="0" cy="-20" rx="15" ry="18" fill="url(#f-dark)"/>
      <ellipse cx="-12" cy="-3" rx="8" ry="5" fill="url(#f-dark)"/><ellipse cx="12" cy="-3" rx="8" ry="5" fill="url(#f-dark)"/>
      <path d="M-24 -78 L-10 -74 L-20 -62 Z" fill="url(#f-panda)" stroke="#fff6ee" stroke-width="3" stroke-linejoin="round"/>
      <path d="M24 -78 L10 -74 L20 -62 Z" fill="url(#f-panda)" stroke="#fff6ee" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="0" cy="-60" r="22" fill="url(#f-panda)"/>
      <ellipse cx="-10" cy="-63" rx="7" ry="6" fill="url(#f-white)"/><ellipse cx="10" cy="-63" rx="7" ry="6" fill="url(#f-white)"/>
      <ellipse cx="0" cy="-50" rx="11" ry="8" fill="url(#f-white)"/>
    </g>
    <g class="blink">${eye(-9, -59, 5.2)}${eye(9, -59, 5.2)}</g>
    <ellipse cx="0" cy="-53" rx="3" ry="2.2" fill="#3a2830"/>
    <path d="M-3 -48 Q0 -45.5 3 -48" stroke="#5a3a3a" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    ${blush(-15, -50)}${blush(15, -50)}`;

  // Round little bird: a fluffy ball with a head tuft and tiny wings.
  const bird = () => `
    ${shadow(0, 20, 1)}
    <g class="bobble">
      <g filter="url(#fur)">
        <path d="M-2 -46 C-6 -56 2 -60 4 -52 C6 -60 14 -56 8 -46 Z" fill="url(#f-bird)"/>
        <circle cx="0" cy="-22" r="22" fill="url(#f-bird)"/>
        <ellipse class="wing" cx="-17" cy="-20" rx="8" ry="12" fill="url(#f-peach)" transform="rotate(20 -17 -20)"/>
        <ellipse cx="2" cy="-12" rx="13" ry="9" fill="url(#f-cream)"/>
      </g>
      <g class="blink">${eye(-6, -27, 4.6)}${eye(8, -27, 4.6)}</g>
      <path d="M0 -22 L5 -19.5 L0 -17 Z" fill="#f29b4f"/>
      ${blush(-11, -19, .8)}${blush(14, -19, .8)}
      <path d="M-5 0 v-4 M5 0 v-4" stroke="#e08a3c" stroke-width="2" stroke-linecap="round"/>
    </g>`;

  // Ring-tailed lemur sitting on a branch, its long stripy tail hanging down.
  const lemur = () => `
    <g filter="url(#fur)">
      <path class="hang-tail" d="M14 -6 C20 30 6 70 16 112" stroke="url(#f-white)" stroke-width="13" fill="none" stroke-linecap="round"/>
    </g>
    <path class="hang-tail" d="M14 -6 C20 30 6 70 16 112" stroke="#4a3d55" stroke-width="11" fill="none" stroke-dasharray="7 11" opacity=".5" stroke-linecap="round"/>
    <g filter="url(#fur)">
      <ellipse cx="0" cy="-24" rx="20" ry="25" fill="url(#f-grey)"/>
      <ellipse cx="0" cy="-18" rx="12" ry="16" fill="url(#f-white)"/>
      <path d="M-22 -72 L-9 -64 L-19 -54 Z" fill="url(#f-grey)"/><path d="M22 -72 L9 -64 L19 -54 Z" fill="url(#f-grey)"/>
      <circle cx="0" cy="-56" r="19" fill="url(#f-white)"/>
      <ellipse cx="-8" cy="-57" rx="7.5" ry="8" fill="#3c3148"/><ellipse cx="8" cy="-57" rx="7.5" ry="8" fill="#3c3148"/>
      <path d="M-5 -46 Q0 -36 5 -46 Z" fill="#3c3148"/>
      <ellipse cx="-10" cy="-2" rx="7" ry="5" fill="url(#f-grey)"/><ellipse cx="10" cy="-2" rx="7" ry="5" fill="url(#f-grey)"/>
    </g>
    <g class="blink">${eye(-8, -57, 5.4, "url(#amber)")}${eye(8, -57, 5.4, "url(#amber)")}</g>
    <ellipse cx="0" cy="-43" rx="2.8" ry="2" fill="#1d1628"/>`;

  // Sloth hanging from a vine by its long arms, swinging slowly.
  const sloth = () => `
    <g filter="url(#fur)">
      <path d="M-14 -4 C-18 -30 -12 -56 -6 -70" stroke="url(#f-sloth)" stroke-width="11" fill="none" stroke-linecap="round"/>
      <path d="M14 -4 C18 -30 12 -56 6 -70" stroke="url(#f-sloth)" stroke-width="11" fill="none" stroke-linecap="round"/>
      <ellipse cx="0" cy="18" rx="27" ry="34" fill="url(#f-sloth)"/>
      <circle cx="0" cy="-8" r="21" fill="url(#f-sloth)"/>
      <ellipse cx="0" cy="-5" rx="16" ry="13" fill="url(#f-cream)"/>
    </g>
    <path d="M-10 -70 q4 -6 8 0 M2 -70 q4 -6 8 0" stroke="#5a4038" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <ellipse cx="-8" cy="-7" rx="7" ry="4.6" fill="#7a5a4a" transform="rotate(-18 -8 -7)"/>
    <ellipse cx="8" cy="-7" rx="7" ry="4.6" fill="#7a5a4a" transform="rotate(18 8 -7)"/>
    <g class="blink sleepy">${eye(-7, -7, 3.2)}${eye(7, -7, 3.2)}</g>
    <ellipse cx="0" cy="-1" rx="3" ry="2.2" fill="#3a2830"/>
    <path d="M-4 3 Q0 6.5 4 3" stroke="#5a3a3a" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    ${blush(-13, 1, .8)}${blush(13, 1, .8)}`;

  // Fuzzy caterpillar inching along a leaf.
  const caterpillar = () => `
    ${[0, 1, 2, 3, 4, 5].map((i) => `<g class="inch" style="animation-delay:${-i * 0.12}s"><g filter="url(#fur)"><circle cx="${-i * 13}" cy="-10" r="${i ? 9 : 10.5}" fill="url(#${i % 2 ? "f-lav" : "f-mint"})"/></g></g>`).join("")}
    <g class="inch">${eye(3, -13, 3.2)}${blush(6, -6, .6)}
      <path d="M-2 -20 q-3 -8 -7 -9 M5 -20 q2 -8 6 -9" stroke="#7a5a9a" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <circle cx="-9" cy="-29" r="2" fill="#f59bbb"/><circle cx="11" cy="-29" r="2" fill="#f59bbb"/></g>`;

  /* ---------- plants ---------- */
  const leaf = (x, y, len, rot, grad = "leaf1", t = 5) => `
    <g transform="translate(${x} ${y}) rotate(${rot})"><g class="sway-top" style="--t:${t}s">
      <path d="M0 0 C${-len * 0.28} ${len * 0.18} ${-len * 0.3} ${len * 0.7} 0 ${len} C${len * 0.3} ${len * 0.7} ${len * 0.28} ${len * 0.18} 0 0 Z" fill="url(#${grad})" filter="url(#lift)"/>
      <path d="M0 4 L0 ${len - 6}" stroke="#2c7a58" stroke-width="2" opacity=".5"/>
      ${[0.3, 0.48, 0.66].map((f) => `<path d="M0 ${len * f} q${len * 0.12} ${len * 0.05} ${len * 0.2} ${len * 0.13} M0 ${len * f} q${-len * 0.12} ${len * 0.05} ${-len * 0.2} ${len * 0.13}" stroke="#2c7a58" stroke-width="1.4" fill="none" opacity=".35"/>`).join("")}
      <path d="M${-len * 0.12} ${len * 0.2} C${-len * 0.2} ${len * 0.4} ${-len * 0.16} ${len * 0.6} ${-len * 0.04} ${len * 0.82}" stroke="#fff" stroke-width="3" opacity=".25" fill="none" stroke-linecap="round"/>
    </g></g>`;
  const vine = (x, len, t, extra = "") => `
    <g transform="translate(${x} 0)"><g class="sway-top" style="--t:${t}s">
      <path d="M0 0 C14 ${len * 0.3} -12 ${len * 0.6} 4 ${len}" stroke="url(#vine)" stroke-width="6" fill="none" stroke-linecap="round" filter="url(#lift)"/>
      ${[0.2, 0.42, 0.64, 0.84].map((f, i) => `<ellipse cx="${i % 2 ? 9 : -9}" cy="${len * f}" rx="9" ry="5" fill="url(#leaf2)" transform="rotate(${i % 2 ? 30 : -30} ${i % 2 ? 9 : -9} ${len * f})"/>`).join("")}
      ${extra}
    </g></g>`;
  const shroom = (x, y, s, cap, t) => at(x, y, s, `
    ${shadow(0, 30, 0)}
    <path d="M-8 0 C-11 -22 -8 -48 -5 -62 L5 -62 C8 -48 11 -22 8 0 Z" fill="url(#stem)"/>
    <ellipse cx="0" cy="-60" rx="30" ry="6" fill="#e8d4c2"/>
    <path d="M-36 -58 C-34 -96 34 -96 36 -58 C22 -52 -22 -52 -36 -58 Z" fill="url(#${cap})"/>
    <ellipse cx="-12" cy="-80" rx="12" ry="5" fill="#fff" opacity=".45" transform="rotate(-16 -12 -80)"/>
    <g filter="url(#glow)" fill="#fffbe2">
      <circle cx="-18" cy="-68" r="4.2"/><circle cx="6" cy="-82" r="3.4"/><circle cx="20" cy="-66" r="3.8"/><circle cx="-4" cy="-64" r="2.4"/>
    </g>
    <circle cx="-3.5" cy="-30" r="2" fill="#4a3a52"/><circle cx="3.5" cy="-30" r="2" fill="#4a3a52"/>
    <path d="M-2 -25 Q0 -23 2 -25" stroke="#4a3a52" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    ${blush(-7, -26, .6)}${blush(7, -26, .6)}`, "sway", false).replace('class="sway"', `class="sway" style="--t:${t}s"`);
  const fern = (x, y, s, rot, t) => {
    let leaves = "";
    for (let i = 1; i <= 9; i++) {
      const f = i / 10, px = 60 * f, py = -90 * f + 40 * f * f, w = 16 * (1 - f * 0.7);
      leaves += `<ellipse cx="${px - w * 0.5}" cy="${py - 4}" rx="${w}" ry="${w * 0.35}" fill="url(#leaf2)" transform="rotate(-35 ${px} ${py})"/>`;
      leaves += `<ellipse cx="${px + w * 0.6}" cy="${py + 4}" rx="${w}" ry="${w * 0.35}" fill="url(#leaf1)" transform="rotate(25 ${px} ${py})"/>`;
    }
    return `<g transform="translate(${x} ${y}) scale(${s}) rotate(${rot})"><g class="sway" style="--t:${t}s">
      <path d="M0 0 Q30 -60 60 -50" stroke="#3f8f6a" stroke-width="3" fill="none"/>${leaves}</g></g>`;
  };
  const log = (x, y) => `
    <g transform="translate(${x} ${y})">
      ${shadow(80, 110, 4)}
      <rect x="-20" y="-40" width="210" height="44" rx="22" fill="url(#bark)"/>
      <ellipse cx="190" cy="-18" rx="14" ry="22" fill="#c9a58a"/><ellipse cx="190" cy="-18" rx="8" ry="13" fill="none" stroke="#9a7a62" stroke-width="2"/>
      <path d="M10 -28 h40 M70 -16 h50 M30 -10 h30" stroke="#5a4038" stroke-width="2" opacity=".35" stroke-linecap="round"/>
      <g filter="url(#moss)"><path d="M-14 -36 C20 -52 60 -46 90 -50 C120 -54 150 -48 176 -40 L176 -34 L-14 -30 Z" fill="url(#leaf2)"/></g>
      ${[[40, "cap-peach"], [64, "cap-pink"], [140, "cap-lav"]].map(([fx, c], i) => `<path d="M${fx - 16} ${-12 + i * 4} q16 -14 32 0 z" fill="url(#${c})" filter="url(#lift)"/>`).join("")}
    </g>`;

  /* ---------- the two scenes ---------- */
  const top = `
    <svg viewBox="0 0 1400 440" preserveAspectRatio="xMidYMin slice">${DEFS}
      ${vine(1225, 270, 6.5, `<g transform="translate(4 270)"><g class="swing">${sloth()}</g></g>`)}
      ${vine(150, 210, 5.2)}
      ${vine(980, 160, 5.8)}
      ${vine(470, 120, 6.2)}
      <path d="M1040 112 C1120 96 1220 104 1400 92" stroke="url(#bark)" stroke-width="16" fill="none" stroke-linecap="round" filter="url(#lift)"/>
      ${[
        [0, -10, 150, -30, "leaf1", 5.4], [60, -14, 120, 20, "leaf3", 4.6], [120, -10, 170, -10, "leaf2", 6],
        [210, -16, 110, 35, "leaf1", 5], [300, -12, 130, -25, "leaf3", 5.6], [380, -14, 100, 15, "leaf2", 4.8],
        [560, -12, 110, -20, "leaf1", 5.2], [640, -16, 90, 25, "leaf3", 4.4], [760, -12, 120, -15, "leaf2", 5.8],
        [850, -14, 100, 20, "leaf1", 5], [930, -10, 140, -30, "leaf3", 6.2], [1020, -12, 130, 10, "leaf2", 5.4],
        [1110, -14, 120, -18, "leaf1", 4.9], [1190, -10, 160, 22, "leaf3", 5.7], [1290, -12, 130, -12, "leaf2", 5.1],
        [1360, -14, 170, 28, "leaf1", 6], [30, -20, 100, 45, "leaf2", 4.7], [1400, -20, 120, -40, "leaf3", 5.3],
      ].map((a) => leaf(...a)).join("")}
      ${leaf(820, -8, 120, -4, "leaf2", 6)}
      <g transform="translate(830 92) rotate(-6)">${caterpillar()}</g>
      ${at(1150, 104, 1.05, lemur())}
      ${at(1070, 102, 0.8, bird(), "", true)}
    </svg>`;

  const floor = `
    <svg viewBox="0 0 1400 400" preserveAspectRatio="xMidYMax slice">${DEFS}
      <path d="M0 210 C120 150 220 190 340 160 C470 128 560 180 700 150 C840 120 960 176 1100 146 C1220 122 1320 160 1400 140 L1400 400 L0 400 Z" fill="#7bb8a4" opacity=".45" filter="url(#haze)"/>
      <path d="M0 262 C160 222 330 252 520 230 C700 208 860 248 1040 226 C1200 208 1320 236 1400 224 L1400 400 L0 400 Z" fill="#6fb59a" opacity=".7"/>
      <path d="M0 318 C240 294 520 322 780 300 C980 284 1180 312 1400 298 L1400 400 L0 400 Z" fill="url(#ground)"/>
      ${fern(40, 330, 1.3, -20, 5.2)}${fern(560, 318, 1, -10, 4.6)}${fern(1340, 316, 1.25, -30, 5.6)}
      ${log(250, 334)}
      ${shroom(70, 330, 1.6, "cap-teal", 5)}${shroom(150, 336, 1, "cap-pink", 4.2)}${shroom(20, 340, 0.7, "cap-lav", 4.6)}
      ${shroom(1060, 318, 1.9, "cap-lav", 5.4)}${shroom(1150, 330, 1.2, "cap-teal", 4.4)}${shroom(1215, 338, 0.85, "cap-pink", 4.8)}
      ${shroom(640, 316, 0.8, "cap-peach", 4.3)}
      ${at(1060, 150, 0.85, bird())}
      ${at(500, 324, 1.25, bunny())}
      ${at(1300, 328, 1.3, panda())}
      ${at(205, 300, 1.15, weasel("f-peach", "f-cream"), "sitting", true)}
      <g class="wander">${at(0, 334, 1.3, weasel("f-lav", "f-white", true), "walking")}</g>
      <g fill="#fffbe2" filter="url(#glow)">
        ${[[120, 250, 7, 0], [330, 280, 8, -2], [560, 240, 6.5, -4], [760, 270, 9, -1], [990, 220, 7.5, -5], [1180, 260, 8.5, -3], [60, 220, 6, -3.5], [880, 290, 7, -6], [420, 200, 8, -2.5]]
          .map(([x, y, t, d]) => `<circle class="spark" cx="${x}" cy="${y}" r="2.6" style="--t:${t}s;--d:${d}s"/>`).join("")}
      </g>
    </svg>`;

  // Her phone ("laggy on my phone and makes it hot", 2026-11-11): the fur, glow, blur and
  // shadow filters are what make a phone work hard, so on phones the same scene is drawn
  // without them (smooth animals) and without the drifting sparkles. Computer unchanged.
  const PHONE = matchMedia("(max-width: 760px), (hover: none)").matches;
  const lite = (svg) => svg.replace(/ filter="url\(#\w+\)"/g, "").replace(/<circle class="spark"[^>]*\/>/g, "");
  const put = (id, svg) => { const el = document.getElementById(id); if (el) el.innerHTML = PHONE ? lite(svg) : svg; };
  put("scene-top", top);
  put("scene-floor", floor);
})();
