# PDF Tools UX Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enhance PDF tools with smart downloads, better file naming, compressed layout with sidebar ads, document previews, new converter tools (PDF↔Images, OCR), and live rotation preview.

**Architecture:** Four-phase incremental enhancement approach. Phase 1 fixes existing tools (compress logic, file naming, previews). Phase 2 redesigns landing page layout with three-column grid and sidebar ads. Phase 3 adds new tools (PDF-to-Images, Images-to-PDF, OCR). Phase 4 enhances rotate tool with live preview. All processing remains 100% client-side using pdf-lib, pdfjs-dist, tesseract.js, and jszip.

**Tech Stack:** Vite 7.3.1, Vanilla JavaScript, Tailwind CSS 3.4.19, pdf-lib 1.17.1, pdfjs-dist 5.4.624, tesseract.js 5.x, jszip 3.10.0

---

## Phase 1: Fix Existing Tools

### Task 1: Create File Naming Utility

**Files:**
- Create: `/Users/sabuj.mondal/pdf-tools-business/src/js/utils/file-naming.js`

**Step 1: Create file naming utility module**

Create `/Users/sabuj.mondal/pdf-tools-business/src/js/utils/file-naming.js`:

```javascript
/**
 * File naming utilities for PDF operations
 */

/**
 * Generate output filename based on original file and task
 * @param {string} originalName - Original filename (e.g., "document.pdf")
 * @param {string} taskSuffix - Task name (e.g., "compressed", "merged", "rotated")
 * @param {string} extension - Optional extension override (default: "pdf")
 * @returns {string} - New filename (e.g., "document_compressed.pdf")
 */
export function generateFileName(originalName, taskSuffix, extension = 'pdf') {
  // Remove extension from original name
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '')
  return `${nameWithoutExt}_${taskSuffix}.${extension}`
}
```

**Step 2: Test the utility manually**

Run: `npm run dev`
Expected: Dev server starts without errors

**Step 3: Commit**

```bash
git add src/js/utils/file-naming.js
git commit -m "feat: add file naming utility

Creates standardized filenames: originalname_taskname.extension

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Fix Compress Tool - Smart Download

**Files:**
- Modify: `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/compress.js:149-196`

**Step 1: Update compress function to check file size before download**

In `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/compress.js`, update the `compressPDF` function (lines 149-196):

```javascript
import { generateFileName } from '../utils/file-naming.js'

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

    hideLoading()

    // Only download if compression actually reduced file size
    if (compressedSize >= originalSize) {
      showError(
        `Compression didn't reduce file size. Original: ${formatFileSize(originalSize)}, ` +
        `Result: ${formatFileSize(compressedSize)}. This PDF may already be optimized. ` +
        `Try a different compression level or use an already uncompressed PDF.`,
        container
      )
      return
    }

    // File was successfully compressed
    const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1)
    const blob = new Blob([compressedBytes], { type: 'application/pdf' })

    // Use original filename with task suffix
    const filename = generateFileName(window.currentUploadedFileName || 'document.pdf', 'compressed')
    createDownloadLink(blob, filename)

    showSuccess(
      `PDF compressed successfully! Size reduced by ${reduction}% ` +
      `(${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)})`,
      container
    )

  } catch (error) {
    hideLoading()
    console.error('Compress error:', error)
    showError('Failed to compress PDF. Please try again.', container)
  }
}
```

**Step 2: Store uploaded filename for later use**

In the same file, update `handleFileUpload` function around line 98 to store the filename:

```javascript
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
    // Store filename for later use in compress function
    window.currentUploadedFileName = file.name

    const arrayBuffer = await readFileAsArrayBuffer(file)
    pdfDoc = await PDFDocument.load(arrayBuffer)
    const pageCount = pdfDoc.getPageCount()

    hideLoading()
    // ... rest of function
```

**Step 3: Test compress tool**

Run: `npm run dev`
1. Navigate to http://localhost:3000/#tool/compress
2. Upload an already-optimized PDF
3. Click "Compress PDF"
Expected: Error message shown, no download triggered
4. Upload a non-optimized PDF (if available)
Expected: Download triggers with filename format `originalname_compressed.pdf`

**Step 4: Commit**

```bash
git add src/js/tools/compress.js
git commit -m "fix: compress tool only downloads if size reduced

- Check if compressed size < original size
- Show error if no reduction achieved
- Use smart filename: originalname_compressed.pdf

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 3: Update Merge Tool File Naming

**Files:**
- Modify: `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/merge.js:117-150`

**Step 1: Import file naming utility and update merge function**

In `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/merge.js`, add import at top:

```javascript
import { PDFDocument } from 'pdf-lib'
import { validatePDF, readFileAsArrayBuffer, createDownloadLink, formatFileSize } from '../utils/file-handler.js'
import { showError, showSuccess, showLoading, hideLoading, createUploadZone } from '../utils/ui-helpers.js'
import { generateFileName } from '../utils/file-naming.js'
```

**Step 2: Update mergePDFs function**

Replace line 142 in the `mergePDFs` function:

```javascript
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
    // Use first file's name as base
    const filename = generateFileName(files[0].name, 'merged')
    createDownloadLink(blob, filename)
    showSuccess('PDFs merged successfully!', container)

  } catch (error) {
    hideLoading()
    console.error('Merge error:', error)
    showError('Failed to merge PDFs. Please try again.', container)
  }
}
```

**Step 3: Test merge tool**

Run: `npm run dev`
1. Navigate to http://localhost:3000/#tool/merge
2. Upload 2+ PDF files
3. Click "Merge PDFs"
Expected: Download with filename format `firstfilename_merged.pdf`

**Step 4: Commit**

```bash
git add src/js/tools/merge.js
git commit -m "fix: merge tool uses smart filename

Uses first file's name: firstfile_merged.pdf

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 4: Update Split Tool File Naming

**Files:**
- Modify: `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/split.js:155-208`

**Step 1: Import file naming utility**

In `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/split.js`, add import at top:

```javascript
import { PDFDocument } from 'pdf-lib'
import { validatePDF, readFileAsArrayBuffer, createDownloadLink } from '../utils/file-handler.js'
import { showError, showSuccess, showLoading, hideLoading, createUploadZone } from '../utils/ui-helpers.js'
import { generateFileName } from '../utils/file-naming.js'
```

**Step 2: Store uploaded file for naming**

Add module-level variable after line 7:

```javascript
export function initSplitTool(container) {
  let uploadedFile = null
  let pdfDoc = null
  let uploadedFileName = '' // Add this
```

Update `handleFileUpload` around line 116:

```javascript
uploadedFile = file
uploadedFileName = file.name // Add this
const arrayBuffer = await readFileAsArrayBuffer(file)
```

**Step 3: Update splitPDF function with smart naming**

Replace lines 155-208:

```javascript
async function splitPDF(pdfDoc, mode, container, uploadedFileName) {
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

        // Use original filename with page number
        const filename = generateFileName(uploadedFileName, `page-${i + 1}`)
        createDownloadLink(blob, filename)
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
      // Use original filename with 'extracted' suffix
      const filename = generateFileName(uploadedFileName, 'extracted')
      createDownloadLink(blob, filename)
      showSuccess(`Successfully extracted ${pages.length} pages!`, container)
    }

  } catch (error) {
    hideLoading()
    console.error('Split error:', error)
    showError('Failed to split PDF. Please try again.', container)
  }
}
```

**Step 4: Update splitPDF call to pass filename**

Around line 93:

```javascript
splitBtn.addEventListener('click', () => {
  const mode = document.querySelector('input[name="split-mode"]:checked').value
  splitPDF(pdfDoc, mode, container, uploadedFileName)
})
```

**Step 5: Test split tool**

Run: `npm run dev`
1. Navigate to http://localhost:3000/#tool/split
2. Upload a PDF with multiple pages
3. Test "Split all pages"
Expected: Downloads named `originalname_page-1.pdf`, `originalname_page-2.pdf`, etc.
4. Test "Extract range" with pages 1-2
Expected: Download named `originalname_extracted.pdf`

**Step 6: Commit**

```bash
git add src/js/tools/split.js
git commit -m "fix: split tool uses smart filenames

Split all: originalname_page-1.pdf, originalname_page-2.pdf
Extract range: originalname_extracted.pdf

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 5: Update Rotate Tool File Naming

**Files:**
- Modify: `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/rotate.js:194-238`

**Step 1: Import file naming utility**

In `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/rotate.js`, add import at top:

```javascript
import { PDFDocument, degrees } from 'pdf-lib'
import { validatePDF, readFileAsArrayBuffer, createDownloadLink } from '../utils/file-handler.js'
import { showError, showSuccess, showLoading, hideLoading, createUploadZone } from '../utils/ui-helpers.js'
import { generateFileName } from '../utils/file-naming.js'
```

**Step 2: Store uploaded filename**

Add module variable after line 7:

```javascript
export function initRotateTool(container) {
  let uploadedFile = null
  let pdfDoc = null
  let uploadedFileName = '' // Add this
```

Update `handleFileUpload` around line 155:

```javascript
uploadedFile = file
uploadedFileName = file.name // Add this
const arrayBuffer = await readFileAsArrayBuffer(file)
```

**Step 3: Update rotatePDF function**

Update function signature and download line (line 194 and 230):

```javascript
async function rotatePDF(pdfDoc, angle, scope, container, uploadedFileName) {
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
    // Use original filename with rotated suffix
    const filename = generateFileName(uploadedFileName, 'rotated')
    createDownloadLink(blob, filename)
    showSuccess(`PDF rotated ${angle}° successfully!`, container)

  } catch (error) {
    hideLoading()
    console.error('Rotate error:', error)
    showError('Failed to rotate PDF. Please try again.', container)
  }
}
```

**Step 4: Update rotatePDF call**

Around line 129:

```javascript
applyBtn.addEventListener('click', () => {
  if (!selectedAngle) {
    showError('Please select a rotation angle', container)
    return
  }

  const scope = document.querySelector('input[name="rotate-scope"]:checked').value
  rotatePDF(pdfDoc, selectedAngle, scope, container, uploadedFileName)
})
```

**Step 5: Test rotate tool**

Run: `npm run dev`
1. Navigate to http://localhost:3000/#tool/rotate
2. Upload a PDF
3. Select 90° rotation and click Apply
Expected: Download named `originalname_rotated.pdf`

**Step 6: Commit**

```bash
git add src/js/tools/rotate.js
git commit -m "fix: rotate tool uses smart filename

Uses format: originalname_rotated.pdf

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 6: Create Preview Renderer Utility

**Files:**
- Create: `/Users/sabuj.mondal/pdf-tools-business/src/js/utils/preview-renderer.js`

**Step 1: Create preview renderer module**

Create `/Users/sabuj.mondal/pdf-tools-business/src/js/utils/preview-renderer.js`:

```javascript
import * as pdfjsLib from 'pdfjs-dist'

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

/**
 * Render first page of PDF as thumbnail preview
 * @param {ArrayBuffer} pdfData - PDF file data
 * @param {HTMLElement} container - Container element for preview
 * @param {number} maxWidth - Maximum preview width in pixels (default: 200)
 */
export async function renderPreview(pdfData, container, maxWidth = 200) {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: pdfData })
    const pdf = await loadingTask.promise
    const page = await pdf.getPage(1) // First page

    const viewport = page.getViewport({ scale: 1.0 })
    const scale = maxWidth / viewport.width
    const scaledViewport = page.getViewport({ scale })

    const canvas = document.createElement('canvas')
    canvas.className = 'border border-gray-300 rounded shadow-sm'
    const context = canvas.getContext('2d')
    canvas.width = scaledViewport.width
    canvas.height = scaledViewport.height

    await page.render({
      canvasContext: context,
      viewport: scaledViewport
    }).promise

    container.innerHTML = ''
    container.appendChild(canvas)

  } catch (error) {
    console.error('Preview render error:', error)
    container.innerHTML = '<p class="text-sm text-gray-500">Preview unavailable</p>'
  }
}
```

**Step 2: Test that module compiles**

Run: `npm run dev`
Expected: Dev server starts without errors

**Step 3: Commit**

```bash
git add src/js/utils/preview-renderer.js
git commit -m "feat: add PDF preview renderer utility

Renders first page of PDF as thumbnail using PDF.js

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 7: Add Preview to Merge Tool

**Files:**
- Modify: `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/merge.js:58-106`

**Step 1: Import preview renderer**

In `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/merge.js`, add import:

```javascript
import { PDFDocument } from 'pdf-lib'
import { validatePDF, readFileAsArrayBuffer, createDownloadLink, formatFileSize } from '../utils/file-handler.js'
import { showError, showSuccess, showLoading, hideLoading, createUploadZone } from '../utils/ui-helpers.js'
import { generateFileName } from '../utils/file-naming.js'
import { renderPreview } from '../utils/preview-renderer.js'
```

**Step 2: Update addFileToList to include preview**

Replace the `addFileToList` function (lines 74-106):

```javascript
async function addFileToList(file, uploadedFiles, filesList) {
  const fileItem = document.createElement('div')
  fileItem.className = 'flex items-start justify-between bg-gray-50 p-4 rounded gap-3'
  fileItem.dataset.fileName = file.name

  // Preview container
  const previewContainer = document.createElement('div')
  previewContainer.className = 'flex-shrink-0'

  // File info
  const fileInfo = document.createElement('div')
  fileInfo.className = 'flex-1 min-w-0'
  fileInfo.innerHTML = `
    <div class="flex items-center">
      <svg class="h-6 w-6 text-red-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
      </svg>
      <div class="flex-1 min-w-0">
        <p class="font-medium text-gray-900 truncate">${file.name}</p>
        <p class="text-sm text-gray-500">${formatFileSize(file.size)}</p>
      </div>
    </div>
  `

  // Remove button
  const removeBtn = document.createElement('button')
  removeBtn.className = 'flex-shrink-0 text-red-600 hover:text-red-800'
  removeBtn.innerHTML = `
    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  `

  removeBtn.addEventListener('click', () => {
    const index = uploadedFiles.findIndex(f => f.name === file.name)
    if (index > -1) {
      uploadedFiles.splice(index, 1)
    }
    fileItem.remove()
    updateButtonStates(uploadedFiles)
  })

  fileItem.appendChild(previewContainer)
  fileItem.appendChild(fileInfo)
  fileItem.appendChild(removeBtn)
  filesList.appendChild(fileItem)

  // Render preview asynchronously
  try {
    const arrayBuffer = await readFileAsArrayBuffer(file)
    await renderPreview(arrayBuffer, previewContainer, 80)
  } catch (error) {
    console.error('Preview error:', error)
    previewContainer.innerHTML = '<div class="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">No preview</div>'
  }
}
```

**Step 3: Test merge tool with previews**

Run: `npm run dev`
1. Navigate to http://localhost:3000/#tool/merge
2. Upload 2+ PDF files
Expected: Each file shows a small thumbnail preview (80px wide) next to file info

**Step 4: Commit**

```bash
git add src/js/tools/merge.js
git commit -m "feat: add preview thumbnails to merge tool

Shows first page thumbnail for each uploaded PDF

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 8: Add Preview to Split Tool

**Files:**
- Modify: `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/split.js:105-152`

**Step 1: Import preview renderer**

In `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/split.js`, add import:

```javascript
import { PDFDocument } from 'pdf-lib'
import { validatePDF, readFileAsArrayBuffer, createDownloadLink } from '../utils/file-handler.js'
import { showError, showSuccess, showLoading, hideLoading, createUploadZone } from '../utils/ui-helpers.js'
import { generateFileName } from '../utils/file-naming.js'
import { renderPreview } from '../utils/preview-renderer.js'
```

**Step 2: Add preview container in handleFileUpload**

Update the `handleFileUpload` function around lines 126-140:

```javascript
// Hide upload zone and show file info
uploadSection.querySelector('.upload-zone').classList.add('hidden')

const fileInfo = document.createElement('div')
fileInfo.id = 'file-info'
fileInfo.className = 'bg-gray-50 p-4 rounded'
fileInfo.innerHTML = `
  <div class="flex items-start gap-4">
    <div id="split-preview-container" class="flex-shrink-0"></div>
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
const previewContainer = document.getElementById('split-preview-container')
await renderPreview(arrayBuffer, previewContainer, 150)

// Show options
document.getElementById('page-info').textContent = `Total pages: ${pageCount}`
```

**Step 3: Test split tool with preview**

Run: `npm run dev`
1. Navigate to http://localhost:3000/#tool/split
2. Upload a PDF
Expected: First page preview shown (150px wide) next to file info

**Step 4: Commit**

```bash
git add src/js/tools/split.js
git commit -m "feat: add preview thumbnail to split tool

Shows first page preview after PDF upload

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 9: Add Preview to Compress Tool

**Files:**
- Modify: `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/compress.js:98-146`

**Step 1: Import preview renderer**

In `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/compress.js`, add import:

```javascript
import { PDFDocument } from 'pdf-lib'
import { validatePDF, readFileAsArrayBuffer, createDownloadLink, formatFileSize } from '../utils/file-handler.js'
import { showError, showSuccess, showLoading, hideLoading, createUploadZone } from '../utils/ui-helpers.js'
import { generateFileName } from '../utils/file-naming.js'
import { renderPreview } from '../utils/preview-renderer.js'
```

**Step 2: Add preview container in handleFileUpload**

Update around lines 120-139:

```javascript
// Hide upload zone and show file info
uploadSection.querySelector('.upload-zone').classList.add('hidden')

const fileInfo = document.createElement('div')
fileInfo.id = 'file-info'
fileInfo.className = 'bg-gray-50 p-4 rounded'
fileInfo.innerHTML = `
  <div class="flex items-start gap-4">
    <div id="compress-preview-container" class="flex-shrink-0"></div>
    <div class="flex items-center flex-1">
      <svg class="h-8 w-8 text-red-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
      </svg>
      <div>
        <p class="font-medium text-gray-900">${file.name}</p>
        <p class="text-sm text-gray-600">${pageCount} pages • ${formatFileSize(originalSize)}</p>
      </div>
    </div>
  </div>
`
uploadSection.appendChild(fileInfo)

// Render preview
const previewContainer = document.getElementById('compress-preview-container')
await renderPreview(arrayBuffer, previewContainer, 150)

// Show options
document.getElementById('file-info-compress').textContent = `Original size: ${formatFileSize(originalSize)}`
```

**Step 3: Test compress tool with preview**

Run: `npm run dev`
1. Navigate to http://localhost:3000/#tool/compress
2. Upload a PDF
Expected: First page preview shown (150px wide) next to file info

**Step 4: Commit**

```bash
git add src/js/tools/compress.js
git commit -m "feat: add preview thumbnail to compress tool

Shows first page preview after PDF upload

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 10: Add Preview to Rotate Tool

**Files:**
- Modify: `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/rotate.js:144-191`

**Step 1: Import preview renderer**

In `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/rotate.js`, add import:

```javascript
import { PDFDocument, degrees } from 'pdf-lib'
import { validatePDF, readFileAsArrayBuffer, createDownloadLink } from '../utils/file-handler.js'
import { showError, showSuccess, showLoading, hideLoading, createUploadZone } from '../utils/ui-helpers.js'
import { generateFileName } from '../utils/file-naming.js'
import { renderPreview } from '../utils/preview-renderer.js'
```

**Step 2: Add preview container and store array buffer**

Add module variable after line 8:

```javascript
export function initRotateTool(container) {
  let uploadedFile = null
  let pdfDoc = null
  let uploadedFileName = ''
  let originalArrayBuffer = null // Add this for preview re-rendering
```

Update `handleFileUpload` around lines 162-184:

```javascript
uploadedFile = file
uploadedFileName = file.name
const arrayBuffer = await readFileAsArrayBuffer(file)
originalArrayBuffer = arrayBuffer // Store for preview updates
pdfDoc = await PDFDocument.load(arrayBuffer)
const pageCount = pdfDoc.getPageCount()

hideLoading()

// Hide upload zone and show file info
uploadSection.querySelector('.upload-zone').classList.add('hidden')

const fileInfo = document.createElement('div')
fileInfo.id = 'file-info'
fileInfo.className = 'bg-gray-50 p-4 rounded'
fileInfo.innerHTML = `
  <div class="flex items-start gap-4">
    <div id="rotate-preview-container" class="flex-shrink-0"></div>
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

// Render initial preview
const previewContainer = document.getElementById('rotate-preview-container')
await renderPreview(arrayBuffer, previewContainer, 150)

// Show options
document.getElementById('file-info-rotate').textContent = `Total pages: ${pageCount}`
```

**Step 3: Test rotate tool with preview**

Run: `npm run dev`
1. Navigate to http://localhost:3000/#tool/rotate
2. Upload a PDF
Expected: First page preview shown (150px wide) next to file info

**Step 4: Commit**

```bash
git add src/js/tools/rotate.js
git commit -m "feat: add preview thumbnail to rotate tool

Shows first page preview after PDF upload
Stores array buffer for future live rotation preview

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Phase 2: Layout Redesign

### Task 11: Compress Hero Section

**Files:**
- Modify: `/Users/sabuj.mondal/pdf-tools-business/src/js/components/hero.js:1-32`

**Step 1: Update hero component with reduced spacing**

Replace entire content of `/Users/sabuj.mondal/pdf-tools-business/src/js/components/hero.js`:

```javascript
export function createHero() {
  const hero = document.createElement('section')
  hero.className = 'bg-gradient-to-br from-blue-50 to-indigo-100 py-8'
  hero.innerHTML = `
    <div class="container mx-auto px-4 text-center">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
        Free PDF Tools
      </h1>
      <p class="text-lg md:text-xl text-gray-700 mb-2">
        Process PDFs Securely in Your Browser
      </p>
      <p class="text-base text-gray-600 mb-4 max-w-2xl mx-auto">
        Merge, split, compress, and convert PDFs with complete privacy.
        Your files never leave your device.
      </p>
      <div class="flex items-center justify-center gap-3 text-green-700">
        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span class="font-semibold">100% Private & Secure</span>
      </div>
    </div>
  `

  return hero
}
```

**Step 2: Test compressed hero**

Run: `npm run dev`
1. Navigate to http://localhost:3000/
Expected: Hero section is more compact with less vertical space

**Step 3: Commit**

```bash
git add src/js/components/hero.js
git commit -m "refactor: compress hero section spacing

Reduce padding from py-20 to py-8
Reduce heading sizes and margins
Remove redundant Get Started button

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 12: Compress Features Grid Section

**Files:**
- Modify: `/Users/sabuj.mondal/pdf-tools-business/src/js/components/features-grid.js:1-59`

**Step 1: Update features grid with reduced spacing**

Replace lines 1-28 in `/Users/sabuj.mondal/pdf-tools-business/src/js/components/features-grid.js`:

```javascript
import { TOOLS } from '../config/tools.js'
import { navigateTo } from '../router.js'

export function createFeaturesGrid() {
  const section = document.createElement('section')
  section.id = 'features'
  section.className = 'py-4'

  const header = document.createElement('div')
  header.className = 'text-center mb-6'
  header.innerHTML = `
    <h2 class="text-3xl font-bold text-gray-900 mb-2">All Tools</h2>
    <p class="text-lg text-gray-600">Choose a tool to get started</p>
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

// ... rest stays the same
```

**Step 2: Test compressed features grid**

Run: `npm run dev`
1. Navigate to http://localhost:3000/
Expected: Tools grid has less padding, positioned closer to hero section

**Step 3: Commit**

```bash
git add src/js/components/features-grid.js
git commit -m "refactor: compress features grid spacing

Reduce section padding from py-16 to py-4
Reduce header margin from mb-12 to mb-6
Reduce heading size from text-4xl to text-3xl

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 13: Create Sidebar Ad Component

**Files:**
- Modify: `/Users/sabuj.mondal/pdf-tools-business/src/js/components/ad-units.js:1-50`

**Step 1: Add createSidebarAd function**

Add to `/Users/sabuj.mondal/pdf-tools-business/src/js/components/ad-units.js` (after existing functions):

```javascript
// ... existing code ...

export function createSidebarAd(position) {
  const ad = document.createElement('div')
  ad.className = 'bg-gray-100 rounded-lg p-4 text-center'
  ad.innerHTML = `
    <div class="text-gray-500 text-sm mb-2">Advertisement</div>
    <div class="bg-white border-2 border-dashed border-gray-300 rounded h-[600px] flex items-center justify-center">
      <div class="text-gray-400">
        <p class="font-medium">300x600</p>
        <p class="text-xs">${position} sidebar ad</p>
        <p class="text-xs mt-2">Google AdSense</p>
      </div>
    </div>
  `
  return ad
}
```

**Step 2: Test that module compiles**

Run: `npm run dev`
Expected: No errors, dev server continues running

**Step 3: Commit**

```bash
git add src/js/components/ad-units.js
git commit -m "feat: add sidebar ad component

Creates 300x600 sidebar ad placeholder for AdSense

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 14: Implement Three-Column Layout

**Files:**
- Modify: `/Users/sabuj.mondal/pdf-tools-business/src/js/main.js:32-41`

**Step 1: Import sidebar ad component**

In `/Users/sabuj.mondal/pdf-tools-business/src/js/main.js`, update imports:

```javascript
import { createHeader } from './components/header.js'
import { createHero } from './components/hero.js'
import { createFeaturesGrid } from './components/features-grid.js'
import { createFooter } from './components/footer.js'
import { createToolPage } from './components/tool-page.js'
import { createPrivacyPage } from './pages/privacy.js'
import { createTermsPage } from './pages/terms.js'
import { initRouter } from './router.js'
import { TOOLS } from './config/tools.js'
import { createTopBannerAd, initAds, createSidebarAd } from './components/ad-units.js'
```

**Step 2: Update showHomePage function**

Replace the `showHomePage` function (lines 32-41):

```javascript
function showHomePage() {
  const app = document.getElementById('app')
  app.innerHTML = ''

  // Header (full width)
  app.appendChild(createHeader())

  // Hero (full width)
  app.appendChild(createHero())

  // Three-column grid container
  const gridContainer = document.createElement('div')
  gridContainer.className = 'container mx-auto px-4'

  const threeColGrid = document.createElement('div')
  threeColGrid.className = 'grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-6 items-start'

  // Left sidebar ad (desktop only)
  const leftAd = createSidebarAd('left')
  leftAd.className = 'hidden lg:block sticky top-4'

  // Center content (tools)
  const centerContent = document.createElement('div')
  centerContent.appendChild(createFeaturesGrid())

  // Right sidebar ad (desktop only)
  const rightAd = createSidebarAd('right')
  rightAd.className = 'hidden lg:block sticky top-4'

  threeColGrid.appendChild(leftAd)
  threeColGrid.appendChild(centerContent)
  threeColGrid.appendChild(rightAd)

  gridContainer.appendChild(threeColGrid)
  app.appendChild(gridContainer)

  // Footer (full width)
  app.appendChild(createFooter())
}
```

**Step 3: Test three-column layout**

Run: `npm run dev`
1. Navigate to http://localhost:3000/
2. On desktop (wide screen): Expected three columns with ads on sides
3. Resize window to tablet/mobile size: Expected single column, ads hidden
4. Scroll down: Expected sidebar ads stay in view (sticky)

**Step 4: Commit**

```bash
git add src/js/main.js
git commit -m "feat: implement three-column layout with sidebar ads

Desktop: Left ad (300px) | Tools (flex) | Right ad (300px)
Mobile: Single column, ads hidden
Sticky positioning for ads on scroll

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Phase 3: New Tools

### Task 15: Add New Dependencies

**Files:**
- Modify: `/Users/sabuj.mondal/pdf-tools-business/package.json:25-28`

**Step 1: Add tesseract.js and jszip dependencies**

In `/Users/sabuj.mondal/pdf-tools-business/package.json`, update dependencies section:

```json
{
  "dependencies": {
    "jszip": "^3.10.0",
    "pdf-lib": "^1.17.1",
    "pdfjs-dist": "^5.4.624",
    "tesseract.js": "^5.0.0"
  }
}
```

**Step 2: Install new dependencies**

Run: `npm install`
Expected: Dependencies installed successfully

**Step 3: Verify installation**

Run: `npm list jszip tesseract.js`
Expected: Shows installed versions

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add jszip and tesseract.js

jszip for batch image downloads
tesseract.js for client-side OCR

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 16: Update Tools Configuration

**Files:**
- Modify: `/Users/sabuj.mondal/pdf-tools-business/src/js/config/tools.js:1-65`

**Step 1: Add OCR tool to configuration**

Update `/Users/sabuj.mondal/pdf-tools-business/src/js/config/tools.js`:

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
    id: 'ocr',
    name: 'Extract Text (OCR)',
    description: 'Extract text from scanned PDFs',
    icon: `<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m-7 5a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M9 5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
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

**Step 2: Test configuration update**

Run: `npm run dev`
Expected: Landing page shows 8 tools including new OCR tool

**Step 3: Commit**

```bash
git add src/js/config/tools.js
git commit -m "config: add OCR tool to tools configuration

Adds Extract Text (OCR) tool for text extraction from PDFs

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 17: Implement PDF-to-Images Tool

**Files:**
- Create: `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/pdf-to-images.js`

**Step 1: Create PDF-to-Images tool module**

Create `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/pdf-to-images.js`:

```javascript
import * as pdfjsLib from 'pdfjs-dist'
import JSZip from 'jszip'
import { validatePDF, readFileAsArrayBuffer, formatFileSize } from '../utils/file-handler.js'
import { showError, showSuccess, showLoading, hideLoading, createUploadZone } from '../utils/ui-helpers.js'
import { renderPreview } from '../utils/preview-renderer.js'
import { generateFileName } from '../utils/file-naming.js'

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export function initPdfToImagesTool(container) {
  let uploadedFile = null
  let pdfDoc = null
  let uploadedFileName = ''

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

  const input = uploadZone.querySelector('input[type="file"]')
  input.removeAttribute('multiple')

  uploadSection.appendChild(uploadZone)

  // Conversion options
  const optionsSection = document.createElement('div')
  optionsSection.id = 'convert-options'
  optionsSection.className = 'bg-white rounded-lg shadow-md p-8 mb-6 hidden'
  optionsSection.innerHTML = `
    <h3 class="text-xl font-semibold mb-4">Conversion Options</h3>
    <div class="space-y-6">
      <div>
        <h4 class="font-medium mb-2">Output Format</h4>
        <div class="flex gap-4">
          <label class="flex items-center">
            <input type="radio" name="image-format" value="jpeg" checked class="mr-2">
            <span>JPG (Recommended)</span>
          </label>
          <label class="flex items-center">
            <input type="radio" name="image-format" value="png" class="mr-2">
            <span>PNG</span>
          </label>
        </div>
      </div>
      <div>
        <h4 class="font-medium mb-2">Pages to Convert</h4>
        <div class="space-y-2">
          <label class="flex items-center">
            <input type="radio" name="page-scope" value="all" checked class="mr-2">
            <span>All pages</span>
          </label>
          <label class="flex items-center">
            <input type="radio" name="page-scope" value="range" class="mr-2">
            <span>Specific pages</span>
          </label>
          <div id="page-range-input" class="ml-6 mt-2 hidden">
            <label class="block text-sm text-gray-600 mb-1">Pages (e.g., 1-3, 5, 7)</label>
            <input type="text" id="page-range-text" class="border border-gray-300 rounded px-3 py-2 w-full" placeholder="1-3">
          </div>
        </div>
      </div>
    </div>
    <div id="file-info-convert" class="mt-4 p-3 bg-blue-50 rounded text-blue-700"></div>
  `

  // Action buttons
  const actionsSection = document.createElement('div')
  actionsSection.className = 'flex flex-col sm:flex-row gap-4 justify-center hidden'
  actionsSection.id = 'action-buttons'
  actionsSection.innerHTML = `
    <button id="convert-btn" class="btn-primary">
      Convert to Images
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
  const rangeInput = document.getElementById('page-range-input')

  rangeRadio.addEventListener('change', () => {
    rangeInput.classList.remove('hidden')
  })

  allRadio.addEventListener('change', () => {
    rangeInput.classList.add('hidden')
  })

  const convertBtn = document.getElementById('convert-btn')
  const clearBtn = document.getElementById('clear-btn')

  convertBtn.addEventListener('click', async () => {
    const format = document.querySelector('input[name="image-format"]:checked').value
    const scope = document.querySelector('input[name="page-scope"]:checked').value
    await convertPdfToImages(uploadedFile, format, scope, container, uploadedFileName)
  })

  clearBtn.addEventListener('click', () => {
    uploadedFile = null
    pdfDoc = null
    uploadedFileName = ''
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
      uploadedFileName = file.name
      const arrayBuffer = await readFileAsArrayBuffer(file)
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      pdfDoc = await loadingTask.promise
      const pageCount = pdfDoc.numPages

      hideLoading()

      uploadSection.querySelector('.upload-zone').classList.add('hidden')

      const fileInfo = document.createElement('div')
      fileInfo.id = 'file-info'
      fileInfo.className = 'bg-gray-50 p-4 rounded'
      fileInfo.innerHTML = `
        <div class="flex items-start gap-4">
          <div id="pdf-to-images-preview" class="flex-shrink-0"></div>
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

      const previewContainer = document.getElementById('pdf-to-images-preview')
      await renderPreview(arrayBuffer, previewContainer, 150)

      document.getElementById('file-info-convert').textContent = `Total pages: ${pageCount}`
      optionsSection.classList.remove('hidden')
      actionsSection.classList.remove('hidden')

    } catch (error) {
      hideLoading()
      console.error('Load error:', error)
      showError('Failed to load PDF. Please try another file.', uploadSection)
    }
  }
}

async function convertPdfToImages(file, format, scope, container, uploadedFileName) {
  if (!file) {
    showError('Please upload a PDF first', container)
    return
  }

  try {
    const arrayBuffer = await readFileAsArrayBuffer(file)
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise
    const pageCount = pdf.numPages

    let pagesToConvert = []

    if (scope === 'all') {
      pagesToConvert = Array.from({ length: pageCount }, (_, i) => i + 1)
    } else {
      const rangeInput = document.getElementById('page-range-text').value
      const parsedPages = parsePageRange(rangeInput, pageCount)

      if (parsedPages.length === 0) {
        showError('Invalid page range. Use format like: 1-3, 5, 7', container)
        return
      }

      pagesToConvert = parsedPages.map(i => i + 1)
    }

    showLoading(container, `Converting page 1 of ${pagesToConvert.length}...`)

    const zip = new JSZip()
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
    const extension = format === 'png' ? 'png' : 'jpg'

    for (let i = 0; i < pagesToConvert.length; i++) {
      const pageNum = pagesToConvert[i]

      // Update progress
      const loadingEl = document.querySelector('.spinner')?.parentElement
      if (loadingEl) {
        loadingEl.querySelector('p').textContent = `Converting page ${i + 1} of ${pagesToConvert.length}...`
      }

      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale: 2.0 }) // 2x for better quality

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.width = viewport.width
      canvas.height = viewport.height

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise

      // Convert canvas to blob
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, mimeType, 0.95)
      })

      // Add to ZIP with filename
      const filename = generateFileName(uploadedFileName, `page-${pageNum}`, extension)
      zip.file(filename, blob)
    }

    // Generate ZIP file
    const zipBlob = await zip.generateAsync({ type: 'blob' })

    // Download ZIP
    const url = URL.createObjectURL(zipBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = generateFileName(uploadedFileName, 'images', 'zip')
    link.click()

    setTimeout(() => URL.revokeObjectURL(url), 100)

    hideLoading()
    showSuccess(`Successfully converted ${pagesToConvert.length} pages to ${format.toUpperCase()} images!`, container)

  } catch (error) {
    hideLoading()
    console.error('Conversion error:', error)
    showError('Failed to convert PDF to images. Please try again.', container)
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

**Step 2: Add routing for PDF-to-Images tool**

In `/Users/sabuj.mondal/pdf-tools-business/src/js/main.js`, add case in switch statement around line 80:

```javascript
case 'pdf-to-images':
  import('./tools/pdf-to-images.js').then(module => {
    module.initPdfToImagesTool(contentContainer)
  })
  break
```

**Step 3: Test PDF-to-Images tool**

Run: `npm run dev`
1. Navigate to http://localhost:3000/#tool/pdf-to-images
2. Upload a multi-page PDF
3. Select JPG format, all pages
4. Click "Convert to Images"
Expected: ZIP file downloads with format `filename_images.zip` containing `filename_page-1.jpg`, etc.
5. Test PNG format
6. Test page range selection

**Step 4: Commit**

```bash
git add src/js/tools/pdf-to-images.js src/js/main.js
git commit -m "feat: implement PDF-to-Images converter

- Converts PDF pages to JPG (default) or PNG
- All pages or specific page range
- Batch download as ZIP file
- Progress indicator during conversion

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 18: Implement Images-to-PDF Tool

**Files:**
- Create: `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/images-to-pdf.js`

**Step 1: Create Images-to-PDF tool module**

Create `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/images-to-pdf.js`:

```javascript
import { PDFDocument } from 'pdf-lib'
import { readFileAsArrayBuffer, createDownloadLink, formatFileSize } from '../utils/file-handler.js'
import { showError, showSuccess, showLoading, hideLoading } from '../utils/ui-helpers.js'
import { generateFileName } from '../utils/file-naming.js'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB per image

export function initImagesToPdfTool(container) {
  const uploadedImages = []

  const content = document.createElement('div')
  content.className = 'max-w-4xl mx-auto'

  // Upload zone
  const uploadSection = document.createElement('div')
  uploadSection.className = 'bg-white rounded-lg shadow-md p-8 mb-6'
  uploadSection.innerHTML = `
    <div class="upload-zone" id="image-upload-zone">
      <input type="file" id="image-file-input" accept="image/jpeg,image/jpg,image/png" multiple class="hidden" />
      <div class="text-center">
        <svg class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p class="text-lg font-medium text-gray-700 mb-2">Upload Images</p>
        <p class="text-sm text-gray-500 mb-4">JPG or PNG files</p>
        <button type="button" class="btn-primary" id="browse-images-btn">
          Browse Files
        </button>
        <p class="text-xs text-gray-400 mt-2">or drag and drop images here</p>
      </div>
    </div>
    <div id="images-list" class="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"></div>
  `

  // Options section
  const optionsSection = document.createElement('div')
  optionsSection.id = 'pdf-options'
  optionsSection.className = 'bg-white rounded-lg shadow-md p-8 mb-6 hidden'
  optionsSection.innerHTML = `
    <h3 class="text-xl font-semibold mb-4">PDF Options</h3>
    <div>
      <label class="block font-medium mb-2">Page Size</label>
      <select id="page-size" class="border border-gray-300 rounded px-3 py-2 w-full">
        <option value="auto">Auto (match image size)</option>
        <option value="a4">A4 (210 x 297 mm)</option>
        <option value="letter">Letter (8.5 x 11 in)</option>
      </select>
    </div>
    <div id="images-info" class="mt-4 p-3 bg-blue-50 rounded text-blue-700"></div>
  `

  // Action buttons
  const actionsSection = document.createElement('div')
  actionsSection.className = 'flex flex-col sm:flex-row gap-4 justify-center hidden'
  actionsSection.id = 'action-buttons'
  actionsSection.innerHTML = `
    <button id="create-pdf-btn" class="btn-primary">
      Create PDF
    </button>
    <button id="clear-images-btn" class="btn-secondary">
      Clear All
    </button>
  `

  content.appendChild(uploadSection)
  content.appendChild(optionsSection)
  content.appendChild(actionsSection)
  container.appendChild(content)

  // Event listeners
  const fileInput = document.getElementById('image-file-input')
  const browseBtn = document.getElementById('browse-images-btn')
  const uploadZone = document.getElementById('image-upload-zone')
  const imagesList = document.getElementById('images-list')

  browseBtn.addEventListener('click', () => fileInput.click())
  fileInput.addEventListener('change', (e) => handleImageUpload(e.target.files))

  // Drag and drop
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault()
    uploadZone.classList.add('dragover')
  })

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover')
  })

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault()
    uploadZone.classList.remove('dragover')
    handleImageUpload(e.dataTransfer.files)
  })

  const createPdfBtn = document.getElementById('create-pdf-btn')
  const clearImagesBtn = document.getElementById('clear-images-btn')

  createPdfBtn.addEventListener('click', () => {
    const pageSize = document.getElementById('page-size').value
    createPdfFromImages(uploadedImages, pageSize, container)
  })

  clearImagesBtn.addEventListener('click', () => {
    uploadedImages.length = 0
    imagesList.innerHTML = ''
    optionsSection.classList.add('hidden')
    actionsSection.classList.add('hidden')
    document.getElementById('images-info').textContent = ''
  })

  function handleImageUpload(files) {
    const validFiles = Array.from(files).filter(file => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        showError(`${file.name}: Only JPG and PNG images are supported`, uploadSection)
        return false
      }
      if (file.size > MAX_FILE_SIZE) {
        showError(`${file.name}: File exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`, uploadSection)
        return false
      }
      return true
    })

    validFiles.forEach(file => {
      uploadedImages.push(file)
      addImageToList(file, uploadedImages, imagesList)
    })

    if (uploadedImages.length > 0) {
      document.getElementById('images-info').textContent = `${uploadedImages.length} image(s) selected`
      optionsSection.classList.remove('hidden')
      actionsSection.classList.remove('hidden')
    }
  }

  function addImageToList(file, uploadedImages, imagesList) {
    const imageItem = document.createElement('div')
    imageItem.className = 'relative bg-gray-100 rounded overflow-hidden group'
    imageItem.dataset.fileName = file.name

    const img = document.createElement('img')
    img.className = 'w-full h-32 object-cover'
    img.src = URL.createObjectURL(file)

    const removeBtn = document.createElement('button')
    removeBtn.className = 'absolute top-2 right-2 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity'
    removeBtn.innerHTML = `
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    `

    removeBtn.addEventListener('click', () => {
      const index = uploadedImages.findIndex(f => f.name === file.name)
      if (index > -1) {
        uploadedImages.splice(index, 1)
      }
      URL.revokeObjectURL(img.src)
      imageItem.remove()

      if (uploadedImages.length === 0) {
        optionsSection.classList.add('hidden')
        actionsSection.classList.add('hidden')
      } else {
        document.getElementById('images-info').textContent = `${uploadedImages.length} image(s) selected`
      }
    })

    const fileName = document.createElement('p')
    fileName.className = 'text-xs text-gray-600 p-2 truncate'
    fileName.textContent = file.name

    imageItem.appendChild(img)
    imageItem.appendChild(removeBtn)
    imageItem.appendChild(fileName)
    imagesList.appendChild(imageItem)
  }
}

async function createPdfFromImages(images, pageSize, container) {
  if (images.length === 0) {
    showError('Please upload at least one image', container)
    return
  }

  try {
    showLoading(container, `Creating PDF from ${images.length} image(s)...`)

    const pdfDoc = await PDFDocument.create()

    for (let i = 0; i < images.length; i++) {
      const file = images[i]
      const arrayBuffer = await readFileAsArrayBuffer(file)

      let image
      if (file.type === 'image/png') {
        image = await pdfDoc.embedPng(arrayBuffer)
      } else {
        image = await pdfDoc.embedJpg(arrayBuffer)
      }

      const imgDims = image.scale(1)

      let page
      if (pageSize === 'a4') {
        // A4: 595.28 x 841.89 points
        page = pdfDoc.addPage([595.28, 841.89])
        const scale = Math.min(
          page.getWidth() / imgDims.width,
          page.getHeight() / imgDims.height
        )
        const scaledDims = image.scale(scale)
        page.drawImage(image, {
          x: (page.getWidth() - scaledDims.width) / 2,
          y: (page.getHeight() - scaledDims.height) / 2,
          width: scaledDims.width,
          height: scaledDims.height
        })
      } else if (pageSize === 'letter') {
        // Letter: 612 x 792 points
        page = pdfDoc.addPage([612, 792])
        const scale = Math.min(
          page.getWidth() / imgDims.width,
          page.getHeight() / imgDims.height
        )
        const scaledDims = image.scale(scale)
        page.drawImage(image, {
          x: (page.getWidth() - scaledDims.width) / 2,
          y: (page.getHeight() - scaledDims.height) / 2,
          width: scaledDims.width,
          height: scaledDims.height
        })
      } else {
        // Auto: match image size
        page = pdfDoc.addPage([imgDims.width, imgDims.height])
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: imgDims.width,
          height: imgDims.height
        })
      }
    }

    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })

    hideLoading()

    const filename = generateFileName(images[0].name, 'pdf', 'pdf')
    createDownloadLink(blob, filename)

    showSuccess(`Successfully created PDF from ${images.length} image(s)!`, container)

  } catch (error) {
    hideLoading()
    console.error('PDF creation error:', error)
    showError('Failed to create PDF. Please try again.', container)
  }
}
```

**Step 2: Add routing for Images-to-PDF tool**

In `/Users/sabuj.mondal/pdf-tools-business/src/js/main.js`, add case:

```javascript
case 'images-to-pdf':
  import('./tools/images-to-pdf.js').then(module => {
    module.initImagesToPdfTool(contentContainer)
  })
  break
```

**Step 3: Test Images-to-PDF tool**

Run: `npm run dev`
1. Navigate to http://localhost:3000/#tool/images-to-pdf
2. Upload 2-3 JPG/PNG images
Expected: Thumbnails shown in grid
3. Try reordering by removing and re-adding
4. Select "Auto" page size
5. Click "Create PDF"
Expected: PDF downloads with format `firstimage_pdf.pdf`
6. Test with A4 and Letter page sizes

**Step 4: Commit**

```bash
git add src/js/tools/images-to-pdf.js src/js/main.js
git commit -m "feat: implement Images-to-PDF converter

- Converts JPG/PNG images to single PDF
- Thumbnail grid with remove buttons
- Page size options: Auto, A4, Letter
- Uses first image name for output filename

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 19: Implement OCR Extract Text Tool

**Files:**
- Create: `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/ocr.js`

**Step 1: Create OCR tool module**

Create `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/ocr.js`:

```javascript
import * as pdfjsLib from 'pdfjs-dist'
import Tesseract from 'tesseract.js'
import { validatePDF, readFileAsArrayBuffer } from '../utils/file-handler.js'
import { showError, showSuccess, showLoading, hideLoading, createUploadZone } from '../utils/ui-helpers.js'
import { renderPreview } from '../utils/preview-renderer.js'
import { generateFileName } from '../utils/file-naming.js'

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export function initOcrTool(container) {
  let uploadedFile = null
  let pdfDoc = null
  let uploadedFileName = ''
  let extractedText = ''

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

  const input = uploadZone.querySelector('input[type="file"]')
  input.removeAttribute('multiple')

  uploadSection.appendChild(uploadZone)

  // OCR options
  const optionsSection = document.createElement('div')
  optionsSection.id = 'ocr-options'
  optionsSection.className = 'bg-white rounded-lg shadow-md p-8 mb-6 hidden'
  optionsSection.innerHTML = `
    <h3 class="text-xl font-semibold mb-4">OCR Options</h3>
    <div class="space-y-4">
      <div>
        <label class="block font-medium mb-2">Language</label>
        <select id="ocr-language" class="border border-gray-300 rounded px-3 py-2 w-full">
          <option value="eng">English</option>
          <option value="spa">Spanish</option>
          <option value="fra">French</option>
          <option value="deu">German</option>
          <option value="ita">Italian</option>
          <option value="por">Portuguese</option>
        </select>
      </div>
      <div>
        <h4 class="font-medium mb-2">Pages to Process</h4>
        <div class="space-y-2">
          <label class="flex items-center">
            <input type="radio" name="ocr-scope" value="all" checked class="mr-2">
            <span>All pages</span>
          </label>
          <label class="flex items-center">
            <input type="radio" name="ocr-scope" value="range" class="mr-2">
            <span>Specific pages</span>
          </label>
          <div id="ocr-page-range-input" class="ml-6 mt-2 hidden">
            <label class="block text-sm text-gray-600 mb-1">Pages (e.g., 1-3, 5)</label>
            <input type="text" id="ocr-page-range-text" class="border border-gray-300 rounded px-3 py-2 w-full" placeholder="1-3">
          </div>
        </div>
      </div>
    </div>
    <div id="ocr-info" class="mt-4 p-3 bg-blue-50 rounded text-blue-700"></div>
    <div class="mt-4 p-3 bg-yellow-50 rounded text-yellow-800 text-sm">
      <strong>Note:</strong> OCR processing may take several seconds per page. Please be patient.
    </div>
  `

  // Action buttons
  const actionsSection = document.createElement('div')
  actionsSection.className = 'flex flex-col sm:flex-row gap-4 justify-center hidden'
  actionsSection.id = 'action-buttons'
  actionsSection.innerHTML = `
    <button id="extract-btn" class="btn-primary">
      Extract Text
    </button>
    <button id="clear-btn" class="btn-secondary">
      Start Over
    </button>
  `

  // Results section
  const resultsSection = document.createElement('div')
  resultsSection.id = 'ocr-results'
  resultsSection.className = 'bg-white rounded-lg shadow-md p-8 hidden'
  resultsSection.innerHTML = `
    <h3 class="text-xl font-semibold mb-4">Extracted Text</h3>
    <textarea id="extracted-text" class="w-full h-64 border border-gray-300 rounded px-3 py-2 font-mono text-sm" placeholder="Extracted text will appear here..."></textarea>
    <div class="flex gap-4 mt-4">
      <button id="download-text-btn" class="btn-primary">
        Download as TXT
      </button>
      <button id="copy-text-btn" class="btn-secondary">
        Copy to Clipboard
      </button>
    </div>
  `

  content.appendChild(uploadSection)
  content.appendChild(optionsSection)
  content.appendChild(actionsSection)
  content.appendChild(resultsSection)
  container.appendChild(content)

  // Event listeners
  const rangeRadio = optionsSection.querySelector('input[value="range"]')
  const allRadio = optionsSection.querySelector('input[value="all"]')
  const rangeInput = document.getElementById('ocr-page-range-input')

  rangeRadio.addEventListener('change', () => {
    rangeInput.classList.remove('hidden')
  })

  allRadio.addEventListener('change', () => {
    rangeInput.classList.add('hidden')
  })

  const extractBtn = document.getElementById('extract-btn')
  const clearBtn = document.getElementById('clear-btn')

  extractBtn.addEventListener('click', async () => {
    const language = document.getElementById('ocr-language').value
    const scope = document.querySelector('input[name="ocr-scope"]:checked').value
    await extractTextFromPdf(uploadedFile, language, scope, container, uploadedFileName)
  })

  clearBtn.addEventListener('click', () => {
    uploadedFile = null
    pdfDoc = null
    uploadedFileName = ''
    extractedText = ''
    uploadSection.querySelector('.upload-zone').classList.remove('hidden')
    uploadSection.querySelector('#file-info')?.remove()
    optionsSection.classList.add('hidden')
    actionsSection.classList.add('hidden')
    resultsSection.classList.add('hidden')
    document.getElementById('extracted-text').value = ''
  })

  const downloadTextBtn = document.getElementById('download-text-btn')
  const copyTextBtn = document.getElementById('copy-text-btn')

  downloadTextBtn.addEventListener('click', () => {
    const text = document.getElementById('extracted-text').value
    if (!text) {
      showError('No text to download', container)
      return
    }

    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = generateFileName(uploadedFileName, 'extracted', 'txt')
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 100)

    showSuccess('Text file downloaded!', container)
  })

  copyTextBtn.addEventListener('click', async () => {
    const text = document.getElementById('extracted-text').value
    if (!text) {
      showError('No text to copy', container)
      return
    }

    try {
      await navigator.clipboard.writeText(text)
      showSuccess('Text copied to clipboard!', container)
    } catch (error) {
      showError('Failed to copy text. Please select and copy manually.', container)
    }
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
      uploadedFileName = file.name
      const arrayBuffer = await readFileAsArrayBuffer(file)
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      pdfDoc = await loadingTask.promise
      const pageCount = pdfDoc.numPages

      hideLoading()

      uploadSection.querySelector('.upload-zone').classList.add('hidden')

      const fileInfo = document.createElement('div')
      fileInfo.id = 'file-info'
      fileInfo.className = 'bg-gray-50 p-4 rounded'
      fileInfo.innerHTML = `
        <div class="flex items-start gap-4">
          <div id="ocr-preview" class="flex-shrink-0"></div>
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

      const previewContainer = document.getElementById('ocr-preview')
      await renderPreview(arrayBuffer, previewContainer, 150)

      document.getElementById('ocr-info').textContent = `Total pages: ${pageCount}`
      optionsSection.classList.remove('hidden')
      actionsSection.classList.remove('hidden')

    } catch (error) {
      hideLoading()
      console.error('Load error:', error)
      showError('Failed to load PDF. Please try another file.', uploadSection)
    }
  }
}

async function extractTextFromPdf(file, language, scope, container, uploadedFileName) {
  if (!file) {
    showError('Please upload a PDF first', container)
    return
  }

  try {
    const arrayBuffer = await readFileAsArrayBuffer(file)
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise
    const pageCount = pdf.numPages

    let pagesToProcess = []

    if (scope === 'all') {
      pagesToProcess = Array.from({ length: pageCount }, (_, i) => i + 1)
    } else {
      const rangeInput = document.getElementById('ocr-page-range-text').value
      const parsedPages = parsePageRange(rangeInput, pageCount)

      if (parsedPages.length === 0) {
        showError('Invalid page range. Use format like: 1-3, 5', container)
        return
      }

      pagesToProcess = parsedPages.map(i => i + 1)
    }

    showLoading(container, `Processing page 1 of ${pagesToProcess.length}...`)

    let fullText = ''

    for (let i = 0; i < pagesToProcess.length; i++) {
      const pageNum = pagesToProcess[i]

      // Update progress
      const loadingEl = document.querySelector('.spinner')?.parentElement
      if (loadingEl) {
        loadingEl.querySelector('p').textContent = `Processing page ${i + 1} of ${pagesToProcess.length}...`
      }

      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale: 2.0 }) // High resolution for OCR

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.width = viewport.width
      canvas.height = viewport.height

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise

      // Run OCR on canvas
      const { data: { text } } = await Tesseract.recognize(
        canvas,
        language,
        {
          logger: info => {
            if (info.status === 'recognizing text') {
              const progress = Math.round(info.progress * 100)
              if (loadingEl) {
                loadingEl.querySelector('p').textContent =
                  `Processing page ${i + 1} of ${pagesToProcess.length}... ${progress}%`
              }
            }
          }
        }
      )

      fullText += `--- Page ${pageNum} ---\n\n${text}\n\n`
    }

    hideLoading()

    // Show results
    document.getElementById('extracted-text').value = fullText
    document.getElementById('ocr-results').classList.remove('hidden')

    showSuccess(`Successfully extracted text from ${pagesToProcess.length} page(s)!`, container)

  } catch (error) {
    hideLoading()
    console.error('OCR error:', error)
    showError('Failed to extract text. Please try again.', container)
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

**Step 2: Add routing for OCR tool**

In `/Users/sabuj.mondal/pdf-tools-business/src/js/main.js`, add case:

```javascript
case 'ocr':
  import('./tools/ocr.js').then(module => {
    module.initOcrTool(contentContainer)
  })
  break
```

**Step 3: Test OCR tool**

Run: `npm run dev`
1. Navigate to http://localhost:3000/#tool/ocr
2. Upload a PDF (preferably with text or scanned document)
3. Select language: English
4. Select "All pages"
5. Click "Extract Text"
Expected: Progress indicator shows OCR processing, extracted text appears in textarea
6. Test "Download as TXT" button
Expected: Downloads as `filename_extracted.txt`
7. Test "Copy to Clipboard" button
Expected: Text copied successfully

**Step 4: Commit**

```bash
git add src/js/tools/ocr.js src/js/main.js
git commit -m "feat: implement OCR Extract Text tool

- Client-side OCR using Tesseract.js
- Multi-language support (English, Spanish, French, etc.)
- All pages or specific page range
- Editable textarea with download/copy options
- Progress indicator during OCR processing

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Phase 4: Live Preview Enhancement

### Task 20: Add Live Rotation Preview to Rotate Tool

**Files:**
- Modify: `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/rotate.js:92-105, 144-191`

**Step 1: Create rotation preview update function**

In `/Users/sabuj.mondal/pdf-tools-business/src/js/tools/rotate.js`, add new function after imports:

```javascript
import * as pdfjsLib from 'pdfjs-dist'

// Configure PDF.js worker for rotation preview
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

async function updateRotationPreview(pdfData, angle, container) {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: pdfData })
    const pdf = await loadingTask.promise
    const page = await pdf.getPage(1)

    // Calculate viewport with rotation
    const viewport = page.getViewport({ scale: 1.0, rotation: angle })
    const scale = 250 / Math.max(viewport.width, viewport.height)
    const scaledViewport = page.getViewport({ scale, rotation: angle })

    const canvas = document.createElement('canvas')
    canvas.className = 'border border-gray-300 rounded shadow-sm transition-all duration-300'
    const context = canvas.getContext('2d')
    canvas.width = scaledViewport.width
    canvas.height = scaledViewport.height

    await page.render({
      canvasContext: context,
      viewport: scaledViewport
    }).promise

    container.innerHTML = ''
    container.appendChild(canvas)

  } catch (error) {
    console.error('Preview error:', error)
  }
}
```

**Step 2: Update rotation button event listeners**

Replace the rotation button event listeners (around lines 94-105):

```javascript
rotateButtons.forEach(btn => {
  btn.addEventListener('click', async () => {
    rotateButtons.forEach(b => b.classList.remove('bg-blue-600', 'text-white'))
    btn.classList.add('bg-blue-600', 'text-white')
    selectedAngle = parseInt(btn.dataset.angle)

    // Update preview with rotation in real-time
    const previewContainer = document.getElementById('rotate-preview-container')
    if (previewContainer && originalArrayBuffer) {
      await updateRotationPreview(originalArrayBuffer, selectedAngle, previewContainer)
    }

    document.getElementById('selected-rotation').textContent = `Selected: ${selectedAngle}° rotation`
    document.getElementById('selected-rotation').classList.remove('hidden')
    document.getElementById('apply-btn').disabled = false
  })
})
```

**Step 3: Update handleFileUpload to use larger preview**

Update the preview rendering in handleFileUpload (around line 184):

```javascript
// Render initial preview at 0° rotation
const previewContainer = document.getElementById('rotate-preview-container')
await updateRotationPreview(originalArrayBuffer, 0, previewContainer)
```

**Step 4: Test live rotation preview**

Run: `npm run dev`
1. Navigate to http://localhost:3000/#tool/rotate
2. Upload a PDF
Expected: Preview shows first page at normal orientation (250px)
3. Click 90° button
Expected: Preview immediately rotates to 90° (landscape)
4. Click 180° button
Expected: Preview immediately rotates to 180° (upside down)
5. Click 270° button
Expected: Preview immediately rotates to 270° (landscape, opposite direction)
6. Verify smooth transition animation

**Step 5: Commit**

```bash
git add src/js/tools/rotate.js
git commit -m "feat: add live rotation preview to rotate tool

- Preview updates instantly when rotation angle selected
- Larger preview size (250px) for better visibility
- Smooth CSS transitions between rotations
- Uses PDF.js viewport rotation for accurate preview

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Final Testing & Verification

### Task 21: Complete End-to-End Testing

**No files modified - testing only**

**Step 1: Test all existing tools with improvements**

Run: `npm run dev`

Test Merge:
1. Upload 2 PDFs
2. Verify preview thumbnails appear
3. Merge and verify filename: `firstfile_merged.pdf`

Test Split:
1. Upload multi-page PDF
2. Verify preview appears
3. Split all pages, verify filenames: `file_page-1.pdf`, `file_page-2.pdf`
4. Test range extraction, verify: `file_extracted.pdf`

Test Compress:
1. Upload already-optimized PDF
2. Compress and verify error shown (no download)
3. Upload unoptimized PDF (if available)
4. Verify filename: `file_compressed.pdf`

Test Rotate:
1. Upload PDF
2. Click each rotation angle (90°, 180°, 270°)
3. Verify preview updates immediately
4. Apply rotation, verify filename: `file_rotated.pdf`

**Step 2: Test new tools**

Test PDF-to-Images:
1. Upload multi-page PDF
2. Select JPG format
3. Convert all pages
4. Verify ZIP download: `file_images.zip`
5. Extract and verify JPG files inside
6. Test PNG format
7. Test page range selection

Test Images-to-PDF:
1. Upload 3 images (mix of JPG and PNG)
2. Verify thumbnails appear
3. Remove one image
4. Create PDF with Auto page size
5. Verify filename: `firstimage_pdf.pdf`
6. Test with A4 and Letter page sizes

Test OCR:
1. Upload text PDF (or scanned document if available)
2. Extract text from all pages
3. Verify text appears in textarea
4. Download as TXT: `file_extracted.txt`
5. Test copy to clipboard
6. Test specific page range

**Step 3: Test layout and responsiveness**

1. View landing page on desktop (wide screen)
   - Verify three columns: left ad | tools | right ad
   - Verify ads are sticky on scroll
   - Verify compact spacing (no scrolling needed on 1080p)

2. Resize to tablet width
   - Verify tools stay centered
   - Verify ads are hidden

3. Resize to mobile width
   - Verify single column layout
   - Verify tools are full-width
   - Verify ads are hidden

**Step 4: Performance check**

1. Build production version: `npm run build`
2. Preview: `npm run preview`
3. Check build output for errors
4. Test loading speed on all pages

**Step 5: Document any issues found**

If any issues found during testing, document them and create fix tasks.

Expected: All features working as designed, no console errors, responsive layout functions correctly.

---

## Execution Choice

Plan complete and saved to `docs/plans/2026-02-13-ux-improvements-implementation.md`.

Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
