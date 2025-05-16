const { ipcRenderer } = require('electron');

const fullNameInput = document.getElementById('fullName');
const startBtn = document.getElementById('startBtn');

// Enable/disable start button based on input
fullNameInput.addEventListener('input', () => {
    startBtn.disabled = !fullNameInput.value.trim();
});

// Handle start working
startBtn.addEventListener('click', () => {
    const fullName = fullNameInput.value.trim();
    
    // Send employee information to main process
    ipcRenderer.send('employee-info', { fullName });
});

// Listen for main window to be ready
ipcRenderer.on('main-window-ready', () => {
    // Close the employee info window
    window.close();
});
