const { Client, Intents } = require('discord.js');
const Database = require('./database.js');
const DiscordEvent = require('./model/discord/DiscordEvent.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const event = new DiscordEvent(interaction);
    console.log(event.getLogMessage());
    const command = event.getCommand();
    const response = await command.main();

    await interaction.reply(response.toObject());
});

client.login(process.env.BOT_TOKEN);

// getting db to create the initial connection
Database.get();
