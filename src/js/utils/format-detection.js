/**
 * Format detection utilities for PDF to Word conversion
 * Analyzes MuPDF structured text to detect headings, paragraphs, lists, and styles
 */

// Format detection thresholds
const INDENTATION_THRESHOLD = 20  // Minimum indent in points to consider as list
const HEADING_1_THRESHOLD = 1.5   // Font size multiplier for H1
const HEADING_2_THRESHOLD = 1.3   // Font size multiplier for H2
const HEADING_3_THRESHOLD = 1.1   // Font size multiplier for H3
const PARAGRAPH_GAP_THRESHOLD = 1.2  // Line spacing multiplier for paragraph breaks

/**
 * Calculate median font size from all text blocks
 * @param {Array} blocks - Array of text blocks from MuPDF
 * @returns {number} - Median font size in points
 */
export function calculateMedianFontSize(blocks) {
  const fontSizes = []

  blocks.forEach(block => {
    if (block.type !== 'text') return

    block.lines?.forEach(line => {
      line.chars?.forEach(char => {
        if (char.size) {
          fontSizes.push(char.size)
        }
      })
    })
  })

  if (fontSizes.length === 0) return 12 // Default fallback

  fontSizes.sort((a, b) => a - b)
  const mid = Math.floor(fontSizes.length / 2)
  return fontSizes.length % 2 === 0
    ? (fontSizes[mid - 1] + fontSizes[mid]) / 2
    : fontSizes[mid]
}

/**
 * Detect if font name indicates bold style
 * @param {string} fontName - Font name from MuPDF
 * @returns {boolean}
 */
export function isBoldFont(fontName) {
  if (!fontName) return false
  const lower = fontName.toLowerCase()
  return lower.includes('bold') || lower.includes('heavy') || lower.includes('black')
}

/**
 * Detect if font name indicates italic style
 * @param {string} fontName - Font name from MuPDF
 * @returns {boolean}
 */
export function isItalicFont(fontName) {
  if (!fontName) return false
  const lower = fontName.toLowerCase()
  return lower.includes('italic') || lower.includes('oblique')
}

/**
 * Detect if line is a bullet point
 * @param {string} text - Line text
 * @param {number} xPos - X position of line start
 * @param {number} leftMargin - Left margin of page
 * @returns {boolean}
 */
export function isBulletPoint(text, xPos, leftMargin = 0) {
  if (!text) return false

  // Check for bullet characters at start
  const bulletChars = ['•', '○', '▪', '■', '◆', '▸', '-', '*']
  const firstChar = text.trim().charAt(0)

  // Must have bullet char AND be indented
  return bulletChars.includes(firstChar) && (xPos - leftMargin) > INDENTATION_THRESHOLD
}

/**
 * Detect if line is a numbered list item
 * @param {string} text - Line text
 * @param {number} xPos - X position of line start
 * @param {number} leftMargin - Left margin of page
 * @returns {boolean}
 */
export function isNumberedList(text, xPos, leftMargin = 0) {
  if (!text) return false

  const trimmed = text.trim()

  // Patterns: "1.", "1)", "a)", "i.", "(1)", etc.
  const patterns = [
    /^\d+\./,           // 1.
    /^\d+\)/,           // 1)
    /^[a-z]\)/,         // a)
    /^[ivx]+\./i,       // i., ii., iii.
    /^\(\d+\)/,         // (1)
    /^\([a-z]\)/        // (a)
  ]

  const hasNumberPattern = patterns.some(pattern => pattern.test(trimmed))

  // Must have number pattern AND be indented
  return hasNumberPattern && (xPos - leftMargin) > INDENTATION_THRESHOLD
}

/**
 * Classify line type based on font size and content
 * @param {Object} line - Line object with chars array
 * @param {number} medianSize - Median font size for document
 * @param {number} leftMargin - Left margin of page
 * @returns {string} - Type: 'heading1', 'heading2', 'heading3', 'bullet', 'numbered', 'paragraph'
 */
export function classifyLineType(line, medianSize, leftMargin = 0) {
  if (!line.chars || line.chars.length === 0) return 'paragraph'

  // Calculate average font size for this line
  const avgSize = line.chars.reduce((sum, char) => sum + (char.size || 0), 0) / line.chars.length

  // Get line text and position
  const text = line.chars.map(c => c.c).join('')
  const xPos = line.bbox ? line.bbox[0] : 0

  // Check for lists first
  if (isBulletPoint(text, xPos, leftMargin)) {
    return 'bullet'
  }

  if (isNumberedList(text, xPos, leftMargin)) {
    return 'numbered'
  }

  // Check for headings by font size
  if (avgSize > medianSize * HEADING_1_THRESHOLD) {
    return 'heading1'
  }

  if (avgSize > medianSize * HEADING_2_THRESHOLD) {
    return 'heading2'
  }

  if (avgSize > medianSize * HEADING_3_THRESHOLD) {
    return 'heading3'
  }

  return 'paragraph'
}

/**
 * Group characters into text runs based on font changes
 * @param {Array} chars - Array of character objects from MuPDF
 * @returns {Array} - Array of {text, bold, italic, size}
 */
export function groupIntoTextRuns(chars) {
  if (!chars || chars.length === 0) return []

  const runs = []
  let currentRun = {
    text: '',
    bold: isBoldFont(chars[0].font),
    italic: isItalicFont(chars[0].font),
    size: chars[0].size,
    font: chars[0].font
  }

  chars.forEach(char => {
    const charBold = isBoldFont(char.font)
    const charItalic = isItalicFont(char.font)

    // If style or size changes, start new run
    if (charBold !== currentRun.bold || charItalic !== currentRun.italic || char.size !== currentRun.size) {
      if (currentRun.text) {
        runs.push({ ...currentRun })
      }
      currentRun = {
        text: char.c,
        bold: charBold,
        italic: charItalic,
        size: char.size,
        font: char.font
      }
    } else {
      currentRun.text += char.c
    }
  })

  // Push final run
  if (currentRun.text) {
    runs.push(currentRun)
  }

  return runs
}

/**
 * Group lines into paragraphs based on vertical spacing
 * @param {Array} lines - Array of line objects
 * @param {number} medianSize - Median font size
 * @returns {Array} - Array of paragraph objects with lines
 */
export function groupLinesIntoParagraphs(lines, medianSize) {
  if (!lines || lines.length === 0) return []

  const paragraphs = []
  let currentParagraph = { lines: [] }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const nextLine = lines[i + 1]

    currentParagraph.lines.push(line)

    if (!nextLine) {
      // Last line - close paragraph
      if (currentParagraph.lines.length > 0) {
        paragraphs.push(currentParagraph)
      }
      break
    }

    // Calculate vertical gap to next line
    const currentY = line.bbox ? line.bbox[3] : 0  // Bottom of current line
    const nextY = nextLine.bbox ? nextLine.bbox[1] : 0  // Top of next line
    const gap = Math.abs(nextY - currentY)

    // If gap is significant, start new paragraph
    const threshold = medianSize * PARAGRAPH_GAP_THRESHOLD
    if (gap > threshold) {
      paragraphs.push(currentParagraph)
      currentParagraph = { lines: [] }
    }
  }

  return paragraphs
}
