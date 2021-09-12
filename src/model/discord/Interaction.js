const allCommands = require('../../command/index.js');
const Command = require('../../command/Command.js');
const User = require('../User.js');
const Time = require('../../time.js');

class Interaction {
    constructor(data) {
        this._channel = data.channelId;
        this._guild = data.guildId;
        this._user = User.create(data.user || data.member.user);
        this._command = allCommands.getCommand(
            data.commandName,
            data.customId,
            data.options,
            this._user,
            data.values,
        );
        this._commandName = this._command?.commandName;
    }

    getLogMessage() {
        const user = this._user;
        return `${Time.getPrintableTimestamp()}\nUser: ${user.getName()}\nCommand: ${this._commandName || null}`;
    }

    get user() {
        return this._user;
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

module.exports = Interaction;
