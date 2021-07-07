const db = require('../database.js');
const constants = require('../constants.js');
const InteractionResponse = require('../components/InteractionResponse.js');

module.exports.handler = event => {
    if (!constants.validateRequest(event)) {
        return constants.createResponse(401);
    }

    if (!event.body) {
        throw new Error('Missing body, should not happen');
    }

    const body = JSON.parse(event.body);

    // discord is pinging us, pong
    if (body.type === 1) {
        const response = new InteractionResponse(InteractionResponse.PONG);
        return constants.createResponse(
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
        return constants.createResponse(
            200,
            response.toObject(),
        );
    }

    const commandName = commandData.name;
    // pass to mapping of command name -> command model

    db.close();
};
