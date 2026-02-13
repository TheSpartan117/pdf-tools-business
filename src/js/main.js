// Main application entry point
console.log('PDF Tools app initializing...')

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready')
  initApp()
})

function initApp() {
  const app = document.getElementById('app')
  app.innerHTML = `
    <div class="min-h-screen">
      <h1 class="text-4xl font-bold text-center py-8">PDF Tools</h1>
      <p class="text-center text-gray-600">Setup complete! Ready to build features.</p>
    </div>
  `
}
