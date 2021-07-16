const allCommands = require('../../command/index.js');
const Command = require('../../command/Command.js');
const User = require('./User.js');

// https://discord.com/developers/docs/interactions/slash-commands#interaction-object
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
        this._user = new User(body.user || body.member.user);
        this._token = body.token;
        if (body.data) {
            this._commandName = Command.getCommandName(body.data);
            this._command = allCommands.getCommand(
                body.data,
                this._user,
            );
        }
    }

    getLogMessage() {
        const user = this._user;
        return `User: ${user.getName()}\nCommand: ${this._commandName || null}`;
    }

    /**
     * Gets the mapped command, or null if there is no mapped command
     *
     * @returns {Command|null}
     */
    getCommand() {
        if (this._command && !(this._command instanceof Command)) {
            throw new Error('Command is not instance of command');
        }

        return this._command;
    }
}

DiscordEvent.PING = 1;
DiscordEvent.APPLICATION_COMMAND = 2;
DiscordEvent.MESSAGE_COMPONENT = 3;

module.exports = DiscordEvent;
