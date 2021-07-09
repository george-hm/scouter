const db = require('../database.js');
const InteractionResponse = require('../model/InteractionResponse.js');
const { createResponse, validateRequest } = require('../constants.js');

module.exports.handler = async event => {
    if (!validateRequest(event)) {
        return createResponse(401);
    }

    if (!event.body) {
        throw new Error('Missing body, should not happen');
    }

    const body = JSON.parse(event.body);
    // discord is pinging us, pong
    if (body.type === 1) {
        return createResponse(
            new InteractionResponse(InteractionResponse.PONG),
        );
    }

    const commandData = body.data;
    if (!commandData) {
        return createResponse(
            new InteractionResponse(
                InteractionResponse.RESPOND,
                'No command found.',
            ),
        );
    }

    const commandName = commandData.name;
    return createResponse(
        new InteractionResponse(
            InteractionResponse.RESPOND,
            `You used command: ${commandName}`,
        ),
    );
};
