
require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

client.on('ready', () => {
    console.log(`Bot is running`);
});

client.on('messageCreate', (message) => {
    if (message.author.bot) return;
    
});

// have a decorator or listener (look up) that checks one time a day, at a random time between 9am and 9pm
// listener will pick a random user in the discord server and notify them
// using an LLM, it will attempt to social engineer the user into saying the word what
// conversation will continue is the selected user does not say what
// use model with unlimited responses if available
// if they can't get user to say chicken butt in 10 responses or less, then social engineer them into saying chicken thigh

client.login(BOT_TOKEN); 