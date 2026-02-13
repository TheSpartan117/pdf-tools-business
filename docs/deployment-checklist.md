# Deployment Checklist

This checklist ensures your PDF Tools application is properly configured and deployed to Netlify.

## Pre-Deployment Checklist

### Code Review
- [ ] All features tested locally
- [ ] Production build completes successfully (`npm run build`)
- [ ] Preview build works correctly (`npm run preview`)
- [ ] No console errors in browser
- [ ] All links work (navigation, footer links)
- [ ] Mobile responsiveness verified

### Configuration
- [ ] `netlify.toml` present and configured
- [ ] `.env.example` created (don't commit actual `.env`)
- [ ] AdSense client ID ready (if monetizing)
- [ ] Google Analytics ID ready (if tracking)
- [ ] Privacy Policy updated with your information
- [ ] Terms of Service updated with your information
- [ ] Contact information updated in footer

### Performance
- [ ] Bundle size acceptable (check build output)
- [ ] Images optimized (if any)
- [ ] No unnecessary dependencies
- [ ] Code splitting working (check dist/assets/)

### Security
- [ ] No sensitive data in code
- [ ] `.env` in `.gitignore`
- [ ] Security headers configured in `netlify.toml`
- [ ] HTTPS will be enforced by Netlify

## Netlify Deployment Steps

### 1. Create Netlify Account
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub/GitLab/Bitbucket (recommended) or email
3. Verify your email

### 2. Push Code to Git Repository
```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: PDF Tools application"

# Add remote (replace with your repository URL)
git remote add origin <your-repository-url>

# Push to remote
git push -u origin main
```

### 3. Connect Repository to Netlify
1. Log in to Netlify Dashboard
2. Click "Add new site" > "Import an existing project"
3. Choose your Git provider (GitHub/GitLab/Bitbucket)
4. Authorize Netlify to access your repositories
5. Select your repository from the list

### 4. Configure Build Settings
Netlify should auto-detect the settings from `netlify.toml`, but verify:

- **Base directory**: Leave empty (root)
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: Netlify will use default (16+)

### 5. Add Environment Variables
If using AdSense or Analytics:

1. Go to "Site settings" > "Environment variables"
2. Click "Add a variable"
3. Add each variable:
   - Key: `VITE_ADSENSE_CLIENT_ID`
   - Value: `ca-pub-XXXXXXXXXXXXXXXX` (your actual ID)
   - Click "Create variable"
4. Repeat for `VITE_GA_TRACKING_ID` if using Analytics

### 6. Deploy
1. Click "Deploy site"
2. Wait for build to complete (usually 1-2 minutes)
3. Netlify will provide a random subdomain: `random-name-123.netlify.app`

### 7. Verify Deployment
- [ ] Site loads correctly
- [ ] Test each PDF tool (merge, split, compress, pdf-to-image)
- [ ] Check mobile view
- [ ] Verify footer links work
- [ ] Check Privacy Policy and Terms pages
- [ ] Confirm AdSense ads appear (if configured)
- [ ] Test on different browsers

## Custom Domain Setup

### Option 1: Use Netlify DNS (Recommended)
1. Go to "Site settings" > "Domain management"
2. Click "Add custom domain"
3. Enter your domain (e.g., `pdftools.example.com`)
4. Netlify will provide nameservers
5. Update nameservers at your domain registrar
6. Wait for DNS propagation (up to 48 hours)
7. Netlify will automatically provision SSL certificate

### Option 2: Use External DNS
1. Go to "Site settings" > "Domain management"
2. Click "Add custom domain"
3. Enter your domain
4. Add DNS records at your provider:
   - For root domain: A record to Netlify's load balancer IP
   - For subdomain: CNAME record to `random-name-123.netlify.app`
5. Wait for DNS propagation
6. Netlify will automatically provision SSL certificate

## Post-Deployment Tasks

### Immediate Tasks
- [ ] Test all functionality on live site
- [ ] Check SSL certificate is active (https://)
- [ ] Verify custom domain works (if configured)
- [ ] Test on multiple devices and browsers
- [ ] Submit sitemap to Google Search Console (optional)
- [ ] Set up domain in Google AdSense (if monetizing)

### Monitoring Setup
- [ ] Add site to Google Search Console
- [ ] Configure Google Analytics (if using)
- [ ] Set up Netlify Analytics (optional, paid feature)
- [ ] Configure Netlify notifications (email/Slack for deploy failures)

### AdSense Configuration
If monetizing with AdSense:
1. Log in to [Google AdSense](https://www.google.com/adsense)
2. Go to Sites
3. Add your domain
4. Wait for verification (can take 24-48 hours)
5. Once verified, ads will start appearing
6. Monitor performance in AdSense dashboard

### Optional Enhancements
- [ ] Set up continuous deployment (auto-deploy on git push)
- [ ] Configure deploy previews for pull requests
- [ ] Set up A/B testing (Netlify Split Testing)
- [ ] Add build notifications (Slack, email)
- [ ] Configure branch deploys for staging

## Continuous Deployment

Netlify automatically deploys on every push to your connected branch:

1. Make changes locally
2. Commit and push to repository
```bash
git add .
git commit -m "Update feature"
git push
```
3. Netlify detects the push and builds automatically
4. Check deploy progress in Netlify Dashboard
5. New version goes live after successful build

## Troubleshooting

### Build Fails
- Check build logs in Netlify Dashboard
- Verify `package.json` scripts are correct
- Ensure all dependencies are in `package.json` (not just devDependencies)
- Try building locally first: `npm run build`

### Site Not Loading
- Check if build succeeded
- Verify publish directory is `dist`
- Check for errors in browser console
- Review Netlify function logs if using functions

### Environment Variables Not Working
- Ensure variable names start with `VITE_`
- Re-deploy after adding environment variables
- Check variable is correctly set in Netlify dashboard
- Verify variable is being used in code: `import.meta.env.VITE_*`

### Custom Domain Issues
- Wait for DNS propagation (can take up to 48 hours)
- Verify DNS records are correct
- Check domain registrar settings
- Use [DNS Checker](https://dnschecker.org) to verify propagation

### AdSense Not Showing
- Ensure site is verified in AdSense
- AdSense client ID must be correct
- Can take 24-48 hours for approval
- Check browser console for errors
- Verify ad blocker is disabled when testing

## Support Resources

- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Netlify Support**: [community.netlify.com](https://community.netlify.com)
- **Vite Docs**: [vitejs.dev](https://vitejs.dev)
- **AdSense Help**: [support.google.com/adsense](https://support.google.com/adsense)

---

**Last Updated**: February 2026
