const { SlashCommandBuilder } = require('@discordjs/builders');
const Command = require('./Command.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const Character = require('../model/Character.js');
const Embed = require('../model/discord/Embed.js');

const optionRarity = 'rarity';

class Recycle extends Command {
    async main() {
        const rarityChosen = this.getRarityChosen();
        if (!rarityChosen && rarityChosen !== 0) {
            return new InteractionResponse('You need to select a rarity first.');
        }

        const user = this.getUser();
        await user.loadPlayerInfo();
        await user.loadCharacterInventory();

        const charactersToRecyle = user.getAllCharacters().filter(character => character.getRarityNum() === rarityChosen);
        if (!charactersToRecyle.length) {
            return new InteractionResponse(
                `You have no ${Character.convertRarityToEmoji(rarityChosen)} characters to recycle.`,
            );
        }

        const idsToRemove = [...new Set(charactersToRecyle.map(character => character.getId()))];
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
        await user.removeCharactersFromInventory(idsToRemove);
        const currencyToAward = charactersToRecyle.length * rarityCurrencyValue;
        await user.addCurrency(currencyToAward);
        await user.save();

        // this isnt the most elegant way of returning a message
        // but its a lot more readable than a really long 1 liner
        const embedDesc = [
            `${Character.getZOrbEmoji()} Z-Orbs gained: ${currencyToAward}`,

        ];
        const embed = new Embed(
            `♻️ Recycled ${Character.convertRarityToEmoji(rarityChosen)} ${charactersToRecyle.length} characters`,
            embedDesc.join('\n'),
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

    static toJSON() {
        return new SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription('Recycle unwanted characters')
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
            .toJSON();
    }

    static get commandName() {
        return 'recycle';
    }
}

module.exports = Recycle;
