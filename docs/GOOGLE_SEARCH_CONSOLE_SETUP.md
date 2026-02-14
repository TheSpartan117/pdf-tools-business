# Google Search Console Setup Guide

## Why Use Search Console?

Google Search Console helps you:
- Monitor how Google indexes your site
- Submit sitemaps for faster indexing
- Track search performance (clicks, impressions, rankings)
- Identify and fix SEO issues
- See which keywords drive traffic

## Setup Steps

### Step 1: Create Search Console Account

1. Visit https://search.google.com/search-console
2. Sign in with Google account (same one for AdSense recommended)
3. Click "Start now" or "Add property"

### Step 2: Add Your Property

1. Click "+ Add property" button
2. Choose "URL prefix" method
3. Enter: `https://pdf-tools-business.vercel.app`
4. Click "Continue"

### Step 3: Verify Ownership

**Method 1: HTML File (Recommended)**
1. Download verification file (googleXXXXXXXXXXXX.html)
2. Replace `/public/google-verification.html` with downloaded file
3. Commit and push to deploy
4. Wait 1-2 minutes for deployment
5. Return to Search Console
6. Click "Verify"

**Method 2: HTML Tag**
1. Copy verification meta tag
2. Add to `index.html` in `<head>` section:
   ```html
   <meta name="google-site-verification" content="XXXXXXXXXXXXXXXXXXXX" />
   ```
3. Commit and deploy
4. Click "Verify" in Search Console

### Step 4: Submit Sitemap

After verification:
1. In Search Console left sidebar, click "Sitemaps"
2. Enter sitemap URL: `sitemap.xml`
3. Click "Submit"
4. Status will change to "Success" after indexing

### Step 5: Monitor Indexing

**Check which pages are indexed:**
1. Go to "Pages" section
2. View "Indexed" and "Not indexed" pages
3. Fix any issues reported

**Request indexing for new pages:**
1. Go to "URL Inspection" at top
2. Enter URL of new page
3. Click "Request indexing"
4. Google will crawl within hours/days

## What to Monitor

### Performance Report
Track (after 2-3 weeks of data):
- **Impressions:** How often your site appears in search
- **Clicks:** How many users click from search
- **CTR (Click-through rate):** clicks ÷ impressions
- **Average position:** Your ranking for queries

**Target metrics (Month 3+):**
- Impressions: 10,000+/month
- Clicks: 300+/month
- CTR: 3%+
- Position: Top 10 for target keywords

### Coverage Report
Check for errors:
- **4xx errors:** Pages not found (fix broken links)
- **5xx errors:** Server errors (check backend)
- **Soft 404s:** Pages with little content
- **Redirect errors:** Fix redirect chains

### Core Web Vitals
Monitor user experience metrics:
- **LCP (Largest Contentful Paint):** <2.5s
- **FID (First Input Delay):** <100ms
- **CLS (Cumulative Layout Shift):** <0.1

## Troubleshooting

### "Verification failed"
- Wait 2-3 minutes after deployment
- Clear browser cache
- Check file is accessible at: `https://pdf-tools-business.vercel.app/googleXXXXXXXXXXXX.html`
- Try alternative verification method (HTML tag)

### "Sitemap could not be read"
- Verify sitemap is accessible: `https://pdf-tools-business.vercel.app/sitemap.xml`
- Check XML syntax is valid
- Wait 24 hours and resubmit

### "Pages not being indexed"
- Submit sitemap if not done
- Request indexing via URL Inspection
- Check robots.txt isn't blocking
- Wait 1-2 weeks for Google to crawl

### "No data available yet"
- Search Console needs 2-3 days of data
- Check back after a week
- Ensure site has some organic traffic

## Best Practices

**Weekly:**
- Check for new index coverage issues
- Monitor position changes for target keywords
- Review search queries driving traffic

**Monthly:**
- Analyze performance trends
- Identify new keyword opportunities
- Update content for declining rankings

**After adding new content:**
- Request indexing for new blog posts
- Submit updated sitemap
- Monitor for successful indexing

## Integration with SEO Strategy

**Month 1-2:**
- Submit all tool pages for indexing
- Monitor initial ranking positions
- Identify quick-win keywords

**Month 3-6:**
- Track blog post performance
- Optimize underperforming pages
- Build internal linking based on data

**Month 6+:**
- Analyze which content drives most traffic
- Double down on successful topics
- Update old content for better rankings

## Next Steps

After Search Console setup:
1. ✅ Verify site ownership
2. ✅ Submit sitemap
3. ✅ Request indexing for all tool pages
4. ✅ Set up email alerts for issues
5. ✅ Check back weekly for performance data

**Timeline:**
- **Day 1:** Setup complete
- **Day 3-7:** First pages indexed
- **Week 2-3:** Performance data appears
- **Month 2+:** Meaningful traffic insights
