const db = require('../database.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const { createResponse, getSNSMessageFromEvent } = require('../constants.js');
const DiscordEvent = require('../model/discord/DiscordEvent.js');

async function handler(event) {
    const body = JSON.parse(getSNSMessageFromEvent(event));
    const discordEvent = new DiscordEvent(body);
    console.log(discordEvent.getLogMessage());

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
