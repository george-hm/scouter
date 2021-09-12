const { Client, Intents } = require('discord.js');
const Database = require('./database.js');
const Interaction = require('./model/discord/Interaction.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand() && !interaction.isButton() && !interaction.isSelectMenu()) return;

    const event = new Interaction(interaction);
    console.log(event.getLogMessage());
    const command = event.getCommand();

    try {
        const response = await command.main();
        if ((interaction.isButton() || interaction.isSelectMenu()) && response.shouldEditMessage()) {
            await interaction.update(response.toObject());
        } else {
            await interaction.reply(response.toObject());
        }
    } catch (err) {
        if (process.env.ERROR_USER_ID) {
            const errorUser = client.users.cache.get(process.env.ERROR_USER_ID);
            errorUser.send(`Something is fucked.\nUser: ${event._user.getName()}\nPayload: \`\`\`json\n${JSON.stringify(interaction, null, 4)}\`\`\`\nError: \`\`\`json\n${err.toString()}\`\`\``);
        }

        if (err.toString().includes('closed connection')) {
            await Database.close();
            Database.get();
        }
        console.log(err);
    }
});

client.login(process.env.BOT_TOKEN);

// getting db to create the initial connection
Database.get();
