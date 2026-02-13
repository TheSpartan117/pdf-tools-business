import { PDFDocument } from 'pdf-lib'
import { validatePDF, readFileAsArrayBuffer, createDownloadLink, formatFileSize } from '../utils/file-handler.js'
import { showError, showSuccess, showLoading, hideLoading, createUploadZone } from '../utils/ui-helpers.js'
import { generateFileName } from '../utils/file-naming.js'

export function initMergeTool(container) {
  const uploadedFiles = []

  const content = document.createElement('div')
  content.className = 'max-w-4xl mx-auto'

  // Upload zone
  const uploadSection = document.createElement('div')
  uploadSection.className = 'bg-white rounded-lg shadow-md p-8 mb-6'

  const uploadZone = createUploadZone((files) => {
    handleFileUpload(files, uploadedFiles, filesList)
  })

  const filesList = document.createElement('div')
  filesList.id = 'files-list'
  filesList.className = 'mt-6 space-y-3'

  uploadSection.appendChild(uploadZone)
  uploadSection.appendChild(filesList)

  // Action buttons
  const actionsSection = document.createElement('div')
  actionsSection.className = 'flex flex-col sm:flex-row gap-4 justify-center'
  actionsSection.innerHTML = `
    <button id="merge-btn" class="btn-primary" disabled>
      Merge PDFs
    </button>
    <button id="clear-btn" class="btn-secondary" disabled>
      Clear All
    </button>
  `

  content.appendChild(uploadSection)
  content.appendChild(actionsSection)
  container.appendChild(content)

  // Event listeners
  const mergeBtn = document.getElementById('merge-btn')
  const clearBtn = document.getElementById('clear-btn')

  mergeBtn.addEventListener('click', () => {
    mergePDFs(uploadedFiles, container)
  })

  clearBtn.addEventListener('click', () => {
    uploadedFiles.length = 0
    filesList.innerHTML = ''
    mergeBtn.disabled = true
    clearBtn.disabled = true
  })
}

function handleFileUpload(files, uploadedFiles, filesList) {
  files.forEach(file => {
    const validation = validatePDF(file)

    if (!validation.valid) {
      showError(validation.errors.join(', '), filesList.parentElement)
      return
    }

    uploadedFiles.push(file)
    addFileToList(file, uploadedFiles, filesList)
  })

  updateButtonStates(uploadedFiles)
}

function addFileToList(file, uploadedFiles, filesList) {
  const fileItem = document.createElement('div')
  fileItem.className = 'flex items-center justify-between bg-gray-50 p-4 rounded'
  fileItem.dataset.fileName = file.name

  fileItem.innerHTML = `
    <div class="flex items-center flex-1">
      <svg class="h-6 w-6 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
      </svg>
      <div>
        <p class="font-medium text-gray-900">${file.name}</p>
        <p class="text-sm text-gray-500">${formatFileSize(file.size)}</p>
      </div>
    </div>
    <button class="remove-btn text-red-600 hover:text-red-800">
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  `

  fileItem.querySelector('.remove-btn').addEventListener('click', () => {
    const index = uploadedFiles.findIndex(f => f.name === file.name)
    if (index > -1) {
      uploadedFiles.splice(index, 1)
    }
    fileItem.remove()
    updateButtonStates(uploadedFiles)
  })

  filesList.appendChild(fileItem)
}

function updateButtonStates(uploadedFiles) {
  const mergeBtn = document.getElementById('merge-btn')
  const clearBtn = document.getElementById('clear-btn')

  const hasFiles = uploadedFiles.length >= 2
  mergeBtn.disabled = !hasFiles
  clearBtn.disabled = uploadedFiles.length === 0
}

async function mergePDFs(files, container) {
  if (files.length < 2) {
    showError('Please upload at least 2 PDF files to merge', container)
    return
  }

  try {
    showLoading(container, 'Merging PDFs...')

    // Create a new PDF document
    const mergedPdf = await PDFDocument.create()

    // Load and copy pages from each file
    for (const file of files) {
      const arrayBuffer = await readFileAsArrayBuffer(file)
      const pdf = await PDFDocument.load(arrayBuffer)
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
      copiedPages.forEach(page => mergedPdf.addPage(page))
    }

    // Save the merged PDF
    const mergedPdfBytes = await mergedPdf.save()
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' })

    hideLoading()
    // Use first file's name as base
    const filename = generateFileName(files[0].name, 'merged')
    createDownloadLink(blob, filename)
    showSuccess('PDFs merged successfully!', container)

  } catch (error) {
    hideLoading()
    console.error('Merge error:', error)
    showError('Failed to merge PDFs. Please try again.', container)
  }
}
