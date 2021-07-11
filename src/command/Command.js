const User = require('../model/User.js');

// https://discord.com/developers/docs/interactions/slash-commands#interaction-object-application-command-interaction-data-structure
class Command {
    constructor(commandData, user) {
        if (!(user instanceof User)) {
            throw new Error('User is not model');
        }
        this._id = commandData.id;
        this._name = commandData.name;
        this._options = commandData.options;
        this._user = user;
        this._customId = commandData.custom_id;
        if (!this._name && this._customId) {
            this._setCommandNameFromCustomId();
        }
    }

    async main() {
        throw new Error('Main function not implemented');
    }

    getCommandName() {
        return this._name;
    }

    _setCommandNameFromCustomId() {
        const parts = this._customId.split('.');
        if (!parts[0]) {
            throw new Error('Invalid custom id');
        }
        this._name = parts[0];
    }

    static createCustomId(name, user) {
        return `${name}.${user.getUserId()}`;
    }

    validateCustomIdBelongsToUser() {
        const parts = this._customId.split('.');
        const userId = parts[1];

        return userId === this._user.getUserId();
    }
}

module.exports = Command;
