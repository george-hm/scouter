const { SlashCommandBuilder } = require('@discordjs/builders');
const Command = require('./Command.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const Time = require('../time.js');

class HourlyCheckIn extends Command {
    async main() {
        const user = this.getUser();
        await user.loadPlayerInfo();
        const lastHourlyCheckIn = user.lastHourlyCheckIn;
        if (!Time.eligableForHourly(lastHourlyCheckIn)) {
            const timeUntilHourly = Time.timeUntilHourly(lastHourlyCheckIn);
            return new InteractionResponse(
                InteractionResponse.RESPOND,
                `Sorry, hourly check-in available in **${timeUntilHourly}**`,
            );
        }

        const rewardValue = user.grantHourlyReward();
        user.lastHourlyCheckIn = Time.getTime();
        await user.save();

        return new InteractionResponse(
            InteractionResponse.RESPOND,
            `<:bardockdisgust:850378401743110164> I see you've found ${rewardValue} Z-Orbs.\n**Streak**: ${user.hourlyStreak}`,
        );
    }

    static toJSON() {
        return new SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription('Do your hourly check-in and earn currency (1 hour cooldown)')
            .toJSON();
    }

    static get commandName() {
        return 'hourly';
    }
}

module.exports = HourlyCheckIn;
