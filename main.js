const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');


function createWindow() {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      fullscreen: true, // Start in full-screen mode
      autoHideMenuBar: true, // Hide the menu bar
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      }
    });

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'public', 'index.html'),  // Adjust path to your HTML file
    protocol: 'file:',
    slashes: true
  }));

  // Open DevTools (remove for production)
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
