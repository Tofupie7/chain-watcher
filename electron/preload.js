const { contextBridge, ipcRenderer } = require('electron');

// Expose secure API to renderer
contextBridge.exposeInMainWorld('chainWatcher', {
  // Credential management
  credentials: {
    get: () => ipcRenderer.invoke('credentials:get'),
    save: (creds) => ipcRenderer.invoke('credentials:save', creds),
    delete: (key) => ipcRenderer.invoke('credentials:delete', key),
  },
  // App info
  app: {
    info: () => ipcRenderer.invoke('app:info'),
  }
});
