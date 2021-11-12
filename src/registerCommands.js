/* eslint-disable no-await-in-loop */
require('dotenv').config({ path: '../process.env' });
const axios = require('axios');
const commandList = require('./command/index.js').mapping;

const { APPLICATION_ID, BOT_TOKEN } = process.env;
// leave this null if you want to update commands globally
const GUILD_ID = null;

const commands = Object.values(commandList).map(command => command.toJSON());

async function main() {
    for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        console.log(command.name);
        const url = `https://discord.com/api/v8/applications/${APPLICATION_ID}${GUILD_ID ? `/guilds/${GUILD_ID}` : ''}/commands`;
        try {
            await axios({
                url,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bot ${BOT_TOKEN}`,
                },
                data: JSON.stringify(command),
            });
        } catch (err) {
            console.log(err.response.status);
        }
    }
    console.log('Registered all commands');
}

main();
