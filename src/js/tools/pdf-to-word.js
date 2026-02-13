import * as pdfjsLib from 'pdfjs-dist'
import { Document, Packer, Paragraph, ImageRun, HeadingLevel, TextRun } from 'docx'
import { validatePDF, readFileAsArrayBuffer } from '../utils/file-handler.js'
import { showError, showSuccess, showLoading, hideLoading, createUploadZone } from '../utils/ui-helpers.js'
import { renderPreview } from '../utils/preview-renderer.js'
import { generateFileName } from '../utils/file-naming.js'

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href

export function initPdfToWordTool(container) {
  let uploadedFile = null
  let uploadedFileName = ''

  const content = document.createElement('div')
  content.className = 'max-w-4xl mx-auto'

  // Warning banner
  const warningBanner = document.createElement('div')
  warningBanner.className = 'bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6'
  warningBanner.innerHTML = `
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="ml-3">
        <h3 class="text-sm font-medium text-yellow-800">PDF to Word Converter</h3>
        <div class="mt-2 text-sm text-yellow-700">
          <ul class="list-disc list-inside space-y-1">
            <li>Only works with PDFs containing selectable text (not scanned images)</li>
            <li>Extracts text and images but does NOT preserve:
              <ul class="ml-6 mt-1 space-y-1">
                <li>• Layout and formatting</li>
                <li>• Tables and columns</li>
                <li>• Fonts and text styles</li>
                <li>• Headers and footers</li>
              </ul>
            </li>
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
    console.log('Files received:', files)

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

  content.appendChild(warningBanner)
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

  // Event listeners - must be after appending to DOM
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
    console.log('handleFileUpload called with:', file)

    // Validate PDF
    const validation = validatePDF(file)
    console.log('Validation result:', validation)

    if (!validation.valid) {
      console.error('Validation failed:', validation.errors)
      showError(validation.errors.join(', '), uploadSection)
      return
    }

    showLoading(container, 'Loading PDF...')

    try {
      // Store uploaded file info
      uploadedFile = file
      uploadedFileName = file.name

      // Read file FIRST time - for getting page count
      const arrayBuffer1 = await readFileAsArrayBuffer(file)

      // Load PDF to get page count
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer1 }).promise
      const pageCount = pdf.numPages

      // Clean up
      pdf.destroy()

      hideLoading()

      // Hide upload zone
      uploadSection.querySelector('.upload-zone').classList.add('hidden')

      // Show file info
      const fileInfo = document.createElement('div')
      fileInfo.id = 'file-info-pdf-to-word'
      fileInfo.className = 'text-center'
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

      // Read file SECOND time - for preview (first ArrayBuffer was detached by PDF.js)
      const arrayBuffer2 = await readFileAsArrayBuffer(file)

      // Render preview
      const previewContainer = document.getElementById('pdf-to-word-preview')
      await renderPreview(arrayBuffer2, previewContainer, 150)

      // Show action buttons
      const actionsSection = document.getElementById('action-buttons-pdf-to-word')
      if (actionsSection) {
        actionsSection.classList.remove('hidden')
      }
    } catch (error) {
      hideLoading(uploadSection)
      console.error('Error loading PDF:', error)
      showError('Failed to load PDF. Please ensure the file is a valid PDF document.', uploadSection)
    }
  }
}

/**
 * Main PDF to Word conversion function
 * Orchestrates the entire conversion process
 */
async function convertPdfToWord(file, container, fileName) {
  // Validate file exists
  if (!file) {
    showError('No PDF file loaded. Please upload a PDF first.', container)
    return
  }

  showLoading(container, 'Converting PDF to Word...')

  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await readFileAsArrayBuffer(file)

    // Load PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const pageCount = pdf.numPages

    const pagesData = []
    let totalTextLength = 0

    // Process each page
    for (let i = 1; i <= pageCount; i++) {
      // Update loading message with progress
      showLoading(container, `Processing page ${i} of ${pageCount}...`)

      // Get page object
      const page = await pdf.getPage(i)

      // Extract text and images
      const paragraphs = await extractTextFromPage(page)
      const images = await extractImagesFromPage(page)

      // Track total text length
      const pageTextLength = paragraphs.join('').length
      totalTextLength += pageTextLength

      // Store page data
      pagesData.push({
        pageNumber: i,
        paragraphs,
        images
      })
    }

    // Validate PDF has selectable text
    if (totalTextLength === 0) {
      hideLoading()
      showError(
        'This PDF does not contain selectable text. It appears to be a scanned document. Please use the OCR tool first to convert it to a searchable PDF.',
        container
      )
      pdf.destroy()
      return
    }

    // Build Word document
    showLoading(container, 'Building Word document...')
    const doc = await buildWordDocument(pagesData)

    // Generate .docx blob
    const blob = await Packer.toBlob(doc)

    // Download file
    const outputFileName = generateFileName(fileName, 'to-word', 'docx')
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = outputFileName
    a.click()

    // Cleanup
    setTimeout(() => URL.revokeObjectURL(url), 100)

    // Show success message
    hideLoading()
    showSuccess(`Successfully converted to Word: ${outputFileName}`, container)

    // Clean up PDF
    pdf.destroy()
  } catch (error) {
    hideLoading()
    console.error('Error converting PDF to Word:', error)
    showError(
      'Failed to convert PDF to Word. Please ensure the file is a valid PDF document.',
      container
    )
  }
}

/**
 * Extract text from a PDF page and group into paragraphs
 */
async function extractTextFromPage(page) {
  const textContent = await page.getTextContent()

  if (!textContent.items || textContent.items.length === 0) {
    return []
  }

  // Group text items by Y position (line detection)
  const lines = []
  let currentLine = null

  textContent.items.forEach((item) => {
    const y = item.transform[5] // Y coordinate
    const text = item.str

    if (!text.trim()) return

    // Check if this item belongs to the current line (within 2px tolerance)
    if (currentLine && Math.abs(currentLine.y - y) < 2) {
      // Add space between items on the same line if needed
      if (currentLine.text && !currentLine.text.endsWith(' ') && !text.startsWith(' ')) {
        currentLine.text += ' '
      }
      currentLine.text += text
    } else {
      // Start a new line
      if (currentLine) {
        lines.push(currentLine)
      }
      currentLine = { y, text }
    }
  })

  // Push the last line
  if (currentLine) {
    lines.push(currentLine)
  }

  // Group lines into paragraphs based on vertical spacing
  const paragraphs = []
  let currentParagraph = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const nextLine = lines[i + 1]

    currentParagraph.push(line.text)

    // Check if there's a significant gap to the next line (paragraph break)
    if (!nextLine || Math.abs(line.y - nextLine.y) > 10) {
      paragraphs.push(currentParagraph.join(' ').trim())
      currentParagraph = []
    }
  }

  return paragraphs.length > 0 ? paragraphs : lines.map(l => l.text)
}

/**
 * Extract images from a PDF page as PNG blobs
 */
async function extractImagesFromPage(page) {
  try {
    const operatorList = await page.getOperatorList()
    const images = []

    // Find image operations (fn 85 = paintImageXObject, fn 86 = paintInlineImageXObject)
    for (let i = 0; i < operatorList.fnArray.length; i++) {
      const fn = operatorList.fnArray[i]

      if (fn === 85 || fn === 86) { // Image operations
        const argsArray = operatorList.argsArray[i]
        const imageName = argsArray[0]

        try {
          // Get image data from page objects
          const imageData = await new Promise((resolve, reject) => {
            page.objs.get(imageName, (img) => {
              if (img) {
                resolve(img)
              } else {
                reject(new Error('Image not found'))
              }
            })
          })

          if (imageData && imageData.width && imageData.height) {
            // Create canvas to convert image to PNG blob
            const canvas = document.createElement('canvas')
            canvas.width = imageData.width
            canvas.height = imageData.height
            const ctx = canvas.getContext('2d')

            // Draw image data to canvas
            const imgData = ctx.createImageData(imageData.width, imageData.height)
            imgData.data.set(imageData.data)
            ctx.putImageData(imgData, 0, 0)

            // Convert canvas to blob
            const blob = await new Promise((resolve) => {
              canvas.toBlob(resolve, 'image/png')
            })

            if (blob) {
              images.push({
                blob,
                width: imageData.width,
                height: imageData.height
              })
            }
          }
        } catch (imgError) {
          console.warn('Failed to extract image:', imgError)
          // Continue processing other images
        }
      }
    }

    return images
  } catch (error) {
    console.warn('Error extracting images from page:', error)
    return []
  }
}

/**
 * Build Word document from extracted page data
 * @param {Array} pagesData - Array of { pageNumber, paragraphs[], images[] }
 * @returns {Document} - docx Document object
 */
async function buildWordDocument(pagesData) {
  const children = []

  for (const pageData of pagesData) {
    // Add page heading
    children.push(
      new Paragraph({
        text: `Page ${pageData.pageNumber}`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 }
      })
    )

    // Add text paragraphs
    for (const paragraphText of pageData.paragraphs) {
      if (paragraphText.trim()) {
        children.push(
          new Paragraph({
            children: [new TextRun(paragraphText)],
            spacing: { after: 120 }
          })
        )
      }
    }

    // Add images
    for (const image of pageData.images) {
      try {
        // Convert blob to arrayBuffer for ImageRun
        const arrayBuffer = await image.blob.arrayBuffer()

        // Scale image if width exceeds 600px
        let width = image.width
        let height = image.height

        if (width > 600) {
          const scale = 600 / width
          width = 600
          height = Math.round(height * scale)
        }

        children.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: arrayBuffer,
                transformation: { width, height }
              })
            ],
            spacing: { after: 120 }
          })
        )
      } catch (error) {
        console.warn('Failed to add image to document:', error)
        // Continue with other images
      }
    }
  }

  // Create and return document
  return new Document({
    sections: [
      {
        children
      }
    ]
  })
}
