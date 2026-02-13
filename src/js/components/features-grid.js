import { TOOLS } from '../config/tools.js'
import { navigateTo } from '../router.js'

export function createFeaturesGrid() {
  const section = document.createElement('section')
  section.id = 'features'
  section.className = 'container mx-auto px-4 py-16'

  const header = document.createElement('div')
  header.className = 'text-center mb-12'
  header.innerHTML = `
    <h2 class="text-4xl font-bold text-gray-900 mb-4">All Tools</h2>
    <p class="text-xl text-gray-600">Choose a tool to get started</p>
  `

  const grid = document.createElement('div')
  grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'

  TOOLS.forEach(tool => {
    const card = createToolCard(tool)
    grid.appendChild(card)
  })

  section.appendChild(header)
  section.appendChild(grid)

  return section
}

function createToolCard(tool) {
  const card = document.createElement('div')
  card.className = 'card cursor-pointer'
  card.dataset.toolId = tool.id

  card.innerHTML = `
    <div class="flex items-center mb-4">
      <div class="text-blue-600 mr-3">
        ${tool.icon}
      </div>
      <h3 class="text-xl font-semibold text-gray-900">${tool.name}</h3>
    </div>
    <p class="text-gray-600">${tool.description}</p>
  `

  if (tool.enabled) {
    card.addEventListener('click', () => {
      navigateTo(`tool/${tool.id}`)
    })
  } else {
    card.classList.add('opacity-50', 'cursor-not-allowed')
    const badge = document.createElement('span')
    badge.className = 'inline-block bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded mt-2'
    badge.textContent = 'Coming Soon'
    card.appendChild(badge)
  }

  return card
}
