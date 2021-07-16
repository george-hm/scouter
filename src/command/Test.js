const Command = require('./Command.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const Component = require('../model/discord/Component.js');
const Embed = require('../model/discord/Embed.js');

class Test extends Command {
    async main() {
        const message = 'Test message';
        const embed = new Embed(
            'Embed title',
            'bit o desc',
            '#00FF00',
            'https://www.arranwhisky.com/assets/000/000/258/seal-1235138_1920_original.jpg?1498647292',
            'https://i.imgur.com/EbtEnxz.png',
        );
        const component = new Component(
            Component.TYPE_CONTAINER,
        );
        component.setComponents([
            new Component(
                Component.TYPE_BUTTON,
                Component.STYLE_DANGER,
                'Danger button',
                null,
                this.createCustomId('TestOptionOne'),
            ),
            new Component(
                Component.TYPE_BUTTON,
                Component.STYLE_LINK,
                'yo its a link!',
                null,
                null,
                'https://www.google.com',
            ),
            new Component(
                Component.TYPE_BUTTON,
                Component.STYLE_SECONDARY,
                'cant click this lol',
                null,
                'custom_test_disabled',
                null,
                true,
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
