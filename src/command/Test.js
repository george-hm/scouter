const Command = require('./Command.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const Component = require('../model/discord/Component.js');
const Character = require('../model/Character.js');
const Embed = require('../model/discord/Embed.js');

class Test extends Command {
    async main() {
        const message = 'Test message';
        const character = Character.getById(1011500);
        const embed = (await character).toEmbed();
        const component = new Component(
            Component.TYPE_CONTAINER,
        );
        component.setComponents([
            new Component(
                Component.TYPE_BUTTON,
                Component.STYLE_DANGER,
                'Button',
                null,
                this.createCustomId('TestOptionOne'),
            ),
        ]);
        const response = new InteractionResponse(
            InteractionResponse.RESPOND,
            message,
            [embed],
            component,
        );

        return response;
    }
}

module.exports = Test;
