const Command = require('./Command.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const Component = require('../model/discord/Component.js');
const Character = require('../model/Character.js');
const Embed = require('../model/discord/Embed.js');

class Test extends Command {
    async main() {
        const user = this.getUser();
        await user.loadPlayerInfo();
        const message = `\`\`\`json\n${JSON.stringify(user, null, 4)}\`\`\``;
        const response = new InteractionResponse(
            InteractionResponse.RESPOND,
            message,
        );

        return response;
    }
}

module.exports = Test;
