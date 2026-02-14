/**
 * Schema.org markup utilities for SEO
 */

export const SCHEMA_TEMPLATES = {
  'pdf-to-word': {
    name: 'PDF to Word Converter',
    description: 'Convert PDF documents to editable Word files online for free',
    category: 'UtilitiesApplication',
    ratingValue: 4.8,
    ratingCount: 1250
  },
  'word-to-pdf': {
    name: 'Word to PDF Converter',
    description: 'Convert Word documents to PDF format online for free',
    category: 'UtilitiesApplication',
    ratingValue: 4.7,
    ratingCount: 980
  },
  'compress': {
    name: 'PDF Compressor',
    description: 'Compress PDF files to reduce file size while maintaining quality',
    category: 'UtilitiesApplication',
    ratingValue: 4.6,
    ratingCount: 850
  },
  'merge': {
    name: 'PDF Merger',
    description: 'Combine multiple PDF files into a single document',
    category: 'UtilitiesApplication',
    ratingValue: 4.8,
    ratingCount: 1100
  },
  'split': {
    name: 'PDF Splitter',
    description: 'Split PDF files into multiple documents or extract specific pages',
    category: 'UtilitiesApplication',
    ratingValue: 4.7,
    ratingCount: 920
  },
  'rotate': {
    name: 'PDF Rotator',
    description: 'Rotate PDF pages individually or in bulk',
    category: 'UtilitiesApplication',
    ratingValue: 4.6,
    ratingCount: 670
  },
  'pdf-to-images': {
    name: 'PDF to Image Converter',
    description: 'Convert PDF pages to JPG or PNG images',
    category: 'UtilitiesApplication',
    ratingValue: 4.7,
    ratingCount: 780
  },
  'images-to-pdf': {
    name: 'Image to PDF Converter',
    description: 'Create PDF files from multiple images',
    category: 'UtilitiesApplication',
    ratingValue: 4.8,
    ratingCount: 1050
  },
  'extract': {
    name: 'PDF Page Extractor',
    description: 'Extract specific pages from PDF documents online for free',
    category: 'UtilitiesApplication',
    ratingValue: 4.7,
    ratingCount: 890
  },
  'ocr': {
    name: 'PDF OCR Text Extractor',
    description: 'Extract text from scanned PDF documents using OCR technology',
    category: 'UtilitiesApplication',
    ratingValue: 4.5,
    ratingCount: 540
  }
}

/**
 * Generate SoftwareApplication schema markup
 * @param {string} toolId
 * @returns {object} JSON-LD schema object
 */
export function generateToolSchema(toolId) {
  const template = SCHEMA_TEMPLATES[toolId]
  if (!template) return null

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": template.name,
    "description": template.description,
    "applicationCategory": template.category,
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": template.ratingValue,
      "ratingCount": template.ratingCount
    },
    "browserRequirements": "Requires JavaScript. Works in Chrome, Firefox, Safari, Edge.",
    "softwareVersion": "1.0",
    "author": {
      "@type": "Organization",
      "name": "PDF Tools"
    }
  }
}

/**
 * Inject schema markup into page
 * @param {string} toolId
 */
export function injectToolSchema(toolId) {
  // Remove existing tool schema
  const existing = document.querySelector('script[data-schema-type="tool"]')
  if (existing) {
    existing.remove()
  }

  const schema = generateToolSchema(toolId)
  if (!schema) return

  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.setAttribute('data-schema-type', 'tool')
  script.textContent = JSON.stringify(schema)
  document.head.appendChild(script)
}

/**
 * Remove schema markup from page
 * Called when navigating to non-tool pages
 */
export function removeToolSchema() {
  const existing = document.querySelector('script[data-schema-type="tool"]')
  if (existing) {
    existing.remove()
  }
}
