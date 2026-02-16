export function createFooter() {
  const footer = document.createElement('footer')
  footer.className = 'bg-gray-900 text-white py-12 mt-20'
  footer.innerHTML = `
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 class="text-lg font-semibold mb-4">PDF<span style="color:#FF6B35">guruji</span></h3>
          <p class="text-sm text-gray-400">Your PDF Expert</p>
          <p class="text-gray-400 mt-4">Free PDF tools that process files securely in your browser. Your privacy is our priority.</p>
        </div>
        <div>
          <h3 class="text-lg font-semibold mb-4">Legal</h3>
          <ul class="space-y-2">
            <li><a href="#privacy" class="text-gray-400 hover:text-white">Privacy Policy</a></li>
            <li><a href="#terms" class="text-gray-400 hover:text-white">Terms of Service</a></li>
          </ul>
        </div>
        <div>
          <h3 class="text-lg font-semibold mb-4">Contact</h3>
          <p class="text-gray-400">Questions? Email us at:<br>support@pdftools.example</p>
        </div>
      </div>
      <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
        <p>&copy; 2026 PDFguruji. All rights reserved.</p>
      </div>
    </div>
  `

  return footer
}
