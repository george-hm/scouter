const Embed = require('./Embed.js');
const Component = require('./Component.js');

class Response {
    constructor(type, messageContent, embeds, components) {
        this._type = type;
        this._messageContent = messageContent || '';
        if (embeds && Array.isArray(embeds)) {
            this._embeds = embeds.filter(currentEmbed => currentEmbed instanceof Embed);
        }
        if (components && Array.isArray(components)) {
            this._components = components.filter(currentComponent => currentComponent instanceof Component);
        }
    }

    toObject() {
        const objData = {
            content: this._messageContent,
            embeds: this._embeds,
            components: this._components,
        };

        // remove all falsey/optional data
        for (const key in objData) {
            if (!Object.hasOwnProperty.call(objData, key)) {
                continue;
            }
            const value = objData[key];
            if (!value) {
                delete objData[key];
            }
        }

        return {
            type: this._type,
            data: objData,
        };
    }
}

module.exports = Response;
