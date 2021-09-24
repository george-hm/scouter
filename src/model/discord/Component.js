// https://discord.com/developers/docs/interactions/message-components
class Component {
    constructor(
        type,
        style,
        label,
        emoji,
        custom_id,
        url,
        disabled,
        components,
    ) {
        if (!type) {
            throw new Error('Missing type');
        }

        if (
            type !== Component.TYPE_CONTAINER &&
            type !== Component.TYPE_BUTTON &&
            type !== Component.TYPE_SELECT_MENU
        ) {
            throw new Error('Invalid type');
        }
        this._type = type;
        if (this._type !== Component.TYPE_BUTTON) {
            return;
        }

        this._style = style;
        if (
            this._style !== Component.STYLE_PRIMARY &&
            this._style !== Component.STYLE_SECONDARY &&
            this._style !== Component.STYLE_SUCCESS &&
            this._style !== Component.STYLE_DANGER &&
            this._style !== Component.STYLE_LINK
        ) {
            throw new Error('Invalid button style');
        }
        this._label = label;
        this._emoji = emoji;
        this._customId = custom_id;
        this._url = url;
        if (this._style === Component.STYLE_LINK && !this._url) {
            throw new Error('Button link needs url');
        }

        if (this._style !== Component.STYLE_LINK && !this._customId) {
            throw new Error(`Style ${this._style} needs a custom id`);
        }
        this._disabled = !!disabled;
        if (components && Array.isArray(components)) {
            this._components = components.map(comp => comp.toComponentObject());
        }
    }

    setComponents(components) {
        this._components = this._components || [];
        const componentsConverted = Array.isArray(components) ? components : [components];
        for (let i = 0; i < componentsConverted.length; i++) {
            const comp = componentsConverted[i];
            if (!(comp instanceof Component)) {
                throw new Error('Component is not instance of component');
            }
            this._components.push(comp.toComponentObject());
        }
    }

    toComponentObject() {
        const obj = {
            type: this._type,
            style: this._style,
            label: this._label,
            emoji: this._emoji,
            custom_id: this._customId,
            url: this._url,
            disabled: this._disabled,
            components: this._components,
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

    static mapAllComponents(allComponents) {
        return {
            type: this.TYPE_CONTAINER,
            components: allComponents.map(component => component.toComponentObject()),
        };
    }
}

Component.TYPE_CONTAINER = 1;
Component.TYPE_BUTTON = 2;
Component.TYPE_SELECT_MENU = 3;
Component.STYLE_PRIMARY = 1; // blurple requires custom_id
Component.STYLE_SECONDARY = 2; // grey requires custom_id
Component.STYLE_SUCCESS = 3; // green requires custom_id
Component.STYLE_DANGER = 4; // red requires custom_id
Component.STYLE_LINK = 5; // grey navigates to a URL requires url

module.exports = Component;
