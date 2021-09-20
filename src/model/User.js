const database = require('../database.js');
const time = require('../time.js');
const Character = require('./Character.js');

const tablePlayer = 'player';
const tableInventory = 'inventory';
const keyId = 'id';
const keyCurrency = 'currency';
const keyInventory = 'inventory';
const keyLastHourlyCheckIn = 'lastHourlyCheckIn';
const keyHourlyStreak = 'hourlyStreak';
const keyLastDailyCheckIn = 'lastDailyCheckIn';
const keyDailyStreak = 'dailyStreak';
const keyCreated = 'created';
const keyTotalSummons = 'totalSummons';
const userCache = {};

// https://discord.com/developers/docs/resources/user#user-object
class User {
    constructor(user) {
        this._id = user.id;
        this._username = user.username;
        this._discriminator = user.discriminator;
        this._avatar = user.avatarURL({ dynamic: true });
        this._bot = user.bot;
        this._system = user.system;
        this._locale = user.locale;
        this._verified = user.verified;
        this._email = user.email;
        this._flags = user.flags;
        this._premiumType = user.premium_type;
        this._publicFlags = user.public_flags;
    }

    static create(user) {
        if (userCache[user.id]) {
            return userCache[user.id];
        }

        const userCreated = new this(user);
        userCache[user.id] = userCreated;

        return userCreated;
    }

    getAvatarURL() {
        return this._avatar;
    }

    getName() {
        return `${this._username}#${this._discriminator}`;
    }

    getUserId() {
        return this._id;
    }

    getMention() {
        return `<@${this._id}>`;
    }

    async _createPlayer() {
        const db = database.get();

        const timeNow = time.getTime();
        await db.insert({
            [keyId]: this.getUserId(),
            [keyCurrency]: 0,
            [keyInventory]: '{}',
            [keyLastHourlyCheckIn]: 0,
            [keyHourlyStreak]: 0,
            [keyLastDailyCheckIn]: 0,
            [keyDailyStreak]: 0,
            [keyCreated]: timeNow,
            [keyTotalSummons]: 0,
        })
            .into(tablePlayer);
    }

    async loadPlayerInfo() {
        if (this._playerLoaded) {
            return this;
        }

        const db = database.get();
        const result = await db(tablePlayer)
            .select(keyCurrency)
            .select(keyInventory)
            .select(keyLastHourlyCheckIn)
            .select(keyLastDailyCheckIn)
            .select(keyHourlyStreak)
            .select(keyDailyStreak)
            .select(keyTotalSummons)
            .where({
                [keyId]: this.getUserId(),
            })
            .limit(1);

        if (!result || !result.length) {
            await this._createPlayer();
            return await this.loadPlayerInfo();
        }

        const loadedPlayer = result[0];
        for (const key in loadedPlayer) {
            if (!Object.hasOwnProperty.call(loadedPlayer, key)) {
                continue;
            }
            let value = loadedPlayer[key];
            if (key === keyInventory) {
                value = JSON.parse(value);
            }

            this[key] = value;
        }

        this[keyDailyStreak] = time.dailyStreakIsValid(this[keyDailyStreak], this[keyLastDailyCheckIn]) ?
            this[keyDailyStreak] : 0;
        this[keyHourlyStreak] = time.hourlyStreakIsValid(this[keyHourlyStreak], this[keyLastHourlyCheckIn]) ?
            this[keyHourlyStreak] : 0;

        this._playerLoaded = true;
        return this;
    }

    async save() {
        const db = database.get();

        await db.insert({
            [keyId]: this.getUserId(),
            [keyCurrency]: this[keyCurrency],
            [keyInventory]: JSON.stringify(this[keyInventory] || {}),
            [keyLastHourlyCheckIn]: this[keyLastHourlyCheckIn],
            [keyHourlyStreak]: this[keyHourlyStreak],
            [keyLastDailyCheckIn]: this[keyLastDailyCheckIn],
            [keyDailyStreak]: this[keyDailyStreak],
            [keyTotalSummons]: this[keyTotalSummons],
        })
            .into(tablePlayer)
            .onConflict()
            .merge();
    }

    async loadCharacterInventory() {
        if (this._charactersLoaded) {
            return this;
        }

        const loadedCharacters = await Character.loadInventoryCharactersByPlayerId(
            this.getUserId(),
        );

        // we need to see how many duplicate character
        this._idCounts = {};
        this._uniqueCharacters = [];
        const arrCharacterIdsFound = [];
        for (let i = 0; i < loadedCharacters.length; i++) {
            const currentCharacter = loadedCharacters[i];
            const charId = currentCharacter.getId();
            this._idCounts[charId] = this._idCounts[charId] || 0;
            this._idCounts[charId]++;
            if (!arrCharacterIdsFound.includes(charId)) {
                arrCharacterIdsFound.push(charId);
                this._uniqueCharacters.push(currentCharacter);
            }
        }

        this._charactersLoaded = true;

        return this;
    }

    async removeCharactersFromInventory(inventoryIds) {
        // setting this to false so we dont have to mess
        // with removing from the players loaded inventory
        this._charactersLoaded = false;

        const db = database.get();
        await db(tableInventory)
            .where({
                playerId: this.getUserId(),
            })
            .whereIn(keyId, inventoryIds)
            .del();
    }

    getUniqueCharacterCounts() {
        if (!this._charactersLoaded) {
            throw new Error('Need to load player characters');
        }

        return this._idCounts;
    }

    getUniqueCharacters() {
        if (!this._charactersLoaded) {
            throw new Error('Need to load player characters');
        }

        return Array.from(this._uniqueCharacters);
    }

    getAllCharacters() {
        const idCounts = this.getUniqueCharacterCounts();
        const loadedCharacters = this.getUniqueCharacters();
        for (const characterId in idCounts) {
            if (!Object.hasOwnProperty.call(idCounts, characterId)) {
                continue;
            }
            const amount = idCounts[characterId];
            if (amount <= 1) {
                continue;
            }

            const characterToDuplicate = loadedCharacters.find(char => char.getId() === parseInt(characterId));
            if (!characterToDuplicate) {
                throw new Error(`Cannot find character with id ${characterId}`);
            }
            for (let i = 0; i < amount; i++) {
                // yes we're pushing the same instance but this shouldn't matter
                loadedCharacters.push(characterToDuplicate);
            }
        }

        return loadedCharacters;
    }

    getCharacterFromInventoryById(id) {
        const characters = this.getUniqueCharacters();

        return characters.find(char => char.getId() === id);
    }

    grantHourlyReward() {
        const streakModifier = 35;
        this[keyHourlyStreak] = time.hourlyStreakIsValid(this[keyHourlyStreak], this[keyLastHourlyCheckIn]) ?
            this[keyHourlyStreak] : 0;
        const rewardValue = this._grantReward(
            User.HourlyReward,
            streakModifier,
            this[keyHourlyStreak],
        );
        this[keyHourlyStreak]++;
        return rewardValue;
    }

    grantDailyReward() {
        const streakModifier = 20;
        this[keyDailyStreak] = time.dailyStreakIsValid(this[keyDailyStreak], this[keyLastDailyCheckIn]) ?
            this[keyDailyStreak] : 0;
        const rewardValue = this._grantReward(
            User.DailyReward,
            streakModifier,
            this[keyDailyStreak],
        );
        this[keyDailyStreak]++;
        return rewardValue;
    }

    /**
     * Increases player streak
     * Add reward to currency
     * Returns reward value
     *
     * @returns
     * @memberof User
     */
    _grantReward(rewardValue, streakModifier, currentStreak) {
        // reward + (streak modifier * currentStreak)
        const reward = rewardValue + Math.ceil(
            (
                (rewardValue / 100) * streakModifier
            ) * currentStreak,
        );

        this[keyCurrency] += reward;

        return reward;
    }

    async addCurrency(amount) {
        if (!this._playerLoaded) {
            await this.loadPlayerInfo();
        }

        this[keyCurrency] += amount;
        return this;
    }

    static get HourlyReward() {
        return 5;
    }

    static get DailyReward() {
        return 20;
    }

    addRarityToInventory(rarity) {
        if (!this._playerLoaded) {
            throw new Error('Player not loaded');
        }
        const inventory = this[keyInventory] || {};
        inventory[rarity] = inventory[rarity] || 0;
        inventory[rarity]++;
        this[keyTotalSummons]++;
        this._charactersLoaded = false;
    }
}

module.exports = User;
