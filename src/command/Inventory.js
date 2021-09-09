const { SlashCommandBuilder } = require('@discordjs/builders');
const Command = require('./Command.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const Embed = require('../model/discord/Embed.js');

const optionViewCharacter = 'id';

class Inventory extends Command {
    async main() {
        if (this._customId && !this.validateCustomIdBelongsToUser()) {
            return new InteractionResponse(
                InteractionResponse.RESPOND,
                `This is not your inventory, try /${this.commandName} instead.`,
                null,
                null,
                true,
            );
        }

        console.log(this._options);

        if (this._options.getString(optionViewCharacter)) {
            return await this.viewCharacter(
                this._options.getString(optionViewCharacter),
            );
        }

        const user = this.getUser();
        await user.loadPlayerInfo();
        await user.loadCharacterInventory();
        let characters = user.getUniqueCharacters();
        characters = characters.sort((a, b) => a.getRarityNum() - b.getRarityNum());

        const characterCounts = user.getUniqueCharacterCounts();
        const mappedSummary = characters.map(char => `\`${char.getId().toString(16)}\`${char.getRarityAsEmoji()} - **${char.getFullName()}** ${char.getTypeAsEmoji()} x${characterCounts[char.getId()]}`);
        const embedSummary = new Embed(
            'Summary',
            mappedSummary.join('\n'),
        );
        const response = new InteractionResponse(
            InteractionResponse.RESPOND,
            null,
            [embedSummary],
        );

        return response;
    }

    async viewCharacter(hexId) {
        const numId = parseInt(hexId, 16);
        const user = this.getUser();
        await user.loadPlayerInfo();
        await user.loadCharacterInventory();

        const character = user.getCharacterFromInventoryById(numId);
        if (!character) {
            return new InteractionResponse(
                InteractionResponse.RESPOND,
                'You do not own this character!',
                null,
                null,
                true,
            );
        }

        const ownedCount = user.getUniqueCharacterCounts()[numId];

        return new InteractionResponse(
            InteractionResponse.RESPOND,
            null,
            [character.toEmbed(ownedCount)],
        );
    }

    static get commandName() {
        return 'inventory';
    }

    static toJSON() {
        return new SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription('View your inventory')
            .addStringOption(option => option.setName(optionViewCharacter)
                .setDescription('The ID of the character you wish to view')
                .setRequired(false))
            .toJSON();
    }
}

module.exports = Inventory;
