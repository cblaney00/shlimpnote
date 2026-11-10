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
- 2026-11-10, his words: "i want this whole app way more squishy and jiggly, also it is
  still white, it should be pastel colored and jiggly, heavily textured". Now the **jelly
  look** (last block of `style.css`): no big white areas — page is pastel lavender with
  colour blobs, cards are solid pastel jelly (`--tone`) with a glossy top (`--gloss`),
  sugar-grain noise (`--grain`, an SVG noise image) and white polka dots (`--dots`), thick
  soft edges; buttons/chips are gummy sweets; ticks are jelly beans. Jiggle: stronger
  springs, hover wobble, scroll sloshes the cards, pages pop in card by card
  (`Squish.pop`), cards/dots/ticks/days "breathe" via the CSS `scale` property (separate
  from the spring's `transform`, so they don't fight), the shrimp bobs.
- 2026-11-10, his words: "the changes i ask for should only apply to her phone if her
  phone would need it, her phone should mostly just need to click around and type things
  and read things that would be up to date with her computer version on refresh" and "it
  would also refresh on open". On phones (`max-width: 760px` or no hover) there is no
  always-on breathing and no hover wobble; taps still squish. **Syncing between her PC and
  phone is wanted** (on open and on refresh) — not built yet; needs an online place for
  her data (asked him).
- 2026-11-10, his words: "darker pastels, i should not be thinking 'hmm thats too
  white/washed out'". The colour tokens were deepened (last blocks of `style.css` override
  the ones at the top) and white was cut almost everywhere: less gloss, fainter dots,
  fields/days/bars/chips mixed with the page colour instead of white. Period days are
  clearly deeper periwinkle with white numbers. **Rule from now on: if anything reads as
  white or washed out, it's wrong.**
- 2026-11-10, her asks (through him): "for journal when you open it can she choose an emoji
  to start the note taking to show how she is feeling when she starts writing" — Journal
  opens on a big squishy grid of 15 feelings emoji (`FEELINGS`); picking one opens the
  writing box with it shown big at the top (click it to change). Stored as `entry.emoji`
  (old `mood` words map to an emoji). Shown in the day list and on Today's Journal card.
- "a cute background of some mushrooms, a little passive animation ... she likes nature and
  cute things, maybe little fluffy animals with tiny legs and big eyes and a long tail like
  a cute weasel". The **meadow** (`.scene`, inline SVG in `index.html`, behind the pages):
  hills, mushrooms with tiny faces and dotted pastel caps that sway, grass and daisies,
  sparkles drifting up, a peach weasel sitting by the mushrooms (blinks, tilts its head,
  swishes its tail) and a lavender weasel that trots across on tiny legs every ~46 s. All
  CSS animation. On phones the meadow holds still and the walker is hidden.
- 2026-11-10, her/his words: "she doesnt like the dots in the background and she wants more
  creatures ... make it like a jungle canopy (jungle mushrooms instead) and make more types
  of creatures but make them a lot more fluffy and not smooth like paper cutouts ...
  everything in this app should be very 3D". **No dots anywhere** (`--dots` is empty). The
  meadow became a **jungle** drawn by `scene.js` into `#scene-top` (canopy: glossy leaves,
  vines, a branch) and `#scene-floor` (misty layers, glowing jungle mushrooms with faces,
  ferns, a mossy log with shelf fungi), plus slanting sun rays (`.jungle-sky`). Creatures:
  sloth swinging on a vine, ring-tailed lemur on the branch (stripy tail sways), round bird
  (×2), fuzzy caterpillar on a leaf, bunny (hops, ear twitches), red panda, peach weasel
  sitting, lavender weasel wandering across. **Fur = the `#fur` SVG filter** (roughened
  outline + light/dark strands) over radial-gradient bodies; eyes glossy; soft shadows.
  3D: cards and buttons have bevels, a coloured ledge underneath and deep shadows; titles
  are white bubble letters with a stacked 3D edge; dots in the sidebar are shiny spheres.
- 2026-11-10, his words: "the buttons are too organized and almost in a grid, they should
  maintain postion but their shapes should be moving and bending like they are globs of
  colored jelly in an invisible highly viscous liquid". **Goo**: cards, buttons, chips,
  doses, days, ticks, emoji buttons slowly morph their outline (`goo`, `goo-card`,
  `goo-day` border-radius keyframes) and tilt a degree or so, each with its own random
  pace (`--md`) and start (set once per element in `Squish.breathe`). Positions never move.
  On phones the shapes are blobby but still.
Ask him before changing the look.

## How it is built

- **A web app (HTML/CSS/plain JavaScript, no libraries, no build step)**, so she can
  install it on Windows from Edge ("Install ShlimpNote") and it then behaves like a
  normal app (Start menu, taskbar, own window). Dev shell: `vibe-web`.
- **Live at https://cblaney00.github.io/shlimpnote/** — GitHub Pages from `main` of the
  **public** repo **github.com/cblaney00/shlimpnote** (his OK, 2026-11-10). **Push `main` after
  every commit** (after the chown: `sudo -u insideabush -H git -c credential.helper= -c "credential.helper=!$(sudo -u insideabush -H which gh) auth git-credential" push`
  — plain `git push` has no login here): that push is both the
  backup and the release — her installed app picks it up the next time she opens it.
  `sw.js` (service worker) fetches every file fresh each time the app opens online and
  falls back to the saved copy offline.
- Her data: browser `localStorage` key `shlimpnote.v1` on each device, **synced** through
  `data.json` in the **private** repo **github.com/cblaney00/shlimpnote-data** (sync module
  in `app.js`: `syncNow`, `merge3`). Syncs on open, when she returns to the app, when back
  online, and 2.5 s after any change. Three-way merge against the last synced copy
  (`shlimpnote.base`): changes on both devices survive; same field changed on both → this
  device wins; an edit beats a delete. Never swaps data while a text box is focused (retries).
  `ui` is never synced. Tested against the real repo 2026-11-10 (node harness, test file
  removed afterwards).
- **Connect code** = a fine-grained GitHub token (Contents + Issues read/write on
  shlimpnote-data only) that **he** makes on github.com; it is stored only on her devices
  (`localStorage` `shlimpnote.key`), entered on the "Your devices" page (tap the line under
  Ask for a change) or via `…/shlimpnote/#connect=CODE`. **Never put it in this repo** — the
  repo is public. The manual tells him how to make one.
- "Ask for a change" requests become issues (label `from-shlimpnote`) in shlimpnote-data;
  a closed issue shows as Done in her app. To work on them:
  `sudo -u insideabush -H gh issue list --repo cblaney00/shlimpnote-data`.
- **Instruction manual**: `~/Downloads/ShlimpNote-Manual.html` (made 2026-11-10 by a
  script, pictures embedded). Regenerate it if installing/connecting changes.
- Files: `index.html` (shell), `style.css` (all looks), `scene.js` (the jungle and creatures, SVG), `app.js` (everything else: store,
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
