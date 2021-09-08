const User = require('../model/discord/User.js');

// https://discord.com/developers/docs/interactions/slash-commands#interaction-object-application-command-interaction-data-structure
class Command {
    constructor(commandName, customId, options, user) {
        if (!(user instanceof User)) {
            throw new Error('User is not model');
        }
        this._commandName = commandName;
        this._options = options;
        this._user = user;
        this._customId = customId;
    }

    async main() {
        throw new Error('Main function not implemented');
    }

    getUser() {
        return this._user;
    }

    static toJSON() {
        throw new Error('Not implemented');
    }

    createCustomId(name) {
        return `${name}.${this.getUser().getUserId()}`;
    }

    validateCustomIdBelongsToUser() {
        if (!this._customId) {
            return false;
        }

        const parts = this._customId.split('.');
        const userId = parts[1];

        return userId === this._user.getUserId();
    }

    get commandName() {
        return this._commandName;
    }

    static get commandName() {
        throw new Error('Not implemented');
    }
}

module.exports = Command;
