import { PDFDocument, degrees } from 'pdf-lib'
import { validatePDF, readFileAsArrayBuffer, createDownloadLink } from '../utils/file-handler.js'
import { showError, showSuccess, showLoading, hideLoading, createUploadZone } from '../utils/ui-helpers.js'
import { generateFileName } from '../utils/file-naming.js'

export function initRotateTool(container) {
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
    rotatePDF(pdfDoc, selectedAngle, scope, container, uploadedFileName)
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
