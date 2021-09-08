const { SlashCommandBuilder } = require('@discordjs/builders');
const Command = require('./Command.js');
const Character = require('../model/Character.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');

class Currency extends Command {
    async main() {
        const user = this.getUser();
        await user.loadPlayerInfo();

        console.log(user);
        const currency = user.currency;
        let inventoryString = '';
        for (const rarity in user.inventory) {
            if (!Object.hasOwnProperty.call(user.inventory, rarity)) {
                continue;
            }
            const amount = user.inventory[rarity];
            inventoryString += `\n${Character.convertRarityToString(rarity)}: ${amount}`;
        }

        return new InteractionResponse(
            InteractionResponse.RESPOND,
            `Currency: ${currency}\n\nInventory: ${inventoryString || 'None'}`,
        );
    }

    static get commandName() {
        return 'currency';
    }

    static toJSON() {
        return new SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription('See your total currency and character rarities')
            .toJSON();
    }
}

module.exports = Currency;
