/* eslint-disable no-await-in-loop */
const axios = require('axios');

const APPLICATION_ID = 'REPLACE_ME';
const BOT_TOKEN = 'REPLACE_ME';

const commands = [
    {
        id: 'commandone',
        name: 'testing',
        description: 'This is a test why are you reading this',
    },
    {
        id: 'itssummontime',
        name: 'summon',
        description: 'Summon a character',
    },
    {
        id: 'hourly',
        name: 'hourly',
        description: 'Perform your hourly check-in',
    },
];

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
