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

  // Event listeners
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

  function handleFileUpload(file, uploadSection, container) {
    // TODO: Implement
    console.log('File uploaded:', file.name)
  }

  container.appendChild(content)
}

// Stub functions to be implemented
function convertPdfToWord(file, container, fileName) {
  console.log('Convert to Word:', fileName)
}
