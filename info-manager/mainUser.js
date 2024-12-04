const { app, BrowserWindow } = require('electron');
const path = require('path');

function createAddUserWindow(userWindow) {
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
function createEditUserWindow(userWindow,id) {
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

module.exports = {
    createAddUserWindow,
    createEditUserWindow
};
