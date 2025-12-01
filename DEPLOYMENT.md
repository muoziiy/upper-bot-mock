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

### 4. Deploy
1. Click **"Create Static Site"**.
2. Render will start building your application. You can watch the logs.
3. Once finished, you will see a URL like `https://upper-bot-demo.onrender.com`.

## Connecting to Telegram Bot
1. Open BotFather in Telegram.
2. Select your bot.
3. Go to **Bot Settings** > **Menu Button** > **Configure Menu Button**.
4. Send the URL provided by Render (e.g., `https://upper-bot-demo.onrender.com`).
5. Now, when users open your bot, the "Open App" button will launch this demo.

## Troubleshooting
- **Build Failed?** Check the logs. Ensure `Root Directory` is set to `frontend`.
- **404 Errors?** Ensure `Publish Directory` is set to `dist`.

## Running the Bot Script (Optional)
If you want the bot to reply to `/start` with a button to open the app:

1.  Create a `.env` file in the root directory (based on `.env.example`).
2.  Add your variables:
    ```
    TELEGRAM_BOT_TOKEN=your_token_here
    WEB_APP_URL=https://your-app-url.onrender.com
    ```
3.  Run the script:
    ```bash
    npm install node-telegram-bot-api dotenv
    node bot.js
    ```
    *Note: You will need Node.js installed on your machine or run this on a server.*
