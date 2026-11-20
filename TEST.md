# Rampage Rex audit

- **Audited branch:** `main` (newer than `staging`)
- **Commit:** `770f162cebb5298a946c63852297196134613b65`
- **Date:** 2026-11-20
- **Re-checked:** `main` at `6342f7d`, 2026-11-20

Since this audit, the game moved into `web/` (`src/` is now `web/src/`, and so on). File and line references below point to the layout at the audited commit.

`staging` (`0a3078406871eb45f6cecf966de5433ff5b4d7ab`, 2026-11-17) is still the initial README. `main` is the playable browser game. The planned Tauri wrapper is not in the repo: there is no Rust crate, `tauri.conf`, capability file, IPC command, updater, or filesystem/shell permission. The game is static HTML, CSS, and ES modules on a canvas.

## Status

All five findings are resolved and merged into `main` through PR #32 (`ce12366`):

| Finding | Status |
| --- | --- |
| RR-1 | Fixed in `49230b7`: `hurt()` returns whether the hit landed; net, giant net and rocket burst apply only then, and projectiles pass through an invulnerable Rex. |
| RR-2 | Fixed in `49230b7`: Rex is immune from the first frame of the jump (`lift > 0`), and the takeoff cancels an on-screen hero ulti. A jump pressed up to ~0.85 s after the banner still counters it. |
| RR-3 | Fixed in `49230b7`: the queued attack is kept while Rex is stunned. |
| RR-4 | Fixed in `49230b7`: `start()` pauses right away when the tab is hidden. |
| RR-5 | Resolved in `ced8583`: `tools/preview-browser.mjs` and `docs/animation-checks.md` were removed as unused. |

`rex.bigNet` is now initialised to 0. `npm run check` reproduces RR-1 to RR-3 and passes.

The re-check on `6342f7d` confirmed each fix is in `main`: `immune()` and the boolean `hurt()` (RR-1, RR-2), takeoff cancelling a hero ulti (RR-2), the queue kept during stun (RR-3), and `pause()` on a hidden tab in `start()` (RR-4). `node --check` passes on every file in `src/` and `tools/`, and `npm run check` passes.

## Summary

| Severity | Count |
| --- | ---: |
| Critical | 0 |
| High | 0 |
| Medium | 2 |
| Low | 3 |
| **Total** | **5** |

| Category | Count |
| --- | ---: |
| Bug | 5 |
| Security | 0 |

## Findings

### RR-1 — Medium — Bug

- **Where:** `src/world.js:292`, `src/world.js:314`, `src/world.js:473-474`
- **What:** Airborne and ultimate invulnerability block damage only. Net slow, and Jaring's giant-net slow, are applied after `hurt()` returns.
- **Why it matters:** The jump is documented as a way to avoid shots ("Rex kebal selama di udara"). A net that overlaps Rex while `lift > 40` leaves HP unchanged and still sets `slow` to 2.3 seconds. Jaring's ult does the same with a 5 second slow and the full-body net graphic. A net that hits during Amukan Rex also sticks, so about 0.4 seconds of slow remain after the 1.9 second ultimate ends.
- **Reproduced:** Loaded district 1 in Node, let Jaring fire a real net, then started the jump. At lift 136, HP stayed 400 and `slow` became 2.3. Called the normal ult strike while lift was 154: HP stayed 400, `slow` and `bigNet` became 5. A net spawned on Rex during his own ultimate left `slow` at 0.4 when the attack ended, with HP still 400.
- **Fix:** Make `hurt()` report whether the hit was ignored. Apply `slow`, `bigNet`, and the rocket burst only when the hit lands. Do not consume a projectile that invulnerability fully ignored.

### RR-2 — Medium — Bug

- **Where:** `src/world.js:20`, `src/world.js:76`, `src/world.js:256`, `src/world.js:292`
- **What:** Jump cancels a hero ultimate only if it is pressed within about 100 ms of the banner, and a slightly late jump is still inside the damage window.
- **Why it matters:** Landing is the cancel (`jump` impact is 0.95 s, hero windup is 1.05 s). The README tells the player to roar, jump, or use Rex's ultimate when the panel appears. Roar still cancels with a 0.5 s reaction. Jump does not: a 100 ms late press misses the landing cancel, and lift is only ~25, under the `lift > 40` immunity check, so the ult connects in full.
- **Reproduced:** For each hero, started the cast, then pressed jump after 0, 0.1, 0.2, and 0.3 s.
  - 0 ms: all three ults cancel ("Ulti … gagal!"), HP stays 400.
  - 100 ms: none cancel. Perisai deals 60 damage and 1.1 s stun (HP 400 → 340). Rajawali starts the homing laser rain. Jaring deals 45 damage, 0.8 s stun, and 5 s slow (HP 400 → 355).
  - 200 ms and later: Perisai's damage is dodged because lift is ~154, but the ult is not cancelled. Jaring still applies the 5 s slow (same root as RR-1). Rajawali's rain still starts.
- **Fix:** Cancel the cast when the jump leaves the ground, or make the windup long enough that a jump pressed as the banner appears still lands in time. Treat `lift > 0` as immune so the takeoff does not eat the hit.

### RR-3 — Low — Bug

- **Where:** `src/world.js:386-389` (stun lengths at `src/world.js:62-64` and the Perisai charge at `src/world.js:331`)
- **What:** A tap during hitstun longer than 0.25 s is dropped. Holding the button is not.
- **Why it matters:** The attack queue expires 0.25 s after the press, and it is not retried while `stun > 0`. Perisai's charge stuns for 0.45 s. Perisai's ult stuns for 1.1 s and Jaring's for 0.8 s. A single press at the moment of the hit never comes out. The README says a slightly early press still fires once Rex is free; that is true for attack recovery, not for these stuns.
- **Reproduced:** Set `rex.stun` to 0.45, sent `bite` for one 1/60 s step, then sent no input for 40 steps. No attack started. Repeating the same stun while `bite` stayed in the input set did start the bite after the stun.
- **Fix:** Keep the queued attack until stun ends, or refresh `queuedUntil` while Rex is stunned.

### RR-4 — Low — Bug

- **Where:** `src/main.js:73`, `src/main.js:81`, `src/main.js:165`
- **What:** Hiding the tab during the district card does not pause the game once loading finishes.
- **Why it matters:** `visibilitychange` calls `pause()` only while `screen === 'playing'`. `start()` stays on `loading` through the preload and the 1.4 s / 2.6 s card, then sets `playing`. If the tab was already hidden, the visibility event has already run and is not checked again. The district then simulates in the background until the player comes back. `requestAnimationFrame` is throttled, so this is a short unattended fight, not a full idle timeout.
- **Reproduced:** By control flow, not in a browser. `pause()` returns immediately unless the screen is `playing`, and that assignment happens only after the `await` on line 72.
- **Fix:** After setting `screen` to `playing`, call `pause()` when `document.hidden` is true.

### RR-5 — Low — Bug

- **Where:** `tools/preview-browser.mjs:28` (menu markup is `index.html:17`)
- **What:** The browser regression script still queries `.cover-rex`. The menu image is `class="cover"`.
- **Why it matters:** Commit `b7fbf77` replaced the Rex poster with the menu background and renamed the class. `tools/preview-browser.mjs` was not updated. The script throws on that locator before the gameplay checks. `docs/animation-checks.md` still describes those checks as passing.
- **Reproduced:** Read both files. Playwright was not installed here, so the script itself was not executed.
- **Fix:** Point the locator at `.cover`.

## Checks

| Check | Result |
| --- | --- |
| Stack | Browser game. No Tauri config, IPC, updater, or fs/shell allowlist to review. |
| Syntax | `node --check` on `src/*.js` and `tools/*.mjs`: pass. |
| Tests | `npm run check` (`tools/check-motion.mjs`): pass. One impact per attack at 30/60/120/144 Hz, pose curves continuous, walk distance 722.22–722.27 px across those rates, Rajawali roar landing, hero flank, civilian two-hit, district clear/exit, jump immunity against `hurt()`, defeat timing, and since PR #32 regression checks for RR-1 to RR-3. |
| Typecheck | No TypeScript and no `tsconfig`. Not run. |
| Lint | No ESLint config. Not run. |
| Build | No build script. The game is the static files. Not run. |
| `npm audit` | Not run. `package.json` has no dependencies and there is no lockfile (`npm audit` exits with `ENOLOCK`). Nothing to audit. |
| Secrets | No private keys, `AKIA` ids, or `api_key` strings in the tree or in git history. `localStorage` only stores `rex.best` and `rex.sound`. |
| Assets | Every building color, damage state, prop (including `mobil-sppg`), civilian frame, soldier frame, hero part, and backdrop used by the four levels is in `assets/manifest.json` and has a `.webp`. Six manifest PNGs had no WebP (`hero`/`soldier` master sheets and `ui/hud/frames/rage.png`); the loader does not request those paths. Since `ced8583` the master-sheet entries are gone, and only `ui/hud/frames/rage.png` remains, used directly as the favicon. |
| Simulation | District 4 for 90 s did not throw. Overkill damage stops at 100% (`lost === total`). Every building can be bitten or stomped before `exitX`. Truck props do not share a cell with another prop (nearest other prop is 417–512 px). |
| Browser script | Not executed (no Playwright, no static server). See RR-5; the script has since been removed. |
| Security surface | No CSP meta tag. `innerHTML` is used for the help/pause/result copy and boss cards. Shipped level names are plain text (`Jalan Ruko`, `Pusat Kota`, `Pelabuhan`, `Alun-Alun`) and boss types are the three hero ids, so this is not an exploitable sink in the current data. Not filed as a finding. |

`rex.bigNet` becomes `NaN` on the first update because it is not initialized (`Math.max(0, undefined - dt)`). `bigNet > 0` is false, and Jaring's ult assigns a real number before the graphic is used. No visible effect, so it is not filed.
