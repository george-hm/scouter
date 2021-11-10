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
const optionTradingId = 'tradingid';

class Trading extends Command {
    async main() {
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

        const actionFromButton = this.getActionFromButton();

        if (actionFromButton === customIdAccept) {
            return this.acceptAction();
        }

        if (actionFromButton === customIdDecline) {
            return this.declineAction();
        }

        const userToTradewith = this.getUserFromOption();
        if (!userToTradewith) {
            console.log(this._options);
            throw new Error('No user to trade with');
        }

        console.log(userToTradewith);
        if (userToTradewith.bot || userToTradewith.getUserId() === user.getUserId()) {
            return new InteractionResponse(
                'Invalid user to trade with!',
                null,
                null,
                true,
            );
        }

        await user.loadCharacterInventory();

        const characterToTradeWith = user.getCharacterFromInventoryById(this.getCharacterId());
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
        tradeMappings[trade.id] = trade;

        await trade.addCharacterToTrade(user.getUserId(), this.getCharacterId());

        return this.createTradeResponse(trade);
    }

    async acceptAction() {
        const user = this.getUser();
        const tradeId = this.getTradeIdFromButton();

        console.log('tradeid', tradeId);
        console.log(tradeMappings);
        const trade = tradeMappings[tradeId];
        if (!trade || !(trade instanceof Trade)) {
            return new InteractionResponse(
                'Could not find this trade, sorry!',
                null,
                null,
                true,
            );
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
            return this.createTradeResponse(
                trade,
                true,
            );
        }

        await trade.commitTrade();
        // return trade success response
    }

    async declineAction() {
        // get trade
        // validate user is in trade
        // set active to false
        // end trade (and remove trade from allTrades)
        const user = this.getUser();
        const tradeId = this.getTradeIdFromButton();

        console.log('declineid', tradeId);
        console.log(tradeMappings);
        const trade = tradeMappings[tradeId];
        if (!trade || !(trade instanceof Trade)) {
            return new InteractionResponse(
                'Could not find this trade, sorry!',
                null,
                null,
                true,
            );
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

        trade.active = false;
        delete tradeMappings[trade.id];

        // say user has declined the trade etc...
        return new InteractionResponse(
            `You have declined trade \`${tradeId}\`!`,
            null,
            null,
            true,
        );
    }


    async getOpenTrade() {
        const tradeId = this.getTradeIdFromOptionOrButton();
        if (!tradeId) {
            return new InteractionResponse(
                'No trade id provided!',
                null,
                null,
                true,
            );
        }

        const trade = tradeMappings[tradeId];
        if (!trade || !(trade instanceof Trade)) {
            return new InteractionResponse(
                'Could not find this trade, create a new one with the \'Open\' action',
                null,
                null,
                true,
            );
        }

        const user = this.getUser();
        if (!trade.findUser(user.getUserId())) {
            return new InteractionResponse(
                'You are not a participant in this trade!',
                null,
                null,
                true,
            );
        }

        return trade;
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
        if (!id) {
            throw new Error('Missing trade id');
        }

        return id;
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
                .addChoice(
                    'Add',
                    optionActionChoiceAdd,
                ).addChoice(
                    'Remove',
                    optionActionChoiceRemove,
                ).addChoice(
                    'Open trade',
                    optionActionChoiceOpen,
                ))
            .setRequired(true)
            .addStringOption(option => option.setName(optionCharacterId)
                .setDescription('The character used for this action')
                .setRequired(true))
            .addUserOption(option => option.setName(optionUser)
                .setDescription('The player you wish to trade with (Open trade action only)')
                .setRequired(false))
            .addStringOption(option => option.setName(optionTradeId)
                .setDescription('An ID from a trade (Add/Remove only)')
                .setRequired(false))
            .toJSON();
    }
}
module.exports = Trading;
