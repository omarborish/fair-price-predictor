# Fair Price Predictor - Production Launch Checklist

## Pre-Launch Checklist

### Domain & Hosting
- [ ] Purchase domain name (e.g., fairpricepredictor.com)
- [ ] Set up Vercel account and connect GitHub repo
- [ ] Set up Railway/Render account for backend
- [ ] Configure DNS to point to Vercel/hosting

### Environment Configuration
- [ ] Create `.env.local` in web/ folder with production API URL
- [ ] Set `ENVIRONMENT=production` on backend server
- [ ] Set `FRONTEND_URL` on backend to your domain
- [ ] Verify HTTPS is enabled on both frontend and backend

### Security Verification
- [ ] Test rate limiting works (try 61+ predictions in an hour)
- [ ] Verify CORS rejects requests from unauthorized origins
- [ ] Check security headers are present (use securityheaders.com)
- [ ] Confirm error messages don't expose stack traces

### AdSense Setup
1. Apply at https://adsense.google.com
2. Add verification code to layout.tsx
3. Wait for approval (1-14 days)
4. After approval, update AdSlot.tsx with your publisher ID

### Monitoring
- [ ] Set up UptimeRobot for uptime monitoring
- [ ] Add error tracking (Sentry optional)
- [ ] Set up Google Search Console
- [ ] Submit sitemap.xml to Google

---

## Launch Day Checklist

### Final Tests
- [ ] Test prediction form end-to-end
- [ ] Test all pages load correctly
- [ ] Test mobile responsiveness
- [ ] Test dark mode toggle
- [ ] Verify cookie consent works

### Go Live
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Railway/Render
- [ ] Verify production URLs work
- [ ] Test rate limiting in production

### Announce
- [ ] Share on LinkedIn
- [ ] Share on Twitter/X
- [ ] Post in relevant communities
- [ ] Submit to Product Hunt (optional)

---

## Post-Launch Monitoring (Day 1-7)

### Daily Checks
- [ ] Check server logs for errors
- [ ] Monitor rate limiting effectiveness
- [ ] Review any user feedback
- [ ] Check uptime monitoring alerts

### Week 1 Goals
- [ ] Ensure stable uptime
- [ ] No major errors in logs
- [ ] AdSense approved (if not, reapply)
- [ ] First organic traffic from Google

---

## Scaling Checklist (When Needed)

### >1,000 daily users
- [ ] Add Redis for rate limiting (shared across instances)
- [ ] Add Redis for prediction caching
- [ ] Consider CDN for static assets

### >10,000 daily users
- [ ] Scale backend horizontally (multiple instances)
- [ ] Add proper database for rate limiting
- [ ] Consider dedicated ML inference server

---

## Quick Commands

### Train Model
```bash
cd "C:\Users\omarb\Desktop\Cursor\Fair Price Prediction"
.\venv\Scripts\python.exe training\train_model.py
```

### Start Backend (Development)
```bash
cd server
..\venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

### Start Frontend (Development)
```bash
cd web
npm run dev
```

### Build Frontend for Production
```bash
cd web
npm run build
```

---

## AdSense Integration Steps

### 1. Add Script to layout.tsx
```tsx
// In <head> section
<Script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
  crossOrigin="anonymous"
  strategy="lazyOnload"
/>
```

### 2. Update AdSlot.tsx
```tsx
// Replace placeholder with real AdSense code
<ins className="adsbygoogle"
  style={{ display: 'block' }}
  data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
  data-ad-slot="XXXXXXXXXX"
  data-ad-format="auto"
  data-full-width-responsive="true"
/>
```

### 3. Ad Slot IDs (create in AdSense dashboard)
- Header: Create "Header Leaderboard" ad unit
- Sidebar: Create "Sidebar Rectangle" ad unit
- In-content: Create "In-content" ad unit
- Footer: Create "Footer Leaderboard" ad unit

---

## Troubleshooting

### "Rate limit exceeded" message
- Normal! This protects against abuse
- Users get 60 predictions per hour
- Cache reduces repeated computations

### CORS errors in browser console
- Check FRONTEND_URL is set correctly on backend
- Verify the domain matches exactly (with/without www)

### Predictions failing
- Check backend logs for actual error
- Verify models are loaded (check /health endpoint)
- Ensure all model files exist in server/models/

### AdSense not showing ads
- Wait 24-48 hours after adding code
- Verify no ad blockers are active
- Check for policy violations in AdSense dashboard
