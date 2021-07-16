const Command = require('./Command.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');

class TestOptionOne extends Command {
    async main() {
        if (!this.validateCustomIdBelongsToUser()) {
            const response = new InteractionResponse(
                InteractionResponse.RESPOND,
                `${this.getUser().getMention()} ${Math.random()}`,
            );
            return response;
        }
        const message = `${this.getUser().getMention()} response to ${this.getCommandName()}`;

        const response = new InteractionResponse(
            InteractionResponse.RESPOND,
            message,
            null,
            null,
            true,
        );

        return response;
    }
}

module.exports = TestOptionOne;
