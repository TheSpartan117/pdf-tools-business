# PDFguruji

**Your PDF Expert** - Free online PDF tools for everyone.

Professional PDF tools that work directly in your browser. Merge, split, compress, convert, and edit PDFs securely with no sign-ups required.

## Features

- 🔄 **Convert & Transform** - PDF to Word, Word to PDF, Images to PDF
- 📄 **Organize & Edit** - Merge, split, rotate, extract pages
- 🗜️ **Optimize** - Compress PDFs while maintaining quality
- 📝 **Extract** - OCR text extraction from scanned documents
- 🔒 **100% Secure** - All processing happens in your browser
- 🌐 **No Sign-up** - Use all tools instantly, no account needed

## Tech Stack

- **Frontend:** Vanilla JavaScript, Tailwind CSS
- **Backend:** Python FastAPI
- **Processing:** PDF.js, pdf-lib, Tesseract OCR

## Local Development

### Prerequisites
- Node.js 16.x or higher
- npm 7.x or higher

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pdf-tools-business
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file (optional):
```bash
cp .env.example .env
# Edit .env with your AdSense client ID if you have one
```

4. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm test` - Run tests (placeholder for now)

## Project Structure

```
pdf-tools-business/
├── src/
│   ├── css/
│   │   └── styles.css          # Tailwind and custom styles
│   ├── js/
│   │   ├── main.js             # Application initialization
│   │   ├── router.js           # Client-side routing
│   │   ├── utils/
│   │   │   └── pdf-processor.js # PDF processing utilities
│   │   ├── pages/
│   │   │   ├── home.js         # Home page
│   │   │   ├── merge.js        # Merge PDF tool
│   │   │   ├── split.js        # Split PDF tool
│   │   │   ├── compress.js     # Compress PDF tool
│   │   │   └── pdf-to-image.js # PDF to Images tool
│   │   └── components/
│   │       ├── header.js       # Site header
│   │       ├── footer.js       # Site footer
│   │       └── adsense.js      # AdSense integration
│   └── pages/
│       ├── privacy.html        # Privacy Policy page
│       ├── terms.html          # Terms of Service page
│       ├── about.html          # About page
│       └── contact.html        # Contact page
├── public/
│   └── favicon.svg             # Site favicon
├── docs/
│   ├── adsense-setup.md        # AdSense integration guide
│   └── deployment-checklist.md # Deployment instructions
├── index.html                  # Main HTML entry point
├── netlify.toml                # Netlify configuration
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind configuration
└── package.json                # Dependencies and scripts
```

## Deployment

### Netlify Deployment

1. Push your code to GitHub/GitLab/Bitbucket

2. Log in to [Netlify](https://netlify.com)

3. Click "New site from Git"

4. Connect your repository

5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

6. Add environment variables (if using AdSense):
   - `VITE_ADSENSE_CLIENT_ID`: Your AdSense publisher ID

7. Click "Deploy site"

For detailed deployment instructions, see [docs/deployment-checklist.md](docs/deployment-checklist.md)

### Custom Domain

After deployment, you can add a custom domain:
1. Go to Site settings > Domain management
2. Add custom domain
3. Follow DNS configuration instructions
4. Enable HTTPS (automatic with Netlify)

## Configuration

### Google AdSense (Optional)

To enable AdSense ads:

1. Get approved for Google AdSense
2. Copy your publisher ID (format: `ca-pub-XXXXXXXXXXXXXXXX`)
3. Add to `.env` file:
   ```
   VITE_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
   ```
4. Rebuild and redeploy

See [docs/adsense-setup.md](docs/adsense-setup.md) for detailed instructions.

### Google Analytics (Optional)

To add Google Analytics:

1. Create GA4 property
2. Get tracking ID
3. Add to `.env` file:
   ```
   VITE_GA_TRACKING_ID=G-XXXXXXXXXX
   ```
4. Rebuild and redeploy

## Browser Support

- Chrome/Edge: 90+
- Firefox: 88+
- Safari: 14+
- Mobile browsers: iOS Safari 14+, Chrome Android 90+

## Performance

- Lighthouse Score: 95+ (Performance, Accessibility, Best Practices, SEO)
- First Contentful Paint: < 1.5s
- Time to Interactive: < 2.5s
- Bundle size: ~500KB (gzipped)

## Privacy & Security

- All PDF processing happens client-side
- No data is sent to external servers
- No cookies or tracking (unless AdSense/Analytics enabled)
- HTTPS enforced
- Secure headers configured

## License

MIT License - feel free to use for personal or commercial projects

## Contact

For questions, suggestions, or issues:
- GitHub Issues: [repository-url]/issues
- Email: [your-email]
- Website: [your-website]

## Acknowledgments

Built with:
- [pdf-lib](https://github.com/Hopding/pdf-lib) - PDF creation and manipulation
- [PDF.js](https://github.com/mozilla/pdf.js) - PDF rendering
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling

---

Made with care for privacy-conscious users
