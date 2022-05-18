const { SlashCommandBuilder } = require('@discordjs/builders');
const Character = require('../model/Character.js');
const Command = require('./Command.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const Embed = require('../model/discord/Embed.js');

class Stats extends Command {
    async main() {
        const user = this.getUser();
        await user.loadPlayerInfo();
        await user.loadCharacterInventory();

        const {
            currency,
            hourlyStreak,
            dailyStreak,
            totalSummons,
        } = user;
        const totalCharacters = Object.values(user.getUniqueCharacterCounts()).reduce((a, b) => a + b);
        const toReturn = [
            `${Character.getZOrbEmoji()} Z-Orbs: ${currency}`,
            `Current Daily Streak: ${dailyStreak}`,
            `Current Hourly Streak: ${hourlyStreak}`,
            `All time summons: ${totalSummons}`,
            '',
            '**Total Rarities**:',
        ];

        const rarityCounts = {
            [Character.RARITY_N]: 0,
            [Character.RARITY_R]: 0,
            [Character.RARITY_SR]: 0,
            [Character.RARITY_SSR]: 0,
            [Character.RARITY_UR]: 0,
            [Character.RARITY_LR]: 0,
        };
        const allCharacters = user.getAllCharacters();
        for (let i = 0; i < allCharacters.length; i++) {
            const character = allCharacters[i];
            rarityCounts[character.getRarityNum()]++;
        }

        for (const rarityNum in rarityCounts) {
            if (!Object.hasOwnProperty.call(rarityCounts, rarityNum)) {
                continue;
            }
            const count = rarityCounts[rarityNum];
            toReturn.push(`${Character.convertRarityToEmoji(rarityNum)}: ${count}`);
        }

        toReturn.push(`\nTotal characters: ${totalCharacters}`);

        const embed = new Embed(
            `Statistics for ${user.getName()}`,
            toReturn.join('\n'),
            5763719,
            null,
            user.getAvatarURL(),
        );
        return new InteractionResponse(
            null,
            [embed],
        );
    }

    static get commandName() {
        return 'stats';
    }

    static toJSON() {
        return new SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription('View various stats about your characters and summons')
            .toJSON();
    }
}

module.exports = Stats;
