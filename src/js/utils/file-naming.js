/**
 * File naming utilities for PDF operations
 */

/**
 * Generate output filename based on original file and task
 * @param {string} originalName - Original filename (e.g., "document.pdf")
 * @param {string} taskSuffix - Task name (e.g., "compressed", "merged", "rotated")
 * @param {string} extension - Optional extension override (default: "pdf")
 * @returns {string} - New filename (e.g., "document_compressed.pdf")
 */
export function generateFileName(originalName, taskSuffix, extension = 'pdf') {
  // Remove extension from original name
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '')
  return `${nameWithoutExt}_${taskSuffix}.${extension}`
}
