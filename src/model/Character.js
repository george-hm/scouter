const database = require('../database.js');
const Embed = require('./discord/Embed.js');

const table = 'character';

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

    getCharacterURL() {
        return `${process.env.BASE_URL}/${this._id}/card_${this._id}_character.png`;
    }

    getCharacterThumbnailURL() {
        return `${process.env.BASE_URL}/${this._id}/card_${this._id}_circle.png`;
    }

    toEmbed() {
        return new Embed(
            `${this._name}, ${this._secondaryName}`,
            `Type: ${this._type}\nRarity: ${this._rarityNum}`,
            null,
            this.getCharacterURL(),
            this.getCharacterThumbnailURL(),
        );
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
}
Character.RARITY_N = 0;
Character.RARITY_R = 1;
Character.RARITY_SR = 2;
Character.RARITY_SSR = 3;
Character.RARITY_UR = 4;

module.exports = Character;
