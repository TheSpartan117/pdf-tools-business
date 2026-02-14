export function createPrivacyPage() {
  const page = document.createElement('div')
  page.className = 'min-h-screen bg-gray-50'
  page.innerHTML = `
    <div class="bg-white shadow-sm">
      <div class="container mx-auto px-4 py-6">
        <a href="#home" class="text-blue-600 hover:text-blue-800">&larr; Back to Home</a>
      </div>
    </div>

    <div class="container mx-auto px-4 py-12 max-w-4xl">
      <h1 class="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

      <div class="prose prose-lg">
        <p class="text-gray-600 mb-6">Last updated: February 13, 2026</p>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Your Privacy Matters</h2>
          <p class="text-gray-700 mb-4">
            At PDF Tools, your privacy is our top priority. We use a combination of client-side
            and secure server-side processing to provide the best quality results while protecting your privacy.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">How We Process Your Files</h2>

          <h3 class="text-xl font-semibold text-gray-900 mb-3 mt-4">Client-Side Tools (Browser-Based)</h3>
          <p class="text-gray-700 mb-2">
            Most tools process files directly in your browser:
          </p>
          <ul class="list-disc pl-6 text-gray-700 mb-4">
            <li><strong>Merge, Split, Rotate, Compress PDFs</strong> - Process locally in your browser</li>
            <li><strong>Images to PDF, PDF to Images</strong> - Process locally in your browser</li>
            <li>Your files never leave your device</li>
            <li>Works offline after initial page load</li>
            <li>Instant processing with complete privacy</li>
          </ul>

          <h3 class="text-xl font-semibold text-gray-900 mb-3 mt-4">Server-Side Tools (Professional Quality)</h3>
          <p class="text-gray-700 mb-2">
            Some tools require server processing for professional-quality results:
          </p>
          <ul class="list-disc pl-6 text-gray-700 mb-4">
            <li><strong>PDF to Word, Word to PDF</strong> - High-fidelity format conversion</li>
            <li><strong>OCR (Text Extraction)</strong> - Advanced optical character recognition</li>
            <li>Files are uploaded securely via HTTPS</li>
            <li>Processed and immediately deleted from server</li>
            <li>No files are stored or logged</li>
            <li>Processing typically takes 10-30 seconds</li>
          </ul>

          <p class="text-gray-700 mb-4 mt-4">
            <strong>Our commitment:</strong> Whether processed client-side or server-side, we never store,
            view, or retain your documents. Server-processed files are automatically deleted immediately after conversion.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Analytics</h2>
          <p class="text-gray-700 mb-4">
            We use Google Analytics to understand how visitors use our site. This helps us improve
            the user experience. Google Analytics collects anonymous usage data such as:
          </p>
          <ul class="list-disc pl-6 text-gray-700 mb-4">
            <li>Pages visited</li>
            <li>Time spent on site</li>
            <li>Browser and device information</li>
            <li>General location (city/country level)</li>
          </ul>
          <p class="text-gray-700 mb-4">
            No personally identifiable information or file content is ever collected.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Advertising</h2>
          <p class="text-gray-700 mb-4">
            We use Google AdSense to display advertisements on our site. Google may use cookies
            to show ads based on your browsing history. You can opt out of personalized advertising
            by visiting Google's Ad Settings.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Cookies</h2>
          <p class="text-gray-700 mb-4">
            We use cookies for analytics and advertising purposes only. No cookies are used to
            track or store your PDF files or processing activities.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <p class="text-gray-700 mb-4">
            If you have questions about this Privacy Policy, please contact us at:
            <br>
            <a href="mailto:support@pdftools.example" class="text-blue-600 hover:text-blue-800">support@pdftools.example</a>
          </p>
        </section>
      </div>
    </div>
  `

  return page
}
