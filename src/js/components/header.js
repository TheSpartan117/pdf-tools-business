export function createHeader() {
  const header = document.createElement('header')
  header.className = 'bg-white shadow-sm sticky top-0 z-40'
  header.innerHTML = `
    <nav class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <a href="#/" class="flex items-center cursor-pointer group">
          <svg class="h-10 w-10 mr-3 transform transition-transform group-hover:scale-105" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Modern layered document design with gradient -->
            <defs>
              <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#1D4ED8;stop-opacity:1" />
              </linearGradient>
            </defs>
            <!-- Back layer -->
            <path d="M10 8h18c1.1 0 2 .9 2 2v20c0 1.1-.9 2-2 2H10c-1.1 0-2-.9-2-2V10c0-1.1.9-2 2-2z" fill="url(#logo-gradient)" opacity="0.3"/>
            <!-- Middle layer -->
            <path d="M12 5h18c1.1 0 2 .9 2 2v20c0 1.1-.9 2-2 2H12c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2z" fill="url(#logo-gradient)" opacity="0.6"/>
            <!-- Front layer with PDF icon -->
            <path d="M14 2h14l6 6v18c0 1.1-.9 2-2 2H14c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2z" fill="url(#logo-gradient)"/>
            <path d="M28 2v6h6" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>
            <!-- PDF text mark -->
            <text x="20" y="21" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="white" text-anchor="middle">PDF</text>
          </svg>
          <div class="flex flex-col">
            <span class="text-xl font-bold text-gray-900 leading-tight">PDF<span class="text-blue-600">Pro</span></span>
            <span class="text-xs text-gray-500 leading-tight">Tools Suite</span>
          </div>
        </a>
        <div class="hidden md:flex items-center space-x-6">
          <a href="#/" class="text-gray-600 hover:text-gray-900">Home</a>
          <a href="#/blog" class="text-gray-600 hover:text-gray-900">Blog</a>
          <a href="#/about" class="text-gray-600 hover:text-gray-900">About</a>
          <a href="#/contact" class="text-gray-600 hover:text-gray-900">Contact</a>
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
        <a href="#/about" class="block text-gray-600 hover:text-gray-900 py-2">About</a>
        <a href="#/contact" class="block text-gray-600 hover:text-gray-900 py-2">Contact</a>
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
