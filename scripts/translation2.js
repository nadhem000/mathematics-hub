// translation2.js - Reusable theme and translation management for Mathematics Hub

const MHThemeManager = {
    // Initialize theme management
    init: function(translations, defaultLang = 'en') {
        this.translations = translations;
        this.currentLang = localStorage.getItem('language') || defaultLang;
        this.themeToggle = document.getElementById('themeToggle');
        this.languageBtn = document.getElementById('languageBtn');
        this.languageDropdown = document.getElementById('languageDropdown');
        this.notificationBtn = document.getElementById('notificationBtn');
        
        this.initTheme();
        this.initLanguage();
        this.initNotifications();
    },

    // Theme management
    initTheme: function() {
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        const currentTheme = localStorage.getItem('theme') || 
                            (prefersDarkScheme.matches ? 'dark' : 'light');

        document.documentElement.setAttribute('data-theme', currentTheme);
        this.updateThemeToggleText(currentTheme);

        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    },

    toggleTheme: function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeToggleText(newTheme);
    },

    updateThemeToggleText: function(theme) {
        if (!this.themeToggle) return;
        
        const themeIcon = this.themeToggle.querySelector('span:last-child');
        if (theme === 'dark') {
            themeIcon.textContent = '☀️';
        } else {
            themeIcon.textContent = '🌙';
        }
    },

    // Language management
    initLanguage: function() {
        this.applyLanguage(this.currentLang);

        if (this.languageBtn && this.languageDropdown) {
            this.languageBtn.addEventListener('click', () => this.toggleLanguageDropdown());
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (event) => {
                if (!this.languageBtn.contains(event.target) && !this.languageDropdown.contains(event.target)) {
                    this.languageDropdown.style.display = 'none';
                }
            });

            // Language selection
            document.querySelectorAll('.MH-language-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    e.preventDefault();
                    const lang = option.getAttribute('data-lang');
                    this.applyLanguage(lang);
                    localStorage.setItem('language', lang);
                    this.languageDropdown.style.display = 'none';
                });
            });
        }
    },

    toggleLanguageDropdown: function() {
        if (!this.languageDropdown) return;
        this.languageDropdown.style.display = 
            this.languageDropdown.style.display === 'block' ? 'none' : 'block';
    },

    applyLanguage: function(lang) {
    this.currentLang = lang;
    document.documentElement.lang = lang;
    
    // Set direction based on language
    if (lang === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
    } else {
        document.documentElement.setAttribute('dir', 'ltr');
    }
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (this.translations[lang] && this.translations[lang][key]) {
            element.innerHTML = this.translations[lang][key];
        }
    });
    
    // Re-render KaTeX after language change
    setTimeout(() => {
        if (typeof renderMathInElement !== 'undefined') {
            renderMathInElement(document.body, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false},
                    {left: '\\(', right: '\\)', display: false},
                    {left: '\\[', right: '\\]', display: true}
                ],
                throwOnError: false
            });
        }
    }, 100);
        
        // Update language button text
        if (this.languageBtn) {
            const langText = this.languageBtn.querySelector('span:first-child');
            if (this.translations[lang] && this.translations[lang]['MH.general.language']) {
                langText.textContent = this.translations[lang]['MH.general.language'];
            }
        }
        
        // Update notification button text
        if (this.notificationBtn) {
            const notificationSpan = this.notificationBtn.querySelector('span[data-i18n]');
            if (notificationSpan && this.translations[lang] && this.translations[lang]['MH.general.enableNotifications']) {
                notificationSpan.textContent = this.translations[lang]['MH.general.enableNotifications'];
            }
        }
        
        // Redraw geometry elements after language change
        setTimeout(() => {
            if (typeof MHGeometry !== 'undefined') {
                MHGeometry.redrawGeometry();
            }
        }, 200);
    },

    // Notification management
    initNotifications: function() {
        this.checkNotificationPermission();
        
        if (this.notificationBtn) {
            this.notificationBtn.addEventListener('click', () => this.requestNotificationPermission());
        }
    },

    checkNotificationPermission: function() {
        if (!('Notification' in window) || !this.notificationBtn) {
            this.notificationBtn.style.display = 'none';
            return;
        }

        if (Notification.permission === 'granted') {
            this.notificationBtn.style.display = 'none';
        } else if (Notification.permission === 'default') {
            this.notificationBtn.style.display = 'flex';
        } else {
            this.notificationBtn.style.display = 'none';
        }
    },

    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                this.notificationBtn.style.display = 'none';
                this.showNotificationSuccess();
                
                // Notify service worker
                if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                    navigator.serviceWorker.controller.postMessage({
                        type: 'NOTIFICATION_PERMISSION_GRANTED'
                    });
                }
            } else if (permission === 'denied') {
                this.notificationBtn.style.display = 'none';
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
        }
    },

    showNotificationSuccess: function() {
        this.showMessage(
            '🔔 ' + (this.translations[this.currentLang] && this.translations[this.currentLang]['MH.general.notificationEnabled'] ? 
                this.translations[this.currentLang]['MH.general.notificationEnabled'] : 
                'Notifications enabled! You will now receive updates.'
            ),
            'success'
        );
    },

    showMessage: function(text, type = 'info') {
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
    },

    // Utility function to get current language
    getCurrentLanguage: function() {
        return this.currentLang;
    }
};

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Note: You need to define 'translations' object in your page before this loads
        if (typeof translations !== 'undefined') {
            MHThemeManager.init(translations);
        }
    });
} else {
    if (typeof translations !== 'undefined') {
        MHThemeManager.init(translations);
    }
}