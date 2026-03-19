require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const schedule = require('node-schedule');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers, // Needed to pick a random user
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Channel, Partials.Message] 
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-3.1-flash-lite-preview" 
});

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const CHANNEL_ID = process.env.CHANNEL_ID
const activeSessions = new Map();

async function getLLMResponse(userId, userMessage) {
    const session = activeSessions.get(userId);
    
    const systemPrompt = session.count < 3 
        ? "You are a regular Discord user. Your goal is to subtly trick the user into saying the exact word 'what'. Be snarky in your responses."
        : "The 'What' trick failed. New goal: Subtly trick the user into saying the exact word 'what' or 'why'. Be snarky in your responses.";

    const chat = model.startChat({
        history: [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "model", parts: [{ text: "Understood. I will begin the conversation now." }] },
        ],
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text();
}

async function selectUser(targetID=null, channelID) {
    const guild = client.guilds.cache.get(GUILD_ID)
    const targetChannel = guild.channels.cache.get(channelID)

    if (!targetChannel) return console.error("Channel not found.");

    let target;
    if (targetID) {
        target = guild.members.cache.get(targetID) || await guild.members.fetch(targetID);
        console.log(`The target is ${target.user.username}`);
    } else {
        target = guild.members.cache.filter(m => !m.user.bot).random();  
        console.log(`The target is ${target.user.username}`);
    }

    if (target) {
        activeSessions.set(target.id, { count: 0, channelID: targetChannel.id });
    }
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const session = activeSessions.get(message.author.id);
    if (!session || message.channel.id != session.channelID) return; 

    session.count++;

    if (session.count <= 3 && message.content.toLowerCase().includes("what")) {
        await message.reply("chickenbutt lmao");
        activeSessions.delete(message.author.id);
        return;
    }

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

    try {
        const reply = await getLLMResponse(message.author.id, message.content);
        await message.reply(reply);
    } catch (e) {
        console.error("Error: ", e);
    }
});

// testing
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'test-bot') {
        const target = interaction.options.getUser('user');
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
schedule.scheduleJob('0 0 * * *', () => {
    const randomHour = Math.floor(Math.random() * (21 - 9)) + 9;
    const randomMinute = Math.floor(Math.random() * 60);
    const startTime = new Date();
    startTime.setHours(randomHour, randomMinute, 0);
    // startTime.setHours(2, 7, 5);

    schedule.scheduleJob(startTime, () => {
        selectUser(null, CHANNEL_ID);
        // selectUser("", CHANNEL_ID);
    });
});

client.on('ready', () => {
    console.log(`Bot is running`);
});

client.login(BOT_TOKEN); 