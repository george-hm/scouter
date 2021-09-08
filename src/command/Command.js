const User = require('../model/discord/User.js');

// https://discord.com/developers/docs/interactions/slash-commands#interaction-object-application-command-interaction-data-structure
class Command {
    constructor(commandData, user) {
        if (!(user instanceof User)) {
            throw new Error('User is not model');
        }
        this._id = commandData.id;
        this._name = commandData.commandName;
        this._options = commandData.options;
        this._user = user;
        this._customId = commandData.custom_id;
    }

    async main() {
        throw new Error('Main function not implemented');
    }

    getUser() {
        return this._user;
    }

    getCommandName() {
        return this._name;
    }

    static toJSON() {
        throw new Error('Not implemented');
    }

    createCustomId(name) {
        return `${name}.${this.getUser().getUserId()}`;
    }

    validateCustomIdBelongsToUser() {
        const parts = this._customId.split('.');
        const userId = parts[1];

        return userId === this._user.getUserId();
    }

    static get commandName() {
        throw new Error('Not implemented');
    }
}

module.exports = Command;
