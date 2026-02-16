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
  let html = markdown

  // Code blocks (must be before inline code)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/gim, (match, lang, code) => {
    return `<pre class="bg-gray-100 rounded p-4 overflow-x-auto"><code class="language-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`
  })

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm">$1</code>')

  // Tables
  html = convertTables(html)

  // Headers (must be on their own line)
  html = html.replace(/^### (.+)$/gim, '<h3 class="text-2xl font-bold mt-8 mb-4">$1</h3>')
  html = html.replace(/^## (.+)$/gim, '<h2 class="text-3xl font-bold mt-10 mb-6">$1</h2>')
  html = html.replace(/^# (.+)$/gim, '<h1 class="text-4xl font-bold mt-12 mb-8">$1</h1>')

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-700 underline">$1</a>')

  // Lists - handle numbered and bulleted
  html = convertLists(html)

  // Block quotes
  html = html.replace(/^> (.+)$/gim, '<blockquote class="border-l-4 border-blue-500 pl-4 italic my-4">$1</blockquote>')

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr class="my-8 border-gray-300">')

  // Paragraphs - split by double newline
  html = html.split('\n\n').map(block => {
    block = block.trim()
    if (!block) return ''
    // Don't wrap if already HTML
    if (block.startsWith('<')) return block
    // Don't wrap single newlines within a block
    return `<p class="mb-4">${block.replace(/\n/g, '<br>')}</p>`
  }).filter(b => b).join('\n\n')

  return html
}

function convertTables(markdown) {
  // Match tables (header row | separator | data rows)
  const tableRegex = /(\|.+\|\n\|[-:\s|]+\|\n(?:\|.+\|\n?)*)/gm

  return markdown.replace(tableRegex, (match) => {
    const rows = match.trim().split('\n')
    if (rows.length < 2) return match

    let html = '<div class="overflow-x-auto my-6"><table class="min-w-full border-collapse border border-gray-300">'

    // Header row
    const headerCells = rows[0].split('|').filter(cell => cell.trim())
    html += '<thead class="bg-gray-100"><tr>'
    headerCells.forEach(cell => {
      html += `<th class="border border-gray-300 px-4 py-2 text-left font-semibold">${cell.trim()}</th>`
    })
    html += '</tr></thead>'

    // Data rows (skip separator row at index 1)
    html += '<tbody>'
    for (let i = 2; i < rows.length; i++) {
      const cells = rows[i].split('|').filter(cell => cell.trim())
      if (cells.length === 0) continue

      html += '<tr>'
      cells.forEach(cell => {
        html += `<td class="border border-gray-300 px-4 py-2">${cell.trim()}</td>`
      })
      html += '</tr>'
    }
    html += '</tbody></table></div>'

    return html
  })
}

function convertLists(markdown) {
  // Numbered lists
  markdown = markdown.replace(/(?:^|\n)(\d+\..+(?:\n\d+\..+)*)/gm, (match) => {
    const items = match.trim().split('\n')
    let html = '<ol class="list-decimal list-inside my-4 space-y-2">'
    items.forEach(item => {
      const text = item.replace(/^\d+\.\s*/, '')
      html += `<li class="ml-4">${text}</li>`
    })
    html += '</ol>'
    return html
  })

  // Bullet lists
  markdown = markdown.replace(/(?:^|\n)([-*]\s.+(?:\n[-*]\s.+)*)/gm, (match) => {
    const items = match.trim().split('\n')
    let html = '<ul class="list-disc list-inside my-4 space-y-2">'
    items.forEach(item => {
      const text = item.replace(/^[-*]\s*/, '')
      html += `<li class="ml-4">${text}</li>`
    })
    html += '</ul>'
    return html
  })

  return markdown
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
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
