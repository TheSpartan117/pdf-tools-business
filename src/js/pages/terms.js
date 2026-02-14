export function createTermsPage() {
  const page = document.createElement('div')
  page.className = 'min-h-screen bg-gray-50'
  page.innerHTML = `
    <div class="bg-white shadow-sm">
      <div class="container mx-auto px-4 py-6">
        <a href="#home" class="text-blue-600 hover:text-blue-800">&larr; Back to Home</a>
      </div>
    </div>

    <div class="container mx-auto px-4 py-12 max-w-4xl">
      <h1 class="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>

      <div class="prose prose-lg">
        <p class="text-gray-600 mb-6">Last updated: February 13, 2026</p>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
          <p class="text-gray-700 mb-4">
            By accessing and using PDF Tools, you accept and agree to be bound by the terms
            and conditions of this agreement.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Use of Service</h2>
          <p class="text-gray-700 mb-4">
            PDF Tools provides free PDF processing tools for legitimate purposes. You agree to:
          </p>
          <ul class="list-disc pl-6 text-gray-700 mb-4">
            <li>Use the service only for lawful purposes</li>
            <li>Not attempt to circumvent any limitations or restrictions</li>
            <li>Not use the service to process illegal or malicious content</li>
            <li>Respect intellectual property rights of others</li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">File Size Limits</h2>
          <p class="text-gray-700 mb-4">
            To ensure optimal performance, we enforce the following limits:
          </p>
          <ul class="list-disc pl-6 text-gray-700 mb-4">
            <li>Maximum file size: 50MB per file</li>
            <li>Most tools process locally; some use secure server processing</li>
            <li>Large files may require more processing time</li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Disclaimer of Warranties</h2>
          <p class="text-gray-700 mb-4">
            PDF Tools is provided "as is" without any warranties, expressed or implied. We do not
            guarantee that:
          </p>
          <ul class="list-disc pl-6 text-gray-700 mb-4">
            <li>The service will be uninterrupted or error-free</li>
            <li>Results will meet your specific requirements</li>
            <li>All file formats will be supported</li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
          <p class="text-gray-700 mb-4">
            We shall not be liable for any indirect, incidental, special, or consequential damages
            resulting from the use or inability to use the service. This includes any loss of data
            or files.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Browser Compatibility</h2>
          <p class="text-gray-700 mb-4">
            Our service requires a modern web browser with JavaScript enabled. We recommend using
            the latest version of Chrome, Firefox, Safari, or Edge for the best experience.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
          <p class="text-gray-700 mb-4">
            We reserve the right to modify these terms at any time. Continued use of the service
            after changes constitutes acceptance of the modified terms.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <p class="text-gray-700 mb-4">
            If you have questions about these Terms of Service, please contact us at:
            <br>
            <a href="mailto:support@pdftools.example" class="text-blue-600 hover:text-blue-800">support@pdftools.example</a>
          </p>
        </section>
      </div>
    </div>
  `

  return page
}
