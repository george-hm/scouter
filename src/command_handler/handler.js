const db = require('../database.js');
const constants = require('../constants.js');

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
        return constants.createResponse(
            200,
            {
                type: 1,
            },
        );
    }

    const commandData = body.data;
    if (!commandData) {
        return constants.createResponse(
            200,
            // message saying cant find command
        );
    }

    const commandName = commandData.name;
    // pass to mapping of command name -> command model

    db.close();
};
