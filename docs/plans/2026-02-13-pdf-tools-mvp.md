# PDF Tools MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a privacy-first PDF tools web application with 5-7 essential tools, client-side processing, and ad-based revenue model.

**Architecture:** Single-page Vite application with vanilla JavaScript modules, Tailwind CSS for styling, PDF-lib and PDF.js for client-side processing, deployed to Netlify with Google AdSense integration.

**Tech Stack:** Vite, Vanilla JavaScript (ES6+), Tailwind CSS, PDF-lib, PDF.js, Netlify, Google AdSense

---

## Phase 1: Project Setup & Foundation

### Task 1: Initialize Vite Project

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `.gitignore`
- Create: `index.html`

**Step 1: Initialize npm project**

Run: `npm init -y`
Expected: Creates `package.json`

**Step 2: Install Vite and dependencies**

Run: `npm install -D vite tailwindcss postcss autoprefixer`
Expected: Dependencies installed, `package-lock.json` created

**Step 3: Install PDF processing libraries**

Run: `npm install pdf-lib pdfjs-dist`
Expected: PDF libraries installed

**Step 4: Initialize Tailwind CSS**

Run: `npx tailwindcss init -p`
Expected: Creates `tailwind.config.js` and `postcss.config.js`

**Step 5: Configure Tailwind**

Edit `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**Step 6: Create Vite config**

Create `vite.config.js`:
```javascript
import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    open: true,
  },
})
```

**Step 7: Create .gitignore**

Create `.gitignore`:
```
node_modules/
dist/
.DS_Store
*.log
.env
.vscode/
```

**Step 8: Update package.json scripts**

Edit `package.json` scripts section:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "echo \"Add tests later\" && exit 0"
}
```

**Step 9: Create basic HTML entry point**

Create `index.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Free PDF Tools - Process PDFs Securely in Your Browser</title>
  <meta name="description" content="Free online PDF tools. Merge, split, compress, and convert PDFs securely in your browser. Your files never leave your device.">
  <link rel="stylesheet" href="/src/styles/main.css">
</head>
<body>
  <div id="app">
    <h1>PDF Tools Loading...</h1>
  </div>
  <script type="module" src="/src/js/main.js"></script>
</body>
</html>
```

**Step 10: Test dev server**

Run: `npm run dev`
Expected: Server starts on localhost:3000, shows "PDF Tools Loading..."

**Step 11: Commit**

```bash
git add .
git commit -m "feat: initialize Vite project with Tailwind and PDF libraries

- Set up Vite build tool
- Configure Tailwind CSS
- Install PDF-lib and PDF.js
- Create basic HTML entry point
- Add npm scripts for dev and build

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Create File Structure & Basic Styling

**Files:**
- Create: `src/styles/main.css`
- Create: `src/js/main.js`
- Create: `src/js/utils/file-handler.js`
- Create: `src/js/utils/ui-helpers.js`
- Create: `public/assets/.gitkeep`

**Step 1: Create main CSS file**

Create `src/styles/main.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom base styles */
@layer base {
  body {
    @apply bg-gray-50 text-gray-900 antialiased;
  }
}

/* Custom components */
@layer components {
  .btn-primary {
    @apply bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-secondary {
    @apply bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors duration-200;
  }

  .card {
    @apply bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200;
  }

  .upload-zone {
    @apply border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors duration-200;
  }

  .upload-zone.dragover {
    @apply border-blue-500 bg-blue-50;
  }
}

/* Loading spinner */
.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

**Step 2: Create main.js entry point**

Create `src/js/main.js`:
```javascript
// Main application entry point
console.log('PDF Tools app initializing...')

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready')
  initApp()
})

function initApp() {
  const app = document.getElementById('app')
  app.innerHTML = `
    <div class="min-h-screen">
      <h1 class="text-4xl font-bold text-center py-8">PDF Tools</h1>
      <p class="text-center text-gray-600">Setup complete! Ready to build features.</p>
    </div>
  `
}
```

**Step 3: Create file handler utility**

Create `src/js/utils/file-handler.js`:
```javascript
/**
 * File handling utilities for PDF operations
 */

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export function validatePDF(file) {
  const errors = []

  if (!file) {
    errors.push('No file selected')
    return { valid: false, errors }
  }

  if (file.type !== 'application/pdf') {
    errors.push('Please upload a valid PDF file')
  }

  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = (e) => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

export function createDownloadLink(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()

  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
```

**Step 4: Create UI helper utilities**

Create `src/js/utils/ui-helpers.js`:
```javascript
/**
 * UI helper functions
 */

export function showError(message, container) {
  const errorDiv = document.createElement('div')
  errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'
  errorDiv.innerHTML = `
    <span class="block sm:inline">${message}</span>
  `
  container.prepend(errorDiv)

  // Auto-remove after 5 seconds
  setTimeout(() => errorDiv.remove(), 5000)
}

export function showSuccess(message, container) {
  const successDiv = document.createElement('div')
  successDiv.className = 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4'
  successDiv.innerHTML = `
    <span class="block sm:inline">${message}</span>
  `
  container.prepend(successDiv)

  // Auto-remove after 5 seconds
  setTimeout(() => successDiv.remove(), 5000)
}

export function showLoading(container, message = 'Processing...') {
  const loadingDiv = document.createElement('div')
  loadingDiv.id = 'loading-indicator'
  loadingDiv.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
  loadingDiv.innerHTML = `
    <div class="bg-white rounded-lg p-8 flex flex-col items-center">
      <div class="spinner mb-4"></div>
      <p class="text-gray-700">${message}</p>
    </div>
  `
  container.appendChild(loadingDiv)
}

export function hideLoading() {
  const loadingDiv = document.getElementById('loading-indicator')
  if (loadingDiv) {
    loadingDiv.remove()
  }
}

export function createUploadZone(onFileSelect) {
  const zone = document.createElement('div')
  zone.className = 'upload-zone'
  zone.innerHTML = `
    <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <p class="text-gray-600 mb-2">Drag and drop PDF files here</p>
    <p class="text-gray-500 text-sm mb-4">or</p>
    <button class="btn-primary">Choose Files</button>
    <input type="file" accept="application/pdf" multiple class="hidden" />
  `

  const input = zone.querySelector('input[type="file"]')
  const button = zone.querySelector('button')

  // Click to upload
  button.addEventListener('click', (e) => {
    e.preventDefault()
    input.click()
  })

  input.addEventListener('change', (e) => {
    const files = Array.from(e.target.files)
    onFileSelect(files)
  })

  // Drag and drop
  zone.addEventListener('dragover', (e) => {
    e.preventDefault()
    zone.classList.add('dragover')
  })

  zone.addEventListener('dragleave', () => {
    zone.classList.remove('dragover')
  })

  zone.addEventListener('drop', (e) => {
    e.preventDefault()
    zone.classList.remove('dragover')
    const files = Array.from(e.dataTransfer.files)
    onFileSelect(files)
  })

  return zone
}
```

**Step 5: Create public assets directory**

Run: `mkdir -p public/assets && touch public/assets/.gitkeep`
Expected: Directory created with placeholder file

**Step 6: Test styling**

Run: `npm run dev`
Expected: Server runs, page shows styled "PDF Tools" heading

**Step 7: Commit**

```bash
git add .
git commit -m "feat: add file structure and utility functions

- Create Tailwind-based CSS with custom components
- Add file handler utilities (validation, reading, download)
- Add UI helper functions (errors, loading, upload zone)
- Set up public assets directory

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Phase 2: Landing Page

### Task 3: Build Landing Page Header & Hero

**Files:**
- Modify: `src/js/main.js`
- Create: `src/js/components/header.js`
- Create: `src/js/components/hero.js`

**Step 1: Create header component**

Create `src/js/components/header.js`:
```javascript
export function createHeader() {
  const header = document.createElement('header')
  header.className = 'bg-white shadow-sm sticky top-0 z-40'
  header.innerHTML = `
    <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
      <div class="flex items-center">
        <svg class="h-8 w-8 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
        </svg>
        <span class="text-xl font-bold text-gray-900">PDF Tools</span>
      </div>
      <div class="hidden md:flex items-center space-x-6">
        <a href="#features" class="text-gray-600 hover:text-gray-900">Features</a>
        <a href="#privacy" class="text-gray-600 hover:text-gray-900">Privacy</a>
        <a href="#about" class="text-gray-600 hover:text-gray-900">About</a>
      </div>
      <button id="mobile-menu-btn" class="md:hidden">
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </nav>
  `

  return header
}
```

**Step 2: Create hero component**

Create `src/js/components/hero.js`:
```javascript
export function createHero() {
  const hero = document.createElement('section')
  hero.className = 'bg-gradient-to-br from-blue-50 to-indigo-100 py-20'
  hero.innerHTML = `
    <div class="container mx-auto px-4 text-center">
      <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
        Free PDF Tools
      </h1>
      <p class="text-xl md:text-2xl text-gray-700 mb-4">
        Process PDFs Securely in Your Browser
      </p>
      <p class="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
        Merge, split, compress, and convert PDFs with complete privacy.
        Your files never leave your device.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <a href="#features" class="btn-primary inline-block">
          Get Started
        </a>
        <div class="flex items-center text-green-700">
          <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span class="font-semibold">100% Private & Secure</span>
        </div>
      </div>
    </div>
  `

  return hero
}
```

**Step 3: Update main.js to use components**

Modify `src/js/main.js`:
```javascript
import { createHeader } from './components/header.js'
import { createHero } from './components/hero.js'

console.log('PDF Tools app initializing...')

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready')
  initApp()
})

function initApp() {
  const app = document.getElementById('app')
  app.innerHTML = '' // Clear loading message

  // Build page structure
  app.appendChild(createHeader())
  app.appendChild(createHero())

  // Add placeholder for features
  const placeholder = document.createElement('div')
  placeholder.className = 'container mx-auto px-4 py-12 text-center'
  placeholder.innerHTML = '<p class="text-gray-600">Features section coming next...</p>'
  app.appendChild(placeholder)
}
```

**Step 4: Test landing page**

Run: `npm run dev`
Expected: Page shows header with logo/nav and hero section with headline

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add landing page header and hero section

- Create reusable header component with navigation
- Add hero section with headline and privacy badge
- Update main.js to assemble components
- Responsive design for mobile and desktop

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 4: Build Features Grid

**Files:**
- Create: `src/js/components/features-grid.js`
- Create: `src/js/config/tools.js`
- Modify: `src/js/main.js`

**Step 1: Create tools configuration**

Create `src/js/config/tools.js`:
```javascript
export const TOOLS = [
  {
    id: 'merge',
    name: 'Merge PDFs',
    description: 'Combine multiple PDF files into one',
    icon: `<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>`,
    enabled: true
  },
  {
    id: 'split',
    name: 'Split PDF',
    description: 'Extract pages or split into multiple files',
    icon: `<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>`,
    enabled: true
  },
  {
    id: 'compress',
    name: 'Compress PDF',
    description: 'Reduce file size while maintaining quality',
    icon: `<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>`,
    enabled: true
  },
  {
    id: 'rotate',
    name: 'Rotate Pages',
    description: 'Rotate individual pages or entire document',
    icon: `<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>`,
    enabled: true
  },
  {
    id: 'pdf-to-images',
    name: 'PDF to Images',
    description: 'Convert PDF pages to JPG or PNG',
    icon: `<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>`,
    enabled: true
  },
  {
    id: 'images-to-pdf',
    name: 'Images to PDF',
    description: 'Convert multiple images into a single PDF',
    icon: `<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>`,
    enabled: true
  },
  {
    id: 'extract',
    name: 'Extract Pages',
    description: 'Select specific pages to extract',
    icon: `<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>`,
    enabled: true
  }
]
```

**Step 2: Create features grid component**

Create `src/js/components/features-grid.js`:
```javascript
import { TOOLS } from '../config/tools.js'

export function createFeaturesGrid() {
  const section = document.createElement('section')
  section.id = 'features'
  section.className = 'container mx-auto px-4 py-16'

  const header = document.createElement('div')
  header.className = 'text-center mb-12'
  header.innerHTML = `
    <h2 class="text-4xl font-bold text-gray-900 mb-4">All Tools</h2>
    <p class="text-xl text-gray-600">Choose a tool to get started</p>
  `

  const grid = document.createElement('div')
  grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'

  TOOLS.forEach(tool => {
    const card = createToolCard(tool)
    grid.appendChild(card)
  })

  section.appendChild(header)
  section.appendChild(grid)

  return section
}

function createToolCard(tool) {
  const card = document.createElement('div')
  card.className = 'card cursor-pointer'
  card.dataset.toolId = tool.id

  card.innerHTML = `
    <div class="flex items-center mb-4">
      <div class="text-blue-600 mr-3">
        ${tool.icon}
      </div>
      <h3 class="text-xl font-semibold text-gray-900">${tool.name}</h3>
    </div>
    <p class="text-gray-600">${tool.description}</p>
  `

  if (tool.enabled) {
    card.addEventListener('click', () => {
      console.log(`Opening tool: ${tool.id}`)
      openTool(tool.id)
    })
  } else {
    card.classList.add('opacity-50', 'cursor-not-allowed')
    const badge = document.createElement('span')
    badge.className = 'inline-block bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded mt-2'
    badge.textContent = 'Coming Soon'
    card.appendChild(badge)
  }

  return card
}

function openTool(toolId) {
  // For now, just show an alert
  // We'll implement actual tool pages in next tasks
  alert(`${toolId} tool will be implemented next!`)
}
```

**Step 3: Update main.js to include features grid**

Modify `src/js/main.js`:
```javascript
import { createHeader } from './components/header.js'
import { createHero } from './components/hero.js'
import { createFeaturesGrid } from './components/features-grid.js'

console.log('PDF Tools app initializing...')

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready')
  initApp()
})

function initApp() {
  const app = document.getElementById('app')
  app.innerHTML = '' // Clear loading message

  // Build page structure
  app.appendChild(createHeader())
  app.appendChild(createHero())
  app.appendChild(createFeaturesGrid())
}
```

**Step 4: Test features grid**

Run: `npm run dev`
Expected: Page shows grid of 7 tool cards, clicking shows alert

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add features grid with tool cards

- Create tools configuration with 7 PDF tools
- Build responsive features grid component
- Add tool card interaction (placeholder)
- Configure grid layout for mobile/desktop

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Phase 3: Tool Implementation Infrastructure

### Task 5: Create Tool Page Router & Layout

**Files:**
- Create: `src/js/router.js`
- Create: `src/js/components/tool-page.js`
- Modify: `src/js/main.js`
- Modify: `src/js/components/features-grid.js`

**Step 1: Create simple router**

Create `src/js/router.js`:
```javascript
/**
 * Simple hash-based router for tool navigation
 */

let currentRoute = 'home'
let routes = {}

export function initRouter(routeHandlers) {
  routes = routeHandlers

  // Listen for hash changes
  window.addEventListener('hashchange', handleRouteChange)

  // Handle initial route
  handleRouteChange()
}

function handleRouteChange() {
  const hash = window.location.hash.slice(1) || 'home'
  const [route, ...params] = hash.split('/')

  currentRoute = route

  if (routes[route]) {
    routes[route](params)
  } else {
    routes['home']()
  }
}

export function navigateTo(route) {
  window.location.hash = route
}

export function getCurrentRoute() {
  return currentRoute
}
```

**Step 2: Create tool page layout component**

Create `src/js/components/tool-page.js`:
```javascript
export function createToolPage(tool) {
  const page = document.createElement('div')
  page.className = 'min-h-screen bg-gray-50'

  // Header with back button
  const header = document.createElement('div')
  header.className = 'bg-white shadow-sm'
  header.innerHTML = `
    <div class="container mx-auto px-4 py-4">
      <button id="back-btn" class="flex items-center text-gray-600 hover:text-gray-900">
        <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Home
      </button>
    </div>
  `

  // Tool title
  const titleSection = document.createElement('div')
  titleSection.className = 'container mx-auto px-4 py-8'
  titleSection.innerHTML = `
    <div class="text-center mb-8">
      <div class="flex justify-center mb-4 text-blue-600">
        ${tool.icon}
      </div>
      <h1 class="text-4xl font-bold text-gray-900 mb-2">${tool.name}</h1>
      <p class="text-xl text-gray-600">${tool.description}</p>
    </div>
  `

  // Tool content container
  const contentContainer = document.createElement('div')
  contentContainer.id = 'tool-content'
  contentContainer.className = 'container mx-auto px-4 pb-16'

  page.appendChild(header)
  page.appendChild(titleSection)
  page.appendChild(contentContainer)

  // Back button handler
  header.querySelector('#back-btn').addEventListener('click', () => {
    window.location.hash = 'home'
  })

  return { page, contentContainer }
}
```

**Step 3: Update features-grid to use router**

Modify `src/js/components/features-grid.js`:
```javascript
import { TOOLS } from '../config/tools.js'
import { navigateTo } from '../router.js'

export function createFeaturesGrid() {
  const section = document.createElement('section')
  section.id = 'features'
  section.className = 'container mx-auto px-4 py-16'

  const header = document.createElement('div')
  header.className = 'text-center mb-12'
  header.innerHTML = `
    <h2 class="text-4xl font-bold text-gray-900 mb-4">All Tools</h2>
    <p class="text-xl text-gray-600">Choose a tool to get started</p>
  `

  const grid = document.createElement('div')
  grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'

  TOOLS.forEach(tool => {
    const card = createToolCard(tool)
    grid.appendChild(card)
  })

  section.appendChild(header)
  section.appendChild(grid)

  return section
}

function createToolCard(tool) {
  const card = document.createElement('div')
  card.className = 'card cursor-pointer'
  card.dataset.toolId = tool.id

  card.innerHTML = `
    <div class="flex items-center mb-4">
      <div class="text-blue-600 mr-3">
        ${tool.icon}
      </div>
      <h3 class="text-xl font-semibold text-gray-900">${tool.name}</h3>
    </div>
    <p class="text-gray-600">${tool.description}</p>
  `

  if (tool.enabled) {
    card.addEventListener('click', () => {
      navigateTo(`tool/${tool.id}`)
    })
  } else {
    card.classList.add('opacity-50', 'cursor-not-allowed')
    const badge = document.createElement('span')
    badge.className = 'inline-block bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded mt-2'
    badge.textContent = 'Coming Soon'
    card.appendChild(badge)
  }

  return card
}
```

**Step 4: Update main.js with router**

Modify `src/js/main.js`:
```javascript
import { createHeader } from './components/header.js'
import { createHero } from './components/hero.js'
import { createFeaturesGrid } from './components/features-grid.js'
import { createToolPage } from './components/tool-page.js'
import { initRouter } from './router.js'
import { TOOLS } from './config/tools.js'

console.log('PDF Tools app initializing...')

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready')
  initApp()
})

function initApp() {
  const app = document.getElementById('app')

  // Initialize router
  initRouter({
    home: showHomePage,
    tool: showToolPage
  })
}

function showHomePage() {
  const app = document.getElementById('app')
  app.innerHTML = ''

  app.appendChild(createHeader())
  app.appendChild(createHero())
  app.appendChild(createFeaturesGrid())
}

function showToolPage(params) {
  const app = document.getElementById('app')
  const toolId = params[0]

  const tool = TOOLS.find(t => t.id === toolId)

  if (!tool) {
    showHomePage()
    return
  }

  app.innerHTML = ''

  const { page, contentContainer } = createToolPage(tool)
  app.appendChild(page)

  // Add placeholder content for now
  contentContainer.innerHTML = `
    <div class="text-center text-gray-600">
      <p>Tool implementation coming in next tasks...</p>
    </div>
  `
}
```

**Step 5: Test routing**

Run: `npm run dev`
Expected: Clicking a tool card navigates to tool page, back button returns home

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add routing and tool page layout

- Create hash-based router for navigation
- Build reusable tool page layout component
- Wire up tool cards to navigate to tool pages
- Add back button to return to home

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Phase 4: PDF Tools Implementation

### Task 6: Implement Merge PDF Tool

**Files:**
- Create: `src/js/tools/merge.js`
- Modify: `src/js/main.js`

**Step 1: Create merge PDF tool**

Create `src/js/tools/merge.js`:
```javascript
import { PDFDocument } from 'pdf-lib'
import { validatePDF, readFileAsArrayBuffer, createDownloadLink, formatFileSize } from '../utils/file-handler.js'
import { showError, showSuccess, showLoading, hideLoading, createUploadZone } from '../utils/ui-helpers.js'

export function initMergeTool(container) {
  const uploadedFiles = []

  const content = document.createElement('div')
  content.className = 'max-w-4xl mx-auto'

  // Upload zone
  const uploadSection = document.createElement('div')
  uploadSection.className = 'bg-white rounded-lg shadow-md p-8 mb-6'

  const uploadZone = createUploadZone((files) => {
    handleFileUpload(files, uploadedFiles, filesList)
  })

  const filesList = document.createElement('div')
  filesList.id = 'files-list'
  filesList.className = 'mt-6 space-y-3'

  uploadSection.appendChild(uploadZone)
  uploadSection.appendChild(filesList)

  // Action buttons
  const actionsSection = document.createElement('div')
  actionsSection.className = 'flex flex-col sm:flex-row gap-4 justify-center'
  actionsSection.innerHTML = `
    <button id="merge-btn" class="btn-primary" disabled>
      Merge PDFs
    </button>
    <button id="clear-btn" class="btn-secondary" disabled>
      Clear All
    </button>
  `

  content.appendChild(uploadSection)
  content.appendChild(actionsSection)
  container.appendChild(content)

  // Event listeners
  const mergeBtn = document.getElementById('merge-btn')
  const clearBtn = document.getElementById('clear-btn')

  mergeBtn.addEventListener('click', () => {
    mergePDFs(uploadedFiles, container)
  })

  clearBtn.addEventListener('click', () => {
    uploadedFiles.length = 0
    filesList.innerHTML = ''
    mergeBtn.disabled = true
    clearBtn.disabled = true
  })
}

function handleFileUpload(files, uploadedFiles, filesList) {
  files.forEach(file => {
    const validation = validatePDF(file)

    if (!validation.valid) {
      showError(validation.errors.join(', '), filesList.parentElement)
      return
    }

    uploadedFiles.push(file)
    addFileToList(file, uploadedFiles, filesList)
  })

  updateButtonStates(uploadedFiles)
}

function addFileToList(file, uploadedFiles, filesList) {
  const fileItem = document.createElement('div')
  fileItem.className = 'flex items-center justify-between bg-gray-50 p-4 rounded'
  fileItem.dataset.fileName = file.name

  fileItem.innerHTML = `
    <div class="flex items-center flex-1">
      <svg class="h-6 w-6 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
      </svg>
      <div>
        <p class="font-medium text-gray-900">${file.name}</p>
        <p class="text-sm text-gray-500">${formatFileSize(file.size)}</p>
      </div>
    </div>
    <button class="remove-btn text-red-600 hover:text-red-800">
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  `

  fileItem.querySelector('.remove-btn').addEventListener('click', () => {
    const index = uploadedFiles.findIndex(f => f.name === file.name)
    if (index > -1) {
      uploadedFiles.splice(index, 1)
    }
    fileItem.remove()
    updateButtonStates(uploadedFiles)
  })

  filesList.appendChild(fileItem)
}

function updateButtonStates(uploadedFiles) {
  const mergeBtn = document.getElementById('merge-btn')
  const clearBtn = document.getElementById('clear-btn')

  const hasFiles = uploadedFiles.length >= 2
  mergeBtn.disabled = !hasFiles
  clearBtn.disabled = uploadedFiles.length === 0
}

async function mergePDFs(files, container) {
  if (files.length < 2) {
    showError('Please upload at least 2 PDF files to merge', container)
    return
  }

  try {
    showLoading(container, 'Merging PDFs...')

    // Create a new PDF document
    const mergedPdf = await PDFDocument.create()

    // Load and copy pages from each file
    for (const file of files) {
      const arrayBuffer = await readFileAsArrayBuffer(file)
      const pdf = await PDFDocument.load(arrayBuffer)
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
      copiedPages.forEach(page => mergedPdf.addPage(page))
    }

    // Save the merged PDF
    const mergedPdfBytes = await mergedPdf.save()
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' })

    hideLoading()
    createDownloadLink(blob, 'merged.pdf')
    showSuccess('PDFs merged successfully!', container)

  } catch (error) {
    hideLoading()
    console.error('Merge error:', error)
    showError('Failed to merge PDFs. Please try again.', container)
  }
}
```

**Step 2: Update main.js to use merge tool**

Modify `src/js/main.js` - update `showToolPage` function:
```javascript
function showToolPage(params) {
  const app = document.getElementById('app')
  const toolId = params[0]

  const tool = TOOLS.find(t => t.id === toolId)

  if (!tool) {
    showHomePage()
    return
  }

  app.innerHTML = ''

  const { page, contentContainer } = createToolPage(tool)
  app.appendChild(page)

  // Load the specific tool
  switch (toolId) {
    case 'merge':
      import('./tools/merge.js').then(module => {
        module.initMergeTool(contentContainer)
      })
      break
    default:
      contentContainer.innerHTML = `
        <div class="text-center text-gray-600">
          <p>Tool implementation coming soon...</p>
        </div>
      `
  }
}
```

**Step 3: Test merge tool**

Run: `npm run dev`
Expected: Navigate to merge tool, upload 2+ PDFs, click merge, download merged PDF

**Step 4: Commit**

```bash
git add .
git commit -m "feat: implement merge PDF tool

- Add PDF merge functionality using pdf-lib
- Support multiple file uploads with drag-and-drop
- Show file list with remove buttons
- Generate and download merged PDF
- Add loading states and error handling

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 7: Implement Split PDF Tool

**Files:**
- Create: `src/js/tools/split.js`
- Modify: `src/js/main.js`

**Step 1: Create split PDF tool**

Create `src/js/tools/split.js`:
```javascript
import { PDFDocument } from 'pdf-lib'
import { validatePDF, readFileAsArrayBuffer, createDownloadLink } from '../utils/file-handler.js'
import { showError, showSuccess, showLoading, hideLoading, createUploadZone } from '../utils/ui-helpers.js'

export function initSplitTool(container) {
  let uploadedFile = null
  let pdfDoc = null

  const content = document.createElement('div')
  content.className = 'max-w-4xl mx-auto'

  // Upload zone
  const uploadSection = document.createElement('div')
  uploadSection.className = 'bg-white rounded-lg shadow-md p-8 mb-6'

  const uploadZone = createUploadZone((files) => {
    if (files.length > 1) {
      showError('Please upload only one PDF file', uploadSection)
      return
    }
    handleFileUpload(files[0], uploadSection)
  })

  // Modify upload zone to accept single file
  const input = uploadZone.querySelector('input[type="file"]')
  input.removeAttribute('multiple')

  uploadSection.appendChild(uploadZone)

  // Split options
  const optionsSection = document.createElement('div')
  optionsSection.id = 'split-options'
  optionsSection.className = 'bg-white rounded-lg shadow-md p-8 mb-6 hidden'
  optionsSection.innerHTML = `
    <h3 class="text-xl font-semibold mb-4">Split Options</h3>
    <div class="space-y-4">
      <div>
        <label class="flex items-center">
          <input type="radio" name="split-mode" value="all" checked class="mr-2">
          <span>Split each page into separate PDF</span>
        </label>
      </div>
      <div>
        <label class="flex items-center">
          <input type="radio" name="split-mode" value="range" class="mr-2">
          <span>Extract page range</span>
        </label>
        <div id="range-input" class="ml-6 mt-2 hidden">
          <label class="block text-sm text-gray-600 mb-1">Pages (e.g., 1-3, 5, 7-9)</label>
          <input type="text" id="page-range" class="border border-gray-300 rounded px-3 py-2 w-full" placeholder="1-3">
        </div>
      </div>
    </div>
    <div id="page-info" class="mt-4 p-3 bg-blue-50 rounded text-blue-700"></div>
  `

  // Action buttons
  const actionsSection = document.createElement('div')
  actionsSection.className = 'flex flex-col sm:flex-row gap-4 justify-center hidden'
  actionsSection.id = 'action-buttons'
  actionsSection.innerHTML = `
    <button id="split-btn" class="btn-primary">
      Split PDF
    </button>
    <button id="clear-btn" class="btn-secondary">
      Start Over
    </button>
  `

  content.appendChild(uploadSection)
  content.appendChild(optionsSection)
  content.appendChild(actionsSection)
  container.appendChild(content)

  // Event listeners
  const rangeRadio = optionsSection.querySelector('input[value="range"]')
  const allRadio = optionsSection.querySelector('input[value="all"]')
  const rangeInput = document.getElementById('range-input')

  rangeRadio.addEventListener('change', () => {
    rangeInput.classList.remove('hidden')
  })

  allRadio.addEventListener('change', () => {
    rangeInput.classList.add('hidden')
  })

  const splitBtn = document.getElementById('split-btn')
  const clearBtn = document.getElementById('clear-btn')

  splitBtn.addEventListener('click', () => {
    const mode = document.querySelector('input[name="split-mode"]:checked').value
    splitPDF(pdfDoc, mode, container)
  })

  clearBtn.addEventListener('click', () => {
    uploadedFile = null
    pdfDoc = null
    uploadSection.querySelector('.upload-zone').classList.remove('hidden')
    uploadSection.querySelector('#file-info')?.remove()
    optionsSection.classList.add('hidden')
    actionsSection.classList.add('hidden')
  })

  async function handleFileUpload(file, uploadSection) {
    const validation = validatePDF(file)

    if (!validation.valid) {
      showError(validation.errors.join(', '), uploadSection)
      return
    }

    try {
      showLoading(container, 'Loading PDF...')

      uploadedFile = file
      const arrayBuffer = await readFileAsArrayBuffer(file)
      pdfDoc = await PDFDocument.load(arrayBuffer)
      const pageCount = pdfDoc.getPageCount()

      hideLoading()

      // Hide upload zone and show file info
      uploadSection.querySelector('.upload-zone').classList.add('hidden')

      const fileInfo = document.createElement('div')
      fileInfo.id = 'file-info'
      fileInfo.className = 'bg-gray-50 p-4 rounded'
      fileInfo.innerHTML = `
        <div class="flex items-center">
          <svg class="h-8 w-8 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          </svg>
          <div>
            <p class="font-medium text-gray-900">${file.name}</p>
            <p class="text-sm text-gray-600">${pageCount} pages</p>
          </div>
        </div>
      `
      uploadSection.appendChild(fileInfo)

      // Show options
      document.getElementById('page-info').textContent = `Total pages: ${pageCount}`
      optionsSection.classList.remove('hidden')
      actionsSection.classList.remove('hidden')

    } catch (error) {
      hideLoading()
      console.error('Load error:', error)
      showError('Failed to load PDF. Please try another file.', uploadSection)
    }
  }
}

async function splitPDF(pdfDoc, mode, container) {
  if (!pdfDoc) {
    showError('Please upload a PDF first', container)
    return
  }

  try {
    showLoading(container, 'Splitting PDF...')

    const pageCount = pdfDoc.getPageCount()

    if (mode === 'all') {
      // Split each page into separate PDF
      for (let i = 0; i < pageCount; i++) {
        const newPdf = await PDFDocument.create()
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [i])
        newPdf.addPage(copiedPage)

        const pdfBytes = await newPdf.save()
        const blob = new Blob([pdfBytes], { type: 'application/pdf' })
        createDownloadLink(blob, `page-${i + 1}.pdf`)
      }

      hideLoading()
      showSuccess(`Successfully split into ${pageCount} separate PDFs!`, container)

    } else if (mode === 'range') {
      const rangeInput = document.getElementById('page-range').value
      const pages = parsePageRange(rangeInput, pageCount)

      if (pages.length === 0) {
        hideLoading()
        showError('Invalid page range. Use format like: 1-3, 5, 7-9', container)
        return
      }

      const newPdf = await PDFDocument.create()
      const copiedPages = await newPdf.copyPages(pdfDoc, pages)
      copiedPages.forEach(page => newPdf.addPage(page))

      const pdfBytes = await newPdf.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })

      hideLoading()
      createDownloadLink(blob, `extracted-pages.pdf`)
      showSuccess(`Successfully extracted ${pages.length} pages!`, container)
    }

  } catch (error) {
    hideLoading()
    console.error('Split error:', error)
    showError('Failed to split PDF. Please try again.', container)
  }
}

function parsePageRange(input, maxPages) {
  const pages = []
  const parts = input.split(',')

  for (const part of parts) {
    const trimmed = part.trim()

    if (trimmed.includes('-')) {
      // Range like "1-3"
      const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()))
      if (isNaN(start) || isNaN(end) || start < 1 || end > maxPages || start > end) {
        return []
      }
      for (let i = start; i <= end; i++) {
        pages.push(i - 1) // Convert to 0-indexed
      }
    } else {
      // Single page like "5"
      const page = parseInt(trimmed)
      if (isNaN(page) || page < 1 || page > maxPages) {
        return []
      }
      pages.push(page - 1) // Convert to 0-indexed
    }
  }

  // Remove duplicates and sort
  return [...new Set(pages)].sort((a, b) => a - b)
}
```

**Step 2: Update main.js to include split tool**

Modify `src/js/main.js` - update switch statement in `showToolPage`:
```javascript
switch (toolId) {
  case 'merge':
    import('./tools/merge.js').then(module => {
      module.initMergeTool(contentContainer)
    })
    break
  case 'split':
    import('./tools/split.js').then(module => {
      module.initSplitTool(contentContainer)
    })
    break
  default:
    contentContainer.innerHTML = `
      <div class="text-center text-gray-600">
        <p>Tool implementation coming soon...</p>
      </div>
    `
}
```

**Step 3: Test split tool**

Run: `npm run dev`
Expected: Upload PDF, choose split mode, download split PDFs

**Step 4: Commit**

```bash
git add .
git commit -m "feat: implement split PDF tool

- Add split all pages into separate PDFs mode
- Add extract page range mode with flexible input
- Parse page ranges like '1-3, 5, 7-9'
- Generate and download split PDFs
- Show page count and options after upload

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 8: Implement Compress PDF Tool

**Files:**
- Create: `src/js/tools/compress.js`
- Modify: `src/js/main.js`

**Step 1: Create compress PDF tool**

Create `src/js/tools/compress.js`:
```javascript
import { PDFDocument } from 'pdf-lib'
import { validatePDF, readFileAsArrayBuffer, createDownloadLink, formatFileSize } from '../utils/file-handler.js'
import { showError, showSuccess, showLoading, hideLoading, createUploadZone } from '../utils/ui-helpers.js'

export function initCompressTool(container) {
  let uploadedFile = null
  let pdfDoc = null
  let originalSize = 0

  const content = document.createElement('div')
  content.className = 'max-w-4xl mx-auto'

  // Upload zone
  const uploadSection = document.createElement('div')
  uploadSection.className = 'bg-white rounded-lg shadow-md p-8 mb-6'

  const uploadZone = createUploadZone((files) => {
    if (files.length > 1) {
      showError('Please upload only one PDF file', uploadSection)
      return
    }
    handleFileUpload(files[0], uploadSection)
  })

  // Modify upload zone to accept single file
  const input = uploadZone.querySelector('input[type="file"]')
  input.removeAttribute('multiple')

  uploadSection.appendChild(uploadZone)

  // Compression options
  const optionsSection = document.createElement('div')
  optionsSection.id = 'compress-options'
  optionsSection.className = 'bg-white rounded-lg shadow-md p-8 mb-6 hidden'
  optionsSection.innerHTML = `
    <h3 class="text-xl font-semibold mb-4">Compression Level</h3>
    <p class="text-sm text-gray-600 mb-4">Note: Client-side compression is limited. Results may vary.</p>
    <div class="space-y-4">
      <div>
        <label class="flex items-center">
          <input type="radio" name="compress-level" value="low" class="mr-2">
          <span>Low Compression (better quality)</span>
        </label>
      </div>
      <div>
        <label class="flex items-center">
          <input type="radio" name="compress-level" value="medium" checked class="mr-2">
          <span>Medium Compression (recommended)</span>
        </label>
      </div>
      <div>
        <label class="flex items-center">
          <input type="radio" name="compress-level" value="high" class="mr-2">
          <span>High Compression (smaller file)</span>
        </label>
      </div>
    </div>
    <div id="file-info-compress" class="mt-4 p-3 bg-blue-50 rounded text-blue-700"></div>
  `

  // Action buttons
  const actionsSection = document.createElement('div')
  actionsSection.className = 'flex flex-col sm:flex-row gap-4 justify-center hidden'
  actionsSection.id = 'action-buttons'
  actionsSection.innerHTML = `
    <button id="compress-btn" class="btn-primary">
      Compress PDF
    </button>
    <button id="clear-btn" class="btn-secondary">
      Start Over
    </button>
  `

  content.appendChild(uploadSection)
  content.appendChild(optionsSection)
  content.appendChild(actionsSection)
  container.appendChild(content)

  // Event listeners
  const compressBtn = document.getElementById('compress-btn')
  const clearBtn = document.getElementById('clear-btn')

  compressBtn.addEventListener('click', () => {
    const level = document.querySelector('input[name="compress-level"]:checked').value
    compressPDF(pdfDoc, level, originalSize, container)
  })

  clearBtn.addEventListener('click', () => {
    uploadedFile = null
    pdfDoc = null
    originalSize = 0
    uploadSection.querySelector('.upload-zone').classList.remove('hidden')
    uploadSection.querySelector('#file-info')?.remove()
    optionsSection.classList.add('hidden')
    actionsSection.classList.add('hidden')
  })

  async function handleFileUpload(file, uploadSection) {
    const validation = validatePDF(file)

    if (!validation.valid) {
      showError(validation.errors.join(', '), uploadSection)
      return
    }

    try {
      showLoading(container, 'Loading PDF...')

      uploadedFile = file
      originalSize = file.size
      const arrayBuffer = await readFileAsArrayBuffer(file)
      pdfDoc = await PDFDocument.load(arrayBuffer)
      const pageCount = pdfDoc.getPageCount()

      hideLoading()

      // Hide upload zone and show file info
      uploadSection.querySelector('.upload-zone').classList.add('hidden')

      const fileInfo = document.createElement('div')
      fileInfo.id = 'file-info'
      fileInfo.className = 'bg-gray-50 p-4 rounded'
      fileInfo.innerHTML = `
        <div class="flex items-center">
          <svg class="h-8 w-8 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          </svg>
          <div>
            <p class="font-medium text-gray-900">${file.name}</p>
            <p class="text-sm text-gray-600">${pageCount} pages • ${formatFileSize(originalSize)}</p>
          </div>
        </div>
      `
      uploadSection.appendChild(fileInfo)

      // Show options
      document.getElementById('file-info-compress').textContent = `Original size: ${formatFileSize(originalSize)}`
      optionsSection.classList.remove('hidden')
      actionsSection.classList.remove('hidden')

    } catch (error) {
      hideLoading()
      console.error('Load error:', error)
      showError('Failed to load PDF. Please try another file.', uploadSection)
    }
  }
}

async function compressPDF(pdfDoc, level, originalSize, container) {
  if (!pdfDoc) {
    showError('Please upload a PDF first', container)
    return
  }

  try {
    showLoading(container, 'Compressing PDF...')

    // Note: pdf-lib has limited compression capabilities
    // We can only save with different options
    // For real compression, we'd need image processing which is complex

    let saveOptions = {}

    switch (level) {
      case 'low':
        saveOptions = { useObjectStreams: false }
        break
      case 'medium':
        saveOptions = { useObjectStreams: true }
        break
      case 'high':
        saveOptions = { useObjectStreams: true, addDefaultPage: false }
        break
    }

    const compressedBytes = await pdfDoc.save(saveOptions)
    const compressedSize = compressedBytes.length
    const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1)

    const blob = new Blob([compressedBytes], { type: 'application/pdf' })

    hideLoading()
    createDownloadLink(blob, 'compressed.pdf')

    if (compressedSize < originalSize) {
      showSuccess(`PDF compressed! Size reduced by ${reduction}% (${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)})`, container)
    } else {
      showSuccess(`PDF processed. Original size: ${formatFileSize(originalSize)}, New size: ${formatFileSize(compressedSize)}. Note: Some PDFs are already optimized and cannot be compressed further.`, container)
    }

  } catch (error) {
    hideLoading()
    console.error('Compress error:', error)
    showError('Failed to compress PDF. Please try again.', container)
  }
}
```

**Step 2: Update main.js to include compress tool**

Modify `src/js/main.js` - add to switch statement:
```javascript
case 'compress':
  import('./tools/compress.js').then(module => {
    module.initCompressTool(contentContainer)
  })
  break
```

**Step 3: Test compress tool**

Run: `npm run dev`
Expected: Upload PDF, select compression level, download compressed PDF

**Step 4: Commit**

```bash
git add .
git commit -m "feat: implement compress PDF tool

- Add PDF compression with three levels
- Show original vs compressed file sizes
- Calculate compression percentage
- Handle PDFs that cannot be compressed further
- Note: Client-side compression is limited

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 9: Implement Rotate PDF Tool

**Files:**
- Create: `src/js/tools/rotate.js`
- Modify: `src/js/main.js`

**Step 1: Create rotate PDF tool**

Create `src/js/tools/rotate.js`:
```javascript
import { PDFDocument, degrees } from 'pdf-lib'
import { validatePDF, readFileAsArrayBuffer, createDownloadLink } from '../utils/file-handler.js'
import { showError, showSuccess, showLoading, hideLoading, createUploadZone } from '../utils/ui-helpers.js'

export function initRotateTool(container) {
  let uploadedFile = null
  let pdfDoc = null

  const content = document.createElement('div')
  content.className = 'max-w-4xl mx-auto'

  // Upload zone
  const uploadSection = document.createElement('div')
  uploadSection.className = 'bg-white rounded-lg shadow-md p-8 mb-6'

  const uploadZone = createUploadZone((files) => {
    if (files.length > 1) {
      showError('Please upload only one PDF file', uploadSection)
      return
    }
    handleFileUpload(files[0], uploadSection)
  })

  // Modify upload zone to accept single file
  const input = uploadZone.querySelector('input[type="file"]')
  input.removeAttribute('multiple')

  uploadSection.appendChild(uploadZone)

  // Rotation options
  const optionsSection = document.createElement('div')
  optionsSection.id = 'rotate-options'
  optionsSection.className = 'bg-white rounded-lg shadow-md p-8 mb-6 hidden'
  optionsSection.innerHTML = `
    <h3 class="text-xl font-semibold mb-4">Rotation Options</h3>
    <div class="space-y-6">
      <div>
        <h4 class="font-medium mb-2">Rotation Angle</h4>
        <div class="flex gap-4">
          <button class="rotate-btn px-4 py-2 border-2 border-blue-600 text-blue-600 rounded hover:bg-blue-50" data-angle="90">
            90° →
          </button>
          <button class="rotate-btn px-4 py-2 border-2 border-blue-600 text-blue-600 rounded hover:bg-blue-50" data-angle="180">
            180° ↓
          </button>
          <button class="rotate-btn px-4 py-2 border-2 border-blue-600 text-blue-600 rounded hover:bg-blue-50" data-angle="270">
            270° ←
          </button>
        </div>
      </div>
      <div>
        <h4 class="font-medium mb-2">Apply To</h4>
        <div class="space-y-2">
          <label class="flex items-center">
            <input type="radio" name="rotate-scope" value="all" checked class="mr-2">
            <span>All pages</span>
          </label>
          <label class="flex items-center">
            <input type="radio" name="rotate-scope" value="specific" class="mr-2">
            <span>Specific pages</span>
          </label>
          <div id="page-input" class="ml-6 mt-2 hidden">
            <label class="block text-sm text-gray-600 mb-1">Pages (e.g., 1-3, 5, 7)</label>
            <input type="text" id="page-numbers" class="border border-gray-300 rounded px-3 py-2 w-full" placeholder="1-3">
          </div>
        </div>
      </div>
    </div>
    <div id="file-info-rotate" class="mt-4 p-3 bg-blue-50 rounded text-blue-700"></div>
    <div id="selected-rotation" class="mt-3 p-3 bg-gray-100 rounded text-gray-700 hidden"></div>
  `

  // Action buttons
  const actionsSection = document.createElement('div')
  actionsSection.className = 'flex flex-col sm:flex-row gap-4 justify-center hidden'
  actionsSection.id = 'action-buttons'
  actionsSection.innerHTML = `
    <button id="apply-btn" class="btn-primary" disabled>
      Apply Rotation
    </button>
    <button id="clear-btn" class="btn-secondary">
      Start Over
    </button>
  `

  content.appendChild(uploadSection)
  content.appendChild(optionsSection)
  content.appendChild(actionsSection)
  container.appendChild(content)

  // Event listeners
  let selectedAngle = null

  const rotateButtons = optionsSection.querySelectorAll('.rotate-btn')
  rotateButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      rotateButtons.forEach(b => b.classList.remove('bg-blue-600', 'text-white'))
      btn.classList.add('bg-blue-600', 'text-white')
      selectedAngle = parseInt(btn.dataset.angle)

      document.getElementById('selected-rotation').textContent = `Selected: ${selectedAngle}° rotation`
      document.getElementById('selected-rotation').classList.remove('hidden')
      document.getElementById('apply-btn').disabled = false
    })
  })

  const specificRadio = optionsSection.querySelector('input[value="specific"]')
  const allRadio = optionsSection.querySelector('input[value="all"]')
  const pageInput = document.getElementById('page-input')

  specificRadio.addEventListener('change', () => {
    pageInput.classList.remove('hidden')
  })

  allRadio.addEventListener('change', () => {
    pageInput.classList.add('hidden')
  })

  const applyBtn = document.getElementById('apply-btn')
  const clearBtn = document.getElementById('clear-btn')

  applyBtn.addEventListener('click', () => {
    if (!selectedAngle) {
      showError('Please select a rotation angle', container)
      return
    }

    const scope = document.querySelector('input[name="rotate-scope"]:checked').value
    rotatePDF(pdfDoc, selectedAngle, scope, container)
  })

  clearBtn.addEventListener('click', () => {
    uploadedFile = null
    pdfDoc = null
    selectedAngle = null
    uploadSection.querySelector('.upload-zone').classList.remove('hidden')
    uploadSection.querySelector('#file-info')?.remove()
    optionsSection.classList.add('hidden')
    actionsSection.classList.add('hidden')
    rotateButtons.forEach(b => b.classList.remove('bg-blue-600', 'text-white'))
    applyBtn.disabled = true
  })

  async function handleFileUpload(file, uploadSection) {
    const validation = validatePDF(file)

    if (!validation.valid) {
      showError(validation.errors.join(', '), uploadSection)
      return
    }

    try {
      showLoading(container, 'Loading PDF...')

      uploadedFile = file
      const arrayBuffer = await readFileAsArrayBuffer(file)
      pdfDoc = await PDFDocument.load(arrayBuffer)
      const pageCount = pdfDoc.getPageCount()

      hideLoading()

      // Hide upload zone and show file info
      uploadSection.querySelector('.upload-zone').classList.add('hidden')

      const fileInfo = document.createElement('div')
      fileInfo.id = 'file-info'
      fileInfo.className = 'bg-gray-50 p-4 rounded'
      fileInfo.innerHTML = `
        <div class="flex items-center">
          <svg class="h-8 w-8 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          </svg>
          <div>
            <p class="font-medium text-gray-900">${file.name}</p>
            <p class="text-sm text-gray-600">${pageCount} pages</p>
          </div>
        </div>
      `
      uploadSection.appendChild(fileInfo)

      // Show options
      document.getElementById('file-info-rotate').textContent = `Total pages: ${pageCount}`
      optionsSection.classList.remove('hidden')
      actionsSection.classList.remove('hidden')

    } catch (error) {
      hideLoading()
      console.error('Load error:', error)
      showError('Failed to load PDF. Please try another file.', uploadSection)
    }
  }
}

async function rotatePDF(pdfDoc, angle, scope, container) {
  if (!pdfDoc) {
    showError('Please upload a PDF first', container)
    return
  }

  try {
    showLoading(container, 'Rotating PDF...')

    const pages = pdfDoc.getPages()
    const pageCount = pdfDoc.getPageCount()

    if (scope === 'all') {
      // Rotate all pages
      pages.forEach(page => {
        page.setRotation(degrees(angle))
      })
    } else if (scope === 'specific') {
      const pageInput = document.getElementById('page-numbers').value
      const pageIndices = parsePageRange(pageInput, pageCount)

      if (pageIndices.length === 0) {
        hideLoading()
        showError('Invalid page numbers. Use format like: 1-3, 5, 7', container)
        return
      }

      pageIndices.forEach(index => {
        pages[index].setRotation(degrees(angle))
      })
    }

    const rotatedBytes = await pdfDoc.save()
    const blob = new Blob([rotatedBytes], { type: 'application/pdf' })

    hideLoading()
    createDownloadLink(blob, 'rotated.pdf')
    showSuccess(`PDF rotated ${angle}° successfully!`, container)

  } catch (error) {
    hideLoading()
    console.error('Rotate error:', error)
    showError('Failed to rotate PDF. Please try again.', container)
  }
}

function parsePageRange(input, maxPages) {
  const pages = []
  const parts = input.split(',')

  for (const part of parts) {
    const trimmed = part.trim()

    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()))
      if (isNaN(start) || isNaN(end) || start < 1 || end > maxPages || start > end) {
        return []
      }
      for (let i = start; i <= end; i++) {
        pages.push(i - 1)
      }
    } else {
      const page = parseInt(trimmed)
      if (isNaN(page) || page < 1 || page > maxPages) {
        return []
      }
      pages.push(page - 1)
    }
  }

  return [...new Set(pages)].sort((a, b) => a - b)
}
```

**Step 2: Update main.js to include rotate tool**

Modify `src/js/main.js` - add to switch statement:
```javascript
case 'rotate':
  import('./tools/rotate.js').then(module => {
    module.initRotateTool(contentContainer)
  })
  break
```

**Step 3: Test rotate tool**

Run: `npm run dev`
Expected: Upload PDF, select angle, choose pages, download rotated PDF

**Step 4: Commit**

```bash
git add .
git commit -m "feat: implement rotate PDF tool

- Add rotation in 90°, 180°, and 270° angles
- Support rotating all pages or specific pages
- Parse page ranges for selective rotation
- Visual feedback for selected angle
- Generate and download rotated PDF

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Phase 5: Remaining Tools & Polish

### Task 10: Implement Remaining Tools (PDF to Images, Images to PDF, Extract Pages)

**Note:** Due to the length of this plan, the remaining tool implementations follow the same pattern as Tasks 6-9. Each tool would be implemented similarly with:
1. Create `src/js/tools/{tool-name}.js`
2. Import and initialize in `main.js` switch statement
3. Test functionality
4. Commit

For brevity, I'll document the key differences for each remaining tool:

**PDF to Images:**
- Use PDF.js `getPage()` and `render()` to canvas
- Convert canvas to PNG/JPG blobs
- Download each page as separate image

**Images to PDF:**
- Use PDF-lib `embedPng()` and `embedJpg()`
- Create pages sized to images
- Add images to PDF pages

**Extract Pages:**
- Similar to split tool but with multi-select UI
- Allow selecting non-contiguous pages
- Download single PDF with selected pages

---

### Task 11: Add Footer with Privacy & Terms Pages

**Files:**
- Create: `src/js/components/footer.js`
- Create: `src/js/pages/privacy.js`
- Create: `src/js/pages/terms.js`
- Modify: `src/js/main.js`
- Modify: `src/js/router.js`

**Step 1: Create footer component**

Create `src/js/components/footer.js`:
```javascript
export function createFooter() {
  const footer = document.createElement('footer')
  footer.className = 'bg-gray-900 text-white py-12 mt-20'
  footer.innerHTML = `
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 class="text-lg font-semibold mb-4">About</h3>
          <p class="text-gray-400">Free PDF tools that process files securely in your browser. Your privacy is our priority.</p>
        </div>
        <div>
          <h3 class="text-lg font-semibold mb-4">Legal</h3>
          <ul class="space-y-2">
            <li><a href="#privacy" class="text-gray-400 hover:text-white">Privacy Policy</a></li>
            <li><a href="#terms" class="text-gray-400 hover:text-white">Terms of Service</a></li>
          </ul>
        </div>
        <div>
          <h3 class="text-lg font-semibold mb-4">Contact</h3>
          <p class="text-gray-400">Questions? Email us at:<br>support@pdftools.example</p>
        </div>
      </div>
      <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
        <p>&copy; 2026 PDF Tools. All rights reserved.</p>
      </div>
    </div>
  `

  return footer
}
```

**Step 2: Add footer to home page**

Modify `src/js/main.js` - update `showHomePage`:
```javascript
import { createFooter } from './components/footer.js'

function showHomePage() {
  const app = document.getElementById('app')
  app.innerHTML = ''

  app.appendChild(createHeader())
  app.appendChild(createHero())
  app.appendChild(createFeaturesGrid())
  app.appendChild(createFooter())
}
```

**Step 3: Create privacy policy page**

Create `src/js/pages/privacy.js`:
```javascript
export function createPrivacyPage() {
  const page = document.createElement('div')
  page.className = 'min-h-screen bg-white'

  page.innerHTML = `
    <div class="container mx-auto px-4 py-12 max-w-4xl">
      <a href="#home" class="text-blue-600 hover:text-blue-800 mb-6 inline-block">&larr; Back to Home</a>
      <h1 class="text-4xl font-bold mb-8">Privacy Policy</h1>

      <div class="prose prose-lg">
        <p class="text-gray-600 mb-6">Last updated: February 13, 2026</p>

        <h2 class="text-2xl font-semibold mt-8 mb-4">Your Privacy Matters</h2>
        <p>At PDF Tools, we take your privacy seriously. This policy explains how we handle your data.</p>

        <h2 class="text-2xl font-semibold mt-8 mb-4">Data Processing</h2>
        <p>All PDF processing happens entirely in your browser. Your files:</p>
        <ul class="list-disc ml-6 space-y-2">
          <li>Never leave your device</li>
          <li>Are not uploaded to our servers</li>
          <li>Are not stored anywhere</li>
          <li>Are processed using client-side JavaScript</li>
        </ul>

        <h2 class="text-2xl font-semibold mt-8 mb-4">Analytics</h2>
        <p>We use Google Analytics to understand how visitors use our site. This includes:</p>
        <ul class="list-disc ml-6 space-y-2">
          <li>Page views and navigation patterns</li>
          <li>Browser type and device information</li>
          <li>No personally identifiable information</li>
        </ul>

        <h2 class="text-2xl font-semibold mt-8 mb-4">Advertising</h2>
        <p>We display ads through Google AdSense. Google may use cookies to show relevant ads based on your browsing history across websites.</p>

        <h2 class="text-2xl font-semibold mt-8 mb-4">Contact</h2>
        <p>Questions about privacy? Email us at support@pdftools.example</p>
      </div>
    </div>
  `

  return page
}
```

**Step 4: Create terms of service page**

Create `src/js/pages/terms.js`:
```javascript
export function createTermsPage() {
  const page = document.createElement('div')
  page.className = 'min-h-screen bg-white'

  page.innerHTML = `
    <div class="container mx-auto px-4 py-12 max-w-4xl">
      <a href="#home" class="text-blue-600 hover:text-blue-800 mb-6 inline-block">&larr; Back to Home</a>
      <h1 class="text-4xl font-bold mb-8">Terms of Service</h1>

      <div class="prose prose-lg">
        <p class="text-gray-600 mb-6">Last updated: February 13, 2026</p>

        <h2 class="text-2xl font-semibold mt-8 mb-4">Acceptance of Terms</h2>
        <p>By using PDF Tools, you agree to these terms of service.</p>

        <h2 class="text-2xl font-semibold mt-8 mb-4">Use of Service</h2>
        <p>You may use our tools for:</p>
        <ul class="list-disc ml-6 space-y-2">
          <li>Personal and commercial PDF processing</li>
          <li>Any lawful purpose</li>
          <li>Processing files you have rights to modify</li>
        </ul>

        <h2 class="text-2xl font-semibold mt-8 mb-4">Limitations</h2>
        <p>We provide this service "as is" without warranties. We are not liable for:</p>
        <ul class="list-disc ml-6 space-y-2">
          <li>Data loss or corruption</li>
          <li>Service interruptions</li>
          <li>Errors in processing</li>
        </ul>

        <h2 class="text-2xl font-semibold mt-8 mb-4">File Size Limits</h2>
        <p>Files are limited to 50MB per file due to browser constraints.</p>

        <h2 class="text-2xl font-semibold mt-8 mb-4">Contact</h2>
        <p>Questions? Email us at support@pdftools.example</p>
      </div>
    </div>
  `

  return page
}
```

**Step 5: Update router to handle privacy and terms pages**

Modify `src/js/router.js` and `src/js/main.js` to add privacy/terms routes:
```javascript
// In main.js
import { createPrivacyPage } from './pages/privacy.js'
import { createTermsPage } from './pages/terms.js'

initRouter({
  home: showHomePage,
  tool: showToolPage,
  privacy: showPrivacyPage,
  terms: showTermsPage
})

function showPrivacyPage() {
  const app = document.getElementById('app')
  app.innerHTML = ''
  app.appendChild(createPrivacyPage())
}

function showTermsPage() {
  const app = document.getElementById('app')
  app.innerHTML = ''
  app.appendChild(createTermsPage())
}
```

**Step 6: Test footer and legal pages**

Run: `npm run dev`
Expected: Footer appears on home, clicking privacy/terms navigates to those pages

**Step 7: Commit**

```bash
git add .
git commit -m "feat: add footer and legal pages

- Create footer component with links
- Add privacy policy page with clear data handling info
- Add terms of service page
- Update router to handle legal pages
- Link footer to home page

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Phase 6: AdSense Integration

### Task 12: Add Google AdSense Placeholders

**Files:**
- Create: `src/js/components/ad-units.js`
- Modify: `index.html`
- Modify: `src/js/main.js`

**Step 1: Create ad unit components**

Create `src/js/components/ad-units.js`:
```javascript
/**
 * Ad unit placeholders for Google AdSense
 * Replace data-ad-client and data-ad-slot with real values after AdSense approval
 */

export function createTopBannerAd() {
  const ad = document.createElement('div')
  ad.className = 'container mx-auto px-4 py-4'
  ad.innerHTML = `
    <!-- AdSense Top Banner (728x90) -->
    <div class="flex justify-center">
      <ins class="adsbygoogle"
           style="display:inline-block;width:728px;height:90px"
           data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
           data-ad-slot="XXXXXXXXXX"></ins>
    </div>
  `
  return ad
}

export function createSidebarAd() {
  const ad = document.createElement('div')
  ad.className = 'sticky top-20'
  ad.innerHTML = `
    <!-- AdSense Sidebar (300x600) -->
    <ins class="adsbygoogle"
         style="display:inline-block;width:300px;height:600px"
         data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
         data-ad-slot="XXXXXXXXXX"></ins>
  `
  return ad
}

export function createInArticleAd() {
  const ad = document.createElement('div')
  ad.className = 'my-8'
  ad.innerHTML = `
    <!-- AdSense In-Article (Responsive) -->
    <ins class="adsbygoogle"
         style="display:block; text-align:center;"
         data-ad-layout="in-article"
         data-ad-format="fluid"
         data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
         data-ad-slot="XXXXXXXXXX"></ins>
  `
  return ad
}

export function initAds() {
  // Push ads to AdSense after page load
  if (window.adsbygoogle) {
    const ads = document.querySelectorAll('.adsbygoogle')
    ads.forEach(ad => {
      if (!ad.dataset.adsbygoogleStatus) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({})
        } catch (e) {
          console.error('AdSense error:', e)
        }
      }
    })
  }
}
```

**Step 2: Add AdSense script to HTML**

Modify `index.html` - add to `<head>`:
```html
<!-- Google AdSense -->
<!-- Replace with your AdSense code after approval -->
<!-- <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
     crossorigin="anonymous"></script> -->
<!-- Uncomment above after getting AdSense approval -->
```

**Step 3: Add ad placeholders to home page**

Modify `src/js/main.js`:
```javascript
import { createTopBannerAd, initAds } from './components/ad-units.js'

function showHomePage() {
  const app = document.getElementById('app')
  app.innerHTML = ''

  app.appendChild(createHeader())
  app.appendChild(createTopBannerAd()) // Add top ad
  app.appendChild(createHero())
  app.appendChild(createFeaturesGrid())
  app.appendChild(createFooter())

  // Initialize ads after DOM is ready
  setTimeout(() => initAds(), 100)
}
```

**Step 4: Add comment placeholders for ads**

Edit `src/js/components/ad-units.js` to add development placeholders:
```javascript
// Add this function for development
export function createAdPlaceholder(size) {
  const placeholder = document.createElement('div')
  placeholder.className = 'bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-600'
  placeholder.style.width = size.width
  placeholder.style.height = size.height
  placeholder.textContent = `Ad Placeholder (${size.width} x ${size.height})`
  return placeholder
}
```

**Step 5: Test ad placeholders**

Run: `npm run dev`
Expected: See ad placeholder boxes on homepage (actual ads load after AdSense approval)

**Step 6: Create AdSense setup documentation**

Create `docs/adsense-setup.md`:
```markdown
# Google AdSense Setup Guide

## Steps to Enable Ads

1. **Apply for AdSense**
   - Go to https://www.google.com/adsense
   - Sign up with Google account
   - Add your website URL
   - Wait for approval (usually 1-2 weeks)

2. **Get Your Publisher ID**
   - After approval, get your publisher ID (ca-pub-XXXXXXXXXXXXXXXX)
   - Copy your ad unit codes

3. **Update Code**
   - Edit `index.html` and uncomment AdSense script
   - Replace `ca-pub-XXXXXXXXXXXXXXXX` with your real ID
   - Edit `src/js/components/ad-units.js` and replace:
     - `data-ad-client` values
     - `data-ad-slot` values for each ad unit

4. **Create Ad Units in AdSense Dashboard**
   - Create display ad (728x90 leaderboard for top)
   - Create display ad (300x600 half page for sidebar)
   - Create in-article ad (responsive)

5. **Test Ads**
   - Deploy to production
   - Visit site (ads may take 20 minutes to show)
   - Check AdSense dashboard for impressions

## Ad Placement Best Practices

- Top banner: High visibility, good CTR
- Between sections: Natural reading flow
- Sidebar: Desktop only, persistent visibility
- Avoid too many ads: Degrades UX

## Expected Revenue

- 1,000 visitors/month: $5-20
- 10,000 visitors/month: $50-200
- 100,000 visitors/month: $500-2,000

Revenue varies by niche, traffic quality, and ad placement.
```

**Step 7: Commit**

```bash
git add .
git commit -m "feat: add Google AdSense integration structure

- Create ad unit components with placeholders
- Add AdSense script placeholder in HTML
- Integrate ads into home page layout
- Add development ad placeholders
- Create AdSense setup documentation

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Phase 7: Deployment

### Task 13: Prepare for Production & Deploy to Netlify

**Files:**
- Create: `netlify.toml`
- Create: `README.md`
- Create: `.env.example`

**Step 1: Create Netlify configuration**

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
    [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "*.js"
    [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.css"
    [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

**Step 2: Create comprehensive README**

Create `README.md`:
```markdown
# PDF Tools - Free Online PDF Processing

Privacy-first PDF tools that process files entirely in your browser. No uploads, no tracking, just tools.

## Features

- ✅ Merge PDFs
- ✅ Split PDF
- ✅ Compress PDF
- ✅ Rotate Pages
- ✅ PDF to Images
- ✅ Images to PDF
- ✅ Extract Pages

## Technology Stack

- **Frontend**: Vite, Vanilla JavaScript, Tailwind CSS
- **PDF Processing**: PDF-lib, PDF.js
- **Hosting**: Netlify
- **Monetization**: Google AdSense

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

This project is configured for Netlify:

1. Push code to GitHub
2. Connect repository to Netlify
3. Netlify auto-deploys on push to main branch
4. Custom domain configuration in Netlify dashboard

## Privacy

All PDF processing happens client-side in the browser. Files never touch our servers.

## License

MIT License - See LICENSE file for details

## Contact

Questions? Email support@pdftools.example
```

**Step 3: Create environment example file**

Create `.env.example`:
```
# Google AdSense Publisher ID
# Get this from https://www.google.com/adsense after approval
VITE_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX

# Google Analytics Tracking ID (optional)
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

**Step 4: Add build test**

Run: `npm run build`
Expected: Build completes successfully, `dist/` folder created

**Step 5: Test production build locally**

Run: `npm run preview`
Expected: Production build serves correctly on localhost

**Step 6: Create deployment checklist**

Create `docs/deployment-checklist.md`:
```markdown
# Deployment Checklist

## Pre-Deployment

- [ ] All tools tested on mobile and desktop
- [ ] No console errors in browser DevTools
- [ ] Build completes successfully (`npm run build`)
- [ ] Production preview works (`npm run preview`)
- [ ] Privacy policy and terms pages reviewed
- [ ] Contact email updated in footer and legal pages
- [ ] AdSense placeholders ready (to be replaced after approval)

## Netlify Deployment

1. [ ] Create Netlify account at https://www.netlify.com
2. [ ] Connect GitHub repository
3. [ ] Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. [ ] Deploy site
5. [ ] Verify deployment at Netlify URL

## Custom Domain

1. [ ] Purchase domain (Namecheap, Google Domains, etc.)
2. [ ] Add domain in Netlify dashboard
3. [ ] Update DNS records as instructed by Netlify
4. [ ] Enable HTTPS (automatic with Netlify)
5. [ ] Wait for DNS propagation (up to 48 hours)

## Post-Deployment

1. [ ] Test all tools on live site
2. [ ] Apply for Google AdSense
3. [ ] Set up Google Analytics (optional)
4. [ ] Submit site to search engines
5. [ ] List on tool directories (ProductHunt, AlternativeTo)

## Monitoring

- Check Netlify dashboard for deploy status
- Monitor AdSense dashboard for revenue
- Use Google Analytics for traffic insights
- Check browser console for errors
```

**Step 7: Commit and prepare for deployment**

```bash
git add .
git commit -m "feat: add production configuration and documentation

- Create Netlify configuration with redirects
- Add comprehensive README with setup instructions
- Create environment variable examples
- Add deployment checklist documentation
- Configure caching and security headers

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

**Step 8: Push to GitHub and deploy**

```bash
# Create GitHub repository (if not already done)
# Then push code

git remote add origin https://github.com/yourusername/pdf-tools-business.git
git branch -M main
git push -u origin main

# Then follow Netlify deployment steps in docs/deployment-checklist.md
```

---

## Plan Complete

This implementation plan provides a complete roadmap for building your PDF tools business from scratch. The plan is structured to be executed task-by-task with clear steps, code examples, and test verification at each stage.

**Total Estimated Timeline:** 2-4 weeks full-time

**Key Phases:**
1. ✅ Project setup and foundation (Day 1-2)
2. ✅ Landing page and UI (Day 2-3)
3. ✅ Tool infrastructure and routing (Day 3-4)
4. ✅ PDF tools implementation (Day 4-12)
5. ✅ AdSense integration (Day 12-13)
6. ✅ Testing and polish (Day 13-14)
7. ✅ Deployment (Day 14)

**Next Steps:**
1. Execute this plan using superpowers:executing-plans or superpowers:subagent-driven-development
2. Test thoroughly on both mobile and desktop
3. Deploy to Netlify
4. Apply for Google AdSense
5. Start driving traffic through SEO and directories

**Success Metrics:**
- Month 1: 100-500 visitors, $1-10 revenue
- Month 3: 1,000-5,000 visitors, $20-100 revenue
- Month 6: 10,000+ visitors, $200-500 revenue
