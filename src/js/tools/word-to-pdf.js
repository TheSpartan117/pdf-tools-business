import mammoth from 'mammoth'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { showError, showSuccess, showLoading, hideLoading, createUploadZone } from '../utils/ui-helpers.js'
import { generateFileName } from '../utils/file-naming.js'

export function initWordToPdfTool(container) {
  let uploadedFile = null
  let uploadedFileName = ''

  const content = document.createElement('div')
  content.className = 'max-w-4xl mx-auto'

  // Warning banner
  const warningBanner = document.createElement('div')
  warningBanner.className = 'bg-blue-50 border-l-4 border-blue-400 p-4 mb-6'
  warningBanner.innerHTML = `
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
        </svg>
      </div>
      <div class="ml-3">
        <h3 class="text-sm font-medium text-blue-800">Conversion Information</h3>
        <div class="mt-2 text-sm text-blue-700">
          <ul class="list-disc list-inside space-y-1">
            <li>Basic formatting (bold, italic, headings) will be preserved</li>
            <li>Images will be included in the PDF</li>
            <li>Complex layouts may be simplified</li>
            <li>Fonts may differ from the original document</li>
          </ul>
        </div>
      </div>
    </div>
  `
  content.appendChild(warningBanner)

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

async function convertWordToPdf(file, container, fileName) {
  try {
    // Step 1: Validate file exists
    if (!file) {
      showError('No file selected', container)
      return
    }

    // Step 2: Show loading "Converting Word to HTML..."
    showLoading(container, 'Converting Word to HTML...')

    // Step 3: Read file as arrayBuffer
    const arrayBuffer = await file.arrayBuffer()

    // Step 4: Use mammoth.convertToHtml to get HTML
    const result = await mammoth.convertToHtml({ arrayBuffer })
    const html = result.value

    // Step 5: Validate HTML is not empty
    if (!html || html.trim().length === 0) {
      hideLoading(container)
      showError('Could not extract content from Word document', container)
      return
    }

    // Step 6: Update loading "Rendering to PDF..."
    showLoading(container, 'Rendering to PDF...')

    // Step 7: Create hidden temp container with A4 dimensions
    const tempContainer = document.createElement('div')
    tempContainer.id = 'word-to-pdf-temp-container'

    // Step 8: Set container styles (A4 width with padding)
    tempContainer.style.position = 'absolute'
    tempContainer.style.left = '-9999px'
    tempContainer.style.width = '210mm'
    tempContainer.style.padding = '20mm'
    tempContainer.style.fontFamily = 'Arial, sans-serif'
    tempContainer.style.fontSize = '12pt'
    tempContainer.style.lineHeight = '1.5'
    tempContainer.style.backgroundColor = 'white'
    tempContainer.style.boxSizing = 'border-box'

    // Step 9: Insert HTML into container
    tempContainer.innerHTML = html
    document.body.appendChild(tempContainer)

    // Step 10: Wait for images to load
    const images = tempContainer.querySelectorAll('img')
    const imagePromises = Array.from(images).map(img => {
      return new Promise((resolve) => {
        if (img.complete) {
          resolve()
        } else {
          img.onload = resolve
          img.onerror = resolve // Resolve even on error to not block the process
        }
      })
    })
    await Promise.all(imagePromises)

    // Step 11: Create jsPDF instance (portrait, A4)
    const pdf = new jsPDF('portrait', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    // Step 12: Render container to canvas using html2canvas
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      logging: false
    })

    const imgData = canvas.toDataURL('image/png')
    const imgWidth = pdfWidth
    const imgHeight = (canvas.height * pdfWidth) / canvas.width

    // Step 13: Calculate multi-page layout (A4 = 210mm × 297mm)
    let heightLeft = imgHeight
    let position = 0

    // Step 14: Add first page to PDF
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pdfHeight

    // Step 15: Loop to add additional pages if content exceeds one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight
    }

    // Step 16: Clean up: remove temp container
    document.body.removeChild(tempContainer)

    // Step 17: Download PDF using generateFileName
    const outputFileName = generateFileName(fileName, 'to-pdf', 'pdf')
    pdf.save(outputFileName)

    hideLoading(container)

    // Step 18: Show success message
    showSuccess(`Successfully converted to ${outputFileName}`, container)

  } catch (error) {
    hideLoading(container)
    console.error('Error converting Word to PDF:', error)
    showError(`Conversion failed: ${error.message}`, container)
  }
}
