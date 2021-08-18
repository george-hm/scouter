const Command = require('./Command.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const Component = require('../model/discord/Component.js');
const time = require('../time.js');

class HourlyCheckIn extends Command {
    async main() {
        const user = this.getUser();
        await user.loadPlayerInfo();
        const lastHourlyCheckIn = user.lastHourlyCheckIn;
        if (!time.eligableForHourly(lastHourlyCheckIn)) {
            const timeUntilHourly = time.timeUntilHourly(lastHourlyCheckIn);
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
