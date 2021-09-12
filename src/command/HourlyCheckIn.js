const { SlashCommandBuilder } = require('@discordjs/builders');
const Command = require('./Command.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const Time = require('../time.js');
const Character = require('../model/Character.js');

class HourlyCheckIn extends Command {
    async main() {
        const user = this.getUser();
        await user.loadPlayerInfo();
        const { lastHourlyCheckIn } = user;
        if (!Time.eligableForHourly(lastHourlyCheckIn)) {
            const timeUntilHourly = Time.timeUntilHourly(lastHourlyCheckIn);
            return new InteractionResponse(
                `Sorry, hourly check-in available in **${timeUntilHourly}**\nCurrent Streak: **${user.hourlyStreak}**`,
            );
        }

        const rewardValue = user.grantHourlyReward();
        user.lastHourlyCheckIn = Time.getTime();
        await user.save();

        return new InteractionResponse(
            `<:bardockdisgust:850378401743110164> I see you've found ${rewardValue} ${Character.getZOrbEmoji()} Z-Orbs.\n**Streak**: ${user.hourlyStreak}`,
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
