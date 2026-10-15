const userForm = document.getElementById("user-form");
const userSelect = document.getElementById("user-select");
const todoForm = document.getElementById("todo-form");
const todoList = document.getElementById("todo-list");
const empty = document.getElementById("empty");

const USER_KEY = "todoapp.userId";

async function api(url, options) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) {
    const details = Array.isArray(data.issues)
      ? data.issues.map((issue) => issue.message).join("\n")
      : data.error;
    throw new Error(details || "Request failed");
  }
  return data;
}

function currentUserId() {
  return Number(userSelect.value);
}

async function loadUsers() {
  const users = await api("/api/users");
  const saved = Number(localStorage.getItem(USER_KEY));
  userSelect.innerHTML = "";
  if (users.length === 0) {
    userSelect.innerHTML = '<option value="">Add a user first</option>';
    return;
  }
  for (const user of users) {
    const option = document.createElement("option");
    option.value = user.id;
    option.textContent = `${user.username} (${user.email})`;
    userSelect.appendChild(option);
  }
  if (users.some((u) => u.id === saved)) {
    userSelect.value = String(saved);
  }
}

async function loadTodos() {
  const userId = currentUserId();
  todoList.innerHTML = "";
  if (!userId) {
    empty.classList.remove("hidden");
    return;
  }
  const todos = await api(`/api/todos?user_id=${userId}`);
  empty.classList.toggle("hidden", todos.length > 0);
  for (const todo of todos) {
    const li = document.createElement("li");
    li.className = `todo${todo.completed ? " done" : ""}`;
    li.innerHTML = `
      <input type="checkbox" ${todo.completed ? "checked" : ""} data-id="${todo.id}" />
      <div>
        <p class="todo-title">${escapeHtml(todo.title)}</p>
        ${todo.description ? `<p class="todo-desc">${escapeHtml(todo.description)}</p>` : ""}
        <p class="todo-meta">${new Date(todo.created_at).toLocaleString()}</p>
      </div>
      <button class="ghost" type="button" data-delete="${todo.id}">Delete</button>
    `;
    todoList.appendChild(li);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

userForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const user = await api("/api/users", {
      method: "POST",
      body: JSON.stringify({
        username: document.getElementById("username").value,
        email: document.getElementById("email").value,
      }),
    });
    userForm.reset();
    localStorage.setItem(USER_KEY, String(user.id));
    await loadUsers();
    await loadTodos();
  } catch (err) {
    alert(err.message);
  }
});

userSelect.addEventListener("change", async () => {
  localStorage.setItem(USER_KEY, userSelect.value);
  await loadTodos();
});

todoForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const userId = currentUserId();
  if (!userId) {
    alert("Add and select a user first.");
    return;
  }
  try {
    await api("/api/todos", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
      }),
    });
    todoForm.reset();
    await loadTodos();
  } catch (err) {
    alert(err.message);
  }
});

todoList.addEventListener("change", async (event) => {
  const checkbox = event.target.closest("input[type=checkbox]");
  if (!checkbox) return;
  try {
    await api(`/api/todos/${checkbox.dataset.id}`, {
      method: "PATCH",
      body: JSON.stringify({ completed: checkbox.checked }),
    });
    await loadTodos();
  } catch (err) {
    alert(err.message);
  }
});

todoList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-delete]");
  if (!button) return;
  try {
    await api(`/api/todos/${button.dataset.delete}`, { method: "DELETE" });
    await loadTodos();
  } catch (err) {
    alert(err.message);
  }
});

(async function init() {
  try {
    await loadUsers();
    await loadTodos();
  } catch (err) {
    alert(err.message);
  }
})();
