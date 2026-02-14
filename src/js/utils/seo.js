/**
 * SEO Utilities for dynamic meta tag management
 */

export const SEO_CONFIG = {
  'pdf-to-word': {
    title: 'PDF to Word - Free Online PDF Converter | No Email Required',
    description: 'Convert PDF to Word free online. No signup, no email, no limits. Fast, secure, and easy to use. 100% free PDF to Word converter.',
    keywords: 'pdf to word, pdf to docx, convert pdf to word, free pdf converter, pdf to word online',
    h1: 'Free PDF to Word Converter - No Email Required'
  },
  'word-to-pdf': {
    title: 'Word to PDF - Free Online Word Converter | No Limits',
    description: 'Convert Word to PDF free online. No signup, no email, no limits. Fast, secure, and easy to use. 100% free Word to PDF converter.',
    keywords: 'word to pdf, docx to pdf, convert word to pdf, free word converter, word to pdf online',
    h1: 'Free Word to PDF Converter - No Limits'
  },
  'compress': {
    title: 'Compress PDF - Free Online PDF Compressor | No Limits',
    description: 'Compress PDF files free online. No signup, no email, no limits. Reduce file size while maintaining quality. 100% free PDF compressor.',
    keywords: 'compress pdf, reduce pdf size, pdf compressor, shrink pdf, compress pdf online',
    h1: 'Free PDF Compressor - Reduce File Size'
  },
  'merge': {
    title: 'Merge PDF - Free Online PDF Merger | Combine PDFs',
    description: 'Merge PDF files free online. No signup, no email, no limits. Combine multiple PDFs into one. 100% free PDF merger.',
    keywords: 'merge pdf, combine pdf, join pdf, pdf merger, merge pdf files',
    h1: 'Free PDF Merger - Combine Multiple PDFs'
  },
  'split': {
    title: 'Split PDF - Free Online PDF Splitter | Extract Pages',
    description: 'Split PDF files free online. No signup, no email, no limits. Extract pages or split into multiple files. 100% free PDF splitter.',
    keywords: 'split pdf, extract pdf pages, pdf splitter, divide pdf, split pdf online',
    h1: 'Free PDF Splitter - Extract Pages'
  },
  'rotate': {
    title: 'Rotate PDF - Free Online PDF Rotator | No Email',
    description: 'Rotate PDF pages free online. No signup, no email, no limits. Rotate individual pages or entire document. 100% free PDF rotator.',
    keywords: 'rotate pdf, rotate pdf pages, flip pdf, pdf rotator, rotate pdf online',
    h1: 'Free PDF Rotator - Rotate Pages'
  },
  'pdf-to-images': {
    title: 'PDF to JPG - Free Online PDF to Image Converter',
    description: 'Convert PDF to JPG/PNG free online. No signup, no email, no limits. Extract images from PDF. 100% free PDF to image converter.',
    keywords: 'pdf to jpg, pdf to png, pdf to image, convert pdf to jpg, pdf to images',
    h1: 'Free PDF to Image Converter - Extract as JPG/PNG'
  },
  'images-to-pdf': {
    title: 'Images to PDF - Free Online Image to PDF Converter',
    description: 'Convert images to PDF free online. No signup, no email, no limits. Create PDF from JPG, PNG. 100% free image to PDF converter.',
    keywords: 'images to pdf, jpg to pdf, png to pdf, pictures to pdf, convert images to pdf',
    h1: 'Free Image to PDF Converter - JPG/PNG to PDF'
  },
  'ocr': {
    title: 'OCR PDF - Free Online PDF Text Extractor | No Email',
    description: 'Extract text from scanned PDFs free online. No signup, no email, no limits. OCR technology. 100% free PDF text extractor.',
    keywords: 'ocr pdf, extract text from pdf, pdf ocr, scan to text, pdf text extractor',
    h1: 'Free PDF OCR - Extract Text from Scanned PDFs'
  },
  'extract': {
    title: 'Extract PDF Pages - Free Online PDF Page Extractor',
    description: 'Extract specific pages from PDF free online. No signup, no email, no limits. Select and extract individual pages. 100% free PDF page extractor.',
    keywords: 'extract pdf pages, pdf page extractor, select pdf pages, extract pages from pdf, pdf extractor',
    h1: 'Free PDF Page Extractor - Select Specific Pages'
  },
  'home': {
    title: 'Free PDF Tools - Convert, Compress, Merge PDFs Online | No Email Required',
    description: 'Free online PDF tools. Convert, compress, merge, split, and rotate PDFs. No signup, no email, no limits. 100% free and secure.',
    keywords: 'pdf tools, free pdf converter, pdf online, pdf editor, pdf utilities',
    h1: 'Free PDF Tools - No Email Required'
  },
  'privacy': {
    title: 'Privacy Policy - Free PDF Tools',
    description: 'Privacy policy for Free PDF Tools. Learn how we handle your data and protect your privacy. Secure processing with no file storage.',
    keywords: 'privacy policy, data protection, privacy, pdf tools privacy',
    h1: 'Privacy Policy'
  },
  'terms': {
    title: 'Terms of Service - Free PDF Tools',
    description: 'Terms of service for Free PDF Tools. Understand your rights and responsibilities when using our free PDF tools.',
    keywords: 'terms of service, terms and conditions, user agreement, pdf tools terms',
    h1: 'Terms of Service'
  }
}

/**
 * Update page meta tags for SEO
 * @param {string} toolId - Tool identifier or 'home'
 */
export function updateMetaTags(toolId) {
  const config = SEO_CONFIG[toolId] || SEO_CONFIG['home']

  // Update title
  document.title = config.title

  // Update or create meta description
  let metaDescription = document.querySelector('meta[name="description"]')
  if (metaDescription) {
    metaDescription.setAttribute('content', config.description)
  } else {
    metaDescription = document.createElement('meta')
    metaDescription.setAttribute('name', 'description')
    metaDescription.setAttribute('content', config.description)
    document.head.appendChild(metaDescription)
  }

  // Update or create meta keywords
  let metaKeywords = document.querySelector('meta[name="keywords"]')
  if (metaKeywords) {
    metaKeywords.setAttribute('content', config.keywords)
  } else {
    metaKeywords = document.createElement('meta')
    metaKeywords.setAttribute('name', 'keywords')
    metaKeywords.setAttribute('content', config.keywords)
    document.head.appendChild(metaKeywords)
  }

  // Update or create Open Graph tags
  updateOGTag('og:title', config.title)
  updateOGTag('og:description', config.description)
  updateOGTag('og:type', 'website')
  updateOGTag('og:url', window.location.href)

  // Update or create Twitter Card tags
  updateTwitterTag('twitter:card', 'summary_large_image')
  updateTwitterTag('twitter:title', config.title)
  updateTwitterTag('twitter:description', config.description)
}

function updateOGTag(property, content) {
  let tag = document.querySelector(`meta[property="${property}"]`)
  if (tag) {
    tag.setAttribute('content', content)
  } else {
    tag = document.createElement('meta')
    tag.setAttribute('property', property)
    tag.setAttribute('content', content)
    document.head.appendChild(tag)
  }
}

function updateTwitterTag(name, content) {
  let tag = document.querySelector(`meta[name="${name}"]`)
  if (tag) {
    tag.setAttribute('content', content)
  } else {
    tag = document.createElement('meta')
    tag.setAttribute('name', name)
    tag.setAttribute('content', content)
    document.head.appendChild(tag)
  }
}

/**
 * Get H1 text for tool page
 * @param {string} toolId
 */
export function getToolH1(toolId) {
  const config = SEO_CONFIG[toolId]
  return config ? config.h1 : 'PDF Tools'
}
