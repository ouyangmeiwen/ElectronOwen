const { ipcMain } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const { getDbPath } = require('../../database/initDB.js');

// 获取数据库连接
const db = new sqlite3.Database(getDbPath(), (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Database opened successfully');
    }
});

// 注册所有的 IPC 事件处理函数
function setupIPC(userWindow, createAddUserWindow, createEditUserWindow) {


    // 添加用户
    ipcMain.handle('add-user', (event, user) => {
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO users (name, age, email) VALUES (?, ?, ?)';
            db.run(query, [user.name, user.age, user.email], function (err) {
                if (err) reject(err);
                resolve(this.lastID);
            });
        });
    });

    // 删除用户
    ipcMain.handle('delete-user', (event, id) => {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM users WHERE id = ?';
            db.run(query, [id], (err) => {
                if (err) reject(err);
                resolve(true);
            });
        });
    });

    // 获取单个用户信息
    ipcMain.handle('get-user', (event, id) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM users WHERE id = ?';
            db.get(query, [id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    });

    // 更新用户信息
    ipcMain.handle('update-user', (event, user) => {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE users SET name = ?, age = ?, email = ? WHERE id = ?';
            db.run(query, [user.name, user.age, user.email, user.id], (err) => {
                if (err) reject(err);
                resolve(true);
            });
        });
    });

    // 监听刷新用户列表
    ipcMain.on('reload-users', async () => {
        const users = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM users', [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });

        // 更新主窗口的用户数据
        if (userWindow && userWindow.webContents) {
            userWindow.webContents.send('update-users', users);
        } else {
            console.error('userWindow is not available');
        }
    });
    // 打开新增用户窗口
    ipcMain.handle('open-add-user-window', () => {
        createAddUserWindow(userWindow);
    });

    // 打开编辑用户窗口
    ipcMain.handle('create-edit-user-window', (event, id) => {
        createEditUserWindow(userWindow,id);
    });
}
// 注册所有的 IPC 事件处理函数
function setupMainIPC(createUserWindow) {
    // 打开用户窗口
    ipcMain.handle('open-user-window', () => {
        createUserWindow();
    });
    // 获取所有用户
    ipcMain.handle('get-users', () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM users', [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    });
}
module.exports = {
    setupIPC,
    setupMainIPC
};
