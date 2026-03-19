require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('test-bot')
        .setDescription('manually trigger chicken butt bot')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('user to prank')
                .setRequired(true))
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN); // api version 10 is standard

// (async () => { ... })(); is an "immediately invoked function"
(async () => {
    try {
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log('registered commands');
    } catch (error) {
        console.error('Error:', error);
    }
})();