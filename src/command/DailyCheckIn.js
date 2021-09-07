const { SlashCommandBuilder } = require('@discordjs/builders');
const Command = require('./Command.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const Time = require('../time.js');

class DailyCheckIn extends Command {
    async main() {
        const user = this.getUser();
        await user.loadPlayerInfo();
        console.log(user);
        const lastDailyCheckIn = user.lastDailyCheckIn;
        if (!Time.eligableForDaily(lastDailyCheckIn)) {
            const timeUntilDaily = Time.timeUntilDaily(lastDailyCheckIn);
            return new InteractionResponse(
                InteractionResponse.RESPOND,
                `Sorry, come back in ${timeUntilDaily} for your daily check-in`,
            );
        }

        const rewardValue = user.grantDailyReward();
        user.lastDailyCheckIn = Time.getTime();
        await user.save();

        return new InteractionResponse(
            InteractionResponse.RESPOND,
            `<:PES_HmmSpecs:672161497413189680> Quite the haul I see. Found ${rewardValue} Z-Orbs.\n**Streak**: ${user.dailyStreak}`,
        );
    }

    static toJSON() {
        return new SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription('Do your daily check-in and earn currency (24 hour cooldown)')
            .toJSON();
    }

    static get commandName() {
        return 'daily';
    }
}

module.exports = DailyCheckIn;
