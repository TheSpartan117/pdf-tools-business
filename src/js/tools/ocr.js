import * as pdfjsLib from 'pdfjs-dist'
import Tesseract from 'tesseract.js'
import { validatePDF, readFileAsArrayBuffer } from '../utils/file-handler.js'
import { showError, showSuccess, showLoading, hideLoading, createUploadZone } from '../utils/ui-helpers.js'
import { renderPreview } from '../utils/preview-renderer.js'
import { generateFileName } from '../utils/file-naming.js'

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href

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
