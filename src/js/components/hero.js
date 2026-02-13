export function createHero() {
  const hero = document.createElement('section')
  hero.className = 'bg-gradient-to-br from-blue-50 to-indigo-100 py-20'
  hero.innerHTML = `
    <div class="container mx-auto px-4 text-center">
      <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
        Free PDF Tools
      </h1>
      <p class="text-xl md:text-2xl text-gray-700 mb-4">
        Process PDFs Securely in Your Browser
      </p>
      <p class="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
        Merge, split, compress, and convert PDFs with complete privacy.
        Your files never leave your device.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <a href="#features" class="btn-primary inline-block">
          Get Started
        </a>
        <div class="flex items-center text-green-700">
          <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span class="font-semibold">100% Private & Secure</span>
        </div>
      </div>
    </div>
  `

  return hero
}
