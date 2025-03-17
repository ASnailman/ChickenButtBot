// Description: A simple Discord bot that responds to the command "!chickenbutt" with "chicken butt!"

//use environment variables to keep secrets safe
require('dotenv').config();

// Client interacts with the Discord API
// GatewayIntentBits specifies the events the bot will listen to
const { Client, GatewayIntentBits } = require('discord.js');

// Create a new instance of discord client
// The intents specify what events the bot will listen to - guids, guildmessages, and message content
    //guilds - allows the bot to receive guild-related events: servers
    //guildmessages - allows the bot to receive guild message events: access messages in servers
    //messagecontent - allows the bot to receive message content events: for the word "what"
const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

client.on('ready', () => {
    console.log(`Bot is running`);
});

client.on('messageCreate', (message) => {
    if (message.author.bot) return; // Ignore messages from bots
    if (message.content.toLowerCase().includes("what")) {
        message.channel.send('chickenbutt');
    }
});

client.login(BOT_TOKEN); // Log in to Discord with the bot token