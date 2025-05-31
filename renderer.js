class EyeRestApp {
  constructor() {
    this.settings = {
      workDuration: 25,
      breakDuration: 5,
      soundEnabled: true,
      autoStart: false,
      minimizeToTray: true,
    };
    this.timer = null;
    this.isRunning = false;
    this.isPaused = false;
    this.isBreakTime = false;
    this.timeRemaining = 0;
    this.totalTime = 0;

    this.initializeElements();
    this.loadSettings();
    this.setupEventListeners();
    this.setupElectronListeners();
  }

  initializeElements() {
    this.elements = {
      timeDisplay: document.getElementById('timeDisplay'),
      timeLabel: document.getElementById('timeLabel'),
      statusText: document.getElementById('statusText'),
      statusDot: document.getElementById('statusDot'),
      progressFill: document.getElementById('progressFill'),
      startBtn: document.getElementById('startBtn'),
      pauseBtn: document.getElementById('pauseBtn'),
      resetBtn: document.getElementById('resetBtn'),
      workDuration: document.getElementById('workDuration'),
      breakDuration: document.getElementById('breakDuration'),
      soundEnabled: document.getElementById('soundEnabled'),
      autoStart: document.getElementById('autoStart'),
      minimizeToTray: document.getElementById('minimizeToTray'),
    };

    // Check if all required elements exist
    for (const [key, element] of Object.entries(this.elements)) {
      if (!element) {
        console.warn(`Element with ID '${key}' not found`);
      }
    }
  }

  async loadSettings() {
    try {
      if (window.electronAPI && window.electronAPI.getSettings) {
        this.settings = await window.electronAPI.getSettings();
      }
      this.updateUI();

      if (this.settings.autoStart) {
        this.startTimer();
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      this.updateUI(); // Update UI with default settings
    }
  }

  async saveSettings() {
    try {
      this.settings = {
        workDuration: parseInt(this.elements.workDuration?.value || 25),
        breakDuration: parseInt(this.elements.breakDuration?.value || 5),
        soundEnabled: this.elements.soundEnabled?.checked || false,
        autoStart: this.elements.autoStart?.checked || false,
        minimizeToTray: this.elements.minimizeToTray?.checked || false,
      };

      if (window.electronAPI && window.electronAPI.saveSettings) {
        await window.electronAPI.saveSettings(this.settings);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  updateUI() {
    if (this.elements.workDuration)
      this.elements.workDuration.value = this.settings.workDuration;
    if (this.elements.breakDuration)
      this.elements.breakDuration.value = this.settings.breakDuration;
    if (this.elements.soundEnabled)
      this.elements.soundEnabled.checked = this.settings.soundEnabled;
    if (this.elements.autoStart)
      this.elements.autoStart.checked = this.settings.autoStart;
    if (this.elements.minimizeToTray)
      this.elements.minimizeToTray.checked = this.settings.minimizeToTray;

    if (!this.isRunning) {
      this.timeRemaining = this.settings.workDuration * 60;
      this.totalTime = this.timeRemaining;
      this.updateTimeDisplay();
      this.updateProgress();
    }
  }

  setupEventListeners() {
    if (this.elements.startBtn) {
      this.elements.startBtn.addEventListener('click', () => this.startTimer());
    }
    if (this.elements.pauseBtn) {
      this.elements.pauseBtn.addEventListener('click', () => this.pauseTimer());
    }
    if (this.elements.resetBtn) {
      this.elements.resetBtn.addEventListener('click', () => this.resetTimer());
    }

    // Settings event listeners
    if (this.elements.workDuration) {
      this.elements.workDuration.addEventListener('change', () => {
        this.saveSettings();
        if (!this.isRunning && !this.isBreakTime) {
          this.timeRemaining = parseInt(this.elements.workDuration.value) * 60;
          this.totalTime = this.timeRemaining;
          this.updateTimeDisplay();
          this.updateProgress();
        }
      });
    }

    if (this.elements.breakDuration) {
      this.elements.breakDuration.addEventListener('change', () =>
        this.saveSettings()
      );
    }
    if (this.elements.soundEnabled) {
      this.elements.soundEnabled.addEventListener('change', () =>
        this.saveSettings()
      );
    }
    if (this.elements.autoStart) {
      this.elements.autoStart.addEventListener('change', () =>
        this.saveSettings()
      );
    }
    if (this.elements.minimizeToTray) {
      this.elements.minimizeToTray.addEventListener('change', () =>
        this.saveSettings()
      );
    }
  }

  setupElectronListeners() {
    if (window.electronAPI) {
      if (window.electronAPI.onSkipBreak) {
        window.electronAPI.onSkipBreak(() => {
          this.handleBreakEnd();
        });
      }

      if (window.electronAPI.onBreakFinished) {
        window.electronAPI.onBreakFinished(() => {
          this.handleBreakEnd();
        });
      }
    }
  }

  async startTimer() {
    if (this.isPaused) {
      this.isPaused = false;
    } else if (!this.isRunning) {
      this.isRunning = true;
      if (!this.isBreakTime) {
        this.timeRemaining = this.settings.workDuration * 60;
        this.totalTime = this.timeRemaining;
        if (this.elements.timeLabel)
          this.elements.timeLabel.textContent = 'Work Time';
        if (this.elements.statusText)
          this.elements.statusText.textContent = 'Working - Focus time!';
        if (this.elements.statusDot)
          this.elements.statusDot.className = 'status-dot work';
      }
    }

    // Start the actual timer
    this.runTimer();

    // Update button states
    if (this.elements.startBtn) this.elements.startBtn.disabled = true;
    if (this.elements.pauseBtn) this.elements.pauseBtn.disabled = false;

    this.updateTimeDisplay();
    this.updateProgress();
  }

  runTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timer = setInterval(() => {
      if (!this.isPaused && this.isRunning) {
        this.timeRemaining--;
        this.updateTimeDisplay();
        this.updateProgress();

        if (this.timeRemaining <= 0) {
          this.handleTimerComplete();
        }
      }
    }, 1000);
  }

  async handleTimerComplete() {
    this.isRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
    }

    if (!this.isBreakTime) {
      // Work session completed, start break
      this.isBreakTime = true;
      this.timeRemaining = this.settings.breakDuration * 60;
      this.totalTime = this.timeRemaining;

      if (this.elements.timeLabel)
        this.elements.timeLabel.textContent = 'Break Time';
      if (this.elements.statusText)
        this.elements.statusText.textContent = 'Break time - Rest your eyes!';
      if (this.elements.statusDot)
        this.elements.statusDot.className = 'status-dot break';

      // Show break notification
      if (window.electronAPI && window.electronAPI.showBreakNotification) {
        await window.electronAPI.showBreakNotification(
          this.settings.breakDuration
        );
      }

      // Auto-start break timer
      this.isRunning = true;
      this.runTimer();
    } else {
      // Break completed
      this.handleBreakEnd();
    }

    this.updateTimeDisplay();
    this.updateProgress();
  }

  pauseTimer() {
    this.isPaused = !this.isPaused;

    if (this.elements.pauseBtn) {
      this.elements.pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';
    }
    if (this.elements.startBtn)
      this.elements.startBtn.disabled = this.isPaused ? false : true;
  }

  resetTimer() {
    this.isRunning = false;
    this.isPaused = false;
    this.isBreakTime = false;

    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timeRemaining = this.settings.workDuration * 60;
    this.totalTime = this.timeRemaining;

    // Reset UI
    if (this.elements.startBtn) {
      this.elements.startBtn.disabled = false;
      this.elements.startBtn.textContent = 'Start';
    }
    if (this.elements.pauseBtn) {
      this.elements.pauseBtn.disabled = true;
      this.elements.pauseBtn.textContent = 'Pause';
    }
    if (this.elements.timeLabel)
      this.elements.timeLabel.textContent = 'Work Time';
    if (this.elements.statusText)
      this.elements.statusText.textContent = 'Ready to start';
    if (this.elements.statusDot)
      this.elements.statusDot.className = 'status-dot';

    this.updateTimeDisplay();
    this.updateProgress();
  }

  async handleBreakEnd() {
    this.isBreakTime = false;
    this.isRunning = false;
    this.isPaused = false;

    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timeRemaining = this.settings.workDuration * 60;
    this.totalTime = this.timeRemaining;

    if (this.elements.startBtn) {
      this.elements.startBtn.disabled = false;
      this.elements.startBtn.textContent = 'Start';
    }
    if (this.elements.pauseBtn) {
      this.elements.pauseBtn.disabled = true;
      this.elements.pauseBtn.textContent = 'Pause';
    }
    if (this.elements.timeLabel)
      this.elements.timeLabel.textContent = 'Work Time';
    if (this.elements.statusText)
      this.elements.statusText.textContent = 'Ready for next work session';
    if (this.elements.statusDot)
      this.elements.statusDot.className = 'status-dot';

    // Show work notification
    if (window.electronAPI && window.electronAPI.showWorkNotification) {
      await window.electronAPI.showWorkNotification();
    }

    this.updateTimeDisplay();
    this.updateProgress();
  }

  updateTimeDisplay() {
    if (this.elements.timeDisplay) {
      const minutes = Math.floor(this.timeRemaining / 60);
      const seconds = this.timeRemaining % 60;
      this.elements.timeDisplay.textContent = `${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  updateProgress() {
    if (this.elements.progressFill && this.totalTime > 0) {
      const progress =
        ((this.totalTime - this.timeRemaining) / this.totalTime) * 100;
      this.elements.progressFill.style.width = `${progress}%`;
    }
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }

  // Cleanup method
  destroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.eyeRestApp = new EyeRestApp();
});

// Handle window close event
window.addEventListener('beforeunload', (event) => {
  if (window.eyeRestApp) {
    window.eyeRestApp.destroy();
  }

  if (window.electronAPI && window.electronAPI.onClose) {
    event.preventDefault();
    window.electronAPI.onClose();
  }
});
