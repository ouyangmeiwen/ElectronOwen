const userTable = document.getElementById('user-table');

// 获取用户数据并渲染
async function loadUsers() {
    const users = await window.electronAPI.getUsers();
    userTable.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.age}</td>
            <td>${user.email}</td>
            <td>
                <button onclick="deleteUser(${user.id})">Delete</button>
                <button onclick="editUser(${user.id})">Edit</button>
            </td>
        </tr>
    `).join('');
}

// 删除用户
async function deleteUser(id) {
    await window.electronAPI.deleteUser(id);
    loadUsers();
}

// 编辑用户
function editUser(id) {
    window.location.href = `edit.html?id=${id}`;
}

loadUsers();
