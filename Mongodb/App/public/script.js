const form = document.getElementById('user-form');
const userTable = document.querySelector('#user-table tbody');
const replicaTable = document.querySelector('#replica-table tbody');

// Load users
async function loadUsers() {
  const res = await fetch('/api/users');
  const users = await res.json();
  userTable.innerHTML = '';
  users.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deleteUser('${u._id}')">Delete</button>
      </td>`;
    userTable.appendChild(tr);
  });
}

// Add user
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  if (!name || !email) return;
  await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email })
  });
  form.reset();
  loadUsers();
});

// Delete user
async function deleteUser(id) {
  await fetch(`/api/users/${id}`, { method: 'DELETE' });
  loadUsers();
}

// Load replica status
document.getElementById('load-status').addEventListener('click', async () => {
  const res = await fetch('/api/replica-status');
  const data = await res.json();
  replicaTable.innerHTML = '';
  data.members.forEach(m => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${m.name}</td>
      <td>${m.stateStr}</td>
      <td>${m.health === 1 ? '✅ Healthy' : '❌ Unhealthy'}</td>`;
    replicaTable.appendChild(tr);
  });
});

// Initial load
loadUsers();
