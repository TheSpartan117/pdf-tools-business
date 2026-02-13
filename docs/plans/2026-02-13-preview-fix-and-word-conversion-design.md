# Preview Fix and Word Conversion Features Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix preview/OCR rendering issues and add bidirectional Word ↔ PDF conversion features.

**Architecture:** Fix PDF.js worker configuration to use local module instead of CDN, implement text+image extraction for PDF→Word, and implement HTML-based rendering for Word→PDF.

**Tech Stack:**
- PDF.js 5.4.624 (with local worker)
- `docx` library for .docx file creation
- `mammoth.js` for .docx parsing
- `jspdf` + `html2canvas` for PDF generation

---

## Problem Statement

### Issue 1: Preview and OCR Not Working
**Root Cause:** PDF.js worker configured to load from CDN using dynamic version URL. The CDN may not have exact version (5.4.624), causing silent worker failures.

**Affected Components:**
- Preview thumbnails in all tools (merge, split, compress, rotate)
- OCR canvas generation in OCR tool
- Live rotation preview in rotate tool

**Current Problematic Code (3 locations):**
```javascript
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
```

### Issue 2: Missing Word Conversion Features
Users need to convert between PDF and Word formats while maintaining free, client-side processing model.

**Constraints:**
- Must remain 100% client-side (no server costs)
- Must be honest about format conversion limitations
- Should preserve text and images where possible
- Layout/formatting preservation is secondary

---

## Solution 1: PDF.js Worker Fix

### Technical Approach
Replace CDN worker URLs with Vite-resolved local module paths. This ensures worker version always matches installed package.

### Implementation

**Files to Modify:**
1. `/src/js/utils/preview-renderer.js` (line 4)
2. `/src/js/tools/rotate.js` (line 9)
3. `/src/js/tools/ocr.js` (line 9)

**Code Change:**
```javascript
// OLD (CDN-based, unreliable):
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

// NEW (local module, reliable):
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href
```

### Why This Works
- Vite's `new URL(..., import.meta.url)` resolves to node_modules at build time
- Worker version guaranteed to match pdfjs-dist package version
- No external CDN dependency

### Testing Plan
1. Upload PDF to merge tool → verify 80px thumbnails render
2. Upload PDF to split tool → verify 150px preview renders
3. Upload PDF to compress tool → verify 150px preview renders
4. Upload PDF to rotate tool → verify 250px preview renders and updates on rotation angle change
5. Upload PDF to OCR tool → verify 150px preview renders and text extraction works
6. Check browser console for worker errors (should be none)

---

## Solution 2: PDF to Word Conversion

### Architecture

**Text Extraction:**
- Use `page.getTextContent()` - returns text items with positions
- Group by vertical position into paragraphs
- Preserves actual embedded text (no OCR guessing)

**Image Extraction:**
- Use `page.getOperatorList()` - finds image draw operations
- Extract raw image data via `page.objs.get(imageId)`
- Convert to PNG blobs for Word embedding

**Word Document Generation:**
- Use `docx` library to build .docx structure
- Add page headings, text paragraphs, embedded images
- Output as downloadable .docx file

### Data Flow
```
PDF Upload
  ↓
PDF.js Load Document
  ↓
For Each Page:
  ├─→ getTextContent() → Parse text items → Group into paragraphs
  └─→ getOperatorList() → Find images → Extract image data
  ↓
Build Word Document (docx library)
  ├─→ Add page headings
  ├─→ Add text paragraphs
  └─→ Embed images
  ↓
Generate .docx blob
  ↓
Download: filename_to-word.docx
```

### Format Preservation

**What Works:**
- ✅ Embedded text (100% accurate, not OCR)
- ✅ Images (preserved quality)
- ✅ Page structure (one section per page)
- ✅ Paragraph breaks

**What Doesn't Work:**
- ❌ Tables (become plain text)
- ❌ Columns (linearized left-to-right)
- ❌ Text positioning/layout
- ❌ Fonts and styles (bold, italic, sizes lost)
- ❌ Headers/footers as separate entities
- ❌ Scanned PDFs (requires OCR tool instead)

### UI Design

**Layout Pattern:** Single-file upload (like split/compress/rotate tools)

**Upload Section:**
```
┌─────────────────────────────────┐
│  📄 Upload PDF                   │
│  Drop PDF here or click to browse│
│                                  │
│  After upload:                  │
│  ┌─────────┐                    │
│  │ Preview │  filename.pdf       │
│  │ 150px   │  X pages            │
│  └─────────┘                    │
└─────────────────────────────────┘
```

**Warning Banner:**
```
⚠️ PDF to Word Converter
- Only works with PDFs containing selectable text (not scanned images)
- Extracts text and images but does NOT preserve:
  • Layout and formatting
  • Tables and columns
  • Fonts and text styles
  • Headers and footers
For scanned PDFs, use the OCR tool first.
```

**Action Buttons:**
- Primary: "Convert to Word"
- Secondary: "Start Over"

**Processing:**
- Loading spinner with: "Processing page X of Y..."
- Progress updates during extraction

**Output:**
- Auto-download .docx file
- Filename: `originalname_to-word.docx`
- Success message: "PDF converted to Word! X pages processed."

### File Structure
```
/src/js/tools/pdf-to-word.js (new)
  ├─ initPdfToWordTool(container)
  ├─ handleFileUpload(file, uploadSection)
  ├─ convertPdfToWord(pdfFile, container, fileName)
  ├─ extractTextFromPage(page)
  ├─ extractImagesFromPage(page, pageNumber)
  └─ buildWordDocument(pagesData)
```

### Dependencies
```bash
npm install docx
```

### Implementation Notes

**Text Grouping Algorithm:**
```javascript
// getTextContent() returns items like:
// [{ str: "Hello", transform: [1,0,0,1,50,700] }, ...]
// transform[5] is Y position

// Group items by Y position (±2px tolerance for same line)
// Then group lines into paragraphs (larger Y gaps = new paragraph)
```

**Image Extraction:**
```javascript
// getOperatorList() finds paintImageXObject operations
// Extract using:
const imageId = operatorList.argsArray[i][0]
const image = await page.objs.get(imageId)
// Convert to blob and embed in Word doc
```

---

## Solution 3: Word to PDF Conversion

### Architecture

**Word Processing:**
- Use `mammoth.js` to convert .docx to clean HTML
- Extracts text, images, basic formatting
- Lighter and cleaner than `docx-preview`

**PDF Generation:**
- Render HTML to hidden DOM container
- Use `html2canvas` to capture as canvas images
- Feed canvas to `jsPDF` page-by-page
- Auto-calculate page breaks

### Data Flow
```
.docx Upload
  ↓
mammoth.convertToHtml()
  ↓
Clean HTML Output
  ├─→ Text content
  ├─→ Images (embedded as data URIs)
  └─→ Basic formatting (bold, italic, lists)
  ↓
Render HTML to hidden container
  ↓
html2canvas → Capture as images
  ↓
jsPDF → Add images as PDF pages
  ↓
Download: filename_to-pdf.pdf
```

### Format Preservation

**What Works:**
- ✅ Text content and order
- ✅ Images (embedded and positioned)
- ✅ Basic formatting (bold, italic, underline)
- ✅ Lists and paragraphs
- ✅ Line breaks

**What Partially Works:**
- ⚠️ Tables (rendered but may not be pixel-perfect)
- ⚠️ Page breaks (calculated automatically, may differ)

**What Doesn't Work:**
- ❌ Exact fonts (fallback to PDF standard fonts)
- ❌ Precise spacing and layout
- ❌ Headers and footers (included in body)
- ❌ Complex Word features (SmartArt, charts, etc.)

### UI Design

**Upload Section:**
```
┌─────────────────────────────────┐
│  📄 Upload Word Document         │
│  Drop .docx here or click        │
│                                  │
│  After upload:                  │
│  📄 filename.docx                │
│     Size: XX KB                  │
└─────────────────────────────────┘
```

**Warning Banner:**
```
⚠️ Word to PDF Converter
- Basic formatting preserved (bold, italic, lists)
- Images included
- Complex layouts may be simplified
- Fonts may differ from original
```

**Action Buttons:**
- Primary: "Convert to PDF"
- Secondary: "Start Over"

**Processing:**
- "Converting to HTML..."
- "Rendering pages..."
- "Generating PDF..."

**Output:**
- Auto-download PDF
- Filename: `originalname_to-pdf.pdf`

### File Structure
```
/src/js/tools/word-to-pdf.js (new)
  ├─ initWordToPdfTool(container)
  ├─ handleFileUpload(file, uploadSection)
  ├─ convertWordToPdf(wordFile, container, fileName)
  ├─ renderHtmlToPdf(htmlContent, fileName)
  └─ splitIntoPages(container, maxHeight)
```

### Dependencies
```bash
npm install mammoth jspdf html2canvas
```

### Implementation Notes

**File Validation:**
```javascript
function validateWordFile(file) {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword' // .doc support if possible
  ]
  return validTypes.includes(file.type) || file.name.endsWith('.docx')
}
```

**Page Break Strategy:**
- Render HTML to container with A4 dimensions (210mm × 297mm)
- Calculate pixel height based on 96 DPI
- Capture in chunks that fit A4 pages
- Add each chunk as new PDF page

---

## Navigation Updates

### Add to Main Menu

Update `/src/js/main.js` to add two new routes:

```javascript
// Add to routes object:
'pdf-to-word': () => import('./tools/pdf-to-word.js').then(m => m.initPdfToWordTool),
'word-to-pdf': () => import('./tools/word-to-pdf.js').then(m => m.initWordToPdfTool),

// Add to navigation items:
{ id: 'pdf-to-word', label: 'PDF to Word', icon: '📄→📝' },
{ id: 'word-to-pdf', label: 'Word to PDF', icon: '📝→📄' },
```

**Menu Placement:**
Group conversion tools together for better UX:
```
[Merge PDF]
[Split PDF]
[Compress PDF]
[Rotate PDF]
─────────────
[PDF to Images]
[Images to PDF]
[PDF to Word]    ← New
[Word to PDF]    ← New
─────────────
[OCR]
```

---

## Testing Strategy

### Manual Testing

**Preview Fix Testing:**
1. Open each tool (merge, split, compress, rotate, OCR)
2. Upload sample PDF
3. Verify preview thumbnail renders correctly
4. Check browser console for errors (should be none)
5. Test rotate tool: change angles, verify live preview updates

**PDF to Word Testing:**
1. Test with text-based PDF (e.g., generated from Word)
   - Verify text extracted correctly
   - Verify images included
   - Open .docx in Word/Google Docs to confirm
2. Test with PDF containing no images
   - Verify text-only Word doc created
3. Test with scanned PDF (all images, no text)
   - Should extract 0 text, show appropriate message
4. Test with multi-page PDF (5-10 pages)
   - Verify all pages processed
   - Verify page headings present

**Word to PDF Testing:**
1. Test with simple Word doc (text only)
   - Verify PDF renders all text
2. Test with Word doc containing images
   - Verify images included in PDF
3. Test with formatted Word doc (bold, italic, lists)
   - Verify basic formatting preserved
4. Test with multi-page Word doc
   - Verify page breaks calculated reasonably

### Browser Compatibility
- Chrome/Edge (primary)
- Firefox
- Safari

### File Size Testing
- Small files: <1MB (should be fast)
- Medium files: 1-10MB (acceptable performance)
- Large files: >10MB (may be slow, but should work)

---

## Error Handling

### Preview Fix
```javascript
// Already has good error handling in preview-renderer.js
// Worker errors will now be eliminated
```

### PDF to Word
```javascript
// Handle PDFs with no text:
if (allText.trim().length === 0) {
  showError('This PDF contains no selectable text. Try the OCR tool for scanned documents.', container)
  return
}

// Handle extraction errors:
catch (error) {
  console.error('PDF to Word error:', error)
  showError('Failed to convert PDF to Word. The PDF may be corrupted or password-protected.', container)
}
```

### Word to PDF
```javascript
// Handle invalid file types:
if (!validateWordFile(file)) {
  showError('Please upload a valid .docx file', container)
  return
}

// Handle mammoth conversion errors:
catch (error) {
  console.error('Word to PDF error:', error)
  showError('Failed to convert Word to PDF. The file may be corrupted or use unsupported features.', container)
}
```

---

## Implementation Order

1. **Fix PDF.js Worker** (5 min)
   - Update 3 files with single line change
   - Test all previews working

2. **PDF to Word** (2-3 hours)
   - Install `docx` dependency
   - Create new tool file
   - Implement text extraction
   - Implement image extraction
   - Build Word document generation
   - Add navigation/routing
   - Test thoroughly

3. **Word to PDF** (2-3 hours)
   - Install dependencies (`mammoth`, `jspdf`, `html2canvas`)
   - Create new tool file
   - Implement Word parsing
   - Implement HTML to PDF rendering
   - Add navigation/routing
   - Test thoroughly

**Total Estimated Time:** 4-6 hours

---

## Success Criteria

### Preview Fix
- ✅ All tool previews render without errors
- ✅ OCR canvas generation works
- ✅ Rotate live preview updates work
- ✅ No console errors related to PDF.js worker

### PDF to Word
- ✅ Extracts text from text-based PDFs
- ✅ Includes images in Word document
- ✅ Generates valid .docx files that open in Word/Google Docs
- ✅ Shows appropriate error for scanned PDFs
- ✅ Uses smart filename convention

### Word to PDF
- ✅ Converts .docx to PDF successfully
- ✅ Preserves basic text formatting
- ✅ Includes images
- ✅ Generates valid PDF files
- ✅ Uses smart filename convention

### Overall
- ✅ All tools remain 100% client-side
- ✅ No new server costs
- ✅ Clear user communication about limitations
- ✅ Consistent UI/UX with existing tools

---

## Future Enhancements (Out of Scope)

- Better table preservation in PDF→Word
- Layout analysis for column detection
- Font preservation in Word→PDF
- Batch conversion support
- Progress bars for large files
- Preview of output before download
- Format options (page size, margins for Word→PDF)
