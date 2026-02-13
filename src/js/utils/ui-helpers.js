/**
 * UI helper functions
 */

export function showError(message, container) {
  const errorDiv = document.createElement('div')
  errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'
  errorDiv.innerHTML = `
    <span class="block sm:inline">${message}</span>
  `
  container.prepend(errorDiv)

  // Auto-remove after 30 seconds
  setTimeout(() => errorDiv.remove(), 30000)
}

export function showSuccess(message, container) {
  const successDiv = document.createElement('div')
  successDiv.className = 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4'
  successDiv.innerHTML = `
    <span class="block sm:inline">${message}</span>
  `
  container.prepend(successDiv)

  // Auto-remove after 30 seconds
  setTimeout(() => successDiv.remove(), 30000)
}

export function showLoading(container, message = 'Processing...') {
  // Remove any existing loading indicators first
  hideLoading()

  const loadingDiv = document.createElement('div')
  loadingDiv.id = 'loading-indicator'
  loadingDiv.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
  loadingDiv.innerHTML = `
    <div class="bg-white rounded-lg p-8 flex flex-col items-center">
      <div class="spinner mb-4"></div>
      <p class="text-gray-700">${message}</p>
    </div>
  `
  document.body.appendChild(loadingDiv)
}

export function hideLoading() {
  // Remove ALL loading indicators (in case multiple were created)
  const loadingDivs = document.querySelectorAll('#loading-indicator')
  loadingDivs.forEach(div => div.remove())
}

export function createUploadZone(onFileSelect) {
  const zone = document.createElement('div')
  zone.className = 'upload-zone'
  zone.innerHTML = `
    <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <p class="text-gray-600 mb-2">Drag and drop PDF files here</p>
    <p class="text-gray-500 text-sm mb-4">or</p>
    <button class="btn-primary">Choose Files</button>
    <input type="file" accept="application/pdf" multiple class="hidden" />
  `

  const input = zone.querySelector('input[type="file"]')
  const button = zone.querySelector('button')

  // Click to upload
  button.addEventListener('click', (e) => {
    e.preventDefault()
    input.click()
  })

  input.addEventListener('change', (e) => {
    const files = Array.from(e.target.files)
    onFileSelect(files)
  })

  // Drag and drop
  zone.addEventListener('dragover', (e) => {
    e.preventDefault()
    zone.classList.add('dragover')
  })

  zone.addEventListener('dragleave', () => {
    zone.classList.remove('dragover')
  })

  zone.addEventListener('drop', (e) => {
    e.preventDefault()
    zone.classList.remove('dragover')
    const files = Array.from(e.dataTransfer.files)
    onFileSelect(files)
  })

  return zone
}
