const Command = require('./Command.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const Constants = require('../constants.js');
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
                `Sorry, come back in ${timeUntilHourly} for your hourly check-in`,
            );
        }

        const rewardValue = user.grantHourlyReward();
        user.lastHourlyCheckIn = Constants.getTime();
        await user.save();

        return new InteractionResponse(
            InteractionResponse.RESPOND,
            `<:bardockdisgust:850378401743110164> I see you've found ${rewardValue} Z-Orbs.\n**Streak**: ${user.hourlyStreak}`,
        );
    }
}

module.exports = HourlyCheckIn;
