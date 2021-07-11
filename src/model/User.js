// https://discord.com/developers/docs/resources/user#user-object
class User {
    constructor(user) {
        this._id = user.id;
        this._username = user.username;
        this._discriminator = user.discriminator;
        this._avatar = user.avatar;
        this._bot = user.bot;
        this._system = user.system;
        this._locale = user.locale;
        this._verified = user.verified;
        this._email = user.email;
        this._flags = user.flags;
        this._premiumType = user.premium_type;
        this._publicFlags = user.public_flags;
    }

    getName() {
        return `${this._username}#${this._discriminator}`;
    }

    getUserId() {
        return this._id;
    }
}

module.exports = User;
