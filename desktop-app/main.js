const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

// The live site this desktop app wraps. Google Sign-In only works from this
// real https:// origin, so the app loads it directly rather than bundling
// local copies of the HTML files.
const SITE_URL = 'https://jalal0019.github.io/Student_ws/index.html';

function createWindow() {
  const win = new BrowserWindow({
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

  // Remove the default menu bar (File/Edit/View/...) for a cleaner app look.
  Menu.setApplicationMenu(null);

  win.loadURL(SITE_URL);

  // Open any external links (e.g. university/college links in the header)
  // in the user's normal browser instead of inside the app window.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(SITE_URL.split('/index.html')[0])) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
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
