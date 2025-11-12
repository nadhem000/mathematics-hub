// translation.js - Enhanced Translation Management System for Mathematics Hub
class TranslationManager {
    constructor() {
        this.currentLang = 'en';
        this._languageChangeTimeout = null;
        this._isInitialized = false;
        this.translations = {}; // Store all translations in one place
        this.init();
    }
    
    init() {
        if (this._isInitialized) return;
        
        this.loadAllTranslations();
        this.setupThemeToggle();
        this.setupLanguageSelector();
        this.setupAccessibility();
        this.loadSavedPreferences();
        this._isInitialized = true;
        
        console.log('Translation Manager initialized', this.translations);
    }
    
    loadAllTranslations() {
        // Manually load all translation objects into a unified structure
        this.translations = {
            'en': window.translations_en || {},
            'ar': window.translations_ar || {},
            'fr': window.translations_fr || {}
        };
        
        console.log('Loaded translations:', this.translations);
    }
    
    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;
        
        themeToggle.setAttribute('aria-label', 'Toggle theme');
        themeToggle.setAttribute('role', 'button');
        themeToggle.setAttribute('tabindex', '0');
        
        themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        themeToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        this.persistSetting('theme', newTheme);
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const themeIcon = themeToggle.querySelector('span:last-child');
            this.updateThemeIcon(newTheme, themeIcon);
        }
    }
    
    updateThemeIcon(theme, themeIcon) {
        if (themeIcon) {
            themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
            themeIcon.setAttribute('aria-label', `${theme} mode`);
        }
    }
    
    setupLanguageSelector() {
        const languageBtn = document.getElementById('languageBtn');
        const languageDropdown = document.getElementById('languageDropdown');
        
        if (!languageBtn || !languageDropdown) {
            console.error('Language button or dropdown not found');
            return;
        }
        
        languageBtn.setAttribute('aria-haspopup', 'true');
        languageBtn.setAttribute('aria-expanded', 'false');
        
        languageBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = languageBtn.getAttribute('aria-expanded') === 'true';
            languageBtn.setAttribute('aria-expanded', !isExpanded);
            languageDropdown.classList.toggle('MH-show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!languageBtn.contains(e.target) && !languageDropdown.contains(e.target)) {
                languageDropdown.classList.remove('MH-show');
                languageBtn.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Handle language option clicks
        languageDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            const option = e.target.closest('.MH-language-option');
            if (option) {
                const lang = option.getAttribute('data-lang');
                if (lang) {
                    console.log('Language selected:', lang);
                    this.changeLanguage(lang);
                    languageDropdown.classList.remove('MH-show');
                    languageBtn.setAttribute('aria-expanded', 'false');
                }
            }
        });
        
        // Keyboard navigation for dropdown
        languageDropdown.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                languageDropdown.classList.remove('MH-show');
                languageBtn.setAttribute('aria-expanded', 'false');
                languageBtn.focus();
            }
        });
    }
    
    setupAccessibility() {
        // Add skip to main content link for screen readers
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'MH-skip-link';
        skipLink.textContent = 'Skip to main content';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: #007bff;
            color: white;
            padding: 8px;
            z-index: 10000;
            text-decoration: none;
            border-radius: 4px;
        `;
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Add main content id if not exists
        const mainContent = document.querySelector('.MH-container') || document.querySelector('main');
        if (mainContent && !mainContent.id) {
            mainContent.id = 'main-content';
        }
    }
    
    loadSavedPreferences() {
        try {
            // Load saved theme
            const savedTheme = this.getSetting('theme') || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
            
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                const themeIcon = themeToggle.querySelector('span:last-child');
                this.updateThemeIcon(savedTheme, themeIcon);
            }
            
            // Load saved language
            const savedLang = this.getSetting('language') || 'en';
            this.changeLanguage(savedLang, false);
        } catch (error) {
            console.warn('Failed to load saved preferences:', error);
        }
    }
    
    changeLanguage(lang, saveToStorage = true) {
        console.log('Changing language to:', lang);
        
        if (this._languageChangeTimeout) {
            clearTimeout(this._languageChangeTimeout);
        }
        
        this._languageChangeTimeout = setTimeout(() => {
            this._performLanguageChange(lang, saveToStorage);
        }, 150);
    }
updateLogoTooltip(lang) {
    const logoLink = document.querySelector('.MH-logo-link');
    if (logoLink) {
        const tooltipText = this.getTranslationText(lang, 'MH.general.homeTooltip') || 'Go to Homepage';
        logoLink.setAttribute('data-tooltip', tooltipText);
        logoLink.setAttribute('aria-label', tooltipText);
    }
}
    
    _performLanguageChange(lang, saveToStorage = true) {
        console.log('Performing language change to:', lang, 'Available:', Object.keys(this.translations));
        
        this.setLoadingState(true);
        
        try {
            this.currentLang = lang;
            
            // Check if we have translations for this language
            if (!this.translations[lang] || Object.keys(this.translations[lang]).length === 0) {
                console.warn(`No translations available for language: ${lang}`);
                if (lang !== 'en') {
                    console.log('Falling back to English');
                    this._performLanguageChange('en', saveToStorage);
                    return;
                }
            }
            
            // Apply translations
            const elementsTranslated = this.applyTranslations(lang);
            console.log(`Applied ${elementsTranslated} translations for ${lang}`);
            
            if (elementsTranslated === 0) {
                console.warn('No elements were translated');
            }
            
            // Update HTML attributes
            document.documentElement.lang = lang;
            document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
            
            // Update UI elements
            this.updateLanguageButton(lang);
            this.updateSolutionButtons(lang);
            this.updateThemeToggleText(lang);
    this.updateLogoTooltip(lang);
            
            // Save preference
            if (saveToStorage) {
                this.persistSetting('language', lang);
            }
            
            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('languageChanged', {
                detail: { language: lang }
            }));
            
        } catch (error) {
            console.error('Error during language change:', error);
        } finally {
            this.setLoadingState(false);
        }
    }
    
    setLoadingState(isLoading) {
        const container = document.querySelector('.MH-container');
        if (container) {
            container.classList.toggle('MH-loading', isLoading);
        }
    }
    
    applyTranslations(lang) {
        let elementsTranslated = 0;
        const translations = this.translations[lang];
        
        if (!translations) {
            console.error(`No translations found for language: ${lang}`);
            return 0;
        }
        
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[key]) {
                if (element.tagName === 'INPUT' && element.type === 'button') {
                    element.value = translations[key];
                } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translations[key];
                } else {
                    element.textContent = translations[key];
                }
                elementsTranslated++;
            } else {
                console.warn(`Translation key not found: ${key} for language: ${lang}`);
            }
        });
        
        return elementsTranslated;
    }
    
    updateLanguageButton(lang) {
        const languageBtnText = document.querySelector('.MH-language-btn span:first-child');
        if (languageBtnText) {
            const translationText = this.getTranslationText(lang, 'MH.general.language') || 'Language';
            languageBtnText.textContent = translationText;
        }
    }
    
    updateThemeToggleText(lang) {
        const themeToggleText = document.querySelector('.MH-theme-toggle span:first-child');
        if (themeToggleText) {
            const translationText = this.getTranslationText(lang, 'MH.general.theme') || 'Theme';
            themeToggleText.textContent = translationText;
        }
    }
    
    updateSolutionButtons(lang) {
        document.querySelectorAll('.MH-solution-btn').forEach(button => {
            const solutionId = this.getSolutionIdFromButton(button);
            if (!solutionId) return;
            
            const solution = document.getElementById(`solution${solutionId}`);
            if (solution) {
                const showText = this.getTranslationText(lang, 'MH.lesson_Y1Al_eqdeg1a.showSolution') || 
                                this.getTranslationText(lang, 'MH.lesson_Y1Al_eqdeg1b.showSolution') || 
                                this.getTranslationText(lang, 'MH.lesson3eqdeg1.showSolution') || 
                                'Show Solution';
                const hideText = this.getTranslationText(lang, 'MH.lesson_Y1Al_eqdeg1a.hideSolution') || 
                                this.getTranslationText(lang, 'MH.lesson_Y1Al_eqdeg1b.hideSolution') || 
                                this.getTranslationText(lang, 'MH.lesson3eqdeg1.hideSolution') || 
                                'Hide Solution';
                
                if (solution.classList.contains('MH-show')) {
                    button.textContent = hideText;
                } else {
                    button.textContent = showText;
                }
                
                button.setAttribute('aria-label', `${button.textContent} for problem ${solutionId}`);
            }
        });
    }
    
    getTranslationText(lang, key) {
        return this.translations[lang] ? this.translations[lang][key] : null;
    }
    
    getSolutionIdFromButton(button) {
        const onclick = button.getAttribute('onclick');
        if (!onclick) return null;
        
        const match = onclick.match(/toggleSolution\((\d+)\)/);
        return match ? match[1] : null;
    }
    
    // Utility methods for persistence
    persistSetting(key, value) {
        try {
            localStorage.setItem(`mh_${key}`, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn('Failed to persist setting:', error);
            return false;
        }
    }
    
    getSetting(key) {
        try {
            const value = localStorage.getItem(`mh_${key}`);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.warn('Failed to get setting:', error);
            return null;
        }
    }
    
    // Toggle solution visibility
    toggleSolution(id) {
        const solution = document.getElementById(`solution${id}`);
        if (!solution) {
            console.warn(`Solution element with id 'solution${id}' not found`);
            return;
        }
        
        const isShowing = solution.classList.contains('MH-show');
        solution.classList.toggle('MH-show');
        
        solution.setAttribute('aria-hidden', !isShowing);
        solution.setAttribute('aria-expanded', isShowing);
        
        const button = solution.previousElementSibling;
        if (!button || !button.classList.contains('MH-solution-btn')) {
            console.warn('Solution button not found');
            return;
        }
        
        const showText = this.getTranslationText(this.currentLang, 'MH.lesson_Y1Al_eqdeg1a.showSolution') || 
                        this.getTranslationText(this.currentLang, 'MH.lesson_Y1Al_eqdeg1b.showSolution') || 
                        this.getTranslationText(this.currentLang, 'MH.lesson3eqdeg1.showSolution') || 
                        'Show Solution';
        const hideText = this.getTranslationText(this.currentLang, 'MH.lesson_Y1Al_eqdeg1a.hideSolution') || 
                        this.getTranslationText(this.currentLang, 'MH.lesson_Y1Al_eqdeg1b.hideSolution') || 
                        this.getTranslationText(this.currentLang, 'MH.lesson3eqdeg1.hideSolution') || 
                        'Hide Solution';
        
        if (solution.classList.contains('MH-show')) {
            button.textContent = hideText;
            button.setAttribute('aria-label', `Hide solution for problem ${id}`);
        } else {
            button.textContent = showText;
            button.setAttribute('aria-label', `Show solution for problem ${id}`);
        }
        
        window.dispatchEvent(new CustomEvent('solutionToggled', {
            detail: { 
                solutionId: id, 
                isVisible: solution.classList.contains('MH-show') 
            }
        }));
    }
    
    getCurrentLanguage() {
        return this.currentLang;
    }
    
    getAvailableLanguages() {
        return Object.keys(this.translations).filter(lang => 
            this.translations[lang] && Object.keys(this.translations[lang]).length > 0
        );
    }
    
    destroy() {
        if (this._languageChangeTimeout) {
            clearTimeout(this._languageChangeTimeout);
        }
        
        const themeToggle = document.getElementById('themeToggle');
        const languageBtn = document.getElementById('languageBtn');
        
        if (themeToggle) {
            themeToggle.replaceWith(themeToggle.cloneNode(true));
        }
        if (languageBtn) {
            languageBtn.replaceWith(languageBtn.cloneNode(true));
        }
        
        this._isInitialized = false;
        console.log('Translation Manager destroyed');
    }
}

// Make toggleSolution globally available
window.toggleSolution = function(id) {
    if (window.translationManager) {
        window.translationManager.toggleSolution(id);
    } else {
        console.error('Translation Manager not initialized');
    }
};

// Initialize when DOM is ready
const domReady = (callback) => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
};

domReady(() => {
    try {
        window.translationManager = new TranslationManager();
        
        window.addEventListener('error', (event) => {
            console.error('Global error caught:', event.error);
        });
        
    } catch (error) {
        console.error('Failed to initialize Translation Manager:', error);
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TranslationManager;
}