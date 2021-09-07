const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const DiscordEvent = require('../model/discord/DiscordEvent.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const { createResponse, validateRequest } = require('../constants.js');

/**
 * This sends an SNS message to the command handler
 * and responds to discord with a 'respond later loading'
 *
 * The reason for this is that we need to reply to discord within 3 seconds
 * But this doesnt seem viable in a serverless format due to spin ups/connecting to db etc..
 *
 * The command handler will handle the actual slash command inputs and reply properly there
 */
async function handler(event) {
    if (!validateRequest(event)) {
        return createResponse(null, 401);
    }

    if (!event.body) {
        throw new Error('Missing body, should not happen');
    }

    // check for ping and respond, otherwise send SNS
    const body = JSON.parse(event.body);
    const discordEvent = new DiscordEvent(body);
    console.log(discordEvent.getLogMessage());
    // discord is pinging us, pong
    if (discordEvent.type === DiscordEvent.PING) {
        return createResponse(
            new InteractionResponse(InteractionResponse.PONG),
        );
    }

    // send the body to the commmand handler
    const client = new SNSClient();
    const messageData = new PublishCommand({
        topic: process.env.TOPIC_COMMAND_HANDLER,
        message: event.body,
    });
    await client.send(messageData);

    // tell discord we received their request and we will reply later
    // must be done within 3 seconds
    return createResponse(new InteractionResponse(
        InteractionResponse.RESPOND_LATER_LOADING,
    ));
}

module.exports.handler = async event => {
    let response;
    try {
        response = await handler(event);
    } catch (err) {
        console.log(err);
    }

    return response;
};
