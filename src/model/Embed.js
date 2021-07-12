// https://discord.com/developers/docs/resources/channel#embed-object
class Embed {
    constructor(
        title,
        description,
        colour,
        image,
        thumbnail,
        provider,
        fields,
    ) {
        this._title = title;
        this._description = description;
        this._color = colour;
        this._image = image;
        this._thumbnail = thumbnail;
        this._provider = provider;
        this._fields = fields;
    }

    static createField(title, message) {
        return {
            name: title,
            value: message,
        };
    }

    _generateFooter() {
        return {
            text: 'Scouter by Imp#8373',
            icon_url: 'https://upload.wikimedia.org/wikipedia/commons/9/94/Dragonball_%284-Star%29.svg',
        };
    }

    toEmbedObject() {
        const obj = {
            title: this._title,
            type: 'rich',
            description: this._description,
            footer: this._generateFooter(),
            timestamp: new Date(),
        };

        for (const key in obj) {
            if (Object.hasOwnProperty.call(obj, key)) {
                continue;
            }
            const value = obj[key];
            if (!value) {
                delete obj[key];
            }
        }

        return obj;
    }
}

module.exports = Embed;
