# PDF to Word Formatting Fix - Design Document

**Date:** 2026-02-13
**Status:** Approved
**Author:** Claude Code

---

## Problem Statement

Current PDF to Word conversion produces poorly formatted output:
- No paragraph breaks (all text runs together)
- Missing section headings
- No bold/italic preservation
- Images not positioned correctly
- Every line becomes a separate paragraph

**Root Cause:** Current implementation uses only Y-coordinate positioning from PDF.js with fixed thresholds, ignoring rich font/style metadata that's available.

**User Requirement:** High-quality formatting preservation for CV conversion - "this is one of the main feature and we can not compromise on this"

---

## Research Findings: How iLovePDF Works

Commercial PDF converters like iLovePDF use **server-side processing** with:
- Native PDF libraries (Apache PDFBox, Aspose.PDF)
- Proprietary algorithms for layout analysis
- 90-95% formatting accuracy
- 3-30 second processing time (including upload/download)

**Our Constraint:** Must remain 100% client-side ($0 server costs)

**Realistic Goal:** Achieve 85-92% accuracy with client-side WebAssembly approach

---

## Design Overview

### Architecture

**New Tech Stack:**
- **MuPDF.js** (WebAssembly) - Advanced PDF parsing with structured text extraction
- **docx** (existing) - Word document generation
- **PDF.js** (keep for preview only) - Thumbnail rendering

**High-Level Flow:**
```
1. User uploads PDF
2. Load file into ArrayBuffer
3. Parse with MuPDF.js → structured text + images with style metadata
4. Analyze structure: detect headings, paragraphs, lists, bold/italic
5. Sort content by Y-position (maintain visual order)
6. Build Word document with proper formatting
7. Generate .docx and download
```

**Key Decisions:**
- MuPDF.js over PDF.js for parsing (richer metadata, better structure)
- Keep PDF.js for preview rendering (already working)
- Client-side processing maintained (+2-3MB bundle acceptable)
- Processing time: 5-15 seconds per page (acceptable for quality)

---

## Technical Design

### 1. MuPDF.js Structured Text API

MuPDF provides hierarchical structure:

```javascript
const structuredText = page.toStructuredText("preserve-whitespace")

// Returns:
{
  blocks: [
    {
      type: "text",
      bbox: [x0, y0, x1, y1],
      lines: [
        {
          bbox: [x0, y0, x1, y1],
          dir: [1, 0],
          wmode: 0,
          chars: [
            {
              c: "H",              // Character
              origin: [x, y],      // Position
              bbox: [x0, y0, x1, y1],
              font: "Arial-BoldMT", // Font name!
              size: 18.0           // Font size in points!
            }
          ]
        }
      ]
    },
    {
      type: "image",
      bbox: [x0, y0, x1, y1],
      transform: [a, b, c, d, e, f]
    }
  ]
}
```

### 2. Format Detection Rules

**Heading Detection:**
```
1. Calculate median font size for entire document
2. IF line fontSize > median * 1.5 → HEADING_1
3. IF line fontSize > median * 1.3 → HEADING_2
4. IF line fontSize > median * 1.1 → HEADING_3
5. Consider: all-caps, position at block start
```

**Bold/Italic Detection:**
```
Check font name patterns:
- Contains "Bold", "Heavy", "Black" → Bold
- Contains "Italic", "Oblique" → Italic
- Both patterns → Bold + Italic
Apply to individual TextRuns within paragraphs
```

**Paragraph Detection:**
```
1. Group lines by vertical proximity
2. IF vertical gap > fontSize * 1.2 → new paragraph
3. IF line has significant indent → continuation or new para
4. Preserve natural line breaks within paragraphs
```

**List Detection:**
```
1. Check line starts with bullet chars: •, ○, ▪, -, *
2. Check X-position indent (> 20px from left margin)
3. Group consecutive indented lines as list
4. Detect numbered lists: 1., 2., a), (i), etc.
```

**Text Runs (Styled Text):**
```
1. Track font changes within a line
2. Split into TextRun objects on font change
3. Example: "This is **bold** text"
   → TextRun("This is ", normal)
   → TextRun("bold", bold=true)
   → TextRun(" text", normal)
```

### 3. Image Handling

**Image Extraction:**
```
1. MuPDF structured text includes image blocks with bbox
2. Extract image data via MuPDF API or fallback to PDF.js
3. Store: { imageBlob, bbox, pageNumber }
```

**Image Positioning:**
```
1. Combine text blocks + image blocks
2. Sort ALL blocks by Y-position (top to bottom)
3. Process in order to maintain document flow
4. Images inserted as ImageRun at correct position
```

**Image Sizing:**
```
1. Use original pixel dimensions
2. IF width > 600px → scale down, maintain aspect ratio
3. Center or left-align based on X-position in PDF
```

### 4. Processing Pipeline

```
Step 1: Load PDF with MuPDF.js
Step 2: For each page:
  2a. Extract structured text blocks (positions + styles)
  2b. Extract image blocks (positions + data)
  2c. Combine and sort by Y-position
Step 3: Analyze text to calculate baseline font sizes
Step 4: Process each block in sorted order:
  - Text block → classify type, extract styled runs
  - Image block → extract image data, calculate size
Step 5: Build Word document with formatted content
Step 6: Generate .docx blob and trigger download
```

### 5. Word Document Generation

**Mapping to Word Elements:**

```javascript
// Headings
fontSize > median * 1.5 → HeadingLevel.HEADING_1
fontSize > median * 1.3 → HeadingLevel.HEADING_2
fontSize > median * 1.1 → HeadingLevel.HEADING_3

// Paragraphs with styled runs
new Paragraph({
  children: [
    new TextRun({ text: "Normal " }),
    new TextRun({ text: "bold", bold: true }),
    new TextRun({ text: " text" })
  ],
  spacing: { after: 200 }
})

// Lists
new Paragraph({
  text: "List item",
  bullet: { level: 0 },
  spacing: { after: 100 }
})

// Images
new Paragraph({
  children: [
    new ImageRun({
      data: imageArrayBuffer,
      transformation: { width, height }
    })
  ],
  spacing: { before: 120, after: 120 }
})
```

**Spacing Strategy:**

```javascript
// Headings
spacing: { before: 240, after: 120 }  // 12pt before, 6pt after

// Body paragraphs
spacing: { after: 200 }  // 10pt after

// List items
spacing: { after: 100 }  // 5pt after (tighter)

// Images
spacing: { before: 120, after: 120 }  // 6pt before/after
```

**Font Mapping:**

```javascript
const fontMapping = {
  "Arial": "Arial",
  "Helvetica": "Arial",
  "Times": "Times New Roman",
  "TimesNewRoman": "Times New Roman",
  "Courier": "Courier New",
  default: "Calibri"
}
```

---

## Error Handling & Edge Cases

### Browser Compatibility

```javascript
// Check WebAssembly support
if (typeof WebAssembly === 'undefined') {
  showError("Your browser doesn't support advanced PDF processing. Try Chrome or Firefox.")
  return
}

// Load MuPDF WASM
try {
  await MuPDF.ready
} catch (error) {
  // Fallback to current PDF.js approach (degraded quality)
  return fallbackToPdfJs()
}
```

### File Processing Errors

```javascript
const ERROR_MESSAGES = {
  CORRUPTED: "This PDF appears to be corrupted.",
  NO_TEXT: "This PDF contains no selectable text. Use OCR tool first.",
  TOO_LARGE: "File exceeds 50MB limit.",
  BROWSER: "Browser doesn't support advanced processing.",
  UNKNOWN: "Conversion failed. Try a different file."
}
```

### Fallback Strategy

```javascript
async function convertPdfToWord(file) {
  try {
    return await convertWithMuPDF(file)
  } catch (mupdfError) {
    console.warn("MuPDF failed, using fallback:", mupdfError)
    try {
      const result = await convertWithPdfJs(file)
      showWarning("Used basic conversion. Formatting may be limited.")
      return result
    } catch (fallbackError) {
      throw new Error("Conversion failed: " + fallbackError.message)
    }
  }
}
```

### Memory Management

```javascript
// Process large files in batches
const BATCH_SIZE = 5

for (let i = 0; i < pageCount; i += BATCH_SIZE) {
  const batch = await processPages(i, Math.min(i + BATCH_SIZE, pageCount))
  allContent.push(...batch)

  // Allow garbage collection
  await new Promise(resolve => setTimeout(resolve, 100))
}

// Always cleanup
try {
  // ... processing
} finally {
  if (mupdfDoc) mupdfDoc.destroy()
}
```

### Edge Cases

**Multi-Column Layouts:**
```
Sort blocks by Y-position THEN X-position
- Group into horizontal bands (same Y range)
- Within band, sort left-to-right
- Preserves "Name | Contact" header structure
```

**Empty Pages:**
```
Skip pages with no text AND no images
Don't add "Page X" heading for empty pages
```

**Image Extraction Failures:**
```
Skip failed images, continue processing
Log: "Failed to extract image X on page Y"
Include in success: "Converted with X/Y images"
```

---

## Testing Strategy

### Manual Testing

**Primary Test Case:**
- File: `/Users/sabuj.mondal/Downloads/SABUJ_MONDAL_CV_2.pdf`
- Verify: paragraphs, headings, bold, bullets, images preserved
- Visual comparison with original

**Additional Test Documents:**
- Simple CV (1 page, basic formatting)
- Complex CV (multi-column, images, mixed fonts)
- Resume with tables
- Document with bullet lists

### Debug Mode

```javascript
if (DEBUG_MODE) {
  console.log("Format detection results:", {
    headings: headings.length,
    paragraphs: paragraphs.length,
    lists: lists.length,
    images: images.length,
    fontAnalysis: { medianSize, boldCount, italicCount }
  })
}
```

### Success Criteria

**Must Have:**
- ✅ Paragraphs properly grouped
- ✅ Heading detection (1-2 levels minimum)
- ✅ Bold text preserved
- ✅ Images in correct position
- ✅ No stuck loading spinner
- ✅ No validation errors on valid PDFs

**Should Have:**
- ✅ Italic text detection
- ✅ Bullet list detection
- ✅ Multi-level headings (H1, H2, H3)
- ✅ Proper spacing between sections
- ✅ Font sizes preserved

**Nice to Have:**
- ✅ Numbered lists
- ✅ Text alignment (center, right)
- ✅ Multi-column layout handling

### Acceptance Test

```
Given: User's CV (SABUJ_MONDAL_CV_2.pdf)
When: Converted to Word
Then:
  - Name/header larger (heading)
  - Section titles are headings
  - Job descriptions are paragraphs
  - Bullet points render as bullets
  - Bold job titles preserved
  - Photo appears in correct position
  - Readable, not wall of text
```

### Performance Targets

```
Bundle size increase: +2-3MB (acceptable)
Conversion time: 5-15 seconds per page (acceptable)
Memory usage: <500MB for typical CV (acceptable)
Browser support: Chrome/Firefox/Safari/Edge (95%+ coverage)
```

---

## Implementation Strategy

### Phase 1: Add MuPDF.js
- Install `mupdf-js` package
- Create new extraction functions
- Keep old PDF.js functions as fallback
- No breaking changes to other tools

### Phase 2: Test Thoroughly
- Test with user's CV first
- Test with 5-10 different documents
- Verify fallback mechanism
- Check bundle size impact

### Phase 3: Deploy
- Update warning banner to reflect better quality
- Monitor for errors
- Collect user feedback

### Rollback Plan

```javascript
// Feature flag for easy rollback
const USE_MUPDF = true

async function convertPdfToWord(file) {
  if (USE_MUPDF) {
    return await convertWithMuPDF(file)
  } else {
    return await convertWithPdfJs(file) // Old implementation
  }
}
```

---

## Quality Improvements Over Current Implementation

| Aspect | Current | New |
|--------|---------|-----|
| Text grouping | Every line = paragraph | Smart paragraph detection |
| Headings | None | Multi-level heading detection |
| Bold/Italic | None | Font-based style detection |
| Lists | None | Bullet & numbered lists |
| Images | At end of document | Correct position in flow |
| Spacing | Fixed 80pt | Adaptive by content type |
| Accuracy | ~60% | ~85-92% |

---

## Expected Outcomes

**User Experience:**
- CVs look professional after conversion
- Minimal manual reformatting needed
- Natural paragraph flow preserved
- Visual hierarchy maintained (headings stand out)

**Technical Metrics:**
- 85-92% formatting accuracy (vs 60% current)
- 5-15 seconds conversion time (acceptable)
- +2-3MB bundle size (acceptable for quality gain)
- Maintains $0 server costs

**Business Impact:**
- Competitive with paid services for CV conversion
- High user satisfaction on core feature
- Foundation for future improvements

---

## Next Steps

1. Create detailed implementation plan (writing-plans skill)
2. Install and configure MuPDF.js
3. Implement format detection algorithms
4. Build Word generation with styling
5. Test with user's CV and iterate
6. Deploy and monitor

---

**Design Approved By:** User (2026-02-13)
