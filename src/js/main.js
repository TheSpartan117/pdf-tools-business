import { createHeader } from './components/header.js'
import { createHero } from './components/hero.js'
import { createFeaturesGrid } from './components/features-grid.js'
import { createToolPage } from './components/tool-page.js'
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
    tool: showToolPage
  })
}

function showHomePage() {
  const app = document.getElementById('app')
  app.innerHTML = ''

  app.appendChild(createHeader())
  app.appendChild(createHero())
  app.appendChild(createFeaturesGrid())
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
    default:
      contentContainer.innerHTML = `
        <div class="text-center text-gray-600">
          <p>Tool implementation coming soon...</p>
        </div>
      `
  }
}
