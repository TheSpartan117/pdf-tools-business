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
