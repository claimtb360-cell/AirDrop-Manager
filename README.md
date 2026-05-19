# AirDrop Manager

A modern, user-friendly application to manage cryptocurrency airdrop projects. Track your daily tasks, manage access links, and monitor project timelines — all in one place.

![React](https://img.shields.io/badge/React-19-blue) ![Vite](https://img.shields.io/badge/Vite-6-purple) ![Chrome Extension](https://img.shields.io/badge/Chrome-Extension%20MV3-green)

## Features

- **Project Management** — Add, edit, and organize all your airdrop projects
- **Daily Task Checklist** — Track daily tasks with per-date completion history
- **Access Links** — Quick access to project websites, Discord, Twitter, etc.
- **Timeline Tracking** — Start/end dates with automatic status detection (Active/Upcoming/Ended)
- **Progress Tracking** — Visual progress bars for daily task completion
- **Search & Filter** — Quickly find projects by name or description
- **Dark Theme** — Beautiful dark UI optimized for extended use
- **Persistent Storage** — Data saved locally (localStorage for web, chrome.storage for extension)

## Project Structure

```
AirDrop-Manager/
├── webapp/          # React + Vite web application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ProjectList.jsx
│   │   │   ├── ProjectDetail.jsx
│   │   │   ├── AddProjectModal.jsx
│   │   │   └── DailyChecklist.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   └── package.json
├── extension/       # Chrome Extension (Manifest V3)
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.css
│   ├── popup.js
│   └── icons/
└── README.md
```

## Getting Started

### Web Application

```bash
cd webapp
npm install
npm run dev
```

The app will start at `http://localhost:5173`

To build for production:
```bash
npm run build
```

### Chrome Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `extension/` folder
5. The AirDrop Manager icon will appear in your toolbar

## Usage

### Adding a Project
1. Click **"Add Project"** button
2. Fill in project details:
   - Name (required)
   - Description
   - Network/Chain (e.g., Ethereum, Solana)
   - Estimated value
   - Start & End dates
   - Access links (website, Discord, Twitter, etc.)
   - Daily tasks to complete

### Daily Checklist
- Switch to **"Daily Tasks"** view to see all tasks across projects for today
- Check off tasks as you complete them
- Navigate between dates to review past/future tasks
- Progress bar shows overall completion

### Chrome Extension
- Click the extension icon for a quick overview of today's tasks
- Check off tasks directly from the popup
- Click project links to open them in new tabs
- Add new projects from the extension

## Tech Stack

- **Web App**: React 19, Vite 6, Lucide Icons, date-fns
- **Extension**: Vanilla JS, Chrome Extension Manifest V3
- **Storage**: localStorage (web), chrome.storage.local (extension)
- **Styling**: Custom CSS with CSS Variables (dark theme)

## License

MIT
