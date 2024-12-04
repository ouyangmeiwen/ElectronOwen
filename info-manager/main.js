const { app, BrowserWindow } = require('electron');
const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
require('./database/initDB.js');  // 先执行 A.js
const { registerUserPrivateIPC, registerUserPublicIPC } = require('./renderer/user/ipcHandlersUser.js');  // 引入事件处理模块
const { createAddUserWindow, createEditUserWindow } = require('./renderer/user/mainUser.js');  // 引入事件处理模块
let mainWindow, userWindow;
let isUserWindowIPCRegistered = false;  // 标志变量，确保 IPC 只注册一次
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
    // 只有在未注册时才注册 IPC
    if (!isUserWindowIPCRegistered) {
        registerUserPrivateIPC(userWindow, createAddUserWindow, createEditUserWindow);
        isUserWindowIPCRegistered = true;  // 注册后设置标志
    }
}
// 应用事件
app.whenReady().then(() => {
    createMainWindow();
    // 设置所有的 IPC 事件
    registerUserPublicIPC(createUserWindow)
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
});
// 监听渲染进程请求，读取本地文件
ipcMain.handle('read-json-file', (event, filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
