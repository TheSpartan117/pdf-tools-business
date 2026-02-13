import { createHeader } from './components/header.js'
import { createHero } from './components/hero.js'

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

  // Add placeholder for features
  const placeholder = document.createElement('div')
  placeholder.className = 'container mx-auto px-4 py-12 text-center'
  placeholder.innerHTML = '<p class="text-gray-600">Features section coming next...</p>'
  app.appendChild(placeholder)
}
