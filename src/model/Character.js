const database = require('../database.js');
const Embed = require('./discord/Embed.js');

const table = 'character';
const tableInventory = 'inventory';
const emojiMapping = {
    N: '<:n_:885253426261401630>',
    R: '<:r_:885253425963630673>',
    SR: '<:sr:885253425758097489>',
    SSR: '<:ssr:885253425791664159>',
    STR: '<:str:885253426013962300>',
    AGL: '<:agl:885253426022318160>',
    INT: '<:int:885253425976209428>',
    TEQ: '<:teq:885253426030718987>',
    UR: '<:ur:885253426169143337>',
    PHY: '<:phy:885253425984577536>',
};

class Character {
    constructor(
        id,
        resourceId,
        name,
        secondaryName,
        rarityNum,
        type,
    ) {
        this._id = id;
        this._resourceId = resourceId;
        this._name = name;
        this._secondaryName = secondaryName;
        this._rarityNum = rarityNum;
        this._type = type;
    }

    getFullName() {
        return `${this._name}, ${this._secondaryName}`;
    }

    getRarityNum() {
        return this._rarityNum;
    }

    getType() {
        return this._type;
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

    getCharacterURL() {
        return `${process.env.BASE_URL}/${this._resourceId}/card_${this._resourceId}_character.png`;
    }

    getCharacterThumbnailURL() {
        return `${process.env.BASE_URL}/${this._resourceId}/card_${this._resourceId}_circle.png`;
    }

    toEmbed() {
        return new Embed(
            this.getFullName(),
            `Type: ${emojiMapping[this._type]}\nRarity: ${emojiMapping[Character.convertRarityToString(this._rarityNum)]}`,
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
            [this.RARITY_SSR]: 15,
            [this.RARITY_UR]: 3,
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

        throw new Error('Invalid rarity');
    }

    static convertRarityToEmoji(rarity) {
        let rarityForLookup = rarity;
        if (!Number.isNaN(parseInt(rarity))) {
            rarityForLookup = this.convertRarityToString(rarityForLookup);
        }

        return emojiMapping[rarityForLookup];
    }
}
Character.RARITY_N = 0;
Character.RARITY_R = 1;
Character.RARITY_SR = 2;
Character.RARITY_SSR = 3;
Character.RARITY_UR = 4;

module.exports = Character;
