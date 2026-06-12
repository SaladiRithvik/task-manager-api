const API_BASE = '/api/tasks';

let currentTasks = [];

const errorMessage = document.getElementById('error-message');
const taskForm = document.getElementById('task-form');
const taskListBody = document.getElementById('task-list-body');
const filterStatus = document.getElementById('filter-status');
const filterPriority = document.getElementById('filter-priority');

const editFormContainer = document.getElementById('edit-form-container');
const editForm = document.getElementById('edit-form');
const editId = document.getElementById('edit-id');
const editTitle = document.getElementById('edit-title');
const editDescription = document.getElementById('edit-description');
const editStatus = document.getElementById('edit-status');
const editPriority = document.getElementById('edit-priority');
const editDueDate = document.getElementById('edit-due_date');

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
}

function clearError() {
  errorMessage.textContent = '';
  errorMessage.classList.add('hidden');
}

async function parseErrorResponse(res) {
  try {
    const data = await res.json();
    if (Array.isArray(data.errors)) {
      return data.errors.join(', ');
    }
    if (data.error) {
      return data.error;
    }
  } catch (err) {
    // response body wasn't JSON — fall through to generic message
  }
  return 'Something went wrong. Please try again.';
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function getActiveFilters() {
  return {
    status: filterStatus.value,
    priority: filterPriority.value,
  };
}

async function loadTasks(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);

  const query = params.toString();
  const url = query ? `${API_BASE}?${query}` : API_BASE;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      showError(await parseErrorResponse(res));
      return;
    }
    currentTasks = await res.json();
    renderTasks(currentTasks);
  } catch (err) {
    showError('Something went wrong. Please try again.');
  }
}

function renderTasks(tasks) {
  taskListBody.innerHTML = '';

  tasks.forEach((task) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(task.title)}</td>
      <td>${escapeHtml(task.description || '—')}</td>
      <td><span class="badge status-${task.status}">${task.status.replace('_', ' ')}</span></td>
      <td><span class="badge priority-${task.priority}">${task.priority}</span></td>
      <td>${task.due_date || '—'}</td>
      <td>
        <button class="btn btn-edit" data-action="edit" data-id="${task.id}">Edit</button>
        <button class="btn btn-danger" data-action="delete" data-id="${task.id}">Delete</button>
      </td>
    `;
    taskListBody.appendChild(row);
  });
}

function openEditForm(id) {
  const task = currentTasks.find((t) => String(t.id) === String(id));
  if (!task) {
    showError('Task not found');
    return;
  }

  editId.value = task.id;
  editTitle.value = task.title;
  editDescription.value = task.description || '';
  editStatus.value = task.status;
  editPriority.value = task.priority;
  editDueDate.value = task.due_date || '';

  editFormContainer.classList.remove('hidden');
  editFormContainer.scrollIntoView({ behavior: 'smooth' });
}

function closeEditForm() {
  editFormContainer.classList.add('hidden');
  editForm.reset();
}

taskForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearError();

  const payload = {
    title: taskForm.title.value.trim(),
    description: taskForm.description.value.trim() || null,
    status: taskForm.status.value,
    priority: taskForm.priority.value,
    due_date: taskForm.due_date.value || null,
  };

  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      showError(await parseErrorResponse(res));
      return;
    }

    taskForm.reset();
    await loadTasks(getActiveFilters());
  } catch (err) {
    showError('Something went wrong. Please try again.');
  }
});

taskListBody.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const { id, action } = button.dataset;

  if (action === 'edit') {
    clearError();
    openEditForm(id);
    return;
  }

  if (action === 'delete') {
    clearError();
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        showError(await parseErrorResponse(res));
        return;
      }
      await loadTasks(getActiveFilters());
    } catch (err) {
      showError('Something went wrong. Please try again.');
    }
  }
});

editForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearError();

  const id = editId.value;
  const payload = {
    title: editTitle.value.trim(),
    description: editDescription.value.trim() || null,
    status: editStatus.value,
    priority: editPriority.value,
    due_date: editDueDate.value || null,
  };

  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      showError(await parseErrorResponse(res));
      return;
    }

    closeEditForm();
    await loadTasks(getActiveFilters());
  } catch (err) {
    showError('Something went wrong. Please try again.');
  }
});

document.getElementById('edit-cancel').addEventListener('click', () => {
  closeEditForm();
});

filterStatus.addEventListener('change', () => loadTasks(getActiveFilters()));
filterPriority.addEventListener('change', () => loadTasks(getActiveFilters()));

loadTasks();
