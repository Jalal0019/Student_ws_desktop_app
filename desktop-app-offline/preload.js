const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('localData', {
  load: () => ipcRenderer.invoke('data:load'),
  save: (data) => ipcRenderer.invoke('data:save', data),
  backup: () => ipcRenderer.invoke('data:backup'),
  restore: () => ipcRenderer.invoke('data:restore'),
});

contextBridge.exposeInMainWorld('appAuth', {
  checkPassword: (password) => ipcRenderer.invoke('check-app-password', password),
});
