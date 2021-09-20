const database = require('../database.js');
const Embed = require('./discord/Embed.js');

const table = 'character';
const tableInventory = 'inventory';
const emojiMapping = {
    N: '<:n_:885253426261401630>',
    R: '<:r_:885253425963630673>',
    SR: '<:sr:885253425758097489>',
    SSR: '<:ssr:885253425791664159>',
    UR: '<:ur:885253426169143337>',
    LR: '<:lr:885461691075272714>',
    STR: '<:str:885253426013962300>',
    AGL: '<:agl:885253426022318160>',
    INT: '<:int:885253425976209428>',
    TEQ: '<:teq:885253426030718987>',
    PHY: '<:phy:885253425984577536>',
    ZORB: '<:zorb:886518823417696266>',
};

const keyInventoryId = 'inventoryId';

class Character {
    constructor(
        id,
        resourceId,
        name,
        secondaryName,
        rarityNum,
        type,
        inventoryId,
    ) {
        this._id = id;
        this._resourceId = resourceId;
        this._name = name;
        this._secondaryName = secondaryName;
        this._rarityNum = rarityNum;
        this._type = type;
        this[keyInventoryId] = inventoryId;
    }

    static getZOrbEmoji() {
        return emojiMapping.ZORB;
    }

    getFullName() {
        return `${this._name}, ${this._secondaryName}`;
    }

    getFirstName() {
        return this._name;
    }

    getRarityNum() {
        return this._rarityNum;
    }

    getType() {
        return this._type;
    }

    getRarityString() {
        return Character.convertRarityToString(this._rarityNum);
    }

    getRarityAsEmoji() {
        return Character.convertRarityToEmoji(this.getRarityNum());
    }

    getTypeAsEmoji() {
        const emoji = emojiMapping[this.getType()];
        if (!emoji) {
            throw new Error(`Missing type emoji for ${this.getType}`);
        }
        return emojiMapping[this.getType()];
    }

    getId() {
        return this._id;
    }

    getInventoryId() {
        return this[keyInventoryId] || null;
    }

    getCharacterURL() {
        return `${process.env.BASE_URL}/${this._resourceId}/card_${this._resourceId}_character.png`;
    }

    getCharacterThumbnailURL() {
        return `${process.env.BASE_URL}/${this._resourceId}/card_${this._resourceId}_circle.png`;
    }

    toEmbed(count) {
        return new Embed(
            this.getFullName(),
            `${count ? `Owned: ${count}\n` : ''}Type: ${emojiMapping[this._type]}\nRarity: ${emojiMapping[Character.convertRarityToString(this._rarityNum)]}`,
            null,
            this.getCharacterURL(),
            this.getCharacterThumbnailURL(),
        );
    }

    static async getRandomByRarity(rarityNum) {
        if (typeof rarityNum !== 'number') {
            throw new Error(`Rarity is not number: ${rarityNum}`);
        }

        const dbInstance = database.get();
        const response = await dbInstance(table)
            .where({
                v_rarity: rarityNum,
                hasImage: 1,
            }).orderByRaw('RAND()')
            .limit(1);

        const charResult = response[0];

        const loadedChar = new this(
            charResult.id,
            charResult.resource_id,
            charResult.name,
            charResult.secondname,
            rarityNum,
            charResult.type,
        );

        return loadedChar;
    }

    async addToPlayer(userId) {
        const dbInstance = database.get();

        await dbInstance(tableInventory)
            .insert({
                playerId: userId,
                characterId: this._id,
            });
    }

    static async getById(id) {
        const dbInstance = database.get();
        const results = await dbInstance(table)
            .where({
                id,
            })
            .limit(1);

        if (!results || !results.length) {
            throw new Error('No character found');
        }

        const rawCharacter = results[0];
        const character = new this(
            rawCharacter.id,
            rawCharacter.resource_id,
            rawCharacter.name,
            rawCharacter.secondname,
            rawCharacter.v_rarity,
            rawCharacter.type,
        );

        return character;
    }

    static getRandomRarity() {
        const mappings = {
            [this.RARITY_N]: 100,
            [this.RARITY_R]: 50,
            [this.RARITY_SR]: 30,
            [this.RARITY_SSR]: 13,
            [this.RARITY_UR]: 3,
            [this.RARITY_LR]: 0.15,
        };
        const roll = Math.random() * 100;
        let rarityChosen = null;
        for (const rarity in mappings) {
            if (!Object.hasOwnProperty.call(mappings, rarity)) {
                continue;
            }
            const rarityCutoff = mappings[rarity];
            if (roll <= rarityCutoff) {
                rarityChosen = rarity;
            }
        }

        return parseInt(rarityChosen);
    }

    static convertRarityToString(rarity) {
        // eslint-disable-next-line no-param-reassign
        rarity = parseInt(rarity);
        if (rarity === this.RARITY_N) {
            return 'N';
        }
        if (rarity === this.RARITY_R) {
            return 'R';
        }
        if (rarity === this.RARITY_SR) {
            return 'SR';
        }
        if (rarity === this.RARITY_SSR) {
            return 'SSR';
        }
        if (rarity === this.RARITY_UR) {
            return 'UR';
        }
        if (rarity === this.RARITY_LR) {
            return 'LR';
        }

        throw new Error(`Invalid rarity: ${rarity}`);
    }

    static convertRarityToEmoji(rarity) {
        let rarityForLookup = rarity;
        if (!Number.isNaN(parseInt(rarity))) {
            rarityForLookup = this.convertRarityToString(rarityForLookup);
        }

        return emojiMapping[rarityForLookup];
    }

    static async loadCharactersByIds(characterIds) {
        const dbInstance = database.get();
        const results = await dbInstance(table)
            .whereIn('id', characterIds);

        return results.map(rawCharacter => new Character(
            rawCharacter.id,
            rawCharacter.resource_id,
            rawCharacter.name,
            rawCharacter.secondname,
            rawCharacter.v_rarity,
            rawCharacter.type,
        ));
    }

    static async loadInventoryCharactersByPlayerId(playerId) {
        const db = database.get();
        // yes this will load duplicate character data, which could slow down queries a bit
        // however this seems better than messing around in the code trying to create duplicates
        // and we have the inventory id right off the bat
        const results = await db(tableInventory)
            .select(`${tableInventory}.id as ${keyInventoryId}`)
            .select('resource_id')
            .select('name')
            .select('secondname')
            .select('v_rarity')
            .select('type')
            .select('characterId')
            .where({
                playerId,
            })
            .innerJoin(table, `${tableInventory}.characterid`, `${table}.id`);

        // TODO make consts for each of these keys
        return results.map(rawCharacter => new Character(
            rawCharacter.characterId,
            rawCharacter.resource_id,
            rawCharacter.name,
            rawCharacter.secondname,
            rawCharacter.v_rarity,
            rawCharacter.type,
            rawCharacter[keyInventoryId],
        ));
    }

    static getCurrencyValueForRarity(rarityNum) {
        switch (rarityNum) {
            case this.RARITY_N:
                return 1;
            case this.RARITY_R:
                return 3;
            case this.RARITY_SR:
                return 5;
            case this.RARITY_SSR:
                return 8;
            default:
                throw new Error(`Value for rarity ${rarityNum} not found`);
        }
    }
}
Character.RARITY_N = 0;
Character.RARITY_R = 1;
Character.RARITY_SR = 2;
Character.RARITY_SSR = 3;
Character.RARITY_UR = 4;
Character.RARITY_LR = 5;

module.exports = Character;
