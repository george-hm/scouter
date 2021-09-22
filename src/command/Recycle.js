const { SlashCommandBuilder } = require('@discordjs/builders');
const Command = require('./Command.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const Character = require('../model/Character.js');
const Embed = require('../model/discord/Embed.js');

const optionRarity = 'rarity';
const optionRecycleAllOfRarity = 'all';

class Recycle extends Command {
    async main() {
        const rarityChosen = this.getRarityChosen();
        if (!rarityChosen && rarityChosen !== 0) {
            return new InteractionResponse('You need to select a rarity first.');
        }

        const user = this.getUser();
        await user.loadPlayerInfo();
        await user.loadCharacterInventory();

        const charactersMatchingRarity = user.getAllCharacters().filter(character => character.getRarityNum() === rarityChosen);
        if (!charactersMatchingRarity.length) {
            return new InteractionResponse(
                `You have no ${Character.convertRarityToEmoji(rarityChosen)} characters to recycle.`,
            );
        }

        const inventoryIdsToRemove = [];
        if (this.shouldRecycleAllOfRarity()) {
            inventoryIdsToRemove.push(
                ...charactersMatchingRarity.map(character => character.getInventoryId()),
            );
        } else {
            // only push duplicates
            const characterIdAndAmount = user.getUniqueCharacterCounts();
            for (const characterId in characterIdAndAmount) {
                if (!Object.hasOwnProperty.call(characterIdAndAmount, characterId)) {
                    continue;
                }
                const amount = characterIdAndAmount[characterId];
                if (amount <= 1) {
                    continue;
                }

                const inventoryIdsForCharacter = charactersMatchingRarity
                    .filter(character => character.getId() === parseInt(characterId))
                    .map(character => character.getInventoryId());
                // delete the first entry because we want to keep at least 1 copy of this character
                inventoryIdsForCharacter.splice(0, 1);
                inventoryIdsToRemove.push(
                    ...inventoryIdsForCharacter,
                );
            }
        }

        let rarityCurrencyValue;
        try {
            rarityCurrencyValue = Character.getCurrencyValueForRarity(rarityChosen);
        } catch (err) {
            if (err.toString().includes('Value for rarity')) {
                console.log(err.toString());
                return new InteractionResponse(
                    `You cannot recycle this ${Character.convertRarityToEmoji(rarityChosen)} rarity`,
                );
            }

            throw err;
        }
        await user.removeCharactersFromInventory(inventoryIdsToRemove);
        const currencyToAward = inventoryIdsToRemove.length * rarityCurrencyValue;
        await user.addCurrency(currencyToAward);
        await user.save();

        const embed = new Embed(
            `♻️ Recycled ${Character.convertRarityToEmoji(rarityChosen)} ${inventoryIdsToRemove.length} characters`,
            `${Character.getZOrbEmoji()} Z-Orbs gained: ${currencyToAward}`,
            5763719, // TODO static getters for colours
        );

        return new InteractionResponse(
            null,
            [embed],
        );
    }

    getRarityChosen() {
        return parseInt(this._options?.getString(optionRarity));
    }

    shouldRecycleAllOfRarity() {
        return this._options?.getBoolean(optionRecycleAllOfRarity);
    }

    static toJSON() {
        return new SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription('Recycle unwanted character (by default duplicates only)')
            .addStringOption(option => option.setName(optionRarity)
                .setDescription('The rarity you wish to recycle')
                .addChoice(
                    Character.convertRarityToString(Character.RARITY_N),
                    `${Character.RARITY_N}`,
                )
                .addChoice(
                    Character.convertRarityToString(Character.RARITY_R),
                    `${Character.RARITY_R}`,
                )
                .addChoice(
                    Character.convertRarityToString(Character.RARITY_SR),
                    `${Character.RARITY_SR}`,
                )
                .addChoice(
                    Character.convertRarityToString(Character.RARITY_SSR),
                    `${Character.RARITY_SSR}`,
                )
                .addChoice(
                    Character.convertRarityToString(Character.RARITY_UR),
                    `${Character.RARITY_UR}`,
                )
                .setRequired(true))
            .addBooleanOption(option => option.setName(optionRecycleAllOfRarity)
                .setDescription('Recycle all characters of the chosen rarity'))
            .toJSON();
    }

    static get commandName() {
        return 'recycle';
    }
}

module.exports = Recycle;
