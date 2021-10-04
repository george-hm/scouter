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

        if (this._options?.getString(optionViewCharacter) || this.getCharacterHexId()) {
            return await this.viewCharacter(
                this._options?.getString(optionViewCharacter) || this.getCharacterHexId(),
                this.getRarityFilter(),
                this.getNameFilter(),
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

        // push all control buttons
        const buttons = [];
        buttons.push(
            new Component(
                Component.TYPE_BUTTON,
                Component.STYLE_SECONDARY,
                null,
                {
                    name: '⏪',
                },
                this.createCustomId(
                    0,
                    rarityFilter,
                    nameFilter,
                ),
                null,
                pageNumber === 0,
            ),
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
                null,
                pageNumber === 0,
            ),
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
                null,
                !pages[pageNumber + 1],
            ),
            new Component(
                Component.TYPE_BUTTON,
                Component.STYLE_SECONDARY,
                null,
                {
                    name: '⏩',
                },
                this.createCustomId(
                    pages.length - 1,
                    rarityFilter,
                    nameFilter,
                ),
                null,
                pageNumber === pages.length - 1,
            ),
        );

        let compButtons = new Component(
            Component.TYPE_CONTAINER,
        );
        const { currency } = user;
        compButtons.setComponents(buttons);
        if (!buttons.length) {
            compButtons = null;
        }
        const embedSummary = new Embed(
            `Summary\n${Character.getZOrbEmoji()} Z-Orbs: ${currency}\nPage ${pageNumber + 1} of ${pages.length}`,
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

    async viewCharacter(hexId, rarityFilter, nameFilter) {
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

        let uniqueCharacters = user.getUniqueCharacters().sort((a, b) => a.getRarityNum() - b.getRarityNum());
        if (rarityFilter) {
            uniqueCharacters = uniqueCharacters.filter(char => char.getRarityString() === rarityFilter);
        }
        if (nameFilter) {
            uniqueCharacters = uniqueCharacters.filter(char => char.getFullName().toLowerCase().includes(nameFilter));
        }

        const characterIds = uniqueCharacters.map(char => char.getId());
        const chosenCharIndex = characterIds.indexOf(numId);

        // someones name/rarity filters arent compatible, call again with no filters
        if (!chosenCharIndex === -1) {
            return this.viewCharacter(hexId);
        }
        const prevCharHexId = parseInt(characterIds[chosenCharIndex - 1] || 0).toString(16);
        const nextCharHexId = parseInt(characterIds[chosenCharIndex + 1] || 0).toString(16);

        // push all control buttons
        const buttons = [];
        buttons.push(
            new Component(
                Component.TYPE_BUTTON,
                Component.STYLE_SECONDARY,
                null,
                {
                    name: '⏪',
                },
                this.createCustomId(
                    null,
                    rarityFilter,
                    nameFilter,
                    parseInt(characterIds[0]).toString(16),
                ),
                null,
                chosenCharIndex === 0,
            ),
            new Component(
                Component.TYPE_BUTTON,
                Component.STYLE_SECONDARY,
                null,
                {
                    name: '◀️',
                },
                this.createCustomId(
                    null,
                    rarityFilter,
                    nameFilter,
                    prevCharHexId,
                ),
                null,
                chosenCharIndex === 0,
            ),
            new Component(
                Component.TYPE_BUTTON,
                Component.STYLE_SECONDARY,
                null,
                {
                    name: '▶️',
                },
                this.createCustomId(
                    null,
                    rarityFilter,
                    nameFilter,
                    nextCharHexId,
                ),
                null,
                chosenCharIndex === (characterIds.length - 1),
            ),
            new Component(
                Component.TYPE_BUTTON,
                Component.STYLE_SECONDARY,
                null,
                {
                    name: '⏩',
                },
                this.createCustomId(
                    null,
                    rarityFilter,
                    nameFilter,
                    parseInt(characterIds[characterIds.length - 1]).toString(16),
                ),
                null,
                chosenCharIndex === (characterIds.length - 1),
            ),
        );

        const compButtons = new Component(
            Component.TYPE_CONTAINER,
        );
        compButtons.setComponents(buttons);

        return new InteractionResponse(
            null,
            [character.toEmbed(ownedCount)],
            compButtons,
            false,
            true,
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

    getCharacterHexId() {
        const customId = this._customId;
        if (!customId) {
            return null;
        }
        const customIdParts = customId.split('.');

        const nameFilterFromCustomId = customIdParts[4];
        if (nameFilterFromCustomId === customValueEmpty) {
            return null;
        }

        return nameFilterFromCustomId;
    }

    createCustomId(
        pageNumber,
        rarity,
        name,
        hexId,
    ) {
        let customId = this.commandName;
        customId += `.${pageNumber || customValueEmpty}`;
        customId += `.${rarity || customValueEmpty}`;
        customId += `.${name || customValueEmpty}`;
        customId += `.${hexId || customValueEmpty}`;

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
                .addChoice(
                    Character.convertRarityToString(Character.RARITY_LR),
                    Character.convertRarityToString(Character.RARITY_LR),
                )
                .setRequired(false))
            .addStringOption(option => option.setName(optionNameFilter)
                .setDescription('Filter by name')
                .setRequired(false))
            .toJSON();
    }
}

module.exports = Inventory;
