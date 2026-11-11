# 4th Quarter Ready

A single-page training plan and tracker: today's session with tappable set circles, readiness check, rest and interval timers, physio core list, Achilles log and a progress log. It installs as an app (PWA) and works offline.

Everything is in `index.html` (vanilla JS and CSS, no build step). The training plan is the `PLAN` object at the top of the script.

## Files

| File | Purpose |
|---|---|
| `index.html` | The app. Plan data at the top, logic below, Firebase module at the end. |
| `firebase-config.js` | Public Firebase web config for the project `q-ready-5216b`. No secrets. |
| `firestore.rules` | Database rules: one private document per signed-in person. |
| `manifest.webmanifest`, `sw.js` | Install and offline support. |
| `proxy/worker.js` | Cloudflare Worker that passes on the referee calendar (see section 3). Deployed separately on Cloudflare. |
| `icon.svg`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` | Icons. |

The `.xlsx` sheets in this folder are your old plans; they are not part of the app and need not be uploaded.

## 1. Put it on GitHub Pages

1. On <https://github.com> click **+ → New repository**, name it e.g. `4q-ready`, set it to **Public**, tick **Add a README file**, **Create repository**.
2. **Add file → Upload files**. Drag in every file from the table above plus this `README.md`. **Commit changes**.
3. **Settings → Pages → Build and deployment**: **Deploy from a branch**, branch `main`, folder `/ (root)`, **Save**.
4. After a minute or two the app is live at `https://dankerschen.github.io/4q-ready/`.

**Install it:** on iPhone/iPad open the link in Safari, then **Share → Add to Home Screen**. On Android or desktop Chrome use **Install app** in the menu.

## 2. Firebase (sign-in and sync)

The app uses its own Firebase project, `q-ready-5216b`. One-time setup in <https://console.firebase.google.com>:

1. **Build → Authentication → Get started → Sign-in method**: enable **Google** and **Email/Password**.
2. **Authentication → Settings → Authorized domains → Add domain**: `dankerschen.github.io`.
3. **Build → Firestore Database → Create database**: pick a location near you, start in **production mode**.
4. **Firestore Database → Rules**: replace everything with the contents of `firestore.rules` and click **Publish**. Each person can then read and write only their own document `workouts/{uid}`.

## 3. Game calendar proxy (optional)

In **Options (⚙) → Game calendar** each referee can paste the link to their own FLBB calendar (`webcal://www.luxembourg.basketball/…/XXXXXXXX.ics`). Game days then come from the calendar, and a week with a game from Monday to Friday, or with more than one game, switches to the lighter version by itself.

The federation's server does not let a web page read the calendar directly, so the app needs the small proxy in `proxy/worker.js` (Cloudflare Worker, free plan). Without it, only the "Upload an .ics file" option works.

1. <https://dash.cloudflare.com> → **Workers & Pages → Create → Worker**, name it e.g. `4q-ready-calendar`, **Deploy**.
2. **Edit code**, replace everything with the contents of `proxy/worker.js`, **Deploy**.
3. Copy the worker address (`https://4q-ready-calendar.<account>.workers.dev`) into `calendarProxy` in the `PLAN` object at the top of `index.html`, bump `VERSION` in `sw.js`, and upload.

The worker only fetches `.ics` files from `luxembourg.basketball`, only answers pages from `https://dankerschen.github.io`, and stores or logs nothing. The app keeps only each game's teams, league, place and time; the list is cached on the device and refreshed a few times a day.

## How saving works

- **Signed out:** data is saved in that browser only (localStorage).
- **Signed in (Google or email):** data is saved to the private document `workouts/{uid}` 1–2 seconds after each change and when the page is hidden. The header shows *Saving…*, *All progress saved* or *Couldn't save — check your connection*.
- Before each save the app reads the cloud copy and merges it, so a second device does not overwrite the first. The merge is a union by date/id (sessions, core and yoga ticks, pain scores, tests, physio lists). Where both sides have the same entry, the newer one wins.
- On the first sign-in in a browser, the app offers to merge the data already in that browser into the account.
- While signed in, a copy stays in the browser so the app opens offline; it is removed on sign-out.
- **Progress → Backup** exports everything as JSON and imports (merges) a file.
- Settings (keep awake, auto rest timer, beep) stay per device.

Sign-in does not work when `index.html` is opened directly as a file; the app then runs signed out.

## Releasing a new version

After changing any file, bump `VERSION` in `sw.js` (e.g. `"v1"` → `"v2"`) and upload the changed files. Installed apps pick up the new version on the next start after the one that downloads it.

## Editing the plan

Open `index.html` and edit the `PLAN` object:

- `startDate`: the Monday of week 1.
- `blocks`: the block library. Each item has `reps`, `name` and optionally `how` (one-line explanation), `achilles` (minimum Achilles step) with `fallback`, `physioCheck`.
- `weeks`: the week grid. Each day lists `{ block, sets, note }`; `sets` is the number of circles.
- After the last week the app repeats weeks from `repeatFrom`.

To preview another day, add `?date=2026-11-17` to the address.
