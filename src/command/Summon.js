const { SlashCommandBuilder } = require('@discordjs/builders');
const Command = require('./Command.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const Component = require('../model/discord/Component.js');
const Character = require('../model/Character.js');
const Banner = require('../model/Banner.js');

const customIdEmpty = 'empty';

class Summon extends Command {
    static get summonCost() {
        return 5;
    }

    async main() {
        const user = this.getUser();
        await user.loadPlayerInfo();
        if (user.currency < Summon.summonCost) {
            return new InteractionResponse(
                `${user.getMention()} <:babysmirk:850200356495687680> you need ${Summon.summonCost} Z-Orbs to do that`,
            );
        }
        const roll = Character.getRandomRarity();
        const bannerId = this.getBannerId();
        let summonedCharacter = null;
        let bannerMessage = '';
        if (bannerId) {
            const loadedBanner = await Banner.getBannerById(bannerId);
            if (!loadedBanner) {
                throw new Error(`Missing banner id: ${bannerId}`);
            }

            bannerMessage = `from banner **${loadedBanner.getBannerName()}**`;
            summonedCharacter = await loadedBanner.summon(roll);
        } else {
            summonedCharacter = await Character.getRandomByRarity(roll);
        }
        summonedCharacter.addToPlayer(user.getUserId());
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
                this.createCustomId(bannerId),
            ),
        ]);
        return new InteractionResponse(
            `${user.getMention()} you rolled: ${Character.convertRarityToEmoji(roll)} ${bannerMessage}`,
            [summonedCharacter.toEmbed()],
            component,
        );
    }

    getBannerId() {
        const customId = this._customId;
        if (!customId) {
            return null;
        }

        const customIdParts = customId.split('.');
        return parseInt(customIdParts[1]) || null;
    }

    createCustomId(bannerId) {
        return Summon.createCustomId(bannerId, this.getUser().getUserId());
    }

    static createCustomId(bannerId, userId) {
        if (!userId) {
            throw new Error('Missing user id');
        }
        return `${this.commandName}.${bannerId || customIdEmpty}.${userId}`;
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
