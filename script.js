// todo: drag and drop todo items feature to arrange by priority
const form = document.getElementById('form');
const input = document.getElementById('input');
const todos = document.getElementById('todos');
const reset = document.getElementById('reset');
const darkModeBtn = document.getElementById('dark-mode');
const LOCAL_STORAGE_KEY = 'todos';
const DARK_MODE_KEY = 'darkMode';

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

    if (todoText.length > 1) {
        createTodo(todoText, false);
        input.value = '';
        saveTodos();
    }

    if (todoText === "") {
         alert('Please enter a todo')
    }
});

reset.addEventListener('click', () => {
    while (todos.firstChild) {
        todos.removeChild(todos.firstChild);
    }
    saveTodos();
});

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

    todoEl.addEventListener('click', () => {
        todoEl.classList.toggle('completed');
        saveTodos();
    });

    todoEl.addEventListener('dblclick', (event) => {
        event.preventDefault();
        todoEl.remove();
        saveTodos();
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

// Dark mode functionality
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
        darkModeBtn.textContent = 'Light Mode';
    }
}

darkModeBtn.addEventListener('click', toggleDarkMode);
loadDarkMode();
