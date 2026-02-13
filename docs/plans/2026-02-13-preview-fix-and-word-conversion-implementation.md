# Preview Fix and Word Conversion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix PDF.js worker loading issues (fixes preview + OCR) and implement bidirectional Word ↔ PDF conversion with text and image extraction.

**Architecture:** Replace CDN-based PDF.js worker with local module resolution. Implement PDF→Word using PDF.js text/image extraction + docx library. Implement Word→PDF using mammoth.js HTML conversion + jsPDF rendering.

**Tech Stack:** PDF.js 5.4.624, docx, mammoth, jspdf, html2canvas

---

## Task 1: Fix PDF.js Worker in Preview Renderer

**Files:**
- Modify: `/Users/sabuj.mondal/pdf-tools-business/src/js/utils/preview-renderer.js:4`

**Step 1: Update worker configuration**

Replace line 4 in preview-renderer.js:

```javascript
// OLD:
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

// NEW:
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href
```

**Step 2: Test preview in merge tool**

Run: `npm run dev`
Action: Open http://localhost:3000/#merge, upload PDF
Expected: 80px preview thumbnail renders without errors

**Step 3: Test preview in split tool**

Action: Navigate to http://localhost:3000/#split, upload PDF
Expected: 150px preview thumbnail renders without errors

**Step 4: Commit**

```bash
git add src/js/utils/preview-renderer.js
git commit -m "fix: use local PDF.js worker instead of CDN in preview renderer

Fixes preview thumbnails in merge, split, compress tools by using
Vite-resolved local worker module instead of unreliable CDN URL.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 2: Fix PDF.js Worker in Rotate Tool

**Files:**
- Modify: `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/rotate.js:9`

**Step 1: Update worker configuration**

Replace line 9 in rotate.js:

```javascript
// OLD:
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

// NEW:
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href
```

**Step 2: Test rotation preview**

Action: Navigate to http://localhost:3000/#rotate, upload PDF
Expected: 250px preview renders at 0°

**Step 3: Test live preview updates**

Action: Click 90°, 180°, 270° buttons
Expected: Preview updates in real-time showing rotated pages

**Step 4: Commit**

```bash
git add src/js/tools/rotate.js
git commit -m "fix: use local PDF.js worker in rotate tool

Fixes live rotation preview by using local worker module.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 3: Fix PDF.js Worker in OCR Tool

**Files:**
- Modify: `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/ocr.js:9`

**Step 1: Update worker configuration**

Replace line 9 in ocr.js:

```javascript
// OLD:
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

// NEW:
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href
```

**Step 2: Test OCR preview and extraction**

Action: Navigate to http://localhost:3000/#ocr, upload text-based PDF
Expected: 150px preview renders, text extraction works

**Step 3: Verify no worker errors**

Action: Open browser console, check for errors
Expected: No PDF.js worker errors

**Step 4: Commit**

```bash
git add src/js/tools/ocr.js
git commit -m "fix: use local PDF.js worker in OCR tool

Fixes preview rendering and canvas generation for OCR processing.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 4: Install Dependencies for Word Conversion

**Files:**
- Modify: `/Users/sabuj.mondal/pdf-tools-business/package.json`

**Step 1: Install docx library**

Run: `npm install docx`
Expected: docx added to dependencies

**Step 2: Install mammoth library**

Run: `npm install mammoth`
Expected: mammoth added to dependencies

**Step 3: Install jspdf and html2canvas**

Run: `npm install jspdf html2canvas`
Expected: jspdf and html2canvas added to dependencies

**Step 4: Verify installation**

Run: `npm list docx mammoth jspdf html2canvas`
Expected: All packages listed with versions

**Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add libraries for Word conversion features

- docx: for creating .docx files from PDF
- mammoth: for parsing .docx to HTML
- jspdf: for PDF generation
- html2canvas: for HTML to canvas rendering

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 5: Create PDF to Word Tool - File Structure

**Files:**
- Create: `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/pdf-to-word.js`

**Step 1: Create file with imports**

```javascript
import * as pdfjsLib from 'pdfjs-dist'
import { Document, Packer, Paragraph, ImageRun, HeadingLevel, TextRun } from 'docx'
import { validatePDF, readFileAsArrayBuffer } from '../utils/file-handler.js'
import { showError, showSuccess, showLoading, hideLoading, createUploadZone } from '../utils/ui-helpers.js'
import { renderPreview } from '../utils/preview-renderer.js'
import { generateFileName } from '../utils/file-naming.js'

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href

export function initPdfToWordTool(container) {
  let uploadedFile = null
  let uploadedFileName = ''

  const content = document.createElement('div')
  content.className = 'max-w-4xl mx-auto'

  // TODO: Add UI sections

  container.appendChild(content)
}
```

**Step 2: Save file**

Expected: File created with basic structure

**Step 3: Verify no syntax errors**

Run: `npm run dev`
Expected: No build errors

**Step 4: Commit**

```bash
git add src/js/tools/pdf-to-word.js
git commit -m "feat: add PDF to Word tool skeleton

Initial file structure with imports and basic function.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 6: Add PDF to Word UI - Upload Section

**Files:**
- Modify: `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/pdf-to-word.js`

**Step 1: Add upload section to initPdfToWordTool**

After `content.className = 'max-w-4xl mx-auto'`, add:

```javascript
  // Warning banner
  const warningBanner = document.createElement('div')
  warningBanner.className = 'bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6'
  warningBanner.innerHTML = `
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="ml-3">
        <h3 class="text-sm font-medium text-yellow-800">PDF to Word Converter</h3>
        <div class="mt-2 text-sm text-yellow-700">
          <ul class="list-disc list-inside space-y-1">
            <li>Only works with PDFs containing selectable text (not scanned images)</li>
            <li>Extracts text and images but does NOT preserve:
              <ul class="ml-6 mt-1 space-y-1">
                <li>• Layout and formatting</li>
                <li>• Tables and columns</li>
                <li>• Fonts and text styles</li>
                <li>• Headers and footers</li>
              </ul>
            </li>
            <li>For scanned PDFs, use the OCR tool first</li>
          </ul>
        </div>
      </div>
    </div>
  `

  // Upload zone
  const uploadSection = document.createElement('div')
  uploadSection.className = 'bg-white rounded-lg shadow-md p-8 mb-6'

  const uploadZone = createUploadZone((files) => {
    if (files.length > 1) {
      showError('Please upload only one PDF file', uploadSection)
      return
    }
    handleFileUpload(files[0], uploadSection, content)
  })

  const input = uploadZone.querySelector('input[type="file"]')
  input.removeAttribute('multiple')

  uploadSection.appendChild(uploadZone)

  content.appendChild(warningBanner)
  content.appendChild(uploadSection)
```

**Step 2: Add action buttons section**

After uploadSection.appendChild, before content.appendChild:

```javascript
  // Action buttons
  const actionsSection = document.createElement('div')
  actionsSection.className = 'flex flex-col sm:flex-row gap-4 justify-center hidden'
  actionsSection.id = 'action-buttons-pdf-to-word'
  actionsSection.innerHTML = `
    <button id="convert-to-word-btn" class="btn-primary">
      Convert to Word
    </button>
    <button id="clear-pdf-to-word-btn" class="btn-secondary">
      Start Over
    </button>
  `

  content.appendChild(actionsSection)
```

**Step 3: Add event listener stubs**

Before the closing brace of initPdfToWordTool:

```javascript
  // Event listeners
  const convertBtn = document.getElementById('convert-to-word-btn')
  const clearBtn = document.getElementById('clear-pdf-to-word-btn')

  if (convertBtn) {
    convertBtn.addEventListener('click', () => {
      convertPdfToWord(uploadedFile, content, uploadedFileName)
    })
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      uploadedFile = null
      uploadedFileName = ''
      uploadSection.querySelector('.upload-zone').classList.remove('hidden')
      uploadSection.querySelector('#file-info-pdf-to-word')?.remove()
      actionsSection.classList.add('hidden')
    })
  }

  function handleFileUpload(file, uploadSection, container) {
    // TODO: Implement
    console.log('File uploaded:', file.name)
  }
}

// Stub functions to be implemented
function convertPdfToWord(file, container, fileName) {
  console.log('Convert to Word:', fileName)
}
```

**Step 4: Test UI renders**

Run: `npm run dev` (if not running)
Action: Navigate to http://localhost:3000/#pdf-to-word (won't work yet, route not added)
Expected: Build succeeds, no errors

**Step 5: Commit**

```bash
git add src/js/tools/pdf-to-word.js
git commit -m "feat: add PDF to Word UI components

Adds warning banner, upload zone, and action buttons.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 7: Implement PDF to Word File Upload Handler

**Files:**
- Modify: `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/pdf-to-word.js`

**Step 1: Replace handleFileUpload stub**

Replace the handleFileUpload function:

```javascript
  async function handleFileUpload(file, uploadSection, container) {
    const validation = validatePDF(file)

    if (!validation.valid) {
      showError(validation.errors.join(', '), uploadSection)
      return
    }

    try {
      showLoading(container, 'Loading PDF...')

      uploadedFile = file
      uploadedFileName = file.name
      const arrayBuffer = await readFileAsArrayBuffer(file)
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      const pdf = await loadingTask.promise
      const pageCount = pdf.numPages

      // Clean up
      pdf.destroy()

      hideLoading()

      // Hide upload zone and show file info
      uploadSection.querySelector('.upload-zone').classList.add('hidden')

      const fileInfo = document.createElement('div')
      fileInfo.id = 'file-info-pdf-to-word'
      fileInfo.className = 'bg-gray-50 p-4 rounded'
      fileInfo.innerHTML = `
        <div class="flex items-start gap-4">
          <div id="pdf-to-word-preview" class="flex-shrink-0"></div>
          <div class="flex items-center flex-1">
            <svg class="h-8 w-8 text-red-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
            </svg>
            <div>
              <p class="font-medium text-gray-900">${file.name}</p>
              <p class="text-sm text-gray-600">${pageCount} pages</p>
            </div>
          </div>
        </div>
      `
      uploadSection.appendChild(fileInfo)

      // Render preview
      const previewContainer = document.getElementById('pdf-to-word-preview')
      await renderPreview(arrayBuffer, previewContainer, 150)

      // Show action buttons
      document.getElementById('action-buttons-pdf-to-word').classList.remove('hidden')

    } catch (error) {
      hideLoading()
      console.error('Load error:', error)
      showError('Failed to load PDF. Please try another file.', uploadSection)
    }
  }
```

**Step 2: Test file upload (once route is added)**

Expected: File uploads, preview renders, buttons appear

**Step 3: Commit**

```bash
git add src/js/tools/pdf-to-word.js
git commit -m "feat: implement PDF to Word file upload handler

Validates PDF, shows preview, displays file info.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 8: Implement Text Extraction from PDF

**Files:**
- Modify: `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/pdf-to-word.js`

**Step 1: Add text extraction helper function**

After the stub convertPdfToWord function, add:

```javascript
async function extractTextFromPage(page) {
  const textContent = await page.getTextContent()
  const items = textContent.items

  if (items.length === 0) {
    return []
  }

  // Group text items by Y position (lines)
  const lines = []
  let currentLine = { y: items[0].transform[5], text: '' }

  for (const item of items) {
    const y = item.transform[5]
    const text = item.str

    // If Y position differs by more than 2px, it's a new line
    if (Math.abs(y - currentLine.y) > 2) {
      if (currentLine.text.trim()) {
        lines.push(currentLine.text.trim())
      }
      currentLine = { y, text }
    } else {
      // Same line, add space if needed
      if (currentLine.text && !currentLine.text.endsWith(' ')) {
        currentLine.text += ' '
      }
      currentLine.text += text
    }
  }

  // Add last line
  if (currentLine.text.trim()) {
    lines.push(currentLine.text.trim())
  }

  // Group lines into paragraphs (gap > 10px vertical distance)
  const paragraphs = []
  let currentParagraph = []
  let lastY = items[0].transform[5]

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const y = item.transform[5]

    // Check vertical gap
    if (Math.abs(y - lastY) > 10 && currentParagraph.length > 0) {
      paragraphs.push(currentParagraph.join(' '))
      currentParagraph = []
    }

    if (item.str.trim()) {
      currentParagraph.push(item.str)
    }
    lastY = y
  }

  if (currentParagraph.length > 0) {
    paragraphs.push(currentParagraph.join(' '))
  }

  return paragraphs.length > 0 ? paragraphs : lines
}
```

**Step 2: Commit**

```bash
git add src/js/tools/pdf-to-word.js
git commit -m "feat: add text extraction from PDF pages

Groups text items into lines and paragraphs based on positioning.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 9: Implement Image Extraction from PDF

**Files:**
- Modify: `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/pdf-to-word.js`

**Step 1: Add image extraction helper function**

After extractTextFromPage function, add:

```javascript
async function extractImagesFromPage(page, pageNumber) {
  const images = []

  try {
    const operatorList = await page.getOperatorList()
    const imageOps = []

    // Find all image operations
    for (let i = 0; i < operatorList.fnArray.length; i++) {
      const fn = operatorList.fnArray[i]
      // paintImageXObject = 85, paintInlineImageXObject = 86
      if (fn === 85 || fn === 86) {
        imageOps.push(i)
      }
    }

    // Extract each image
    for (const opIndex of imageOps) {
      try {
        const imageName = operatorList.argsArray[opIndex][0]

        // Wait for image to be loaded
        await new Promise((resolve) => {
          page.objs.get(imageName, (image) => {
            if (image) {
              // Create canvas to convert image
              const canvas = document.createElement('canvas')
              canvas.width = image.width
              canvas.height = image.height
              const ctx = canvas.getContext('2d')

              // Draw image data
              const imageData = ctx.createImageData(image.width, image.height)
              imageData.data.set(image.data)
              ctx.putImageData(imageData, 0, 0)

              // Convert to blob
              canvas.toBlob((blob) => {
                if (blob) {
                  images.push({
                    blob,
                    width: image.width,
                    height: image.height
                  })
                }
                resolve()
              }, 'image/png')
            } else {
              resolve()
            }
          })
        })
      } catch (imgError) {
        console.warn(`Failed to extract image ${opIndex} from page ${pageNumber}:`, imgError)
      }
    }
  } catch (error) {
    console.warn(`Failed to get operator list for page ${pageNumber}:`, error)
  }

  return images
}
```

**Step 2: Commit**

```bash
git add src/js/tools/pdf-to-word.js
git commit -m "feat: add image extraction from PDF pages

Extracts images using PDF.js operator list and converts to PNG blobs.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 10: Implement Word Document Generation

**Files:**
- Modify: `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/pdf-to-word.js`

**Step 1: Add document builder function**

After extractImagesFromPage function, add:

```javascript
async function buildWordDocument(pagesData) {
  const sections = []

  for (const pageData of pagesData) {
    const pageElements = []

    // Add page heading
    pageElements.push(
      new Paragraph({
        text: `Page ${pageData.pageNumber}`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 }
      })
    )

    // Add text paragraphs
    for (const text of pageData.paragraphs) {
      if (text.trim()) {
        pageElements.push(
          new Paragraph({
            children: [new TextRun(text)],
            spacing: { after: 120 }
          })
        )
      }
    }

    // Add images
    for (const image of pageData.images) {
      try {
        const arrayBuffer = await image.blob.arrayBuffer()

        // Scale image to fit page (max 600px width)
        const maxWidth = 600
        const scale = image.width > maxWidth ? maxWidth / image.width : 1
        const width = Math.floor(image.width * scale)
        const height = Math.floor(image.height * scale)

        pageElements.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: arrayBuffer,
                transformation: {
                  width,
                  height
                }
              })
            ],
            spacing: { before: 120, after: 120 }
          })
        )
      } catch (imgError) {
        console.warn('Failed to add image to Word doc:', imgError)
      }
    }

    sections.push(...pageElements)
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: sections
    }]
  })

  return doc
}
```

**Step 2: Commit**

```bash
git add src/js/tools/pdf-to-word.js
git commit -m "feat: add Word document generation

Builds .docx with page headings, text paragraphs, and images.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 11: Implement Main PDF to Word Conversion Function

**Files:**
- Modify: `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/pdf-to-word.js`

**Step 1: Replace convertPdfToWord stub**

Replace the stub function with:

```javascript
async function convertPdfToWord(file, container, fileName) {
  if (!file) {
    showError('Please upload a PDF first', container)
    return
  }

  try {
    showLoading(container, 'Processing page 1...')

    const arrayBuffer = await readFileAsArrayBuffer(file)
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise
    const pageCount = pdf.numPages

    const pagesData = []
    let totalTextLength = 0

    // Process each page
    for (let i = 1; i <= pageCount; i++) {
      // Update progress
      const loadingEl = document.querySelector('.spinner')?.parentElement
      if (loadingEl) {
        loadingEl.querySelector('p').textContent = `Processing page ${i} of ${pageCount}...`
      }

      const page = await pdf.getPage(i)

      // Extract text
      const paragraphs = await extractTextFromPage(page)
      totalTextLength += paragraphs.join(' ').length

      // Extract images
      const images = await extractImagesFromPage(page, i)

      pagesData.push({
        pageNumber: i,
        paragraphs,
        images
      })
    }

    // Check if PDF has any text
    if (totalTextLength === 0) {
      pdf.destroy()
      hideLoading()
      showError(
        'This PDF contains no selectable text. It may be a scanned document. ' +
        'Please use the OCR tool to extract text from scanned PDFs.',
        container
      )
      return
    }

    // Generate Word document
    const loadingEl = document.querySelector('.spinner')?.parentElement
    if (loadingEl) {
      loadingEl.querySelector('p').textContent = 'Generating Word document...'
    }

    const doc = await buildWordDocument(pagesData)
    const blob = await Packer.toBlob(doc)

    // Clean up
    pdf.destroy()
    hideLoading()

    // Download
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = generateFileName(fileName, 'to-word', 'docx')
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 100)

    showSuccess(
      `PDF converted to Word successfully! ${pageCount} pages processed.`,
      container
    )

  } catch (error) {
    hideLoading()
    console.error('PDF to Word conversion error:', error)
    showError(
      'Failed to convert PDF to Word. The PDF may be corrupted or password-protected.',
      container
    )
  }
}
```

**Step 2: Commit**

```bash
git add src/js/tools/pdf-to-word.js
git commit -m "feat: implement PDF to Word conversion logic

Orchestrates text/image extraction and Word doc generation.
Validates PDF has selectable text before conversion.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 12: Create Word to PDF Tool - File Structure

**Files:**
- Create: `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/word-to-pdf.js`

**Step 1: Create file with imports**

```javascript
import mammoth from 'mammoth'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { showError, showSuccess, showLoading, hideLoading, createUploadZone } from '../utils/ui-helpers.js'
import { generateFileName } from '../utils/file-naming.js'

export function initWordToPdfTool(container) {
  let uploadedFile = null
  let uploadedFileName = ''

  const content = document.createElement('div')
  content.className = 'max-w-4xl mx-auto'

  // TODO: Add UI sections

  container.appendChild(content)
}

// Stub functions
function validateWordFile(file) {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
  const hasValidType = validTypes.includes(file.type)
  const hasValidExtension = file.name.toLowerCase().endsWith('.docx')

  return hasValidType || hasValidExtension
}

function convertWordToPdf(file, container, fileName) {
  console.log('Convert Word to PDF:', fileName)
}
```

**Step 2: Verify no syntax errors**

Run: `npm run dev`
Expected: No build errors

**Step 3: Commit**

```bash
git add src/js/tools/word-to-pdf.js
git commit -m "feat: add Word to PDF tool skeleton

Initial file structure with imports and validation helper.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 13: Add Word to PDF UI Components

**Files:**
- Modify: `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/word-to-pdf.js`

**Step 1: Add UI sections to initWordToPdfTool**

After `content.className = 'max-w-4xl mx-auto'`, add:

```javascript
  // Warning banner
  const warningBanner = document.createElement('div')
  warningBanner.className = 'bg-blue-50 border-l-4 border-blue-400 p-4 mb-6'
  warningBanner.innerHTML = `
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="ml-3">
        <h3 class="text-sm font-medium text-blue-800">Word to PDF Converter</h3>
        <div class="mt-2 text-sm text-blue-700">
          <ul class="list-disc list-inside space-y-1">
            <li>Basic formatting preserved (bold, italic, lists)</li>
            <li>Images included</li>
            <li>Complex layouts may be simplified</li>
            <li>Fonts may differ from original</li>
          </ul>
        </div>
      </div>
    </div>
  `

  // Upload zone
  const uploadSection = document.createElement('div')
  uploadSection.className = 'bg-white rounded-lg shadow-md p-8 mb-6'

  const uploadZone = createUploadZone((files) => {
    if (files.length > 1) {
      showError('Please upload only one Word file', uploadSection)
      return
    }
    handleFileUpload(files[0], uploadSection, content)
  })

  const input = uploadZone.querySelector('input[type="file"]')
  input.removeAttribute('multiple')
  input.setAttribute('accept', '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document')

  uploadSection.appendChild(uploadZone)

  // Action buttons
  const actionsSection = document.createElement('div')
  actionsSection.className = 'flex flex-col sm:flex-row gap-4 justify-center hidden'
  actionsSection.id = 'action-buttons-word-to-pdf'
  actionsSection.innerHTML = `
    <button id="convert-to-pdf-btn" class="btn-primary">
      Convert to PDF
    </button>
    <button id="clear-word-to-pdf-btn" class="btn-secondary">
      Start Over
    </button>
  `

  content.appendChild(warningBanner)
  content.appendChild(uploadSection)
  content.appendChild(actionsSection)
```

**Step 2: Add event listeners**

Before the closing brace of initWordToPdfTool:

```javascript
  // Event listeners
  const convertBtn = document.getElementById('convert-to-pdf-btn')
  const clearBtn = document.getElementById('clear-word-to-pdf-btn')

  if (convertBtn) {
    convertBtn.addEventListener('click', () => {
      convertWordToPdf(uploadedFile, content, uploadedFileName)
    })
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      uploadedFile = null
      uploadedFileName = ''
      uploadSection.querySelector('.upload-zone').classList.remove('hidden')
      uploadSection.querySelector('#file-info-word-to-pdf')?.remove()
      actionsSection.classList.add('hidden')
    })
  }

  function handleFileUpload(file, uploadSection, container) {
    // TODO: Implement
    console.log('File uploaded:', file.name)
  }
}
```

**Step 3: Commit**

```bash
git add src/js/tools/word-to-pdf.js
git commit -m "feat: add Word to PDF UI components

Adds warning banner, upload zone with .docx filter, action buttons.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 14: Implement Word to PDF File Upload Handler

**Files:**
- Modify: `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/word-to-pdf.js`

**Step 1: Replace handleFileUpload stub**

Replace the handleFileUpload function:

```javascript
  function handleFileUpload(file, uploadSection, container) {
    if (!validateWordFile(file)) {
      showError('Please upload a valid .docx file', uploadSection)
      return
    }

    uploadedFile = file
    uploadedFileName = file.name

    // Hide upload zone and show file info
    uploadSection.querySelector('.upload-zone').classList.add('hidden')

    const fileInfo = document.createElement('div')
    fileInfo.id = 'file-info-word-to-pdf'
    fileInfo.className = 'bg-gray-50 p-4 rounded'
    fileInfo.innerHTML = `
      <div class="flex items-center">
        <svg class="h-8 w-8 text-blue-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          <path d="M8 8a.5.5 0 01.5-.5h3a.5.5 0 010 1h-3A.5.5 0 018 8zm0 2a.5.5 0 01.5-.5h3a.5.5 0 010 1h-3A.5.5 0 018 10z" />
        </svg>
        <div class="flex-1">
          <p class="font-medium text-gray-900">${file.name}</p>
          <p class="text-sm text-gray-600">${(file.size / 1024).toFixed(1)} KB</p>
        </div>
      </div>
    `
    uploadSection.appendChild(fileInfo)

    // Show action buttons
    document.getElementById('action-buttons-word-to-pdf').classList.remove('hidden')
  }
```

**Step 2: Commit**

```bash
git add src/js/tools/word-to-pdf.js
git commit -m "feat: implement Word to PDF file upload handler

Validates .docx file and shows file info.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 15: Implement Word to PDF Conversion Logic

**Files:**
- Modify: `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/word-to-pdf.js`

**Step 1: Replace convertWordToPdf stub**

Replace the stub function with:

```javascript
async function convertWordToPdf(file, container, fileName) {
  if (!file) {
    showError('Please upload a Word file first', container)
    return
  }

  try {
    showLoading(container, 'Converting Word to HTML...')

    // Read file
    const arrayBuffer = await file.arrayBuffer()

    // Convert to HTML using mammoth
    const result = await mammoth.convertToHtml({ arrayBuffer })
    const html = result.value

    if (!html || html.trim().length === 0) {
      hideLoading()
      showError('Failed to extract content from Word file. The file may be empty or corrupted.', container)
      return
    }

    // Update loading message
    const loadingEl = document.querySelector('.spinner')?.parentElement
    if (loadingEl) {
      loadingEl.querySelector('p').textContent = 'Rendering to PDF...'
    }

    // Create hidden container for HTML rendering
    const tempContainer = document.createElement('div')
    tempContainer.style.position = 'absolute'
    tempContainer.style.left = '-9999px'
    tempContainer.style.width = '210mm' // A4 width
    tempContainer.style.padding = '20mm'
    tempContainer.style.background = 'white'
    tempContainer.style.fontFamily = 'Arial, sans-serif'
    tempContainer.style.fontSize = '12pt'
    tempContainer.style.lineHeight = '1.5'
    tempContainer.innerHTML = html
    document.body.appendChild(tempContainer)

    // Wait for images to load
    const images = tempContainer.querySelectorAll('img')
    await Promise.all(
      Array.from(images).map(img => {
        if (img.complete) return Promise.resolve()
        return new Promise((resolve) => {
          img.onload = resolve
          img.onerror = resolve
        })
      })
    )

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // Render HTML to canvas
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      logging: false
    })

    // Calculate dimensions
    const imgWidth = 210 // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    const pageHeight = 297 // A4 height in mm
    let heightLeft = imgHeight
    let position = 0

    // Add first page
    const imgData = canvas.toDataURL('image/png')
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Clean up
    document.body.removeChild(tempContainer)

    // Download PDF
    const pdfBlob = pdf.output('blob')
    const url = URL.createObjectURL(pdfBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = generateFileName(fileName, 'to-pdf', 'pdf')
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 100)

    hideLoading()
    showSuccess('Word document converted to PDF successfully!', container)

  } catch (error) {
    hideLoading()
    console.error('Word to PDF conversion error:', error)
    showError(
      'Failed to convert Word to PDF. The file may be corrupted or use unsupported features.',
      container
    )
  }
}
```

**Step 2: Commit**

```bash
git add src/js/tools/word-to-pdf.js
git commit -m "feat: implement Word to PDF conversion logic

Uses mammoth.js to convert .docx to HTML, then html2canvas + jsPDF
to render as PDF. Handles multi-page documents.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 16: Add Routes for New Tools in Main.js

**Files:**
- Modify: `/Users/sabuj.mondal/pdf-tools-business/src/js/main.js`

**Step 1: Read current main.js to find route registration location**

Run: Check the routes object and navigation structure

**Step 2: Add routes for new tools**

Find the routes object and add:

```javascript
'pdf-to-word': () => import('./tools/pdf-to-word.js').then(m => m.initPdfToWordTool),
'word-to-pdf': () => import('./tools/word-to-pdf.js').then(m => m.initWordToPdfTool),
```

**Step 3: Add navigation items**

Find the navigation items array and add after 'images-to-pdf':

```javascript
{ id: 'pdf-to-word', label: 'PDF to Word', icon: '📄→📝' },
{ id: 'word-to-pdf', label: 'Word to PDF', icon: '📝→📄' },
```

**Step 4: Test navigation**

Run: `npm run dev`
Action: Check that new tools appear in sidebar
Action: Click "PDF to Word" → should load tool
Action: Click "Word to PDF" → should load tool
Expected: Both tools load without errors

**Step 5: Commit**

```bash
git add src/js/main.js
git commit -m "feat: add routes for PDF↔Word conversion tools

Adds navigation and routing for pdf-to-word and word-to-pdf tools.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 17: Test PDF to Word Conversion End-to-End

**Files:**
- None (testing task)

**Step 1: Test with text-only PDF**

Action: Navigate to http://localhost:3000/#pdf-to-word
Action: Upload a text-based PDF (e.g., generated from Word)
Expected: Preview renders, convert button enabled

Action: Click "Convert to Word"
Expected: Processing indicator shows, .docx file downloads

Action: Open downloaded .docx in Word or Google Docs
Expected: Text content present, formatted as paragraphs

**Step 2: Test with PDF containing images**

Action: Upload PDF with images
Action: Convert to Word
Expected: .docx contains both text and images

**Step 3: Test with scanned PDF (no text)**

Action: Upload scanned PDF
Action: Click "Convert to Word"
Expected: Error message: "This PDF contains no selectable text..."

**Step 4: Test Start Over button**

Action: Upload PDF, then click "Start Over"
Expected: UI resets to upload zone

**Step 5: Verify filename convention**

Expected: Downloaded files follow pattern `originalname_to-word.docx`

**Step 6: Document any issues**

If bugs found: Create notes for fixes
If working: Proceed to next task

---

## Task 18: Test Word to PDF Conversion End-to-End

**Files:**
- None (testing task)

**Step 1: Test with simple Word doc**

Action: Navigate to http://localhost:3000/#word-to-pdf
Action: Upload simple .docx with text only
Expected: File info shows, convert button enabled

Action: Click "Convert to PDF"
Expected: Processing indicator shows, PDF downloads

Action: Open PDF
Expected: Text content present

**Step 2: Test with Word doc containing images**

Action: Upload .docx with images
Action: Convert to PDF
Expected: PDF contains text and images

**Step 3: Test with formatted Word doc**

Action: Upload .docx with bold, italic, lists
Action: Convert to PDF
Expected: Basic formatting somewhat preserved

**Step 4: Test with multi-page Word doc**

Action: Upload 3-5 page .docx
Action: Convert to PDF
Expected: All pages present in PDF (may not match exactly)

**Step 5: Test invalid file type**

Action: Try to upload non-.docx file
Expected: Error message: "Please upload a valid .docx file"

**Step 6: Verify filename convention**

Expected: Downloaded files follow pattern `originalname_to-pdf.pdf`

**Step 7: Document any issues**

If bugs found: Note for fixes
If working: Proceed to commit

---

## Task 19: Final Integration Test

**Files:**
- None (testing task)

**Step 1: Verify all previews working**

Action: Test each tool's preview:
- Merge: Upload PDFs → verify 80px thumbnails
- Split: Upload PDF → verify 150px preview
- Compress: Upload PDF → verify 150px preview
- Rotate: Upload PDF → verify 250px preview updates on rotation
- OCR: Upload PDF → verify 150px preview + text extraction works
- PDF-to-Images: Upload PDF → verify preview
- Images-to-PDF: Upload images → verify thumbnails

Expected: All previews render correctly

**Step 2: Verify new tools accessible**

Action: Check sidebar navigation
Expected: "PDF to Word" and "Word to PDF" visible and clickable

**Step 3: Round-trip test**

Action: Word → PDF → Word
- Start with .docx file
- Convert to PDF using Word→PDF tool
- Convert PDF back to Word using PDF→Word tool
- Compare original vs final

Expected: Content present (formatting will differ)

**Step 4: Check browser console**

Action: Open DevTools console
Expected: No PDF.js worker errors, no critical errors

**Step 5: Test on different browsers**

Action: Test on Chrome, Firefox, Safari (if available)
Expected: All tools work across browsers

**Step 6: Document final status**

Create summary: What works, what doesn't, known limitations

---

## Task 20: Final Commit and Cleanup

**Files:**
- All modified files

**Step 1: Check git status**

Run: `git status`
Expected: All changes committed

**Step 2: Review commit history**

Run: `git log --oneline -20`
Expected: Clean commit history with descriptive messages

**Step 3: Create summary document**

Optional: Update README or create CHANGELOG entry documenting new features

**Step 4: Create final commit if needed**

If any uncommitted changes:
```bash
git add .
git commit -m "chore: final cleanup for Word conversion features

All features tested and working.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

**Step 5: Done!**

Summary of completed work:
- ✅ Fixed PDF.js worker (fixes preview + OCR)
- ✅ Implemented PDF→Word with text + images
- ✅ Implemented Word→PDF with basic formatting
- ✅ Added navigation and routes
- ✅ Tested all features end-to-end

---

## Known Limitations (Document These)

### PDF to Word:
- Does NOT preserve layout/formatting
- Tables become plain text
- Columns linearized
- Font styles lost
- Works only with PDFs containing selectable text

### Word to PDF:
- Basic formatting only
- Fonts may differ
- Complex layouts simplified
- Page breaks calculated automatically

### General:
- All processing client-side (slower but free)
- Large files may be slow to process
- Some edge cases may not work perfectly

---

## Success Criteria

✅ All tool previews working (merge, split, compress, rotate, PDF-to-images, images-to-PDF)
✅ OCR extraction working
✅ PDF→Word extracts text and images
✅ Word→PDF generates valid PDFs
✅ Clear disclaimers about limitations
✅ Smart filename conventions used
✅ No console errors
✅ All tools accessible via navigation
✅ 100% client-side processing maintained
✅ $0 additional costs

---

**End of Implementation Plan**
