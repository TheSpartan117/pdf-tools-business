import { createHeader } from '../components/header.js'
import { createFooter } from '../components/footer.js'
import { getBlogPost } from '../config/blog-posts.js'
import { updateMetaTags } from '../utils/seo.js'

export function createBlogPostPage(postId) {
  const post = getBlogPost(postId)

  if (!post) {
    // Post not found, redirect to blog index
    window.location.hash = 'blog'
    return document.createElement('div')
  }

  // Update meta tags for this specific post
  document.title = `${post.title} | PDF Tools Blog`
  const metaDescription = document.querySelector('meta[name="description"]')
  if (metaDescription) {
    metaDescription.setAttribute('content', post.excerpt)
  }

  const page = document.createElement('div')
  page.className = 'min-h-screen bg-gray-50'

  page.appendChild(createHeader())

  // Article header
  const header = document.createElement('header')
  header.className = 'bg-white shadow-sm py-12'
  header.innerHTML = `
    <div class="container mx-auto px-4 max-w-4xl">
      <div class="text-sm text-blue-600 font-semibold mb-2">${post.category}</div>
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">${post.title}</h1>
      <div class="flex items-center text-gray-600 text-sm space-x-4">
        <span>By ${post.author}</span>
        <span>•</span>
        <time datetime="${post.date}">${post.date}</time>
        <span>•</span>
        <span>${post.readTime}</span>
      </div>
    </div>
  `

  // Article content
  const article = document.createElement('article')
  article.className = 'container mx-auto px-4 py-12 max-w-4xl'

  const contentDiv = document.createElement('div')
  contentDiv.className = 'prose prose-lg max-w-none bg-white rounded-lg shadow-md p-8'

  // Convert markdown-style content to HTML (simple version)
  contentDiv.innerHTML = convertMarkdownToHTML(post.content)

  article.appendChild(contentDiv)

  // Back to blog link
  const backLink = document.createElement('div')
  backLink.className = 'container mx-auto px-4 py-8 max-w-4xl'
  backLink.innerHTML = `
    <a href="#/blog" class="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold">
      ← Back to Blog
    </a>
  `

  page.appendChild(header)
  page.appendChild(article)
  page.appendChild(backLink)
  page.appendChild(createFooter())

  // Add Article schema
  addArticleSchema(post)

  return page
}

function convertMarkdownToHTML(markdown) {
  // Simple markdown-to-HTML converter
  let html = markdown

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')

  // Links [text](#/link)
  html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" class="text-blue-600 hover:text-blue-700">$1</a>')

  // Lists
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')

  // Paragraphs
  html = html.split('\n\n').map(para => {
    if (para.startsWith('<h') || para.startsWith('<ul') || para.startsWith('<li')) {
      return para
    }
    return `<p>${para}</p>`
  }).join('\n')

  return html
}

function addArticleSchema(post) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "author": {
      "@type": "Organization",
      "name": post.author
    },
    "datePublished": post.date,
    "articleBody": post.content.substring(0, 500) + '...'
  }

  const existing = document.querySelector('script[data-schema-type="article"]')
  if (existing) {
    existing.remove()
  }

  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.setAttribute('data-schema-type', 'article')
  script.textContent = JSON.stringify(schema)
  document.head.appendChild(script)
}
