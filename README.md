# 4th Quarter Ready

A single-page training plan and tracker: today's session with tappable set circles, readiness check, rest and interval timers, physio core list, Achilles log and a progress log. It installs as an app (PWA) and works offline.

Everything is in `index.html` (vanilla JS and CSS, no build step). The training plan is the `PLAN` object at the top of the script.

## Files

| File | Purpose |
|---|---|
| `index.html` | The app. Plan data at the top, logic below, Firebase module at the end. |
| `firebase-config.js` | Public Firebase web config (same project as FretWise). No secrets. |
| `firestore.rules` | Database rules for FretWise and 4th Quarter Ready together. |
| `manifest.webmanifest`, `sw.js` | Install and offline support. |
| `icon.svg`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` | Icons. |

The `.xlsx` sheets in this folder are your old plans; they are not part of the app and need not be uploaded.

## 1. Put it on GitHub Pages

1. On <https://github.com> click **+ → New repository**, name it e.g. `4q-ready`, set it to **Public**, tick **Add a README file**, **Create repository**.
2. **Add file → Upload files**. Drag in every file from the table above plus this `README.md`. **Commit changes**.
3. **Settings → Pages → Build and deployment**: **Deploy from a branch**, branch `main`, folder `/ (root)`, **Save**.
4. After a minute or two the app is live at `https://dankerschen.github.io/4q-ready/`.

**Install it:** on iPhone/iPad open the link in Safari, then **Share → Add to Home Screen**. On Android or desktop Chrome use **Install app** in the menu.

## 2. Firebase (sign-in and sync)

The app uses the existing FretWise project (`fretwise-5e60a`), so sign-in methods and the database already exist. Two things to do:

**Publish the updated rules**

1. Open <https://console.firebase.google.com> and choose the project **fretwise-5e60a**.
2. **Build → Firestore Database → Rules**.
3. Replace everything in the editor with the contents of `firestore.rules` from this folder. It keeps the FretWise rule (`users/{uid}`) and adds `workouts/{uid}`, owner-only.
4. Click **Publish**. Also copy the same `firestore.rules` into the FretWise repository so both repos match.

**Check the authorised domain**

*Authentication → Settings → Authorized domains* must list `dankerschen.github.io`. It is already there if FretWise is hosted under the same GitHub account.

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
