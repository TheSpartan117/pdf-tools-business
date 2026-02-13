import * as pdfjsLib from 'pdfjs-dist'
import { Document, Packer, Paragraph, ImageRun, HeadingLevel, TextRun } from 'docx'
import { validatePDF, readFileAsArrayBuffer } from '../utils/file-handler.js'
import { showError, showSuccess, showLoading, hideLoading, createUploadZone } from '../utils/ui-helpers.js'
import { renderPreview } from '../utils/preview-renderer.js'
import { generateFileName } from '../utils/file-naming.js'
import {
  isWasmSupported,
  loadPdfWithMuPDF,
  extractStructuredText,
  processStructuredTextBlocks,
  extractImages
} from '../utils/mupdf-extractor.js'
import { buildWordDocument, generateDocxBlob } from '../utils/word-builder.js'

/**
 * Extract images using PDF.js (fallback for MuPDF)
 * @param {File} file - PDF file
 * @param {Array} allPagesData - Page data from MuPDF with image blocks
 * @returns {Promise<Object>} - Map of imageIndex to image data
 */
async function extractImagesWithPdfJs(file, allPagesData) {
  const imageDataMap = {}

  try {
    const arrayBuffer = await readFileAsArrayBuffer(file)
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    // Track image index across all pages
    let globalImageIndex = 0

    for (const pageData of allPagesData) {
      const { pageNumber, blocks } = pageData

      // Count images on this page
      const imageBlocks = blocks.filter(b => b.type === 'image')

      if (imageBlocks.length === 0) continue

      // Load page with PDF.js
      const page = await pdf.getPage(pageNumber)

      // Extract images using existing function
      const images = await extractImagesFromPage(page)

      // Map images (use minimum of detected blocks vs extracted images)
      const imageCount = Math.min(images.length, imageBlocks.length)
      for (let localIndex = 0; localIndex < imageCount; localIndex++) {
        imageDataMap[globalImageIndex + localIndex] = images[localIndex]
      }

      globalImageIndex += imageBlocks.length
    }

    pdf.destroy()

  } catch (error) {
    console.warn('Failed to extract images with PDF.js:', error)
  }

  return imageDataMap
}

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
        <h3 class="text-sm font-medium text-blue-800">High-Quality PDF to Word Conversion</h3>
        <div class="mt-2 text-sm text-blue-700">
          <ul class="list-disc list-inside space-y-1">
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
 * Convert PDF to Word using MuPDF.js (high quality)
 * @param {File} file - PDF file
 * @param {HTMLElement} container - Container for messages
 * @param {string} fileName - Original filename
 * @returns {Promise<void>}
 */
async function convertWithMuPDF(file, container, fileName) {
  showLoading(container, 'Loading PDF with advanced parser...')

  let mupdfDoc = null
  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await readFileAsArrayBuffer(file)

    // Load PDF with MuPDF
    mupdfDoc = await loadPdfWithMuPDF(arrayBuffer)
    const pageCount = mupdfDoc.countPages()

    // Extract structured text from all pages
    showLoading(container, `Extracting text from ${pageCount} pages...`)
    const allPagesData = []

    for (let i = 0; i < pageCount; i++) {
      showLoading(container, `Processing page ${i + 1} of ${pageCount}...`)
      console.error(`DEBUG: Starting page ${i + 1}`)

      console.error(`DEBUG: Loading page ${i + 1}`)
      const page = mupdfDoc.loadPage(i)
      console.error(`DEBUG: Page ${i + 1} loaded`)

      console.error(`DEBUG: Extracting structured text from page ${i + 1}`)
      const pageData = extractStructuredText(page, i + 1)
      console.error(`DEBUG: Structured text extracted from page ${i + 1}, blocks:`, pageData.blocks.length)

      allPagesData.push(pageData)

      // Clean up page after extraction
      if (page && typeof page.destroy === 'function') {
        try {
          page.destroy()
        } catch (pageCleanupError) {
          console.warn(`Page ${i + 1} cleanup error:`, pageCleanupError)
        }
      }
      console.error(`DEBUG: Finished page ${i + 1}`)
    }

    // Check if any text was found
    const totalBlocks = allPagesData.reduce((sum, page) => sum + page.blocks.length, 0)
    if (totalBlocks === 0) {
      hideLoading()
      showError(
        'This PDF does not contain selectable text. It appears to be a scanned document. Please use the OCR tool first.',
        container
      )
      return
    }

    // Process structured text into formatted content
    showLoading(container, 'Analyzing document structure...')
    const processedContent = processStructuredTextBlocks(allPagesData)

    // Extract images using PDF.js fallback
    showLoading(container, 'Extracting images...')
    const imageDataMap = await extractImagesWithPdfJs(file, allPagesData)

    // Build Word document
    showLoading(container, 'Building Word document...')
    const doc = await buildWordDocument(processedContent, imageDataMap)

    // Generate .docx blob
    showLoading(container, 'Generating file...')
    const blob = await generateDocxBlob(doc)

    // Hide loading BEFORE download
    hideLoading()

    // Download file
    const outputFileName = generateFileName(fileName, 'to-word', 'docx')
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = outputFileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    // Cleanup
    setTimeout(() => URL.revokeObjectURL(url), 100)

    // Show success message
    showSuccess(`Successfully converted to Word: ${outputFileName}`, container)

  } catch (error) {
    hideLoading()
    console.error('MuPDF conversion error:', error)
    throw error // Re-throw to be caught by fallback handler
  } finally {
    // Always cleanup MuPDF resources
    if (mupdfDoc) {
      try {
        mupdfDoc.destroy()
      } catch (cleanupError) {
        console.warn('MuPDF cleanup error:', cleanupError)
      }
    }
  }
}

/**
 * Main PDF to Word conversion function with MuPDF and fallback
 * @param {File} file - PDF file
 * @param {HTMLElement} container - Container element
 * @param {string} fileName - Original filename
 */
async function convertPdfToWord(file, container, fileName) {
  // Validate file exists
  if (!file) {
    showError('No PDF file loaded. Please upload a PDF first.', container)
    return
  }

  // Check WebAssembly and MuPDF support
  const wasmSupported = await isWasmSupported()

  if (!wasmSupported) {
    console.warn('MuPDF not available, using PDF.js fallback directly')
    // Use PDF.js directly
    try {
      await convertWithPdfJs(file, container, fileName)
      // Add info banner about basic mode
      const infoDiv = document.createElement('div')
      infoDiv.className = 'mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800'
      infoDiv.textContent = 'Used basic conversion mode. For better formatting, please use a modern browser (Chrome, Firefox, Safari, or Edge).'
      container.appendChild(infoDiv)
    } catch (error) {
      hideLoading()
      showError(`Conversion failed: ${error.message}`, container)
    }
    return
  }

  // Try MuPDF first, fallback to PDF.js if it fails
  try {
    await convertWithMuPDF(file, container, fileName)
  } catch (mupdfError) {
    console.warn('MuPDF conversion failed, falling back to basic mode:', mupdfError)

    // Show warning about fallback
    showLoading(container, 'Using basic conversion mode...')

    try {
      await convertWithPdfJs(file, container, fileName)
      // Add warning banner about limited formatting
      const warningDiv = document.createElement('div')
      warningDiv.className = 'mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800'
      warningDiv.textContent = 'Used basic conversion mode. Formatting may be limited.'
      container.appendChild(warningDiv)
    } catch (fallbackError) {
      hideLoading()
      console.error('Both conversion methods failed:', {
        mupdfError: mupdfError.message,
        fallbackError: fallbackError.message
      })
      showError(
        'Failed to convert PDF to Word. Please ensure the file is a valid PDF document.',
        container
      )
    }
  }
}

/**
 * Fallback: Convert PDF to Word using PDF.js (legacy method)
 * @param {File} file - PDF file
 * @param {HTMLElement} container - Container element
 * @param {string} fileName - Original filename
 */
async function convertWithPdfJs(file, container, fileName) {
  // This is the OLD implementation - keep as fallback
  window.DEBUG_CONVERSION = true
  console.error('=== CONVERSION STARTED ===')
  alert('Conversion started - check console')
  showLoading(container, 'Converting PDF to Word (basic mode)...')

  try {
    // Read file as ArrayBuffer
    console.error('Reading file...')
    const arrayBuffer = await readFileAsArrayBuffer(file)
    console.error('File read successfully, size:', arrayBuffer.byteLength)

    // Load PDF document
    console.log('Loading PDF with PDF.js...')
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const pageCount = pdf.numPages
    console.log('PDF loaded, pages:', pageCount)

    const pagesData = []
    let totalTextLength = 0

    // Process each page
    for (let i = 1; i <= pageCount; i++) {
      console.log(`Processing page ${i}/${pageCount}...`)
      showLoading(container, `Processing page ${i} of ${pageCount}...`)

      const page = await pdf.getPage(i)
      console.log(`Page ${i} loaded, extracting text...`)
      const paragraphs = await extractTextFromPage(page)
      console.log(`Page ${i} text extracted, paragraphs:`, paragraphs.length)

      // Skip image extraction for now to avoid hanging
      const images = []

      const pageTextLength = paragraphs.join('').length
      totalTextLength += pageTextLength

      pagesData.push({
        pageNumber: i,
        paragraphs,
        images
      })
    }
    console.log('All pages processed, building Word document...')

    // Validate PDF has selectable text
    if (totalTextLength === 0) {
      hideLoading()
      showError(
        'This PDF does not contain selectable text. It appears to be a scanned document. Please use the OCR tool first.',
        container
      )
      pdf.destroy()
      return
    }

    // Build Word document (using old simple method)
    console.log('Building Word document...')
    showLoading(container, 'Building Word document...')
    const doc = await buildWordDocumentLegacy(pagesData)
    console.log('Word document built, generating blob...')

    // Generate .docx blob
    showLoading(container, 'Generating file...')
    const blob = await Packer.toBlob(doc)
    console.log('Blob generated, size:', blob.size)

    // Hide loading BEFORE download
    hideLoading()

    // Download file
    const outputFileName = generateFileName(fileName, 'to-word', 'docx')
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = outputFileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    setTimeout(() => URL.revokeObjectURL(url), 100)

    showSuccess(`Successfully converted to Word: ${outputFileName}`, container)

    pdf.destroy()
  } catch (error) {
    hideLoading()
    console.error('Error converting PDF to Word:', error)
    throw error
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
    if (!nextLine || Math.abs(line.y - nextLine.y) > 15) {
      // Keep each line separate for better formatting (preserve line breaks)
      paragraphs.push(...currentParagraph.map(t => t.trim()).filter(t => t))
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
          // Get image data from page objects with timeout
          const imageData = await Promise.race([
            new Promise((resolve, reject) => {
              page.objs.get(imageName, (img) => {
                if (img) {
                  resolve(img)
                } else {
                  reject(new Error('Image not found'))
                }
              })
            }),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Image load timeout')), 5000)
            )
          ])

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
 * Build Word document from extracted page data (legacy method)
 * @param {Array} pagesData - Array of { pageNumber, paragraphs[], images[] }
 * @returns {Document} - docx Document object
 */
async function buildWordDocumentLegacy(pagesData) {
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

    // Add text paragraphs (each line as separate paragraph for better formatting)
    for (const paragraphText of pageData.paragraphs) {
      if (paragraphText.trim()) {
        children.push(
          new Paragraph({
            children: [new TextRun(paragraphText)],
            spacing: { after: 80 } // Less spacing since each line is a paragraph now
          })
        )
      }
    }

    // Add spacing between major sections
    if (pageData.paragraphs.length > 0 && pageData.images.length === 0) {
      children.push(new Paragraph({ spacing: { after: 200 } }))
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
