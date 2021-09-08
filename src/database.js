const Knex = require('knex');

class Database {
    /**
     *
     *
     * @static
     * @returns {Knex.knex}
     * @memberof Database
     */
    static get() {
        if (this._connection) {
            return this._connection;
        }

        this._connection = Knex({
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

    static async close() {
        if (!this._connection) {
            return;
        }

        await this._connection.destroy();
    }
}

module.exports = Database;
