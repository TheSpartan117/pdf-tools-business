export function createHeader() {
  const header = document.createElement('header')
  header.className = 'bg-white shadow-sm sticky top-0 z-40'
  header.innerHTML = `
    <nav class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <a href="#/" class="flex items-center cursor-pointer">
          <svg class="h-8 w-8 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          </svg>
          <span class="text-xl font-bold text-gray-900">PDF Tools</span>
        </a>
        <div class="hidden md:flex items-center space-x-6">
          <a href="#/" class="text-gray-600 hover:text-gray-900">Home</a>
          <a href="#/blog" class="text-gray-600 hover:text-gray-900">Blog</a>
          <a href="#/privacy" class="text-gray-600 hover:text-gray-900">Privacy</a>
          <a href="#/terms" class="text-gray-600 hover:text-gray-900">Terms</a>
        </div>
        <button id="mobile-menu-btn" class="md:hidden text-gray-600 hover:text-gray-900">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      <!-- Mobile menu (hidden by default) -->
      <div id="mobile-menu" class="hidden md:hidden mt-4 pb-4 space-y-2">
        <a href="#/" class="block text-gray-600 hover:text-gray-900 py-2">Home</a>
        <a href="#/blog" class="block text-gray-600 hover:text-gray-900 py-2">Blog</a>
        <a href="#/privacy" class="block text-gray-600 hover:text-gray-900 py-2">Privacy</a>
        <a href="#/terms" class="block text-gray-600 hover:text-gray-900 py-2">Terms</a>
      </div>
    </nav>
  `

  // Add mobile menu toggle functionality
  const mobileMenuBtn = header.querySelector('#mobile-menu-btn')
  const mobileMenu = header.querySelector('#mobile-menu')

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden')
    })

    // Close mobile menu when a link is clicked
    const mobileLinks = mobileMenu.querySelectorAll('a')
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden')
      })
    })
  }

  return header
}
