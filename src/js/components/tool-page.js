export function createToolPage(tool) {
  const page = document.createElement('div')
  page.className = 'min-h-screen bg-gray-50'

  // Header with back button
  const header = document.createElement('div')
  header.className = 'bg-white shadow-sm'
  header.innerHTML = `
    <div class="container mx-auto px-4 py-4">
      <button id="back-btn" class="flex items-center text-gray-600 hover:text-gray-900">
        <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Home
      </button>
    </div>
  `

  // Tool title
  const titleSection = document.createElement('div')
  titleSection.className = 'container mx-auto px-4 py-8'
  titleSection.innerHTML = `
    <div class="text-center mb-8">
      <div class="flex justify-center mb-4 text-blue-600">
        ${tool.icon}
      </div>
      <h1 class="text-4xl font-bold text-gray-900 mb-2">${tool.name}</h1>
      <p class="text-xl text-gray-600">${tool.description}</p>
    </div>
  `

  // Tool content container
  const contentContainer = document.createElement('div')
  contentContainer.id = 'tool-content'
  contentContainer.className = 'container mx-auto px-4 pb-16'

  page.appendChild(header)
  page.appendChild(titleSection)
  page.appendChild(contentContainer)

  // Back button handler
  header.querySelector('#back-btn').addEventListener('click', () => {
    window.location.hash = 'home'
  })

  return { page, contentContainer }
}
