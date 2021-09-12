const axios = require('axios');
const Embed = require('./Embed.js');
const Component = require('./Component.js');

// https://discord.com/developers/docs/interactions/slash-commands#interaction-response-object-interaction-response-structure
// this is what our body will be when we reply
class Response {
    constructor(messageContent, embeds, components, ephemeral, editMessage) {
        this._messageContent = messageContent || '';
        if (embeds && Array.isArray(embeds)) {
            this._embeds = embeds.filter(currentEmbed => currentEmbed instanceof Embed);
            this._embeds = embeds.map(embed => embed.toEmbedObject());
        } else if (embeds && embeds instanceof Embed) {
            this._embeds = [embeds.toEmbedObject()];
        }
        if (components && Array.isArray(components)) {
            this._components = components.filter(currentComponent => currentComponent instanceof Component);
            this._components = this._components.map(component => component.toComponentObject());
        } else if (components && components instanceof Component) {
            this._components = [components.toComponentObject()];
        }

        this._ephemeral = ephemeral;
        this._deleteOriginal = editMessage;
    }

    shouldEditMessage() {
        return this._deleteOriginal;
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

    async sendCallbackRequest(url) {
        await axios({
            url,
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            data: this.toObject().data,
        });
    }
}

module.exports = Response;
