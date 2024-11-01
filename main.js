import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'url';

// circuvent the absence of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var mainWindow;

// Electron functions

// Create the mainWindow
const createWindow = () => {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })
    mainWindow.loadFile('dist/index.html')
  }

  // Electron lifecycle

  // Create Window
  app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
      })
  })

  // End program logic
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })