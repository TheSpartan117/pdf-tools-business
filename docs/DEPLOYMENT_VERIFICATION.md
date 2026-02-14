# Deployment Verification Checklist

Run this checklist after each major deployment.

## Functional Tests

### Homepage
- [ ] Page loads correctly
- [ ] All 9 tool cards displayed
- [ ] Navigation works
- [ ] Footer links work
- [ ] Ad placeholders visible (before AdSense approval)

### Tool Pages (test 2-3 randomly)
- [ ] Page loads
- [ ] Tool functionality works
- [ ] File upload/download works
- [ ] FAQ section displays
- [ ] Back button works
- [ ] Ad placeholders visible

### Blog
- [ ] Blog index loads
- [ ] 3 articles displayed
- [ ] Clicking article opens post
- [ ] Article content displays correctly
- [ ] Back to blog link works
- [ ] Blog link in header works

### Static Pages
- [ ] Privacy policy accessible
- [ ] Terms of service accessible
- [ ] Footer links work

## SEO Verification

### Meta Tags
- [ ] View page source on homepage
- [ ] Check title tag is correct
- [ ] Check meta description exists
- [ ] Visit 2-3 tool pages, verify unique titles

### Schema Markup
- [ ] View source on tool page
- [ ] Find `<script type="application/ld+json">`
- [ ] Verify SoftwareApplication schema
- [ ] Verify FAQPage schema

### Sitemap & Robots
- [ ] Visit /sitemap.xml - displays correctly
- [ ] Visit /robots.txt - displays correctly
- [ ] Sitemap lists 15+ URLs
- [ ] All URLs in sitemap are accessible

### Rich Results
- [ ] Test tool page at https://search.google.com/test/rich-results
- [ ] Verify no errors
- [ ] Schema types detected correctly

### Mobile Responsiveness
- [ ] Test on mobile device or browser DevTools
- [ ] All pages render correctly
- [ ] Touch targets are adequate size
- [ ] No horizontal scrolling

### Performance
- [ ] Run PageSpeed Insights
- [ ] Core Web Vitals in green
- [ ] Performance score 90+
- [ ] No major issues reported

## AdSense (After Approval)

- [ ] Ads displaying on homepage
- [ ] Ads displaying on tool pages (3 placements)
- [ ] Ads displaying on blog pages
- [ ] No ad overlap or layout issues
- [ ] Check AdSense dashboard shows impressions

## Google Search Console (After Setup)

- [ ] Site verified
- [ ] Sitemap submitted and processed
- [ ] No coverage errors
- [ ] Pages being indexed
- [ ] No Core Web Vitals issues

## Post-Deployment Actions

### Immediate (Within 1 hour)
- [ ] Monitor Vercel deployment logs for errors
- [ ] Check backend API is responding
- [ ] Test 1-2 file conversions end-to-end

### Within 24 hours
- [ ] Submit sitemap to Search Console (if not done)
- [ ] Request indexing for new pages
- [ ] Monitor error logs for issues

### Within 1 week
- [ ] Check Search Console for indexing status
- [ ] Monitor analytics for traffic
- [ ] Verify AdSense impressions (if approved)

## Rollback Plan

If critical issues found:

1. **Identify issue severity:**
   - **Critical:** Site broken, no tools work → immediate rollback
   - **Major:** Some tools broken → fix and redeploy within hours
   - **Minor:** SEO issues, cosmetic bugs → fix in next release

2. **Rollback via Vercel:**
   - Go to Vercel dashboard
   - Select previous successful deployment
   - Click "Promote to Production"

3. **Fix and redeploy:**
   - Fix issue locally
   - Test thoroughly
   - Redeploy

## Notes

- Run this checklist after every deployment
- Save results with date and deployment version
- Track issues over time to identify patterns
