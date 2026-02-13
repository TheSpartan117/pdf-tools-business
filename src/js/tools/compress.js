import { PDFDocument } from 'pdf-lib'
import { validatePDF, readFileAsArrayBuffer, createDownloadLink, formatFileSize } from '../utils/file-handler.js'
import { showError, showSuccess, showLoading, hideLoading, createUploadZone } from '../utils/ui-helpers.js'
import { generateFileName } from '../utils/file-naming.js'
import { renderPreview } from '../utils/preview-renderer.js'

export function initCompressTool(container) {
  let uploadedFile = null
  let pdfDoc = null
  let originalSize = 0
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

  // Compression options
  const optionsSection = document.createElement('div')
  optionsSection.id = 'compress-options'
  optionsSection.className = 'bg-white rounded-lg shadow-md p-8 mb-6 hidden'
  optionsSection.innerHTML = `
    <h3 class="text-xl font-semibold mb-4">Compression Quality</h3>
    <p class="text-sm text-gray-600 mb-4">Backend compression with image resizing and optimization</p>
    <div class="space-y-4">
      <div>
        <label class="flex items-center">
          <input type="radio" name="compress-level" value="low" class="mr-2">
          <span><strong>Low Quality</strong> - Maximum compression (~60% reduction, 50% size + 50% quality)</span>
        </label>
      </div>
      <div>
        <label class="flex items-center">
          <input type="radio" name="compress-level" value="medium" checked class="mr-2">
          <span><strong>Medium Quality</strong> - Balanced (~40% reduction, 70% size + 75% quality) (recommended)</span>
        </label>
      </div>
      <div>
        <label class="flex items-center">
          <input type="radio" name="compress-level" value="high" class="mr-2">
          <span><strong>High Quality</strong> - Light compression (~30% reduction, 85% size + 90% quality)</span>
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
    compressPDF(uploadedFile, uploadedFileName, level, originalSize, container)
  })

  clearBtn.addEventListener('click', () => {
    uploadedFile = null
    pdfDoc = null
    originalSize = 0
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
      originalSize = file.size
      // Store filename for later use in compress function
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
      optionsSection.classList.remove('hidden')
      actionsSection.classList.remove('hidden')

    } catch (error) {
      hideLoading()
      console.error('Load error:', error)
      showError('Failed to load PDF. Please try another file.', uploadSection)
    }
  }
}

async function compressPDF(uploadedFile, uploadedFileName, level, originalSize, container) {
  if (!uploadedFile) {
    showError('Please upload a PDF first', container)
    return
  }

  try {
    showLoading(container, 'Compressing PDF with backend API... This may take 10-30 seconds')

    // Use backend API for compression
    const API_URL = 'http://localhost:8000'

    const formData = new FormData()
    formData.append('file', uploadedFile)
    formData.append('quality', level)

    const response = await fetch(`${API_URL}/api/compress`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Compression failed: ${response.statusText}`)
    }

    // Get compression stats from headers
    const compressedSizeHeader = response.headers.get('X-Compressed-Size')
    const originalSizeHeader = response.headers.get('X-Original-Size')
    const reductionPercent = response.headers.get('X-Reduction-Percent')

    // Download the compressed file
    const blob = await response.blob()

    // Use blob size if header is missing or 0
    const compressedSize = parseInt(compressedSizeHeader || '0') || blob.size
    const actualOriginalSize = parseInt(originalSizeHeader || originalSize) || originalSize

    const filename = generateFileName(uploadedFileName || 'document.pdf', 'compressed')
    createDownloadLink(blob, filename)

    hideLoading()

    // Calculate actual reduction if needed
    const actualReduction = ((actualOriginalSize - compressedSize) / actualOriginalSize * 100).toFixed(1)
    const displayReduction = reductionPercent || actualReduction

    // Show success message with stats
    if (parseFloat(displayReduction) > 0) {
      showSuccess(
        `PDF compressed successfully! Size reduced by ${displayReduction}% ` +
        `(${formatFileSize(actualOriginalSize)} → ${formatFileSize(compressedSize)})`,
        container
      )
    } else {
      showSuccess(
        `PDF processed. Size: ${formatFileSize(actualOriginalSize)} → ${formatFileSize(compressedSize)}. ` +
        `This PDF may already be optimized or contain mostly text.`,
        container
      )
    }

  } catch (error) {
    hideLoading()
    console.error('Compress error:', error)
    console.error('Error details:', error.message, error.stack)
    showError(`Failed to compress PDF: ${error.message}`, container)
  }
}
