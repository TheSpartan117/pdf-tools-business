export function createAboutPage() {
  const page = document.createElement('div')
  page.className = 'min-h-screen bg-gray-50'
  page.innerHTML = `
    <div class="bg-white shadow-sm">
      <div class="container mx-auto px-4 py-6">
        <a href="#/" class="text-blue-600 hover:text-blue-800">&larr; Back to Home</a>
      </div>
    </div>

    <div class="container mx-auto px-4 py-12 max-w-4xl">
      <h1 class="text-4xl font-bold text-gray-900 mb-8">About PDF Tools</h1>

      <div class="prose prose-lg">
        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
          <p class="text-gray-700 mb-4">
            PDF Tools was created with a simple mission: to provide free, secure, and easy-to-use PDF manipulation tools
            for everyone. Whether you're a student, professional, or business owner, working with PDFs should be simple and accessible.
          </p>
          <p class="text-gray-700 mb-4">
            We believe that essential digital tools shouldn't come with expensive subscriptions or complicated software installations.
            That's why we've built a comprehensive suite of PDF tools that work directly in your browser, with no sign-ups or downloads required.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">What We Offer</h2>
          <div class="grid md:grid-cols-2 gap-4 mb-6">
            <div class="bg-blue-50 p-4 rounded-lg">
              <h3 class="font-semibold text-gray-900 mb-2">🔄 Convert & Transform</h3>
              <p class="text-gray-700 text-sm">PDF to Word, Word to PDF, Images to PDF, and more</p>
            </div>
            <div class="bg-green-50 p-4 rounded-lg">
              <h3 class="font-semibold text-gray-900 mb-2">📄 Organize & Edit</h3>
              <p class="text-gray-700 text-sm">Merge, split, rotate, and extract pages</p>
            </div>
            <div class="bg-purple-50 p-4 rounded-lg">
              <h3 class="font-semibold text-gray-900 mb-2">🗜️ Optimize</h3>
              <p class="text-gray-700 text-sm">Compress PDFs while maintaining quality</p>
            </div>
            <div class="bg-orange-50 p-4 rounded-lg">
              <h3 class="font-semibold text-gray-900 mb-2">📝 Extract</h3>
              <p class="text-gray-700 text-sm">OCR text extraction from scanned documents</p>
            </div>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Our Commitment to Privacy</h2>
          <p class="text-gray-700 mb-4">
            <strong>Your files are your business.</strong> We've designed our tools with privacy as a core principle:
          </p>
          <ul class="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li><strong>No Data Storage:</strong> We don't store your files on our servers</li>
            <li><strong>Automatic Deletion:</strong> Files processed on our servers are deleted within 30 seconds</li>
            <li><strong>Browser-First:</strong> Most tools process files directly in your browser</li>
            <li><strong>No Account Required:</strong> Use all features without signing up</li>
            <li><strong>HTTPS Encryption:</strong> All data transfers are encrypted</li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Why Choose PDF Tools?</h2>
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6">
            <ul class="space-y-3 text-gray-700">
              <li class="flex items-start">
                <span class="text-green-600 font-bold mr-2">✓</span>
                <span><strong>100% Free:</strong> No hidden costs, subscriptions, or premium tiers</span>
              </li>
              <li class="flex items-start">
                <span class="text-green-600 font-bold mr-2">✓</span>
                <span><strong>Unlimited Use:</strong> Process as many files as you need</span>
              </li>
              <li class="flex items-start">
                <span class="text-green-600 font-bold mr-2">✓</span>
                <span><strong>No Installation:</strong> Works in any modern web browser</span>
              </li>
              <li class="flex items-start">
                <span class="text-green-600 font-bold mr-2">✓</span>
                <span><strong>Professional Quality:</strong> High-fidelity conversions and processing</span>
              </li>
              <li class="flex items-start">
                <span class="text-green-600 font-bold mr-2">✓</span>
                <span><strong>Fast & Reliable:</strong> Quick processing with stable infrastructure</span>
              </li>
              <li class="flex items-start">
                <span class="text-green-600 font-bold mr-2">✓</span>
                <span><strong>Regular Updates:</strong> We continuously improve our tools</span>
              </li>
            </ul>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Our Technology</h2>
          <p class="text-gray-700 mb-4">
            We use industry-standard technologies and libraries to ensure the best quality results:
          </p>
          <ul class="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li><strong>PDF.js:</strong> Mozilla's powerful PDF rendering engine</li>
            <li><strong>LibreOffice:</strong> Professional-grade document conversion</li>
            <li><strong>Tesseract OCR:</strong> Advanced optical character recognition</li>
            <li><strong>Modern Web Standards:</strong> Built with the latest web technologies</li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Join Thousands of Users</h2>
          <p class="text-gray-700 mb-4">
            PDF Tools is trusted by students, professionals, small businesses, and enterprises worldwide.
            We process millions of documents every month, helping users save time and work more efficiently.
          </p>
          <p class="text-gray-700 mb-4">
            Whether you need to convert a single document or process hundreds of files, PDF Tools is here to help
            you get the job done quickly and securely.
          </p>
        </section>

        <section class="bg-blue-50 p-6 rounded-lg">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Get Started Today</h2>
          <p class="text-gray-700 mb-4">
            Ready to work with PDFs? Choose from our suite of tools and start processing your documents instantly.
          </p>
          <a href="#/" class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
            Explore Our Tools →
          </a>
        </section>
      </div>
    </div>
  `

  return page
}
