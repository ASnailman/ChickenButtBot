# ChickenButtBot 🐔

You know that dumb joke where someone says "what?" and you fire back "chicken butt!"? This is a Discord bot that pulls that on your friends — except it's patient, sneaky, and now it's got a brain.

Download at: https://top.gg/bot/1350976410872844379?s=06fed675f1e0e

## What it does

Every day, ChickenButtBot picks a random online member of your server and quietly starts a conversation with them. Its one and only mission: get them to say the word **"what"** so it can hit them with the classic **"chickenbutt lmao"**.

The twist is that it doesn't just sit there waiting. It's powered by Google's Gemini, so it actually *chats* — snarky, a little annoying, and always steering the conversation toward getting you to slip up.

If it can't bait you into saying "what" after a few messages, it doesn't give up. It changes tactics and starts angling for **"why"** as well, which earns you a **"chickenthigh bozo"** instead. Either way, the moment you take the bait, the prank ends and the bot moves on.

## Features

- **A random victim every day** — a scheduler fires once a day at a random time between 9am and 9pm, so nobody sees it coming.
- **Actually intelligent** — Gemini drives the conversation instead of the bot just watching for a keyword. It improvises and tries to lead you into the trap.
- **Adapts when it's losing** — starts out hunting for "what"; if that flops after three messages, it also starts fishing for "why".
- **Two punchlines** — "chickenbutt lmao" for *what*, "chickenthigh bozo" for *why*.
- **Manual trigger** — a `/test-bot` slash command lets you sic the bot on a specific person on demand (great for testing, or for pure evil).

## How it works

- `int_chickenbutt.js` — the current, "intelligent" bot. Handles scheduling, target selection, the Gemini-powered chatting, and the win conditions.
- `chickenbutt.js` — the original, much simpler version. It just replied "chickenbutt" to anyone who said "what". Kept around for posterity.
- `deploy_commands.js` — registers the `/test-bot` slash command with Discord. Run this once (and again whenever the commands change).

Under the hood, the bot keeps a small in-memory record of who it's currently pranking (and in which channel), counts how many messages they've sent back, and uses that count to decide whether to keep chatting or switch tactics.

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```
2. **Create a `.env` file** in the project folder with your own values:

   ```env
   DISCORD_BOT_TOKEN=your-bot-token
   CLIENT_ID=your-application-id
   GUILD_ID=your-server-id
   CHANNEL_ID=the-channel-the-bot-should-prank-in
   GEMINI_API_KEY=your-google-gemini-api-key
   ```
3. **Register the slash command** (only needed once, or after changing commands):

   ```bash
   node deploy_commands.js
   ```
4. **Start the bot**

   ```bash
   npm start
   ```

## Requirements

- Node.js
- A Discord bot with the **Server Members** and **Message Content** intents enabled (it needs to read messages and pick a random member).
- A Google Gemini API key.

## See it in action

<!-- TODO: add link to the bot page here -->

<img width="1728" height="692" alt="image" src="https://github.com/user-attachments/assets/4e352dad-b0d8-477a-9c87-f9a5edeb0fc1" />
