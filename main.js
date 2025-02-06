//Prevent app to start during Windows installation
import squirrelStartup from 'electron-squirrel-startup'
if (squirrelStartup) { app.quit();}

import { app, BrowserWindow, ipcMain, Menu, Tray, globalShortcut, screen } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import {v4 as uuidv4} from 'uuid';
import  storage  from 'electron-json-storage';

//Set empty menu, prevent access to developer tools
Menu.setApplicationMenu(new Menu);

//App auto launch configuration
app.setLoginItemSettings({
  openAtLogin: true,
});

// circuvent the absence of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var mainWindow = null;
var quickWindow = null;
var tray;
var abortController = null
var savedHistory= []

const singleInstanceLock = app.requestSingleInstanceLock();


if (!singleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory, additionalData) => {
    createWindow();
  })
}

//TODO check for remove
storage.has('chat_history', function(erro, haskey){
  if(haskey){
    storage.get('chat_history', function(error, data) {
      if(error) throw error;
      savedHistory = data.data;
    });
  }
  else {
  }
});

// Electron functions

// Create the mainWindow
const createWindow = () => {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      title: "Lava",
      autoHideMenuBar: true,
      icon: path.join(__dirname, 'src', 'assets', 'volcano.png'),
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })
    mainWindow.loadFile('dist/index.html')
    // Calls a function in Vue that forces a router change
    mainWindow.webContents.on('did-finish-load', function () {
      mainWindow.webContents.send("push-router", "home");
      mainWindow.webContents.send("push-history", JSON.stringify(savedHistory));
    })
  }
const createTray = () => {
  tray = new Tray( path.join(__dirname, 'src', 'assets', 'svolcano.png'))
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Close', type: 'normal', click: () => {
      app.quit()
    }}
  ])
  tray.setToolTip('Lava')
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
  ipcMain.on('request-history', (event) => {
    let temp = JSON.stringify(savedHistory.data);
    mainWindow.webContents.send("push-history", temp);
  })

  ipcMain.on('query-ollama', (event, query) => {
    callLLM(query)
  })

  ipcMain.on('save-chat', (event, sChatHistory) => {
    //parsear o chat
    let currentChat = JSON.parse(sChatHistory);
    let indexInHistory = savedHistory.findIndex(function (chatInHistory) {
      return chatInHistory.id === currentChat.id;
    })
    if (indexInHistory === -1) {
      savedHistory.unshift(currentChat);
    }
    else { 
      savedHistory[indexInHistory] = currentChat;
    }
    storeHistory(savedHistory);
    pushHistory(savedHistory);
  })

  ipcMain.on('quick-query-ollama', (event, query) => {
    quickCallLLM(query)
    quickWindow.setBounds({ height: 528 })
  })

  ipcMain.on('close-quick-view', () => {
    quickWindow.close();
    quickWindow = null;
  })

  ipcMain.on('delete-history-entry', (event, id) => {
    savedHistory = savedHistory.filter(function (element){
      return element.id != id;
    })
    storeHistory(savedHistory);
    pushHistory(savedHistory);
  })

  ipcMain.on('change-color-code-of-history-entry', (event, data) => {
    let objData = JSON.parse(data);
    let indexInHistory = savedHistory.findIndex(function(element){
      return element.id === objData.id;
    })
    savedHistory[indexInHistory].colorCode = objData.color;
    storeHistory(savedHistory);
    pushHistory(savedHistory);
  })
  // General functions

  const storeHistory = (history) =>  {
    storage.set('chat_history', {data: history}, function(error){
      if(error){
        throw error;
      }
    })
  }

  const pushHistory = (history) => {
    let temp = JSON.stringify(history);
    mainWindow.webContents.send("push-history", temp);
  } 

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
        if (quickWindow != null) {
          quickWindow.webContents.send("ollama-response", data)
        }
      })
    }
  }