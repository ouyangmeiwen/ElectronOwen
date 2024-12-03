const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getUsers: () => ipcRenderer.invoke('get-users'),
    addUser: (user) => ipcRenderer.invoke('add-user', user),
    deleteUser: (id) => ipcRenderer.invoke('delete-user', id),
    getUserById: (id) => ipcRenderer.invoke('get-user', id),
    updateUser: (user) => ipcRenderer.invoke('update-user', user),
});
