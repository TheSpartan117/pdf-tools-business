/**
 * Ad unit placeholders for Google AdSense
 * Replace data-ad-client and data-ad-slot with real values after AdSense approval
 */

export function createTopBannerAd() {
  const ad = document.createElement('div')
  ad.className = 'container mx-auto px-4 py-4'
  ad.innerHTML = `
    <!-- AdSense Top Banner (728x90) -->
    <div class="flex justify-center">
      <ins class="adsbygoogle"
           style="display:inline-block;width:728px;height:90px"
           data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
           data-ad-slot="XXXXXXXXXX"></ins>
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
    <!-- AdSense In-Article (Responsive) -->
    <ins class="adsbygoogle"
         style="display:block; text-align:center;"
         data-ad-layout="in-article"
         data-ad-format="fluid"
         data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
         data-ad-slot="XXXXXXXXXX"></ins>
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
