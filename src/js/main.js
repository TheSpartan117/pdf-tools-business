import { createHeader } from './components/header.js'
import { createHero } from './components/hero.js'
import { createFeaturesGrid } from './components/features-grid.js'
import { createFooter } from './components/footer.js'
import { createToolPage } from './components/tool-page.js'
import { createPrivacyPage } from './pages/privacy.js'
import { createTermsPage } from './pages/terms.js'
import { initRouter } from './router.js'
import { TOOLS } from './config/tools.js'

console.log('PDF Tools app initializing...')

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready')
  initApp()
})

function initApp() {
  const app = document.getElementById('app')

  // Initialize router
  initRouter({
    home: showHomePage,
    tool: showToolPage,
    privacy: showPrivacyPage,
    terms: showTermsPage
  })
}

function showHomePage() {
  const app = document.getElementById('app')
  app.innerHTML = ''

  app.appendChild(createHeader())
  app.appendChild(createHero())
  app.appendChild(createFeaturesGrid())
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
    default:
      contentContainer.innerHTML = `
        <div class="text-center text-gray-600">
          <p>Tool implementation coming soon...</p>
        </div>
      `
  }
}

function showPrivacyPage() {
  const app = document.getElementById('app')
  app.innerHTML = ''

  app.appendChild(createPrivacyPage())
}

function showTermsPage() {
  const app = document.getElementById('app')
  app.innerHTML = ''

  app.appendChild(createTermsPage())
}
