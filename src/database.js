const knex = require('knex');

class Database {
    static async _createConnection() {
        this._connection = knex({
            client: 'mysql',
            connection: {
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE,
            },
        });

        return this._connection;
    }

    static async get() {
        return this._connection || this._createConnection();
    }

    static async close() {
        if (this._connection) {
            return;
        }

        this._connection.destroy();
    }
}

module.exports = Database;
