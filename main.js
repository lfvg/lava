import { app, BrowserWindow, ipcMain, Menu, Tray, globalShortcut, screen } from 'electron';
import squirrelStartup from 'electron-squirrel-startup'
import path from 'node:path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import {v4 as uuidv4} from 'uuid';
import fs from 'fs';

//Prevent app to start during Windows installation
if (squirrelStartup) { app.quit();}

// circuvent the absence of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var mainWindow;
var quickWindow = null;
var tray;
var abortController = null
//TODO check for remove
var savedHistory = [];
// Electron functions

// Create the mainWindow
const createWindow = () => {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      title: "Lava",
      autoHideMenuBar: true,
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

  ipcMain.on('save-chat', (event, sChatHistory) => {
    var chatHistory = JSON.parse(sChatHistory);
    let fileName = chatHistory.file === '' ? uuidv4() : chatHistory.file;
    if(chatHistory.name === '') {
      chatHistory.name = chatHistory.messages[0].content;
    }
    savedHistory.push({
      name: chatHistory.name,
      file: fileName
    });
    let savedHistoryString = JSON.stringify(savedHistory, null, 2);
    fs.writeFile('./src/savedHistory', savedHistoryString, (err) => {
      if (err) throw err;
    console.log('Data written to file');
    });
    console.log('sucesso?');
  })

  ipcMain.on('quick-query-ollama', (event, query) => {
    quickCallLLM(query)
    quickWindow.setBounds({ height: 528 })
  })

  ipcMain.on('close-quick-view', () => {
    quickWindow.close();
    quickWindow = null;
  })
  // General functions


  const handleQuickPage = () => {
    if(quickWindow === null) {
      //getCursorScreenPoint is broken on linux
      const currentDisplay = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());

      const displayDimensions = currentDisplay.workAreaSize;

      const monitorHeight = displayDimensions.height;
      const monitorWidth = displayDimensions.width;
      const quickViewWindowPositionY = Math.max(Math.round(monitorHeight/2)-200,0);
      const quickViewWindowPositionX = Math.round(monitorWidth/2)-400; 
      quickWindow = new BrowserWindow({
        width: 800,
        height: 96,
        y: quickViewWindowPositionY,
        x: quickViewWindowPositionX,
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
        if (abortController != null)
          abortController.abort();
        abortController = null;
        quickWindow.close()
        quickWindow = null
      })
    }
    else {
      quickWindow.close();
      quickWindow = null;
    }
  }
  /*
   * HTTP communication with Ollama, this can't run on the renderer thread
   */
  const callLLM = async (query) => {
    var querySuccess = true;
    let messages = JSON.parse(query);
    const response = await axios.post("http://localhost:11434/api/chat", {
      model: "llama3.2",
      messages: messages
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

  const quickCallLLM = async (query) => {
    var querySuccess = true;
    let messages = JSON.parse(query);
    abortController = new AbortController();

    const response = await axios.post("http://localhost:11434/api/chat", {
      model: "llama3.2",
      messages: messages,
    }, {
      responseType: 'stream',
      signal: abortController.signal,
    }).catch(function (error){
      querySuccess = false;
    })

    if(querySuccess) {
      const stream = response.data
      stream.on('data', data => {
        data = data.toString()
        //console.log(data);
        if (quickWindow != null) {
          quickWindow.webContents.send("ollama-response", data)
        }
      })
    }
  }