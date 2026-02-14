import { getToolH1 } from '../utils/seo.js'
import { injectToolSchema } from '../utils/schema.js'
import { createFAQSection } from './faq-section.js'
import { createToolTopBannerAd, createToolSidebarAd, createInContentAd } from './ad-units.js'

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

  // Add top banner ad after title section
  const topBannerAd = createToolTopBannerAd()
  titleSection.appendChild(topBannerAd)

  // Main container with three-column grid layout (left ad, content, right ad)
  const mainContainer = document.createElement('div')
  mainContainer.className = 'container mx-auto px-4 pb-8'

  const gridLayout = document.createElement('div')
  gridLayout.className = 'grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-6'

  // Left sidebar ad (desktop only)
  const leftSidebarAd = createToolSidebarAd()
  leftSidebarAd.className = 'hidden lg:block sticky top-4 self-start'

  // Tool content container (center column)
  const contentContainer = document.createElement('div')
  contentContainer.id = 'tool-content'
  contentContainer.className = 'min-w-0'

  // Right sidebar ad (desktop only)
  const rightSidebarAd = createToolSidebarAd()
  rightSidebarAd.className = 'hidden lg:block sticky top-4 self-start'

  gridLayout.appendChild(leftSidebarAd)
  gridLayout.appendChild(contentContainer)
  gridLayout.appendChild(rightSidebarAd)
  mainContainer.appendChild(gridLayout)

  // In-content ad container
  const inContentAdContainer = document.createElement('div')
  inContentAdContainer.className = 'container mx-auto px-4 pb-8'
  const inContentAd = createInContentAd()
  inContentAdContainer.appendChild(inContentAd)

  // FAQ section
  const faqSection = createFAQSection(tool.id)

  page.appendChild(header)
  page.appendChild(titleSection)
  page.appendChild(mainContainer)
  page.appendChild(inContentAdContainer)

  // Append FAQ section if it has content
  if (faqSection.children.length > 0) {
    const faqContainer = document.createElement('div')
    faqContainer.className = 'container mx-auto px-4 pb-16'
    faqContainer.appendChild(faqSection)
    page.appendChild(faqContainer)
  }

  // Back button handler
  header.querySelector('#back-btn').addEventListener('click', () => {
    window.location.hash = 'home'
  })

  // Inject schema markup
  injectToolSchema(tool.id)

  return { page, contentContainer }
}
