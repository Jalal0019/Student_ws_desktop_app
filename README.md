# Desktop App — Big Data AI Club Attendance & Grades (fully offline)

This is a completely offline desktop app — no internet connection is ever
required to open it or to use it. All the pages (Instructor Portal, Student
Profiles) are bundled inside the app itself, and all data (courses,
students, attendance, grades) is saved to a file on **this computer**, not
to GitHub or any server. There is no GitHub token and no online "connect"
step of any kind — after the app password, it opens straight into your
data.

## App password
Before anything loads, the app shows a local password screen.

- **Default password: `bigdata2026`**
- To set your own password, run this once with Node.js installed:
  ```
  node -e "console.log(require('crypto').createHash('sha256').update('YOUR_NEW_PASSWORD').digest('hex'))"
  ```
  Copy the printed hash, then open `main.js` and replace:
  ```js
  const APP_PASSWORD_HASH = null;
  ```
  with:
  ```js
  const APP_PASSWORD_HASH = 'paste the hash here';
  ```
  Rebuild the app (or re-run the GitHub Actions workflow) afterward for the
  new password to take effect.
- The password is checked as a SHA-256 hash inside `main.js` (never stored
  or shown in plain text). This is light protection meant to keep out
  casual users on a shared computer — anyone with the app's source files
  could still find the password by editing `main.js`. If you need stronger
  protection for the underlying data file itself, let me know and I can
  add encryption at rest.

## How data storage works
- Everything is stored in one file:
  - **Windows**: `%APPDATA%\bigdata-attendance-offline\attendance-data.json`
  - **Mac**: `~/Library/Application Support/bigdata-attendance-offline/attendance-data.json`
- Every "Save" button in the app writes straight to that file. There's
  nothing to sync and nothing that can fail due to no internet.
- Because the data lives only on this computer, it is **not automatically
  shared** between the Instructor Portal and Student Profiles page — it is,
  in fact, shared, since both pages read the same local file — but it does
  **not** sync between two different computers on its own.

## Moving data between computers / backing it up
Use the **Backup…** and **Restore…** buttons at the top of the Instructor
Portal:
- **Backup…** saves a copy of all your data as a `.json` file wherever you
  choose (a USB drive, a cloud-synced folder, etc.).
- **Restore…** loads a previously saved backup file, **replacing all
  current data** on this computer (you'll be asked to confirm first).

To move your data to a different computer: run the app once on the new
computer (it starts empty), click **Restore…**, and pick the backup file
from the old computer.

## Folder contents
```
desktop-app-offline/
├── main.js           ← creates the app window, reads/writes the local data file
├── preload.js         ← securely connects the pages to main.js
├── renderer/
│   ├── login.html        ← app password screen (shown first)
│   ├── index.html       ← portal picker
│   ├── teacher.html       ← Instructor Portal
│   ├── profiles.html       ← Student Profiles
│   └── logo3.png, coai-english-logo.png, favicon.png ← club branding
├── package.json       ← app metadata + build configuration
├── build/
│   ├── icon.png         ← app icon (source)
│   ├── icon.ico          ← Windows icon
│   └── icon.icns           ← macOS icon
└── .github/workflows/
    └── build-desktop.yml ← builds .exe and .dmg automatically on GitHub
```

## Option A (recommended): let GitHub build it for you
You don't need a Windows or Mac computer for this — GitHub's own servers do
the building. (This step itself needs internet, since it happens on
GitHub's servers — the *finished app* you download afterward does not.)

1. Push this `desktop-app-offline/` folder (with its
   `.github/workflows/build-desktop.yml`) to a repository on GitHub.
2. Go to the repo's **Actions** tab → "Build Desktop App" workflow → **Run
   workflow** (or just push a change inside `desktop-app-offline/` — it
   triggers automatically).
3. Wait a few minutes for both jobs (`build-windows`, `build-mac`) to finish.
4. Open the finished run → scroll to **Artifacts** → download
   `windows-installer` (contains the `.exe`) and `mac-installer` (contains
   the `.dmg`).

## Option B: build it yourself locally
Only do this if you already have the matching OS available.

**On Windows** (produces the `.exe`):
```
cd desktop-app-offline
npm install
npm run dist:win
```
The installer appears in `desktop-app-offline/release/`.

**On a Mac** (produces the `.dmg`):
```
cd desktop-app-offline
npm install
npm run dist:mac
```
The `.dmg` appears in `desktop-app-offline/release/`.

## Notes
- The app is **unsigned**. Windows may show a SmartScreen warning on first
  run ("More info" → "Run anyway"); Mac will say it's from an "unidentified
  developer" (right-click the app → **Open**, only needed once). This is
  normal for internal tools distributed outside an app store.
- **Minor cosmetic-only exception to "fully offline":** the interface uses
  two Google Fonts (Plus Jakarta Sans, Inter) loaded from a CDN for nicer
  typography. If there's no internet the very first time you open the app,
  it simply falls back to your system's default font — nothing breaks,
  nothing is blocked, it just won't look quite as polished until you're
  next online. If you want this removed entirely so the fonts are bundled
  locally too, let me know and I can add that.
- To change the app's name, update `productName` in `package.json`.
