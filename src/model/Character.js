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
}
Character.RARITY_N = 0;
Character.RARITY_R = 0;
Character.RARITY_SR = 0;
Character.RARITY_SSR = 0;
Character.RARITY_UR = 0;

module.exports = Character;
