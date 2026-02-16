/**
 * Ad unit placeholders for Google AdSense
 * Ad slot IDs will be updated after AdSense approval
 */

export function createTopBannerAd() {
  const ad = document.createElement('div')
  ad.className = 'container mx-auto px-4 py-4'
  ad.innerHTML = `
    <div class="bg-gray-100 border border-gray-300 rounded p-4">
      <p class="text-xs text-gray-500 text-center mb-2">Advertisement</p>
      <!-- AdSense Top Banner (728x90) -->
      <div class="flex justify-center">
        <ins class="adsbygoogle"
             style="display:inline-block;width:728px;height:90px"
             data-ad-client="ca-pub-5124725611632243"
             data-ad-slot="XXXXXXXXXX"></ins>
      </div>
      <!-- Placeholder visible until AdSense approved -->
      <div class="bg-white border-2 border-dashed border-gray-300 rounded flex items-center justify-center" style="height:90px;max-width:728px;margin:0 auto;">
        <div class="text-gray-400 text-center">
          <p class="font-medium">728x90 Banner Ad</p>
          <p class="text-xs">Google AdSense - Pending Approval</p>
        </div>
      </div>
    </div>
  `
  return ad
}

export function createSidebarAd(position) {
  const ad = document.createElement('div')
  ad.className = 'bg-gray-100 rounded-lg p-4 text-center'
  ad.innerHTML = `
    <div class="text-gray-500 text-sm mb-2">Advertisement</div>
    <div class="bg-white border-2 border-dashed border-gray-300 rounded h-[600px] flex items-center justify-center">
      <div class="text-gray-400">
        <p class="font-medium">300x600</p>
        <p class="text-xs">${position} sidebar ad</p>
        <p class="text-xs mt-2">Google AdSense</p>
      </div>
    </div>
  `
  return ad
}

export function createInArticleAd() {
  const ad = document.createElement('div')
  ad.className = 'my-8'
  ad.innerHTML = `
    <div class="bg-gray-100 border border-gray-300 rounded p-4">
      <p class="text-xs text-gray-500 text-center mb-2">Advertisement</p>
      <!-- AdSense In-Article (Responsive) -->
      <ins class="adsbygoogle"
           style="display:block; text-align:center;"
           data-ad-layout="in-article"
           data-ad-format="fluid"
           data-ad-client="ca-pub-5124725611632243"
           data-ad-slot="XXXXXXXXXX"></ins>
      <!-- Placeholder visible until AdSense approved -->
      <div class="bg-white border-2 border-dashed border-gray-300 rounded flex items-center justify-center py-12">
        <div class="text-gray-400 text-center">
          <p class="font-medium">Responsive In-Article Ad</p>
          <p class="text-xs">Google AdSense - Pending Approval</p>
        </div>
      </div>
    </div>
  `
  return ad
}

export function initAds() {
  // Push ads to AdSense after page load
  if (window.adsbygoogle) {
    const ads = document.querySelectorAll('.adsbygoogle')
    ads.forEach(ad => {
      if (!ad.dataset.adsbygoogleStatus) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({})
        } catch (e) {
          console.error('AdSense error:', e)
        }
      }
    })
  }
}

/**
 * Create top banner ad for tool pages
 * @returns {HTMLElement}
 */
export function createToolTopBannerAd() {
  const adContainer = document.createElement('div')
  adContainer.className = 'max-w-4xl mx-auto mb-8'
  adContainer.innerHTML = `
    <div class="bg-gray-100 border border-gray-300 rounded p-4">
      <p class="text-xs text-gray-500 text-center mb-2">Advertisement</p>
      <!-- Top Banner Ad Unit -->
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="ca-pub-5124725611632243"
           data-ad-slot="XXXXXXXXXX"
           data-ad-format="horizontal"
           data-full-width-responsive="true"></ins>
    </div>
  `

  // Initialize ad after a small delay to ensure DOM is ready
  setTimeout(() => {
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (e) {
      console.warn('AdSense not loaded yet:', e)
    }
  }, 100)

  return adContainer
}

/**
 * Create sidebar ad for tool pages (desktop only)
 * @returns {HTMLElement}
 */
export function createToolSidebarAd() {
  const adContainer = document.createElement('div')
  adContainer.className = 'hidden lg:block sticky top-4'
  adContainer.innerHTML = `
    <div class="bg-gray-100 border border-gray-300 rounded p-4 w-[300px]">
      <p class="text-xs text-gray-500 text-center mb-2">Advertisement</p>
      <!-- Sidebar Ad Unit -->
      <ins class="adsbygoogle"
           style="display:inline-block;width:300px;height:600px"
           data-ad-client="ca-pub-5124725611632243"
           data-ad-slot="YYYYYYYYYY"></ins>
    </div>
  `

  setTimeout(() => {
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (e) {
      console.warn('AdSense not loaded yet:', e)
    }
  }, 100)

  return adContainer
}

/**
 * Create in-content ad for after tool usage
 * @returns {HTMLElement}
 */
export function createInContentAd() {
  const adContainer = document.createElement('div')
  adContainer.className = 'bg-gray-100 border border-gray-300 rounded p-4 mt-8'
  adContainer.innerHTML = `
    <p class="text-xs text-gray-500 text-center mb-2">Advertisement</p>
    <!-- In-Content Ad Unit -->
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-format="fluid"
         data-ad-layout-key="-fb+5w+4e-db+86"
         data-ad-client="ca-pub-5124725611632243"
         data-ad-slot="ZZZZZZZZZZ"></ins>
  `

  setTimeout(() => {
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (e) {
      console.warn('AdSense not loaded yet:', e)
    }
  }, 100)

  return adContainer
}
