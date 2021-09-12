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

        const { currency } = user;
        const { hourlyStreak } = user;
        const { dailyStreak } = user;
        const { totalSummons } = user;
        const totalCharacters = Object.values(user.getUniqueCharacterCounts()).reduce((a, b) => a + b);
        const toReturn = [
            `${Character.getZOrbEmoji()} Z-Orbs: ${currency}`,
            `Current Daily Streak: ${dailyStreak}`,
            `Current Hourly Streak: ${hourlyStreak}`,
            `All time summons: ${totalSummons}`,
            '',
            '**Total Rarities**:',
        ];
        let addedRarities = false;
        // TODO user.inventory should have all rarities (not just ones owned)
        for (const rartiyNum in user.inventory) {
            if (!Object.hasOwnProperty.call(user.inventory, rartiyNum)) {
                continue;
            }
            addedRarities = true;
            const rarityCount = user.inventory[rartiyNum];
            toReturn.push(`${Character.convertRarityToEmoji(rartiyNum)}: ${rarityCount}`);
        }

        if (!addedRarities) {
            toReturn.push('None.');
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
