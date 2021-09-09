const { SlashCommandBuilder } = require('@discordjs/builders');
const Command = require('./Command.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');

class Test extends Command {
    async main() {
        const user = this.getUser();
        if (user.getUserId() !== '129416238916042752') {
            return new InteractionResponse(
                'Not for the public!',
                null,
                null,
                true,
            );
        }
        await user.loadPlayerInfo();
        const message = `\`\`\`json\n${JSON.stringify(user, null, 4)}\`\`\``;
        const response = new InteractionResponse(
            message,
        );

        return response;
    }

    static toJSON() {
        return new SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription('Test command')
            .toJSON();
    }

    static get commandName() {
        return 'testing';
    }
}

module.exports = Test;
