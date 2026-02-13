# Google AdSense Setup Guide

## Overview

This document explains how to integrate Google AdSense into the PDF Tools application after receiving AdSense approval.

## Step 1: Apply for Google AdSense

1. Go to [Google AdSense](https://www.google.com/adsense/)
2. Sign in with your Google account
3. Add your website URL (your deployed Netlify domain)
4. Complete the application form with your details
5. Add the AdSense verification code to your site (if required)
6. Wait for approval (typically 1-2 weeks)

**Requirements for approval:**
- Site must have original, quality content
- Site must comply with AdSense program policies
- Site must have sufficient traffic (recommended: 50+ daily visitors)
- Site must have clear privacy policy and terms of service (already included)

## Step 2: Get Your AdSense Publisher ID

After approval:
1. Log into your AdSense account
2. Go to Account > Settings
3. Find your Publisher ID (format: `ca-pub-XXXXXXXXXXXXXXXX`)
4. Copy this ID - you'll need it in the next steps

## Step 3: Update AdSense Script in HTML

1. Open `index.html`
2. Find the commented AdSense script in the `<head>` section
3. Replace `ca-pub-XXXXXXXXXXXXXXXX` with your actual Publisher ID
4. Uncomment the script tags

**Before:**
```html
<!-- <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
     crossorigin="anonymous"></script> -->
```

**After:**
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"
     crossorigin="anonymous"></script>
```

## Step 4: Create Ad Units in AdSense

1. In AdSense dashboard, go to Ads > By ad unit
2. Click "+ New ad unit"
3. Create the following ad units:

### Top Banner Ad
- Ad unit name: "Top Banner"
- Ad size: Display (728x90)
- Ad type: Display ads

### Sidebar Ad (optional)
- Ad unit name: "Sidebar"
- Ad size: Display (300x600)
- Ad type: Display ads

### In-Article Ad (optional)
- Ad unit name: "In-Article"
- Ad size: Responsive
- Ad type: In-article

4. Copy the ad slot IDs for each unit

## Step 5: Update Ad Slot IDs in Code

Open `src/js/components/ad-units.js` and update each ad unit:

### Top Banner Ad
Replace:
```javascript
data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
data-ad-slot="XXXXXXXXXX"
```

With your actual IDs:
```javascript
data-ad-client="ca-pub-1234567890123456"
data-ad-slot="9876543210"
```

Repeat for all ad units (sidebar and in-article).

## Step 6: Test Ad Display

1. Deploy your changes to production
2. Visit your live site (not localhost)
3. Wait 10-20 minutes for ads to start appearing
4. Check AdSense dashboard to verify ad impressions

**Note:** Ads will NOT display on localhost. You must test on your deployed site.

## Ad Placement Strategy

Current placement:
- **Top Banner**: Between hero section and features grid on homepage

Recommended additional placements:
- **Tool pages**: Add sidebar ad on desktop, banner on mobile
- **Below tool interface**: Add in-article ad after tool usage area

## Expected Revenue Estimates

Revenue depends on traffic and niche. Typical estimates for PDF tools:

- **1,000 daily visitors**: $5-15/day ($150-450/month)
- **5,000 daily visitors**: $25-75/day ($750-2,250/month)
- **10,000 daily visitors**: $50-150/day ($1,500-4,500/month)

**Factors affecting revenue:**
- Geographic location of visitors (US/UK/Canada pay more)
- Click-through rate (CTR)
- Cost per click (CPC) for your niche
- Ad placement and visibility

## Best Practices

1. **Don't overload with ads**: Start with 1-2 ad units, add more gradually
2. **Monitor performance**: Check AdSense reports weekly
3. **Optimize placement**: Test different positions to find what works
4. **Follow policies**: Never click your own ads or encourage clicks
5. **Mobile optimization**: Ensure ads display well on mobile devices
6. **Page speed**: Monitor that ads don't slow down your site significantly

## AdSense Policy Compliance

**Do:**
- Place ads in visible locations
- Label ads clearly if required
- Keep privacy policy updated
- Monitor invalid click activity

**Don't:**
- Click your own ads
- Ask others to click ads
- Place ads on error pages
- Use misleading ad placement

## Troubleshooting

### Ads not showing:
- Check that AdSense script is uncommented
- Verify Publisher ID is correct
- Wait 20-30 minutes after deployment
- Check browser console for errors
- Ensure ad blocker is disabled when testing

### Low earnings:
- Increase site traffic through SEO
- Optimize ad placement
- Test different ad formats
- Focus on high-value geographic regions

## Support

- AdSense Help Center: https://support.google.com/adsense
- AdSense Community: https://support.google.com/adsense/community
- Email support through AdSense dashboard

## Next Steps After Setup

1. Monitor performance for 2-4 weeks
2. Experiment with additional ad placements
3. A/B test different ad formats
4. Consider adding ads to tool pages
5. Optimize for mobile ad revenue
