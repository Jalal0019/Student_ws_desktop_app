const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(app.getPath('userData'), 'attendance-data.json');

const EMPTY_DATA = { courses: [], students: [], attendance: {}, grades: {} };

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

function loadDataFromDisk() {
  try {
    if (!fs.existsSync(DATA_FILE)) return EMPTY_DATA;
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      courses: parsed.courses || [],
      students: parsed.students || [],
      attendance: parsed.attendance || {},
      grades: parsed.grades || {},
    };
  } catch (e) {
    console.error('Failed to read local data file, starting empty:', e);
    return EMPTY_DATA;
  }
}

function saveDataToDisk(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

ipcMain.handle('data:load', () => loadDataFromDisk());

ipcMain.handle('data:save', (event, data) => {
  saveDataToDisk(data);
  return true;
});

// Export a copy of the data file anywhere the user picks (USB drive, another
// folder, etc.) — useful for backups or moving data to another computer.
ipcMain.handle('data:backup', async () => {
  const win = BrowserWindow.getFocusedWindow();
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: 'Save a backup copy',
    defaultPath: `attendance-backup-${new Date().toISOString().slice(0, 10)}.json`,
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });
  if (canceled || !filePath) return { ok: false };
  fs.copyFileSync(DATA_FILE, filePath);
  return { ok: true, filePath };
});

// Import a previously exported backup file, replacing all current data.
ipcMain.handle('data:restore', async () => {
  const win = BrowserWindow.getFocusedWindow();
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    title: 'Restore from a backup file',
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile'],
  });
  if (canceled || !filePaths[0]) return { ok: false };
  const raw = fs.readFileSync(filePaths[0], 'utf-8');
  const parsed = JSON.parse(raw);
  saveDataToDisk(parsed);
  return { ok: true, data: loadDataFromDisk() };
});

let mainWin = null;

// Called from login.html when the user submits a password.
ipcMain.handle('check-app-password', (event, password) => {
  const ok = checkPassword(password);
  if (ok && mainWin) {
    mainWin.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  }
  return ok;
});

function createWindow() {
  mainWin = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    title: 'Big Data AI Club — Attendance & Grades (Offline)',
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
  mainWin.loadFile(path.join(__dirname, 'renderer', 'login.html'));
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
