import * as pdfjsLib from 'pdfjs-dist'
import { validatePDF, readFileAsArrayBuffer, createDownloadLink } from '../utils/file-handler.js'
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
    <p class="text-sm text-gray-600 mb-4">Backend OCR processing - 10x faster than client-side, creates searchable PDF</p>
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
          <option value="rus">Russian</option>
          <option value="ara">Arabic</option>
          <option value="chi_sim">Chinese Simplified</option>
          <option value="jpn">Japanese</option>
          <option value="kor">Korean</option>
        </select>
      </div>
    </div>
    <div id="ocr-info" class="mt-4 p-3 bg-blue-50 rounded text-blue-700"></div>
    <div class="mt-4 p-3 bg-yellow-50 rounded text-yellow-800 text-sm">
      <strong>Note:</strong> OCR processing may take 10-30 seconds depending on file size. The result will be a searchable PDF with text layer.
    </div>
  `

  // Action buttons
  const actionsSection = document.createElement('div')
  actionsSection.className = 'flex flex-col sm:flex-row gap-4 justify-center hidden'
  actionsSection.id = 'action-buttons'
  actionsSection.innerHTML = `
    <button id="ocr-btn" class="btn-primary">
      Create Searchable PDF
    </button>
    <button id="clear-btn" class="btn-secondary">
      Start Over
    </button>
  `

  content.appendChild(uploadSection)
  content.appendChild(optionsSection)
  content.appendChild(actionsSection)
  container.appendChild(content)

  const ocrBtn = document.getElementById('ocr-btn')
  const clearBtn = document.getElementById('clear-btn')

  ocrBtn.addEventListener('click', async () => {
    const language = document.getElementById('ocr-language').value
    await performOCR(uploadedFile, uploadedFileName, language, container)
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

async function performOCR(file, fileName, language, container) {
  if (!file) {
    showError('Please upload a PDF first', container)
    return
  }

  try {
    showLoading(container, 'Performing OCR with backend API... This may take 10-30 seconds')

    // Use backend API for OCR
    const API_URL = 'http://localhost:8000'

    const formData = new FormData()
    formData.append('file', file)
    formData.append('language', language)

    const response = await fetch(`${API_URL}/api/ocr`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`OCR failed: ${response.statusText}`)
    }

    // Download the searchable PDF
    const blob = await response.blob()
    const outputFilename = generateFileName(fileName || 'document.pdf', 'ocr')
    createDownloadLink(blob, outputFilename)

    hideLoading()

    showSuccess(
      `OCR completed successfully! The PDF now has a searchable text layer. Language: ${language.toUpperCase()}`,
      container
    )

  } catch (error) {
    hideLoading()
    console.error('OCR error:', error)
    console.error('Error details:', error.message, error.stack)
    showError(`Failed to perform OCR: ${error.message}`, container)
  }
}
