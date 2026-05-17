const { app, BrowserWindow, ipcMain, safeStorage } = require('electron');
const path = require('path');
const fs = require('fs');

// Credential storage path
const CRED_PATH = path.join(app.getPath('userData'), 'credentials.enc');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: '#0a0d13',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0c1017',
      symbolColor: '#5a6577',
      height: 36
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
    },
    icon: path.join(__dirname, '..', 'src', 'assets', 'icon.png'),
    show: false
  });

  // Load the Vite dev server in development
  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  // Enable F12 to open DevTools
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12') {
      mainWindow.webContents.toggleDevTools();
    }
    // Also support Ctrl+Shift+I
    if (input.control && input.shift && input.key === 'I') {
      mainWindow.webContents.toggleDevTools();
    }
  });

  // Show window when ready to prevent flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// ============ SECURE CREDENTIAL STORAGE ============

function loadCredentials() {
  try {
    if (fs.existsSync(CRED_PATH)) {
      const encrypted = fs.readFileSync(CRED_PATH);
      const decrypted = safeStorage.decryptString(encrypted);
      return JSON.parse(decrypted);
    }
  } catch (err) {
    console.error('Failed to load credentials:', err.message);
  }
  return {};
}

function saveCredentials(creds) {
  try {
    const json = JSON.stringify(creds);
    const encrypted = safeStorage.encryptString(json);
    fs.writeFileSync(CRED_PATH, encrypted);
    return true;
  } catch (err) {
    console.error('Failed to save credentials:', err.message);
    return false;
  }
}

// IPC handlers for credential management
ipcMain.handle('credentials:get', () => {
  return loadCredentials();
});

ipcMain.handle('credentials:save', (event, creds) => {
  return saveCredentials(creds);
});

ipcMain.handle('credentials:delete', (event, key) => {
  const creds = loadCredentials();
  delete creds[key];
  return saveCredentials(creds);
});

// IPC handler for app info
ipcMain.handle('app:info', () => {
  return {
    version: app.getVersion(),
    userData: app.getPath('userData'),
    isPackaged: app.isPackaged
  };
});
