# Mathematics Hub

A comprehensive Progressive Web App for learning mathematics, featuring interactive lessons, practice problems, and calculators for algebra and geometry. Built with modern web technologies and designed for seamless cross-platform use.

## Features

- 📚 **Interactive Lessons**: Step-by-step algebra and geometry tutorials
- 🌍 **Multi-language Support**: English, Arabic, and French
- 🎨 **Theme System**: Light and dark mode with color-coded subjects
- 📱 **PWA Ready**: Installable on any device with offline capability
- 🎯 **Student-Focused**: Curriculum-aligned content for secondary education
- ♿ **Accessible**: Full keyboard navigation and screen reader support

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **PWA**: Service Workers, Web App Manifest
- **Styling**: CSS Grid, Flexbox, CSS Variables
- **i18n**: Custom translation system
- **Deployment**: Netlify (configured with netlify.toml)

## Project Structure

```
mathematics-hub/
├── index.html                 # Main landing page
├── lesson_Y1Al_eqdeg1a.html   # Algebra lesson example
├── styles/
│   └── main.css              # Comprehensive styling system
├── scripts/
│   ├── translation.js        # Multi-language manager
│   ├── i18n_en.js           # English translations
│   ├── i18n_ar.js           # Arabic translations
│   ├── i18n_fr.js           # French translations
│   └── pwa-install.js       # PWA installation manager
├── assets/
│   └── icons/               # PWA icons (multiple sizes)
├── sw.js                    # Service Worker
├── manifest.json            # PWA manifest
├── netlify.toml            # Deployment configuration
└── README.md               # This file
```

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Local server for development (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/nadhem000/mathematics-hub.git
```

2. Serve the files using a local server:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

3. Open your browser and navigate to `http://localhost:8000`

### Development

The project uses vanilla JavaScript and CSS without build tools, making it easy to modify:

- Edit HTML files for content structure
- Modify CSS variables in `main.css` for theming
- Add translation keys in the i18n files for new languages
- Update `manifest.json` for PWA metadata

## PWA Features

- **Installable**: Add to home screen on mobile and desktop
- **Offline Support**: Core content available without internet
- **Fast Loading**: Service worker caching for instant access
- **App-like Experience**: Standalone mode without browser UI

## Supported Browsers

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the GNU License - see the [LICENSE](LICENSE) file for details.

## Author

**Mejri Ziad**
- GitHub: [@nadhem000](https://github.com/nadhem000)

## Acknowledgments

- Curriculum aligned with secondary education standards
- Icons from [Material Design Icons]
- Color schemes optimized for accessibility

- RTL support for Arabic language
