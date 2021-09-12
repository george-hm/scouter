const { CommandInteractionOptionResolver } = require('discord.js');
// eslint-disable-next-line no-unused-vars
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const User = require('../model/User.js');

// https://discord.com/developers/docs/interactions/slash-commands#interaction-object-application-command-interaction-data-structure
class Command {
    constructor(commandName, customId, options, user, values) {
        if (!(user instanceof User)) {
            throw new Error('User is not model');
        }
        this._commandName = commandName;
        if (options instanceof CommandInteractionOptionResolver) {
            this._options = options;
        }
        this._user = user;
        this._customId = customId;
        this._values = values;
    }

    getValues() {
        return this._values || [];
    }

    /**
     * @returns {Promise<InteractionResponse>}
     */
    async main() {
        throw new Error('Main function not implemented');
    }

    getOptions() {
        return this._options;
    }

    getUser() {
        return this._user;
    }

    static toJSON() {
        throw new Error('Not implemented');
    }

    createCustomId(name) {
        return `${this.commandName}.${name}.${this.getUser().getUserId()}`;
    }

    getCustomIdValue() {
        if (!this._customId) {
            return null;
        }

        return this._customId.split('.')[1];
    }

    validateCustomIdBelongsToUser() {
        if (!this._customId) {
            return false;
        }

        const parts = this._customId.split('.');
        const userId = parts.pop();

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
