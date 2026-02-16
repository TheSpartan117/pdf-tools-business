import { createHeader } from '../components/header.js'
import { createFooter } from '../components/footer.js'
import { getAllBlogPosts } from '../config/blog-posts.js'
import { updateMetaTags } from '../utils/seo.js'
import { createTopBannerAd, createInArticleAd } from '../components/ad-units.js'

export function createBlogPage() {
  try {
    console.log('createBlogPage - starting')
    // Update meta tags for blog page
    updateMetaTags('home')
    document.title = 'Blog - PDFguruji'

    const page = document.createElement('div')
    page.className = 'min-h-screen bg-gray-50'

    console.log('createBlogPage - creating header')
    page.appendChild(createHeader())

    // Blog header
    const header = document.createElement('div')
    header.className = 'bg-white shadow-sm py-12'
    header.innerHTML = `
      <div class="container mx-auto px-4">
        <h1 class="text-4xl font-bold text-gray-900 text-center mb-4">PDFguruji Blog</h1>
        <p class="text-xl text-gray-600 text-center max-w-2xl mx-auto">
          Expert tips, guides, and tutorials for mastering your PDF workflow
        </p>
      </div>
    `

    // Blog posts grid
    const postsContainer = document.createElement('div')
    postsContainer.className = 'container mx-auto px-4 py-12'

    const postsGrid = document.createElement('div')
    postsGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'

    console.log('createBlogPage - getting blog posts')
    const posts = getAllBlogPosts()
    console.log('createBlogPage - found posts:', posts.length)

    posts.forEach((post, index) => {
      console.log(`createBlogPage - creating card ${index + 1}/${posts.length}`)
      const postCard = createBlogPostCard(post)
      postsGrid.appendChild(postCard)
    })

    postsContainer.appendChild(postsGrid)

    page.appendChild(header)

    // Top banner ad after header
    page.appendChild(createTopBannerAd())

    page.appendChild(postsContainer)

    // Bottom ad before footer
    const bottomAdContainer = document.createElement('div')
    bottomAdContainer.className = 'container mx-auto px-4 mb-8'
    bottomAdContainer.appendChild(createInArticleAd())
    page.appendChild(bottomAdContainer)

    page.appendChild(createFooter())

    console.log('createBlogPage - page created successfully')
    return page
  } catch (error) {
    console.error('createBlogPage - error:', error)
    throw error
  }
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
