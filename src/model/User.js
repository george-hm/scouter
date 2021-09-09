const database = require('../database.js');
const time = require('../time.js');

const tablePlayer = 'player';
const keyId = 'id';
const keyCurrency = 'currency';
const keyInventory = 'inventory';
const keyLastHourlyCheckIn = 'lastHourlyCheckIn';
const keyHourlyStreak = 'hourlyStreak';
const keyLastDailyCheckIn = 'lastDailyCheckIn';
const keyDailyStreak = 'dailyStreak';
const keyCreated = 'created';

// https://discord.com/developers/docs/resources/user#user-object
class User {
    constructor(user) {
        this._id = user.id;
        this._username = user.username;
        this._discriminator = user.discriminator;
        this._avatar = user.avatar;
        this._bot = user.bot;
        this._system = user.system;
        this._locale = user.locale;
        this._verified = user.verified;
        this._email = user.email;
        this._flags = user.flags;
        this._premiumType = user.premium_type;
        this._publicFlags = user.public_flags;
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
        })
            .into(tablePlayer)
            .onConflict()
            .merge([
                keyCurrency,
                keyInventory,
                keyLastHourlyCheckIn,
                keyHourlyStreak,
                keyLastDailyCheckIn,
                keyDailyStreak,
            ]);
    }

    grantHourlyReward() {
        const streakModifier = 40;
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
    }
}

module.exports = User;