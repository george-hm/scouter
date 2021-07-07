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

Response.PONG = 1; // ACK a Ping
Response.RESPOND = 4; // respond to an interaction with a message
Response.RESPOND_LATER_LOADING = 5; // ACK an interaction and edit a response later, the user sees a loading state
Response.RESPOND_LATER_NO_LOADING = 6; // for components, ACK an interaction and edit the original message later; the user does not see a loading state
Response.UPDATE_MESSAGE = 7;// for components, edit the message the component was attached to

module.exports = Response;
