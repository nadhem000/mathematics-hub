// PWA Install Manager for Mathematics Hub
class PWAInstallManager {
    constructor() {
        this.deferredPrompt = null;
        this.installButton = null;
        this.isInstalled = false;
        this.init();
    }

    init() {
        this.createInstallButton();
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

        // Check if user has already installed the app
        window.addEventListener('load', () => {
            this.checkInstallStatus();
        });
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
        // Could show a toast notification here
        console.log('App installed successfully!');
        
        // Optional: Show a success message to the user
        const successMsg = document.createElement('div');
        successMsg.className = 'MH-install-success';
        successMsg.innerHTML = `
            <div class="MH-install-success-content">
                <span>🎉 </span>
                <span data-i18n="MH.general.installSuccess">Mathematics Hub installed successfully!</span>
            </div>
        `;
        successMsg.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--primary);
            color: white;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: var(--MH-shadow-hover);
            z-index: 10000;
            animation: MH-slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(successMsg);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (successMsg.parentNode) {
                successMsg.parentNode.removeChild(successMsg);
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
.MH-install-btn {
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

.MH-install-btn:hover {
    background-color: rgba(255, 255, 255, 0.3);
    color: white;
    border-color: white;
    transform: translateY(-2px);
    box-shadow: var(--MH-shadow-hover);
}

.MH-install-btn:active {
    transform: translateY(0);
}

.MH-install-btn:focus {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
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

/* RTL support for install button */
[dir="rtl"] .MH-install-btn {
    direction: rtl;
}

/* Responsive design */
@media (max-width: 768px) {
    .MH-install-btn {
        width: 100%;
        justify-content: center;
        margin-top: 0.5rem;
    }
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = installStyles;
document.head.appendChild(styleSheet);