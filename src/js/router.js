/**
 * Simple hash-based router for tool navigation
 */

let currentRoute = 'home'
let routes = {}

export function initRouter(routeHandlers) {
  routes = routeHandlers

  // Listen for hash changes
  window.addEventListener('hashchange', handleRouteChange)

  // Handle initial route
  handleRouteChange()
}

function handleRouteChange() {
  const hash = window.location.hash.slice(1) || 'home'
  const [route, ...params] = hash.split('/')

  currentRoute = route

  // Handle blog routes specially
  if (route === 'blog') {
    if (params.length > 0) {
      // Blog post page
      routes['blogPost'](params[0])
    } else {
      // Blog list page
      routes['blog']()
    }
  } else if (routes[route]) {
    routes[route](params)
  } else {
    routes['home']()
  }
}

export function navigateTo(route) {
  window.location.hash = route
}

export function getCurrentRoute() {
  return currentRoute
}
