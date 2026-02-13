import * as pdfjsLib from 'pdfjs-dist'

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

/**
 * Render first page of PDF as thumbnail preview
 * @param {ArrayBuffer} pdfData - PDF file data
 * @param {HTMLElement} container - Container element for preview
 * @param {number} maxWidth - Maximum preview width in pixels (default: 200)
 */
export async function renderPreview(pdfData, container, maxWidth = 200) {
  // Input validation
  if (!pdfData || !(pdfData instanceof ArrayBuffer)) {
    console.error('Preview error: pdfData must be an ArrayBuffer')
    const errorMsg = document.createElement('p')
    errorMsg.className = 'text-sm text-gray-500'
    errorMsg.textContent = 'Preview unavailable'
    container.innerHTML = ''
    container.appendChild(errorMsg)
    return
  }

  if (!container || !(container instanceof HTMLElement)) {
    console.error('Preview error: container must be an HTMLElement')
    return
  }

  try {
    const loadingTask = pdfjsLib.getDocument({ data: pdfData })
    const pdf = await loadingTask.promise
    const page = await pdf.getPage(1) // First page

    const viewport = page.getViewport({ scale: 1.0 })
    const scale = maxWidth / viewport.width
    const scaledViewport = page.getViewport({ scale })

    const canvas = document.createElement('canvas')
    canvas.className = 'border border-gray-300 rounded shadow-sm'
    const context = canvas.getContext('2d')

    // Check if context is available
    if (!context) {
      throw new Error('Could not get canvas 2D context')
    }

    canvas.width = scaledViewport.width
    canvas.height = scaledViewport.height

    await page.render({
      canvasContext: context,
      viewport: scaledViewport
    }).promise

    // Clean up PDF.js resources
    pdf.destroy()

    container.innerHTML = ''
    container.appendChild(canvas)

  } catch (error) {
    console.error('Preview render error:', error)
    // Safe DOM manipulation instead of innerHTML
    const errorMsg = document.createElement('p')
    errorMsg.className = 'text-sm text-gray-500'
    errorMsg.textContent = 'Preview unavailable'
    container.innerHTML = ''
    container.appendChild(errorMsg)
  }
}
