export const TOOLS = [
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Convert PDF documents to editable Word files',
    icon: `<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <g>
        <!-- PDF Document (left side) -->
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h4a2 2 0 002-2V7.414a1 1 0 00-.293-.707l-2.414-2.414A1 1 0 009.586 4H7a2 2 0 00-2 2v13a2 2 0 002 2z" />
        <!-- Arrow -->
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 12h5m0 0l-2-2m2 2l-2 2" />
        <!-- Word Document (right side) -->
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 21h2a2 2 0 002-2V7a2 2 0 00-2-2h-2" opacity="0.7"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18 10h2M18 14h2" opacity="0.7"/>
      </g>
    </svg>`,
    enabled: true
  },
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    description: 'Convert Word documents to PDF format',
    icon: `<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <g>
        <!-- Word Document (left side) -->
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10h2M5 14h2M7 21H5a2 2 0 01-2-2V7a2 2 0 012-2h2" opacity="0.7"/>
        <!-- Arrow -->
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 12h5m0 0l-2-2m2 2l-2 2" />
        <!-- PDF Document (right side) -->
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 21h2a2 2 0 002-2V7.414a1 1 0 00-.293-.707l-2.414-2.414A1 1 0 0017.586 4H15a2 2 0 00-2 2v13a2 2 0 002 2h2z" />
      </g>
    </svg>`,
    enabled: true
  },
  {
    id: 'merge',
    name: 'Merge PDFs',
    description: 'Combine multiple PDF files into one',
    icon: `<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>`,
    enabled: true
  },
  {
    id: 'split',
    name: 'Split PDF',
    description: 'Extract pages or split into multiple files',
    icon: `<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>`,
    enabled: true
  },
  {
    id: 'compress',
    name: 'Compress PDF',
    description: 'Reduce file size while maintaining quality',
    icon: `<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>`,
    enabled: true
  },
  {
    id: 'rotate',
    name: 'Rotate Pages',
    description: 'Rotate individual pages or entire document',
    icon: `<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>`,
    enabled: true
  },
  {
    id: 'pdf-to-images',
    name: 'PDF to Images',
    description: 'Convert PDF pages to JPG or PNG',
    icon: `<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>`,
    enabled: true
  },
  {
    id: 'images-to-pdf',
    name: 'Images to PDF',
    description: 'Convert multiple images into a single PDF',
    icon: `<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>`,
    enabled: true
  },
  {
    id: 'extract',
    name: 'Extract Pages',
    description: 'Select specific pages to extract',
    icon: `<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>`,
    enabled: true
  },
  {
    id: 'ocr',
    name: 'Extract Text (OCR)',
    description: 'Extract text from scanned PDFs',
    icon: `<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m-7 5a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M9 5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
    </svg>`,
    enabled: true
  }
]
