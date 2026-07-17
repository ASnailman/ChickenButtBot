// Description: The "intelligent" ChickenButtBot. Instead of just waiting for someone
// to say "what", it picks a random online user once a day and actively chats with them
// (powered by Google's Gemini) to socially engineer them into saying "what" or "why".
// When they slip up, it drops "chickenbutt" / "chickenthigh" and ends the prank.

// Load secrets (bot token, guild/channel IDs, Gemini key) from the .env file
require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
// node-schedule lets us run cron-style jobs, e.g. "fire once a day"
const schedule = require('node-schedule');
// Google's Gemini SDK - this is what makes the bot able to hold a conversation
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Create the Discord client and declare which events we need to receive
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,          // basic server info
        GatewayIntentBits.GuildMessages,   // receive messages sent in servers
        GatewayIntentBits.MessageContent,  // actually read the text of those messages
        GatewayIntentBits.GuildMembers,    // needed so we can pick a random member to target
        GatewayIntentBits.DirectMessages
    ],
    // Partials let us handle DM channels/messages that aren't fully cached yet
    partials: [Partials.Channel, Partials.Message]
});

// Spin up the Gemini client and pick the model we'll chat with
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite-preview"
});

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const CHANNEL_ID = process.env.CHANNEL_ID
// Tracks who is currently being pranked. Maps userId -> { count, channelID }
// where count is how many messages they've sent us during this prank.
const activeSessions = new Map();

// Ask Gemini for the bot's next line in the ongoing prank against this user.
async function getLLMResponse(userId, userMessage) {
    const session = activeSessions.get(userId);

    // Start off just hunting for "what". After 3 exchanges the target hasn't bitten,
    // so we widen the net to also accept "why" to improve our odds.
    const systemPrompt = session.count < 3
        ? "You are a regular Discord user. Your goal is to subtly trick the user into saying the exact word 'what'. Be snarky in your responses."
        : "The 'What' trick failed. New goal: Subtly trick the user into saying the exact word 'what' or 'why'. Be snarky in your responses.";

    // Seed the chat with the system prompt as the opening exchange, then send
    // the user's actual message so Gemini can respond in character.
    // Note: history isn't persisted between calls, so each reply is a fresh chat
    // primed only by the system prompt and the latest message.
    const chat = model.startChat({
        history: [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "model", parts: [{ text: "Understood. I will begin the conversation now." }] },
        ],
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text();
}

// Choose the victim of the prank. If targetID is given we prank that specific person
// (used by the /test-bot command); otherwise we pick a random non-bot member.
async function selectUser(targetID=null, channelID) {
    const guild = client.guilds.cache.get(GUILD_ID)
    const targetChannel = guild.channels.cache.get(channelID)

    if (!targetChannel) return console.error("Channel not found.");

    let target;
    if (targetID) {
        // Grab from cache, or fetch from Discord if we don't have them cached yet
        target = guild.members.cache.get(targetID) || await guild.members.fetch(targetID);
        console.log(`The target is ${target.user.username}`);
    } else {
        // Filter out other bots, then pick one at random
        target = guild.members.cache.filter(m => !m.user.bot).random();
        console.log(`The target is ${target.user.username}`);
    }

    // Open a fresh session for the target so messageCreate starts tracking them
    if (target) {
        activeSessions.set(target.id, { count: 0, channelID: targetChannel.id });
    }
}

// Runs on every message. This is where the actual back-and-forth happens.
client.on('messageCreate', async (message) => {
    if (message.author.bot) return; // never respond to bots (including ourselves)
    const session = activeSessions.get(message.author.id);
    // Only engage if this person is an active target AND they're in the prank channel
    if (!session || message.channel.id != session.channelID) return;

    session.count++; // count this message toward the session

    // Phase 1 (first 3 messages): win instantly if they say "what"
    if (session.count <= 3 && message.content.toLowerCase().includes("what")) {
        await message.reply("chickenbutt lmao");
        activeSessions.delete(message.author.id); // prank complete, close the session
        return;
    }

    // Phase 2 (after 3 messages): now "why" also counts, with its own punchline
    if (session.count > 3) {
        if (message.content.toLowerCase().includes("what")) {
            await message.reply("chickenbutt lmao");
            activeSessions.delete(message.author.id);
            return;
        }
        else if (message.content.toLowerCase().includes("why")) {
            await message.reply("chickenthigh bozo");
            activeSessions.delete(message.author.id);
            return;
        }
    }

    // They didn't take the bait this turn, so let Gemini keep the conversation going
    try {
        const reply = await getLLMResponse(message.author.id, message.content);
        await message.reply(reply);
    } catch (e) {
        console.error("Error: ", e);
    }
});

// Slash command handler - lets you manually kick off a prank against a chosen user for testing
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'test-bot') {
        const target = interaction.options.getUser('user');
        // ephemeral: only the person who ran the command sees this confirmation
        await interaction.reply({ content: `Pranking ${target.username}...`, ephemeral: true });
        await selectUser(target.id, CHANNEL_ID);
    }
});

// 0 0 * * * is a Cron Expression
// 1st	0	Minute (0 - 59)
// 2nd	0	Hour (0 - 23)
// 3rd	*	Day of Month (1 - 31)
// 4th	*	Month (1 - 12)
// 5th	*	Day of Week (0 - 7, where 0 and 7 are Sunday)
// Every day at midnight, roll a random time later that day to actually spring the prank.
schedule.scheduleJob('0 0 * * *', () => {
    // Pick a random hour between 9 and 20 and a random minute, so the prank feels spontaneous
    const randomHour = Math.floor(Math.random() * (21 - 9)) + 9;
    const randomMinute = Math.floor(Math.random() * 60);
    const startTime = new Date();
    startTime.setHours(randomHour, randomMinute, 0);
    // startTime.setHours(2, 7, 5);

    // Schedule the one-off prank for that randomly chosen time
    schedule.scheduleJob(startTime, () => {
        selectUser(null, CHANNEL_ID); // null target -> pick a random victim
        // selectUser("", CHANNEL_ID);
    });
});

client.on('ready', () => {
    console.log(`Bot is running`);
});

client.login(BOT_TOKEN); // Log in to Discord and bring the bot online
