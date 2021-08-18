const Command = require('./Command.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const Component = require('../model/discord/Component.js');
const time = require('../time.js');

class HourlyCheckIn extends Command {
    async main() {
        const user = this.getUser();
        await user.loadPlayerInfo();

        if (!time.eligableForHourly()) {
            const timeUntilHourly = time.timeUntilHourly(user.lastDailyCheckIn);
            return new InteractionResponse(
                InteractionResponse.RESPOND,
                `Sorry, come back in ${timeUntilHourly} for your hourly check-in`,
            );
        }
        return new InteractionResponse(
            InteractionResponse.RESPOND,
            'Not implemented',
        );
    }
}

module.exports = HourlyCheckIn;
