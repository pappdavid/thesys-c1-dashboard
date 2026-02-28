# 🚀 Quick Setup Guide

## Step 1: Local Development (5 minutes)

```bash
# Clone and navigate
git clone https://github.com/pappdavid/thesys-c1-dashboard.git
cd thesys-c1-dashboard

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local and add your THESYS_API_KEY

# Start development server
npm run dev

# Open http://localhost:3000/dashboard
```

## Step 2: Deploy to Vercel (2 minutes)

### Option A: Via Vercel CLI
```bash
vercel
# Follow prompts, add THESYS_API_KEY when asked
```

### Option B: Via Vercel Web
1. Go to [vercel.com](https://vercel.com)
2. **New Project** → Import from GitHub
3. Select `thesys-c1-dashboard`
4. Add environment variable `THESYS_API_KEY`
5. Click **Deploy**

## Step 3: Setup GitHub Actions (Optional but Recommended)

### Get Your Vercel Credentials
1. Visit [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Create new token
3. Copy:
   - **VERCEL_TOKEN** (the token you just created)
   - **VERCEL_ORG_ID** (from account settings)
   - **VERCEL_PROJECT_ID** (from project settings)

### Add Secrets to GitHub
1. Go to your GitHub repo
2. **Settings** → **Secrets and variables** → **Actions**
3. Add 4 secrets:
   ```
   VERCEL_TOKEN = your_vercel_token
   VERCEL_ORG_ID = your_org_id
   VERCEL_PROJECT_ID = your_project_id
   THESYS_API_KEY = your_thesys_key
   ```

### Done!
Now:
- Push to `main` → Auto-deploys to production
- Push to `develop` → Creates preview deployment
- Use **Actions** tab for manual deployments

## ✅ Verify Everything Works

1. **Locally**: Visit http://localhost:3000/dashboard
2. **Deployed**: Visit your Vercel URL
3. **Try it**: Type "Show recent deployments" in the prompt input

## 🆘 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| "THESYS_API_KEY is not set" | Add to `.env.local` |
| Build fails locally | Run `npm install` again |
| GitHub Actions won't deploy | Check all 4 secrets are set |
| Dashboard shows error | Check API key is valid |

## 📚 Next: Customization

Edit these files to customize:
- **System Prompt**: `lib/thesys-client.ts` → `DEVELOPER_DASHBOARD_SYSTEM_PROMPT`
- **UI Layout**: `components/DashboardLayout.tsx`
- **Styles**: `tailwind.config.js` or `styles/globals.css`

That's it! Your Thesys C1 Developer Dashboard is live! 🚀
