const { Message } = require('discord.js');
const User = require('./User.js');
const TradeUser = require('./TradeUser.js');
const Embed = require('./discord/Embed.js');

class Trade {
    constructor(users) {
        if (!users.length) {
            throw new Error(`Missing users: ${users}`);
        }

        this.active = true;
        this.id = this._generateRandomId(8);

        // only 2 users can participate in a trade
        if (users.length !== 2) {
            throw new Error(`User length of ${users.length} is not equal to 2`);
        }

        this.tradeUsers = [];
        for (const currentUser of users) {
            if (!(currentUser instanceof User)) {
                throw new Error(`${currentUser} is not an instance of user`);
            }
            this.tradeUsers.push(new TradeUser(currentUser));
        }
    }

    findUser(userId) {
        return this.tradeUsers.find(tuser => tuser.user.getUserId() === userId);
    }

    async addCharacterToTrade(userId, characterId) {
        const tradeUser = this.findUser(userId);
        if (!(tradeUser instanceof TradeUser)) {
            throw new Error(`User id ${userId} is not a trade participant: ${this.tradeUsers.map(tuser => tuser.user.getUserId())}`);
        }

        await tradeUser.addCharacterToTrade(characterId);
    }

    removeCharacterFromTrade(userId, characterId) {
        const tradeUser = this.findUser(userId);
        if (!(tradeUser instanceof TradeUser)) {
            throw new Error(`User id ${userId} is not a trade participant: ${this.tradeUsers.map(tuser => tuser.user.getUserId())}`);
        }

        tradeUser.removeCharacterFromTrade(characterId);
    }

    async commitTrade() {
        // swap characters and close the trade
        if (this._tradeCommitted) {
            throw new Error(`Trade has already been committed for users ${this.tradeUsers.map(tUser => tUser.user.getUserId())}`);
        }

        for (const tradeUser of this.tradeUsers) {
            if (!tradeUser.accepted) {
                throw new Error('Not all participants have accepted trade');
            }

            // eslint-disable-next-line no-await-in-loop
            if (!(await tradeUser.assertAllCharactersExist())) {
                throw new Error('Invalid offers');
            }
        }

        // swap the characters
        this._tradeCommitted = true;
        this.active = false;

        const promises = [];
        for (const tradeUser of this.tradeUsers) {
            const userIdToMoveTo = this.tradeUsers.find(tuser => tuser.user.getUserId() !== tradeUser.user.getUserId());
            for (const character of tradeUser.offers) {
                promises.push(character.moveCharacter(userIdToMoveTo));
            }

            // unload inventory for safety/avoid messing around with loaded inventories
            tradeUser.user.unloadCharacters();
        }

        await Promise.all(promises);
    }

    allUsersAccepted() {
        const acceptedUsers = this.tradeUsers.filter(tradeUser => tradeUser.accepted);
        return acceptedUsers.length === this.tradeUsers.length;
    }

    toEmbed() {
        const title = `Trade between ${this.tradeUsers.map(tuser => tuser.user.getName()).join(' and ')}`;
        let description = '';
        for (const tradeUser of this.tradeUsers) {
            description += `\n**${tradeUser.user.getName()}** offers:\n`;
            for (const character of tradeUser.offers) {
                description += `${character.stringSummary}\n`;
            }
        }

        description += '\nAccepted:\n';
        for (const tradeUser of this.tradeUsers) {
            description += `${tradeUser.user.getMention()}: ${tradeUser.accepted ? '☑️' : '🇽'}\n`;
        }

        description += `\n\nTrade ID: ${this.id}`;

        return new Embed(
            title,
            description,
            // TODO both accepted = green, none = red, partial = yellow
        );
    }

    _generateRandomId(length) {
        let randomCharacters = '';
        for (let i = 0; i < Math.floor(length / 10) + 1; i++) {
            randomCharacters += Math.random().toString(36).slice(2, 12);
        }

        return randomCharacters.slice(0, length);
    }

    get tradeCommitted() {
        return this._tradeCommitted;
    }

    set tradeMessage(message) {
        if (!(message instanceof Message)) {
            throw new Error(`${message} is not an instance of Message`);
        }

        this._tradeMessage = message;
    }

    get tradeMessage() {
        return this._tradeMessage;
    }
}

module.exports = Trade;
