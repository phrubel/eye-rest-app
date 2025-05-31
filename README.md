# Eye Rest App 👁️‍🗨️

A desktop application built with Electron to help protect your eyes from strain and fatigue during long computer sessions. The app follows the 20-20-20 rule and provides timely reminders to take breaks and rest your eyes.

## 🌟 Features

- **20-20-20 Rule Reminders**: Get notified every 20 minutes to look at something 20 feet away for 20 seconds
- **Customizable Break Intervals**: Set your own reminder intervals based on your work schedule
- **Full-Screen Break Notifications**: Overlay notifications that ensure you don't miss break times
- **System Tray Integration**: Runs quietly in the background without cluttering your desktop
- **Break Timer**: Visual countdown during break periods
- **Auto-start on Boot**: Option to automatically start the app when your computer boots
- **Cross-platform Support**: Works on Windows, macOS, and Linux

## 📥 Installation

### Download Pre-built Binaries

1. Go to the [Releases](https://github.com/phrubel/eye-rest-app/releases) page
2. Download the appropriate installer for your operating system:
   - Windows: `.exe` installer
   - macOS: `.dmg` file
   - Linux: `.AppImage` or `.deb` package

### Build from Source

```bash
# Clone the repository
git clone https://github.com/phrubel/eye-rest-app.git
cd eye-rest-app

# Install dependencies
npm install

# Run in development mode
npm start

# Build for production
npm run build

# Create distribution packages
npm run dist

# create full exe file for distribute
npm run build-win-installer

# create full exe file for distribute
npm run build-win-portable
```

## 🚀 Usage

1. **Launch the App**: Start the application from your desktop or applications menu
2. **Configure Settings**: Right-click the system tray icon to access settings
3. **Set Break Intervals**: Customize your reminder frequency (default: 20 minutes)
4. **Enable Notifications**: Ensure notifications are enabled for break reminders
5. **Take Breaks**: When notified, look away from your screen and focus on distant objects

### System Tray Controls

- **Left Click**: Show/hide main window
- **Right Click**: Access context menu with options to:
  - Pause/Resume reminders
  - Access settings
  - View break statistics
  - Quit application

## ⚙️ Configuration

The app offers several customization options:

- **Break Duration**: Set how long breaks should last (default: 20 seconds)
- **Work Duration**: Set work intervals between breaks (default: 20 minutes)
- **Break Type**: Choose between different break reminder styles
- **Sound Notifications**: Enable/disable audio alerts
- **Auto-start**: Set the app to start automatically with your system

## 🛠️ Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

### Tech Stack

- **Electron**: Cross-platform desktop framework
- **HTML/CSS/JavaScript**: Frontend technologies
- **Node.js**: Backend runtime

### Project Structure

```
eye-rest-app/
├── src/
│   ├── main/           # Main Electron process
│   ├── renderer/       # Renderer process (UI)
│   └── shared/         # Shared utilities
├── assets/             # Images, icons, sounds
├── build/              # Build configuration
└── dist/               # Distribution files
```

### Scripts

```bash
npm start          # Start development server
npm run build      # Build for production
npm run dist       # Create distribution packages
npm run lint       # Run code linting
npm test           # Run tests
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📋 Requirements

- **Operating System**: Windows 10+, macOS 10.12+, or Linux (Ubuntu 18.04+)
- **RAM**: 512 MB minimum
- **Storage**: 100 MB available space
- **Display**: Any resolution supported

## 🐛 Troubleshooting

### Common Issues

**App doesn't start automatically**

- Check if auto-start is enabled in settings
- Verify the app has necessary system permissions

**Notifications not appearing**

- Ensure notification permissions are granted
- Check system notification settings

**High CPU usage**

- This is typically minimal, but check for conflicting software
- Try restarting the application

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the 20-20-20 rule recommended by eye care professionals
- Built with the Electron framework
- Icons and assets from various open-source contributors

## 📞 Support

If you encounter any issues or have questions:

- Open an issue on [GitHub Issues](https://github.com/phrubel/eye-rest-app/issues)
- Check the [FAQ section](https://github.com/phrubel/eye-rest-app/wiki/FAQ)

---

**Remember**: Taking regular breaks is essential for maintaining healthy eyes during long computer sessions. This app is a tool to help remind you, but listening to your body and taking breaks when needed is most important.

## 🔄 Updates

Stay updated with the latest features and bug fixes by watching this repository or checking the [releases page](https://github.com/phrubel/eye-rest-app/releases).

---

Made with ❤️ for healthier computing habits
