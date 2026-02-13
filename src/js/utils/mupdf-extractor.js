/**
 * MuPDF.js extraction utilities
 * Handles PDF loading, structured text extraction, and image extraction with MuPDF
 *
 * DEBUG MODE: Set DEBUG_MODE = true below to see detailed extraction info in console
 */

import * as mupdf from 'mupdf'
import {
  calculateMedianFontSize,
  classifyLineType,
  groupIntoTextRuns,
  groupLinesIntoParagraphs
} from './format-detection.js'

// Debug mode - set to true to see detailed extraction info
const DEBUG_MODE = false // Set to true during development

/**
 * Check if WebAssembly is supported
 * @returns {boolean}
 */
export function isWasmSupported() {
  return typeof WebAssembly !== 'undefined'
}

/**
 * Load PDF with MuPDF
 * @param {ArrayBuffer} arrayBuffer - PDF file data
 * @returns {Promise<Object>} - MuPDF document object
 */
export async function loadPdfWithMuPDF(arrayBuffer) {
  try {
    // Create Uint8Array from ArrayBuffer
    const data = new Uint8Array(arrayBuffer)

    // Load document with MuPDF
    const doc = mupdf.Document.openDocument(data, "application/pdf")

    return doc
  } catch (error) {
    console.error('MuPDF load error:', error)
    throw new Error('Failed to load PDF with MuPDF: ' + error.message)
  }
}

/**
 * Extract structured text from a page using MuPDF
 * @param {Object} page - MuPDF page object
 * @param {number} pageNumber - Page number (1-indexed)
 * @returns {Object} - Structured text blocks
 */
export function extractStructuredText(page, pageNumber) {
  try {
    // Extract structured text with whitespace preservation
    const structuredText = page.toStructuredText("preserve-whitespace")

    return {
      pageNumber,
      blocks: structuredText.blocks || [],
      bbox: page.getBounds()
    }
  } catch (error) {
    console.error(`Failed to extract text from page ${pageNumber}:`, error)
    return {
      pageNumber,
      blocks: [],
      bbox: [0, 0, 0, 0]
    }
  }
}

/**
 * Process structured text blocks into formatted content
 * @param {Array} allPagesData - Array of page data with blocks
 * @returns {Array} - Processed content blocks ready for Word generation
 */
export function processStructuredTextBlocks(allPagesData) {
  const processedContent = []

  // Calculate median font size across all pages
  const allBlocks = allPagesData.flatMap(page => page.blocks)
  const medianSize = calculateMedianFontSize(allBlocks)

  if (DEBUG_MODE) {
    console.log('=== PDF to Word Debug Info ===')
    console.log('Total pages:', allPagesData.length)
    console.log('Total blocks:', allBlocks.length)
    console.log('Median font size:', medianSize)
  }

  // Process each page
  allPagesData.forEach(pageData => {
    const { pageNumber, blocks, bbox } = pageData
    const leftMargin = bbox ? bbox[0] : 0

    // Separate text and image blocks
    const textBlocks = []
    const imageBlocks = []

    blocks.forEach(block => {
      if (block.type === 'text') {
        textBlocks.push(block)
      } else if (block.type === 'image') {
        imageBlocks.push(block)
      }
    })

    // Process text blocks
    textBlocks.forEach(block => {
      if (!block.lines || block.lines.length === 0) return

      // Get Y position for sorting later
      const yPos = block.bbox ? block.bbox[1] : 0

      // Process each line
      block.lines.forEach(line => {
        if (!line.chars || line.chars.length === 0) return

        // Classify line type
        const lineType = classifyLineType(line, medianSize, leftMargin)

        // Group characters into styled text runs
        const textRuns = groupIntoTextRuns(line.chars)

        // Get line text
        const text = line.chars.map(c => c.c).join('')

        if (text.trim()) {
          processedContent.push({
            type: lineType,
            textRuns,
            text,
            yPos,
            pageNumber,
            bbox: line.bbox
          })
        }
      })
    })

    // Process image blocks
    imageBlocks.forEach((block, index) => {
      const yPos = block.bbox ? block.bbox[1] : 0

      processedContent.push({
        type: 'image',
        imageBlock: block,
        yPos,
        pageNumber,
        bbox: block.bbox,
        imageIndex: index
      })
    })
  })

  // Sort all content by Y position (top to bottom)
  processedContent.sort((a, b) => {
    // First by page number
    if (a.pageNumber !== b.pageNumber) {
      return a.pageNumber - b.pageNumber
    }
    // Then by Y position on page
    return a.yPos - b.yPos
  })

  // Group consecutive lines of same type into paragraphs
  const finalContent = []
  let currentParagraph = null

  processedContent.forEach(item => {
    if (item.type === 'paragraph') {
      // Group consecutive paragraph lines together
      if (currentParagraph && currentParagraph.type === 'paragraph') {
        // Check if close enough to be same paragraph (within ~1.5x line height)
        const prevY = currentParagraph.yPos
        const gap = Math.abs(item.yPos - prevY)

        if (gap < medianSize * 1.5) {
          // Merge into current paragraph
          currentParagraph.textRuns.push(...item.textRuns)
          currentParagraph.text += ' ' + item.text
        } else {
          // Start new paragraph
          finalContent.push(currentParagraph)
          currentParagraph = { ...item }
        }
      } else {
        // Close previous non-paragraph item
        if (currentParagraph) {
          finalContent.push(currentParagraph)
        }
        currentParagraph = { ...item }
      }
    } else {
      // Headings, lists, images - don't merge
      if (currentParagraph) {
        finalContent.push(currentParagraph)
        currentParagraph = null
      }
      finalContent.push(item)
    }
  })

  // Push final paragraph if exists
  if (currentParagraph) {
    finalContent.push(currentParagraph)
  }

  if (DEBUG_MODE) {
    const stats = {
      total: finalContent.length,
      headings: finalContent.filter(c => c.type.startsWith('heading')).length,
      paragraphs: finalContent.filter(c => c.type === 'paragraph').length,
      bullets: finalContent.filter(c => c.type === 'bullet').length,
      numbered: finalContent.filter(c => c.type === 'numbered').length,
      images: finalContent.filter(c => c.type === 'image').length
    }
    console.log('Format detection stats:', stats)
    console.log('Sample content items:', finalContent.slice(0, 5))
  }

  return finalContent
}

/**
 * Extract images from MuPDF document
 * Note: MuPDF.js image extraction API may vary by version
 * This is a placeholder - will need to adapt based on actual API
 * @param {Object} page - MuPDF page object
 * @param {Array} imageBlocks - Image blocks from structured text
 * @returns {Promise<Array>} - Array of image data objects
 */
export async function extractImages(page, imageBlocks) {
  const images = []

  // This is a simplified placeholder
  // Actual implementation depends on MuPDF.js API for image extraction
  // May need to use page.toPixmap() or similar methods

  for (let i = 0; i < imageBlocks.length; i++) {
    try {
      // Placeholder: attempt to extract image
      // Real implementation will use MuPDF API to get image data

      console.warn('MuPDF image extraction not yet implemented for block', i)

      // For now, return empty - will implement after testing basic text

    } catch (error) {
      console.warn(`Failed to extract image ${i}:`, error)
    }
  }

  return images
}
