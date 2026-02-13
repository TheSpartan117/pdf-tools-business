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
            At PDF Tools, your privacy is our top priority. We've built our entire platform
            around the principle of client-side processing to ensure your files remain private and secure.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Client-Side Processing</h2>
          <p class="text-gray-700 mb-4">
            All PDF processing happens directly in your browser using JavaScript. This means:
          </p>
          <ul class="list-disc pl-6 text-gray-700 mb-4">
            <li>Your files never leave your device</li>
            <li>We never see, store, or transmit your documents</li>
            <li>Processing works even without an internet connection</li>
            <li>Your data stays completely private</li>
          </ul>
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
