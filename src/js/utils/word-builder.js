/**
 * Word document builder utilities
 * Builds .docx documents from processed PDF content with proper formatting
 */

import { Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel } from 'docx'

/**
 * Map heading type to Word HeadingLevel
 * @param {string} type - Content type
 * @returns {HeadingLevel|null}
 */
function getHeadingLevel(type) {
  switch (type) {
    case 'heading1':
      return HeadingLevel.HEADING_1
    case 'heading2':
      return HeadingLevel.HEADING_2
    case 'heading3':
      return HeadingLevel.HEADING_3
    default:
      return null
  }
}

/**
 * Create Word paragraph from processed content item
 * @param {Object} item - Processed content item
 * @returns {Paragraph}
 */
function createParagraph(item) {
  const headingLevel = getHeadingLevel(item.type)

  // Headings
  if (headingLevel) {
    return new Paragraph({
      text: item.text,
      heading: headingLevel,
      spacing: { before: 240, after: 120 }
    })
  }

  // Bullet lists
  if (item.type === 'bullet') {
    // Remove bullet character from text
    const text = item.text.replace(/^[•○▪■◆▸\-\*]\s*/, '')

    return new Paragraph({
      text: text,
      bullet: { level: 0 },
      spacing: { after: 100 }
    })
  }

  // Numbered lists
  if (item.type === 'numbered') {
    // Remove number from text
    const text = item.text.replace(/^(\d+[\.\)]|\([a-z0-9]+\)|[a-z]\))\s*/i, '')

    return new Paragraph({
      text: text,
      numbering: { reference: 'default-numbering', level: 0 },
      spacing: { after: 100 }
    })
  }

  // Regular paragraphs with styled text runs
  if (item.textRuns && item.textRuns.length > 0) {
    const textRunElements = item.textRuns.map(run => {
      return new TextRun({
        text: run.text,
        bold: run.bold || false,
        italics: run.italic || false,
        size: run.size ? Math.round(run.size * 2) : undefined // Convert points to half-points
      })
    })

    return new Paragraph({
      children: textRunElements,
      spacing: { after: 200 }
    })
  }

  // Fallback: plain text paragraph
  return new Paragraph({
    text: item.text || '',
    spacing: { after: 200 }
  })
}

/**
 * Create Word paragraph with image
 * @param {Object} imageData - Image data object
 * @returns {Paragraph}
 */
async function createImageParagraph(imageData) {
  try {
    const { blob, width, height } = imageData

    // Convert blob to ArrayBuffer
    const arrayBuffer = await blob.arrayBuffer()

    // Scale if too wide
    let finalWidth = width
    let finalHeight = height

    if (finalWidth > 600) {
      const scale = 600 / finalWidth
      finalWidth = 600
      finalHeight = Math.round(finalHeight * scale)
    }

    return new Paragraph({
      children: [
        new ImageRun({
          data: arrayBuffer,
          transformation: {
            width: finalWidth,
            height: finalHeight
          }
        })
      ],
      spacing: { before: 120, after: 120 }
    })
  } catch (error) {
    console.warn('Failed to create image paragraph:', error)
    // Return placeholder paragraph
    return new Paragraph({
      text: '[Image could not be embedded]',
      spacing: { after: 120 }
    })
  }
}

/**
 * Build Word document from processed content
 * @param {Array} processedContent - Array of processed content items
 * @param {Object} imageDataMap - Map of imageIndex to image data
 * @returns {Promise<Document>}
 */
export async function buildWordDocument(processedContent, imageDataMap = {}) {
  const children = []

  for (const item of processedContent) {
    if (item.type === 'image') {
      // Handle image
      const imageData = imageDataMap[item.imageIndex]
      if (imageData) {
        const imageParagraph = await createImageParagraph(imageData)
        children.push(imageParagraph)
      }
    } else {
      // Handle text content (headings, paragraphs, lists)
      const paragraph = createParagraph(item)
      children.push(paragraph)
    }
  }

  // Create document
  return new Document({
    sections: [
      {
        children,
        properties: {
          page: {
            margin: {
              top: 720,    // 0.5 inch
              right: 720,
              bottom: 720,
              left: 720
            }
          }
        }
      }
    ]
  })
}

/**
 * Generate .docx blob from Word document
 * @param {Document} doc - Word document
 * @returns {Promise<Blob>}
 */
export async function generateDocxBlob(doc) {
  return await Packer.toBlob(doc)
}
