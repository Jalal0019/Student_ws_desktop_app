const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('appAuth', {
  checkPassword: (password) => ipcRenderer.invoke('check-app-password', password),
});
