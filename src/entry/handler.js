// aws-sdk is included so it can be in dev dependencies
// eslint-disable-next-line import/no-extraneous-dependencies
const awsSDK = require('aws-sdk');
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
    const discordEvent = new DiscordEvent(body, true);
    console.log(discordEvent.getLogMessage());
    // discord is pinging us, pong
    if (discordEvent.type === DiscordEvent.PING) {
        return createResponse(
            new InteractionResponse(InteractionResponse.PONG),
        );
    }

    const SNS = new awsSDK.SNS();
    // send the body to the commmand handler
    await SNS.publish({
        TopicArn: process.env.TOPIC_COMMAND_HANDLER,
        Message: event.body,
    }).promise();

    // tell discord we received their request and we will reply later
    // must be done within 3 seconds
    return createResponse(new InteractionResponse(
        InteractionResponse.RESPOND_LATER_LOADING,
        null,
        null,
        null,
        true,
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
