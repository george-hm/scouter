const { SlashCommandBuilder } = require('@discordjs/builders');
const Command = require('./Command.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const Embed = require('../model/discord/Embed.js');
const Component = require('../model/discord/Component.js');

const optionViewCharacter = 'id';
const optionPageNumber = 'page';

class Inventory extends Command {
    async main() {
        if (this._customId && !this.validateCustomIdBelongsToUser()) {
            return new InteractionResponse(
                `This is not your inventory, try /${this.commandName} instead.`,
                null,
                null,
                true,
            );
        }

        if (this._options?.getString(optionViewCharacter)) {
            return await this.viewCharacter(
                this._options.getString(optionViewCharacter),
            );
        }

        const user = this.getUser();
        await user.loadPlayerInfo();
        await user.loadCharacterInventory();
        let characters = user.getUniqueCharacters();
        characters = characters.sort((a, b) => a.getRarityNum() - b.getRarityNum());

        if (!characters.length) {
            return new InteractionResponse(
                'You do not have any characters. Get started with /daily and /summon',
            );
        }

        const characterCounts = user.getUniqueCharacterCounts();
        const mappedSummary = characters.map(char => `\`${char.getId().toString(16)}\`${char.getRarityAsEmoji()} - **${char.getFullName()}** ${char.getTypeAsEmoji()} x${characterCounts[char.getId()]}`);

        let pageNumber = this._options?.getNumber(optionPageNumber) || this.getPageNumberFromButton();
        const pages = [];
        while (mappedSummary.length) {
            pages.push(mappedSummary.splice(0, 10));
        }
        if (!pages[pageNumber]) {
            pageNumber = 0;
        }
        const buttons = [];
        if (pageNumber !== 0) {
            buttons.push(
                new Component(
                    Component.TYPE_BUTTON,
                    Component.STYLE_SECONDARY,
                    null,
                    {
                        name: '◀️',
                    },
                    this.createCustomId(pageNumber - 1),
                ),
            );
        }

        if (pages[pageNumber + 1]) {
            buttons.push(
                new Component(
                    Component.TYPE_BUTTON,
                    Component.STYLE_SECONDARY,
                    null,
                    {
                        name: '▶️',
                    },
                    this.createCustomId(pageNumber + 1),
                ),
            );
        }

        const compButtons = new Component(
            Component.TYPE_CONTAINER,
        );
        const currency = user.currency;
        compButtons.setComponents(buttons);
        const embedSummary = new Embed(
            `Summary\nZ-Orbs: ${currency}\nPage ${pageNumber + 1} of ${pages.length}`,
            pages[pageNumber].join('\n'),
        );
        return new InteractionResponse(
            null,
            [embedSummary],
            compButtons,
            null,
            true,
        );
    }

    async viewCharacter(hexId) {
        const numId = parseInt(hexId, 16);
        const user = this.getUser();
        await user.loadPlayerInfo();
        await user.loadCharacterInventory();

        const character = user.getCharacterFromInventoryById(numId);
        if (!character) {
            return new InteractionResponse(
                'You do not own this character!',
                null,
                null,
                true,
            );
        }

        const ownedCount = user.getUniqueCharacterCounts()[numId];

        return new InteractionResponse(
            null,
            [character.toEmbed(ownedCount)],
        );
    }

    getPageNumberFromButton() {
        const customId = this.getCustomIdValue();
        let num = parseInt(customId);
        if (num) {
            num--;
        }
        return num || 0;
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
            .addNumberOption(option => option.setName(optionPageNumber)
                .setDescription('What page of your inventory you\'d like to go to')
                .setRequired(false))
            .toJSON();
    }
}

module.exports = Inventory;
