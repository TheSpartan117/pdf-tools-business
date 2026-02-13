import { createHeader } from './components/header.js'
import { createHero } from './components/hero.js'
import { createFeaturesGrid } from './components/features-grid.js'

console.log('PDF Tools app initializing...')

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready')
  initApp()
})

function initApp() {
  const app = document.getElementById('app')
  app.innerHTML = '' // Clear loading message

  // Build page structure
  app.appendChild(createHeader())
  app.appendChild(createHero())
  app.appendChild(createFeaturesGrid())
}
