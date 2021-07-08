// What discord sends to us, this is the main body
class DiscordEvent {
    constructor(body) {
        this._type = body.type;
        if (
            this._type !== DiscordEvent.PING &&
            this._type !== DiscordEvent.APPLICATION_COMMAND &&
            this._type !== DiscordEvent.MESSAGE_COMPONENT
        ) {
            throw new Error('Invalid type');
        }

        this._channel = body.channel_id;
        this._guild = body.guild_id;
        // member model
        // user model

        this._token = body.token;
    }
}

DiscordEvent.PING = 1;
DiscordEvent.APPLICATION_COMMAND = 2;
DiscordEvent.MESSAGE_COMPONENT = 3;

module.exports = DiscordEvent;
