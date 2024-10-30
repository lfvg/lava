import { app, BrowserWindow } from 'electron';
// include the Node.js 'path' module at the top of your file
const createWindow = () => {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      
    })
    win.loadFile('dist/index.html')
  }
  app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
      })
  })
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })