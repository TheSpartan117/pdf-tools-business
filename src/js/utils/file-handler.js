/**
 * File handling utilities for PDF operations
 */

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export function validatePDF(file) {
  const errors = []

  if (!file) {
    errors.push('No file selected')
    return { valid: false, errors }
  }

  // Check file extension (primary check)
  const fileName = file.name.toLowerCase()
  const isPdfExtension = fileName.endsWith('.pdf')

  if (!isPdfExtension) {
    errors.push('Please upload a file with .pdf extension')
  }

  if (file.size === 0) {
    errors.push('File is empty')
  }

  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = (e) => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

export function createDownloadLink(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()

  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
