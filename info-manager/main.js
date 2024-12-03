const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

let mainWindow, addUserWindow, editUserWindow;
// 获取用户数据目录路径
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'data.db');
// 如果数据库文件不存在，从应用资源目录复制到 userData 目录
if (!fs.existsSync(dbPath)) {
    const sourceDbPath = path.join(__dirname, 'database', 'data.db'); // 源文件路径
    fs.copyFileSync(sourceDbPath, dbPath); // 复制到 userData 目录
    console.log('Database copied to user data directory');
}
// 创建 SQLite 数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log('Database opened successfully at:', dbPath);
    }
  });
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

// 创建新增用户窗口
function createAddUserWindow() {
    addUserWindow = new BrowserWindow({
        width: 750,
        height: 550,
        modal: true,
        parent: mainWindow,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        },
    });
    addUserWindow.loadFile('./renderer/addUser.html');
}

// 创建编辑用户窗口
function createEditUserWindow(id) {
    editUserWindow = new BrowserWindow({
        width: 750,
        height: 550,
        modal: true,
        parent: mainWindow,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        },
    });

    // 使用 URL 格式拼接 id 参数，确保路径格式正确
    const editUserUrl = `file://${path.join(__dirname, 'renderer', 'editUser.html')}?id=${id}`;
    editUserWindow.loadURL(editUserUrl);  // 使用 loadURL 而不是 loadFile
}

// 应用事件
app.whenReady().then(() => {
    createMainWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// IPC 事件监听器
ipcMain.handle('get-users', () => {
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

// 监听 reload-users 消息，刷新主界面的用户列表
ipcMain.on('reload-users', async () => {
    const users = await new Promise((resolve, reject) => {
        db.all('SELECT * FROM users', [], (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });

    mainWindow.webContents.send('update-users', users);
});

// 打开新增用户窗口
ipcMain.handle('open-add-user-window', () => {
    createAddUserWindow();
});
// 打开编辑用户窗口
ipcMain.handle('create-edit-user-window', (event, id) => {
    createEditUserWindow(id);
});