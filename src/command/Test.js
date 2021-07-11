const Command = require('./Command.js');
const InteractionResponse = require('../model/InteractionResponse.js');
const Component = require('../model/Component.js');

class Test extends Command {
    async main() {
        const message = 'Test message';
        const component = new Component(
            Component.TYPE_CONTAINER,
        );
        component.setComponents([
            new Component(
                Component.TYPE_BUTTON,
                Component.STYLE_DANGER,
                'Danger button',
                null,
                'custom_test_id',
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
            ),
        ]);
        const response = new InteractionResponse(
            InteractionResponse.RESPOND,
            message,
            null,
            component,
        );

        return response;
    }
}

module.exports = Test;
