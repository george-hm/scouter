const { SlashCommandBuilder } = require('@discordjs/builders');
const Command = require('./Command.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const Embed = require('../model/discord/Embed.js');

class Inventory extends Command {
    async main() {
        if (this._customId && !this.validateCustomIdBelongsToUser()) {
            return new InteractionResponse();
        }

        const user = this.getUser();
        await user.loadPlayerInfo();
        await user.loadCharacterInventory();
        let characters = user.getUniqueCharacters();
        characters = characters.sort((a, b) => a.getRarityNum() - b.getRarityNum());

        const characterCounts = user.getUniqueCharacterCounts();

        const mappedSummary = characters.map(char => `${char.getRarityAsEmoji()} - **${char.getFullName()}** ${char.getTypeAsEmoji()} x${characterCounts[char.getId()]}`);
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

    static get commandName() {
        return 'inventory';
    }

    static toJSON() {
        return new SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription('View your inventory')
            .toJSON();
    }
}

module.exports = Inventory;
