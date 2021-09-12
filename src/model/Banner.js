const Character = require('./Character.js');
const Time = require('../time.js');
const Database = require('../database.js');

const tableBanner = 'banner';
const keyName = 'name';
const keySecondName = 'secondname';
const keyBannerId = 'id';
const keyCharacterId = 'characterId';
const keyExpires = 'expires';
const keyRarity = 'rarity';

class Banner {
    constructor(bannerId, name, characterId, rarity, description, expires) {
        this[keyBannerId] = bannerId;
        this[keyName] = name;
        this[keyCharacterId] = characterId;
        this[keyRarity] = rarity;
        this[keySecondName] = description;
        this[keyExpires] = expires;
    }

    getBannerId() {
        return this[keyBannerId];
    }

    getBannerName() {
        return this[keyName];
    }

    getBannerDesc() {
        return this[keySecondName];
    }

    getBannerRarityAsString() {
        return Character.convertRarityToString(this[keyRarity]);
    }

    getTimeUntilExpires() {
        return Time.timeUntil(this[keyExpires]);
    }

    static async getBanners() {
        const db = Database.get();

        const results = await db(tableBanner)
            .select(keyBannerId)
            .select(keyName)
            .select(keyCharacterId)
            .select(keyRarity)
            .select(keySecondName)
            .select(keyExpires)
            .where(keyExpires, '>', Time.getTime())
            .limit(3);

        if (!results.length) {
            return [];
        }

        const banners = [];
        for (let i = 0; i < results.length; i++) {
            const bannerRecord = results[i];
            banners.push(new this(
                bannerRecord[keyBannerId],
                bannerRecord[keyName],
                bannerRecord[keyCharacterId],
                bannerRecord[keyRarity],
                bannerRecord[keySecondName],
                bannerRecord[keyExpires],
            ));
        }

        return banners;
    }

    static async getBannerById(bannerId) {
        const db = Database.get();

        const results = await db(tableBanner)
            .select(keyBannerId)
            .select(keyName)
            .select(keyCharacterId)
            .select(keyRarity)
            .select(keySecondName)
            .select(keyExpires)
            .where(keyExpires, '>', Time.getTime())
            .where({
                [keyBannerId]: bannerId,
            })
            .limit(1);

        if (!results.length) {
            return null;
        }

        const bannerRecord = results[0];
        return new this(
            bannerRecord[keyBannerId],
            bannerRecord[keyName],
            bannerRecord[keyCharacterId],
            bannerRecord[keyRarity],
            bannerRecord[keySecondName],
            bannerRecord[keyExpires],
        );
    }

    async summon(rarityRolled) {
        if (rarityRolled !== this[keyRarity]) {
            return await Character.getRandomByRarity(rarityRolled);
        }

        return await Character.getById(this[keyCharacterId]);
    }

    async getCharacterFromBanner() {
        return await Character.getById(this[keyCharacterId]);
    }
}

module.exports = Banner;
