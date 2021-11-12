const { Client, Interaction, Message } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Command = require('./Command.js');
const User = require('../model/User.js');
const InteractionResponse = require('../model/discord/InteractionResponse.js');
const Trade = require('../model/Trade.js');
const Component = require('../model/discord/Component.js');

const tradeMappings = [];

const customIdEmpty = 'empty';
const customIdAccept = 'accept';
const customIdDecline = 'decline';
const optionUser = 'player';
const optionCharacterId = 'characterid';
const optionTradeId = 'id';
const optionAction = 'action';
const optionActionChoiceAdd = 'actionadd';
const optionActionChoiceRemove = 'actionremove';
const optionActionChoiceOpen = 'actionopen';

class Trading extends Command {
    async main(client, interaction) {
        if (client instanceof Client) {
            this.client = client;
        }

        if (interaction instanceof Interaction) {
            this.interaction = interaction;
        }
        const user = this.getUser();
        if (user.getUserId() !== '129416238916042752') {
            return new InteractionResponse(
                'Please try again later',
                null,
                null,
                true,
            );
        }
        await user.loadPlayerInfo();
        if (!this.getOpenTrade()) {
            return await this.openTrade();
        }

        const action = this.getAction();

        switch (action) {
            case customIdAccept:
                return await this.acceptAction();
            case customIdDecline:
                return await this.declineAction();
            case optionActionChoiceAdd:
                return await this.addCharacterToTrade();
            case optionActionChoiceRemove:
                return await this.removeCharacterFromTrade();
            default:
                throw new Error('Invalid or missing action');
        }
    }

    async openTrade() {
        const user = this.getUser();
        const userToTradewith = this.getUserFromOption();
        if (!userToTradewith) {
            return new InteractionResponse(
                'No user provided, use the \'User\' option',
                null,
                null,
                true,
            );
        }

        if (userToTradewith.bot || userToTradewith.getUserId() === user.getUserId()) {
            return new InteractionResponse(
                'Invalid user to trade with!',
                null,
                null,
                true,
            );
        }

        const characterToTradeWith = await this.getTradingCharacter();
        if (!characterToTradeWith) {
            return new InteractionResponse(
                'You do not own any characters with this id!',
                null,
                null,
                true,
            );
        }

        // TODO: do we need to validate the user is in the same channel?
        // I don't think so as the option is a user mention

        // open trade, return model
        const trade = new Trade([user, userToTradewith]);
        tradeMappings.push(trade);

        await trade.addCharacterToTrade(user.getUserId(), this.getCharacterId());

        const tradeMessageSent = await this.interaction.reply(
            this.createTradeResponse(trade).toObject(),
        );
        if (!(tradeMessageSent instanceof Message)) {
            throw new Error('Failed to send trade message');
        }

        trade.tradeMessage = tradeMessageSent;

        // TODO interaction responses are getting a bit large... maybe we should use offical discord responses?
        return new InteractionResponse(
            `Successfully opened tade \`${trade.id}\``,
            null,
            null,
            true,
            false,
            false,
            true,
        );
    }

    async acceptAction() {
        const user = this.getUser();

        const trade = await this.getOpenTrade();
        // invalid trade, just the error response
        if (trade instanceof InteractionResponse) {
            return trade;
        }

        if (trade.tradeCommitted || !trade.active) {
            return new InteractionResponse(
                'This trade is no longer active',
                null,
                null,
                true,
            );
        }

        const tradeUser = trade.findUser(user.getUserId());
        if (!tradeUser) {
            return new InteractionResponse(
                'You are not a participant in this trade!',
                null,
                null,
                true,
            );
        }

        tradeUser.accepted = true;

        if (!trade.allUsersAccepted()) {
            const { tradeMessage } = trade;
            await tradeMessage.edit(
                this.createTradeResponse(trade).toObject(),
            );

            return new InteractionResponse(
                'Waiting for other users to accept trade',
                null,
                null,
                true,
            );
        }

        await trade.commitTrade();
        return new InteractionResponse(
            `You have accepted trade \`${trade.id}\`!`,
            null,
            null,
            true,
        );
    }

    async declineAction() {
        const trade = await this.getOpenTrade();
        // invalid trade so return the error response
        if (trade instanceof InteractionResponse) {
            return trade;
        }

        const tradeId = trade.id;

        trade.active = false;
        tradeMappings.splice(
            tradeMappings.findIndex(t => t.id === tradeId),
            1,
        );

        // say user has declined the trade etc...
        return new InteractionResponse(
            `You have declined trade \`${tradeId}\`!`,
            null,
            null,
            true,
        );
    }

    async addCharacterToTrade() {
        const trade = await this.getOpenTrade();
        if (trade instanceof InteractionResponse) {
            return trade;
        }

        await trade.addCharacterToTrade(
            this.getUser().getUserId(),
            this.getCharacterId(),
        );

        const { tradeMessage } = trade;
        await tradeMessage.edit(
            this.createTradeResponse(trade).toObject(),
        );

        return new InteractionResponse(
            `Added character \`${this.getCharacterId()}\` to trade \`${trade.id}\``,
            null,
            null,
            true,
        );
    }

    async removeCharacterFromTrade() {
        const trade = await this.getOpenTrade();
        if (trade instanceof InteractionResponse) {
            return trade;
        }

        trade.removeCharacterFromTrade(
            this.getUser().getUserId(),
            this.getCharacterId(),
        );

        const { tradeMessage } = trade;
        await tradeMessage.edit(
            this.createTradeResponse(trade).toObject(),
        );

        return new InteractionResponse(
            `Removed character \`${this.getCharacterId()}\` from trade \`${trade.id}\``,
            null,
            null,
            true,
        );
    }

    getOpenTrade() {
        const userTradingWith = this.getUserFromOption();
        const trade = tradeMappings.find(
            t => t.findUser(userTradingWith.getUserId()) &&
                t.findUser(this.getUser().getUserId()),
        );

        return trade || null;
    }

    async getTradingCharacter() {
        const user = this.getUser();
        const characterId = this.getCharacterId();
        if (!characterId) {
            throw new Error('No character id provided');
        }

        await user.loadCharacterInventory();
        const character = user.getCharacterFromInventoryById(characterId);
        if (!character) {
            return null;
        }

        return character;
    }

    createTradeResponse(trade, update) {
        if (!(trade instanceof Trade)) {
            throw new Error('Missing or invalid trade');
        }

        const tradeId = trade.id;
        const container = new Component(
            Component.TYPE_CONTAINER,
        ).setComponents([
            new Component(
                Component.TYPE_BUTTON,
                Component.STYLE_PRIMARY,
                'Accept',
                null,
                this.createCustomId(tradeId, customIdAccept),
            ),
            new Component(
                Component.TYPE_BUTTON,
                Component.STYLE_DANGER,
                'Decline',
                null,
                this.createCustomId(tradeId, customIdDecline),
            ),
        ]);

        return new InteractionResponse(
            null,
            [trade.toEmbed()],
            container,
            null,
            !!update,
            true,
        );
    }

    getAction() {
        const action = this._customId?.split('.').pop() || this._options?.getString(optionAction);
        if (!action || action === customIdEmpty) {
            return null;
        }

        return action;
    }

    getTradeIdFromOptionOrButton() {
        const id = this._customId?.split('.')[2] || this._options?.getString(optionTradeId);

        return id || null;
    }

    createCustomId(tradeId, action) {
        const parts = [
            this.commandName,
            this.getUser().getUserId(),
            tradeId,
            action,
        ];
        return parts.join('.');
    }

    getCharacterId() {
        const hexId = this._options?.getString(optionCharacterId);
        const numId = parseInt(hexId, 16);
        if (!numId || Number.isNaN(numId)) {
            throw new Error(`Invalid character id: ${hexId}`);
        }

        return numId;
    }

    getUserFromOption() {
        const discordUser = this._options?.getUser(optionUser);
        if (!discordUser) {
            return null;
        }

        return new User(discordUser);
    }

    static get commandName() {
        return 'trade';
    }

    static toJSON() {
        return new SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription('Trade characters with another player')
            .addStringOption(option => option.setName(optionAction)
                .setDescription('Action to perform on the trade')
                .addChoice(
                    'Add character to trade',
                    optionActionChoiceAdd,
                )
                .addChoice(
                    'Remove character from trade',
                    optionActionChoiceRemove,
                )
                .setRequired(true))
            .addStringOption(option => option.setName(optionCharacterId)
                .setDescription('The character used for this action')
                .setRequired(true))
            .addUserOption(option => option.setName(optionUser)
                .setDescription('The player you wish to trade with')
                .setRequired(true))
            .toJSON();
    }
}
module.exports = Trading;
