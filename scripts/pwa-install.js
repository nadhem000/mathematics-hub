// PWA Install Manager for Mathematics Hub
class PWAInstallManager {
    constructor() {
        this.deferredPrompt = null;
        this.installButton = null;
        this.notificationButton = null;
        this.isInstalled = false;
        this.init();
    }

    init() {
        this.createInstallButton();
        this.createNotificationButton();
        this.setupEventListeners();
        this.checkInstallStatus();
    }

    createInstallButton() {
        // Create install button element
        this.installButton = document.createElement('button');
        this.installButton.className = 'MH-install-btn';
        this.installButton.innerHTML = `
            <span data-i18n="MH.general.install">Install App</span>
            <span>📱</span>
        `;
        this.installButton.style.display = 'none';

        // Add to header controls
        const headerControls = document.querySelector('.MH-header-controls');
        if (headerControls) {
            headerControls.appendChild(this.installButton);
        }
    }

    createNotificationButton() {
        // Create notification permission button
        this.notificationButton = document.createElement('button');
        this.notificationButton.className = 'MH-notification-btn';
        this.notificationButton.innerHTML = `
            <span data-i18n="MH.general.enableNotifications">Enable Notifications</span>
            <span>🔔</span>
        `;
        this.notificationButton.style.display = 'none';

        // Add to header controls
        const headerControls = document.querySelector('.MH-header-controls');
        if (headerControls) {
            headerControls.appendChild(this.notificationButton);
        }
    }

    setupEventListeners() {
        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('beforeinstallprompt event fired');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        // Listen for app installed event
        window.addEventListener('appinstalled', (e) => {
            console.log('PWA was installed');
            this.isInstalled = true;
            this.hideInstallButton();
            this.showInstallSuccess();
        });

        // Install button click handler
        if (this.installButton) {
            this.installButton.addEventListener('click', () => {
                this.installApp();
            });
        }

        // Notification button click handler
        if (this.notificationButton) {
            this.notificationButton.addEventListener('click', () => {
                this.requestNotificationPermission();
            });
        }

        // Check notification permission status
        this.checkNotificationPermission();

        // Check if user has already installed the app
        window.addEventListener('load', () => {
            this.checkInstallStatus();
        });

        // Listen for service worker messages
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'REQUEST_NOTIFICATION_PERMISSION') {
                    this.requestNotificationPermission();
                }
            });
        }
    }

    showInstallButton() {
        if (this.installButton && !this.isInstalled) {
            this.installButton.style.display = 'flex';
            this.installButton.setAttribute('aria-label', 'Install Mathematics Hub as an app');
        }
    }

    hideInstallButton() {
        if (this.installButton) {
            this.installButton.style.display = 'none';
        }
    }

    showNotificationButton() {
        if (this.notificationButton && Notification.permission === 'default') {
            this.notificationButton.style.display = 'flex';
        }
    }

    hideNotificationButton() {
        if (this.notificationButton) {
            this.notificationButton.style.display = 'none';
        }
    }

    async installApp() {
        if (!this.deferredPrompt) {
            console.log('No install prompt available');
            return;
        }

        try {
            // Show the install prompt
            this.deferredPrompt.prompt();
            
            // Wait for the user to respond to the prompt
            const { outcome } = await this.deferredPrompt.userChoice;
            
            console.log(`User response to the install prompt: ${outcome}`);
            
            // We've used the prompt, and can't use it again, so clear it
            this.deferredPrompt = null;
            
            if (outcome === 'accepted') {
                this.hideInstallButton();
            }
        } catch (error) {
            console.error('Error during installation:', error);
        }
    }

    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            console.log('Notification permission:', permission);
            
            if (permission === 'granted') {
                this.hideNotificationButton();
                this.showNotificationSuccess();
                
                // Notify service worker that permission was granted
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.controller.postMessage({
                        type: 'NOTIFICATION_PERMISSION_GRANTED'
                    });
                }
            } else if (permission === 'denied') {
                console.log('Notification permission denied');
                this.hideNotificationButton();
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
        }
    }

    checkNotificationPermission() {
        if (!('Notification' in window)) {
            return;
        }

        if (Notification.permission === 'granted') {
            this.hideNotificationButton();
        } else if (Notification.permission === 'default') {
            this.showNotificationButton();
        } else {
            this.hideNotificationButton();
        }
    }

    checkInstallStatus() {
        // Check if the app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('App is running in standalone mode');
            this.isInstalled = true;
            this.hideInstallButton();
        }

        // Check for other installation indicators
        if (window.navigator.standalone === true) {
            this.isInstalled = true;
            this.hideInstallButton();
        }
    }

    showInstallSuccess() {
        console.log('App installed successfully!');
        
        // Show success message
        this.showMessage(
            '🎉 ' + (window.translationManager ? 
                window.translationManager.getTranslationText(window.translationManager.getCurrentLanguage(), 'MH.general.installSuccess') : 
                'Mathematics Hub installed successfully!'
            ),
            'success'
        );
    }

    showNotificationSuccess() {
        this.showMessage(
            '🔔 Notifications enabled! You will now receive updates.',
            'success'
        );
    }

    showMessage(text, type = 'info') {
        const message = document.createElement('div');
        message.className = `MH-message MH-message-${type}`;
        message.innerHTML = `
            <div class="MH-message-content">
                <span>${text}</span>
            </div>
        `;
        
        document.body.appendChild(message);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 3000);
    }

    // Method to manually trigger install prompt (for testing)
    triggerInstall() {
        this.installApp();
    }

    // Check if installation is available
    isInstallAvailable() {
        return this.deferredPrompt !== null;
    }

    // Get installation status
    getInstallStatus() {
        return this.isInstalled;
    }
}

// Initialize PWA Install Manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.pwaInstallManager = new PWAInstallManager();
});

// Add CSS for install button and animations
const installStyles = `
.MH-install-btn,
.MH-notification-btn {
    background-color: rgba(255, 255, 255, 0.2);
    color: var(--header-text);
    border: 2px solid rgba(255, 255, 255, 0.5);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    min-height: 44px;
}

.MH-install-btn:hover,
.MH-notification-btn:hover {
    background-color: rgba(255, 255, 255, 0.3);
    color: white;
    border-color: white;
    transform: translateY(-2px);
    box-shadow: var(--MH-shadow-hover);
}

.MH-install-btn:active,
.MH-notification-btn:active {
    transform: translateY(0);
}

.MH-install-btn:focus,
.MH-notification-btn:focus {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
}

.MH-message {
    position: fixed;
    top: 100px;
    right: 20px;
    color: white;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: var(--MH-shadow-hover);
    z-index: 10000;
    animation: MH-slideInRight 0.3s ease;
    max-width: 300px;
}

.MH-message-success {
    background: var(--primary);
}

.MH-message-info {
    background: var(--info);
}

@keyframes MH-slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

/* RTL support for buttons */
[dir="rtl"] .MH-install-btn,
[dir="rtl"] .MH-notification-btn {
    direction: rtl;
}

/* Responsive design */
@media (max-width: 768px) {
    .MH-install-btn,
    .MH-notification-btn {
        width: 100%;
        justify-content: center;
        margin-top: 0.5rem;
    }
    
    .MH-message {
        right: 10px;
        left: 10px;
        max-width: none;
    }
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = installStyles;
document.head.appendChild(styleSheet);