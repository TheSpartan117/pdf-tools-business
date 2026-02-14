export const TOOLS = [
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Convert PDF documents to editable Word files',
    icon: `<svg class="h-12 w-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- PDF Document (left) -->
      <rect x="4" y="8" width="20" height="28" rx="2" fill="#DC2626" opacity="0.9"/>
      <text x="14" y="22" font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="white" text-anchor="middle">PDF</text>
      <rect x="8" y="26" width="12" height="2" fill="white" opacity="0.7"/>
      <rect x="8" y="30" width="12" height="2" fill="white" opacity="0.7"/>
      <!-- Arrow -->
      <path d="M26 22 L36 22 L34 20 M36 22 L34 24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <!-- Word Document (right) -->
      <rect x="40" y="8" width="20" height="28" rx="2" fill="#2563EB" opacity="0.9"/>
      <text x="50" y="22" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="white" text-anchor="middle">W</text>
      <rect x="44" y="26" width="12" height="2" fill="white" opacity="0.7"/>
      <rect x="44" y="30" width="8" height="2" fill="white" opacity="0.7"/>
    </svg>`,
    enabled: true
  },
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    description: 'Convert Word documents to PDF format',
    icon: `<svg class="h-12 w-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Word Document (left) -->
      <rect x="4" y="8" width="20" height="28" rx="2" fill="#2563EB" opacity="0.9"/>
      <text x="14" y="22" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="white" text-anchor="middle">W</text>
      <rect x="8" y="26" width="12" height="2" fill="white" opacity="0.7"/>
      <rect x="8" y="30" width="8" height="2" fill="white" opacity="0.7"/>
      <!-- Arrow -->
      <path d="M26 22 L36 22 L34 20 M36 22 L34 24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <!-- PDF Document (right) -->
      <rect x="40" y="8" width="20" height="28" rx="2" fill="#DC2626" opacity="0.9"/>
      <text x="50" y="22" font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="white" text-anchor="middle">PDF</text>
      <rect x="44" y="26" width="12" height="2" fill="white" opacity="0.7"/>
      <rect x="44" y="30" width="12" height="2" fill="white" opacity="0.7"/>
    </svg>`,
    enabled: true
  },
  {
    id: 'merge',
    name: 'Merge PDFs',
    description: 'Combine multiple PDF files into one',
    icon: `<svg class="h-12 w-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- First PDF (left) -->
      <rect x="2" y="12" width="16" height="22" rx="2" fill="#DC2626" opacity="0.7"/>
      <text x="10" y="23" font-family="Arial, sans-serif" font-size="5" font-weight="bold" fill="white" text-anchor="middle">PDF</text>
      <!-- Second PDF (left-center) -->
      <rect x="12" y="16" width="16" height="22" rx="2" fill="#DC2626" opacity="0.8"/>
      <text x="20" y="27" font-family="Arial, sans-serif" font-size="5" font-weight="bold" fill="white" text-anchor="middle">PDF</text>
      <!-- Arrow pointing right -->
      <path d="M30 27 L38 27 L36 25 M38 27 L36 29" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <!-- Merged PDF (right) -->
      <rect x="42" y="10" width="20" height="28" rx="2" fill="#059669" opacity="0.9"/>
      <text x="52" y="24" font-family="Arial, sans-serif" font-size="6" font-weight="bold" fill="white" text-anchor="middle">PDF</text>
      <rect x="46" y="28" width="12" height="1.5" fill="white" opacity="0.7"/>
      <rect x="46" y="31" width="12" height="1.5" fill="white" opacity="0.7"/>
      <rect x="46" y="34" width="8" height="1.5" fill="white" opacity="0.7"/>
    </svg>`,
    enabled: true
  },
  {
    id: 'split',
    name: 'Split PDF',
    description: 'Extract pages or split into multiple files',
    icon: `<svg class="h-12 w-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Single PDF (left) -->
      <rect x="2" y="10" width="20" height="28" rx="2" fill="#DC2626" opacity="0.9"/>
      <text x="12" y="24" font-family="Arial, sans-serif" font-size="6" font-weight="bold" fill="white" text-anchor="middle">PDF</text>
      <rect x="6" y="28" width="12" height="1.5" fill="white" opacity="0.7"/>
      <rect x="6" y="31" width="12" height="1.5" fill="white" opacity="0.7"/>
      <!-- Arrow splitting -->
      <path d="M24 18 L30 14 M24 18 L30 22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M24 30 L30 34 M24 30 L30 26" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <!-- Split PDFs (right) -->
      <rect x="34" y="8" width="14" height="18" rx="1.5" fill="#7C3AED" opacity="0.9"/>
      <text x="41" y="17" font-family="Arial, sans-serif" font-size="4" font-weight="bold" fill="white" text-anchor="middle">PDF</text>
      <rect x="50" y="24" width="14" height="18" rx="1.5" fill="#7C3AED" opacity="0.9"/>
      <text x="57" y="33" font-family="Arial, sans-serif" font-size="4" font-weight="bold" fill="white" text-anchor="middle">PDF</text>
    </svg>`,
    enabled: true
  },
  {
    id: 'compress',
    name: 'Compress PDF',
    description: 'Reduce file size while maintaining quality',
    icon: `<svg class="h-12 w-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Large PDF (left) -->
      <rect x="2" y="6" width="22" height="32" rx="2" fill="#DC2626" opacity="0.7"/>
      <text x="13" y="22" font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="white" text-anchor="middle">PDF</text>
      <text x="13" y="30" font-family="Arial, sans-serif" font-size="6" fill="white" text-anchor="middle">5MB</text>
      <!-- Compression arrows -->
      <path d="M26 22 L34 22 L32 20 M34 22 L32 24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M28 16 L32 20 M28 28 L32 24" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Compressed PDF (right) -->
      <rect x="38" y="12" width="18" height="24" rx="2" fill="#059669" opacity="0.9"/>
      <text x="47" y="24" font-family="Arial, sans-serif" font-size="6" font-weight="bold" fill="white" text-anchor="middle">PDF</text>
      <text x="47" y="31" font-family="Arial, sans-serif" font-size="5" fill="white" text-anchor="middle">500KB</text>
    </svg>`,
    enabled: true
  },
  {
    id: 'rotate',
    name: 'Rotate Pages',
    description: 'Rotate individual pages or entire document',
    icon: `<svg class="h-12 w-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- PDF Document -->
      <rect x="20" y="16" width="24" height="32" rx="2" fill="#DC2626" opacity="0.9"/>
      <text x="32" y="32" font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="white" text-anchor="middle">PDF</text>
      <rect x="24" y="36" width="16" height="2" fill="white" opacity="0.7"/>
      <rect x="24" y="40" width="12" height="2" fill="white" opacity="0.7"/>
      <!-- Rotation arrows -->
      <path d="M50 24 A 18 18 0 0 1 50 40" stroke="#F59E0B" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M50 22 L50 26 L46 24 Z" fill="#F59E0B"/>
      <path d="M14 40 A 18 18 0 0 1 14 24" stroke="#F59E0B" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M14 42 L14 38 L18 40 Z" fill="#F59E0B"/>
    </svg>`,
    enabled: true
  },
  {
    id: 'pdf-to-images',
    name: 'PDF to Images',
    description: 'Convert PDF pages to JPG or PNG',
    icon: `<svg class="h-12 w-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- PDF Document (left) -->
      <rect x="2" y="10" width="20" height="28" rx="2" fill="#DC2626" opacity="0.9"/>
      <text x="12" y="24" font-family="Arial, sans-serif" font-size="6" font-weight="bold" fill="white" text-anchor="middle">PDF</text>
      <rect x="6" y="28" width="12" height="1.5" fill="white" opacity="0.7"/>
      <rect x="6" y="31" width="8" height="1.5" fill="white" opacity="0.7"/>
      <!-- Arrow -->
      <path d="M24 24 L34 24 L32 22 M34 24 L32 26" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <!-- Image Grid (right) -->
      <rect x="38" y="8" width="12" height="12" rx="1" fill="#8B5CF6" opacity="0.9"/>
      <circle cx="42" cy="12" r="1.5" fill="white" opacity="0.9"/>
      <path d="M38 16 L42 12 L46 16 L50 12 L50 18 L38 18 Z" fill="white" opacity="0.5"/>
      <rect x="52" y="8" width="12" height="12" rx="1" fill="#8B5CF6" opacity="0.8"/>
      <circle cx="56" cy="12" r="1.5" fill="white" opacity="0.9"/>
      <path d="M52 16 L56 12 L60 16 L64 12 L64 18 L52 18 Z" fill="white" opacity="0.5"/>
      <rect x="38" y="22" width="12" height="12" rx="1" fill="#8B5CF6" opacity="0.8"/>
      <circle cx="42" cy="26" r="1.5" fill="white" opacity="0.9"/>
      <path d="M38 30 L42 26 L46 30 L50 26 L50 32 L38 32 Z" fill="white" opacity="0.5"/>
      <rect x="52" y="22" width="12" height="12" rx="1" fill="#8B5CF6" opacity="0.7"/>
      <circle cx="56" cy="26" r="1.5" fill="white" opacity="0.9"/>
      <path d="M52 30 L56 26 L60 30 L64 26 L64 32 L52 32 Z" fill="white" opacity="0.5"/>
    </svg>`,
    enabled: true
  },
  {
    id: 'images-to-pdf',
    name: 'Images to PDF',
    description: 'Convert multiple images into a single PDF',
    icon: `<svg class="h-12 w-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Image Stack (left) -->
      <rect x="2" y="14" width="12" height="12" rx="1" fill="#8B5CF6" opacity="0.7"/>
      <circle cx="6" cy="18" r="1.5" fill="white" opacity="0.9"/>
      <rect x="6" y="20" width="12" height="12" rx="1" fill="#8B5CF6" opacity="0.8"/>
      <circle cx="10" cy="24" r="1.5" fill="white" opacity="0.9"/>
      <rect x="10" y="26" width="12" height="12" rx="1" fill="#8B5CF6" opacity="0.9"/>
      <circle cx="14" cy="30" r="1.5" fill="white" opacity="0.9"/>
      <path d="M10 34 L14 30 L18 34 L22 30 L22 36 L10 36 Z" fill="white" opacity="0.5"/>
      <!-- Arrow -->
      <path d="M24 28 L34 28 L32 26 M34 28 L32 30" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <!-- PDF Document (right) -->
      <rect x="38" y="10" width="24" height="32" rx="2" fill="#DC2626" opacity="0.9"/>
      <text x="50" y="26" font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="white" text-anchor="middle">PDF</text>
      <rect x="42" y="30" width="16" height="2" fill="white" opacity="0.7"/>
      <rect x="42" y="34" width="16" height="2" fill="white" opacity="0.7"/>
      <rect x="42" y="38" width="12" height="2" fill="white" opacity="0.7"/>
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
    icon: `<svg class="h-12 w-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Scanned Document (left) -->
      <rect x="2" y="8" width="22" height="30" rx="2" fill="#6B7280" opacity="0.9"/>
      <rect x="6" y="14" width="14" height="3" fill="white" opacity="0.3"/>
      <rect x="6" y="20" width="14" height="3" fill="white" opacity="0.3"/>
      <rect x="6" y="26" width="10" height="3" fill="white" opacity="0.3"/>
      <!-- Scanning beam effect -->
      <rect x="2" y="22" width="22" height="4" fill="#3B82F6" opacity="0.4"/>
      <!-- Arrow -->
      <path d="M26 22 L34 22 L32 20 M34 22 L32 24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <!-- Text Output (right) -->
      <rect x="38" y="10" width="24" height="28" rx="2" fill="#059669" opacity="0.9"/>
      <text x="50" y="20" font-family="monospace" font-size="5" font-weight="bold" fill="white" text-anchor="middle">TEXT</text>
      <rect x="42" y="24" width="16" height="1.5" fill="white" opacity="0.9"/>
      <rect x="42" y="27" width="16" height="1.5" fill="white" opacity="0.9"/>
      <rect x="42" y="30" width="14" height="1.5" fill="white" opacity="0.9"/>
      <rect x="42" y="33" width="12" height="1.5" fill="white" opacity="0.9"/>
    </svg>`,
    enabled: true
  }
]
