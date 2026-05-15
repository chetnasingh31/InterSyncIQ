# Deployment guide for Vercel

## Prerequisites
1. Install Vercel CLI: `npm install -g vercel`
2. Have a GitHub account and push your code to a repository

## Deployment Steps

### Option 1: Deploy via Vercel CLI (Recommended)
```bash
vercel
```
This will:
- Deploy your app to Vercel
- Set up automatic deployments on push to main/master branch

### Option 2: Deploy via GitHub Integration
1. Push your code to GitHub
2. Go to https://vercel.com and sign in
3. Click "New Project"
4. Select your GitHub repository
5. Click "Import"
6. Vercel will auto-detect Python and deploy

### Option 3: Deploy via Vercel Dashboard
1. Go to https://vercel.com/new
2. Upload your project folder
3. Configure if needed
4. Deploy

## Project Structure for Vercel
- `api/index.py` - Flask app entry point (serverless function)
- `vercel.json` - Configuration file
- `templates/` - HTML templates
- `static/` - CSS, JS, images
- `requirements.txt` - Python dependencies

## Environment Variables (if needed)
You can add environment variables in Vercel dashboard:
- Settings > Environment Variables
- Add any necessary env vars for your application

## Troubleshooting

### 500 Error on API Calls
- Check the Logs tab in Vercel dashboard
- Make sure all dependencies in `requirements.txt` are specified

### Static Files Not Loading
- Verify `vercel.json` rewrites configuration
- Check that `static/` and `templates/` folders exist

### Build Failure
- Ensure `requirements.txt` has all dependencies
- Check Python version compatibility

## Notes
- Max function timeout: 60 seconds (configured in vercel.json)
- Memory limit: 3008 MB (configured in vercel.json)
- Static file size limit: 50 MB per file

## After Deployment
Your app is live at: **https://inter-sync-iq.vercel.app**
