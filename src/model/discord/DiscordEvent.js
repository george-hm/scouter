const allCommands = require('../../command/index.js');
const Command = require('../../command/Command.js');
const User = require('./User.js');

// https://discord.com/developers/docs/interactions/slash-commands#interaction-object
// What discord sends to us, this is the main body
class DiscordEvent {
    constructor(body) {
        this._channel = body.channelId;
        this._guild = body.guildId;
        this._user = new User(body.user || body.member.user);
        this._token = body.token;
        this._commandName = body.commandName;
        this._command = allCommands.getCommand(
            body,
            this._user,
        );
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
