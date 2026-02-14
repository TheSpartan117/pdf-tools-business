import { showError, showSuccess, showLoading, hideLoading, createUploadZone } from '../utils/ui-helpers.js'

// Backend API URL
const API_URL = 'https://pdf-tools-business.onrender.com'

export function initWordToPdfTool(container) {
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
        <h3 class="text-sm font-medium text-blue-800">Professional Word to PDF Conversion</h3>
        <div class="mt-2 text-sm text-blue-700">
          <ul class="list-disc list-inside space-y-1">
            <li><strong>High-fidelity conversion</strong> - Preserves original formatting</li>
            <li>Maintains fonts, colors, and text styling</li>
            <li>Preserves tables, lists, and document structure</li>
            <li>Includes images in correct positions</li>
            <li>Converts headers, footers, and page layouts</li>
          </ul>
        </div>
      </div>
    </div>
  `

  // Upload section
  const uploadSection = document.createElement('div')
  uploadSection.className = 'bg-white rounded-lg shadow-md p-8 mb-6'

  const uploadZone = createUploadZone((files) => {
    if (!files || files.length === 0) {
      showError('No file selected', content)
      return
    }

    if (files.length > 1) {
      showError('Please upload only one Word document', content)
      return
    }

    handleFileUpload(files[0], uploadSection, content)
  })

  // Update upload zone to accept .docx files
  const input = uploadZone.querySelector('input[type="file"]')
  input.removeAttribute('multiple')
  input.setAttribute('accept', '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document')

  // Update text for Word files
  const textElement = uploadZone.querySelector('p.text-gray-600')
  if (textElement) {
    textElement.textContent = 'Drag and drop a Word document here'
  }

  uploadSection.appendChild(uploadZone)
  content.appendChild(uploadSection)
  content.appendChild(infoBanner)

  // Action buttons
  const actionButtons = document.createElement('div')
  actionButtons.id = 'action-buttons-word-to-pdf'
  actionButtons.className = 'hidden mt-6 flex gap-4 justify-center'
  actionButtons.innerHTML = `
    <button id="convert-to-pdf-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
      Convert to PDF
    </button>
    <button id="clear-word-to-pdf-btn" class="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium">
      Clear
    </button>
  `
  content.appendChild(actionButtons)
  container.appendChild(content)

  // Event listeners - must be after appending to DOM
  const convertBtn = document.getElementById('convert-to-pdf-btn')
  const clearBtn = document.getElementById('clear-word-to-pdf-btn')

  if (convertBtn) {
    convertBtn.addEventListener('click', () => {
      if (uploadedFile) {
        convertWordToPdf(uploadedFile, container, uploadedFileName)
      }
    })
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      uploadedFile = null
      uploadedFileName = ''
      actionButtons.classList.add('hidden')

      // Reset upload zone
      const fileInput = uploadSection.querySelector('input[type="file"]')
      if (fileInput) {
        fileInput.value = ''
      }

      const uploadZone = uploadSection.querySelector('.upload-zone')
      if (uploadZone) {
        uploadZone.classList.remove('hidden')
      }

      const fileInfo = uploadSection.querySelector('#file-info-word-to-pdf')
      if (fileInfo) {
        fileInfo.remove()
      }
    })
  }

  function handleFileUpload(file, uploadSection, container) {
    // Validate file
    if (!validateWordFile(file)) {
      showError('Please upload a valid .docx file', container)
      return
    }

    // Store file and filename
    uploadedFile = file
    uploadedFileName = file.name

    // Hide upload zone
    const uploadZone = uploadSection.querySelector('.upload-zone')
    if (uploadZone) {
      uploadZone.classList.add('hidden')
    }

    // Create and show file info
    const fileInfo = document.createElement('div')
    fileInfo.id = 'file-info-word-to-pdf'
    fileInfo.className = 'mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200'
    fileInfo.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <svg class="h-10 w-10 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
          </svg>
          <div>
            <p class="text-sm font-medium text-gray-900">${file.name}</p>
            <p class="text-sm text-gray-500">${(file.size / 1024).toFixed(1)} KB</p>
          </div>
        </div>
      </div>
    `

    // Insert file info after upload section
    uploadSection.appendChild(fileInfo)

    // Show action buttons
    actionButtons.classList.remove('hidden')
  }
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

/**
 * Convert Word to PDF using backend API
 */
async function convertWordToPdf(file, container, fileName) {
  if (!file) {
    showError('No Word file loaded. Please upload a Word document first.', container)
    return
  }

  showLoading(container, 'Uploading Word document to server...')

  try {
    // Create form data
    const formData = new FormData()
    formData.append('file', file)

    // Call backend API for Word to PDF conversion
    showLoading(container, 'Converting Word to PDF (this may take 10-30 seconds)...')

    const response = await fetch(`${API_URL}/api/word-to-pdf`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Conversion failed' }))
      throw new Error(error.detail || `Server error: ${response.status}`)
    }

    // Download the converted file
    showLoading(container, 'Downloading converted PDF...')

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)

    // Generate filename
    const outputFileName = fileName.replace(/\.(docx|doc)$/i, '.pdf')

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
    showSuccess(`Successfully converted to PDF: ${outputFileName}`, container)

    // Show info about quality
    const infoDiv = document.createElement('div')
    infoDiv.className = 'mt-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800'
    infoDiv.innerHTML = `
      <strong>✓ Professional conversion complete!</strong><br>
      Original formatting preserved: fonts, styles, tables, images, and layouts.
    `
    container.appendChild(infoDiv)

  } catch (error) {
    hideLoading()
    console.error('Conversion error:', error)

    let errorMessage = 'Conversion failed. '

    if (error.message.includes('Failed to fetch')) {
      errorMessage += 'Unable to connect to conversion server. Please check your internet connection.'
    } else {
      errorMessage += error.message
    }

    showError(errorMessage, container)
  }
}
