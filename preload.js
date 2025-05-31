const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Settings management
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),

  // Notification management
  showBreakNotification: (duration) =>
    ipcRenderer.invoke('show-break-notification', duration),
  showWorkNotification: () => ipcRenderer.invoke('show-work-notification'),
  dismissNotification: () => ipcRenderer.invoke('dismiss-notification'),
  skipBreak: () => ipcRenderer.invoke('skip-break'),
  breakFinished: () => ipcRenderer.invoke('break-finished'),

  // Window management
  closeApp: () => ipcRenderer.invoke('close-app'),
  minimizeApp: () => ipcRenderer.invoke('minimize-app'),
  showApp: () => ipcRenderer.invoke('show-app'),

  // Event listeners
  onSkipBreak: (callback) => {
    ipcRenderer.on('skip-break', () => callback());
  },
  onBreakFinished: (callback) => {
    ipcRenderer.on('break-finished', () => callback());
  },

  // Remove event listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
});
