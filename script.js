
// DOM Elements - grouped by functionality
const elements = {
    // Form elements
    form: document.getElementById('form'),
    input: document.getElementById('input'),
    todos: document.getElementById('todos'),
    reset: document.getElementById('reset'),
    
    // Modals
    completionModal: document.getElementById('completion-modal'),
    deleteModal: document.getElementById('delete-modal'),
    deleteTodoModal: document.getElementById('delete-todo-modal'),
    
    // Modal buttons
    closeModalBtn: document.getElementById('close-modal'),
    confirmDeleteBtn: document.getElementById('confirm-delete'),
    cancelDeleteBtn: document.getElementById('cancel-delete'),
    confirmDeleteTodoBtn: document.getElementById('confirm-delete-todo'),
    cancelDeleteTodoBtn: document.getElementById('cancel-delete-todo'),
    
    // Modal text
    deleteTodoText: document.getElementById('delete-todo-text'),
    
    // UI elements
    darkModeBtn: document.getElementById('dark-mode'),
    dateDisplay: document.getElementById('date-display')
};

// Constants
const LOCAL_STORAGE_KEY = 'todos';
const DARK_MODE_KEY = 'darkMode';

let todoToDelete = null;


elements.todos.addEventListener('dragover', (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(elements.todos, e.clientY);
    const dragging = document.querySelector('.dragging');
    if (!dragging) return;
    if (afterElement == null) {
        elements.todos.appendChild(dragging);
    } else {
        elements.todos.insertBefore(dragging, afterElement);
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

elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const todoText = elements.input.value.trim();

    if (todoText.length >= 1) {
        createTodo(todoText, false);
        elements.input.value = '';
        saveTodos();
    }

    if (todoText === "") {
         alert('Please enter a todo')
    }
});

elements.reset.addEventListener('click', () => {
    const todoItems = elements.todos.querySelectorAll('li');
    if (todoItems.length === 0) {
        alert('No list to delete');
        return;
    }
    showDeleteModal();
});

function showDeleteModal() {
    if (elements.deleteModal) {
        elements.deleteModal.style.display = 'flex';
    }
}

function closeDeleteModal() {
    if (elements.deleteModal) {
        elements.deleteModal.style.display = 'none';
    }
}

function deleteAllTodos() {
    while (elements.todos.firstChild) {
        elements.todos.removeChild(elements.todos.firstChild);
    }
    saveTodos();
    closeCompletionModal();
    closeDeleteModal();
}

if (elements.confirmDeleteBtn) {
    elements.confirmDeleteBtn.addEventListener('click', deleteAllTodos);
}

if (elements.cancelDeleteBtn) {
    elements.cancelDeleteBtn.addEventListener('click', closeDeleteModal);
}

// Close delete modal when clicking outside of it
if (elements.deleteModal) {
    elements.deleteModal.addEventListener('click', (e) => {
        if (e.target === elements.deleteModal) {
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

    elements.todos.appendChild(todoEl);
}

function saveTodos() {
    const todoItems = [...elements.todos.querySelectorAll('li')].map((item) => ({
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
    if (elements.completionModal) {
        elements.completionModal.style.display = 'flex'
    }
}

function closeCompletionModal() {
    if (elements.completionModal) {
        elements.completionModal.style.display = 'none'
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem(DARK_MODE_KEY, isDark);
    elements.darkModeBtn.textContent = isDark ? 'Light Mode' : 'Dark Mode';
}

function loadDarkMode() {
    const savedDarkMode = localStorage.getItem(DARK_MODE_KEY);
    if (savedDarkMode === 'true') {
        document.body.classList.add('dark');
        elements.darkModeBtn.textContent = 'Light Mode'
    }
}

elements.darkModeBtn.addEventListener('click', toggleDarkMode);
loadDarkMode();

// Modal close functionality
if (elements.closeModalBtn) {
    elements.closeModalBtn.addEventListener('click', closeCompletionModal);
}

// Close modal when clicking outside of it
if (elements.completionModal) {
    elements.completionModal.addEventListener('click', (e) => {
        if (e.target === elements.completionModal) {
            closeCompletionModal();
        }
    });
}

// Single todo delete modal functions
function showDeleteTodoModal(todoElement) {
    todoToDelete = todoElement;
    const todoText = todoElement.textContent;
    if (elements.deleteTodoText) {
        elements.deleteTodoText.textContent = `Are you sure you want to delete "${todoText}"? This action cannot be undone.`;
    }
    if (elements.deleteTodoModal) {
        elements.deleteTodoModal.style.display = 'flex';
    }
}

function closeDeleteTodoModal() {
    todoToDelete = null;
    if (elements.deleteTodoModal) {
        elements.deleteTodoModal.style.display = 'none';
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
if (elements.confirmDeleteTodoBtn) {
    elements.confirmDeleteTodoBtn.addEventListener('click', confirmDeleteTodo);
}

if (elements.cancelDeleteTodoBtn) {
    elements.cancelDeleteTodoBtn.addEventListener('click', closeDeleteTodoModal);
}

// Close single todo delete modal when clicking outside of it
if (elements.deleteTodoModal) {
    elements.deleteTodoModal.addEventListener('click', (e) => {
        if (e.target === elements.deleteTodoModal) {
            closeDeleteTodoModal();
        }
    });
}

if (!elements.todos) {
    alert('No todo list found!')
}

// Display today's date
function displayDate() {
    if (!elements.dateDisplay) return;
    
    const today = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const formattedDate = today.toLocaleDateString('en-US', options);
    elements.dateDisplay.textContent = formattedDate;
}

displayDate();
