const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 初始化数据库
const dbPath = path.join(__dirname,  'data.db');
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
