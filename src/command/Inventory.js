const { SlashCommandBuilder } = require('@discordjs/builders');
const Command = require('./Command.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const Embed = require('../model/discord/Embed.js');
const Component = require('../model/discord/Component.js');
const Character = require('../model/Character.js');

const optionViewCharacter = 'id';
const optionPageNumber = 'page';
const optionRarityFilter = 'rarity';
const optionNameFilter = 'name';
const customValueEmpty = 'empty';

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
        const rarityFilter = this.getRarityFilter();
        const nameFilter = this.getNameFilter();
        if (rarityFilter) {
            characters = characters.filter(char => char.getRarityString() === rarityFilter);
        }

        if (nameFilter) {
            characters = characters.filter(char => char.getFullName().toLowerCase().includes(nameFilter));
        }
        const mappedSummary = characters.map(char => `\`${char.getId().toString(16)}\`${char.getRarityAsEmoji()} - **${char.getFullName()}** ${char.getTypeAsEmoji()} x${characterCounts[char.getId()]}`);

        let pageNumber = this.getPageNumber();
        const pages = [];
        while (mappedSummary.length) {
            pages.push(mappedSummary.splice(0, 10));
        }
        if (!pages[pageNumber]) {
            pageNumber = 0;
        }

        if (!pages.length) {
            pages.push(['No characters found.']);
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
                    this.createCustomId(
                        pageNumber - 1,
                        rarityFilter,
                        nameFilter,
                    ),
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
                    this.createCustomId(
                        pageNumber + 1,
                        rarityFilter,
                        nameFilter,
                    ),
                ),
            );
        }

        let compButtons = new Component(
            Component.TYPE_CONTAINER,
        );
        const currency = user.currency;
        compButtons.setComponents(buttons);
        if (!buttons.length) {
            compButtons = null;
        }
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

    getPageNumber() {
        if (this._options?.getNumber(optionPageNumber)) {
            return this._options?.getNumber(optionPageNumber);
        }

        const customId = this._customId;
        if (!customId) {
            return 0;
        }

        const customIdParts = customId.split('.');

        return parseInt(customIdParts[1]) || 0;
    }

    getRarityFilter() {
        if (this._options?.getString(optionRarityFilter)) {
            return this._options?.getString(optionRarityFilter);
        }
        const customId = this._customId;
        if (!customId) {
            return null;
        }
        const customIdParts = customId.split('.');

        const rarityFilterFromCustomId = customIdParts[2];
        if (rarityFilterFromCustomId === customValueEmpty) {
            return null;
        }

        return rarityFilterFromCustomId;
    }

    getNameFilter() {
        if (this._options?.getString(optionNameFilter)) {
            return this._options?.getString(optionNameFilter).toLowerCase();
        }
        const customId = this._customId;
        if (!customId) {
            return null;
        }
        const customIdParts = customId.split('.');

        const nameFilterFromCustomId = customIdParts[3];
        if (nameFilterFromCustomId === customValueEmpty) {
            return null;
        }

        return nameFilterFromCustomId.toLowerCase();
    }

    createCustomId(
        pageNumber,
        rarity,
        name,
    ) {
        let customId = this.commandName;
        customId += `.${pageNumber || customValueEmpty}`;
        customId += `.${rarity || customValueEmpty}`;
        customId += `.${name || customValueEmpty}`;

        customId += `.${Math.random().toString(32).slice(-8)}`;
        customId += `.${this.getUser().getUserId()}`;

        return customId;
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
            .addStringOption(option => option.setName(optionRarityFilter)
                .setDescription('Filter by rarity')
                .addChoice(
                    Character.convertRarityToString(Character.RARITY_N),
                    Character.convertRarityToString(Character.RARITY_N),
                )
                .addChoice(
                    Character.convertRarityToString(Character.RARITY_R),
                    Character.convertRarityToString(Character.RARITY_R),
                )
                .addChoice(
                    Character.convertRarityToString(Character.RARITY_SR),
                    Character.convertRarityToString(Character.RARITY_SR),
                )
                .addChoice(
                    Character.convertRarityToString(Character.RARITY_SSR),
                    Character.convertRarityToString(Character.RARITY_SSR),
                )
                .addChoice(
                    Character.convertRarityToString(Character.RARITY_UR),
                    Character.convertRarityToString(Character.RARITY_UR),
                )
                .setRequired(false))
            .addStringOption(option => option.setName(optionNameFilter)
                .setDescription('Filter by name')
                .setRequired(false))
            .toJSON();
    }
}

module.exports = Inventory;
