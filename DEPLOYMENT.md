# 🚀 Deployment Guide for KICKS Sneaker Store

## Current Deployments
- **Backend**: https://shoes-site.onrender.com
- **Frontend**: https://shoes-site-padvyk.vercel.app

---

## 📋 Backend Setup (Render)

### Environment Variables to Set on Render:

1. Go to your Render dashboard → Your service → Environment
2. Add these environment variables:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://avinashgulerias84_db_user:shoes@cluster0.iqdcq9s.mongodb.net/?appName=Cluster0
JWT_SECRET=this_is_a_temp_secret_key_change_me
FRONTEND_URL=https://shoes-site-padvyk.vercel.app

# Optional Services (Add when needed)
CLOUDINARY_CLOUD_NAME=placeholder
CLOUDINARY_API_KEY=placeholder
CLOUDINARY_API_SECRET=placeholder

RAZORPAY_KEY_ID=placeholder
RAZORPAY_KEY_SECRET=placeholder

REMOVE_BG_API_KEY=8U1G1LcRa7XPpa262S6jSono

WHAPI_API_TOKEN=placeholder

GOOGLE_CLIENT_ID=751776912347-9rj1bvapuafopgf7f1gr0usrdalrpt6m.apps.googleusercontent.com
```

### Important Notes for Render:
- Make sure "Auto-Deploy" is enabled so it redeploys on git push
- Build Command: `npm install`
- Start Command: `node server.js`
- Your backend will be at: `https://shoes-site.onrender.com`

---

## 🎨 Frontend Setup (Vercel)

### Environment Variables to Set on Vercel:

⚠️ **SECURITY WARNING**: Never commit `.env.production` to git! Always set environment variables directly in the Vercel dashboard.

1. Go to Vercel dashboard → Your project → Settings → Environment Variables
2. Add these for **Production** environment:

```env
VITE_API_URL=https://shoes-site.onrender.com
VITE_RAZORPAY_KEY_ID=placeholder
VITE_GOOGLE_CLIENT_ID=751776912347-9rj1bvapuafopgf7f1gr0usrdalrpt6m.apps.googleusercontent.com
```

3. After adding variables, redeploy: Deployments → Three dots menu → Redeploy

### Important Notes for Vercel:
- Framework Preset: **Vite**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- The `vercel.json` file is already configured for client-side routing

---

## ✅ Post-Deployment Checklist

### 1. Test API Connection
Visit: https://shoes-site.onrender.com
You should see: "API is running..."

### 2. Create Super Admin
Run this command locally (after deployment):
```bash
cd backend
node createAdmin.js
```

**Default Admin Credentials:**
- Email: admin@kicks.com
- Password: adminpassword123

⚠️ **IMPORTANT**: Change this password immediately after first login!

### 3. Test Frontend
Visit: https://shoes-site-padvyk.vercel.app
- Try logging in with admin credentials
- Check if products load
- Test adding to cart

### 4. Common Issues & Solutions

#### Problem: "Network Error" or "Failed to fetch"
**Solution**: 
- Check if backend is running: https://shoes-site.onrender.com
- Verify CORS settings in backend server.js
- Check environment variables on both platforms

#### Problem: Images not loading
**Solution**: 
- Set up Cloudinary and add credentials to Render environment variables
- Or use the uploads folder (requires persistent storage on Render)

#### Problem: Payment not working
**Solution**: 
- Add real Razorpay credentials to both Vercel and Render
- Test with Razorpay test mode first

#### Problem: Frontend routing not working (404 on refresh)
**Solution**: 
- The `vercel.json` file should handle this
- Make sure it's in the root of frontend folder

---

## 🔄 Updating Your Deployment

### To Update Backend:
```bash
git add .
git commit -m "your message"
git push origin main
```
Render will auto-deploy from your GitHub repo.

### To Update Frontend:
```bash
cd frontend
git add .
git commit -m "your message"
git push origin main
```
Vercel will auto-deploy from your GitHub repo.

---

## 🔐 Security Recommendations

1. **Change JWT Secret**: Generate a strong random string
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Update Admin Password**: Change immediately after first login

3. **Enable Cloudinary**: For secure image uploads instead of local storage

4. **Set up Razorpay**: For real payment processing

5. **Rate Limiting**: Consider adding rate limiting for API endpoints

6. **HTTPS Only**: Both deployments already use HTTPS ✅

---

## 📊 Monitoring

### Render Dashboard
- View logs: Render dashboard → Your service → Logs
- Monitor performance and errors
- Check deployment status

### Vercel Dashboard
- View deployment logs
- Monitor function executions
- Check analytics

---

## 🆘 Need Help?

If something isn't working:
1. Check the logs on Render/Vercel
2. Verify all environment variables are set correctly
3. Make sure MongoDB is accessible (check IP whitelist)
4. Test API endpoints directly using Postman or browser

---

## 🎉 You're All Set!

Your KICKS store is now live! Visit:
- **Store**: https://shoes-site-padvyk.vercel.app
- **API**: https://shoes-site.onrender.com
