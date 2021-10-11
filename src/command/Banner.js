const { SlashCommandBuilder } = require('@discordjs/builders');
const Component = require('../model/discord/Component.js');
const Command = require('./Command.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const SelectMenuOption = require('../model/discord/SelectMenuOption.js');
const BannerModel = require('../model/Banner.js');
const SelectMenu = require('../model/discord/SelectMenu.js');
const Embed = require('../model/discord/Embed.js');
const Summon = require('./Summon.js');

class BannerCommand extends Command {
    async main() {
        const allBanners = await BannerModel.getBanners();
        if (!allBanners) {
            return new InteractionResponse(
                'Sorry, no available banners at this time.',
            );
        }

        const optionsForSelect = [];
        for (let i = 0; i < allBanners.length; i++) {
            const currentBanner = allBanners[i];
            optionsForSelect.push(
                new SelectMenuOption(
                    `${currentBanner.getBannerName()}`,
                    `${currentBanner.getBannerRarityAsString()} - ${currentBanner.getBannerDesc()}`,
                    currentBanner.getBannerId(),
                ),
            );
        }

        let bannerCharacter = null;
        let chosenBanner = null;
        if (this.getBannerId()) {
            chosenBanner = allBanners.find(banner => banner.getBannerId() === this.getBannerId());
            if (chosenBanner) {
                bannerCharacter = await chosenBanner.getCharacterFromBanner();
            }
        }

        const selectMenu = new SelectMenu(
            this.createCustomId(Math.random()),
            bannerCharacter ? bannerCharacter.getFirstName() : 'Choose a banner',
            optionsForSelect,
        );

        const allComponents = [];
        const container = new Component(
            Component.TYPE_CONTAINER,
        );
        container.setComponents([selectMenu]);
        allComponents.push(container);

        let embed = null;
        if (bannerCharacter) {
            embed = new Embed(
                'Banner Information',
                `Character: **${bannerCharacter.getFirstName()}**\nType: ${bannerCharacter.getTypeAsEmoji()}\nRarity: ${bannerCharacter.getRarityAsEmoji()}\n\nClick the button below to summon from this banner!\n**Expires in:** ${chosenBanner.getTimeUntilExpires()}`,
                null,
                bannerCharacter.getCharacterURL(),
            );

            const buttonContainer = new Component(
                Component.TYPE_CONTAINER,
            );
            buttonContainer.setComponents([
                new Component(
                    Component.TYPE_BUTTON,
                    Component.STYLE_PRIMARY,
                    'Summon',
                    null,
                    Summon.createCustomId(
                        this.getBannerId(),
                        this.getUser().getUserId(),
                    ),
                ),
                new Component(
                    Component.TYPE_BUTTON,
                    Component.STYLE_PRIMARY,
                    'Summon 10',
                    null,
                    Summon.createCustomId(
                        this.getBannerId(),
                        this.getUser().getUserId(),
                        10,
                    ),
                ),
            ]);
            allComponents.push(buttonContainer);
        } else {
            embed = new Embed(
                'Banner information',
                'Use the select menu below to view and summon from specific banners',
            );
        }
        return new InteractionResponse(
            null,
            embed,
            allComponents,
            null,
            !!bannerCharacter,
        );
    }

    getBannerId() {
        return parseInt(this._values?.[0]) || null;
    }

    static get commandName() {
        return 'banner';
    }

    static toJSON() {
        return new SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription('Check current banners and summon from them')
            .toJSON();
    }
}

module.exports = BannerCommand;
