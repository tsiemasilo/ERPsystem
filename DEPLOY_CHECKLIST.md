# Deployment Checklist - Critical Actions

## 🚨 **Immediate Actions Required**

### 1. **Manual Files to Copy**
After each deploy, copy these files to the correct locations:
```bash
cp _redirects dist/public/
```

### 2. **Test These Endpoints After Deploy**
- `https://your-site.netlify.app/.netlify/functions/hello`
- `https://your-site.netlify.app/.netlify/functions/test`  
- `https://your-site.netlify.app/.netlify/functions/kpis`

### 3. **Check Netlify Function Logs**
- Go to Netlify Dashboard → Functions
- Look for build errors or runtime errors

### 4. **Verify Environment Variables**
- Ensure `DATABASE_URL` is set in Netlify environment variables
- Should be your Neon database connection string

## 📋 **Current Configuration**

✅ **Functions Directory**: `netlify/functions`  
✅ **Publish Directory**: `dist/public`  
✅ **Functions Created**: hello.js, test.js, kpis.js  
✅ **Redirects**: Both netlify.toml and _redirects file  

## 🔧 **What's Fixed**

1. **Added functions directory** to netlify.toml
2. **Created _redirects file** for routing
3. **Simplified function structure** 
4. **Added hello.js** for basic testing

## 🎯 **Expected Results**

**Hello Function** should return:
```json
{
  "message": "Hello from Netlify Functions!",
  "timestamp": "2025-01-11T..."
}
```

**Test Function** should show environment status

**KPIs Function** should return your actual data

## 📝 **If Still Not Working**

1. **Check Netlify build logs** for function compilation errors
2. **Verify function directory** is being recognized
3. **Test direct URLs** first before testing redirects
4. **Check environment variables** are properly set

## 🔄 **Next Deploy Steps**

1. Push changes to GitHub
2. Wait for Netlify to redeploy
3. Test the hello function first
4. Check function logs for errors
5. Verify environment variables