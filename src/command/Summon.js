const Command = require('./Command.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const Component = require('../model/discord/Component.js');
const Character = require('../model/Character.js');

class Summon extends Command {
    async main() {
        const user = this.getUser();
        if (user.getUserId() !== '129416238916042752') {
            return new InteractionResponse(
                InteractionResponse.RESPOND,
                'Sorry, come back later.',
            );
        }
        const component = new Component(
            Component.TYPE_CONTAINER,
        );
        component.setComponents([
            new Component(
                Component.TYPE_BUTTON,
                Component.STYLE_PRIMARY,
                'Summon again',
                null,
                this.createCustomId('summon'),
            ),
        ]);
        const roll = Character.getRandomRarity();
        console.log(roll);
        return new InteractionResponse(
            InteractionResponse.RESPOND,
            `You rolled: ${Character.convertRarityToString(roll)}`,
            null,
            component,
        );
    }
}

module.exports = Summon;
