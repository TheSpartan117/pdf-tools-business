// Main application entry point
console.log('PDF Tools application starting...');

// Update the app content
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = '<h1 class="text-4xl font-bold text-center mt-10">PDF Tools Loading...</h1>';
  }
});
