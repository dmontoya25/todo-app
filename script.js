// TODO: Maybe update the Font-family to something more readable

const form = document.getElementById('form');
const input = document.getElementById('input');
const todos = document.getElementById('todos');
const reset = document.getElementById('reset');
const darkModeBtn = document.getElementById('dark-mode');
const completionModal = document.getElementById('completion-modal');
const closeModalBtn = document.getElementById('close-modal');
const deleteModal = document.getElementById('delete-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const deleteTodoModal = document.getElementById('delete-todo-modal');
const confirmDeleteTodoBtn = document.getElementById('confirm-delete-todo');
const cancelDeleteTodoBtn = document.getElementById('cancel-delete-todo');
const deleteTodoText = document.getElementById('delete-todo-text');
const LOCAL_STORAGE_KEY = 'todos';
const DARK_MODE_KEY = 'darkMode';

let todoToDelete = null;


todos.addEventListener('dragover', (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(todos, e.clientY);
    const dragging = document.querySelector('.dragging');
    if (!dragging) return;
    if (afterElement == null) {
        todos.appendChild(dragging);
    } else {
        todos.insertBefore(dragging, afterElement);
    }
});

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const todoText = input.value.trim();

    if (todoText.length >= 1) {
        createTodo(todoText, false);
        input.value = '';
        saveTodos();
    }

    if (todoText === "") {
         alert('Please enter a todo')
    }
});

reset.addEventListener('click', () => {
    const todoItems = todos.querySelectorAll('li');
    if (todoItems.length === 0) {
        alert('No list to delete');
        return;
    }
    showDeleteModal();
});

function showDeleteModal() {
    if (deleteModal) {
        deleteModal.style.display = 'flex';
    }
}

function closeDeleteModal() {
    if (deleteModal) {
        deleteModal.style.display = 'none';
    }
}

function deleteAllTodos() {
    while (todos.firstChild) {
        todos.removeChild(todos.firstChild);
    }
    saveTodos();
    closeCompletionModal();
    closeDeleteModal();
}

if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', deleteAllTodos);
}

if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
}

// Close delete modal when clicking outside of it
if (deleteModal) {
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            closeDeleteModal();
        }
    });
}

function createTodo(text, completed = false) {
    const todoEl = document.createElement('li');
    todoEl.textContent = text;
    todoEl.setAttribute('draggable', 'true');

    if (completed) {
        todoEl.classList.add('completed');
    }

    todoEl.addEventListener('dragstart', () => {
        todoEl.classList.add('dragging');
    });

    todoEl.addEventListener('dragend', () => {
        todoEl.classList.remove('dragging');
        saveTodos();
    });

    let clickTimerId = null;

    todoEl.addEventListener('click', () => {
        if (clickTimerId !== null) {
            clearTimeout(clickTimerId);
            clickTimerId = null;
            // Show delete confirmation modal
            showDeleteTodoModal(todoEl);
            return;
        }

        clickTimerId = setTimeout(() => {
            clickTimerId = null;
            todoEl.classList.toggle('completed');
            saveTodos();
            checkListCompletion();
        }, 240);
    });

    todos.appendChild(todoEl);
}

function saveTodos() {
    const todoItems = [...todos.querySelectorAll('li')].map((item) => ({
        text: item.textContent,
        completed: item.classList.contains('completed')
    }));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todoItems));
}



function loadTodos() {
    const savedTodos = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!savedTodos) return;

    try {
        const parsed = JSON.parse(savedTodos);
        if (Array.isArray(parsed)) {
            parsed.forEach(({ text, completed }) => {
                if (typeof text === 'string') {
                    createTodo(text, Boolean(completed));
                }
            });
        }
    } catch (error) {
        console.error('Failed to parse saved todos', error);
    }
}

loadTodos();

function checkListCompletion() {
    const todoItems = document.querySelectorAll('.todos li');
    if (todoItems.length === 0) {
        closeCompletionModal();
        return; // No todos, nothing to check
    }
    
    const allCompleted = Array.from(todoItems).every(todo => 
        todo.classList.contains('completed')
    );
    
    if (allCompleted) {
        showCompletionModal();
    } else {
        closeCompletionModal();
    }
}

function showCompletionModal() {
    if (completionModal) {
        completionModal.style.display = 'flex'
    }
}

function closeCompletionModal() {
    if (completionModal) {
        completionModal.style.display = 'none'
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem(DARK_MODE_KEY, isDark);
    darkModeBtn.textContent = isDark ? 'Light Mode' : 'Dark Mode';
}

function loadDarkMode() {
    const savedDarkMode = localStorage.getItem(DARK_MODE_KEY);
    if (savedDarkMode === 'true') {
        document.body.classList.add('dark');
        darkModeBtn.textContent = 'Light Mode'
    }
}

darkModeBtn.addEventListener('click', toggleDarkMode);
loadDarkMode();

// Modal close functionality
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeCompletionModal);
}

// Close modal when clicking outside of it
if (completionModal) {
    completionModal.addEventListener('click', (e) => {
        if (e.target === completionModal) {
            closeCompletionModal();
        }
    });
}

// Single todo delete modal functions
function showDeleteTodoModal(todoElement) {
    todoToDelete = todoElement;
    const todoText = todoElement.textContent;
    if (deleteTodoText) {
        deleteTodoText.textContent = `Are you sure you want to delete "${todoText}"? This action cannot be undone.`;
    }
    if (deleteTodoModal) {
        deleteTodoModal.style.display = 'flex';
    }
}

function closeDeleteTodoModal() {
    todoToDelete = null;
    if (deleteTodoModal) {
        deleteTodoModal.style.display = 'none';
    }
}

function confirmDeleteTodo() {
    if (todoToDelete) {
        todoToDelete.remove();
        saveTodos();
        checkListCompletion();
        closeDeleteTodoModal();
    }
}

// Event listeners for single todo delete modal
if (confirmDeleteTodoBtn) {
    confirmDeleteTodoBtn.addEventListener('click', confirmDeleteTodo);
}

if (cancelDeleteTodoBtn) {
    cancelDeleteTodoBtn.addEventListener('click', closeDeleteTodoModal);
}

// Close single todo delete modal when clicking outside of it
if (deleteTodoModal) {
    deleteTodoModal.addEventListener('click', (e) => {
        if (e.target === deleteTodoModal) {
            closeDeleteTodoModal();
        }
    });
}

if (!todos) {
    alert('No todo list found!')
}
