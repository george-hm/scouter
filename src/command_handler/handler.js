const db = require('../database.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const { createResponse, validateRequest } = require('../constants.js');
const DiscordEvent = require('../model/discord/DiscordEvent.js');

async function handler(event) {
    if (!validateRequest(event)) {
        return createResponse(null, 401);
    }

    if (!event.body) {
        throw new Error('Missing body, should not happen');
    }

    const body = JSON.parse(event.body);
    const discordEvent = new DiscordEvent(body);
    console.log(discordEvent.getLogMessage());
    // discord is pinging us, pong
    if (discordEvent.type === DiscordEvent.PING) {
        return createResponse(
            new InteractionResponse(InteractionResponse.PONG),
        );
    }

    const command = discordEvent.getCommand();
    if (!command) {
        return createResponse(
            new InteractionResponse(
                InteractionResponse.RESPOND,
                'No command found.',
            ),
        );
    }

    const commandResponse = await command.main();
    return createResponse(
        commandResponse,
    );
}

module.exports.handler = async event => {
    let response;
    try {
        response = await handler(event);
    } catch (err) {
        console.log(err);
    }

    await db.close();
    return response;
};
