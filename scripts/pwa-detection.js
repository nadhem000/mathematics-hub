// PWA Detection and Installation
class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                           window.navigator.standalone === true;
        this.init();
    }

    init() {
        this.detectPWA();
        this.setupInstallPrompt();
        this.createInstallUI();
    }

    detectPWA() {
        if (this.isStandalone) {
            console.log('PWA is running in standalone mode');
            document.documentElement.classList.add('pwa-standalone');
        }
    }

    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        window.addEventListener('appinstalled', (e) => {
            console.log('PWA was installed');
            this.deferredPrompt = null;
            this.hideInstallButton();
        });
    }

    createInstallUI() {
        // This will be integrated with the existing pwa-install.js
        if (!this.isStandalone && this.deferredPrompt) {
            this.showInstallButton();
        }
    }

    showInstallButton() {
        const installBtn = document.querySelector('.MH-install-btn');
        if (installBtn) {
            installBtn.style.display = 'flex';
        }
    }

    hideInstallButton() {
        const installBtn = document.querySelector('.MH-install-btn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
    }

    async installPWA() {
        if (!this.deferredPrompt) {
            return false;
        }

        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            this.deferredPrompt = null;
            return true;
        }
        return false;
    }
}

// Initialize PWA Manager
document.addEventListener('DOMContentLoaded', () => {
    window.pwaManager = new PWAManager();
});