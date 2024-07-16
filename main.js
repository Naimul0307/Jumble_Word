const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      fullscreen: true, // Start in full-screen mode
      autoHideMenuBar: true, // Hide the menu bar
      icon: path.join(__dirname, 'icon.ico'), // Add this line for the i
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      }
    });

    mainWindow.loadFile('public/index.html');
}

app.on('ready', createWindow);

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
