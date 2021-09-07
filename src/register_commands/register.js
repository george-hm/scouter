/* eslint-disable no-await-in-loop */
const axios = require('axios');
const commandList = require('../command/index.js').mapping;

const APPLICATION_ID = 'REPLACE_ME';
const BOT_TOKEN = 'REPLACE_ME';

const commands = Object.values(commandList).map(command => command.toJSON());

async function main() {
    for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        try {
            await axios({
                url: `https://discord.com/api/v8/applications/${APPLICATION_ID}/commands`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bot ${BOT_TOKEN}`,
                },
                data: JSON.stringify(command),
            });
        } catch (err) {
            console.log(err.response.status);
            console.log(err.response.data.errors);
        }
    }
    console.log('Registered all commands');
}

main();
