# Work Timer - Task Time Tracking Application

A professional desktop application for tracking time spent on tasks, built with Electron. Perfect for freelancers, teams, and anyone who needs to track time spent on various tasks.

## Features

- Create and manage tasks with ease
- Real-time task timing with pause/continue functionality
- Add notes to tasks for better tracking
- Accurate time tracking even when paused/continued
- Data persistence across sessions
- Professional user interface
- Cross-platform support (Windows, macOS, Linux)

## Installation

### Windows

1. Download the latest `WorkTimerSetup.exe` from the releases page
2. Run the installer
3. Follow the installation wizard
4. Launch Work Timer from the Start Menu

### macOS

1. Download the latest `WorkTimer.dmg` from the releases page
2. Open the DMG file
3. Drag Work Timer to the Applications folder
4. Launch Work Timer from Applications or Spotlight

### Linux

#### Debian/Ubuntu
1. Download the latest `.deb` package
2. Install using:
   ```bash
   sudo dpkg -i work-timer.deb
   sudo apt-get install -f # Install dependencies if needed
   ```

#### RedHat/Fedora
1. Download the latest `.rpm` package
2. Install using:
   ```bash
   sudo rpm -i work-timer.rpm
   ```

## Development

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later) or Yarn

### Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd work-timer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Building from Source

### Windows
```bash
npm run make-win
```
Outputs to `out/make/squirrel.windows/x64`

### macOS
```bash
npm run make-mac
```
Outputs to `out/make/dmg/x64`

### Linux
```bash
npm run make-linux
```
Outputs to `out/make/deb/x64` and `out/make/rpm/x64`

## Project Structure

```
time-tracker/
├── src/
│   ├── main.js           # Main process
│   ├── preload.js        # Preload script (if needed)
│   └── renderer/         # Renderer process
│       ├── index.html    # Main window HTML
│       ├── renderer.js   # Renderer process JavaScript
│       └── styles.css    # Application styles
├── assets/               # Static assets
│   └── icons/            # Application icons
├── .gitignore
├── package.json
└── README.md
```

## Adding Icons

Place your application icons in the `assets/icons` directory with the following names:

- `icon.icns` - macOS icon
- `icon.ico` - Windows icon
- `icon.png` - Linux/fallback icon

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
