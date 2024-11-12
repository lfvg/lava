const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  queryOllama: (query) => ipcRenderer.send('query-ollama', query),
  pushOllamaResponse: (callback) => ipcRenderer.on('ollama-response', (_event, data) => callback(data)),
  pushRouter: (callback) => ipcRenderer.on('push-router', (_event, route) => callback(route))
})