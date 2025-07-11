# Netlify Deployment Troubleshooting

## Current Status
✅ **Files Ready**: All deployment files are prepared  
✅ **Build Configuration**: Updated netlify.toml with correct paths  
✅ **Serverless Function**: Built and ready at `netlify/functions/api.js`  
✅ **Frontend Build**: Static files at `dist/public/`  

## Common 404 Issues & Solutions

### 1. Build Directory Configuration
**Issue**: Netlify can't find the built files  
**Solution**: Ensure your Netlify build settings match:
- **Build command**: `npm run build`
- **Publish directory**: `dist/public`
- **Functions directory**: `netlify/functions`

### 2. Build Process
**Issue**: Build fails or incomplete  
**Solution**: Check build logs for errors, ensure:
```bash
# Run locally to test
npm run build
# Should create dist/public/ with index.html
```

### 3. Environment Variables
**Issue**: Database connection fails  
**Solution**: Add `DATABASE_URL` in Netlify Environment Variables:
- Go to Site Settings → Environment Variables
- Add `DATABASE_URL` with your Neon database connection string

### 4. API Routes Not Working
**Issue**: API calls return 404  
**Solution**: Verify the serverless function:
- Check `netlify/functions/api.js` exists
- Ensure redirects in `netlify.toml` are correct:
  ```toml
  [[redirects]]
    from = "/api/*"
    to = "/.netlify/functions/api/:splat"
    status = 200
  ```

### 5. SPA Routing
**Issue**: React Router paths show 404  
**Solution**: The fallback redirect should handle this:
  ```toml
  [[redirects]]
    from = "/*"
    to = "/index.html"
    status = 200
  ```

## Current File Structure
```
dist/
├── public/
│   ├── index.html          # Main HTML file
│   └── assets/
│       ├── index-*.js      # Bundled JS
│       └── index-*.css     # Bundled CSS
├── index.js                # Server bundle
netlify/
└── functions/
    └── api.js              # Serverless function
```

## Deployment Checklist

### Pre-Deployment
- [ ] `npm run build` runs successfully
- [ ] `dist/public/index.html` exists
- [ ] `netlify/functions/api.js` exists
- [ ] `netlify.toml` configured correctly

### Netlify Settings
- [ ] Repository connected
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist/public`
- [ ] Environment variable `DATABASE_URL` added
- [ ] Functions directory: `netlify/functions`

### Post-Deployment Testing
- [ ] Homepage loads (should show React app)
- [ ] API endpoints work: `https://your-site.netlify.app/api/dashboard/kpis`
- [ ] Dashboard displays data
- [ ] All sections populated

## Debug Steps

1. **Check Build Logs**:
   - Go to Netlify dashboard → Deploys
   - Click on latest deploy
   - Review build logs for errors

2. **Test API Endpoint**:
   ```bash
   curl https://your-site.netlify.app/api/dashboard/kpis
   ```

3. **Check Function Logs**:
   - Netlify dashboard → Functions
   - View logs for errors

4. **Verify Database**:
   - Ensure `DATABASE_URL` is set
   - Test connection from Netlify function

## Quick Fixes

### If Homepage Shows 404:
- Check publish directory is `dist/public`
- Verify `dist/public/index.html` exists after build

### If API Returns 404:
- Verify `netlify/functions/api.js` exists
- Check function logs for errors
- Ensure `DATABASE_URL` environment variable is set

### If Build Fails:
- Check build logs
- Verify all dependencies are in `package.json`
- Test `npm run build` locally

## Success Indicators
- ✅ Homepage loads with React app
- ✅ API endpoint `/api/dashboard/kpis` returns JSON
- ✅ Dashboard shows real data with charts
- ✅ All 8 product categories visible
- ✅ Order status distribution chart populated