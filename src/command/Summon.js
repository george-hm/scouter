const { SlashCommandBuilder } = require('@discordjs/builders');
const Command = require('./Command.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const Component = require('../model/discord/Component.js');
const Character = require('../model/Character.js');

class Summon extends Command {
    static get summonCost() {
        return 5;
    }

    async main() {
        const user = this.getUser();
        await user.loadPlayerInfo();
        if (user.currency < Summon.summonCost) {
            return new InteractionResponse(
                InteractionResponse.RESPOND,
                `<:babysmirk:850200356495687680> you need ${Summon.summonCost} Z-Orbs to do that`,
            );
        }
        const roll = Character.getRandomRarity();
        const summonedCharacter = await Character.getRandomByRarity(roll);
        summonedCharacter.addToPlayer(user.getUserId());
        console.log(roll);
        user.addRarityToInventory(roll);
        user.currency -= Summon.summonCost;

        await user.save();

        const component = new Component(
            Component.TYPE_CONTAINER,
        );
        component.setComponents([
            new Component(
                Component.TYPE_BUTTON,
                Component.STYLE_PRIMARY,
                'Summon again',
                null,
                this.createCustomId(Summon.commandName),
            ),
        ]);
        return new InteractionResponse(
            InteractionResponse.RESPOND,
            `${user.getMention()} you rolled: ${Character.convertRarityToString(roll)}`,
            [summonedCharacter.toEmbed()],
            component,
        );
    }

    static toJSON() {
        return new SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription('Summon a new character')
            .toJSON();
    }

    static get commandName() {
        return 'summon';
    }
}
module.exports = Summon;
