# PDFguruji Rebrand Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebrand from "PDFPro Tools Suite" to "PDFguruji" with new logo, colors, and brand identity across all frontend assets.

**Architecture:** Update all frontend components, HTML meta tags, and static assets to reflect the new PDFguruji brand. No backend changes needed. The rebrand includes a new gradient logo (saffron to deep blue), updated color scheme, and brand messaging focused on expertise and guidance.

**Tech Stack:** Vanilla JavaScript, HTML5, SVG, Tailwind CSS

---

## Task 1: Create New Logo SVG

**Files:**
- Create: `src/assets/logo.svg`

**Step 1: Create assets directory**

Run: `mkdir -p src/assets`
Expected: Directory created

**Step 2: Create logo SVG file**

Create file: `src/assets/logo.svg`

```svg
<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF6B35;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1E3A8A;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Back layer (subtle depth) -->
  <path d="M10 8h18c1.1 0 2 .9 2 2v20c0 1.1-.9 2-2 2H10c-1.1 0-2-.9-2-2V10c0-1.1.9-2 2-2z" fill="url(#brand-gradient)" opacity="0.3"/>

  <!-- Middle layer -->
  <path d="M12 5h18c1.1 0 2 .9 2 2v20c0 1.1-.9 2-2 2H12c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2z" fill="url(#brand-gradient)" opacity="0.6"/>

  <!-- Front layer with document fold -->
  <path d="M14 2h14l6 6v18c0 1.1-.9 2-2 2H14c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2z" fill="url(#brand-gradient)"/>
  <path d="M28 2v6h6" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>

  <!-- Wisdom crown at top -->
  <path d="M20 1l2 3h-4z" fill="#F59E0B"/>

  <!-- PDF text mark -->
  <text x="20" y="21" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="white" text-anchor="middle">PDF</text>
</svg>
```

**Step 3: Verify logo renders correctly**

Run: Open `src/assets/logo.svg` in browser or VS Code
Expected: See layered documents with gradient, gold crown, and "PDF" text

**Step 4: Commit**

```bash
git add src/assets/logo.svg
git commit -m "feat: add PDFguruji brand logo

New logo featuring:
- Three layered documents with saffron-to-blue gradient
- Gold wisdom crown at top
- PDF text mark
- Professional yet friendly aesthetic

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 2: Update Header Component with New Logo

**Files:**
- Modify: `src/js/components/header.js`

**Step 1: Read current header.js**

Run: `cat src/js/components/header.js`
Expected: See current header with PDFPro branding

**Step 2: Update header.js with new logo and brand**

Replace the entire logo section (lines 7-29) with:

```javascript
        <a href="#/" class="flex items-center cursor-pointer group">
          <svg class="h-10 w-10 mr-3 transform transition-transform group-hover:scale-105" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#FF6B35;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#1E3A8A;stop-opacity:1" />
              </linearGradient>
            </defs>
            <!-- Back layer -->
            <path d="M10 8h18c1.1 0 2 .9 2 2v20c0 1.1-.9 2-2 2H10c-1.1 0-2-.9-2-2V10c0-1.1.9-2 2-2z" fill="url(#brand-gradient)" opacity="0.3"/>
            <!-- Middle layer -->
            <path d="M12 5h18c1.1 0 2 .9 2 2v20c0 1.1-.9 2-2 2H12c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2z" fill="url(#brand-gradient)" opacity="0.6"/>
            <!-- Front layer -->
            <path d="M14 2h14l6 6v18c0 1.1-.9 2-2 2H14c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2z" fill="url(#brand-gradient)"/>
            <path d="M28 2v6h6" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>
            <!-- Wisdom crown -->
            <path d="M20 1l2 3h-4z" fill="#F59E0B"/>
            <!-- PDF text -->
            <text x="20" y="21" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="white" text-anchor="middle">PDF</text>
          </svg>
          <div class="flex flex-col">
            <span class="text-xl font-bold text-gray-900 leading-tight">PDF<span style="color:#FF6B35">guruji</span></span>
            <span class="text-xs text-gray-500 leading-tight">Your PDF Expert</span>
          </div>
        </a>
```

**Step 3: Verify header visually**

Run: `npm run dev` and open http://localhost:5173
Expected: See new PDFguruji logo and brand name in header

**Step 4: Test responsiveness**

Test: Resize browser window to mobile/tablet/desktop
Expected: Logo and text remain readable at all sizes

**Step 5: Commit**

```bash
git add src/js/components/header.js
git commit -m "feat: update header with PDFguruji branding

- Replace PDFPro logo with PDFguruji logo
- Update brand name to 'PDFguruji'
- Add tagline 'Your PDF Expert'
- Use new saffron orange accent color

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 3: Update Footer Component

**Files:**
- Modify: `src/js/components/footer.js`

**Step 1: Read current footer**

Run: `cat src/js/components/footer.js`
Expected: See footer with "PDF Tools" branding

**Step 2: Find and replace all brand references**

In `src/js/components/footer.js`, replace:
- "PDF Tools" → "PDFguruji"
- "Free PDF Tools" → "PDFguruji"
- Any other "PDF Tools" references

Update the main heading to:
```javascript
<h3 class="text-lg font-semibold mb-4">PDF<span style="color:#FF6B35">guruji</span></h3>
<p class="text-sm text-gray-400">Your PDF Expert</p>
```

**Step 3: Verify footer visually**

Run: `npm run dev` and scroll to bottom
Expected: See "PDFguruji" branding in footer

**Step 4: Commit**

```bash
git add src/js/components/footer.js
git commit -m "feat: update footer with PDFguruji branding

Replace all 'PDF Tools' references with 'PDFguruji'
Add tagline 'Your PDF Expert'

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 4: Update HTML Title and Meta Tags

**Files:**
- Modify: `index.html:7-8`

**Step 1: Read current index.html**

Run: `head -20 index.html`
Expected: See current title and meta description

**Step 2: Update title and meta description**

In `index.html`, replace lines 7-8:

```html
  <title>PDFguruji - Your PDF Expert | Free PDF Tools Online</title>
  <meta name="description" content="PDFguruji - Expert PDF tools for free. Merge, split, compress, convert, and edit PDFs securely in your browser. Professional tools, simple to use.">
```

**Step 3: Verify in browser**

Run: `npm run dev` and check browser tab title
Expected: See "PDFguruji - Your PDF Expert | Free PDF Tools Online"

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat: update HTML title and meta tags for PDFguruji

SEO-optimized title and description with new brand name

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 5: Update About Page

**Files:**
- Modify: `src/js/pages/about.js:12-26`

**Step 1: Read current about page**

Run: `head -50 src/js/pages/about.js`
Expected: See "About PDF Tools" heading

**Step 2: Update brand references in about page**

Replace line 12:
```javascript
      <h1 class="text-4xl font-bold text-gray-900 mb-8">About PDFguruji</h1>
```

Replace lines 17-24 (mission section):
```javascript
          <p class="text-gray-700 mb-4">
            PDFguruji was created with a simple mission: to provide expert PDF tools that are free, secure, and easy-to-use
            for everyone. Like a trusted teacher, we guide you through every PDF task with professional tools and clear instructions.
          </p>
          <p class="text-gray-700 mb-4">
            We believe that powerful PDF tools should be accessible to everyone - students, professionals, and businesses alike.
            That's why PDFguruji works directly in your browser, with no sign-ups, no downloads, and complete privacy.
          </p>
```

**Step 3: Verify about page**

Run: `npm run dev` and navigate to About page
Expected: See "About PDFguruji" and updated mission text

**Step 4: Commit**

```bash
git add src/js/pages/about.js
git commit -m "feat: update About page with PDFguruji brand messaging

Replace 'PDF Tools' with 'PDFguruji'
Update mission to reflect expert/guidance positioning

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 6: Update Contact Page

**Files:**
- Modify: `src/js/pages/contact.js`

**Step 1: Find all brand references**

Run: `grep -n "PDF Tools" src/js/pages/contact.js`
Expected: List of lines with "PDF Tools"

**Step 2: Replace all brand references**

Replace all instances of "PDF Tools" with "PDFguruji" in contact.js

Update the main heading to include the brand:
```javascript
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Contact PDFguruji</h1>
      <p class="text-xl text-gray-600 mb-8">
        Have questions about our expert PDF tools? We're here to help.
      </p>
```

**Step 3: Update email addresses (if they reference the old brand)**

If email addresses contain "pdftools", update to:
- `support@pdfguruji.com`
- `business@pdfguruji.com`
- `bugs@pdfguruji.com`
- `features@pdfguruji.com`
- `privacy@pdfguruji.com`

**Step 4: Verify contact page**

Run: `npm run dev` and navigate to Contact page
Expected: See "Contact PDFguruji" and updated messaging

**Step 5: Commit**

```bash
git add src/js/pages/contact.js
git commit -m "feat: update Contact page with PDFguruji branding

Replace 'PDF Tools' with 'PDFguruji'
Update email addresses to @pdfguruji.com domain

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 7: Update Blog Posts Page

**Files:**
- Modify: `src/js/pages/blog.js:12-13`

**Step 1: Update blog page title**

In `src/js/pages/blog.js`, replace lines 12-13:

```javascript
    document.title = 'Blog - PDFguruji'
```

Update the header section (around lines 25-29):
```javascript
        <h1 class="text-4xl font-bold text-gray-900 text-center mb-4">PDFguruji Blog</h1>
        <p class="text-xl text-gray-600 text-center max-w-2xl mx-auto">
          Expert tips, guides, and tutorials for mastering your PDF workflow
        </p>
```

**Step 2: Verify blog page**

Run: `npm run dev` and navigate to Blog
Expected: See "PDFguruji Blog" heading

**Step 3: Commit**

```bash
git add src/js/pages/blog.js
git commit -m "feat: update Blog page with PDFguruji branding

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 8: Update Blog Post Page

**Files:**
- Modify: `src/js/pages/blog-post.js:17`

**Step 1: Update blog post title format**

In `src/js/pages/blog-post.js`, replace line 17:

```javascript
  document.title = `${post.title} | PDFguruji Blog`
```

**Step 2: Verify blog post pages**

Run: `npm run dev` and open any blog post
Expected: Browser tab shows "Post Title | PDFguruji Blog"

**Step 3: Commit**

```bash
git add src/js/pages/blog-post.js
git commit -m "feat: update blog post titles with PDFguruji brand

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 9: Update Package.json

**Files:**
- Modify: `package.json:2-3`

**Step 1: Read current package.json**

Run: `head -10 package.json`
Expected: See current name and description

**Step 2: Update name and description**

In `package.json`, replace:

```json
  "name": "pdfguruji",
  "description": "PDFguruji - Your expert for free PDF tools online",
```

**Step 3: Verify package.json**

Run: `cat package.json | head -5`
Expected: See updated name and description

**Step 4: Commit**

```bash
git add package.json
git commit -m "feat: update package.json with PDFguruji brand

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 10: Update README.md

**Files:**
- Modify: `README.md:1-5`

**Step 1: Read current README**

Run: `head -20 README.md`
Expected: See project title and description

**Step 2: Update README with new branding**

Replace the top section of `README.md`:

```markdown
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
```

**Step 3: Verify README**

Run: `cat README.md | head -25`
Expected: See "PDFguruji" as title

**Step 4: Commit**

```bash
git add README.md
git commit -m "docs: update README with PDFguruji branding

Updated project title, description, and brand messaging

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 11: Create Favicon Assets

**Files:**
- Create: `public/favicon.ico`
- Create: `public/favicon-16x16.png`
- Create: `public/favicon-32x32.png`
- Create: `public/apple-touch-icon.png`
- Create: `public/android-chrome-192x192.png`
- Create: `public/android-chrome-512x512.png`

**Step 1: Generate favicon from logo**

**Manual Step:** Use a favicon generator service or image editor:
1. Export `src/assets/logo.svg` as PNG (512x512px)
2. Use https://realfavicongenerator.net/ or similar
3. Upload the 512x512 PNG
4. Download the generated favicon package
5. Extract files to `public/` directory

**Step 2: Add favicon links to index.html**

In `index.html` `<head>` section, add:

```html
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
```

**Step 3: Create site.webmanifest**

Create `public/site.webmanifest`:

```json
{
  "name": "PDFguruji",
  "short_name": "PDFguruji",
  "description": "Your PDF Expert - Free online PDF tools",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#FF6B35",
  "background_color": "#FFFFFF",
  "display": "standalone"
}
```

**Step 4: Verify favicon**

Run: `npm run dev` and check browser tab
Expected: See PDFguruji logo as favicon

**Step 5: Commit**

```bash
git add public/favicon* public/apple-touch-icon.png public/android-chrome-* public/site.webmanifest index.html
git commit -m "feat: add PDFguruji favicon and app icons

Generated favicon set from new brand logo
Added web app manifest for PWA support

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 12: Update Hero Section Styling

**Files:**
- Modify: `src/js/components/hero.js`

**Step 1: Update primary CTA button color**

Find the CTA button in `hero.js` and update to use new saffron orange:

```javascript
<a href="#/merge" class="inline-block px-8 py-4 text-lg font-semibold text-white rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105" style="background: linear-gradient(135deg, #FF6B35 0%, #1E3A8A 100%)">
  Get Started Free
</a>
```

**Step 2: Verify hero section**

Run: `npm run dev`
Expected: See gradient orange-to-blue CTA button

**Step 3: Commit**

```bash
git add src/js/components/hero.js
git commit -m "feat: update hero CTA with PDFguruji brand gradient

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 13: Final Visual Verification

**Files:**
- None (verification only)

**Step 1: Build production version**

Run: `npm run build`
Expected: Build completes successfully

**Step 2: Preview production build**

Run: `npm run preview`
Expected: Site loads at preview URL

**Step 3: Check all pages**

Manually verify:
- [ ] Homepage shows PDFguruji logo and branding
- [ ] Header shows new logo on all pages
- [ ] Footer shows PDFguruji branding
- [ ] About page has updated content
- [ ] Contact page has updated content
- [ ] Blog page shows PDFguruji branding
- [ ] All tool pages load correctly
- [ ] Favicon appears in browser tab
- [ ] Colors match design (saffron orange #FF6B35, deep blue #1E3A8A)

**Step 4: Mobile responsiveness check**

Test: Open DevTools, test mobile/tablet viewports
Expected: Logo and branding look good on all screen sizes

---

## Manual Post-Implementation Steps

### Domain Purchase and Setup

1. **Purchase domain:**
   - Go to GoDaddy India or Namecheap
   - Search for `pdfguruji.com`
   - Purchase for ₹1 (first year promo)

2. **Update Vercel deployment:**
   - Go to Vercel project settings
   - Add custom domain: `pdfguruji.com`
   - Update DNS records as instructed by Vercel

3. **Update Google AdSense:**
   - Go to AdSense dashboard
   - Update site URL from old domain to `pdfguruji.com`
   - Re-verify site ownership if needed

4. **Update public/ads.txt:**
   - Ensure `public/ads.txt` is accessible at `pdfguruji.com/ads.txt`

5. **Test production deployment:**
   - Visit `pdfguruji.com`
   - Verify all pages work
   - Check SSL certificate is active

---

## Success Criteria

✅ All brand references updated from "PDFPro" to "PDFguruji"
✅ New logo visible across all pages
✅ Color scheme updated (saffron orange + deep blue)
✅ Favicon and app icons generated
✅ SEO meta tags updated
✅ Build succeeds without errors
✅ Site is visually consistent across pages
✅ Mobile responsive design maintained
✅ Domain purchased and configured
✅ Production deployment successful

---

## Rollback Plan

If issues arise:
1. Revert to previous commit: `git revert HEAD~13..HEAD`
2. Rebuild: `npm run build`
3. Redeploy to Vercel
4. Keep old domain active until issues resolved

---

**Estimated Time:** 2-3 hours (excluding manual domain setup)
**Complexity:** Medium (mostly UI updates, no logic changes)
**Risk Level:** Low (cosmetic changes only, no functionality affected)
