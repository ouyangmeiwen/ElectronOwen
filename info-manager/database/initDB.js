const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { app} = require('electron');

// 初始化数据库
const dbPath = path.join(__dirname, 'data.db');
if (!fs.existsSync(dbPath)) {
    const db = new sqlite3.Database(dbPath);
    const initScript = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf-8');
    db.exec(initScript, (err) => {
        if (err) {
            console.error('Database initialization failed:', err.message);
        } else {
            console.log('Database initialized successfully.');
        }
        db.close();
    });
}

function getDbPath() {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'data.db');
    console.log(dbPath);
    // 如果数据库文件不存在，从应用资源目录复制到 userData 目录
    if (!fs.existsSync(dbPath)) {
        const sourceDbPath = path.join(__dirname, 'data.db'); // 源文件路径
        fs.copyFileSync(sourceDbPath, dbPath); // 复制到 userData 目录
        console.log('Database copied to user data directory');
    }
    return dbPath
}
// 导出函数
module.exports = { getDbPath };