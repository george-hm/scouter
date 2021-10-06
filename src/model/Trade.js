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

        this._tradeUsers = {};
        for (let i = 0; i < users.length; i++) {
            const currentUser = users[i];
            if (!(currentUser instanceof User)) {
                throw new Error(`${currentUser} is not an instance of user`);
            }
            this._tradeUsers[currentUser.getUserId()] = new TradeUser(currentUser);
        }
    }

    async addCharacterToTrade(userId, characterId) {
        const tradeUser = this._tradeUsers[userId];
        if (!(tradeUser instanceof TradeUser)) {
            throw new Error(`User id ${userId} is not a trade participant: ${Object.keys(this._tradeUsers)}`);
        }

        await tradeUser.addCharacterToTrade(characterId);
    }

    removeCharacterFromTrade(userId, characterId) {
        const tradeUser = this._tradeUsers[userId];
        if (!(tradeUser instanceof TradeUser)) {
            throw new Error(`User id ${userId} is not a trade participant: ${Object.keys(this._tradeUsers)}`);
        }

        tradeUser.removeCharacterFromTrade(characterId);
    }

    async commitTrade() {
        // swap characters and close the trade
        if (this._tradeCommitted) {
            throw new Error(`Trade has already been committed for users ${this._tradeUsers.map(tUser => tUser.user.getUserId())}`);
        }

        const allUsersAcceptedTrade = !!Object.values(this._tradeUsers).find(tradeUser => tradeUser.accepted === false);
        if (!allUsersAcceptedTrade) {
            throw new Error('Not all users have accepted trades');
        }

        // load all invs
        const promises = [];
        for (const tradeUser of Object.values(this._tradeUsers)) {
            promises.push(tradeUser.reloadCharacterInventory());
        }

        await Promise.all(promises);

        // make sure they have the characters they say they do

        // swap the characters
        this._tradeCommitted = true;
        // perform swaps here
    }
}

module.exports = Trade;
