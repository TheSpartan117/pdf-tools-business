import { createHeader } from './components/header.js'
import { createHero } from './components/hero.js'
import { createFeaturesGrid } from './components/features-grid.js'
import { createFooter } from './components/footer.js'
import { createToolPage } from './components/tool-page.js'
import { createPrivacyPage } from './pages/privacy.js'
import { createTermsPage } from './pages/terms.js'
import { createAboutPage } from './pages/about.js'
import { createContactPage } from './pages/contact.js'
import { createBlogPage } from './pages/blog.js'
import { createBlogPostPage } from './pages/blog-post.js'
import { initRouter } from './router.js'
import { TOOLS } from './config/tools.js'
import { createTopBannerAd, initAds, createSidebarAd } from './components/ad-units.js'
import { updateMetaTags } from './utils/seo.js'
import { removeToolSchema } from './utils/schema.js'
import { removeFAQSchema } from './components/faq-section.js'

console.log('PDF Tools app initializing...')

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready')
  initApp()
  initAds()
})

function initApp() {
  const app = document.getElementById('app')

  // Initialize router
  initRouter({
    home: showHomePage,
    tool: showToolPage,
    blog: showBlogPage,
    blogPost: showBlogPostPage,
    privacy: showPrivacyPage,
    terms: showTermsPage,
    about: showAboutPage,
    contact: showContactPage
  })
}

function showHomePage() {
  updateMetaTags('home')
  removeToolSchema()
  removeFAQSchema()
  const app = document.getElementById('app')
  app.innerHTML = ''

  // Header (full width)
  app.appendChild(createHeader())

  // Hero (full width)
  app.appendChild(createHero())

  // Three-column grid container
  const gridContainer = document.createElement('div')
  gridContainer.className = 'container mx-auto px-4'

  const threeColGrid = document.createElement('div')
  threeColGrid.className = 'grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-6 items-start'

  // Left sidebar ad (desktop only)
  const leftAd = createSidebarAd('left')
  leftAd.className = 'hidden lg:block sticky top-4'

  // Center content (tools)
  const centerContent = document.createElement('div')
  centerContent.appendChild(createFeaturesGrid())

  // Right sidebar ad (desktop only)
  const rightAd = createSidebarAd('right')
  rightAd.className = 'hidden lg:block sticky top-4'

  threeColGrid.appendChild(leftAd)
  threeColGrid.appendChild(centerContent)
  threeColGrid.appendChild(rightAd)

  gridContainer.appendChild(threeColGrid)
  app.appendChild(gridContainer)

  // Footer (full width)
  app.appendChild(createFooter())
}

function showToolPage(params) {
  const app = document.getElementById('app')
  const toolId = params[0]

  const tool = TOOLS.find(t => t.id === toolId)

  if (!tool) {
    showHomePage()
    return
  }

  updateMetaTags(toolId)

  app.innerHTML = ''

  const { page, contentContainer } = createToolPage(tool)
  app.appendChild(page)

  // Load the specific tool
  switch (toolId) {
    case 'merge':
      import('./tools/merge.js').then(module => {
        module.initMergeTool(contentContainer)
      })
      break
    case 'split':
      import('./tools/split.js').then(module => {
        module.initSplitTool(contentContainer)
      })
      break
    case 'compress':
      import('./tools/compress.js').then(module => {
        module.initCompressTool(contentContainer)
      })
      break
    case 'rotate':
      import('./tools/rotate.js').then(module => {
        module.initRotateTool(contentContainer)
      })
      break
    case 'pdf-to-images':
      import('./tools/pdf-to-images.js').then(module => {
        module.initPdfToImagesTool(contentContainer)
      })
      break
    case 'images-to-pdf':
      import('./tools/images-to-pdf.js').then(module => {
        module.initImagesToPdfTool(contentContainer)
      })
      break
    case 'pdf-to-word':
      import('./tools/pdf-to-word.js')
        .then(module => {
          module.initPdfToWordTool(contentContainer)
        })
        .catch(error => {
          console.error('Failed to load PDF to Word tool:', error)
          contentContainer.innerHTML = `
            <div class="bg-red-50 border-l-4 border-red-400 p-4">
              <div class="flex">
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">Failed to load PDF to Word tool</h3>
                  <div class="mt-2 text-sm text-red-700">
                    <p>Error: ${error.message}</p>
                    <p class="mt-2">Please check the browser console for details.</p>
                  </div>
                </div>
              </div>
            </div>
          `
        })
      break
    case 'word-to-pdf':
      import('./tools/word-to-pdf.js').then(module => {
        module.initWordToPdfTool(contentContainer)
      })
      break
    case 'ocr':
      import('./tools/ocr.js').then(module => {
        module.initOcrTool(contentContainer)
      })
      break
    default:
      contentContainer.innerHTML = `
        <div class="text-center text-gray-600">
          <p>Tool implementation coming soon...</p>
        </div>
      `
  }
}

function showPrivacyPage() {
  updateMetaTags('privacy')
  removeToolSchema()
  removeFAQSchema()
  const app = document.getElementById('app')
  app.innerHTML = ''

  app.appendChild(createPrivacyPage())
}

function showTermsPage() {
  updateMetaTags('terms')
  removeToolSchema()
  removeFAQSchema()
  const app = document.getElementById('app')
  app.innerHTML = ''

  app.appendChild(createTermsPage())
}

function showBlogPage() {
  try {
    console.log('showBlogPage called')
    removeToolSchema()
    removeFAQSchema()
    const app = document.getElementById('app')
    if (!app) {
      console.error('App element not found')
      return
    }
    app.innerHTML = ''
    const blogPage = createBlogPage()
    console.log('Blog page created:', blogPage)
    app.appendChild(blogPage)
    console.log('Blog page appended successfully')
  } catch (error) {
    console.error('Error in showBlogPage:', error)
  }
}

function showBlogPostPage(postId) {
  removeToolSchema()
  removeFAQSchema()
  const app = document.getElementById('app')
  app.innerHTML = ''
  app.appendChild(createBlogPostPage(postId))
}

function showAboutPage() {
  updateMetaTags('about')
  removeToolSchema()
  removeFAQSchema()
  const app = document.getElementById('app')
  app.innerHTML = ''
  app.appendChild(createAboutPage())
}

function showContactPage() {
  updateMetaTags('contact')
  removeToolSchema()
  removeFAQSchema()
  const app = document.getElementById('app')
  app.innerHTML = ''
  app.appendChild(createContactPage())
}
