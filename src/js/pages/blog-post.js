import { createHeader } from '../components/header.js'
import { createFooter } from '../components/footer.js'
import { getBlogPost } from '../config/blog-posts.js'
import { updateMetaTags } from '../utils/seo.js'
import { createTopBannerAd, createInArticleAd } from '../components/ad-units.js'

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

  // Convert markdown-style content to HTML
  const htmlContent = convertMarkdownToHTML(post.content)
  console.log('Blog post HTML content length:', htmlContent.length)
  contentDiv.innerHTML = htmlContent

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

  // Top banner ad after header
  page.appendChild(createTopBannerAd())

  page.appendChild(article)

  // In-article ad before back link
  const inArticleAdContainer = document.createElement('div')
  inArticleAdContainer.className = 'container mx-auto px-4 max-w-4xl'
  inArticleAdContainer.appendChild(createInArticleAd())
  page.appendChild(inArticleAdContainer)

  page.appendChild(backLink)
  page.appendChild(createFooter())

  // Add Article schema
  addArticleSchema(post)

  return page
}

function convertMarkdownToHTML(markdown) {
  // Split into lines for processing
  const lines = markdown.split('\n')
  const output = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Skip empty lines
    if (!line.trim()) {
      i++
      continue
    }

    // Code blocks
    if (line.trim().startsWith('```')) {
      const lang = line.trim().substring(3)
      i++
      let code = ''
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code += lines[i] + '\n'
        i++
      }
      output.push(`<pre class="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto my-6"><code class="language-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`)
      i++ // Skip closing ```
      continue
    }

    // Tables
    if (line.includes('|') && i + 1 < lines.length && lines[i + 1].includes('---')) {
      const table = parseTable(lines, i)
      output.push(table.html)
      i = table.nextIndex
      continue
    }

    // Headers
    if (line.startsWith('### ')) {
      output.push(`<h3 class="text-2xl font-bold mt-8 mb-4 text-gray-900">${processInline(line.substring(4))}</h3>`)
      i++
      continue
    }
    if (line.startsWith('## ')) {
      output.push(`<h2 class="text-3xl font-bold mt-10 mb-6 text-gray-900">${processInline(line.substring(3))}</h2>`)
      i++
      continue
    }
    if (line.startsWith('# ')) {
      output.push(`<h1 class="text-4xl font-bold mt-12 mb-8 text-gray-900">${processInline(line.substring(2))}</h1>`)
      i++
      continue
    }

    // Bullet lists
    if (line.match(/^[-*✓❌]\s/)) {
      let listHtml = '<ul class="list-none my-6 space-y-2">'
      while (i < lines.length && lines[i].match(/^[-*✓❌]\s/)) {
        const text = lines[i].replace(/^[-*✓❌]\s*/, '')
        const icon = lines[i].trim()[0]
        const color = icon === '✓' ? 'text-green-600' : icon === '❌' ? 'text-red-600' : 'text-gray-600'
        listHtml += `<li class="flex items-start"><span class="${color} mr-2 font-bold">${icon}</span><span>${processInline(text)}</span></li>`
        i++
      }
      listHtml += '</ul>'
      output.push(listHtml)
      continue
    }

    // Numbered lists
    if (line.match(/^\d+\.\s/)) {
      let listHtml = '<ol class="list-decimal list-inside my-6 space-y-2 ml-4">'
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        const text = lines[i].replace(/^\d+\.\s*/, '')
        listHtml += `<li>${processInline(text)}</li>`
        i++
      }
      listHtml += '</ol>'
      output.push(listHtml)
      continue
    }

    // Block quotes
    if (line.startsWith('> ')) {
      output.push(`<blockquote class="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-700">${processInline(line.substring(2))}</blockquote>`)
      i++
      continue
    }

    // Horizontal rules
    if (line.trim() === '---') {
      output.push('<hr class="my-8 border-gray-300">')
      i++
      continue
    }

    // Regular paragraph - collect multiple lines
    let paragraph = ''
    while (i < lines.length && lines[i].trim() && !isSpecialLine(lines[i])) {
      paragraph += lines[i] + ' '
      i++
    }
    if (paragraph.trim()) {
      output.push(`<p class="mb-4 text-gray-700 leading-relaxed">${processInline(paragraph.trim())}</p>`)
    }
  }

  return output.join('\n')
}

function isSpecialLine(line) {
  return line.startsWith('#') ||
         line.startsWith('```') ||
         line.match(/^[-*✓❌]\s/) ||
         line.match(/^\d+\.\s/) ||
         line.startsWith('> ') ||
         line.trim() === '---' ||
         line.includes('|')
}

function processInline(text) {
  // Inline code
  text = text.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">$1</code>')

  // Bold
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')

  // Italic
  text = text.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')

  // Links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-700 underline font-medium">$1</a>')

  return text
}

function parseTable(lines, startIndex) {
  let i = startIndex
  const rows = []

  // Parse header
  const headerCells = lines[i].split('|').filter(c => c.trim()).map(c => c.trim())
  i += 2 // Skip header and separator

  // Parse data rows
  while (i < lines.length && lines[i].includes('|')) {
    const cells = lines[i].split('|').filter(c => c.trim()).map(c => c.trim())
    if (cells.length > 0) {
      rows.push(cells)
    }
    i++
  }

  let html = '<div class="overflow-x-auto my-8"><table class="min-w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">'

  // Header
  html += '<thead class="bg-blue-600 text-white"><tr>'
  headerCells.forEach(cell => {
    html += `<th class="px-6 py-3 text-left text-sm font-semibold">${processInline(cell)}</th>`
  })
  html += '</tr></thead>'

  // Body
  html += '<tbody class="divide-y divide-gray-200">'
  rows.forEach((row, idx) => {
    html += `<tr class="${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}">`
    row.forEach(cell => {
      html += `<td class="px-6 py-4 text-sm text-gray-700">${processInline(cell)}</td>`
    })
    html += '</tr>'
  })
  html += '</tbody></table></div>'

  return { html, nextIndex: i }
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
