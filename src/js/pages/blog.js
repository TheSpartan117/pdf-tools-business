import { createHeader } from '../components/header.js'
import { createFooter } from '../components/footer.js'
import { getAllBlogPosts } from '../config/blog-posts.js'
import { updateMetaTags } from '../utils/seo.js'

export function createBlogPage() {
  // Update meta tags for blog page
  updateMetaTags('home')
  document.title = 'Blog - Free PDF Tools Tips & Guides'

  const page = document.createElement('div')
  page.className = 'min-h-screen bg-gray-50'

  page.appendChild(createHeader())

  // Blog header
  const header = document.createElement('div')
  header.className = 'bg-white shadow-sm py-12'
  header.innerHTML = `
    <div class="container mx-auto px-4">
      <h1 class="text-4xl font-bold text-gray-900 text-center mb-4">PDF Tools Blog</h1>
      <p class="text-xl text-gray-600 text-center max-w-2xl mx-auto">
        Tips, guides, and tutorials for working with PDF files more efficiently
      </p>
    </div>
  `

  // Blog posts grid
  const postsContainer = document.createElement('div')
  postsContainer.className = 'container mx-auto px-4 py-12'

  const postsGrid = document.createElement('div')
  postsGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'

  const posts = getAllBlogPosts()

  posts.forEach(post => {
    const postCard = createBlogPostCard(post)
    postsGrid.appendChild(postCard)
  })

  postsContainer.appendChild(postsGrid)

  page.appendChild(header)
  page.appendChild(postsContainer)
  page.appendChild(createFooter())

  return page
}

function createBlogPostCard(post) {
  const card = document.createElement('article')
  card.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer'

  card.innerHTML = `
    <div class="p-6">
      <div class="text-sm text-blue-600 font-semibold mb-2">${post.category}</div>
      <h2 class="text-2xl font-bold text-gray-900 mb-3">${post.title}</h2>
      <p class="text-gray-600 mb-4">${post.excerpt}</p>
      <div class="flex items-center justify-between text-sm text-gray-500">
        <span>${post.date}</span>
        <span>${post.readTime}</span>
      </div>
      <button class="mt-4 text-blue-600 font-semibold hover:text-blue-700">
        Read More →
      </button>
    </div>
  `

  card.addEventListener('click', () => {
    window.location.hash = `blog/${post.id}`
  })

  return card
}
