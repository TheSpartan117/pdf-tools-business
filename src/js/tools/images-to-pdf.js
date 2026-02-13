import { PDFDocument } from 'pdf-lib'
import { readFileAsArrayBuffer, createDownloadLink, formatFileSize } from '../utils/file-handler.js'
import { showError, showSuccess, showLoading, hideLoading } from '../utils/ui-helpers.js'
import { generateFileName } from '../utils/file-naming.js'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB per image

export function initImagesToPdfTool(container) {
  const uploadedImages = []

  const content = document.createElement('div')
  content.className = 'max-w-4xl mx-auto'

  // Upload zone
  const uploadSection = document.createElement('div')
  uploadSection.className = 'bg-white rounded-lg shadow-md p-8 mb-6'
  uploadSection.innerHTML = `
    <div class="upload-zone" id="image-upload-zone">
      <input type="file" id="image-file-input" accept="image/jpeg,image/jpg,image/png" multiple class="hidden" />
      <div class="text-center">
        <svg class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p class="text-lg font-medium text-gray-700 mb-2">Upload Images</p>
        <p class="text-sm text-gray-500 mb-4">JPG or PNG files</p>
        <button type="button" class="btn-primary" id="browse-images-btn">
          Browse Files
        </button>
        <p class="text-xs text-gray-400 mt-2">or drag and drop images here</p>
      </div>
    </div>
    <div id="images-list" class="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"></div>
  `

  // Options section
  const optionsSection = document.createElement('div')
  optionsSection.id = 'pdf-options'
  optionsSection.className = 'bg-white rounded-lg shadow-md p-8 mb-6 hidden'
  optionsSection.innerHTML = `
    <h3 class="text-xl font-semibold mb-4">PDF Options</h3>
    <div>
      <label class="block font-medium mb-2">Page Size</label>
      <select id="page-size" class="border border-gray-300 rounded px-3 py-2 w-full">
        <option value="auto">Auto (match image size)</option>
        <option value="a4">A4 (210 x 297 mm)</option>
        <option value="letter">Letter (8.5 x 11 in)</option>
      </select>
    </div>
    <div id="images-info" class="mt-4 p-3 bg-blue-50 rounded text-blue-700"></div>
  `

  // Action buttons
  const actionsSection = document.createElement('div')
  actionsSection.className = 'flex flex-col sm:flex-row gap-4 justify-center hidden'
  actionsSection.id = 'action-buttons'
  actionsSection.innerHTML = `
    <button id="create-pdf-btn" class="btn-primary">
      Create PDF
    </button>
    <button id="clear-images-btn" class="btn-secondary">
      Clear All
    </button>
  `

  content.appendChild(uploadSection)
  content.appendChild(optionsSection)
  content.appendChild(actionsSection)
  container.appendChild(content)

  // Event listeners
  const fileInput = document.getElementById('image-file-input')
  const browseBtn = document.getElementById('browse-images-btn')
  const uploadZone = document.getElementById('image-upload-zone')
  const imagesList = document.getElementById('images-list')

  browseBtn.addEventListener('click', () => fileInput.click())
  fileInput.addEventListener('change', (e) => handleImageUpload(e.target.files))

  // Drag and drop
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault()
    uploadZone.classList.add('dragover')
  })

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover')
  })

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault()
    uploadZone.classList.remove('dragover')
    handleImageUpload(e.dataTransfer.files)
  })

  const createPdfBtn = document.getElementById('create-pdf-btn')
  const clearImagesBtn = document.getElementById('clear-images-btn')

  createPdfBtn.addEventListener('click', () => {
    const pageSize = document.getElementById('page-size').value
    createPdfFromImages(uploadedImages, pageSize, container)
  })

  clearImagesBtn.addEventListener('click', () => {
    uploadedImages.length = 0
    imagesList.innerHTML = ''
    optionsSection.classList.add('hidden')
    actionsSection.classList.add('hidden')
    document.getElementById('images-info').textContent = ''
  })

  function handleImageUpload(files) {
    const validFiles = Array.from(files).filter(file => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        showError(`${file.name}: Only JPG and PNG images are supported`, uploadSection)
        return false
      }
      if (file.size > MAX_FILE_SIZE) {
        showError(`${file.name}: File exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`, uploadSection)
        return false
      }
      return true
    })

    validFiles.forEach(file => {
      uploadedImages.push(file)
      addImageToList(file, uploadedImages, imagesList)
    })

    if (uploadedImages.length > 0) {
      document.getElementById('images-info').textContent = `${uploadedImages.length} image(s) selected`
      optionsSection.classList.remove('hidden')
      actionsSection.classList.remove('hidden')
    }
  }

  function addImageToList(file, uploadedImages, imagesList) {
    const imageItem = document.createElement('div')
    imageItem.className = 'relative bg-gray-100 rounded overflow-hidden group'
    imageItem.dataset.fileName = file.name

    const img = document.createElement('img')
    img.className = 'w-full h-32 object-cover'
    img.src = URL.createObjectURL(file)

    const removeBtn = document.createElement('button')
    removeBtn.className = 'absolute top-2 right-2 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity'
    removeBtn.innerHTML = `
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    `

    removeBtn.addEventListener('click', () => {
      const index = uploadedImages.findIndex(f => f.name === file.name)
      if (index > -1) {
        uploadedImages.splice(index, 1)
      }
      URL.revokeObjectURL(img.src)
      imageItem.remove()

      if (uploadedImages.length === 0) {
        optionsSection.classList.add('hidden')
        actionsSection.classList.add('hidden')
      } else {
        document.getElementById('images-info').textContent = `${uploadedImages.length} image(s) selected`
      }
    })

    const fileName = document.createElement('p')
    fileName.className = 'text-xs text-gray-600 p-2 truncate'
    fileName.textContent = file.name

    imageItem.appendChild(img)
    imageItem.appendChild(removeBtn)
    imageItem.appendChild(fileName)
    imagesList.appendChild(imageItem)
  }
}

async function createPdfFromImages(images, pageSize, container) {
  if (images.length === 0) {
    showError('Please upload at least one image', container)
    return
  }

  try {
    showLoading(container, `Creating PDF from ${images.length} image(s)...`)

    const pdfDoc = await PDFDocument.create()

    for (let i = 0; i < images.length; i++) {
      const file = images[i]
      const arrayBuffer = await readFileAsArrayBuffer(file)

      let image
      if (file.type === 'image/png') {
        image = await pdfDoc.embedPng(arrayBuffer)
      } else {
        image = await pdfDoc.embedJpg(arrayBuffer)
      }

      const imgDims = image.scale(1)

      let page
      if (pageSize === 'a4') {
        // A4: 595.28 x 841.89 points
        page = pdfDoc.addPage([595.28, 841.89])
        const scale = Math.min(
          page.getWidth() / imgDims.width,
          page.getHeight() / imgDims.height
        )
        const scaledDims = image.scale(scale)
        page.drawImage(image, {
          x: (page.getWidth() - scaledDims.width) / 2,
          y: (page.getHeight() - scaledDims.height) / 2,
          width: scaledDims.width,
          height: scaledDims.height
        })
      } else if (pageSize === 'letter') {
        // Letter: 612 x 792 points
        page = pdfDoc.addPage([612, 792])
        const scale = Math.min(
          page.getWidth() / imgDims.width,
          page.getHeight() / imgDims.height
        )
        const scaledDims = image.scale(scale)
        page.drawImage(image, {
          x: (page.getWidth() - scaledDims.width) / 2,
          y: (page.getHeight() - scaledDims.height) / 2,
          width: scaledDims.width,
          height: scaledDims.height
        })
      } else {
        // Auto: match image size
        page = pdfDoc.addPage([imgDims.width, imgDims.height])
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: imgDims.width,
          height: imgDims.height
        })
      }
    }

    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })

    hideLoading()

    const filename = generateFileName(images[0].name, 'pdf', 'pdf')
    createDownloadLink(blob, filename)

    showSuccess(`Successfully created PDF from ${images.length} image(s)!`, container)

  } catch (error) {
    hideLoading()
    console.error('PDF creation error:', error)
    showError('Failed to create PDF. Please try again.', container)
  }
}
