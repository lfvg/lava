import { app, BrowserWindow, ipcMain, Menu, Tray, globalShortcut } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'url';
import axios from 'axios';

// circuvent the absence of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var mainWindow;
var quickWindow = null;
var tray;
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
    // Calls a function in Vue that forces a router change
    mainWindow.webContents.on('did-finish-load', function () {
      mainWindow.webContents.send("push-router", "home")
    })
  }
const createTray = () => {
  tray = new Tray('src/assets/brain.ico')
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Close', type: 'normal', click: () => {
      app.quit()
    }}
  ])
  tray.setToolTip('Lava.')
  tray.setContextMenu(contextMenu)
  tray.addListener("click", () => {
    tray.popUpContextMenu()
  })
}
  // Electron lifecycle

  // Create Window
  app.whenReady().then(() => {
    globalShortcut.register('Control+Space', () => {
      handleQuickPage()
    })
    createWindow()
    createTray()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
    
  })

  // End program logic
  app.on('window-all-closed', () => {
    //if (process.platform !== 'darwin') app.quit()
  })

  // Inter proccess communication

  ipcMain.on('query-ollama', (event, query) => {
    callLLM(query)
  })

  // General functions


  const handleQuickPage = () => {
    if(quickWindow === null) {
      quickWindow = new BrowserWindow({
        width: 800,
        height: 96,
        frame: false,
        transparent: true,
        resizable: false,
        webPreferences: {
          preload: path.join(__dirname, 'preload.js')
        }
      })
      quickWindow.loadFile('dist/index.html')
       // Calls a function in Vue that forces a router change
      quickWindow.webContents.on('did-finish-load', function () {
        quickWindow.webContents.send("push-router", "quick")
      })
      quickWindow.on('blur', () => {
        quickWindow.close()
        quickWindow = null
      })
    }
    else {

    }
  }
  /*
   * HTTP communication with Ollama, this can't run on the renderer thread
   */
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
        mainWindow.webContents.send("ollama-response", data)
      })
    }
  }