const Knex = require('knex');
const knexServerlessMysql = require('knex-serverless-mysql');
const serverlessMYSQL = require('serverless-mysql');

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

        this._connection = serverlessMYSQL({
            config: {
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE,
            },
        });

        this._knex = Knex({
            client: knexServerlessMysql,
            mysql: this._connection,
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
