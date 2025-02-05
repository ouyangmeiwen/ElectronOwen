const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('formAPI', {
    openUserWindow: () => ipcRenderer.invoke('open-user-window'),
    openAddUserWindow: () => ipcRenderer.invoke('open-add-user-window'),
    createEditUserWindow: (id) => ipcRenderer.invoke('create-edit-user-window', id),
    on: (channel, callback) => ipcRenderer.on(channel, callback),
});



contextBridge.exposeInMainWorld('userAPI', {
    getUsers: () => ipcRenderer.invoke('get-users'),
    addUser: (user) => ipcRenderer.invoke('add-user', user),
    deleteUser: (id) => ipcRenderer.invoke('delete-user', id),
    getUser: (id) => ipcRenderer.invoke('get-user', id),
    updateUser: (user) => ipcRenderer.invoke('update-user', user),
    reloadUsers: () => ipcRenderer.send('reload-users'),
    on: (channel, callback) => ipcRenderer.on(channel, callback),
});
// 通过 `contextBridge` 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('jsonAPI', {
    readJsonFile: (filePath) => ipcRenderer.invoke('read-json-file', filePath)
});