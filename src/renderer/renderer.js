const { ipcRenderer } = require('electron');

// DOM Elements
let timerElement;
let startBtn;
let stopBtn;
let resetBtn;
let taskInput;
let addTaskBtn;
let taskList;
let employeeNameElement;
let addNoteBtn;
let finishTaskBtn;
let confirmationDialog;
let confirmationOverlay;
let confirmYesBtn;
let confirmNoBtn;

// Initialize DOM elements function to ensure elements are available
function initializeDOMElements() {
    console.log('Initializing DOM elements');
    timerElement = document.getElementById('timer');
    startBtn = document.getElementById('startBtn');
    stopBtn = document.getElementById('stopBtn');
    resetBtn = document.getElementById('resetBtn');
    taskInput = document.getElementById('taskInput');
    addTaskBtn = document.getElementById('addTaskBtn');
    taskList = document.getElementById('taskList');
    employeeNameElement = document.getElementById('employeeName');
    addNoteBtn = document.getElementById('addNoteBtn');
    finishTaskBtn = document.getElementById('finishTaskBtn');
    confirmationDialog = document.getElementById('confirmationDialog');
    confirmationOverlay = document.getElementById('confirmationOverlay');
    confirmYesBtn = document.getElementById('confirmYesBtn');
    confirmNoBtn = document.getElementById('confirmNoBtn');
    
    // Log if any element is missing
    if (!taskInput) console.error('taskInput element not found');
    if (!addTaskBtn) console.error('addTaskBtn element not found');
    if (!taskList) console.error('taskList element not found');
}

// Timer variables
let seconds = 0;
let minutes = 0;
let hours = 0;
let timer = null;
let isRunning = false;
let currentTaskId = null;
let lastPauseTime = 0; // Track when we last paused to calculate accurate time

// Tasks array
let tasks = [];

// Handle employee information
ipcRenderer.on('employee-info', (event, employeeInfo) => {
    employeeNameElement.textContent = `Employee: ${employeeInfo.fullName}`;
});

// Load tasks from storage when the app starts
window.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM content loaded - initializing application');
    
    // Initialize DOM elements to ensure they exist
    initializeDOMElements();
    
    // Load saved tasks
    const savedTasks = await ipcRenderer.invoke('store-get', 'tasks');
    if (savedTasks) {
        tasks = savedTasks;
        renderTasks();
    }
    
    // Set up all event listeners
    setupAllEventListeners();
    
    console.log('Application initialization complete');
});

// Set up all event listeners for the application
function setupAllEventListeners() {
    // Flag to track if we need to disable auto-focus temporarily
    let allowButtonClicks = false;
    console.log('Setting up all event listeners');
    
    // Task management buttons
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', function() {
            console.log('Add Task button clicked');
            if (taskInput) {
                addTask(taskInput.value);
            } else {
                console.error('Task input field not found');
            }
        });
        console.log('Add Task button listener added');
    } else {
        console.error('Add Task button not found');
    }
    
    // Task input field - Enter key press and focus management
    if (taskInput) {
        taskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                console.log('Enter key pressed in task input');
                addTask(taskInput.value);
            }
        });
        
        // Make task input editable but don't prevent button clicks
        taskInput.addEventListener('blur', function(e) {
            // Don't automatically refocus - this was preventing button clicks
            // Instead, we'll focus specifically after certain actions
        });
        
        // Set initial focus on task input
        setTimeout(() => {
            taskInput.focus();
        }, 500);
        
        console.log('Task input event listeners added');
    } else {
        console.error('Task input field not found');
    }
    
    // Add Note button
    if (addNoteBtn) {
        addNoteBtn.addEventListener('click', function() {
            console.log('Add Note button clicked');
            addNote();
        });
        addNoteBtn.addEventListener('mousedown', function(e) {
            console.log('Add Note mousedown event triggered');
        });
        console.log('Add Note button listener added');
    } else {
        console.error('Add Note button not found');
    }
    
    // Finish Task button
    if (finishTaskBtn) {
        finishTaskBtn.addEventListener('click', function() {
            console.log('Finish Task button clicked');
            finishTask();
        });
        // Add mousedown event to ensure it's clickable
        finishTaskBtn.addEventListener('mousedown', function(e) {
            e.preventDefault(); // Ensure clickable
        });
        console.log('Finish Task button listener added');
    } else {
        console.error('Finish Task button not found');
    }
    
    // Timer control buttons
    if (startBtn) {
        startBtn.addEventListener('click', startTimer);
        startBtn.addEventListener('mousedown', function(e) {
            e.preventDefault(); // Ensure clickable
        });
        console.log('Start timer button listener added');
    }
    
    if (stopBtn) {
        stopBtn.addEventListener('click', stopTimer);
        stopBtn.addEventListener('mousedown', function(e) {
            e.preventDefault(); // Ensure clickable
        });
        console.log('Pause timer button listener added');
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetTimer);
        resetBtn.addEventListener('mousedown', function(e) {
            e.preventDefault(); // Ensure clickable
        });
        console.log('Continue timer button listener added');
    }
    
    // Confirmation dialog buttons
    if (confirmYesBtn) {
        confirmYesBtn.addEventListener('click', function() {
            completeActiveTask();
            hideConfirmationDialog();
            
            // Focus back on task input after completing a task
            setTimeout(() => {
                if (taskInput) taskInput.focus();
            }, 300);
        });
        console.log('Confirm Yes button listener added');
    }
    
    if (confirmNoBtn) {
        confirmNoBtn.addEventListener('click', function() {
            hideConfirmationDialog();
            
            // Focus back on task input after canceling
            setTimeout(() => {
                if (taskInput) taskInput.focus();
            }, 300);
        });
        console.log('Confirm No button listener added');
    }
}

// Format time as HH:MM:SS
function formatTime(h, m, s) {
    return [
        h.toString().padStart(2, '0'),
        m.toString().padStart(2, '0'),
        s.toString().padStart(2, '0')
    ].join(':');
}

// Update the timer display
function updateTimer() {
    seconds++;
    
    if (seconds === 60) {
        seconds = 0;
        minutes++;
    }
    
    if (minutes === 60) {
        minutes = 0;
        hours++;
    }
    
    timerElement.textContent = formatTime(hours, minutes, seconds);
}

// Start the timer
function startTimer() {
    console.log('Starting timer');
    
    // Check if we have an active task
    if (!currentTaskId) {
        alert('Please select a task first before starting the timer.');
        return;
    }
    
    if (!isRunning) {
        isRunning = true;
        timer = setInterval(updateTimer, 1000);
        
        if (startBtn) startBtn.disabled = true;
        if (stopBtn) stopBtn.disabled = false;
        
        // Make sure UI reflects active status
        renderTasks();
        
        console.log('Timer started at:', formatTime(hours, minutes, seconds));
    }
}

// Pause the timer (formerly Stop)
function stopTimer() {
    console.log('Pausing timer');
    if (isRunning) {
        // Clear the interval to pause timing
        clearInterval(timer);
        isRunning = false;
        
        // Update button states
        if (startBtn) startBtn.disabled = false;
        if (stopBtn) stopBtn.disabled = true;
        
        // Update task time if there's an active task
        if (currentTaskId !== null) {
            const task = tasks.find(t => t.id === currentTaskId);
            if (task) {
                // Calculate the elapsed time since we started or last continued
                const elapsedSeconds = hours * 3600 + minutes * 60 + seconds;
                console.log('Current timer value in seconds:', elapsedSeconds);
                
                // Store the current timer state for when we continue
                lastPauseTime = elapsedSeconds;
                
                // Update the task's accumulated time
                if (!task.timeSpent) task.timeSpent = 0;
                task.timeSpent = lastPauseTime;
                
                // Keep the task active
                task.isActive = true;
                task.lastUpdated = new Date().toISOString();
                
                console.log('Updated task time to:', task.timeSpent);
                
                saveTasks();
                renderTasks();
            }
        }
        
        // Refocus on task input after pausing
        setTimeout(() => {
            if (taskInput) taskInput.focus();
        }, 100);
        
        console.log('Timer paused successfully');
    } else {
        console.log('Timer is not running, nothing to pause');
    }
}

// Continue the timer (formerly Reset)
function resetTimer() {
    console.log('Continue button pressed');
    
    // Always stop any running timer first
    clearInterval(timer);
    isRunning = false;
    
    // Check if we want to continue a task or just reset
    if (currentTaskId) {
        const task = tasks.find(t => t.id === currentTaskId);
        if (task) {
            console.log('Continuing task:', task.name);
            
            // If we have a lastPauseTime, restore that state
            if (lastPauseTime > 0) {
                console.log('Restoring from pause time:', lastPauseTime);
                const h = Math.floor(lastPauseTime / 3600);
                const m = Math.floor((lastPauseTime % 3600) / 60);
                const s = lastPauseTime % 60;
                
                hours = h;
                minutes = m;
                seconds = s;
                
                // Update display
                if (timerElement) {
                    timerElement.textContent = formatTime(hours, minutes, seconds);
                }
            }
            
            // Start the timer
            startTimer();
            return; // Important: return early to prevent further execution
        } else {
            console.log('Task not found, resetting timer');
            // Reset time if task not found
            seconds = 0;
            minutes = 0;
            hours = 0;
            lastPauseTime = 0;
        }
    } else {
        console.log('No active task, resetting timer');
        // Full reset if no active task
        seconds = 0;
        minutes = 0;
        hours = 0;
        lastPauseTime = 0;
    }
    
    // Update UI
    if (timerElement) {
        timerElement.textContent = formatTime(hours, minutes, seconds);
    }
    
    // Update button states
    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;
    
    console.log('Continue operation completed');
}

// Format time in seconds to HH:MM:SS
function formatTimeFromSeconds(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return formatTime(hours, minutes, seconds);
}

// Add a new task
function addTask(name) {
    console.log('Adding new task:', name);
    
    if (!name || !name.trim()) {
        alert('Please enter a task name');
        return;
    }
    
    const task = {
        id: Date.now().toString(),
        name: name.trim(),
        timeSpent: 0, // in seconds
        isActive: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(task);
    saveTasks();
    renderTasks();
    
    // Clear input field after adding task
    if (taskInput) {
        taskInput.value = '';
        // Ensure the input remains focused and editable
        setTimeout(() => {
            taskInput.focus();
        }, 100);
    } else {
        console.error('taskInput element not found when clearing');
    }
    
    console.log('Task added successfully:', task);
    alert('Task added: ' + task.name);
    return task;
}

// Update task time
function updateTaskTime(taskId, additionalSeconds) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        if (!task.timeSpent) task.timeSpent = 0;
        task.timeSpent += additionalSeconds;
        task.lastUpdated = new Date().toISOString();
        console.log(`Updated task ${taskId} time: added ${additionalSeconds}s, total: ${task.timeSpent}s`);
        saveTasks();
        renderTasks();
    }
}

// Delete a task
function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
    renderTasks();
    
    // If the deleted task was active, reset the timer
    if (currentTaskId === taskId) {
        resetTimer();
    }
}

// Set active task
function setActiveTask(taskId) {
    console.log('Setting active task:', taskId);
    // If there's already an active task, update its time first
    if (currentTaskId !== null) {
        // Only allow switching if it's not the same task
        if (currentTaskId === taskId) {
            console.log('Task is already active');
            return;
        }
        // Confirm before switching tasks
        if (!confirm('You already have an active task. Stop it and switch to this task?')) {
            console.log('User canceled task switch');
            return;
        }
        // Deactivate the current task and update its time
        const currentActiveTask = tasks.find(t => t.id === currentTaskId);
        if (currentActiveTask) {
            currentActiveTask.isActive = false;
            // Make sure we capture the time by calling stopTimer first
            if (isRunning) {
                stopTimer();
            }
        }
    }
    // Set the new active task
    const newTask = tasks.find(t => t.id === taskId);
    if (newTask) {
        // Reset all task states first to ensure only one active task
        tasks.forEach(task => task.isActive = false);
        // Set this task as active
        newTask.isActive = true;
        currentTaskId = taskId;
        
        // Initialize timer with task's accumulated time
        if (newTask.timeSpent) {
            const h = Math.floor(newTask.timeSpent / 3600);
            const m = Math.floor((newTask.timeSpent % 3600) / 60);
            const s = newTask.timeSpent % 60;
            
            hours = h;
            minutes = m;
            seconds = s;
            lastPauseTime = newTask.timeSpent;
        } else {
            // Reset timer for new tasks
            seconds = 0;
            minutes = 0;
            hours = 0;
            lastPauseTime = 0;
        }
        
        // Update UI
        if (timerElement) {
            timerElement.textContent = formatTime(hours, minutes, seconds);
        }
        
        // Start the timer automatically
        startTimer();
    }
    saveTasks();
    renderTasks();
    // Refocus on task input after setting active task
    setTimeout(() => {
        if (taskInput) taskInput.focus();
    }, 100);
}

// Save tasks to storage
function saveTasks() {
    ipcRenderer.invoke('store-set', 'tasks', tasks);
}

// Render tasks to the DOM
function renderTasks() {
    if (!taskList) {
        console.error('Task list element not found when rendering tasks');
        return;
    }
    
    taskList.innerHTML = '';
    
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.isActive ? 'active' : ''}`;
        li.setAttribute('data-task-id', task.id);
        
        // Calculate current time for active task
        let displayTime = task.timeSpent || 0;
        if (task.isActive && currentTaskId === task.id) {
            const currentSeconds = hours * 3600 + minutes * 60 + seconds;
            displayTime = currentSeconds;
        }
        
        li.innerHTML = `
            <div class="task-info">
                <div class="task-name">${task.name}</div>
                <div class="task-time">${formatTimeFromSeconds(displayTime)}</div>
            </div>
            <div class="task-actions">
                <button class="btn" onclick="setActiveTask('${task.id}')" ${task.isActive ? 'disabled' : ''}>
                    ${task.isActive ? 'Active' : 'Start'}
                </button>
                <button class="btn delete-btn" onclick="deleteTask('${task.id}')">Delete</button>
            </div>
        `;
        
        taskList.appendChild(li);
    });
}

// Note: Event listeners are now set up in setupAllEventListeners()

// Make required functions available globally
window.addTask = addTask;
window.setActiveTask = setActiveTask;
window.deleteTask = deleteTask;

// Note: Global functions are now set up earlier

// Add note to active task
function addNote() {
    console.log('addNote function called');
    
    if (!currentTaskId) {
        alert('Please select an active task first');
        return;
    }

    // Pause the timer if it's running
    const wasRunning = isRunning;
    if (wasRunning) {
        stopTimer();
    }

    const note = prompt('Enter your note:');
    
    // Restart the timer if it was running
    if (wasRunning) {
        startTimer();
    }
    
    if (!note) return; // User canceled or entered empty note

    const task = tasks.find(t => t.id === currentTaskId);
    if (task) {
        if (!task.notes) {
            task.notes = [];
        }
        
        task.notes.push({
            text: note,
            timestamp: new Date().toISOString()
        });
        
        console.log('Note added to task:', task.id, note);
        saveTasks();
        renderTasks();
        alert('Note added successfully!');
        
        // Return focus to task input after adding note
        setTimeout(() => {
            if (taskInput) taskInput.focus();
        }, 100);
    }
}

// Show confirmation dialog
function showConfirmationDialog(task) {
    console.log('Showing confirmation dialog for task:', task);
    
    // Simple alert as a fallback if dialog elements don't exist
    if (!confirmationDialog || !confirmationOverlay) {
        const confirmResult = confirm(`Are you sure you want to finish the task "${task.name}" (${formatTimeFromSeconds(task.timeSpent)})?`);
        if (confirmResult) {
            completeActiveTask();
        }
        return;
    }
    
    // Get the elements for displaying task info
    const activeTaskName = document.getElementById('activeTaskName');
    const currentDuration = document.getElementById('currentDuration');
    
    // Update dialog content with task details
    if (activeTaskName) activeTaskName.textContent = task.name;
    if (currentDuration) currentDuration.textContent = formatTimeFromSeconds(task.timeSpent);
    
    // Show dialog immediately
    confirmationDialog.style.display = 'flex';
    confirmationOverlay.style.display = 'block';
    confirmationDialog.classList.add('active');
    confirmationOverlay.classList.add('active');
}

// Hide confirmation dialog
function hideConfirmationDialog() {
    console.log('Hiding confirmation dialog');
    
    if (confirmationDialog && confirmationOverlay) {
        confirmationDialog.classList.remove('active');
        confirmationOverlay.classList.remove('active');
        
        // Ensure it's hidden
        setTimeout(() => {
            confirmationDialog.style.display = 'none';
            confirmationOverlay.style.display = 'none';
        }, 200);
    }
}

// Complete the active task
function completeActiveTask() {
    console.log('Completing active task');
    
    if (!currentTaskId) {
        console.error('No active task to complete');
        return;
    }
    
    const task = tasks.find(t => t.id === currentTaskId);
    if (task) {
        // Calculate final time
        const finalSeconds = hours * 3600 + minutes * 60 + seconds;
        if (!task.timeSpent) task.timeSpent = 0;
        task.timeSpent = finalSeconds;
        
        task.finishedAt = new Date().toISOString();
        task.isActive = false;
        
        // Stop the timer
        if (isRunning) {
            clearInterval(timer);
            isRunning = false;
        }
        
        // Reset current task ID and timer variables
        currentTaskId = null;
        lastPauseTime = 0;
        hours = 0;
        minutes = 0;
        seconds = 0;
        
        // Update UI
        if (timerElement) {
            timerElement.textContent = formatTime(0, 0, 0);
        }
        if (startBtn) startBtn.disabled = false;
        if (stopBtn) stopBtn.disabled = true;
        
        saveTasks();
        renderTasks();
        
        alert('Task completed successfully!');
    }
}

// Finish active task with confirmation
function finishTask() {
    console.log('finishTask function called');
    
    if (!currentTaskId) {
        alert('No active task to finish. Please select a task first.');
        return;
    }

    const task = tasks.find(t => t.id === currentTaskId);
    if (task) {
        showConfirmationDialog(task);
    } else {
        alert('Could not find the active task');
    }
}

// Note: Initialization is now done in DOMContentLoaded event

// Note: Button listeners are now set up in setupAllEventListeners()
