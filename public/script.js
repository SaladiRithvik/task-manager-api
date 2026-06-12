const API_BASE = '/api/tasks';

let currentTasks = [];

const errorMessage = document.getElementById('error-message');
const taskForm = document.getElementById('task-form');
const taskListBody = document.getElementById('task-list-body');
const filterStatus = document.getElementById('filter-status');
const filterPriority = document.getElementById('filter-priority');
const sortBy = document.getElementById('sort-by');

const STATUS_ORDER = { todo: 0, in_progress: 1, done: 2 };
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

const newTaskBtn = document.getElementById('new-task-btn');
const createFormContainer = document.getElementById('create-form-container');

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
    renderTasks(getSortedTasks());
  } catch (err) {
    showError('Something went wrong. Please try again.');
  }
}

function getSortedTasks() {
  const tasks = [...currentTasks];

  switch (sortBy.value) {
    case 'due_date':
      return tasks.sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.localeCompare(b.due_date);
      });
    case 'status':
      return tasks.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
    case 'priority':
      return tasks.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    default:
      return tasks;
  }
}

function renderTasks(tasks) {
  taskListBody.innerHTML = '';

  if (tasks.length === 0) {
    taskListBody.innerHTML = '<p class="empty-state">No tasks yet — add one to get started.</p>';
    return;
  }

  tasks.forEach((task) => {
    const note = document.createElement('div');
    note.className = `note priority-${task.priority}`;
    note.innerHTML = `
      <div class="note-header">
        <span class="badge status-${task.status}">${task.status.replace('_', ' ')}</span>
        <span class="badge priority-${task.priority}">${task.priority}</span>
      </div>
      <h3 class="note-title">${escapeHtml(task.title)}</h3>
      <p class="note-description">${escapeHtml(task.description || '')}</p>
      ${task.due_date
        ? `<p class="note-due">Due ${task.due_date}</p>`
        : '<p class="note-due note-due-empty">No due date set</p>'}
      <div class="note-actions">
        <button class="btn btn-icon btn-edit" data-action="edit" data-id="${task.id}" aria-label="Edit task" title="Edit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
          </svg>
        </button>
        <button class="btn btn-icon btn-danger" data-action="delete" data-id="${task.id}" aria-label="Delete task" title="Delete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 6h18"></path>
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    `;
    taskListBody.appendChild(note);
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
}

function closeEditForm() {
  editFormContainer.classList.add('hidden');
  editForm.reset();
}

function openCreateForm() {
  createFormContainer.classList.remove('hidden');
}

function closeCreateForm() {
  createFormContainer.classList.add('hidden');
  taskForm.reset();
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

    closeCreateForm();
    await loadTasks(getActiveFilters());
  } catch (err) {
    showError('Something went wrong. Please try again.');
  }
});

newTaskBtn.addEventListener('click', () => {
  clearError();
  openCreateForm();
});

document.getElementById('task-form-cancel').addEventListener('click', () => {
  closeCreateForm();
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
sortBy.addEventListener('change', () => renderTasks(getSortedTasks()));

loadTasks();
