# PDF Tools UX Improvements Design

**Date:** 2026-02-13

**Goal:** Enhance user experience with smart downloads, better file naming, compressed layout, document previews, new conversion tools, and OCR capabilities.

## User Requirements

1. **Smart Downloads:** Compress tool should not auto-download if compression fails or doesn't reduce file size
2. **Better File Naming:** Downloads should use format `originalfilename_taskname.pdf` instead of generic names
3. **Compact Landing Page:** Reduce vertical space, move tools near top, add sidebar ads to eliminate scrolling
4. **Document Previews:** Show first-page thumbnail preview after upload on all tools
5. **Live Rotation Preview:** Show real-time preview as user selects rotation angles
6. **OCR Capabilities:** Extract text from scanned PDFs using client-side OCR
7. **Image Converters:** PDF to Images and Images to PDF with format selection
8. **Format Support:** JPG default with PNG/JPEG options for image conversion

## Architecture

### Current Stack (Keeping)
- **Build Tool:** Vite 7.3.1
- **Framework:** Vanilla JavaScript (ES6 modules)
- **Styling:** Tailwind CSS 3.4.19
- **PDF Processing:**
  - pdf-lib 1.17.1 (manipulation)
  - pdfjs-dist 5.4.624 (rendering)

### New Dependencies
- **tesseract.js** (v5.x) - Client-side OCR engine
- **jszip** (v3.10.0) - ZIP file creation for batch image downloads

### Design Principles
- **100% Client-Side Processing:** All operations remain in browser, no server uploads
- **Privacy First:** Files never leave user's device
- **Consistent UX:** All tools follow same pattern (upload → preview → options → action → download)
- **Responsive Design:** Three-column layout on desktop, single column on mobile
- **Progressive Enhancement:** New features don't break existing functionality

### New Utility Modules

**`/src/js/utils/file-naming.js`**
- Centralized filename generation
- Extract original name without extension
- Append task-specific suffix
- Format: `originalname_taskname.extension`

**`/src/js/utils/preview-renderer.js`**
- Shared PDF preview component using PDF.js
- Renders first page as thumbnail
- Configurable width (default 200px)
- Graceful error handling

## Implementation Approach: Incremental Enhancement

### Phase 1: Fix Existing Tools

**Priority:** Critical bugs and UX issues in current tools

**1.1 Smart Download for Compress Tool**
- Check if `compressedSize < originalSize`
- Only trigger download if compression succeeded
- Show error message if no size reduction achieved
- Explain that PDF may already be optimized

**1.2 File Naming Utility**
- Create `generateFileName(originalName, taskSuffix, extension)` function
- Strip extension from original filename
- Append underscore and task name
- Return formatted filename

**1.3 Update All Tool Downloads**
- **Merge:** Use first file's name + `_merged`
- **Split (all pages):** Use original name + `_page-1`, `_page-2`, etc.
- **Split (range):** Use original name + `_extracted`
- **Compress:** Use original name + `_compressed`
- **Rotate:** Use original name + `_rotated`

**1.4 Preview System**
- Create reusable preview renderer using PDF.js
- Configure worker source for PDF.js
- Render first page at configurable width
- Display as canvas with border and shadow
- Handle errors gracefully

**1.5 Add Previews to Existing Tools**
- Integrate preview after successful file upload
- Show thumbnail below file info
- Use 200px width for consistency
- Add to: merge, split, compress, rotate tools

### Phase 2: Layout Redesign

**Priority:** Improve landing page UX and eliminate scrolling

**2.1 Hero Section Compression**
- Reduce vertical padding: `py-20` → `py-8` (80px → 32px)
- Remove "Get Started" button (redundant)
- Reduce heading sizes: `text-6xl` → `text-5xl`, `text-5xl` → `text-4xl`
- Compress margins: `mb-6` → `mb-3`, `mb-8` → `mb-4`
- Keep security badge, make more compact

**2.2 Features Grid Compression**
- Reduce section padding: `py-16` → `py-4` (64px → 16px)
- Reduce header margin: `mb-12` → `mb-6` (48px → 24px)
- Reduce heading size: `text-4xl` → `text-3xl`
- Keep grid layout unchanged

**2.3 Three-Column Layout**
- Desktop (lg+): CSS Grid with `[300px 1fr 300px]` columns
- Left sidebar: 300px wide, sticky position
- Center content: Flexible width with tools
- Right sidebar: 300px wide, sticky position
- Mobile/Tablet: Single column, hide sidebars completely

**2.4 Sidebar Ads**
- Create `createSidebarAd(position)` component
- Standard ad size: 300x600 (half-page unit)
- Sticky positioning with `top-4` offset
- Hidden on mobile: `hidden lg:block`
- Placeholder styling: dashed border, gray background
- Left and right positions for AdSense placement

**Responsive Behavior:**
- Large screens: Three columns with ads
- Medium/Small: Single column, no ads
- Tools remain full-width on mobile for usability

### Phase 3: New Tools

**Priority:** Expand functionality with converter and OCR tools

**3.1 PDF-to-Images Tool**

**Features:**
- Single PDF upload
- Preview first page
- Output format selection: JPG (default), PNG, JPEG
- Page selection: All pages or specific range
- Batch download as ZIP file

**Implementation:**
- Use PDF.js to render each page to canvas
- Convert canvas to image blob (jpeg/png)
- Add to JSZip archive with naming: `originalname_page-1.jpg`
- Download ZIP: `originalname_images.zip`

**UI Flow:**
1. Upload PDF → show preview
2. Radio buttons: JPG (checked) | PNG | JPEG
3. Page range input (optional)
4. "Convert to Images" button
5. Show progress: "Processing page X of Y"
6. Auto-download ZIP

**3.2 Images-to-PDF Tool**

**Features:**
- Multiple image upload (JPG, PNG, JPEG)
- Thumbnail grid with previews
- Drag-and-drop reordering
- Page size selection: A4, Letter, Auto (match image size)
- Single PDF output

**Implementation:**
- Read images as data URLs or array buffers
- Embed in PDF using pdf-lib (embedJpg/embedPng)
- Create pages sized to fit images
- Download: `firstimagename_pdf.pdf`

**UI Flow:**
1. Upload multiple images (drag-drop or browse)
2. Show thumbnail grid with remove buttons
3. Drag thumbnails to reorder
4. Select page size dropdown
5. "Create PDF" button → download

**3.3 OCR Tool - Extract Text**

**Features:**
- PDF upload (optimized for scanned documents)
- Preview first page
- Language selection (English default, multi-language support)
- Extract text from all pages or range
- Editable textarea output
- Download as TXT or copy to clipboard

**Implementation:**
- Render each PDF page to canvas at 2x scale (better OCR accuracy)
- Convert canvas to image blob
- Run Tesseract.recognize() per page
- Collect and concatenate text
- Display in textarea
- Download: `originalname_extracted.txt`

**UI Flow:**
1. Upload PDF → show preview
2. Dropdown: Select language (English, Spanish, French, etc.)
3. Page range (All / Specific)
4. "Extract Text" button → show progress bar
5. Display extracted text in large textarea (editable)
6. Buttons: "Download as TXT" | "Copy to Clipboard"

**Configuration Updates:**
- Add OCR tool to `tools.js` config
- Enable pdf-to-images and images-to-pdf in config
- Add routing cases in `main.js` switch statement
- Update package.json dependencies

### Phase 4: Live Preview Enhancement

**Priority:** Enhanced visual feedback for rotation tool

**4.1 Real-Time Rotation Preview**

**Current State:** Static file info, no visual preview

**Enhancement:**
- Show first page preview on upload
- Update preview instantly when rotation angle clicked
- No separate "Preview" button needed
- User sees exact result before applying

**Implementation:**
- Store original PDF array buffer
- Render initial preview at 0° rotation
- On angle button click:
  - Re-render page with selected rotation
  - Apply CSS transition for smooth visual change
  - Update canvas with rotated viewport
- Preview updates for 90°, 180°, 270° selections

**Technical Details:**
- Use PDF.js viewport rotation parameter
- Calculate scale based on rotated dimensions
- Display in 250px max dimension
- Add transition CSS class for smooth rotation effect

## Data Flow

### Existing Tools (with improvements)
```
File Upload → Validate → Load PDF → Show Preview (NEW)
  → User Options → Process PDF → Check Output (NEW for Compress)
  → Generate Filename (NEW) → Download
```

### PDF-to-Images
```
PDF Upload → Validate → Preview First Page → Select Format & Pages
  → For Each Page: Render Canvas → Convert to Image → Add to ZIP
  → Download ZIP
```

### Images-to-PDF
```
Images Upload → Validate Each → Show Thumbnail Grid → Allow Reorder
  → Select Page Size → For Each Image: Embed in PDF → Add Page
  → Download PDF
```

### OCR Extract Text
```
PDF Upload → Validate → Preview → Select Language & Pages
  → For Each Page: Render High-Res Canvas → Run OCR → Collect Text
  → Display in Textarea → Download TXT or Copy
```

## Error Handling

### Compress Tool
- If compression fails: Clear error message explaining PDF already optimized
- No download triggered
- User can try different compression level or start over

### Preview Rendering
- If PDF.js fails: Show "Preview unavailable" message
- Tool remains functional without preview
- Log error for debugging

### OCR Processing
- If Tesseract fails: Show error with page number
- Allow retry or skip page
- Show partial results if some pages succeed
- Timeout handling for very large documents

### Image Processing
- Validate image formats before processing
- Handle corrupt images gracefully
- Show clear error messages for unsupported formats
- Max file size checks per image and total batch

## Testing Strategy

### Phase 1 Testing
- Compress tool: Test with already-optimized PDFs, ensure no download
- File naming: Verify all tools use correct format with various filenames
- Previews: Test with different PDF types (text, images, scanned)

### Phase 2 Testing
- Layout: Test on multiple screen sizes (mobile, tablet, desktop, wide)
- Sidebar ads: Verify sticky behavior, responsive hiding
- Spacing: Confirm no scrolling needed on desktop with standard screen height

### Phase 3 Testing
- PDF-to-Images: Test with multi-page PDFs, verify ZIP contents, test all formats
- Images-to-PDF: Test with mixed formats, verify page ordering, test reordering
- OCR: Test with scanned documents, test multiple languages, verify text accuracy

### Phase 4 Testing
- Rotation preview: Test all angles, verify smooth transitions, test with various PDFs
- Performance: Ensure preview updates are fast (< 500ms)

## Deployment Strategy

Each phase can be deployed independently:

1. **Phase 1:** Deploy after all existing tools fixed and tested
2. **Phase 2:** Deploy after layout changes verified across devices
3. **Phase 3:** Deploy each new tool individually as completed
4. **Phase 4:** Deploy after rotation preview tested and optimized

## Success Metrics

- **No Scrolling:** Users can see all tools without scrolling on 1920x1080 desktop
- **Smart Downloads:** Zero false downloads from compress tool
- **Consistent Naming:** 100% of downloads follow naming convention
- **Preview Adoption:** Visual confirmation before processing
- **New Tool Usage:** User engagement with converter and OCR tools

## Technical Constraints

- **Client-Side Only:** All processing must work in browser
- **Performance:** OCR may be slow on large documents - show clear progress
- **Browser Support:** Modern browsers with ES6 modules, Canvas API, Web Workers
- **File Size Limits:** Keep existing 50MB limit per file
- **Memory Usage:** Monitor memory for batch operations (PDF-to-Images with many pages)

## Future Enhancements (Out of Scope)

- Word document conversion (complex, may require server-side)
- Batch processing multiple files at once
- Cloud storage integration
- Advanced compression algorithms
- PDF editing (annotations, forms)
- Password protection/encryption
