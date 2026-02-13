import { PDFDocument } from 'pdf-lib'
import { validatePDF, readFileAsArrayBuffer, createDownloadLink } from '../utils/file-handler.js'
import { showError, showSuccess, showLoading, hideLoading, createUploadZone } from '../utils/ui-helpers.js'
import { generateFileName } from '../utils/file-naming.js'

export function initSplitTool(container) {
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
    splitPDF(pdfDoc, mode, container, uploadedFileName)
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
      uploadedFileName = file.name
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
