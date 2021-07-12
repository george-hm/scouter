const Command = require('./Command.js');
const InteractionResponse = require('../model/InteractionResponse.js');

class TestOptionOne extends Command {
    async main() {
        if (!this.validateCustomIdBelongsToUser()) {
            const response = new InteractionResponse(
                InteractionResponse.RESPOND,
                `${this.getUser().getMention()} sorry nope`,
            );
            return response;
        }
        const message = `${this.getUser().getMention()} response to ${this.getCommandName()}`;

        const response = new InteractionResponse(
            InteractionResponse.RESPOND,
            message,
            null,
        );

        return response;
    }
}

module.exports = TestOptionOne;
