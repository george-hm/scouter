const User = require('./User.js');

class TradeUser {
    constructor(userForTrade) {
        if (!(userForTrade instanceof User)) {
            throw new Error(`${userForTrade} is not an instance of user`);
        }

        this._user = userForTrade;
        this._offers = [];
        this._accept = false;
    }

    get user() {
        return this._user;
    }

    get accepted() {
        return this._accept;
    }

    async addCharacterToTrade(characterId) {
        await this._user.loadCharacterInventory();
        const allCharacters = this._user.getAllCharacters();
        const charactersMatchingId = allCharacters.filter(character => character.getId() === characterId);
        if (!charactersMatchingId.length) {
            throw new Error(`User ${this._user.getUserId()} has no characters with id ${characterId}`);
        }

        const charactersCurrentlyInOffer = this._offers.filter(character => character.getId() === characterId);
        // added all characters to trade already - no duping!
        if (charactersMatchingId.length === charactersCurrentlyInOffer.length) {
            return;
        }

        const inventoryIdsInOffer = charactersCurrentlyInOffer.map(character => character.getInventoryId());
        for (let i = 0; i < charactersMatchingId.length; i++) {
            const currentCharacter = charactersMatchingId[i];
            if (inventoryIdsInOffer.includes(currentCharacter.getInventoryId())) {
                continue;
            }

            this._offers.push(currentCharacter);
            break;
        }

        this._accept = false;
    }

    removeCharacterFromTrade(characterId) {
        const characterIndexInTrade = this._offers.findIndex(character => characterId === character.getId());
        if (characterIndexInTrade === -1) {
            return;
        }

        this._offers.splice(characterIndexInTrade, 1);
        this._accept = false;
    }

    async assertAllCharactersExist() {
        // TODO - disable recycling if trade is open?

        // reload inventory, go through inv and offers, validate everything exists in their inv
        // (e.g. stop duplication where they have started a trade then recycled a character)
        await this._user.reloadCharacters();

        const charsInInv = this._user.getAllCharacters();
        for (const character of this._offers) {
            const presentChar = charsInInv.find(invChar => invChar.getInventoryId() === character.getInventoryId());
            if (!presentChar) {
                return false;
            }
        }

        return true;
    }

    get offers() {
        return this._offers;
    }

    get charCountAndNameAsString() {
        let strSummary = '';

        const nameAndCount = {};
        for (const character of this._offers) {
            nameAndCount[character.stringSummary] = nameAndCount[character.stringSummary] || 0;
            nameAndCount[character.stringSummary]++;
        }

        for (const name in nameAndCount) {
            if (!Object.hasOwnProperty.call(nameAndCount, name)) {
                continue;
            }
            const count = nameAndCount[name];
            strSummary += `${name} x${count}`;
        }

        return strSummary;
    }
}

module.exports = TradeUser;
