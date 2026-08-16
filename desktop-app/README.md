# Desktop App — Big Data AI Club Attendance & Grades

This wraps your live site (`https://jalal0019.github.io/Student_ws/`) in a
native desktop window using [Electron](https://www.electronjs.org/) — a real
`.exe` for Windows and `.dmg` for Mac, with a taskbar/dock icon, its own
window, and no browser address bar. It's a thin shell: all the actual logic
(Google sign-in, GitHub storage, attendance, grades) is exactly the same
website you already have. Updating the website automatically updates what
the app shows — there's nothing to re-release when you change the HTML files.

**Why it loads the live URL instead of bundling the files:** Google Sign-In
only works when the page is served from the real `https://jalal0019.github.io`
origin that's registered in your Google Cloud OAuth settings. A desktop app
loading local files (`file://`) can't satisfy that, so the app opens the real
website inside its own window instead of shipping copies of the HTML.

## Folder contents
```
desktop-app/
├── main.js           ← creates the app window, loads your site
├── package.json       ← app metadata + build configuration
├── build/
│   ├── icon.png        ← app icon (source)
│   ├── icon.ico         ← Windows icon
│   └── icon.icns         ← macOS icon
└── .github/workflows/
    └── build-desktop.yml ← builds .exe and .dmg automatically on GitHub
```

## Option A (recommended): let GitHub build it for you
You don't need a Windows or Mac computer for this — GitHub's own servers do
the building.

1. Create a **new repository** (e.g. `Student_ws_Desktop`) or add this
   `desktop-app/` folder plus `.github/workflows/build-desktop.yml` to your
   existing `Student_ws` repo, keeping the same folder structure shown above.
2. Push it to GitHub.
3. Go to the repo's **Actions** tab → "Build Desktop App" workflow → **Run
   workflow** (or just push a change inside `desktop-app/` — it triggers
   automatically).
4. Wait a few minutes for both jobs (`build-windows`, `build-mac`) to finish.
5. Open the finished run → scroll to **Artifacts** → download
   `windows-installer` (contains the `.exe`) and `mac-installer` (contains
   the `.dmg`).

Each run's artifacts are available for 90 days by default; re-run the
workflow any time you want fresh installers.

## Option B: build it yourself locally
Only do this if you already have the matching OS available.

**On Windows** (produces the `.exe`):
```
cd desktop-app
npm install
npm run dist:win
```
The installer appears in `desktop-app/release/`.

**On a Mac** (produces the `.dmg`):
```
cd desktop-app
npm install
npm run dist:mac
```
The `.dmg` appears in `desktop-app/release/`.

You cannot reliably build a `.dmg` from Windows or Linux, or a properly
signed `.exe` installer from a Mac — this is a limitation of the underlying
build tools, which is exactly why Option A (GitHub's own Windows and Mac
servers) is the easiest path.

## Notes
- The app is **unsigned** (no Apple Developer or Windows code-signing
  certificate attached). This means:
  - **Windows** may show a "Windows protected your PC" SmartScreen warning
    on first run — click "More info" → "Run anyway".
  - **Mac** will say the app "cannot be opened because it is from an
    unidentified developer" — right-click the app → **Open** (only needed
    the first time).
  This is normal for internal/club tools distributed outside an app store,
  and does not affect how the app functions.
- To change the app's name, update `productName` in `package.json`.
- To point the app at a different URL later, edit `SITE_URL` in `main.js`.
