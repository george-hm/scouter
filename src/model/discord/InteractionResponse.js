const Embed = require('./Embed.js');
const Component = require('./Component.js');

// https://discord.com/developers/docs/interactions/slash-commands#interaction-response-object-interaction-response-structure
// this is what our body will be when we reply
class Response {
    constructor(type, messageContent, embeds, components, ephemeral) {
        this._type = type;
        this._messageContent = messageContent || '';
        if (embeds && Array.isArray(embeds)) {
            this._embeds = embeds.filter(currentEmbed => currentEmbed instanceof Embed);
            this._embeds = embeds.map(embed => embed.toEmbedObject());
        }
        if (components && Array.isArray(components)) {
            this._components = components.filter(currentComponent => currentComponent instanceof Component);
        } else if (components && components instanceof Component) {
            this._components = [components.toComponentObject()];
        }

        this._ephemeral = ephemeral;
    }

    toObject() {
        const data = {
            content: this._messageContent,
            embeds: this._embeds,
            components: this._components,
            ephemeral: !!this._ephemeral,
        };

        // remove all falsey/optional data
        for (const key in data) {
            if (!Object.hasOwnProperty.call(data, key)) {
                continue;
            }
            const value = data[key];
            if (!value) {
                delete data[key];
            }
        }

        return data;
    }
}

Response.PONG = 1; // ACK a Ping
Response.RESPOND = 4; // respond to an interaction with a message
Response.RESPOND_LATER_LOADING = 5; // ACK an interaction and edit a response later, the user sees a loading state
Response.RESPOND_LATER_NO_LOADING = 6; // for components, ACK an interaction and edit the original message later; the user does not see a loading state
Response.UPDATE_MESSAGE = 7;// for components, edit the message the component was attached to

module.exports = Response;
