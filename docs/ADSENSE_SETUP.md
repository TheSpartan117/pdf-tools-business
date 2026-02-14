# Google AdSense Setup Instructions

## Step 1: Apply for AdSense

1. Visit https://www.google.com/adsense
2. Sign in with Google account
3. Add website: https://pdf-tools-business.vercel.app
4. Complete application
5. Wait 1-2 weeks for approval

## Step 2: Get Publisher ID

After approval:
1. Go to Account > Settings in AdSense dashboard
2. Find Publisher ID (format: ca-pub-XXXXXXXXXXXXXXXX)
3. Copy this ID

## Step 3: Update Code

Replace `ca-pub-XXXXXXXXXXXXXXXX` in these files:
- `index.html` line 12
- `src/js/components/ad-units.js` (3 locations)

## Step 4: Create Ad Units

In AdSense dashboard:
1. Go to Ads > By ad unit
2. Create 3 ad units:
   - **Top Banner**: Display, horizontal, responsive
   - **Sidebar**: Display, 300x600, fixed
   - **In-Content**: Display, responsive, fluid

3. Copy each ad slot ID (XXXXXXXXXX format)
4. Update in `src/js/components/ad-units.js`:
   - Top Banner: data-ad-slot="XXXXXXXXXX"
   - Sidebar: data-ad-slot="YYYYYYYYYY"
   - In-Content: data-ad-slot="ZZZZZZZZZZ"

## Step 5: Deploy & Test

1. Commit and push changes
2. Wait 20-30 minutes for ads to appear
3. Test on live site (ads don't show on localhost)
4. Check AdSense dashboard for impressions

## Revenue Monitoring

Track performance in AdSense dashboard:
- Page RPM (revenue per 1000 page views)
- CTR (click-through rate)
- CPC (cost per click)
- Total earnings

Target metrics:
- RPM: $3-8
- CTR: 1.5%+
- Monthly revenue: $1,500+ by Month 6
