import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'url';
import axios from 'axios';

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

  // Inter proccess communication

  ipcMain.on('query-ollama', (event, query) => {
    callLLM(query)
  })

  // General functions

  const callLLM = async (query) => {
    var querySuccess = true;
    
    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "llama3.2",
      prompt: query
    }, {
      responseType: 'stream'
    }).catch(function (error){
      querySuccess = false;
    })

    if(querySuccess) {
      const stream = response.data
      stream.on('data', data => {
        data = data.toString()
        //TODO send back to renderer thread
      })
    }
  }