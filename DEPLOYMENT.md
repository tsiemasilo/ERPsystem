# Deployment Guide

## GitHub Setup

1. **Create a new repository** on GitHub
2. **Initialize git and push your code**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: ERP integration platform"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git push -u origin main
   ```

## Netlify Deployment

### Step 1: Prepare Neon Database
1. Go to [Neon Database](https://neon.tech)
2. Create a new project
3. Copy your connection string (DATABASE_URL)

### Step 2: Deploy to Netlify
1. **Connect Repository**:
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Configure Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

3. **Environment Variables**:
   - Add `DATABASE_URL` with your Neon connection string

4. **Deploy**:
   - Click "Deploy site"
   - Wait for build to complete

### Step 3: Initialize Database
After deployment, run once to set up the database schema:
```bash
npm run db:push
```

## Files Ready for Deployment

✅ **Configuration Files**:
- `netlify.toml` - Netlify configuration
- `package.json` - Dependencies and scripts
- `README.md` - Documentation
- `DEPLOYMENT.md` - This deployment guide

✅ **Build Files**:
- `dist/public/` - Frontend production build
- `dist/index.js` - Backend production bundle
- `netlify/functions/api.js` - Serverless function

✅ **Database**:
- Complete schema with mock data
- 35+ products across 8 categories
- 55+ orders with diverse statuses
- Realistic inventory and analytics data

## Environment Variables Required

- `DATABASE_URL` - Your Neon PostgreSQL connection string

## Post-Deployment

1. **Verify deployment** at your Netlify URL
2. **Test API endpoints** at `https://your-site.netlify.app/api/dashboard/kpis`
3. **Check dashboard** for data visualization
4. **Monitor logs** in Netlify Functions dashboard

## Troubleshooting

- **Build fails**: Check build logs in Netlify
- **Database connection**: Verify DATABASE_URL in environment variables
- **API not working**: Check Netlify Functions logs
- **No data**: Ensure database schema is pushed with `npm run db:push`