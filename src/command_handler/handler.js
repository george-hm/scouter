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
        const response = new InteractionResponse(InteractionResponse.PONG);
        return createResponse(
            200,
            response.toObject(),
        );
    }

    const commandData = body.data;
    if (!commandData) {
        const response = new InteractionResponse(
            InteractionResponse.RESPOND,
            'No command found.',
        );
        return createResponse(
            200,
            response.toObject(),
        );
    }

    const commandName = commandData.name;
    return createResponse(200, new InteractionResponse(
        InteractionResponse.RESPOND,
        `You used command: ${commandName}`,
    ));
    // pass to mapping of command name -> command model

    db.close();
};
