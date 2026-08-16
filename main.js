const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const crypto = require('crypto');
const path = require('path');

// The live site this desktop app wraps once unlocked.
const SITE_URL = 'https://jalal0019.github.io/Student_ws/index.html';

// ---------------------------------------------------------------------
// App password
// ---------------------------------------------------------------------
// Checked as a SHA-256 hash, not plain text. Default password: "bigdata2026"
//
// To set your own password: run this in a terminal with Node installed,
// and paste the printed hash into APP_PASSWORD_HASH below.
//
//   node -e "console.log(require('crypto').createHash('sha256').update('YOUR_NEW_PASSWORD').digest('hex'))"
//
// Leave APP_PASSWORD_HASH as null to keep using the default password.
const APP_PASSWORD_HASH = null;
const DEFAULT_PASSWORD_HASH = crypto.createHash('sha256').update('bigdata2026').digest('hex');

function checkPassword(candidate) {
  const candidateHash = crypto.createHash('sha256').update(candidate || '').digest('hex');
  const expected = APP_PASSWORD_HASH || DEFAULT_PASSWORD_HASH;
  return candidateHash === expected;
}

// ---------------------------------------------------------------------
// Windows
// ---------------------------------------------------------------------
let loginWin = null;
let mainWin = null;

// Google blocks its sign-in flow inside many embedded/app browser windows
// by detecting the user agent. Presenting a normal desktop Chrome user
// agent avoids that block in most cases.
const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

function createLoginWindow() {
  loginWin = new BrowserWindow({
    width: 420,
    height: 480,
    resizable: false,
    title: 'Sign in — BigData Attendance',
    icon: path.join(__dirname, 'build', 'icon.png'),
    backgroundColor: '#0b1220',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  Menu.setApplicationMenu(null);
  loginWin.loadFile(path.join(__dirname, 'app-ui', 'login.html'));
}

function createMainWindow() {
  mainWin = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    title: 'Big Data AI Club — Attendance & Grades',
    icon: path.join(__dirname, 'build', 'icon.png'),
    backgroundColor: '#0b1220',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWin.webContents.setUserAgent(CHROME_UA);
  mainWin.loadURL(SITE_URL);

  mainWin.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(SITE_URL.split('/index.html')[0])) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
}

// Called from the login screen (via preload.js) when the user submits a
// password. Returns true/false to the renderer, and opens the main app
// window on success.
ipcMain.handle('check-app-password', (event, password) => {
  const ok = checkPassword(password);
  if (ok) {
    if (loginWin) { loginWin.close(); loginWin = null; }
    createMainWindow();
  }
  return ok;
});

app.whenReady().then(() => {
  createLoginWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createLoginWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
