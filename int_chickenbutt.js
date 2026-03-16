
require('dotenv').config();

require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const schedule = require('node-schedule');

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

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

async function checkMessages() {
    const guild = client.guilds.cache.get('');
    if (!guild) return;
}

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

    schedule.scheduleJob(startTime, () => {
        checkMessages();
    });
});

// listener will pick a random user in the discord server and notify them
// using an LLM, it will attempt to social engineer the user into saying the word what
// conversation will continue if the selected user does not say what
// use model with unlimited responses if available
// if they can't get user to say chicken butt in 10 responses or less, then social engineer them into saying chicken thigh

client.on('ready', () => {
    console.log(`Bot is running`);
});

client.on('messageCreate', (message) => {
    if (message.author.bot) return;
    
});
client.login(BOT_TOKEN); 