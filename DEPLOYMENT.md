# Deploying to Render.com

This guide will help you deploy the static demo application to Render.com.

## Prerequisites
- A GitHub account with access to this repository.
- A Render.com account.

## Step-by-Step Instructions

### 1. Create a New Static Site
1. Log in to your [Render.com dashboard](https://dashboard.render.com/).
2. Click the **"New +"** button and select **"Static Site"**.

### 2. Connect Repository
1. Select **"GitHub"** under "Connect a repository".
2. Find and select `upper-bot-mock`.
3. If you don't see it, ensure you've granted Render access to your GitHub repositories.

### 3. Configure Build Settings
Fill in the following details:

# Deploying to Render.com

This guide will help you deploy the static demo application to Render.com.

## Prerequisites
- A GitHub account with access to this repository.
- A Render.com account.

## Step-by-Step Instructions

### 1. Create a New Static Site
1. Log in to your [Render.com dashboard](https://dashboard.render.com/).
2. Click the **"New +"** button and select **"Static Site"**.

### 2. Connect Repository
1. Select **"GitHub"** under "Connect a repository".
2. Find and select `upper-bot-mock`.
3. If you don't see it, ensure you've granted Render access to your GitHub repositories.

### 3. Configure Build Settings
Fill in the following details:

- **Name**: Choose a name (e.g., `upper-bot-demo`).
- **Branch**: `main`
- **Root Directory**: `frontend` (Important! The app lives in this subfolder).
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist` (This is where Vite builds the output).

### 3. Bot Deployment (Important)

**Option A: Pure Static Site (Recommended for Demo)**
Since you are deploying a **Static Site**, you cannot run the `bot.js` script (which requires a Node.js server).
Instead, use the **Menu Button** to open your app:
1.  Open **BotFather** in Telegram.
2.  Select your bot.
3.  Go to **Bot Settings** > **Menu Button** > **Configure Menu Button**.
4.  Send the URL provided by Render (e.g., `https://upper-bot-demo.onrender.com`).
5.  Now, the "Open App" button (or Menu button) will launch your demo.
*This achieves the goal of opening the app without needing a backend server.*

**Option B: Handling /start Command**
If you *must* handle the `/start` command:
1.  You cannot use a Render "Static Site".
2.  You must create a **Web Service** or **Background Worker** on Render.
3.  Connect your repo, set Build Command to `npm install`, and Start Command to `node bot.js`.
4.  This requires a paid plan or will spin down on the free tier, causing delays.
**For this "100% Mock" demo, Option A is strongly recommended.**

### 4. Deploy
1. Click **"Create Static Site"**.
2. Render will start building your application. You can watch the logs.
3. Once finished, you will see a URL like `https://upper-bot-demo.onrender.com`.
