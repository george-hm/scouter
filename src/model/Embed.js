// https://discord.com/developers/docs/resources/channel#embed-object
class Embed {
    constructor(
        title,
        description,
        color,
        imageURL,
        thumbnailURL,
        fields,
    ) {
        this._color = color;
        this._description = description;
        this._fields = fields;
        if (imageURL) {
            this._image = {
                url: imageURL,
            };
        }
        if (thumbnailURL) {
            this._thumbnail = thumbnailURL;
        }
        this._title = title;
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
            color: this._color,
            description: this._description,
            fields: this._fields,
            footer: this._generateFooter(),
            image: this._image,
            thumbnail: this._thumbnail,
            timestamp: new Date(),
            title: this._title,
            type: 'rich',
        };

        for (const key in obj) {
            if (!Object.hasOwnProperty.call(obj, key)) {
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
