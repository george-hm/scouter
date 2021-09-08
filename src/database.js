const Knex = require('knex');
const MYSQL = require('mysql');

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
            return this._knex;
        }

        this._knex = Knex({
            client: 'mysql',
            connection: {
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE,
            },
        });

        return this._knex;
    }

    static async close() {
        if (!this._connection) {
            return;
        }

        await this._connection.end();
    }
}

module.exports = Database;
