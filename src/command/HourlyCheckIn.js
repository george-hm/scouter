const Command = require('./Command.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const Component = require('../model/discord/Component.js');
const checkIn = require('../checkIn.js');

class HourlyCheckIn extends Command {
    async main() {
        const user = this.getUser();
        await user.loadPlayerInfo();

        if (!checkIn.eligableForHourly()) {
            const timeUntilHourly = checkIn.timeUntil(user.lastDailyCheckIn);
            const response = new InteractionResponse(
                InteractionResponse.RESPOND,
                `Sorry, come back in ${timeUntilHourly} for your hourly check-in`,
            );
        }
    }
}

module.exports = HourlyCheckIn;
