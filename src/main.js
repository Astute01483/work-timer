const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');

// Initialize electron-store
const store = new Store();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;
let employeeInfoWindow;

// Create employee info window
const createEmployeeInfoWindow = () => {
  employeeInfoWindow = new BrowserWindow({
    width: 450,
    height: 300,
    resizable: false,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    icon: path.join(__dirname, '../assets/icons/icon.png')
  });

  employeeInfoWindow.loadFile(path.join(__dirname, 'renderer/employee-info.html'));

  // Close the employee info window when it's closed
  employeeInfoWindow.on('closed', () => {
    employeeInfoWindow = null;
  });
};

// Create main window
const createMainWindow = (employeeInfo) => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    icon: path.join(__dirname, '../assets/icons/icon.png')
  });

  // Pass employee info to the main window
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('employee-info', employeeInfo);
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));

  // Open the DevTools in development mode.
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
};

// Handle employee info submission
ipcMain.on('employee-info', (event, employeeInfo) => {
  // Store employee info
  store.set('employeeInfo', employeeInfo);
  
  // Create main window
  createMainWindow(employeeInfo);
  
  // Send ready signal to employee info window
  event.sender.send('main-window-ready');
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // First check if we have stored employee info
  const storedEmployeeInfo = store.get('employeeInfo');
  
  if (storedEmployeeInfo) {
    createMainWindow(storedEmployeeInfo);
  } else {
    createEmployeeInfoWindow();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createEmployeeInfoWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for store operations
ipcMain.handle('store-get', async (event, key) => {
  return store.get(key);
});

ipcMain.handle('store-set', async (event, key, value) => {
  store.set(key, value);
  return { success: true };
});

ipcMain.handle('store-delete', async (event, key) => {
  store.delete(key);
  return { success: true };
});
