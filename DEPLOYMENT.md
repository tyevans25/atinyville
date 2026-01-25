# Deploying to Vercel 🚀

This guide will help you deploy your ATEEZ quiz to the internet for FREE!

## What is Vercel?

Vercel is a platform that hosts websites for free. It's perfect for Next.js apps like this quiz!

## Step-by-Step Deployment

### 1. Create a GitHub Account
1. Go to https://github.com
2. Click "Sign up"
3. Follow the steps to create your account
4. Verify your email

### 2. Upload Your Code to GitHub

**Option A: Using GitHub Desktop (Easier for beginners)**
1. Download GitHub Desktop from https://desktop.github.com/
2. Install and sign in with your GitHub account
3. Click "File" → "Add Local Repository"
4. Select your `ateez-streaming-quiz` folder
5. Click "Publish repository"
6. Uncheck "Keep this code private" if you want to share it
7. Click "Publish repository"

**Option B: Using Command Line**
1. Open terminal in your project folder
2. Run these commands one by one:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
```
3. Go to GitHub and create a new repository
4. Follow GitHub's instructions to push your code

### 3. Deploy on Vercel
1. Go to https://vercel.com
2. Click "Sign Up" and choose "Continue with GitHub"
3. Authorize Vercel to access your GitHub
4. Click "Import Project" or "Add New..."
5. Click "Continue with GitHub"
6. Find your `ateez-streaming-quiz` repository and click "Import"
7. Vercel will auto-detect it's a Next.js project
8. Click "Deploy"
9. Wait 2-3 minutes for deployment to complete
10. You'll get a URL like `your-quiz.vercel.app` 🎉

## Updating Your Quiz

Every time you make changes:

**If using GitHub Desktop:**
1. Make your changes to the code
2. Open GitHub Desktop
3. Write a summary of changes (e.g., "Added new questions")
4. Click "Commit to main"
5. Click "Push origin"
6. Vercel will automatically update your site!

**If using command line:**
```bash
git add .
git commit -m "Description of changes"
git push
```

Vercel automatically deploys every time you push to GitHub!

## Custom Domain (Optional)

Want a custom URL like `ateez-quiz.com`?
1. Buy a domain from Namecheap, Google Domains, etc.
2. In Vercel dashboard, go to your project
3. Click "Settings" → "Domains"
4. Add your domain and follow instructions

## Troubleshooting

**Build fails on Vercel:**
- Check the error message in Vercel's deployment logs
- Make sure your code works locally first (`npm run dev`)
- Common issue: missing files or typos

**Site doesn't update:**
- Check GitHub to make sure your code was pushed
- Check Vercel dashboard for deployment status
- May take 1-2 minutes for changes to appear

**YouTube videos don't play:**
- Make sure you're using the `/embed/` URL format
- Check that the video isn't restricted

## Sharing Your Quiz

Once deployed, share your quiz on Twitter:
```
🏴‍☠️ Test your ATEEZ knowledge!
Stream while you play - every watch counts! ⚡

[YOUR-VERCEL-URL]

Challenge other ATINYs! 💜
#ATEEZ #에이티즈 #ATINY
```

---

## Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **GitHub Docs**: https://docs.github.com
- **Discord Communities**: Search for "ATINY dev" or "K-pop dev"

Remember: Deploying for the first time can feel overwhelming, but you only have to set it up once! After that, updates are automatic. 💜
