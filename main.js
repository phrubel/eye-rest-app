const {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  Menu,
  nativeImage,
} = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let notificationWindow;
let tray;
let isQuitting = false;

// Settings file path
const settingsPath = path.join(
  app.getPath('userData'),
  'eye-rest-settings.json'
);

// Default settings
const defaultSettings = {
  workDuration: 20,
  breakDuration: 5,
  soundEnabled: true,
  autoStart: false,
  minimizeToTray: true,
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: getIconPath(),
    show: false,
    title: 'Eye Rest Reminder',
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('minimize', (event) => {
    const settings = loadSettings();
    if (settings.minimizeToTray) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  // Remove menu bar
  mainWindow.setMenuBarVisibility(false);
}

function getIconPath() {
  // Try different icon formats
  const iconPaths = [
    path.join(__dirname, 'assets', 'icon.png'),
    path.join(__dirname, 'assets', 'icon.ico'),
    path.join(__dirname, 'icon.png'),
    path.join(__dirname, 'icon.ico'),
  ];

  for (const iconPath of iconPaths) {
    if (fs.existsSync(iconPath)) {
      return iconPath;
    }
  }

  return null; // No icon found
}

function createTray() {
  const iconPath = getIconPath();
  if (!iconPath) return;

  try {
    const icon = nativeImage.createFromPath(iconPath);
    if (icon.isEmpty()) return;

    tray = new Tray(icon.resize({ width: 16, height: 16 }));

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show Eye Rest Reminder',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        },
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          isQuitting = true;
          app.quit();
        },
      },
    ]);

    tray.setToolTip('Eye Rest Reminder');
    tray.setContextMenu(contextMenu);

    tray.on('double-click', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  } catch (error) {
    console.error('Failed to create tray:', error);
  }
}

function createNotificationWindow(type, duration = 5) {
  if (notificationWindow && !notificationWindow.isDestroyed()) {
    notificationWindow.close();
  }

  notificationWindow = new BrowserWindow({
    width: 500,
    height: 350,
    resizable: false,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false,
  });

  const isBreak = type === 'break';
  const backgroundColor = isBreak ? '#4CAF50' : '#2196F3';
  const title = isBreak ? 'Time for a Break! 👁️' : ' Break is Over! 💼';
  const message = isBreak
    ? `You've been working for a while. Take a ${duration}-minute break to rest your eyes.`
    : ` Great! You've completed the breathing exercise.,
           Your break time is finished. Ready to get back to work?`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: ${backgroundColor};
          color: white;
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 20px;
          top: 0;
        left: 0;
        width: 100vw;
        }
        .container {
          max-width: 400px;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 15px;
        }
        .message {
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 20px;
          opacity: 0.95;
        }
        .timer {
          font-size: 36px;
          font-weight: bold;
          margin: 20px 0;
          font-family: 'Courier New', monospace;
        }
        .tips {
          font-size: 14px;
          opacity: 0.8;
          margin-bottom: 25px;
          font-style: italic;
        }
        .buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
        }
        button {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }
        .close-btn {
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      </style>
    </head>
    <body>
      <button class="close-btn" onclick="window.electronAPI.dismissNotification()">×</button>
      <div class="container">
        <div class="title">${title}</div>
        <div class="message">${message}</div>
        ${
          isBreak
            ? `
          <div class="timer" id="timer">${duration}:00</div>
          <div class="tips">💡 Look at something 20 feet away for 20 seconds</div>
        `
            : ''
        }
        <div class="buttons">
          <button onclick="window.electronAPI.dismissNotification()">
            ${isBreak ? 'OK' : 'Got it!'}
          </button>
          ${
            isBreak
              ? '<button onclick="window.electronAPI.skipBreak()">Skip Break</button>'
              : ''
          }
        </div>
      </div>
      
      <script>
        if (${isBreak}) {
          let timeLeft = ${duration} * 60;
          const timerEl = document.getElementById('timer');
          
          const countdown = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerEl.textContent = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
            
            if (timeLeft <= 0) {
              clearInterval(countdown);
              window.electronAPI.breakFinished();
            }
            timeLeft--;
          }, 1000);
        }
      </script>
    </body>
    </html>
  `;

  notificationWindow.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(html)}`
  );

  // Center the notification window
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  notificationWindow.setPosition(
    Math.floor((width - 500) / 2),
    Math.floor((height - 350) / 2)
  );

  notificationWindow.show();
  notificationWindow.focus();

  // Auto-close work notification after 5 seconds
  if (type === 'work') {
    setTimeout(() => {
      if (notificationWindow && !notificationWindow.isDestroyed()) {
        notificationWindow.close();
      }
    }, 5000);
  }
}

function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      return { ...defaultSettings, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  return defaultSettings;
}

function saveSettings(settings) {
  try {
    const dir = path.dirname(settingsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

// IPC handlers
ipcMain.handle('get-settings', () => {
  return loadSettings();
});

ipcMain.handle('save-settings', (event, settings) => {
  return saveSettings(settings);
});

ipcMain.handle('show-break-notification', (event, duration) => {
  createNotificationWindow('break', duration);
});

ipcMain.handle('show-work-notification', () => {
  createNotificationWindow('work');
});

ipcMain.handle('dismiss-notification', () => {
  if (notificationWindow && !notificationWindow.isDestroyed()) {
    notificationWindow.close();
  }
});

ipcMain.handle('skip-break', () => {
  if (notificationWindow && !notificationWindow.isDestroyed()) {
    notificationWindow.close();
  }
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('skip-break');
  }
});

ipcMain.handle('break-finished', () => {
  if (notificationWindow && !notificationWindow.isDestroyed()) {
    notificationWindow.close();
  }
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('break-finished');
  }
});

ipcMain.handle('close-app', () => {
  isQuitting = true;
  app.quit();
});

ipcMain.handle('minimize-app', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('show-app', () => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
});

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('activate', () => {
  if (mainWindow) {
    mainWindow.show();
  }
});
