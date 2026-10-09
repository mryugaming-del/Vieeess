// LocalStorage Keys
const KEYS = {
  THEME: 'dashboard_theme',
  NAME: 'dashboard_user_name',
  TASKS: 'dashboard_tasks',
  LINKS: 'dashboard_links',
  POMODORO_MINS: 'dashboard_pomodoro_mins'
};

// --- Theme Toggle ---
const themeToggleBtn = document.getElementById('theme-toggle-btn');
let currentTheme = localStorage.getItem(KEYS.THEME) || 'light';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(KEYS.THEME, theme);
}
applyTheme(currentTheme);

themeToggleBtn.addEventListener('click', () => {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(currentTheme);
});

// --- Greeting & Clock ---
const clockTimeEl = document.getElementById('clock-time');
const clockDateEl = document.getElementById('clock-date');
const greetingTextEl = document.getElementById('greeting-text');
const nameInput = document.getElementById('name-input');

let userName = localStorage.getItem(KEYS.NAME) || '';
nameInput.value = userName;

nameInput.addEventListener('input', (e) => {
  userName = e.target.value;
  localStorage.setItem(KEYS.NAME, userName);
  updateGreeting();
});

function updateClockAndGreeting() {
  const now = new Date();
  clockTimeEl.textContent = now.toLocaleTimeString('en-US', { hour12: false });
  
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  clockDateEl.textContent = now.toLocaleDateString('en-US', options);

  updateGreeting();
}

function updateGreeting() {
  const hour = new Date().getHours();
  let greeting = 'Good Morning';
  if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
  else if (hour >= 17) greeting = 'Good Evening';

  const displayName = userName.trim() ? `, ${userName.trim()}` : '';
  greetingTextEl.textContent = `${greeting}${displayName}`;
}

setInterval(updateClockAndGreeting, 1000);
updateClockAndGreeting();

// --- Focus Timer ---
let timerInterval = null;
let customMinutes = parseInt(localStorage.getItem(KEYS.POMODORO_MINS)) || 25;
let timeLeft = customMinutes * 60;

const timerDisplay = document.getElementById('timer-display');
const pomodoroInput = document.getElementById('pomodoro-minutes');
const setTimerBtn = document.getElementById('set-timer-btn');
const startBtn = document.getElementById('start-timer-btn');
const stopBtn = document.getElementById('stop-timer-btn');
const resetBtn = document.getElementById('reset-timer-btn');

pomodoroInput.value = customMinutes;

function updateTimerDisplay() {
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

setTimerBtn.addEventListener('click', () => {
  const val = parseInt(pomodoroInput.value);
  if (val && val > 0) {
    customMinutes = val;
    localStorage.setItem(KEYS.POMODORO_MINS, customMinutes);
    clearInterval(timerInterval);
    timerInterval = null;
    timeLeft = customMinutes * 60;
    updateTimerDisplay();
  }
});

startBtn.addEventListener('click', () => {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      timerInterval = null;
      alert('Focus time is up!');
    }
  }, 1000);
});

stopBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerInterval = null;
});

resetBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerInterval = null;
  timeLeft = customMinutes * 60;
  updateTimerDisplay();
});

updateTimerDisplay();

// --- Tasks / To-Do List ---
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoListEl = document.getElementById('todo-list');
const sortSelect = document.getElementById('sort-select');

let tasks = JSON.parse(localStorage.getItem(KEYS.TASKS)) || [
  { id: 1, text: 'belanja', completed: false },
  { id: 2, text: 'belajar', completed: false }
];

function saveTasks() {
  localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
}

function renderTasks() {
  todoListEl.innerHTML = '';
  
  let sortedTasks = [...tasks];
  const sortMode = sortSelect.value;

  if (sortMode === 'oldest') {
    sortedTasks.sort((a, b) => a.id - b.id);
  } else if (sortMode === 'newest') {
    sortedTasks.sort((a, b) => b.id - a.id);
  } else if (sortMode === 'alphabetical') {
    sortedTasks.sort((a, b) => a.text.localeCompare(b.text));
  } else if (sortMode === 'status') {
    sortedTasks.sort((a, b) => a.completed - b.completed);
  }

  sortedTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `todo-item ${task.completed ? 'completed' : ''}`;
    
    li.innerHTML = `
      <input type="checkbox" ${task.completed ? 'checked' : ''} class="toggle-checkbox">
      <span class="todo-text">${escapeHtml(task.text)}</span>
      <div class="todo-actions">
        <button class="btn secondary sm edit-btn">Edit</button>
        <button class="btn danger sm delete-btn">Delete</button>
      </div>
    `;

    li.querySelector('.toggle-checkbox').addEventListener('change', () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    });

    li.querySelector('.edit-btn').addEventListener('click', () => {
      const newText = prompt('Edit task:', task.text);
      if (newText !== null && newText.trim() !== '') {
        const isDuplicate = tasks.some(t => t.id !== task.id && t.text.toLowerCase() === newText.trim().toLowerCase());
        if (isDuplicate) {
          alert('Task already exists!');
          return;
        }
        task.text = newText.trim();
        saveTasks();
        renderTasks();
      }
    });

    li.querySelector('.delete-btn').addEventListener('click', () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
    });

    todoListEl.appendChild(li);
  });
}

todoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;

  const isDuplicate = tasks.some(t => t.text.toLowerCase() === text.toLowerCase());
  if (isDuplicate) {
    alert('Task already exists!');
    return;
  }

  tasks.push({
    id: Date.now(),
    text: text,
    completed: false
  });

  todoInput.value = '';
  saveTasks();
  renderTasks();
});

sortSelect.addEventListener('change', renderTasks);
renderTasks();

// --- Quick Links ---
const linkForm = document.getElementById('link-form');
const linkNameInput = document.getElementById('link-name-input');
const linkUrlInput = document.getElementById('link-url-input');
const linksContainer = document.getElementById('links-container');

let quickLinks = JSON.parse(localStorage.getItem(KEYS.LINKS)) || [
  { id: 1, name: 'Google', url: 'https://www.google.com' },
  { id: 2, name: 'Gmail', url: 'https://mail.google.com' },
  { id: 3, name: 'Calendar', url: 'https://calendar.google.com' }
];

function saveLinks() {
  localStorage.setItem(KEYS.LINKS, JSON.stringify(quickLinks));
}

function renderLinks() {
  linksContainer.innerHTML = '';
  quickLinks.forEach(link => {
    const linkWrapper = document.createElement('div');
    linkWrapper.className = 'quick-link-btn';

    const anchor = document.createElement('a');
    anchor.href = link.url;
    anchor.target = '_blank';
    anchor.style.color = 'inherit';
    anchor.style.textDecoration = 'none';
    anchor.textContent = link.name;

    const delBtn = document.createElement('button');
    delBtn.textContent = '×';
    delBtn.title = 'Remove link';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      quickLinks = quickLinks.filter(l => l.id !== link.id);
      saveLinks();
      renderLinks();
    });

    linkWrapper.appendChild(anchor);
    linkWrapper.appendChild(delBtn);
    linksContainer.appendChild(linkWrapper);
  });
}

linkForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = linkNameInput.value.trim();
  let url = linkUrlInput.value.trim();

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  quickLinks.push({
    id: Date.now(),
    name: name,
    url: url
  });

  linkNameInput.value = '';
  linkUrlInput.value = '';
  saveLinks();
  renderLinks();
});

renderLinks();

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}