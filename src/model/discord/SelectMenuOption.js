const keyLabel = 'label';
const keyDescription = 'description';
const keyValue = 'value';
class SelectMenuOption {
    constructor (
        label,
        description,
        value,
    ) {
        this[keyLabel] = label;
        this[keyDescription] = description;
        this[keyValue] = value.toString();
    }

    getLabel () {
        return this[keyLabel];
    }

    getDescription () {
        return this[keyDescription];
    }

    getValue () {
        return this[keyValue];
    }

    toJSON () {
        return {
            [keyLabel]: this.getLabel(),
            [keyDescription]: this.getDescription(),
            [keyValue]: this.getValue(),
        };
    }
}
module.exports = SelectMenuOption;
