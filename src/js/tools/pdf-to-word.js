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

  // TODO: Add UI sections

  container.appendChild(content)
}
