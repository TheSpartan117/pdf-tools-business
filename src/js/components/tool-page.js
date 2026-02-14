import { getToolH1 } from '../utils/seo.js'
import { injectToolSchema } from '../utils/schema.js'
import { createFAQSection } from './faq-section.js'
import { createInContentAd } from './ad-units.js'

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
  const h1Text = getToolH1(tool.id)
  titleSection.innerHTML = `
    <div class="text-center mb-8">
      <div class="flex justify-center mb-4 text-blue-600">
        ${tool.icon}
      </div>
      <h1 class="text-4xl font-bold text-gray-900 mb-2">${h1Text}</h1>
      <p class="text-xl text-gray-600">${tool.description}</p>
    </div>
  `

  // Main container - TOOL FIRST, NO ADS ABOVE
  const mainContainer = document.createElement('div')
  mainContainer.className = 'container mx-auto px-4 pb-8'

  // Tool content container - full width, no sidebar
  const contentContainer = document.createElement('div')
  contentContainer.id = 'tool-content'
  contentContainer.className = 'w-full max-w-4xl mx-auto'

  mainContainer.appendChild(contentContainer)

  // Ad section - AFTER the tool interface
  const adSection = document.createElement('div')
  adSection.className = 'container mx-auto px-4 py-8'
  adSection.innerHTML = `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="text-xs text-gray-500 text-center mb-2">Advertisement</div>
    </div>
  `

  // Add horizontal ad after tool (non-intrusive)
  const inContentAd = createInContentAd()
  adSection.querySelector('.space-y-6').appendChild(inContentAd)

  // FAQ section
  const faqSection = createFAQSection(tool.id)

  page.appendChild(header)
  page.appendChild(titleSection)
  page.appendChild(mainContainer)

  // Append FAQ section if it has content
  if (faqSection.children.length > 0) {
    const faqContainer = document.createElement('div')
    faqContainer.className = 'container mx-auto px-4 pb-16'
    faqContainer.appendChild(faqSection)
    page.appendChild(faqContainer)
  }

  // Add ads AFTER FAQ section (at the very bottom)
  page.appendChild(adSection)

  // Back button handler
  header.querySelector('#back-btn').addEventListener('click', () => {
    window.location.hash = 'home'
  })

  // Inject schema markup
  injectToolSchema(tool.id)

  return { page, contentContainer }
}
