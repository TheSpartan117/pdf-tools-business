/**
 * Simple hash-based router for tool navigation
 */

let currentRoute = 'home'
let routes = {}

export function initRouter(routeHandlers) {
  console.log('Router initialized with handlers:', Object.keys(routeHandlers))
  routes = routeHandlers

  // Listen for hash changes
  window.addEventListener('hashchange', () => {
    console.log('Router - hashchange event fired')
    handleRouteChange()
  })

  // Handle initial route
  console.log('Router - handling initial route')
  handleRouteChange()
}

function handleRouteChange() {
  let hash = window.location.hash.slice(1) || 'home'
  // Remove leading slash if present
  if (hash.startsWith('/')) {
    hash = hash.slice(1)
  }
  console.log('Router handleRouteChange - hash:', hash)
  const [route, ...params] = hash.split('/')
  console.log('Router - route:', route, 'params:', params)

  currentRoute = route

  // Scroll to top on route change
  window.scrollTo({ top: 0, behavior: 'smooth' })

  // Handle blog routes specially
  if (route === 'blog') {
    console.log('Router - blog route detected')
    if (params.length > 0) {
      console.log('Router - calling blogPost handler')
      // Blog post page
      routes['blogPost'](params[0])
    } else {
      console.log('Router - calling blog handler')
      // Blog list page
      routes['blog']()
    }
  } else if (routes[route]) {
    console.log('Router - calling route handler for:', route)
    routes[route](params)
  } else {
    console.log('Router - route not found, defaulting to home')
    routes['home']()
  }
}

export function navigateTo(route) {
  window.location.hash = route
}

export function getCurrentRoute() {
  return currentRoute
}
