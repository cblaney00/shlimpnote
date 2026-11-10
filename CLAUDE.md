# ShlimpNote

*Created by the `vibe` command. Keep the two sections below current as the app grows —
a future session starts by reading them.*

> **The rules for working here are in `../CLAUDE.md`** (one directory up, alongside the
> other apps). They are loaded automatically; if for any reason they are not in your
> context, read that file before doing anything else.

## What this app is

ShlimpNote is a soft, pastel all-in-one notebook that insideabush is making **for his
girlfriend**, who uses **Windows**. It must feel like a normal app on her computer and
always run the newest version from GitHub when she opens it (his ask, 2026-11-10).

Pages (sidebar, each with its own pastel dot): **Today** (overview cards: meds to tick,
cycle status, chores, work, journal prompt, goals), **Meds** (each med with dose and
times of day; a tick per dose per day; last-7-days strip), **Cycle** (month calendar:
click a day for light → medium → heavy → clear; predicts the next period from her
average cycle, dashed days = expected), **Notes** (list + search + pin, autosaves),
**Chores** (checklist; a chore can repeat every day / every week and comes back by
itself), **Work** (checklist), **Goals** (goal with steps and a progress bar),
**Journal** (one entry per day with a mood).

**Ask for a change** (sidebar bottom, his ask): she types a request; it is sent to him
as an issue in a private GitHub repo (see "How it is built"). Her past requests show with
Waiting / Sent / Done (Done = he closed the issue).

His rules for how it feels (2026-11-10), carried over from what he learned making
VibeNote (`../vibenote/CLAUDE.md`):
- **No pop-ups, ever.** No alert/confirm/prompt dialogs, no modal windows. Deleting
  shows an inline "… removed · Undo" line for 6 s instead of "are you sure?".
- **Smooth and elegant**: soft fades, nothing jumps on hover (hover tools fade in in
  place, they never shift the layout), lists don't rebuild while she types.
- Clickable things look clickable (outlined/filled buttons that light up on hover).
- Text boxes grow with what is typed (never a one-line box to arrow along).
- Enter adds, Shift+Enter is a new line; click text to edit it in place.
- Drag rows (by the ⠿ grip) to reorder.
- Works at any window size; under 760 px wide the sidebar becomes a top bar.
- Look: **pastel colours** (her ask): lavender, mint, periwinkle, butter, peach, sky, lilac,
  blush on a near-white lilac page, soft plum-grey text. Tokens at the top of `style.css`.
- 2026-11-10, his ask: "that dot color for cycle is horrible, make it not red at all" —
  Cycle is **periwinkle** (`--peri*`), calendar shades too (light/medium/heavy). No red or
  rose on the Cycle page.
- 2026-11-10, his ask: "not obvious that it runs in firefox, its own icon and no search bar".
  On her Windows PC that is Edge's installed-app mode. On his Linux machine `run.sh` opens a
  separate Firefox profile (`app-window/`: userChrome.css hides every toolbar, window class
  `shlimpnote`). Firefox still adds " — Mozilla Firefox" to the window title; nothing in a
  profile can remove that. `<meta name="darkreader-lock">` stops his system-wide Dark Reader
  from darkening it, and `color-scheme: light only` keeps it pastel in dark mode.
- 2026-11-10, his words: "i liked the colors from before but i just didnt like the red on
  cycle because the would remind her of blood which is the last thing she wants to think
  about on her period". **Keep the palette as is; nothing on Cycle may look red or
  blood-like** (no rose/pink/red there). Periwinkle for now; he was asked if it feels right.
- 2026-11-10, his ask: "a lot more cute and squishy looking, clicking on an area should
  squeeze or squish it and it should bounce or jiggle a bit, if clicked repeatedly it should
  not hard restart the animation, it should be smooth with a rippling effect [in] the space
  around it". Done as: rounded **Nunito** font (bundled, `docs/credits.md`), pill buttons,
  puffy cards with soft top highlight (`--puff`), bubble dots; **`Squish`** in `app.js`:
  each pressed thing has a spring (squeeze while held + jelly wobble); clicks *add* velocity,
  never reset, so rapid clicks blend; parents wobble less; two soft rings + a glow spread
  from the click (`.ripple`, colour of what was clicked; Cycle = periwinkle) and nudge
  nearby things as the ring reaches them. Springs carry over a page redraw by `data-key`/
  `data-id`/`data-go` (`keyOf`). Never use CSS `:active` transforms or transform transitions
  on these elements — they fight the spring. Text boxes never squish.
- 2026-11-10, his ask: "available as an app on her phone". Same web app: on Android Chrome
  "Install app"/"Add to Home screen", on iPhone Safari Share → "Add to Home Screen". Under
  760 px the sidebar is a scrolling row of pills at the top; Cycle stacks (`.cycle-split`).
  Her phone and PC keep **separate** data until there is syncing (not built; asked him).
- 2026-11-10, his words: "wheres the color?" (the squishy version was mostly white). Now
  **every page has a tone** = its sidebar colour (`--tone`, set in `render`): cards are a
  soft gradient of it, buttons/chips/ticks/fields/hover use it, the page title has a
  highlighter stripe in it; Today's cards each use their own section's tone. Sidebar is a
  lavender → pink → mint fade, the picked row is filled with its colour, and the page has
  soft colour blobs behind it. Colours made with `color-mix()`.
Ask him before changing the look.

## How it is built

- **A web app (HTML/CSS/plain JavaScript, no libraries, no build step)**, so she can
  install it on Windows from Edge ("Install ShlimpNote") and it then behaves like a
  normal app (Start menu, taskbar, own window). Dev shell: `vibe-web`.
- Hosted on **GitHub Pages** (not set up yet — needs his OK to make the repo).
  `sw.js` (service worker) fetches every file fresh from the site each time it opens
  online and falls back to the saved copy offline — that is the auto-update.
- Her data: browser `localStorage` key `shlimpnote.v1` on her computer only
  (`navigator.storage.persist()` asks the browser not to clear it). Nothing of hers is
  ever sent anywhere except the change requests.
- Files: `index.html` (shell), `style.css` (all looks), `app.js` (everything: store,
  pages as `VIEWS.<page>`, checklist/edit/undo helpers, change requests),
  `config.js` (`repo` + `key` for change requests: a fine-grained GitHub token that can
  only write issues in that one private repo, stored base64 of the reversed string so
  it isn't a plain token in the code), `sw.js`, `manifest.webmanifest`, `icons/`
  (shrimp icon; PNGs made from the SVG with `magick`).
- If a new file is added, add it to `FILES` in `sw.js` so it works offline.
- `?demo` uses made-up data in a separate storage key (`shlimpnote.demo`); `?page=meds`
  opens a page. Both are for checking/screenshots and never touch her data.
- Run locally: `./run.sh` (tiny `serve.js` server on port 8642 + Firefox).
- Screenshots: start `node serve.js 8642`, then
  `firefox --headless --no-remote -profile <scratch dir> --window-size=1280,860 --screenshot <png> "http://localhost:8642/?demo&page=<page>"`.
  The first render is not animated so the shot isn't blank.
- Check syntax: `nix develop /home/insideabush/nixos-config#vibe-web --command node --check app.js`.
