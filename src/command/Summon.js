const { SlashCommandBuilder } = require('@discordjs/builders');
const Command = require('./Command.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const Component = require('../model/discord/Component.js');
const Character = require('../model/Character.js');
const Banner = require('../model/Banner.js');
const Embed = require('../model/discord/Embed.js');

const customIdEmpty = 'empty';
const optionCount = 'count';

class Summon extends Command {
    static get summonCost() {
        return 5;
    }

    async main() {
        // return;
        const user = this.getUser();
        await user.loadPlayerInfo();
        if (user.currency < Summon.summonCost) {
            return new InteractionResponse(
                `${user.getMention()} <:babysmirk:850200356495687680> you need ${Summon.summonCost} ${Character.getZOrbEmoji()} Z-Orbs to do that`,
            );
        }
        const bannerId = this.getBannerId();
        let bannerMessage = '';

        let summonClass = null;
        if (bannerId) {
            const loadedBanner = await Banner.getBannerById(bannerId);
            if (!loadedBanner) {
                throw new Error(`Missing banner id: ${bannerId}`);
            }

            bannerMessage = `from banner **${loadedBanner.getBannerName()}**`;
            console.log(loadedBanner);
            summonClass = loadedBanner;
        } else {
            summonClass = Character;
        }

        // TODO: change this and dont wait in loop
        // This is HORRIBLE and does more db calls then it should but hey its easy
        const allSummons = [];
        let roll;
        for (let i = 0; i < this.getSummonCount(); i++) {
            if (user.currency < Summon.summonCost) {
                break;
            }
            roll = Character.getRandomRarity();
            let summonedCharacter;
            if (bannerMessage) {
                summonedCharacter = await summonClass.summon(roll);
            } else {
                summonedCharacter = summonClass.getRandomByRarity(roll);
            }
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
            `Summoned ${this.getSummonCount()} characters`,
            allSummons.map(character => character.stringSummary).join('\n'),
        );
        if (!allSummons.length) {
            throw new Error('No summons');
        }
        if (allSummons.length === 1) {
            embedToReturn = allSummons[0].toEmbed();
        }

        let messageContent = `${user.getMention()} you rolled`;
        if (allSummons.length > 1) {
            messageContent += ` ${allSummons.length} characters ${bannerMessage}`;
        } else {
            messageContent += `: ${Character.convertRarityToEmoji(roll)} ${bannerMessage}`;
        }
        return new InteractionResponse(
            messageContent,
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
        let number = 1;
        const customId = this._customId;
        if (customId) {
            const customIdParts = customId.split('.');
            number = parseInt(customIdParts[2]) || null;
        }

        if (!number || number === 1) {
            number = parseInt(this._options?.getNumber(optionCount));
        }

        if (number > 10) {
            return 10;
        }

        if (!number || number < 1) {
            return 1;
        }

        return number;
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
            .addNumberOption(option => option.setName(optionCount)
                .setDescription('The number of summons to do (max 10)')
                .setRequired(false))
            .toJSON();
    }

    static get commandName() {
        return 'summon';
    }
}
module.exports = Summon;
