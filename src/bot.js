const { Client, Intents } = require('discord.js');
const Database = require('./database.js');
const Interaction = require('./model/discord/Interaction.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.on('messageCreate', async message => {
    if (message.author.id !== '129416238916042752') {
        return;
    }

    const prefix = '-';
    const replacePrefixCommand = /^-([A-z0-9])+\s/;
    if (!message.content.startsWith(prefix)) {
        return;
    }

    const command = message.content.split(' ').shift().replace(prefix, '');
    let messageContent = message.content.replace(replacePrefixCommand, '');
    let reply = '';
    switch (command) {
        case 'eval':
            try {
                messageContent = messageContent.replace(/^```(js|)/, '')
                    .replace(/```$/, '');
                console.log(messageContent);
                // eslint-disable-next-line no-eval
                reply = `${await eval(messageContent)}`;
                if (reply.length > 4000) {
                    reply = 'reply too big';
                }
            } catch (err) {
                reply = `${err}`;
            }
            break;
        default:
            return;
    }

    message.reply(reply);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand() && !interaction.isButton() && !interaction.isSelectMenu()) return;

    const event = new Interaction(interaction);
    console.log(event.getLogMessage());
    const command = event.getCommand();

    try {
        const response = await command.main(client, interaction);
        const replyContent = response.toObject();
        if (response.followUp) {
            return await interaction.followUp(replyContent);
        }

        if ((interaction.isButton() || interaction.isSelectMenu()) && response.shouldEditMessage()) {
            return await interaction.update(replyContent);
        }

        return await interaction.reply(replyContent);
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
