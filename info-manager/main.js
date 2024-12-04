const { app, BrowserWindow } = require('electron');
const path = require('path');
require('./database/initDB.js');  // 先执行 A.js
const { setupIPC ,setupMainIPC} = require('./renderer/user/ipcHandlersUser.js');  // 引入事件处理模块
let mainWindow, userWindow,addUserWindow, editUserWindow;
// 创建主窗口
function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
        },
    });

    mainWindow.loadFile('./index.html');
}
// 创建用户窗口
function createUserWindow() {
    userWindow = new BrowserWindow({
        width: 750,
        height: 550,
        modal: true,
        parent: mainWindow,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        },
    });
    userWindow.loadFile('./renderer/user/indexUser.html');
    // 等待 userWindow 加载完毕后再设置 IPC
    userWindow.once('ready-to-show', () => {
        // 设置所有的 IPC 事件
        setupIPC(userWindow, createAddUserWindow, createEditUserWindow);
    });
}
// 创建新增用户窗口
function createAddUserWindow() {
    addUserWindow = new BrowserWindow({
        width: 750,
        height: 550,
        modal: true,
        parent: userWindow,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        },
    });
    addUserWindow.loadFile('./renderer/user/addUser.html');
}

// 创建编辑用户窗口
function createEditUserWindow(id) {
    editUserWindow = new BrowserWindow({
        width: 750,
        height: 550,
        modal: true,
        parent: userWindow,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        },
    });

    const editUserUrl = `file://${path.join(__dirname, 'renderer',"user", 'editUser.html')}?id=${id}`;
    editUserWindow.loadURL(editUserUrl);
}

// 应用事件
app.whenReady().then(() => {
    createMainWindow();
    // 设置所有的 IPC 事件
    setupMainIPC(createUserWindow)
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
