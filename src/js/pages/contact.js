export function createContactPage() {
  const page = document.createElement('div')
  page.className = 'min-h-screen bg-gray-50'
  page.innerHTML = `
    <div class="bg-white shadow-sm">
      <div class="container mx-auto px-4 py-6">
        <a href="#/" class="text-blue-600 hover:text-blue-800">&larr; Back to Home</a>
      </div>
    </div>

    <div class="container mx-auto px-4 py-12 max-w-4xl">
      <h1 class="text-4xl font-bold text-gray-900 mb-8">Contact Us</h1>

      <div class="prose prose-lg">
        <p class="text-gray-600 mb-8">
          Have questions, feedback, or need help? We're here to assist you. Choose the best way to reach out below.
        </p>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Get in Touch</h2>

          <div class="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-3">📧 Email Support</h3>
            <p class="text-gray-700 mb-2">
              For general inquiries, technical support, or feedback:
            </p>
            <a href="mailto:support@pdf-tools-business.com" class="text-blue-600 hover:text-blue-800 font-semibold">
              support@pdf-tools-business.com
            </a>
            <p class="text-sm text-gray-500 mt-2">
              We typically respond within 24-48 hours on business days.
            </p>
          </div>

          <div class="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-3">💼 Business Inquiries</h3>
            <p class="text-gray-700 mb-2">
              For partnerships, advertising, or business opportunities:
            </p>
            <a href="mailto:business@pdf-tools-business.com" class="text-blue-600 hover:text-blue-800 font-semibold">
              business@pdf-tools-business.com
            </a>
          </div>

          <div class="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-3">🐛 Report Issues</h3>
            <p class="text-gray-700 mb-2">
              Found a bug or technical issue? Help us improve by reporting it:
            </p>
            <a href="mailto:bugs@pdf-tools-business.com" class="text-blue-600 hover:text-blue-800 font-semibold">
              bugs@pdf-tools-business.com
            </a>
            <p class="text-sm text-gray-500 mt-2">
              Please include details about your browser, operating system, and steps to reproduce the issue.
            </p>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p class="text-gray-700 mb-4">
            Before reaching out, check if your question is answered in our common questions:
          </p>

          <div class="bg-blue-50 p-6 rounded-lg mb-4">
            <h3 class="font-semibold text-gray-900 mb-2">Is PDF Tools really free?</h3>
            <p class="text-gray-700 text-sm">
              Yes! All our tools are 100% free with no hidden costs, subscriptions, or limits on usage.
            </p>
          </div>

          <div class="bg-blue-50 p-6 rounded-lg mb-4">
            <h3 class="font-semibold text-gray-900 mb-2">Do you store my files?</h3>
            <p class="text-gray-700 text-sm">
              No. Files processed in your browser never leave your device. Files processed on our servers
              are automatically deleted within 30 seconds.
            </p>
          </div>

          <div class="bg-blue-50 p-6 rounded-lg mb-4">
            <h3 class="font-semibold text-gray-900 mb-2">What file size limits do you have?</h3>
            <p class="text-gray-700 text-sm">
              Browser-based tools can handle files up to several hundred MB depending on your device.
              Server-based tools (PDF/Word conversion, OCR) can handle larger files up to 100MB.
            </p>
          </div>

          <div class="bg-blue-50 p-6 rounded-lg mb-4">
            <h3 class="font-semibold text-gray-900 mb-2">Can I use PDF Tools for commercial purposes?</h3>
            <p class="text-gray-700 text-sm">
              Yes! You can use our tools for both personal and commercial projects without any restrictions.
            </p>
          </div>

          <div class="bg-blue-50 p-6 rounded-lg mb-4">
            <h3 class="font-semibold text-gray-900 mb-2">Which browsers are supported?</h3>
            <p class="text-gray-700 text-sm">
              PDF Tools works best on modern browsers including Chrome, Firefox, Safari, and Edge (latest versions).
            </p>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Feature Requests</h2>
          <p class="text-gray-700 mb-4">
            Have an idea for a new feature or tool? We love hearing from our users! Send your suggestions to:
          </p>
          <a href="mailto:features@pdf-tools-business.com" class="text-blue-600 hover:text-blue-800 font-semibold">
            features@pdf-tools-business.com
          </a>
          <p class="text-sm text-gray-500 mt-2">
            While we can't implement every suggestion, we carefully consider all feedback when planning new features.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Privacy Concerns</h2>
          <p class="text-gray-700 mb-4">
            Your privacy is important to us. If you have questions about how we handle your data:
          </p>
          <ul class="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Read our <a href="#/privacy" class="text-blue-600 hover:text-blue-800">Privacy Policy</a></li>
            <li>Review our <a href="#/terms" class="text-blue-600 hover:text-blue-800">Terms of Service</a></li>
            <li>Contact our privacy team: <a href="mailto:privacy@pdf-tools-business.com" class="text-blue-600 hover:text-blue-800">privacy@pdf-tools-business.com</a></li>
          </ul>
        </section>

        <section class="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-lg">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">We Value Your Feedback</h2>
          <p class="text-gray-700 mb-4">
            Your input helps us improve PDF Tools for everyone. Whether it's a suggestion, bug report, or just
            a note to say hello, we appreciate hearing from you.
          </p>
          <p class="text-gray-700 font-semibold">
            Thank you for using PDF Tools! 🙏
          </p>
        </section>
      </div>
    </div>
  `

  return page
}
