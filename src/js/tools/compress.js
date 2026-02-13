import { PDFDocument } from 'pdf-lib'
import { validatePDF, readFileAsArrayBuffer, createDownloadLink, formatFileSize } from '../utils/file-handler.js'
import { showError, showSuccess, showLoading, hideLoading, createUploadZone } from '../utils/ui-helpers.js'
import { generateFileName } from '../utils/file-naming.js'

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
      // Store filename for later use in compress function
      window.currentUploadedFileName = file.name
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
