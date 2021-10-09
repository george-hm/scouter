const { SlashCommandBuilder } = require('@discordjs/builders');
const Command = require('./Command.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const Component = require('../model/discord/Component.js');
const Character = require('../model/Character.js');
const Banner = require('../model/Banner.js');
const Embed = require('../model/discord/Embed.js');

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
                `${user.getMention()} <:babysmirk:850200356495687680> you need ${Summon.summonCost} ${Character.getZOrbEmoji()} Z-Orbs to do that`,
            );
        }
        const bannerId = this.getBannerId();
        let bannerMessage = '';

        let summoner = null;
        if (bannerId) {
            const loadedBanner = await Banner.getBannerById(bannerId);
            if (!loadedBanner) {
                throw new Error(`Missing banner id: ${bannerId}`);
            }

            bannerMessage = `from banner **${loadedBanner.getBannerName()}**`;
            summoner = loadedBanner.summon;
        } else {
            summoner = Character.getRandomByRarity;
        }

        // TODO: change this and dont wait in loop
        // This is HORRIBLE and does more db calls then it should but hey its easy
        const allSummons = [];
        let roll;
        for (let i = 0; i < this.getSummonCount(); i++) {
            roll = Character.getRandomRarity();
            const summonedCharacter = await summoner(roll);
            allSummons.push(summonedCharacter);
            await summonedCharacter.addToPlayer(user.getUserId());
            user.addRarityToInventory(roll);
            user.currency -= Summon.summonCost;
        }

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

        let embedToReturn = new Embed(
            `${user.getMention()} rolled ${this.getSummonCount()} characters ${bannerMessage}`,
            allSummons.map(character => character.stringSummary),
        );
        if (!allSummons.length) {
            throw new Error('No summons');
        }
        if (allSummons.length === 1) {
            embedToReturn = allSummons[0].toEmbed();
        }
        return new InteractionResponse(
            `${user.getMention()} you rolled: ${Character.convertRarityToEmoji(roll)} ${bannerMessage}`,
            [embedToReturn],
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

    getSummonCount() {
        const customId = this._customId;
        if (!customId) {
            return 1;
        }

        const customIdParts = customId.split('.');
        const number = parseInt(customIdParts[2]) || null;
        if (number > 10) {
            return 10;
        }

        if (number < 1) {
            return 1;
        }
    }

    createCustomId(bannerId, count) {
        return Summon.createCustomId(bannerId, this.getUser().getUserId(), count);
    }

    static createCustomId(bannerId, userId, count) {
        if (!userId) {
            throw new Error('Missing user id');
        }
        return `${this.commandName}.${bannerId || customIdEmpty}.${count || customIdEmpty}.${userId}`;
    }

    static toJSON() {
        return new SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription('Summon a new character')
            .addNumberOption(option => option.setName('Count')
                .setDescription('The number of summons to do (max 10)')
                .setRequired(false))
            .toJSON();
    }

    static get commandName() {
        return 'summon';
    }
}
module.exports = Summon;
