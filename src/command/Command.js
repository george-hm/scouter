const User = require('../model/User.js');

// https://discord.com/developers/docs/interactions/slash-commands#interaction-object-application-command-interaction-data-structure
class Command {
    constructor(commandData, user) {
        if (!(user instanceof User)) {
            throw new Error('User is not model');
        }
        this._id = commandData.id;
        this._name = Command.getCommandName(commandData);
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

    static getCommandName(data) {
        if (data.name) {
            return data.name;
        }

        if (!data.custom_id) {
            throw new Error('No name or custom id');
        }

        const parts = data.custom_id.split('.');
        if (!parts[0]) {
            throw new Error('Invalid custom id');
        }
        return parts[0];
    }

    createCustomId(name) {
        return `${name}.${this.getUser().getUserId()}`;
    }

    validateCustomIdBelongsToUser() {
        const parts = this._customId.split('.');
        const userId = parts[1];

        return userId === this._user.getUserId();
    }
}

module.exports = Command;
