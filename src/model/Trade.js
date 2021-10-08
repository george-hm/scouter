const User = require('./User.js');
const TradeUser = require('./TradeUser.js');

class Trade {
    constructor(users) {
        if (!users.length) {
            throw new Error(`Missing users: ${users}`);
        }

        // only 2 users can participate in a trade
        if (users.length !== 2) {
            throw new Error(`User length of ${users.length} is not equal to 2`);
        }

        this._tradeUsers = [];
        for (const currentUser of users) {
            if (!(currentUser instanceof User)) {
                throw new Error(`${currentUser} is not an instance of user`);
            }
            this._tradeUsers.push(new TradeUser(currentUser));
        }
    }

    _findUser(userId) {
        return this._tradeUsers.find(tuser => tuser.user.getUserId() === userId);
    }

    async addCharacterToTrade(userId, characterId) {
        const tradeUser = this._findUser(userId);
        if (!(tradeUser instanceof TradeUser)) {
            throw new Error(`User id ${userId} is not a trade participant: ${this._tradeUsers.map(tuser => tuser.user.getUserId())}`);
        }

        await tradeUser.addCharacterToTrade(characterId);
    }

    removeCharacterFromTrade(userId, characterId) {
        const tradeUser = this._findUser(userId);
        if (!(tradeUser instanceof TradeUser)) {
            throw new Error(`User id ${userId} is not a trade participant: ${this._tradeUsers.map(tuser => tuser.user.getUserId())}`);
        }

        tradeUser.removeCharacterFromTrade(characterId);
    }

    async commitTrade() {
        // swap characters and close the trade
        if (this._tradeCommitted) {
            throw new Error(`Trade has already been committed for users ${this._tradeUsers.map(tUser => tUser.user.getUserId())}`);
        }

        for (const tradeUser of this._tradeUsers) {
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

        const promises = [];
        for (const tradeUser of this._tradeUsers) {
            const userIdToMoveTo = this._tradeUsers.find(tuser => tuser.user.getUserId() !== tradeUser.user.getUserId());
            for (const character of tradeUser.offers) {
                promises.push(character.moveCharacter(userIdToMoveTo));
            }

            // unload inventory for safety/avoid messing around with loaded inventories
            tradeUser.user.unloadCharacters();
        }

        await Promise.all(promises);
    }
}

module.exports = Trade;
