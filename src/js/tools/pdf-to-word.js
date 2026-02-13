import * as pdfjsLib from 'pdfjs-dist'
import { validatePDF, readFileAsArrayBuffer } from '../utils/file-handler.js'
import { showError, showSuccess, showLoading, hideLoading, createUploadZone } from '../utils/ui-helpers.js'
import { renderPreview } from '../utils/preview-renderer.js'

// Backend API URL
const API_URL = 'https://pdf-tools-api-0m15.onrender.com'

// Configure PDF.js worker (for preview only)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href

export function initPdfToWordTool(container) {
  let uploadedFile = null
  let uploadedFileName = ''

  const content = document.createElement('div')
  content.className = 'max-w-4xl mx-auto'

  // Info banner
  const infoBanner = document.createElement('div')
  infoBanner.className = 'bg-blue-50 border-l-4 border-blue-400 p-4 mb-6'
  infoBanner.innerHTML = `
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
        </svg>
      </div>
      <div class="ml-3">
        <h3 class="text-sm font-medium text-blue-800">Professional PDF to Word Conversion</h3>
        <div class="mt-2 text-sm text-blue-700">
          <ul class="list-disc list-inside space-y-1">
            <li><strong>85-95% formatting accuracy</strong> - Professional quality</li>
            <li>Preserves paragraphs, headings, and text formatting (bold, italic)</li>
            <li>Detects and formats bullet points and numbered lists</li>
            <li>Includes images in the correct position</li>
            <li>Best results with digital PDFs containing selectable text</li>
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
    if (!files || files.length === 0) {
      showError('No file selected', uploadSection)
      return
    }

    if (files.length > 1) {
      showError('Please upload only one PDF file', uploadSection)
      return
    }

    handleFileUpload(files[0], uploadSection, content)
  })

  const input = uploadZone.querySelector('input[type="file"]')
  input.removeAttribute('multiple')

  uploadSection.appendChild(uploadZone)

  content.appendChild(infoBanner)
  content.appendChild(uploadSection)

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
  container.appendChild(content)

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

  async function handleFileUpload(file, uploadSection, container) {
    // Validate PDF
    const validation = validatePDF(file)

    if (!validation.valid) {
      showError(validation.errors.join(', '), uploadSection)
      return
    }

    showLoading(container, 'Loading PDF...')

    try {
      // Store uploaded file info
      uploadedFile = file
      uploadedFileName = file.name

      // Get page count for display
      const arrayBuffer = await readFileAsArrayBuffer(file)
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const pageCount = pdf.numPages

      hideLoading()

      // Hide upload zone
      uploadSection.querySelector('.upload-zone').classList.add('hidden')

      // Show file info with preview
      const fileInfo = document.createElement('div')
      fileInfo.id = 'file-info-pdf-to-word'
      fileInfo.className = 'flex flex-col items-center'
      fileInfo.innerHTML = `
        <div id="pdf-to-word-preview" class="mb-4 flex justify-center"></div>
        <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-lg mb-4">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <div class="text-lg font-semibold text-gray-900 mb-1">${file.name}</div>
        <div class="text-sm text-gray-500">${pageCount} page${pageCount !== 1 ? 's' : ''}</div>
      `

      uploadSection.appendChild(fileInfo)

      // Render preview
      const arrayBuffer2 = await readFileAsArrayBuffer(file)
      const previewContainer = document.getElementById('pdf-to-word-preview')
      await renderPreview(arrayBuffer2, previewContainer, 150)

      pdf.destroy()

      // Show action buttons
      const actionsSection = document.getElementById('action-buttons-pdf-to-word')
      if (actionsSection) {
        actionsSection.classList.remove('hidden')
      }
    } catch (error) {
      hideLoading()
      console.error('Error loading PDF:', error)
      showError('Failed to load PDF. Please ensure the file is a valid PDF document.', uploadSection)
    }
  }
}

/**
 * Convert PDF to Word using backend API
 */
async function convertPdfToWord(file, container, fileName) {
  if (!file) {
    showError('No PDF file loaded. Please upload a PDF first.', container)
    return
  }

  showLoading(container, 'Uploading PDF to server...')

  try {
    // Create form data
    const formData = new FormData()
    formData.append('file', file)

    // Call backend API
    showLoading(container, 'Converting PDF to Word (this may take 10-30 seconds)...')

    const response = await fetch(`${API_URL}/api/convert`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Conversion failed' }))
      throw new Error(error.detail || `Server error: ${response.status}`)
    }

    // Download the converted file
    showLoading(container, 'Downloading converted file...')

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)

    // Generate filename
    const outputFileName = fileName.replace(/\.pdf$/i, '.docx')

    // Trigger download
    const a = document.createElement('a')
    a.href = url
    a.download = outputFileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    // Cleanup
    setTimeout(() => URL.revokeObjectURL(url), 100)

    hideLoading()
    showSuccess(`Successfully converted to Word: ${outputFileName}`, container)

    // Show info about quality
    const infoDiv = document.createElement('div')
    infoDiv.className = 'mt-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800'
    infoDiv.innerHTML = `
      <strong>✓ Professional conversion complete!</strong><br>
      Formatting preserved: paragraphs, headings, bold, italic, lists, and images.
    `
    container.appendChild(infoDiv)

  } catch (error) {
    hideLoading()
    console.error('Conversion error:', error)

    let errorMessage = 'Conversion failed. '

    if (error.message.includes('Failed to fetch')) {
      errorMessage += 'Unable to connect to conversion server. Please check your internet connection.'
    } else if (error.message.includes('does not contain selectable text')) {
      errorMessage += 'This PDF appears to be a scanned document. Please use the OCR tool first to add text.'
    } else {
      errorMessage += error.message
    }

    showError(errorMessage, container)
  }
}
