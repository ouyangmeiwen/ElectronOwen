const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

let mainWindow;
const db = new sqlite3.Database(path.join(__dirname, 'database', 'data.db'));

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

    mainWindow.loadFile('./renderer/index.html');
}

// 应用事件
app.whenReady().then(() => {
    require('./database/initDB'); // 初始化数据库
    createMainWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// IPC 事件监听器
ipcMain.handle('get-users', (event) => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM users', [], (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });
});

ipcMain.handle('add-user', (event, user) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO users (name, age, email) VALUES (?, ?, ?)';
        db.run(query, [user.name, user.age, user.email], function (err) {
            if (err) reject(err);
            resolve(this.lastID);
        });
    });
});

ipcMain.handle('delete-user', (event, id) => {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM users WHERE id = ?';
        db.run(query, [id], (err) => {
            if (err) reject(err);
            resolve(true);
        });
    });
});
ipcMain.handle('get-user', (event, id) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM users WHERE id = ?';
        db.get(query, [id], (err, row) => {
            if (err) reject(err);
            resolve(row);
        });
    });
});

ipcMain.handle('update-user', (event, user) => {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE users SET name = ?, age = ?, email = ? WHERE id = ?';
        db.run(query, [user.name, user.age, user.email, user.id], (err) => {
            if (err) reject(err);
            resolve(true);
        });
    });
});
