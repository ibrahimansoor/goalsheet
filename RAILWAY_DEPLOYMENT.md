# Deploy Goal Sheet App to Railway

## Step-by-Step Deployment Instructions

### Prerequisites
- A GitHub account
- A Railway account (free tier available)

---

## Step 1: Push Code to GitHub

Your code is already in this repository. Make sure all changes are committed and pushed.

---

## Step 2: Create Railway Account

1. Go to **https://railway.app**
2. Click **"Start a New Project"** or **"Login"**
3. Sign up/Login with your **GitHub account** (recommended)
4. This will connect Railway to your GitHub repositories

---

## Step 3: Create New Project on Railway

1. Once logged in, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Railway will ask for permission to access your GitHub repositories
4. Click **"Configure GitHub App"** and grant access
5. Find and select your **"goalsheet"** repository
6. Railway will automatically detect it's a Node.js app

---

## Step 4: Configure Environment Variables

After selecting your repo, Railway will start deploying. You need to add environment variables:

1. In your Railway project dashboard, click on your service
2. Go to the **"Variables"** tab
3. Click **"Add Variable"** and add these one by one:

```
JWT_SECRET = your_super_secret_jwt_key_change_this_12345
NODE_ENV = production
PORT = (Leave blank - Railway sets this automatically)
```

**Important:** Change the JWT_SECRET to something secure and random!

---

## Step 5: Wait for Deployment

1. Railway will automatically:
   - Install dependencies
   - Build your frontend
   - Set up the database
   - Seed with sample data
   - Start the server

2. Watch the **"Deployments"** tab for progress
3. The deployment typically takes **2-5 minutes**
4. You'll see logs showing the build process

---

## Step 6: Get Your App URL

1. Once deployed successfully, go to the **"Settings"** tab
2. Scroll down to **"Domains"**
3. Click **"Generate Domain"**
4. Railway will create a public URL like: `https://your-app-name.up.railway.app`
5. **This is your live app URL!** 🎉

---

## Step 7: Access Your App

1. Click on the generated URL
2. You'll see your Goal Sheet App login page
3. Use these credentials to login:

**Manager Account:**
- Email: `manager@example.com`
- Password: `password123`

**Sales Rep Accounts:**
- Email: `john.doe@example.com`
- Password: `password123`
- Email: `jane.smith@example.com`
- Password: `password123`
- Email: `mike.wilson@example.com`
- Password: `password123`

---

## Step 8: Share with Your Team

Share the Railway URL with your team! Everyone can access it from any device with internet.

---

## Troubleshooting

### If Deployment Fails:

1. Check the **"Deployments"** tab for error logs
2. Common issues:
   - **Build timeout:** Railway free tier has limits. The app should build in under 5 minutes.
   - **Environment variables missing:** Make sure JWT_SECRET is set

### If App Shows Error:

1. Go to **"Deployments"** → Click latest deployment → View **"Build Logs"**
2. Look for errors in red
3. Most common fix: Restart the deployment by clicking **"Redeploy"**

### Need to Update Code:

1. Make changes to your code locally
2. Commit and push to GitHub
3. Railway **automatically redeploys** when you push to GitHub!

---

## Updating the App

Railway watches your GitHub repository. Any time you push changes:
1. Railway detects the change
2. Automatically rebuilds and redeploys
3. Your app updates with zero downtime!

---

## Railway Free Tier Limits

- **$5 free credit per month** (plenty for testing)
- App sleeps after inactivity (wakes up automatically when accessed)
- 500MB storage
- Unlimited public domains

---

## Need Help?

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

---

## Your App is Now Live! 🚀

Share your Railway URL with your team and start tracking those goals!
