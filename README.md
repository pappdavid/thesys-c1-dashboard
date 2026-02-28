# Thesys C1 Developer Dashboard
> Deployed on Vercel with Thesys C1 API integration

A production-ready Next.js application that integrates Thesys C1 AI to generate dynamic developer dashboards on demand. Built for rapid deployment on Vercel with GitHub Actions CI/CD.

## ✨ Features

### 🤖 AI-Powered Dashboard Generation
- **Thesys C1 Integration**: Generate customizable dashboard UIs dynamically
- **Real-time Prompt-Based Customization**: Update dashboard with natural language prompts
- **Comprehensive Panels**:
  - Overview: Key metrics and system health
  - Pull Requests: Active PRs with status tracking
  - CI/CD Pipeline: Build status and deployment history
  - Issues & Bugs: Priority tracking and assignments
  - System Logs: Error and activity monitoring
  - Team Activity: Recent commits and events

### 🚀 Production-Ready Stack
- **Next.js 14**: Modern React framework with optimal performance
- **TypeScript**: Full type safety across the stack
- **Tailwind CSS**: Responsive, dark-themed UI
- **GitHub Actions**: Automated CI/CD pipeline
- **Vercel Deployment**: One-click deployment with built-in optimizations

### 👨‍💻 Developer Experience
- Environment configuration via `.env.local`
- Full type safety with TypeScript
- Responsive dark-themed dashboard UI
- Easy customization and extension
- Clean project structure with proper separation of concerns

## 🛠 Quick Start

### Prerequisites
- **Node.js**: 18.x or 20.x
- **npm**: Included with Node.js
- **Thesys API Key**: Get one at [thesys.dev](https://thesys.dev)
- **GitHub Account**: For version control
- **Vercel Account**: For deployment (optional for development)

### Local Development

#### 1. Clone the Repository
```bash
git clone https://github.com/pappdavid/thesys-c1-dashboard.git
cd thesys-c1-dashboard
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Configure Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Thesys API key:
```env
THESYS_API_KEY=sk_thesys_xxxxxxxxxxxxx
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

#### 4. Start the Development Server
```bash
npm run dev
```

#### 5. Open in Browser
Navigate to [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

You'll see:
- A beautiful dark-themed dashboard shell
- A customization input field at the top
- The generated dashboard content below
- Sidebar navigation for future expansion

## 🚀 Deployment

### Option 1: Deploy with Vercel (Recommended)

**Using Vercel CLI:**
```bash
vercel
```
Follow the interactive prompts.

**Using Vercel Web Dashboard:**
1. Go to [vercel.com](https://vercel.com)
2. Click **New Project** → **Import Git Repository**
3. Select `thesys-c1-dashboard`
4. Add environment variables:
   - `THESYS_API_KEY`: Your Thesys API key
5. Click **Deploy**

### Option 2: GitHub Actions Automatic Deployment

This repo includes GitHub Actions workflows for fully automated CI/CD.

**Setup Instructions:**

1. **Get Vercel Tokens**:
   - Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
   - Create a new token
   - Note your Vercel ORG ID and Project ID

2. **Add GitHub Secrets**:
   - Go to your repo → **Settings** → **Secrets and variables** → **Actions**
   - Add these secrets:
     - `VERCEL_TOKEN`: Your Vercel authentication token
     - `VERCEL_ORG_ID`: Your Vercel organization ID
     - `VERCEL_PROJECT_ID`: Your Vercel project ID
     - `THESYS_API_KEY`: Your Thesys API key

3. **Deploy**:
   - Push to `main` branch → Automatic production deployment
   - Push to `develop` branch → Preview deployment
   - Or use **Actions** tab → **Deploy to Vercel** → **Run workflow** for manual deployment

## 📁 Project Structure

```
thesys-c1-dashboard/
├── pages/
│   ├── _app.tsx              # App component with global styles
│   ├── _document.tsx         # Document wrapper with dark theme
│   ├── index.tsx             # Redirect to dashboard
│   ├── dashboard.tsx         # Main dashboard page
│   └── api/
│       └── dashboard.ts      # C1 API endpoint
├── components/
│   ├── DashboardLayout.tsx   # Layout shell with sidebar
│   └── C1Component.tsx       # C1 response renderer
├── lib/
│   └── thesys-client.ts      # Thesys C1 client & system prompt
├── styles/
│   └── globals.css           # Global styles and utilities
├── .github/
│   └── workflows/
│       ├── ci.yml            # CI/CD pipeline
│       └── deploy.yml        # Manual deployment
├── vercel.json               # Vercel configuration
├── next.config.js            # Next.js config
├── tailwind.config.js        # Tailwind CSS config
├── tsconfig.json             # TypeScript config
└── package.json              # Dependencies
```

## 🔧 Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|----------|
| `THESYS_API_KEY` | ✅ Yes | Thesys C1 API key | `sk_thesys_...` |
| `NEXT_PUBLIC_API_URL` | ❌ No | Public API URL | `https://example.com` |
| `NODE_ENV` | ❌ No | Environment | `development`, `production` |

## 🔌 API Endpoints

### POST /api/dashboard

Generate a customized dashboard based on user input.

**Request:**
```bash
curl -X POST http://localhost:3000/api/dashboard \
  -H "Content-Type: application/json" \
  -d '{"userPrompt": "Show PRs from the team and deployment status"}'
```

**Response:**
```json
{
  "html": "<div>...generated dashboard HTML...</div>"
}
```

**Error Response:**
```json
{
  "error": "Failed to generate dashboard"
}
```

## 🎨 Customization

### Modify the System Prompt

Edit `lib/thesys-client.ts` and update `DEVELOPER_DASHBOARD_SYSTEM_PROMPT` to customize how C1 generates dashboards:

```typescript
export const DEVELOPER_DASHBOARD_SYSTEM_PROMPT = `You are a Developer Operations Dashboard Agent. Your role is to generate...`;
```

### Change Dashboard Layout

Edit `components/DashboardLayout.tsx` to modify:
- Sidebar navigation items
- Top bar layout
- Color scheme
- Overall layout structure

### Customize Styles

- **Global Styles**: Modify `styles/globals.css`
- **Tailwind Theme**: Edit `tailwind.config.js`
- **Component Styles**: Use Tailwind classes in component files

## 📊 GitHub Actions Workflows

### CI/CD Pipeline (`ci.yml`)

Runs on every push and pull request:
1. ✅ Installs dependencies
2. ✅ TypeScript type checking
3. ✅ ESLint linting
4. ✅ Builds the project
5. ✅ Deploys preview (on PRs) or production (on main)

### Manual Deployment (`deploy.yml`)

Allows one-click deployment from Actions tab:
- Triggered manually via GitHub UI
- Deploys to Vercel production
- Useful for emergency deployments

## 🐛 Troubleshooting

### "THESYS_API_KEY is not set"

**Solution**: Ensure your `.env.local` file has the API key:
```bash
echo "THESYS_API_KEY=your_key_here" >> .env.local
```

### Build failures in GitHub Actions

**Solution**: Check that all required secrets are set in GitHub:
- `THESYS_API_KEY`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### Deployment not triggering

**Solution**: Verify GitHub Actions is enabled:
1. Go to repo → **Settings** → **Actions** → **General**
2. Select "Allow all actions and reusable workflows"

### Vercel preview deployments not working

**Solution**: Ensure your Vercel project is linked:
```bash
vercel link
```

## 📚 Resources

- 🔗 [Thesys C1 Documentation](https://docs.thesys.dev)
- 📺 [Thesys C1 YouTube Tutorial](https://www.youtube.com/watch?v=cPjKp7RlCHM)
- 📖 [Next.js Documentation](https://nextjs.org/docs)
- 🚀 [Vercel Documentation](https://vercel.com/docs)
- 🎨 [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- 🔄 [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT - Use this project freely for commercial and personal projects.

## 🆘 Support

Have questions? Check the following:

1. **Local Development Issues**: Ensure Node.js 18.x+ is installed
2. **API Errors**: Check your Thesys API key is valid
3. **Build Errors**: Run `npm install` again and check for TypeScript errors
4. **Deployment Issues**: Verify environment variables in Vercel dashboard

## 🎯 Next Steps

After deployment:

1. ✅ Test the dashboard at your Vercel URL
2. ✅ Customize the system prompt for your use case
3. ✅ Add team members as collaborators on GitHub
4. ✅ Configure branch protection rules
5. ✅ Set up monitoring and analytics

---

**Dashboard URL** (after deployment): `https://thesys-c1-dashboard.vercel.app/dashboard`

**Repository**: [github.com/pappdavid/thesys-c1-dashboard](https://github.com/pappdavid/thesys-c1-dashboard)

**Status**: ✅ Production Ready
