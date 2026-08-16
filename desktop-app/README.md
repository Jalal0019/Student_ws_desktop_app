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
├── main.js           ← creates the login + app windows, loads your site
├── preload.js         ← securely connects the login screen to main.js
├── app-ui/
│   ├── login.html       ← local password screen shown before the app opens
│   └── logo3.png         ← logo shown on the login screen
├── package.json       ← app metadata + build configuration
├── build/
│   ├── icon.png        ← app icon (source)
│   ├── icon.ico         ← Windows icon
│   └── icon.icns         ← macOS icon
└── .github/workflows/
    └── build-desktop.yml ← builds .exe and .dmg automatically on GitHub
```

## App password
Before the site loads, the app shows its own local password screen — this
is separate from Google Sign-In and from your GitHub token, and just
controls who can open the app at all.

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
  or shown in plain text), but this is still only light protection — anyone
  with the app's source files could find the password by computing hashes
  of guesses, or by editing `main.js` to skip the check entirely. It's
  meant to keep out casual users, not to replace the real security (your
  GitHub token and the instructor email check) inside the website itself.

## Important: Google Sign-In inside the app window
Google actively blocks its sign-in flow inside many embedded "app" browser
windows (it shows *"This browser or app may not be secure"*), which can
affect Electron apps like this one. To reduce the chance of that happening,
`main.js` sets the app window's user agent to look like a normal desktop
Chrome browser. This works in most cases, but isn't guaranteed by Google —
if sign-in still gets blocked after entering the app password, the safest
fallback is opening `https://jalal0019.github.io/Student_ws/` in a normal
browser (Chrome, Edge, Safari) instead of inside the app for that session.

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
