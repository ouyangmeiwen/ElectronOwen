const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getUsers: () => ipcRenderer.invoke('get-users'),
    addUser: (user) => ipcRenderer.invoke('add-user', user),
    deleteUser: (id) => ipcRenderer.invoke('delete-user', id),
    getUser: (id) => ipcRenderer.invoke('get-user', id),
    updateUser: (user) => ipcRenderer.invoke('update-user', user),
    reloadUsers: () => ipcRenderer.send('reload-users'),
    openAddUserWindow: () => ipcRenderer.invoke('open-add-user-window'),
    createEditUserWindow: (id) => ipcRenderer.invoke('create-edit-user-window', id),
    on: (channel, callback) => ipcRenderer.on(channel, callback),
});
