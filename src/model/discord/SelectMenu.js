const Component = require('./Component.js');
const SelectMenuOption = require('./SelectMenuOption.js');

const keyPlaceholder = 'placeholder';
const keyOptions = 'options';
const keyCustomId = 'customId';
class SelectMenu extends Component {
    constructor(customId, placeholder, options) {
        super(Component.TYPE_SELECT_MENU);
        this[keyPlaceholder] = placeholder;
        this[keyOptions] = [];
        this[keyCustomId] = customId;
        if (options) {
            this.setOptions(options);
        }
    }

    setOptions(options) {
        for (let i = 0; i < options.length; i++) {
            const currentOption = options[i];
            if (!(currentOption instanceof SelectMenuOption)) {
                throw new Error('Option is not instance of SelectMenuOption');
            }

            this[keyOptions].push(currentOption.toJSON());
        }
    }

    toComponentObject() {
        return {
            // dont care about custom id but it must be unique
            custom_id: this[keyCustomId],
            type: this._type,
            options: this[keyOptions],
            placeholder: this[keyPlaceholder],
        };
    }
}

module.exports = SelectMenu;
