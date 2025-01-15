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
//Menu.setApplicationMenu(new Menu);

//App auto launch configuration
app.setLoginItemSettings({
  openAtLogin: true,
});

// circuvent the absence of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var mainWindow;
var quickWindow = null;
var tray;
var abortController = null
var savedHistory= {data: []}

storage.set('chat_history', savedHistory, function(error){
  if(error){
    console.log(error);
    throw error;
  }
  console.log('saved');
})
//TODO check for remove
storage.has('chat_history', function(erro, haskey){
  if(haskey){
    console.log('has key');
    storage.get('chat_history', function(error, data) {
      if(error) throw error;
      savedHistory = data.data;
      console.log('data read', savedHistory);
    });
  }
  else {
  console.log('no key');
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
      mainWindow.webContents.send("push-router", "home")
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
    storage.set('chat_history', {data: savedHistory}, function(error){
      if(error){
        console.log(error);
        throw error;
      }
      console.log('saved');
    })
    let temp = JSON.stringify(savedHistory);
    console.log(temp);
    mainWindow.webContents.send("push-history", temp);
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