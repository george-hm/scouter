const User = require('./User.js');

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
    }

    async main() {
        throw new Error('Main function not implemented');
    }

    getCommandName() {
        return this._name;
    }
}

module.exports = Command;
