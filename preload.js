const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  queryOllama: (query) => ipcRenderer.send('query-ollama', query),
  pushOllamaResponse: (callback) => ipcRenderer.on('ollama-response', (_event, data) => callback(data)),
  pushRouter: (callback) => ipcRenderer.on('push-router', (_event, route) => callback(route)),
  saveChat: (chatHistory) => ipcRenderer.send('save-chat', chatHistory),
  quickQueryOllama: (query) => ipcRenderer.send('quick-query-ollama', query),
  closeQuickView: () => ipcRenderer.send('close-quick-view'),
  pushHistory: (callback) => ipcRenderer.on('push-history', (_event, history) => callback(history)),
  requestHistory: () => ipcRenderer.send('request-history'),
  deleteHistoryEntry: (id) => ipcRenderer.send('delete-history-entry', id),
  changeColorCodeOfHistoryEntry: (data) => ipcRenderer.send('change-color-code-of-history-entry', data),
  pushAlert: (callback) => ipcRenderer.on('alert', (_event, alert) => callback(alert)),
  stopQuery: () => ipcRenderer.send("stop-query"),
  pushStopSuccess: (callback) => ipcRenderer.on('push-stop-success', (_event, data) => callback(data))
})